# Đánh giá bảo mật (SECURITY)

## 1. Xác thực người dùng

Hệ thống sử dụng cơ chế đăng nhập để xác thực người dùng và quản trị viên trước khi truy cập các chức năng.

---

## 2. Phân quyền

Các chức năng quản trị chỉ được phép truy cập bởi tài khoản quản trị viên.

---

## 3. Bảo mật mật khẩu

Mật khẩu cần được lưu dưới dạng mã hóa (Hash) để tránh lộ dữ liệu khi cơ sở dữ liệu bị rò rỉ.

---

## 4. Chống SQL Injection

Các câu lệnh truy vấn nên sử dụng Parameterized Query để tránh tấn công SQL Injection.

---

## 5. Quản lý phiên đăng nhập

Sau khi người dùng đăng xuất, phiên làm việc cần được hủy để tránh bị lợi dụng.

---

## 6. Kiểm tra dữ liệu đầu vào

Mọi dữ liệu do người dùng nhập cần được kiểm tra nhằm hạn chế dữ liệu không hợp lệ hoặc mã độc.

---

## 7. Đề xuất cải thiện

- Sử dụng giao thức HTTPS khi triển khai.
- Bổ sung CSRF Protection.
- Thiết lập Cookie ở chế độ HttpOnly và Secure.
- Giới hạn số lần đăng nhập sai liên tiếp.
- Thường xuyên cập nhật thư viện và framework.
