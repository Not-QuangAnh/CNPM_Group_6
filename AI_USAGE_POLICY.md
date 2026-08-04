# AI_USAGE_POLICY.md — Chính sách sử dụng AI trong dự án GoBus

> Áp dụng cho mọi thành viên dùng công cụ AI (Claude, ChatGPT, Copilot, Claude Code...) để hỗ trợ phát triển GoBus.

## 1. Mục tiêu

Cho phép dùng AI để tăng tốc độ phát triển, nhưng đảm bảo:
- Không rò rỉ thông tin nhạy cảm (credentials, dữ liệu người dùng thật)
- Code liên quan bảo mật/thanh toán/xác thực luôn được người review trước khi merge
- Có dấu vết (log) cho biết phần nào của code do AI hỗ trợ, để dễ audit sau này

## 2. Dữ liệu KHÔNG được đưa vào AI (kể cả trong prompt, log, hay đính kèm file)

- Nội dung file `.env` thật (connection string, `DB_PASSWORD`, `GOOGLE_MAPS_API_KEY` thật)
- Dữ liệu khách hàng thật (email, số điện thoại, mật khẩu dù đã hash, lịch sử đặt vé thật)
- Dump từ SQL Server production

Khi cần AI hiểu cấu hình, dùng `.env.example` (đã ẩn giá trị thật) thay vì `.env`.

## 3. Dữ liệu được phép chia sẻ tự do

- Code nguồn (`server/`, `public/`, `tests/`)
- `README.md`, schema cấu trúc bảng (không kèm dữ liệu thật)
- `fake_repo.py` và dữ liệu test giả lập

## 4. Phạm vi AI được tự động thực hiện vs. cần người duyệt

| Loại thay đổi | AI có thể tự làm | Bắt buộc người review trước khi merge |
|---|---|---|
| Sửa lỗi UI, CSS, text tĩnh | ✅ | Không bắt buộc, nhưng khuyến khích |
| Viết/sửa test trong `tests/` | ✅ | Khuyến khích review |
| Thêm/sửa route không liên quan auth | ✅ (kèm test) | Review trước merge |
| Bất kỳ code chạm vào `auth`, `admin-*`, `password`, `session` | Chỉ soạn thảo, **không tự merge** | **Bắt buộc** người review |
| Thay đổi `database/schema.sql` | Chỉ đề xuất | **Bắt buộc** người review |
| Bất kỳ thao tác ghi/xoá dữ liệu trên SQL Server không phải môi trường test | Không được phép | — |

## 5. Yêu cầu về tính minh bạch

- Mọi phiên làm việc có AI hỗ trợ đáng kể (viết mới tính năng, sửa lỗi phức tạp, refactor) nên được ghi lại ngắn gọn trong `ai-logs/` (xem `ai-logs/week-01.md` làm mẫu).
- Commit message không bắt buộc phải ghi "AI-assisted", nhưng nếu AI viết phần lớn logic của một file, nên ghi chú trong PR description.

## 6. Kiểm tra bắt buộc sau khi nhận code từ AI

1. Chạy `pytest -v` — không merge nếu có test fail.
2. Đọc lại phần AI đụng vào `repository.py`, `server.py` liên quan auth — kiểm tra không có SQL injection (AI đôi khi nối chuỗi SQL thay vì dùng parameterized query).
3. Kiểm tra AI không tự thêm log in ra password/token.
4. Kiểm tra AI không tự ý sửa `.gitignore` hoặc thêm secrets vào code.

## 7. Khi AI không chắc / thiếu ngữ cảnh nghiệp vụ

AI nên hỏi lại thay vì tự suy đoán, đặc biệt với: quy tắc giá vé, điều kiện ưu đãi học sinh, quyền hạn admin, luồng thanh toán (nếu có sau này). Việc AI tự "đoán hợp lý" trong các phần này có rủi ro cao hơn lợi ích tốc độ.
