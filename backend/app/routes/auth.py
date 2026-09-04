import hashlib
import os
import uuid
import datetime
from fastapi import APIRouter, HTTPException, Header
from typing import Optional
from app.models import UserRegister, UserLogin, UserResponse, User
from app.database import db_manager

router = APIRouter(prefix="/api/auth", tags=["User Authentication"])

def hash_password(password: str, salt: str) -> str:
    # Modern secure salted hash using sha256 with 100,000 PBKDF2 iterations
    return hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 100000).hex()

@router.post("/register", response_model=UserResponse)
def register_user(req: UserRegister):
    username = req.username.strip()
    email = req.email.strip().lower()

    if not username or len(username) < 3:
        raise HTTPException(status_code=400, detail="Username must be at least 3 characters long")
    if not email or "@" not in email:
        raise HTTPException(status_code=400, detail="Please provide a valid email address")
    if not req.password or len(req.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters long")

    users_col = db_manager.get_collection("users")
    
    # Check existing user
    if users_col.find_one({"username": username}):
        raise HTTPException(status_code=400, detail="Username is already registered")
    if users_col.find_one({"email": email}):
        raise HTTPException(status_code=400, detail="Email is already registered")

    user_id = str(uuid.uuid4())
    salt = os.urandom(16).hex()
    pwd_hash = hash_password(req.password, salt)
    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
    token = f"sc_auth_{uuid.uuid4().hex}"

    user_doc = {
        "id": user_id,
        "username": username,
        "email": email,
        "password_hash": pwd_hash,
        "salt": salt,
        "token": token,
        "created_at": now_iso
    }
    users_col.insert_one(user_doc)

    return UserResponse(
        id=user_id,
        username=username,
        email=email,
        created_at=now_iso,
        token=token
    )

@router.post("/login", response_model=UserResponse)
def login_user(req: UserLogin):
    identifier = req.email_or_username.strip()
    users_col = db_manager.get_collection("users")

    user = users_col.find_one({"email": identifier.lower()}) or users_col.find_one({"username": identifier})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid username/email or password")

    expected_hash = hash_password(req.password, user.get("salt", ""))
    if user.get("password_hash") != expected_hash:
        raise HTTPException(status_code=401, detail="Invalid username/email or password")

    # Refresh or generate token
    token = user.get("token") or f"sc_auth_{uuid.uuid4().hex}"
    users_col.update_one({"id": user["id"]}, {"$set": {"token": token, "last_login": datetime.datetime.now(datetime.timezone.utc).isoformat()}})

    return UserResponse(
        id=user["id"],
        username=user["username"],
        email=user["email"],
        created_at=user["created_at"],
        token=token
    )

@router.get("/me", response_model=UserResponse)
def get_current_user(authorization: Optional[str] = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Authentication token required")
    
    token = authorization.replace("Bearer ", "").strip()
    users_col = db_manager.get_collection("users")
    user = users_col.find_one({"token": token})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid or expired session token")

    return UserResponse(
        id=user["id"],
        username=user["username"],
        email=user["email"],
        created_at=user["created_at"],
        token=token
    )
