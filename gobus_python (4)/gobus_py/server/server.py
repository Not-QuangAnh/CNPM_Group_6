# GoBus backend – Flask + SQL Server
# Phục vụ frontend tĩnh (public/) và REST API dưới /api/..., dữ liệu lưu ở SQL Server thật.

import os
from functools import wraps
from pathlib import Path

from flask import Flask, jsonify, request, send_from_directory, session

import repository as repo

BASE_DIR = Path(__file__).resolve().parent
PUBLIC_DIR = BASE_DIR.parent / "public"

app = Flask(__name__, static_folder=None)
app.secret_key = os.getenv("SECRET_KEY", "gobus-dev-secret-doi-truoc-khi-dung-that")
app.config.update(SESSION_COOKIE_HTTPONLY=True, SESSION_COOKIE_SAMESITE="Lax")

# Cấu hình tĩnh (ít thay đổi, không cần bảng riêng trong SQL Server)
PASS_PLANS = [
    {"id": "1m", "label": "1 tháng", "months": 1, "price": 200000},
    {"id": "3m", "label": "3 tháng", "months": 3, "price": 540000, "save": "Tiết kiệm 60.000đ"},
    {"id": "6m", "label": "6 tháng", "months": 6, "price": 1000000, "save": "Tiết kiệm 200.000đ"},
]
WEEKDAYS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"]
PROMO_CODES = {
    "GOBUS10": {"discount": 0.10, "label": "Giảm 10%"},
    "BUYT2026": {"discount": 5000, "label": "Giảm 5.000đ"},
    "GOGREEN": {"discount": 0.15, "label": "Giảm 15%"},
}


def err(message, status=400):
    return jsonify({"error": message}), status


def db_err(e):
    return jsonify({"error": str(e)}), 503  # 503: không kết nối được database


def admin_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        if not session.get("admin_id"):
            return err("Cần đăng nhập quản trị viên để thực hiện thao tác này.", 401)
        return fn(*args, **kwargs)
    return wrapper


def login_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        if not session.get("user_id"):
            return err("Vui lòng đăng nhập để thực hiện thao tác này.", 401)
        return fn(*args, **kwargs)
    return wrapper


# ================= PHỤC VỤ FRONTEND TĨNH =================
@app.route("/")
def serve_index():
    return send_from_directory(PUBLIC_DIR, "index.html")


@app.route("/<path:filename>")
def serve_static(filename):
    return send_from_directory(PUBLIC_DIR, filename)


# ================= XÁC THỰC: KHÁCH HÀNG =================
@app.post("/api/auth/register")
def register():
    body = request.get_json(force=True) or {}
    name = (body.get("name") or "").strip()
    email = (body.get("email") or "").strip().lower()
    phone = (body.get("phone") or "").strip()
    password = body.get("password") or ""
    if not name or not email or len(password) < 6:
        return err("Vui lòng nhập đủ họ tên, email và mật khẩu (tối thiểu 6 ký tự).")
    try:
        user = repo.create_user(name, email, phone, password)
    except ValueError as e:
        return err(str(e))
    except RuntimeError as e:
        return db_err(e)
    session.clear()
    session["user_id"] = user["id"]
    return jsonify(user), 201


@app.post("/api/auth/login")
def login():
    body = request.get_json(force=True) or {}
    email = (body.get("email") or "").strip().lower()
    password = body.get("password") or ""
    try:
        user = repo.verify_user(email, password)
    except RuntimeError as e:
        return db_err(e)
    if not user:
        return err("Email hoặc mật khẩu không đúng.", 401)
    session.clear()
    session["user_id"] = user["id"]
    return jsonify(user)


@app.post("/api/auth/logout")
def logout():
    session.pop("user_id", None)
    return "", 204


@app.get("/api/auth/me")
def me():
    uid = session.get("user_id")
    if not uid:
        return err("Chưa đăng nhập.", 401)
    try:
        user = repo.get_user_by_id(uid)
    except RuntimeError as e:
        return db_err(e)
    if not user:
        return err("Chưa đăng nhập.", 401)
    return jsonify(user)


@app.post("/api/auth/student-verify")
@login_required
def student_verify():
    """Xác minh sinh viên: nhập MSSV + tên trường, tự động xác minh"""
    body = request.get_json(force=True) or {}
    student_id = (body.get("student_id") or "").strip()
    school = (body.get("school") or "").strip()
    if not student_id or not school:
        return err("Vui lòng nhập mã số sinh viên và tên trường học.")
    try:
        repo.update_student_info(session["user_id"], student_id, school)
        return jsonify({"ok": True, "student_id": student_id, "school": school, "student_verified": True})
    except RuntimeError as e:
        return db_err(e)


