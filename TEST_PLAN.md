# KẾ HOẠCH KIỂM THỬ HỆ THỐNG (TEST PLAN)

## 1. Giới thiệu

Tài liệu này mô tả kế hoạch kiểm thử cho hệ thống GoBus nhằm đảm bảo các chức năng hoạt động đúng yêu cầu, ổn định và hạn chế lỗi trước khi triển khai.

---

## 2. Mục tiêu kiểm thử

- Kiểm tra tính đúng đắn của các chức năng chính.
- Phát hiện lỗi trong quá trình xử lý dữ liệu.
- Đảm bảo các chức năng cũ vẫn hoạt động sau khi cập nhật.
- Kiểm tra phân quyền giữa người dùng và quản trị viên.

---

## 3. Môi trường kiểm thử

| Thành phần | Giá trị |
|------------|----------|
| Hệ điều hành | Windows 11 |
| Ngôn ngữ | Python 3.x |
| Framework | Flask |
| CSDL | Microsoft SQL Server |
| Công cụ kiểm thử | Pytest |

---

## 4. Phạm vi kiểm thử

### 4.1 Xác thực người dùng

- Đăng nhập khách hàng.
- Đăng nhập quản trị viên.
- Đăng xuất.
- Đăng nhập sai thông tin.

### 4.2 Quản lý tuyến xe

- Tìm kiếm tuyến xe.
- Hiển thị thông tin tuyến.

### 4.3 Đặt vé

- Đặt vé thành công.
- Kiểm tra dữ liệu đầu vào.
- Kiểm tra số lượng ghế còn lại.

### 4.4 Khuyến mãi

- Áp dụng mã hợp lệ.
- Kiểm tra mã hết hạn.
- Kiểm tra mã không tồn tại.

### 4.5 Phân quyền

- Người dùng không được truy cập trang quản trị.
- Quản trị viên được phép truy cập chức năng quản trị.

---

## 5. Loại kiểm thử

- Kiểm thử chức năng (Functional Testing)
- Kiểm thử tích hợp (Integration Testing)
- Kiểm thử hồi quy (Regression Testing)

---

## 6. Tiêu chí hoàn thành

- Tất cả các bài kiểm thử quan trọng đều đạt.
- Không còn lỗi nghiêm trọng ảnh hưởng đến hệ thống.
- Hệ thống hoạt động ổn định sau khi kiểm thử.
