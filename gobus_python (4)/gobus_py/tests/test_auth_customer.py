# Kịch bản kiểm thử: đăng ký / đăng nhập / phiên đăng nhập của khách hàng.


def test_register_success(client):
    r = client.post("/api/auth/register", json={
        "name": "Nguyễn Văn A", "email": "a@example.com", "phone": "0900000000", "password": "matkhau123",
    })
    assert r.status_code == 201
    body = r.get_json()
    assert body["email"] == "a@example.com"
    assert "password" not in body and "password_hash" not in body  # không lộ mật khẩu ra ngoài


def test_register_missing_fields_rejected(client):
    r = client.post("/api/auth/register", json={"name": "", "email": "", "password": "123"})
    assert r.status_code == 400


def test_register_duplicate_email_rejected(client):
    payload = {"name": "A", "email": "trung@example.com", "phone": "", "password": "matkhau123"}
    r1 = client.post("/api/auth/register", json=payload)
    assert r1.status_code == 201
    r2 = client.post("/api/auth/register", json=payload)
    assert r2.status_code == 400
    assert "đã được đăng ký" in r2.get_json()["error"]


def test_login_wrong_password_rejected(client):
    client.post("/api/auth/register", json={
        "name": "B", "email": "b@example.com", "phone": "", "password": "matkhau123",
    })
    r = client.post("/api/auth/login", json={"email": "b@example.com", "password": "sai-mat-khau"})
    assert r.status_code == 401


def test_login_success_and_session_persists(client):
    client.post("/api/auth/register", json={
        "name": "C", "email": "c@example.com", "phone": "", "password": "matkhau123",
    })
    r = client.post("/api/auth/login", json={"email": "c@example.com", "password": "matkhau123"})
    assert r.status_code == 200
    # Phiên đăng nhập (session cookie) phải còn hiệu lực ở request tiếp theo
    me = client.get("/api/auth/me")
    assert me.status_code == 200
    assert me.get_json()["email"] == "c@example.com"


def test_me_without_login_returns_401(client):
    r = client.get("/api/auth/me")
    assert r.status_code == 401


def test_logout_clears_session(client):
    client.post("/api/auth/register", json={
        "name": "D", "email": "d@example.com", "phone": "", "password": "matkhau123",
    })
    client.post("/api/auth/logout")
    r = client.get("/api/auth/me")
    assert r.status_code == 401
