# conftest.py – Cấu hình chung cho bộ kiểm thử.
#
# Ý tưởng: import server.py y hệt lúc chạy thật, nhưng "tráo" module repository
# (vốn đọc/ghi SQL Server thật) bằng FakeRepo (bộ nhớ tạm) TRƯỚC khi mỗi test
# chạy. Nhờ vậy test được đúng logic thật trong server.py (validate dữ liệu,
# phân quyền admin_required, mã lỗi HTTP...) mà không cần SQL Server thật.

import sys
from pathlib import Path

import pytest

TESTS_DIR = Path(__file__).resolve().parent
SERVER_DIR = TESTS_DIR.parent / "server"

# Cho phép `import server`, `import fake_repo` dù chạy pytest từ đâu
for p in (str(SERVER_DIR), str(TESTS_DIR)):
    if p not in sys.path:
        sys.path.insert(0, p)

from fake_repo import FakeRepo  # noqa: E402
import server as server_module  # noqa: E402


@pytest.fixture()
def repo(monkeypatch):
    """Một FakeRepo() hoàn toàn mới cho mỗi test, gắn thay cho server.repo."""
    fake = FakeRepo()
    monkeypatch.setattr(server_module, "repo", fake)
    return fake


@pytest.fixture()
def app(repo):  # noqa: ARG001 (đảm bảo repo được tráo trước khi tạo client)
    server_module.app.config.update(TESTING=True)
    return server_module.app


@pytest.fixture()
def client(app):
    """Flask test client — giữ cookie session giữa các request trong cùng 1 test."""
    return app.test_client()


@pytest.fixture()
def admin_client(client):
    """Test client đã đăng nhập sẵn với tài khoản admin mặc định."""
    r = client.post("/api/auth/admin-login", json={"email": "admin@gobus.vn", "password": "Admin@123"})
    assert r.status_code == 200
    return client


@pytest.fixture()
def sample_route_payload():
    return {
        "code": "E10",
        "name": "Bến A – Bến B",
        "type": "electric",
        "price": 8000,
        "frequency": 15,
        "hours": {"start": "05:00", "end": "22:00"},
        "color": "#1FAE7C",
        "stops": [
            {"name": "Bến A", "t": 0, "lat": 21.0, "lng": 105.8},
            {"name": "Bến B", "t": 20, "lat": 21.05, "lng": 105.85},
        ],
    }
