# Kế hoạch kiểm thử (TEST PLAN)

## 1. Mục tiêu

Mục tiêu của tài liệu này là xây dựng kế hoạch kiểm thử nhằm đảm bảo các chức năng chính của hệ thống GoBus hoạt động chính xác, ổn định và đáp ứng yêu cầu của người dùng.

---

## 2. Môi trường kiểm thử

- Hệ điều hành: Windows 11
- Ngôn ngữ: Python 3.x
- Framework: Flask
- Cơ sở dữ liệu: SQL Server
- Công cụ kiểm thử: Pytest

---

## 3. Phạm vi kiểm thử

### Đăng nhập

- Đăng nhập khách hàng
- Đăng nhập quản trị viên
- Đăng xuất
- Đăng nhập sai tài khoản hoặc mật khẩu

### Đặt vé

- Tìm kiếm tuyến xe
- Đặt vé
- Hủy vé
- Kiểm tra đặt vé trùng

### Khuyến mãi

- Áp dụng mã khuyến mãi hợp lệ
- Áp dụng mã không hợp lệ

### Quản trị

- Truy cập trang quản trị
- Kiểm tra quyền truy cập

### Cơ sở dữ liệu

- Kết nối cơ sở dữ liệu
- Thêm, sửa, xóa và truy vấn dữ liệu

---

## 4. Loại kiểm thử

- Kiểm thử chức năng (Functional Testing)
- Kiểm thử tích hợp (Integration Testing)
- Kiểm thử hồi quy (Regression Testing)
- Kiểm thử chấp nhận người dùng (User Acceptance Testing)

---

## 5. Tiêu chí hoàn thành

- Tất cả các chức năng quan trọng hoạt động đúng.
- Không còn lỗi nghiêm trọng.
- Các chức năng cũ vẫn hoạt động bình thường sau khi cập nhật.
