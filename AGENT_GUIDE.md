# AGENT_GUIDE.md — Hướng dẫn cho AI agent làm việc trên GoBus

> Đọc file này trước khi sửa bất kỳ code nào. Mục tiêu: agent (Claude Code hoặc tương đương) làm đúng convention của repo, không phá vỡ setup hiện có.

## 1. Bối cảnh nhanh

- Backend: Flask, kết nối SQL Server qua `pyodbc` (xem `server/db.py`, `server/repository.py`)
- Working directory chuẩn cho mọi lệnh: **`gobus_py/`** (không phải thư mục cha)
- Test: `pytest`, cấu hình tại `pytest.ini` (`testpaths = tests`, `python_files = test_*.py`)
- Test dùng `tests/fake_repo.py` để **mô phỏng DB trong bộ nhớ** — KHÔNG cần SQL Server thật để chạy `pytest`

## 2. Trước khi sửa code

1. Chạy thử bộ test hiện có để biết baseline:
   ```bash
   cd gobus_py
   pip install -r requirements.txt -r requirements-dev.txt
   pytest -v
   ```
2. Đọc `server/repository.py` trước khi đổi logic truy vấn — đây là nơi tập trung SQL + xử lý mật khẩu.
3. Không giả định schema DB — kiểm tra `database/schema.sql` nếu cần đổi cấu trúc bảng.

## 3. Quy tắc bắt buộc

- **Không commit `.env`.** File này chứa thông tin kết nối DB thật và `GOOGLE_MAPS_API_KEY`. Nó đã có trong `.gitignore` — không sửa `.gitignore` để lộ nó.
- **Không hardcode secrets** (API key, mật khẩu DB, connection string) vào code. Luôn đọc qua biến môi trường (`python-dotenv`).
- **Mọi endpoint admin phải đi qua middleware xác thực admin hiện có** — không tạo route quản trị mới mà bỏ qua session check.
- **Mật khẩu luôn hash bằng `werkzeug.security`** — không bao giờ lưu hoặc log plaintext password.
- **Test mới cho tính năng mới phải nằm trong `tests/`** và tuân theo pattern `test_*.py` để `pytest.ini` nhận diện. Không để script test rời rạc ở thư mục gốc (xem bài học từ `test_student.py` — script hợp lệ để debug thủ công, nhưng không thay thế cho test suite chính thức).
- **Khi sửa API, cập nhật bảng "API endpoints chính" trong `README.md`** nếu thêm/đổi/xoá route.

## 4. Quy trình đề xuất khi thêm tính năng

1. Viết/điều chỉnh test trong `tests/` trước (dùng `fake_repo.py` làm fixture) — theo tinh thần TDD đã có sẵn trong repo.
2. Implement trong `server/`.
3. Chạy `pytest -v`, đảm bảo không phá test cũ.
4. Nếu tính năng liên quan xác thực/quyền hạn (auth, admin, student-verify...), tự kiểm tra thêm case "chưa đăng nhập" và "đăng nhập sai quyền" — đây là nhóm lỗi dễ bị bỏ sót nhất trong repo này (xem `test_admin_authorization.py` làm ví dụ mẫu).
5. Cập nhật README nếu thay đổi cách chạy/cấu hình.

## 5. Việc KHÔNG nên tự ý làm

- Không tự đổi cấu trúc `database/schema.sql` production mà không có migration rõ ràng.
- Không xoá/đổi tài khoản admin mặc định (`admin@gobus.vn`) trong `init_db.py` mà không hỏi trước.
- Không thêm dependency mới vào `requirements.txt` nếu chỉ cần cho việc test/dev — dùng `requirements-dev.txt`.
- Không tự động chạy migration hoặc lệnh ghi dữ liệu lên SQL Server thật khi chưa xác nhận với người dùng đây là môi trường an toàn để thử (dev/local), không phải production.

## 6. Khi bí — hỏi thay vì đoán

Nếu thiếu ngữ cảnh về nghiệp vụ (vd: quy tắc giá vé, điều kiện ưu đãi học sinh, luồng khuyến mãi), agent nên hỏi lại thay vì tự suy diễn — các quy tắc này ảnh hưởng trực tiếp đến tiền/vé của người dùng thật.
