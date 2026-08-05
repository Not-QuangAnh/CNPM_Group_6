# repository.py – Các hàm truy vấn/ghi dữ liệu vào SQL Server,
# trả về đúng định dạng (tên trường) mà frontend (public/js/app.js) đang mong đợi.

import random
import string
import time

from werkzeug.security import generate_password_hash, check_password_hash

from db import run_query, run_command


def gen_id(prefix):
    ts = str(int(time.time() * 1000))[-6:].upper()
    rand = "".join(random.choices(string.ascii_uppercase + string.digits, k=2))
    return f"{prefix}{ts}{rand}"


# ================= XÁC THỰC: KHÁCH HÀNG (Users) =================
def get_user_by_email(email):
    rows = run_query("SELECT id, name, email, phone, password_hash, student_id, school, student_verified FROM dbo.Users WHERE email=?", (email,))
    return rows[0] if rows else None


def get_user_by_id(user_id):
    rows = run_query("SELECT id, name, email, phone, student_id, school, student_verified FROM dbo.Users WHERE id=?", (user_id,))
    if not rows:
        return None
    u = rows[0]
    return {
        "id": u["id"],
        "name": u["name"],
        "email": u["email"],
        "phone": u["phone"],
        "student_id": u["student_id"],
        "school": u["school"],
        "student_verified": bool(u["student_verified"]),  # Chuyển BIT -> bool để frontend nhận đúng kiểu
    }


def create_user(name, email, phone, password):
    if get_user_by_email(email):
        raise ValueError("Email này đã được đăng ký.")
    user_id = gen_id("U")
    run_command(
        "INSERT INTO dbo.Users (id, name, email, phone, password_hash) VALUES (?, ?, ?, ?, ?)",
        (user_id, name, email, phone, generate_password_hash(password)),
    )
    return {"id": user_id, "name": name, "email": email, "phone": phone, "student_id": None, "school": None, "student_verified": False}


def verify_user(email, password):
    u = get_user_by_email(email)
    if not u or not check_password_hash(u["password_hash"], password):
        return None
    return {"id": u["id"], "name": u["name"], "email": u["email"], "phone": u["phone"],
            "student_id": u["student_id"], "school": u["school"], "student_verified": bool(u["student_verified"])}


def update_student_info(user_id, student_id, school):
    """Cập nhật thông tin sinh viên và tự động xác minh"""
    run_command(
        "UPDATE dbo.Users SET student_id=?, school=?, student_verified=1 WHERE id=?",
        (student_id, school, user_id),
    )
    return True


def get_student_discount():
    """Trả về mức giảm cho sinh viên"""
    return {"trip_discount": 0.30, "pass_discount": 0.20}  # 30% vé lượt, 20% thẻ tháng


# ================= XÁC THỰC: QUẢN TRỊ VIÊN (Admins) =================
def get_admin_by_email(email):
    rows = run_query("SELECT id, name, email, password_hash, role FROM dbo.Admins WHERE email=?", (email,))
    return rows[0] if rows else None


def get_admin_by_id(admin_id):
    rows = run_query("SELECT id, name, email, role FROM dbo.Admins WHERE id=?", (admin_id,))
    return rows[0] if rows else None


def verify_admin(email, password):
    a = get_admin_by_email(email)
    if not a or not check_password_hash(a["password_hash"], password):
        return None
    return {"id": a["id"], "name": a["name"], "email": a["email"], "role": a["role"]}


def update_admin_password(admin_id, old_password, new_password):
    """Đổi mật khẩu quản trị viên đang đăng nhập. Ném ValueError nếu mật khẩu hiện tại
    sai hoặc mật khẩu mới không hợp lệ (client sẽ nhận lỗi 400 kèm thông điệp)."""
    rows = run_query("SELECT id, password_hash FROM dbo.Admins WHERE id=?", (admin_id,))
    if not rows:
        return None
    if not check_password_hash(rows[0]["password_hash"], old_password):
        raise ValueError("Mật khẩu hiện tại không đúng.")
    if len(new_password) < 6:
        raise ValueError("Mật khẩu mới phải có tối thiểu 6 ký tự.")
    run_command(
        "UPDATE dbo.Admins SET password_hash=? WHERE id=?",
        (generate_password_hash(new_password), admin_id),
    )
    return True


