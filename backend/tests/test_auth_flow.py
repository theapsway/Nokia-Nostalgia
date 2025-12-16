from fastapi.testclient import TestClient
from src.main import app

client = TestClient(app)

def test_auth_flow():
    # 1. Signup
    username = "SecureUser"
    email = "secure@game.com"
    password = "MySecretPassword123!"
    
    response = client.post("/api/auth/signup", json={"username": username, "email": email, "password": password})
    assert response.status_code == 200
    data = response.json()
    assert data["success"] == True
    assert data["user"]["username"] == username
    
    # 2. Login Success
    response = client.post("/api/auth/login", json={"email": email, "password": password})
    assert response.status_code == 200
    data = response.json()
    assert data["success"] == True
    assert data["user"]["email"] == email
    
    # 3. Login Failure (Wrong Password)
    response = client.post("/api/auth/login", json={"email": email, "password": "WrongPassword"})
    assert response.status_code == 200
    data = response.json()
    assert data["success"] == False
    assert data["error"] == "Invalid email or password"
