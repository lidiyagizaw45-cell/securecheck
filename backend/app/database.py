import os
import json
import uuid
from typing import Dict, Any, List, Optional
from pymongo import MongoClient
from app.config import settings

def normalize_doc(doc: Optional[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    if not doc:
        return None
    d = dict(doc)
    if "_id" in d:
        d["_id"] = str(d["_id"])
        if "id" not in d:
            d["id"] = d["_id"]
    elif "id" in d and "_id" not in d:
        d["_id"] = d["id"]
    return d

class MongoCollectionWrapper:
    def __init__(self, collection):
        self.col = collection

    def insert_one(self, document: Dict[str, Any]):
        doc = dict(document)
        if "id" in doc and "_id" not in doc:
            doc["_id"] = doc["id"]
        elif "_id" in doc and "id" not in doc:
            doc["id"] = str(doc["_id"])
        elif "id" not in doc and "_id" not in doc:
            doc_id = str(uuid.uuid4())
            doc["id"] = doc_id
            doc["_id"] = doc_id

        res = self.col.insert_one(doc)
        return type("InsertResult", (), {"inserted_id": str(res.inserted_id)})()

    def find(self, query: Optional[Dict[str, Any]] = None, sort_by: Optional[str] = None, reverse: bool = True) -> List[Dict[str, Any]]:
        q = dict(query) if query else {}
        if "id" in q and "_id" not in q:
            # Query by both string id and _id
            q = {"$or": [{"id": q["id"]}, {"_id": q["id"]}]}

        cursor = self.col.find(q)
        if sort_by:
            direction = -1 if reverse else 1
            cursor = cursor.sort(sort_by, direction)
        
        results = []
        for item in cursor:
            norm = normalize_doc(item)
            if norm:
                results.append(norm)
        return results

    def find_one(self, query: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        q = dict(query)
        if "id" in q and "_id" not in q:
            q = {"$or": [{"id": q["id"]}, {"_id": q["id"]}]}
        doc = self.col.find_one(q)
        return normalize_doc(doc)

    def update_one(self, query: Dict[str, Any], update: Dict[str, Any]):
        q = dict(query)
        if "id" in q and "_id" not in q:
            q = {"$or": [{"id": q["id"]}, {"_id": q["id"]}]}
        res = self.col.update_one(q, update)
        return type("UpdateResult", (), {"modified_count": res.modified_count})()

    def delete_one(self, query: Dict[str, Any]):
        q = dict(query)
        if "id" in q and "_id" not in q:
            q = {"$or": [{"id": q["id"]}, {"_id": q["id"]}]}
        res = self.col.delete_one(q)
        return type("DeleteResult", (), {"deleted_count": res.deleted_count})()

    def count_documents(self, query: Optional[Dict[str, Any]] = None) -> int:
        q = dict(query) if query else {}
        return self.col.count_documents(q)

class JSONDatabase:
    """Lightweight JSON file store used when offline."""
    def __init__(self, data_dir: str = "data"):
        self.data_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), data_dir)
        os.makedirs(self.data_dir, exist_ok=True)
        self.db_file = os.path.join(self.data_dir, "offline_db.json")
        self._load()

    def _load(self):
        if os.path.exists(self.db_file):
            try:
                with open(self.db_file, "r", encoding="utf-8") as f:
                    self.data = json.load(f)
            except Exception:
                self.data = {"audits": [], "projects": [], "users": [], "settings": {}}
        else:
            self.data = {"audits": [], "projects": [], "users": [], "settings": {}}
            self._save()

    def _save(self):
        with open(self.db_file, "w", encoding="utf-8") as f:
            json.dump(self.data, f, indent=2, default=str)

    def get_collection(self, name: str):
        if name not in self.data:
            self.data[name] = []
            self._save()
        return JSONCollection(self, name)

class JSONCollection:
    def __init__(self, db: JSONDatabase, name: str):
        self.db = db
        self.name = name

    def _items(self) -> List[Dict[str, Any]]:
        if isinstance(self.db.data.get(self.name), list):
            return self.db.data[self.name]
        return []

    def insert_one(self, document: Dict[str, Any]):
        doc = dict(document)
        if "_id" not in doc and "id" not in doc:
            doc_id = str(uuid.uuid4())
            doc["_id"] = doc_id
            doc["id"] = doc_id
        elif "_id" not in doc and "id" in doc:
            doc["_id"] = doc["id"]
        elif "_id" in doc and "id" not in doc:
            doc["id"] = str(doc["_id"])
        
        self.db.data[self.name].append(doc)
        self.db._save()
        return type("InsertResult", (), {"inserted_id": doc["_id"]})()

    def find(self, query: Optional[Dict[str, Any]] = None, sort_by: Optional[str] = None, reverse: bool = True) -> List[Dict[str, Any]]:
        items = self._items()
        if not query:
            res = [dict(x) for x in items]
        else:
            res = []
            for item in items:
                matches = True
                for k, v in query.items():
                    if k == "_id" and "id" in item and item.get("id") == v:
                        continue
                    if k == "id" and "_id" in item and item.get("_id") == v:
                        continue
                    if item.get(k) != v:
                        matches = False
                        break
                if matches:
                    res.append(dict(item))
        if sort_by:
            res.sort(key=lambda x: str(x.get(sort_by, "")), reverse=reverse)
        return res

    def find_one(self, query: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        items = self.find(query)
        return items[0] if items else None

    def update_one(self, query: Dict[str, Any], update: Dict[str, Any]):
        items = self._items()
        for idx, item in enumerate(items):
            matches = True
            for k, v in query.items():
                if k == "_id" and "id" in item and item.get("id") == v:
                    continue
                if k == "id" and "_id" in item and item.get("_id") == v:
                    continue
                if item.get(k) != v:
                    matches = False
                    break
            if matches:
                set_vals = update.get("$set", update)
                items[idx].update(set_vals)
                self.db._save()
                return type("UpdateResult", (), {"modified_count": 1})()
        return type("UpdateResult", (), {"modified_count": 0})()

    def delete_one(self, query: Dict[str, Any]):
        items = self._items()
        for idx, item in enumerate(items):
            matches = True
            for k, v in query.items():
                if k == "_id" and "id" in item and item.get("id") == v:
                    continue
                if k == "id" and "_id" in item and item.get("_id") == v:
                    continue
                if item.get(k) != v:
                    matches = False
                    break
            if matches:
                items.pop(idx)
                self.db._save()
                return type("DeleteResult", (), {"deleted_count": 1})()
        return type("DeleteResult", (), {"deleted_count": 0})()

    def count_documents(self, query: Optional[Dict[str, Any]] = None) -> int:
        return len(self.find(query))

class DatabaseManager:
    def __init__(self):
        self.is_connected = False
        self.mode = "offline_json_db"
        self.client = None
        self.db = None
        self.fallback_db = JSONDatabase()
        self._init_connection()

    def _init_connection(self):
        try:
            self.client = MongoClient(settings.MONGODB_URI, serverSelectionTimeoutMS=2000)
            self.client.admin.command("ping")
            self.db = self.client[settings.DATABASE_NAME]
            self.is_connected = True
            self.mode = "mongodb"
            print(f"[Database] Successfully connected to live MongoDB at {settings.MONGODB_URI}")
        except Exception as e:
            self.is_connected = True
            self.mode = "offline_json_db"
            print(f"[Database] Live MongoDB unreachable ({e}). Using persistent offline JSON database store.")

    def get_collection(self, collection_name: str):
        if self.mode == "mongodb" and self.db is not None:
            try:
                # test quick ping
                return MongoCollectionWrapper(self.db[collection_name])
            except Exception:
                return self.fallback_db.get_collection(collection_name)
        return self.fallback_db.get_collection(collection_name)

    def get_status(self) -> Dict[str, Any]:
        return {
            "status": "connected",
            "mode": self.mode,
            "mongodb_uri": settings.MONGODB_URI if self.mode == "mongodb" else None,
            "database_name": settings.DATABASE_NAME,
            "offline_fallback_active": self.mode == "offline_json_db"
        }

db_manager = DatabaseManager()
