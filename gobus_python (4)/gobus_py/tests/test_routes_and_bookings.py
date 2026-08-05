# Kịch bản kiểm thử: tra cứu tuyến & đặt vé (có/không đăng nhập).


def test_create_route_requires_at_least_two_stops(admin_client):
    payload = {"code": "E11", "name": "Chỉ 1 trạm", "stops": [{"name": "A", "t": 0}]}
    r = admin_client.post("/api/routes", json=payload)
    assert r.status_code == 400


def test_public_can_read_routes(client, admin_client, sample_route_payload):
    admin_client.post("/api/routes", json=sample_route_payload)
    r = client.get("/api/routes")
    assert r.status_code == 200
    codes = [x["code"] for x in r.get_json()]
    assert "E10" in codes


def test_booking_without_login_succeeds_as_guest(client):
    r = client.post("/api/bookings", json={
        "routeCode": "E10", "date": "20/07/2026", "time": "08:00", "count": 1, "total": 8000,
    })
    assert r.status_code == 201
    assert r.get_json()["customer"] == "Khách vãng lai"


def test_booking_while_logged_in_is_linked_to_account(client):
    client.post("/api/auth/register", json={
        "name": "Phạm Thị F", "email": "f@example.com", "phone": "", "password": "matkhau123",
    })
    client.post("/api/bookings", json={
        "routeCode": "E10", "date": "20/07/2026", "time": "08:00", "count": 2, "total": 16000,
    })
    mine = client.get("/api/my-bookings")
    assert mine.status_code == 200
    bookings = mine.get_json()
    assert len(bookings) == 1
    assert bookings[0]["customer"] == "Phạm Thị F"


def test_admin_can_update_booking_status(admin_client):
    created = admin_client.post("/api/bookings", json={
        "routeCode": "E10", "date": "20/07/2026", "time": "08:00", "count": 1, "total": 8000,
    }).get_json()
    r = admin_client.patch(f"/api/bookings/{created['id']}", json={"status": "cancelled"})
    assert r.status_code == 200
    assert r.get_json()["status"] == "cancelled"


def test_update_unknown_booking_returns_404(admin_client):
    r = admin_client.patch("/api/bookings/KHONGTONTAI", json={"status": "cancelled"})
    assert r.status_code == 404