# ================= ROUTES =================
def get_routes():
    routes = run_query("SELECT id, code, name, type, price, frequency, hour_start, hour_end, color FROM dbo.Routes")
    stops = run_query("SELECT route_id, name, t, lat, lng FROM dbo.RouteStops ORDER BY route_id, seq")
    stops_by_route = {}
    for s in stops:
        stops_by_route.setdefault(s["route_id"], []).append(
            {"name": s["name"], "t": s["t"], "lat": s["lat"], "lng": s["lng"]}
        )
    result = []
    for r in routes:
        result.append(
            {
                "id": r["id"],
                "code": r["code"],
                "name": r["name"],
                "type": r["type"],
                "price": r["price"],
                "frequency": r["frequency"],
                "hours": {"start": r["hour_start"], "end": r["hour_end"]},
                "color": r["color"],
                "stops": stops_by_route.get(r["id"], []),
            }
        )
    return result


def create_route(data):
    stops = data.get("stops") or []
    if not data.get("code") or not data.get("name") or len(stops) < 2:
        raise ValueError("Thiếu thông tin tuyến hoặc trạm (tối thiểu 2 trạm).")

    route_id = data.get("id") or "".join(c for c in data["code"].lower() if c.isalnum())
    existing_ids = {r["id"] for r in run_query("SELECT id FROM dbo.Routes")}
    if not route_id or route_id in existing_ids:
        route_id = (route_id or "route") + str(int(time.time() * 1000))[-4:]

    hours = data.get("hours") or {}
    run_command(
        "INSERT INTO dbo.Routes (id, code, name, type, price, frequency, hour_start, hour_end, color) "
        "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        (
            route_id, data["code"], data["name"], data.get("type", "regular"),
            data.get("price", 0), data.get("frequency", 15),
            hours.get("start", "05:00"), hours.get("end", "22:00"), data.get("color", "#3C7CD9"),
        ),
    )
    _insert_stops(route_id, stops)
    return get_route(route_id)


def update_route(route_id, data):
    existing = get_route(route_id)
    if not existing:
        return None
    hours = data.get("hours") or existing["hours"]
    run_command(
        "UPDATE dbo.Routes SET code=?, name=?, type=?, price=?, frequency=?, hour_start=?, hour_end=?, color=? "
        "WHERE id=?",
        (
            data.get("code", existing["code"]), data.get("name", existing["name"]),
            data.get("type", existing["type"]), data.get("price", existing["price"]),
            data.get("frequency", existing["frequency"]), hours.get("start", existing["hours"]["start"]),
            hours.get("end", existing["hours"]["end"]), data.get("color", existing["color"]), route_id,
        ),
    )
    if data.get("stops"):
        run_command("DELETE FROM dbo.RouteStops WHERE route_id=?", (route_id,))
        _insert_stops(route_id, data["stops"])
    return get_route(route_id)


def delete_route(route_id):
    run_command("DELETE FROM dbo.Routes WHERE id=?", (route_id,))  # RouteStops xóa theo qua ON DELETE CASCADE


def get_route(route_id):
    routes = get_routes()
    return next((r for r in routes if r["id"] == route_id), None)


def _insert_stops(route_id, stops):
    for i, s in enumerate(stops):
        run_command(
            "INSERT INTO dbo.RouteStops (route_id, seq, name, t, lat, lng) VALUES (?, ?, ?, ?, ?, ?)",
            (route_id, i, s["name"], s.get("t", 0), s.get("lat"), s.get("lng")),
        )


# ================= BOOKINGS =================
def get_bookings():
    rows = run_query(
        "SELECT id, route_code, customer, booking_date, booking_time, passenger_count, total, status "
        "FROM dbo.Bookings ORDER BY id DESC"
    )
    return [
        {
            "id": r["id"], "routeCode": r["route_code"], "customer": r["customer"],
            "date": r["booking_date"], "time": r["booking_time"],
            "count": r["passenger_count"], "total": r["total"], "status": r["status"],
        }
        for r in rows
    ]


def create_booking(data):
    booking_id = data.get("id") or gen_id("GB")
    run_command(
        "INSERT INTO dbo.Bookings (id, user_id, route_code, customer, booking_date, booking_time, passenger_count, total, status) "
        "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        (
            booking_id, data.get("user_id"), data.get("routeCode"), data.get("customer", "Khách vãng lai"),
            data.get("date"), data.get("time"), data.get("count", 1),
            data.get("total", 0), data.get("status", "confirmed"),
        ),
    )
    return next(b for b in get_bookings() if b["id"] == booking_id)


def get_bookings_by_user(user_id):
    rows = run_query(
        "SELECT id, route_code, customer, booking_date, booking_time, passenger_count, total, status "
        "FROM dbo.Bookings WHERE user_id=? ORDER BY id DESC",
        (user_id,),
    )
    return [
        {
            "id": r["id"], "routeCode": r["route_code"], "customer": r["customer"],
            "date": r["booking_date"], "time": r["booking_time"],
            "count": r["passenger_count"], "total": r["total"], "status": r["status"],
        }
        for r in rows
    ]


