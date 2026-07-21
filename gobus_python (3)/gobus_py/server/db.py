# db.py – Kết nối tới SQL Server
# Cấu hình đọc từ file .env (xem .env.example để biết các biến cần điền)

import os
import pyodbc
from dotenv import load_dotenv

load_dotenv()

DB_DRIVER = os.getenv("DB_DRIVER", "ODBC Driver 17 for SQL Server")
DB_SERVER = os.getenv("DB_SERVER", "localhost")
DB_NAME = os.getenv("DB_NAME", "GoBusDB")
DB_TRUSTED = os.getenv("DB_TRUSTED_CONNECTION", "no").strip().lower() in ("yes", "true", "1")
DB_USER = os.getenv("DB_USER", "")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")


def _connection_string():
    parts = [f"DRIVER={{{DB_DRIVER}}}", f"SERVER={DB_SERVER}", f"DATABASE={DB_NAME}"]
    if DB_TRUSTED:
        # Windows Authentication (chỉ dùng được khi chạy trên Windows, đăng nhập bằng tài khoản Windows hiện tại)
        parts.append("Trusted_Connection=yes")
    else:
        # SQL Server Authentication (username/password) — dùng được trên mọi hệ điều hành
        parts.append(f"UID={DB_USER}")
        parts.append(f"PWD={DB_PASSWORD}")
    parts.append("TrustServerCertificate=yes")  # tránh lỗi chứng chỉ SSL tự ký khi chạy local
    return ";".join(parts) + ";"


def get_connection():
    """Mở một kết nối mới tới SQL Server. Gọi conn.close() (hoặc dùng `with`) sau khi dùng xong."""
    try:
        return pyodbc.connect(_connection_string(), timeout=5)
    except pyodbc.Error as e:
        raise RuntimeError(
            "Không kết nối được SQL Server. Kiểm tra lại: (1) SQL Server đang chạy, "
            "(2) thông tin trong file .env đúng, (3) đã cài ODBC Driver for SQL Server. "
            f"Chi tiết lỗi: {e}"
        ) from e


def rows_to_dicts(cursor):
    """Chuyển kết quả cursor.fetchall() thành list[dict] dựa theo tên cột."""
    columns = [col[0] for col in cursor.description]
    return [dict(zip(columns, row)) for row in cursor.fetchall()]


def run_query(sql, params=(), fetch=True):
    """Chạy 1 câu SELECT và trả về list[dict]."""
    with get_connection() as conn:
        cur = conn.cursor()
        cur.execute(sql, params)
        return rows_to_dicts(cur) if fetch else None


def run_command(sql, params=()):
    """Chạy 1 câu INSERT/UPDATE/DELETE, tự động commit."""
    with get_connection() as conn:
        cur = conn.cursor()
        cur.execute(sql, params)
        conn.commit()
