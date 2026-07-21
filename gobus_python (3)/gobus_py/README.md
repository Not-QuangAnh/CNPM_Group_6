# GoBus – Ứng dụng tìm tuyến xe buýt
### Backend: Python/Flask + SQL Server · Có đăng nhập khách hàng & quản trị viên · Bản đồ Google Maps thời gian thực

```
gobus_py/
├── requirements.txt
├── .env.example              ← Sao chép thành .env rồi điền thông tin
├── database/
│   ├── schema.sql             ← Tạo bảng (gồm cả Users, Admins)
│   └── seed_data.sql          ← Dữ liệu mẫu
├── server/
│   ├── server.py              ← Backend Flask: REST API + xác thực (session)
│   ├── db.py                  ← Kết nối SQL Server (pyodbc)
│   ├── repository.py          ← Truy vấn SQL + xử lý mật khẩu (hash)
│   ├── init_db.py             ← Tạo bảng + dữ liệu mẫu + tài khoản admin mặc định
│   └── data/db.json           ← Chỉ tham khảo, KHÔNG dùng khi chạy server
└── public/
    ├── index.html              (trang khách hàng — có đăng nhập/đăng ký)
    ├── admin.html               (trang quản trị — yêu cầu đăng nhập admin)
    ├── css/style.css
    └── js/app.js
```

## Cài đặt (Bước 1–5 như trước, xem lại nếu chưa làm)

```bash
cd gobus_py
pip install -r requirements.txt
cp .env.example .env   # rồi điền thông tin SQL Server + các key bên dưới
cd server
python init_db.py       # tạo bảng + dữ liệu mẫu + tài khoản admin mặc định
python server.py
```

## 🔐 Đăng nhập

### Khách hàng (index.html)
- Vào tab **"Khác"** → **"Đăng nhập / Đăng ký"** để tạo tài khoản hoặc đăng nhập.
- Đặt vé/mua thẻ tháng **không bắt buộc đăng nhập** (vẫn đặt được như khách vãng lai), nhưng nếu đã đăng nhập, vé sẽ tự động gắn với tài khoản của bạn (lưu trong SQL Server, bảng `Bookings`/`Passes` có cột `user_id`).
- Mật khẩu được **mã hoá (hash)** bằng `werkzeug.security`, không lưu dạng chữ thường trong database.

### Quản trị viên (admin.html)
- Truy cập `admin.html` sẽ gặp **màn hình đăng nhập bắt buộc** trước khi vào được dashboard.
- Tài khoản admin mặc định (được tạo tự động khi chạy `init_db.py`):
  ```
  Email:    admin@gobus.vn
  Mật khẩu: Admin@123
  ```
  **Đổi mật khẩu này nếu triển khai thật** (hiện chưa có màn hình đổi mật khẩu trong UI — có thể cập nhật trực tiếp trong bảng `Admins` qua SSMS, hoặc nhờ mình thêm tính năng đổi mật khẩu).
- Tất cả API quản trị (thêm/sửa/xóa tuyến, đổi trạng thái vé, quản lý tài xế, khuyến mãi...) đều **yêu cầu đăng nhập admin** — gọi mà chưa đăng nhập sẽ bị từ chối (lỗi 401).
- Danh sách toàn bộ vé/thẻ tháng/tài xế (`GET /api/bookings`, `/api/passes`, `/api/drivers`) cũng chỉ admin xem được, không public.

## 🗺️ Bản đồ Google Maps thời gian thực

Bản đồ (màn hình **Chi tiết tuyến** và **Theo dõi xe**) giờ dùng **Google Maps** thật thay vì OpenStreetMap/Leaflet trước đây.

### Bắt buộc: lấy Google Maps API Key
1. Vào https://console.cloud.google.com/google/maps-apis/credentials
2. Tạo project (nếu chưa có) → Bật **"Maps JavaScript API"**
3. Tạo API Key (mục Credentials → Create Credentials → API Key)
4. Dán key vào file `.env`:
   ```
   GOOGLE_MAPS_API_KEY=AIzaSy...key-cua-ban...
   ```
