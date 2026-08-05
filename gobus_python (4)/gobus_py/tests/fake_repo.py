# fake_repo.py – "Cơ sở dữ liệu" giả lập, chỉ nằm trong bộ nhớ.
#
# Dùng riêng cho bộ kiểm thử (tests/) để mô phỏng lại đúng "hợp đồng" của
# server/repository.py (tên hàm, tham số, định dạng dữ liệu trả về) mà KHÔNG
# cần SQL Server thật — nhờ vậy test chạy được trên mọi máy, kể cả CI.
#
# Nếu sau này sửa repository.py (thêm/đổi hàm), hãy cập nhật file này tương ứng
# để test tiếp tục phản ánh đúng hành vi thật của backend.

import random
import string
import time

from werkzeug.security import check_password_hash, generate_password_hash


def _gen_id(prefix):
    ts = str(int(time.time() * 1000))[-6:].upper()
    rand = "".join(random.choices(string.ascii_uppercase + string.digits, k=4))
    return f"{prefix}{ts}{rand}"


def _booking_public(b):
    return {
        "id": b["id"], "routeCode": b["route_code"], "customer": b["customer"],
        "date": b["booking_date"], "time": b["booking_time"],
        "count": b["passenger_count"], "total": b["total"], "status": b["status"],
    }


def _pass_public(p):
    return {
        "id": p["id"], "routeCode": p["route_code"], "customer": p["customer"],
        "planLabel": p["plan_label"], "purchaseDate": p["purchase_date"],
        "expiry": p["expiry"], "total": p["total"], "status": p["status"],
    }


