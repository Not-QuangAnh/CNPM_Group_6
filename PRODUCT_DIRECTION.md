# PRODUCT_DIRECTION.md — GoBus

> Tài liệu định hướng sản phẩm. Mục đích: giúp bất kỳ ai (thành viên mới, hoặc AI agent) hiểu **GoBus đang xây cái gì, cho ai, và vì sao** trước khi đụng vào code.

## 1. Sản phẩm là gì

GoBus là ứng dụng web tìm tuyến xe buýt, cho phép:
- Khách vãng lai/khách hàng đã đăng ký **tìm tuyến, đặt vé, mua thẻ tháng**, theo dõi xe theo thời gian thực trên Google Maps.
- Quản trị viên quản lý tuyến, vé, tài xế, khuyến mãi qua một dashboard riêng (`admin.html`) có xác thực bắt buộc.

Stack: Flask (Python) + SQL Server (qua `pyodbc`), frontend thuần HTML/CSS/JS (`public/`), không framework SPA.

## 2. Người dùng mục tiêu

| Nhóm | Nhu cầu chính |
|---|---|
| Khách hàng phổ thông | Tra cứu tuyến, đặt vé nhanh, không bắt buộc đăng nhập |
| Học sinh/sinh viên | Có cơ chế xác thực học sinh (`student-verify`) để hưởng ưu đãi — xem mục 4 |
| Quản trị viên | Vận hành hệ thống: tuyến, tài xế, vé, khuyến mãi |

## 3. Nguyên tắc thiết kế sản phẩm (giữ nguyên khi thêm tính năng)

1. **Đặt vé không rào cản** — khách vãng lai vẫn đặt được vé mà không cần tài khoản; đăng nhập chỉ để tiện quản lý vé về sau.
2. **Tách bạch quyền hạn rõ ràng** — mọi API quản trị nằm sau lớp xác thực admin riêng biệt (không dùng chung session với khách hàng).
3. **Không phụ thuộc cứng vào Google Maps** — nếu chưa cấu hình `GOOGLE_MAPS_API_KEY`, ứng dụng phải báo lỗi rõ ràng thay vì crash (đã áp dụng, xem README mục Google Maps).
4. **Mật khẩu không bao giờ lưu plaintext** — dùng `werkzeug.security` để hash.
5. **Test không phụ thuộc SQL Server thật** — dùng `fake_repo.py` mô phỏng trong bộ nhớ để CI/local test chạy nhanh, không cần setup DB.

## 4. Trạng thái hiện tại (đã có)

- Đăng ký/đăng nhập/đăng xuất khách hàng (`/api/auth/*`)
- Đăng nhập/đăng xuất/đổi mật khẩu admin (`/api/auth/admin-*`)
- Xem vé/thẻ tháng của tài khoản (`/api/my-bookings`, `/api/my-passes`)
- Bản đồ Google Maps thời gian thực (chi tiết tuyến, theo dõi xe)
- Cơ chế xác thực học sinh (`student-verify`, `student_verified`) — **đang có lỗi**, xem mục 6

## 5. Định hướng sắp tới (đề xuất — cần xác nhận với chủ dự án)

- [ ] Hoàn thiện luồng xác thực học sinh end-to-end (đăng nhập → verify → phản ánh đúng trạng thái ở `/me`)
- [ ] Thêm test cho `student-verify` vào bộ `tests/` chính thức (hiện `test_student.py` là script thủ công ở ngoài `tests/`, không nằm trong `pytest.ini` testpaths)
- [ ] Cân nhắc thêm CI chạy `pytest -v` tự động khi push
- [ ] Tài liệu hoá schema DB (`database/schema.sql`) trong README hoặc file riêng

## 6. Vấn đề đã biết (non-goal tạm thời — không phải hướng phát triển, chỉ ghi nhận)

`test_output.txt` cho thấy: sau khi login thành công (200), gọi `student-verify` và `/api/auth/me` đều trả **401 "Chưa đăng nhập"**. Nguyên nhân nhiều khả năng là `test_student.py` dùng `http.client` trực tiếp và **không giữ cookie session** giữa các request. Đây là lỗi ở test script, không hẳn ở server — cần xác minh trước khi coi là bug sản phẩm.
