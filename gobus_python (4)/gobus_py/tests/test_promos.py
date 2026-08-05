# Kịch bản kiểm thử: quản lý mã khuyến mãi & áp mã giảm giá.


def test_admin_can_create_and_delete_promo(admin_client):
    created = admin_client.post("/api/promos", json={
        "code": "test2026", "desc": "Giảm cho khách mới", "limit": 50, "expiry": "31/12/2026",
    })
    assert created.status_code == 201
    body = created.get_json()
    assert body["code"] == "TEST2026"  # tự động in hoa

    deleted = admin_client.delete(f"/api/promos/{body['id']}")
    assert deleted.status_code == 204

    remaining = admin_client.get("/api/promos").get_json()
    assert all(p["id"] != body["id"] for p in remaining)


def test_create_promo_missing_fields_rejected(admin_client):
    r = admin_client.post("/api/promos", json={"code": "", "desc": ""})
    assert r.status_code == 400


def test_apply_valid_promo_code(client):
    r = client.post("/api/apply-promo", json={"base": 100000, "code": "gobus10"})
    assert r.status_code == 200
    body = r.get_json()
    assert body["after"] == 90000


def test_apply_invalid_promo_code_rejected(client):
    r = client.post("/api/apply-promo", json={"base": 100000, "code": "KHONGTONTAI"})
    assert r.status_code == 400
