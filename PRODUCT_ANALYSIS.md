# PRODUCT_ANALYSIS.md — Phân tích sản phẩm GoBus

> Phân tích dựa trên trạng thái code hiện tại (README, cấu trúc `server/`, `tests/`, `public/`). Mục đích: nhìn thẳng vào điểm mạnh/yếu thật của sản phẩm trước khi quyết định làm gì tiếp — bổ sung, không thay thế `PRODUCT_DIRECTION.md`.

## 1. Điểm mạnh hiện tại

- **Rào cản thấp cho người dùng cuối**: đặt vé không bắt buộc đăng nhập — đúng insight quan trọng cho ứng dụng giao thông công cộng (người dùng vãng lai/khách du lịch chiếm tỷ trọng lớn).
- **Phân quyền admin tách biệt rõ ràng**: session admin và session khách hàng không dùng chung, giảm rủi ro leo thang quyền (privilege escalation) — một lỗi rất phổ biến ở app tương tự.
- **Bảo mật mật khẩu đúng chuẩn cơ bản**: dùng `werkzeug.security` hash, không có dấu hiệu lưu plaintext.
- **Test suite không phụ thuộc hạ tầng**: `fake_repo.py` cho phép chạy 28 kịch bản test mà không cần SQL Server thật — giúp CI/local dev nhanh, hạ chi phí kiểm thử.
- **Có cơ chế fallback khi thiếu cấu hình** (Google Maps API key) thay vì crash — dấu hiệu tư duy sản phẩm chín, không chỉ code cho chạy được.

## 2. Điểm yếu / rủi ro

| Vấn đề | Mức độ | Ghi chú |
|---|---|---|
| Luồng xác thực học sinh (`student-verify`) có lỗi 401 sau khi đăng nhập thành công | Cao | Xem `test_output.txt`; chưa rõ là bug server hay lỗi test script (thiếu session cookie) — **cần xác minh trước khi coi là đã xong** |
| Không có test chính thức cho `student-verify` trong `tests/` | Trung bình | `test_student.py` là script rời ở gốc repo, không nằm trong `pytest.ini` testpaths → tính năng này **không được bảo vệ bởi CI** |
| Phụ thuộc SQL Server + ODBC driver để chạy thật (không phải test) | Trung bình | Gây rào cản setup cho dev mới (README có hẳn mục xử lý sự cố driver) — cân nhắc Docker hoá SQL Server cho môi trường dev sau này |
| Không có rate-limiting / chống brute-force rõ ràng trên `/api/auth/login`, `/api/auth/admin-login` | Cao (bảo mật) | Không thấy đề cập trong README hay cấu trúc thư mục; cần xác minh trong `server.py` |
| `database/data/db.json` được ghi là "chỉ tham khảo" nhưng vẫn tồn tại trong repo | Thấp | Rủi ro nhầm lẫn / dữ liệu cũ không đồng bộ với schema SQL thật |
| Chưa có CI tự động chạy `pytest` khi push | Trung bình | Test tốt nhưng nếu không chạy tự động thì dễ bị bỏ qua khi có PR |

## 3. Khoảng trống so với kỳ vọng người dùng (giả định — cần xác nhận với dữ liệu người dùng thật nếu có)

- **Theo dõi xe thời gian thực** đã có (Google Maps) nhưng không rõ có **thông báo/cảnh báo chủ động** (xe trễ, xe sắp đến) hay chưa — đây thường là tính năng người dùng đánh giá cao nhất ở app xe buýt.
- Chưa thấy cơ chế **đánh giá/phản hồi tuyến** (rating, feedback) trong danh sách endpoint — khó cải thiện chất lượng dịch vụ nếu không có kênh thu thập ý kiến.
- Ưu đãi học sinh mới dừng ở "xác thực" (`student_verified`), chưa rõ có liên kết với **giá vé ưu đãi thực tế** khi đặt vé hay không.

## 4. Ưu tiên đề xuất (ngắn hạn)

1. Xác minh và sửa dứt điểm lỗi `student-verify` (bug thật hay lỗi test) — đây là tính năng dở dang, rủi ro cao nhất hiện tại.
2. Chuyển `test_student.py` thành test chính thức trong `tests/`, dùng `requests.Session()` hoặc cookie jar tương đương để test đúng luồng có session.
3. Kiểm tra rate-limiting trên các endpoint đăng nhập trước khi triển khai thật.
4. Thiết lập CI chạy `pytest -v` tự động.

Xem `AI_FEATURE_PROPOSAL.md` cho đề xuất tính năng dùng AI để giải quyết một số khoảng trống ở mục 3.
