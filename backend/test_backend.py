import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_auth_flow():
    # Register
    reg_res = client.post("/api/auth/register", json={
        "username": "codetester",
        "email": "codetester@university.edu",
        "password": "Password123!"
    })
    assert reg_res.status_code in [200, 400]
    
    # Login
    login_res = client.post("/api/auth/login", json={
        "email_or_username": "codetester@university.edu",
        "password": "Password123!"
    })
    assert login_res.status_code == 200
    user_data = login_res.json()
    assert user_data["username"] == "codetester"
    assert "token" in user_data

    # Me
    me_res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {user_data['token']}"})
    assert me_res.status_code == 200
    assert me_res.json()["email"] == "codetester@university.edu"

def test_code_scanner_endpoint():
    insecure_js = """
    app.post("/login", async (req, res) => {
        const query = "SELECT * FROM users WHERE email = \'" + req.body.email + "\'";
        const user = await db.query(query);
        if (user && user.password == req.body.password) {
            const token = jwt.sign({ id: user.id }, "hardcoded_secret_123");
            localStorage.setItem("token", token);
            res.json({ ok: true });
        }
    });
    """

    res = client.post("/api/audits/scan-code", json={
        "code_snippet": insecure_js,
        "language": "javascript",
        "project_name": "Insecure Controller"
    })
    assert res.status_code == 200
    data = res.json()
    assert data["overall_score"] < 80
    assert len(data["vulnerabilities"]) >= 1
    assert "secure_refactored_code" in data
    assert "action_checklist" in data

def test_vulnerability_and_remediation_evaluation():
    insecure_payload = {
        "project_name": "Insecure Demo App",
        "auditor_name": "Alice",
        "target_stack": "Node.js / Express",
        "template_id": "login_auth",
        "answers": {
            "pwd_storage": "pwd_storage_plaintext",
            "pwd_policy": "pwd_policy_none",
            "auth_rate_limiting": "rate_limit_none",
            "session_storage": "session_plain_cookie",
            "jwt_security": "jwt_weak_hardcoded_secret"
        }
    }
    create_res = client.post("/api/audits", json=insecure_payload)
    assert create_res.status_code == 200
    report = create_res.json()

    assert report["overall_score"] < 50
    assert report["letter_grade"] in ["D", "F"]
    assert len(report["vulnerabilities"]) >= 5
    assert len(report["category_scores"]) > 0

    for v in report["vulnerabilities"]:
        assert len(v["code_examples"]) > 0
        assert v["severity"] in ["Critical", "High", "Medium", "Low"]
        assert len(v["impact"]) > 0
        assert len(v["remediation_guide"]) > 0
