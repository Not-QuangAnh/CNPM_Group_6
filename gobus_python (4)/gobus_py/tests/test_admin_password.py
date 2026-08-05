# Kịch bản kiểm thử: tính năng đổi mật khẩu quản trị viên (mới bổ sung).


def test_change_password_requires_admin_login(client):
    r = client.patch("/api/auth/admin-password", json={"oldPassword": "Admin@123", "newPassword": "MoiMoi123"})
    assert r.status_code == 401


def test_change_password_wrong_old_password_rejected(admin_client):
    r = admin_client.patch("/api/auth/admin-password", json={
        "oldPassword": "sai-mat-khau", "newPassword": "MoiMoi123",
    })
    assert r.status_code == 400


def test_change_password_too_short_rejected(admin_client):
    r = admin_client.patch("/api/auth/admin-password", json={
        "oldPassword": "Admin@123", "newPassword": "123",
    })
    assert r.status_code == 400


def test_change_password_success_and_can_login_with_new_password(client):
    login = client.post("/api/auth/admin-login", json={"email": "admin@gobus.vn", "password": "Admin@123"})
    assert login.status_code == 200

    r = client.patch("/api/auth/admin-password", json={
        "oldPassword": "Admin@123", "newPassword": "MatKhauMoi456",
    })
    assert r.status_code == 200
    assert r.get_json()["ok"] is True

    client.post("/api/auth/admin-logout")

    old_login = client.post("/api/auth/admin-login", json={"email": "admin@gobus.vn", "password": "Admin@123"})
    assert old_login.status_code == 401

    new_login = client.post("/api/auth/admin-login", json={"email": "admin@gobus.vn", "password": "MatKhauMoi456"})
    assert new_login.status_code == 200
