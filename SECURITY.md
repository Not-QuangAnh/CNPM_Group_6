# ĐÁNH GIÁ BẢO MẬT (SECURITY)

## 1. Mục tiêu

Đánh giá các cơ chế bảo mật hiện có của hệ thống GoBus và đề xuất các biện pháp cải thiện.

---

## 2. Xác thực người dùng

Hệ thống sử dụng chức năng đăng nhập để xác thực khách hàng và quản trị viên trước khi sử dụng các chức năng tương ứng.

---

## 3. Phân quyền

Các chức năng quản trị được giới hạn cho tài khoản quản trị viên nhằm tránh người dùng thông thường truy cập trái phép.

---

## 4. Bảo mật cơ sở dữ liệu

Ứng dụng sử dụng Microsoft SQL Server làm hệ quản trị cơ sở dữ liệu.

Các truy vấn cần được thực hiện thông qua Parameterized Query để hạn chế nguy cơ SQL Injection.

---

## 5. Kiểm tra dữ liệu đầu vào

Dữ liệu do người dùng nhập cần được kiểm tra trước khi xử lý nhằm tránh lỗi và dữ liệu không hợp lệ.

---

## 6. Quản lý phiên đăng nhập

Sau khi người dùng đăng xuất, phiên làm việc cần được hủy để tránh truy cập trái phép.

---

## 7. Đề xuất cải thiện

- Sử dụng HTTPS khi triển khai.
- Thiết lập HttpOnly và Secure Cookie.
- Bổ sung CSRF Protection cho các biểu mẫu.
- Giới hạn số lần đăng nhập sai liên tiếp.
- Ghi log các hành động quan trọng của người dùng.
