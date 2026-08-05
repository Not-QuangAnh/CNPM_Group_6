# Kịch bản kiểm thử: đăng nhập quản trị viên & phân quyền các API ghi dữ liệu.


def test_admin_login_wrong_password_rejected(client):
    r = client.post("/api/auth/admin-login", json={"email": "admin@gobus.vn", "password": "sai"})
    assert r.status_code == 401


def test_admin_login_success(admin_client):
    r = admin_client.get("/api/auth/admin-me")
    assert r.status_code == 200
    assert r.get_json()["email"] == "admin@gobus.vn"


def test_write_endpoint_blocked_without_admin_login(client, sample_route_payload):
    r = client.post("/api/routes", json=sample_route_payload)
    assert r.status_code == 401


def test_customer_login_does_not_grant_admin_access(client, sample_route_payload):
    """Đăng nhập khách hàng KHÔNG được phép gọi API quản trị (2 phiên tách biệt)."""
    client.post("/api/auth/register", json={
        "name": "E", "email": "e@example.com", "phone": "", "password": "matkhau123",
    })
    r = client.post("/api/routes", json=sample_route_payload)
    assert r.status_code == 401


def test_admin_can_create_route(admin_client, sample_route_payload):
    r = admin_client.post("/api/routes", json=sample_route_payload)
    assert r.status_code == 201
    assert r.get_json()["code"] == "E10"


def test_bookings_list_only_visible_to_admin(client, admin_client):
    forbidden = client.get("/api/bookings")
    assert forbidden.status_code == 401
    ok = admin_client.get("/api/bookings")
    assert ok.status_code == 200


def test_admin_logout_revokes_access(admin_client):
    admin_client.post("/api/auth/admin-logout")
    r = admin_client.get("/api/auth/admin-me")
    assert r.status_code == 401
