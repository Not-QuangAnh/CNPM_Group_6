# init_db.py – Tạo bảng và nạp dữ liệu mẫu vào SQL Server
# Chạy 1 lần trước khi khởi động server lần đầu (hoặc mỗi khi muốn reset lại dữ liệu mẫu):
#
#   cd server
#   python init_db.py
#
# Yêu cầu: đã tạo sẵn database rỗng trên SQL Server (vd: CREATE DATABASE GoBusDB;)
# và đã điền đúng thông tin kết nối trong file .env ở thư mục gốc dự án.

from pathlib import Path

from werkzeug.security import generate_password_hash

from db import get_connection

BASE_DIR = Path(__file__).resolve().parent
DATABASE_DIR = BASE_DIR.parent / "database"

DEFAULT_ADMIN_EMAIL = "admin@gobus.vn"
DEFAULT_ADMIN_PASSWORD = "Admin@123"


def run_sql_file(conn, path):
    sql = path.read_text(encoding="utf-8")
    # Tách theo "GO" (giống cách SSMS/sqlcmd chạy theo batch)
    batches = [b.strip() for b in sql.split("\nGO") if b.strip()]
    cur = conn.cursor()
    for batch in batches:
        # Bỏ các dòng comment "GO" đứng riêng còn sót
        clean = "\n".join(line for line in batch.splitlines() if line.strip().upper() != "GO")
        if clean.strip():
            cur.execute(clean)
    conn.commit()


def seed_default_admin(conn):
    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) FROM dbo.Admins WHERE email=?", (DEFAULT_ADMIN_EMAIL,))
    if cur.fetchone()[0] > 0:
        return
    cur.execute(
        "INSERT INTO dbo.Admins (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)",
        ("ADMIN001", "Quản trị viên", DEFAULT_ADMIN_EMAIL, generate_password_hash(DEFAULT_ADMIN_PASSWORD), "admin"),
    )
    conn.commit()


def main():
    print("Đang kết nối SQL Server...")
    conn = get_connection()
    print("Kết nối thành công. Đang tạo bảng (schema.sql)...")
    run_sql_file(conn, DATABASE_DIR / "schema.sql")
    print("Đang nạp dữ liệu mẫu (seed_data.sql)...")
    run_sql_file(conn, DATABASE_DIR / "seed_data.sql")
    print("Đang tạo tài khoản admin mặc định...")
    seed_default_admin(conn)
    conn.close()
    print("✔ Hoàn tất! Database đã sẵn sàng, có thể chạy: python server.py")
    print(f"  Đăng nhập admin tại /admin.html bằng: {DEFAULT_ADMIN_EMAIL} / {DEFAULT_ADMIN_PASSWORD}")
    print("  (Đổi mật khẩu này sau khi đăng nhập lần đầu nếu dùng thật.)")


if __name__ == "__main__":
    main()