def update_booking(booking_id, data):
    if "status" in data:
        run_command("UPDATE dbo.Bookings SET status=? WHERE id=?", (data["status"], booking_id))
    return next((b for b in get_bookings() if b["id"] == booking_id), None)


# ================= PASSES =================
def get_passes():
    rows = run_query(
        "SELECT id, route_code, customer, plan_label, purchase_date, expiry, total, status "
        "FROM dbo.Passes ORDER BY id DESC"
    )
    return [
        {
            "id": r["id"], "routeCode": r["route_code"], "customer": r["customer"],
            "planLabel": r["plan_label"], "purchaseDate": r["purchase_date"],
            "expiry": r["expiry"], "total": r["total"], "status": r["status"],
        }
        for r in rows
    ]


def create_pass(data):
    pass_id = data.get("id") or gen_id("GB")
    run_command(
        "INSERT INTO dbo.Passes (id, user_id, route_code, customer, plan_label, purchase_date, expiry, total, status) "
        "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        (
            pass_id, data.get("user_id"), data.get("routeCode"), data.get("customer", "Khách vãng lai"),
            data.get("planLabel"), data.get("purchaseDate"), data.get("expiry"),
            data.get("total", 0), data.get("status", "active"),
        ),
    )
    return next(p for p in get_passes() if p["id"] == pass_id)


def get_passes_by_user(user_id):
    rows = run_query(
        "SELECT id, route_code, customer, plan_label, purchase_date, expiry, total, status "
        "FROM dbo.Passes WHERE user_id=? ORDER BY id DESC",
        (user_id,),
    )
    return [
        {
            "id": r["id"], "routeCode": r["route_code"], "customer": r["customer"],
            "planLabel": r["plan_label"], "purchaseDate": r["purchase_date"],
            "expiry": r["expiry"], "total": r["total"], "status": r["status"],
        }
        for r in rows
    ]


def update_pass(pass_id, data):
    if "status" in data:
        run_command("UPDATE dbo.Passes SET status=? WHERE id=?", (data["status"], pass_id))
    return next((p for p in get_passes() if p["id"] == pass_id), None)


# ================= DRIVERS =================
def get_drivers():
    rows = run_query("SELECT id, name, phone, route_code, vehicle, status, rating FROM dbo.Drivers")
    return [
        {
            "id": r["id"], "name": r["name"], "phone": r["phone"],
            "routeCode": r["route_code"], "vehicle": r["vehicle"],
            "status": r["status"], "rating": r["rating"],
        }
        for r in rows
    ]


def create_driver(data):
    driver_id = data.get("id") or gen_id("D")
    run_command(
        "INSERT INTO dbo.Drivers (id, name, phone, route_code, vehicle, status, rating) VALUES (?, ?, ?, ?, ?, ?, ?)",
        (
            driver_id, data.get("name"), data.get("phone"), data.get("routeCode"),
            data.get("vehicle"), data.get("status", "off_duty"), data.get("rating", 5),
        ),
    )
    return next(d for d in get_drivers() if d["id"] == driver_id)


def update_driver(driver_id, data):
    if "status" in data:
        run_command("UPDATE dbo.Drivers SET status=? WHERE id=?", (data["status"], driver_id))
    return next((d for d in get_drivers() if d["id"] == driver_id), None)


# ================= PROMOS =================
def get_promos():
    rows = run_query(
        "SELECT id, code, description, discount, uses, usage_limit, expiry, status FROM dbo.Promos ORDER BY id DESC"
    )
    return [
        {
            "id": r["id"], "code": r["code"], "desc": r["description"], "discount": r["discount"],
            "uses": r["uses"], "limit": r["usage_limit"], "expiry": r["expiry"], "status": r["status"],
        }
        for r in rows
    ]


def create_promo(data):
    code = (data.get("code") or "").strip()
    desc = (data.get("desc") or "").strip()
    if not code or not desc:
        raise ValueError("Nhập đủ thông tin mã khuyến mãi.")
    promo_id = gen_id("P")
    run_command(
        "INSERT INTO dbo.Promos (id, code, description, discount, uses, usage_limit, expiry, status) "
        "VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        (
            promo_id, code.upper(), desc, data.get("discount", "0"), 0,
            data.get("limit", 100), data.get("expiry") or "—", "active",
        ),
    )
    return next(p for p in get_promos() if p["id"] == promo_id)


def delete_promo(promo_id):
    run_command("DELETE FROM dbo.Promos WHERE id=?", (promo_id,))