@app.get("/api/student-discount")
def get_student_discount():
    """Trả về mức giảm giá cho sinh viên"""
    try:
        return jsonify(repo.get_student_discount())
    except RuntimeError as e:
        return db_err(e)


@app.get("/api/my-bookings")
def my_bookings():
    uid = session.get("user_id")
    if not uid:
        return err("Chưa đăng nhập.", 401)
    try:
        return jsonify(repo.get_bookings_by_user(uid))
    except RuntimeError as e:
        return db_err(e)


@app.get("/api/my-passes")
def my_passes():
    uid = session.get("user_id")
    if not uid:
        return err("Chưa đăng nhập.", 401)
    try:
        return jsonify(repo.get_passes_by_user(uid))
    except RuntimeError as e:
        return db_err(e)


# ================= XÁC THỰC: QUẢN TRỊ VIÊN =================
@app.post("/api/auth/admin-login")
def admin_login():
    body = request.get_json(force=True) or {}
    email = (body.get("email") or "").strip().lower()
    password = body.get("password") or ""
    try:
        admin = repo.verify_admin(email, password)
    except RuntimeError as e:
        return db_err(e)
    if not admin:
        return err("Email hoặc mật khẩu quản trị viên không đúng.", 401)
    session.clear()
    session["admin_id"] = admin["id"]
    return jsonify(admin)


@app.post("/api/auth/admin-logout")
def admin_logout():
    session.pop("admin_id", None)
    return "", 204


@app.get("/api/auth/admin-me")
def admin_me():
    aid = session.get("admin_id")
    if not aid:
        return err("Chưa đăng nhập quản trị viên.", 401)
    try:
        admin = repo.get_admin_by_id(aid)
    except RuntimeError as e:
        return db_err(e)
    if not admin:
        return err("Chưa đăng nhập quản trị viên.", 401)
    return jsonify(admin)


@app.patch("/api/auth/admin-password")
@admin_required
def change_admin_password():
    body = request.get_json(force=True) or {}
    old_password = body.get("oldPassword") or ""
    new_password = body.get("newPassword") or ""
    if not old_password or not new_password:
        return err("Vui lòng nhập đủ mật khẩu hiện tại và mật khẩu mới.")
    try:
        repo.update_admin_password(session["admin_id"], old_password, new_password)
    except ValueError as e:
        return err(str(e))
    except RuntimeError as e:
        return db_err(e)
    return jsonify({"ok": True})


# ================= ROUTES (tuyến xe) =================
@app.get("/api/routes")
def get_routes():
    try:
        return jsonify(repo.get_routes())
    except RuntimeError as e:
        return db_err(e)


@app.post("/api/routes")
@admin_required
def create_route():
    try:
        route = repo.create_route(request.get_json(force=True) or {})
        return jsonify(route), 201
    except ValueError as e:
        return err(str(e))
    except RuntimeError as e:
        return db_err(e)


@app.put("/api/routes/<route_id>")
@admin_required
def update_route(route_id):
    try:
        route = repo.update_route(route_id, request.get_json(force=True) or {})
        if not route:
            return err("Không tìm thấy tuyến.", 404)
        return jsonify(route)
    except RuntimeError as e:
        return db_err(e)


@app.delete("/api/routes/<route_id>")
@admin_required
def delete_route(route_id):
    try:
        repo.delete_route(route_id)
        return "", 204
    except RuntimeError as e:
        return db_err(e)


# ================= BOOKINGS (vé lượt) =================
@app.get("/api/bookings")
@admin_required
def get_bookings():
    try:
        return jsonify(repo.get_bookings())
    except RuntimeError as e:
        return db_err(e)


@app.post("/api/bookings")
@login_required
def create_booking():
    try:
        data = request.get_json(force=True) or {}
        uid = session.get("user_id")
        data["user_id"] = uid
        u = repo.get_user_by_id(uid)
        if u:
            data["customer"] = u["name"]
        return jsonify(repo.create_booking(data)), 201
    except RuntimeError as e:
        return db_err(e)


@app.patch("/api/bookings/<booking_id>")
@admin_required
def update_booking(booking_id):
    try:
        b = repo.update_booking(booking_id, request.get_json(force=True) or {})
        if not b:
            return err("Không tìm thấy vé.", 404)
        return jsonify(b)
    except RuntimeError as e:
        return db_err(e)