class FakeRepo:
    """Một 'cơ sở dữ liệu' nằm hoàn toàn trong bộ nhớ, tạo mới (reset) cho mỗi test
    thông qua fixture `repo` trong conftest.py."""

    def __init__(self):
        self.users = {}
        self.admins = {}
        self.routes = {}
        self.bookings = {}
        self.passes = {}
        self.drivers = {}
        self.promos = {}
        self._seed_default_admin()

    def _seed_default_admin(self):
        self.admins["ADMIN001"] = {
            "id": "ADMIN001", "name": "Quản trị viên", "email": "admin@gobus.vn",
            "password_hash": generate_password_hash("Admin@123"), "role": "admin",
        }

    # ================= Users =================
    def get_user_by_email(self, email):
        return next((u for u in self.users.values() if u["email"] == email), None)

    def get_user_by_id(self, user_id):
        u = self.users.get(user_id)
        if not u:
            return None
        return {"id": u["id"], "name": u["name"], "email": u["email"], "phone": u["phone"]}

    def create_user(self, name, email, phone, password):
        if self.get_user_by_email(email):
            raise ValueError("Email này đã được đăng ký.")
        user_id = _gen_id("U")
        self.users[user_id] = {
            "id": user_id, "name": name, "email": email, "phone": phone,
            "password_hash": generate_password_hash(password),
        }
        return {"id": user_id, "name": name, "email": email, "phone": phone}

    def verify_user(self, email, password):
        u = self.get_user_by_email(email)
        if not u or not check_password_hash(u["password_hash"], password):
            return None
        return {"id": u["id"], "name": u["name"], "email": u["email"], "phone": u["phone"]}

    # ================= Admins =================
    def get_admin_by_email(self, email):
        return next((a for a in self.admins.values() if a["email"] == email), None)

    def get_admin_by_id(self, admin_id):
        a = self.admins.get(admin_id)
        if not a:
            return None
        return {"id": a["id"], "name": a["name"], "email": a["email"], "role": a["role"]}

    def verify_admin(self, email, password):
        a = self.get_admin_by_email(email)
        if not a or not check_password_hash(a["password_hash"], password):
            return None
        return {"id": a["id"], "name": a["name"], "email": a["email"], "role": a["role"]}

    def update_admin_password(self, admin_id, old_password, new_password):
        a = self.admins.get(admin_id)
        if not a:
            return None
        if not check_password_hash(a["password_hash"], old_password):
            raise ValueError("Mật khẩu hiện tại không đúng.")
        if len(new_password) < 6:
            raise ValueError("Mật khẩu mới phải có tối thiểu 6 ký tự.")
        a["password_hash"] = generate_password_hash(new_password)
        return True

    # ================= Routes =================
    def get_routes(self):
        return [dict(r) for r in self.routes.values()]

    def get_route(self, route_id):
        r = self.routes.get(route_id)
        return dict(r) if r else None

    def create_route(self, data):
        stops = data.get("stops") or []
        if not data.get("code") or not data.get("name") or len(stops) < 2:
            raise ValueError("Thiếu thông tin tuyến hoặc trạm (tối thiểu 2 trạm).")
        route_id = data.get("id") or "".join(c for c in data["code"].lower() if c.isalnum())
        if not route_id or route_id in self.routes:
            route_id = (route_id or "route") + str(int(time.time() * 1000))[-4:]
        hours = data.get("hours") or {}
        route = {
            "id": route_id, "code": data["code"], "name": data["name"],
            "type": data.get("type", "regular"), "price": data.get("price", 0),
            "frequency": data.get("frequency", 15),
            "hours": {"start": hours.get("start", "05:00"), "end": hours.get("end", "22:00")},
            "color": data.get("color", "#3C7CD9"),
            "stops": [
                {"name": s["name"], "t": s.get("t", 0), "lat": s.get("lat"), "lng": s.get("lng")}
                for s in stops
            ],
        }
        self.routes[route_id] = route
        return dict(route)

    def update_route(self, route_id, data):
        existing = self.routes.get(route_id)
        if not existing:
            return None
        hours = data.get("hours") or existing["hours"]
        existing.update({
            "code": data.get("code", existing["code"]),
            "name": data.get("name", existing["name"]),
            "type": data.get("type", existing["type"]),
            "price": data.get("price", existing["price"]),
            "frequency": data.get("frequency", existing["frequency"]),
            "hours": {
                "start": hours.get("start", existing["hours"]["start"]),
                "end": hours.get("end", existing["hours"]["end"]),
            },
            "color": data.get("color", existing["color"]),
        })
        if data.get("stops"):
            existing["stops"] = [
                {"name": s["name"], "t": s.get("t", 0), "lat": s.get("lat"), "lng": s.get("lng")}
                for s in data["stops"]
            ]
        return dict(existing)

    def delete_route(self, route_id):
        self.routes.pop(route_id, None)

    # ================= Bookings =================
    def get_bookings(self):
        items = sorted(self.bookings.values(), key=lambda b: b["id"], reverse=True)
        return [_booking_public(b) for b in items]

    def get_bookings_by_user(self, user_id):
        items = sorted(self.bookings.values(), key=lambda b: b["id"], reverse=True)
        return [_booking_public(b) for b in items if b.get("user_id") == user_id]

    def create_booking(self, data):
        booking_id = data.get("id") or _gen_id("GB")
        b = {
            "id": booking_id, "user_id": data.get("user_id"), "route_code": data.get("routeCode"),
            "customer": data.get("customer", "Khách vãng lai"), "booking_date": data.get("date"),
            "booking_time": data.get("time"), "passenger_count": data.get("count", 1),
            "total": data.get("total", 0), "status": data.get("status", "confirmed"),
        }
        self.bookings[booking_id] = b
        return _booking_public(b)

    def update_booking(self, booking_id, data):
        b = self.bookings.get(booking_id)
        if not b:
            return None
        if "status" in data:
            b["status"] = data["status"]
        return _booking_public(b)

    # ================= Passes =================
    def get_passes(self):
        items = sorted(self.passes.values(), key=lambda p: p["id"], reverse=True)
        return [_pass_public(p) for p in items]

    def get_passes_by_user(self, user_id):
        items = sorted(self.passes.values(), key=lambda p: p["id"], reverse=True)
        return [_pass_public(p) for p in items if p.get("user_id") == user_id]

    def create_pass(self, data):
        pass_id = data.get("id") or _gen_id("GB")
        p = {
            "id": pass_id, "user_id": data.get("user_id"), "route_code": data.get("routeCode"),
            "customer": data.get("customer", "Khách vãng lai"), "plan_label": data.get("planLabel"),
            "purchase_date": data.get("purchaseDate"), "expiry": data.get("expiry"),
            "total": data.get("total", 0), "status": data.get("status", "active"),
        }
        self.passes[pass_id] = p
        return _pass_public(p)

    def update_pass(self, pass_id, data):
        p = self.passes.get(pass_id)
        if not p:
            return None
        if "status" in data:
            p["status"] = data["status"]
        return _pass_public(p)

    # ================= Drivers =================
    def get_drivers(self):
        return [dict(d) for d in self.drivers.values()]

    def create_driver(self, data):
        driver_id = data.get("id") or _gen_id("D")
        d = {
            "id": driver_id, "name": data.get("name"), "phone": data.get("phone"),
            "routeCode": data.get("routeCode"), "vehicle": data.get("vehicle"),
            "status": data.get("status", "off_duty"), "rating": data.get("rating", 5),
        }
        self.drivers[driver_id] = d
        return dict(d)

    def update_driver(self, driver_id, data):
        d = self.drivers.get(driver_id)
        if not d:
            return None
        if "status" in data:
            d["status"] = data["status"]
        return dict(d)

    # ================= Promos =================
    def get_promos(self):
        items = sorted(self.promos.values(), key=lambda p: p["id"], reverse=True)
        return [dict(p) for p in items]

    def create_promo(self, data):
        code = (data.get("code") or "").strip()
        desc = (data.get("desc") or "").strip()
        if not code or not desc:
            raise ValueError("Nhập đủ thông tin mã khuyến mãi.")
        promo_id = _gen_id("P")
        p = {
            "id": promo_id, "code": code.upper(), "desc": desc,
            "discount": data.get("discount", "..."), "uses": 0,
            "limit": data.get("limit", 100), "expiry": data.get("expiry") or "—",
            "status": "active",
        }
        self.promos[promo_id] = p
        return dict(p)

    def delete_promo(self, promo_id):
        self.promos.pop(promo_id, None)