5. Khởi động lại `python server.py`

**Lưu ý về chi phí:** Google Maps JavaScript API có gói miễn phí hàng tháng (thường đủ dùng cho demo/dev), nhưng cần **bật billing** (thẻ tín dụng) trên Google Cloud project thì mới lấy được key hoạt động — đây là yêu cầu từ phía Google, không phải giới hạn của code.

**Bảo mật key:** Key này sẽ lộ ra ở phía trình duyệt (là điều bình thường với Maps JS API). Để an toàn, vào Google Cloud Console → API Key → **Application restrictions** → giới hạn theo domain (HTTP referrer) khi triển khai thật, tránh người khác dùng ké key của bạn.

Nếu chưa điền key, khung bản đồ sẽ hiện thông báo rõ ràng "Chưa cấu hình Google Maps API Key..." thay vì lỗi khó hiểu.

### Tính năng bản đồ
- **Chi tiết tuyến**: hiển thị toàn bộ lộ trình + các trạm dừng trên Google Maps, bấm vào trạm xem tên.
- **Theo dõi xe**: icon 🚌 di chuyển mượt mà, liên tục nội suy vị trí giữa các trạm theo thời gian thực (cập nhật ~60ms/lần) trên nền bản đồ Google Maps thật.

## API mới (Xác thực)

| Method | Endpoint | Ai gọi được | Chức năng |
|---|---|---|---|
| POST | `/api/auth/register` | Ai cũng gọi được | Đăng ký tài khoản khách hàng |
| POST | `/api/auth/login` | Ai cũng gọi được | Đăng nhập khách hàng |
| POST | `/api/auth/logout` | Đã đăng nhập | Đăng xuất khách hàng |
| GET | `/api/auth/me` | Đã đăng nhập | Lấy thông tin tài khoản hiện tại |
| GET | `/api/my-bookings`, `/api/my-passes` | Đã đăng nhập | Vé/thẻ của riêng tài khoản |
| POST | `/api/auth/admin-login` | Ai cũng gọi được | Đăng nhập quản trị viên |
| POST | `/api/auth/admin-logout` | Đã đăng nhập admin | Đăng xuất quản trị viên |
| GET | `/api/auth/admin-me` | Đã đăng nhập admin | Lấy thông tin admin hiện tại |
| GET | `/api/maps-key` | Ai cũng gọi được | Lấy Google Maps API Key cho frontend |

Các API tuyến/vé/thẻ/tài xế/khuyến mãi giữ nguyên đường dẫn như trước, nhưng giờ các thao tác **ghi** (POST/PUT/PATCH/DELETE) và **đọc danh sách vé/thẻ/tài xế** đều yêu cầu đăng nhập admin.

## Ghi chú kiểm thử

Sandbox của mình không có SQL Server thật và không có Google Maps API Key thật, nhưng mình đã:
- **Test toàn bộ luồng đăng nhập/đăng ký/phân quyền** bằng Flask test client với 10 kịch bản (đăng ký, đăng ký trùng email, đăng nhập sai/đúng mật khẩu, phiên đăng nhập, chặn API quản trị khi chưa đăng nhập, đăng nhập admin sai/đúng...) — **tất cả đều pass**.
- Chạy server thật, xác nhận `/api/maps-key` trả đúng key từ `.env`, `index.html`/`admin.html` không còn tham chiếu Leaflet, `app.js` chứa đúng đoạn tải Google Maps JS API.
- Kiểm tra cú pháp toàn bộ file Python và JavaScript không lỗi.

Phần bạn cần tự xác nhận: (1) chạy `init_db.py` với SQL Server thật để tạo bảng Users/Admins, (2) đăng nhập thử bằng tài khoản admin mặc định, (3) điền Google Maps API Key thật và xem bản đồ hiển thị đúng. Có lỗi gì gửi lại mình hỗ trợ tiếp.