# ================= PASSES (thẻ tháng) =================
@app.get("/api/passes")
@admin_required
def get_passes():
    try:
        return jsonify(repo.get_passes())
    except RuntimeError as e:
        return db_err(e)


@app.post("/api/passes")
@login_required
def create_pass():
    try:
        data = request.get_json(force=True) or {}
        uid = session.get("user_id")
        data["user_id"] = uid
        u = repo.get_user_by_id(uid)
        if u:
            data["customer"] = u["name"]
        return jsonify(repo.create_pass(data)), 201
    except RuntimeError as e:
        return db_err(e)


@app.patch("/api/passes/<pass_id>")
@admin_required
def update_pass(pass_id):
    try:
        p = repo.update_pass(pass_id, request.get_json(force=True) or {})
        if not p:
            return err("Không tìm thấy thẻ tháng.", 404)
        return jsonify(p)
    except RuntimeError as e:
        return db_err(e)


# ================= DRIVERS (tài xế) =================
@app.get("/api/drivers")
@admin_required
def get_drivers():
    try:
        return jsonify(repo.get_drivers())
    except RuntimeError as e:
        return db_err(e)


@app.post("/api/drivers")
@admin_required
def create_driver():
    try:
        return jsonify(repo.create_driver(request.get_json(force=True) or {})), 201
    except RuntimeError as e:
        return db_err(e)


@app.patch("/api/drivers/<driver_id>")
@admin_required
def update_driver(driver_id):
    try:
        d = repo.update_driver(driver_id, request.get_json(force=True) or {})
        if not d:
            return err("Không tìm thấy tài xế.", 404)
        return jsonify(d)
    except RuntimeError as e:
        return db_err(e)


# ================= PROMOS (khuyến mãi) =================
@app.get("/api/promos")
def get_promos():
    try:
        return jsonify(repo.get_promos())
    except RuntimeError as e:
        return db_err(e)


@app.post("/api/promos")
@admin_required
def create_promo():
    try:
        return jsonify(repo.create_promo(request.get_json(force=True) or {})), 201
    except ValueError as e:
        return err(str(e))
    except RuntimeError as e:
        return db_err(e)


@app.delete("/api/promos/<promo_id>")
@admin_required
def delete_promo(promo_id):
    try:
        repo.delete_promo(promo_id)
        return "", 204
    except RuntimeError as e:
        return db_err(e)


# ================= CONFIG (dữ liệu tĩnh) =================
@app.get("/api/config")
def get_config():
    return jsonify({"PASS_PLANS": PASS_PLANS, "WEEKDAYS": WEEKDAYS, "PROMO_CODES": PROMO_CODES})


@app.get("/api/maps-key")
def get_maps_key():
    return jsonify({"key": os.getenv("GOOGLE_MAPS_API_KEY", "")})


# ================= Áp mã giảm giá =================
@app.post("/api/apply-promo")
def apply_promo():
    body = request.get_json(force=True) or {}
    base = body.get("base", 0)
    code = (body.get("code") or "").upper()
    # Kiểm tra PROMO_CODES hardcoded
    p = PROMO_CODES.get(code)
    if p:
        discount = p["discount"]
        after = round(base * (1 - discount)) if isinstance(discount, float) and discount < 1 else max(0, base - discount)
        return jsonify({"code": code, "discount": discount, "label": p["label"], "after": after, "source": "builtin"})
    # Kiểm tra trong database promos
    try:
        promos = repo.get_promos()
    except RuntimeError as e:
        return db_err(e)
    db_promo = next((pr for pr in promos if pr["code"] == code and pr["status"] == "active"), None)
    if not db_promo:
        return err("Mã giảm giá không hợp lệ hoặc đã hết hạn.")
    # Parse discount: có thể là "10%" hoặc "5.000đ" hoặc số
    discount_str = str(db_promo["discount"]).strip()
    if discount_str.endswith("%"):
        try:
            pct = float(discount_str.rstrip("%")) / 100.0
            after = round(base * (1 - pct))
        except ValueError:
            return err("Định dạng mã giảm giá không hợp lệ.")
    else:
        # Dạng số tiền cố định
        try:
            amount = float(discount_str.replace(".", "").replace("đ", "").strip())
            after = max(0, base - int(amount))
        except ValueError:
            after = base
    return jsonify({"code": code, "discount": discount_str, "label": db_promo["desc"], "after": after, "source": "database"})


if __name__ == "__main__":
    port = int(os.getenv("PORT", 3000))
    print(f"GoBus server (SQL Server) đang chạy tại http://localhost:{port}")
    app.run(host="0.0.0.0", port=port, debug=True)
