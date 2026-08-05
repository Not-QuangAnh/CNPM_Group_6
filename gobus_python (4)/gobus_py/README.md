# GoBus – Ứng dụng tìm tuyến xe buýt
### Backend: Python/Flask + SQL Server · Có đăng nhập khách hàng & quản trị viên · Bản đồ Google Maps thời gian thực

## Cấu trúc thư mục

```
gobus_py/
├── requirements.txt            ← Dependencies bắt buộc
├── requirements-dev.txt        ← Chỉ cần khi chạy kiểm thử (pytest)
├── pytest.ini
├── .env                        ← Cấu hình kết nối (tạo từ .env.example)
├── .env.example                ← Mẫu file cấu hình
├── database/
│   ├── schema.sql              ← Script tạo bảng
│   └── seed_data.sql           ← Dữ liệu mẫu
├── server/
│   ├── server.py               ← Backend Flask: REST API + xác thực (session)
│   ├── db.py                   ← Kết nối SQL Server (pyodbc)
│   ├── repository.py           ← Truy vấn SQL + xử lý mật khẩu (hash)
│   ├── init_db.py              ← Script khởi tạo database (tạo bảng + dữ liệu mẫu + admin)
│   └── data/db.json            ← Chỉ tham khảo, KHÔNG dùng khi chạy server
├── tests/                      ← Bộ kiểm thử tự động (pytest)
│   ├── conftest.py
│   ├── fake_repo.py
│   ├── test_auth_customer.py
│   ├── test_admin_authorization.py
│   ├── test_routes_and_bookings.py
│   ├── test_admin_password.py
│   └── test_promos.py
└── public/
    ├── index.html              ← Trang khách hàng (có đăng nhập/đăng ký)
    ├── admin.html              ← Trang quản trị (yêu cầu đăng nhập admin)
    ├── css/style.css
    └── js/app.js
```

---

## 🚀 Cách chạy ứng dụng (từ đầu)

### Yêu cầu hệ thống
- **Python** 3.8 trở lên
- **SQL Server** đang chạy (phiên bản Developer, Express, hoặc bất kỳ)
- **ODBC Driver 17/18 for SQL Server** (kiểm tra bằng lệnh `python -c "import pyodbc; print(pyodbc.drivers())"`)
- **pip** (Python package manager)

> **QUAN TRỌNG:** Tất cả các lệnh bên dưới đều chạy với **Working Directory là thư mục `gobus_py/`**, trừ khi có ghi chú khác.

### Bước 1: Mở terminal tại thư mục `gobus_py`

```bash
cd đường_dẫn_tới/gobus_py
```

Ví dụ:
```bash
cd C:\Users\Chu Minh Bach\Downloads\gobus_python (4)\gobus_py
```

### Bước 2: Cài đặt dependencies

```bash
pip install -r requirements.txt
```

### Bước 3: Tạo file .env

Sao chép file `.env.example` thành `.env`:

```bash
copy .env.example .env
```

Sau đó mở file `.env` và điều chỉnh thông tin cho phù hợp với SQL Server của bạn.

> **Trên Windows (dùng Windows Authentication):** Nếu SQL Server chạy local và bạn dùng tài khoản Windows hiện tại để đăng nhập, set:
> ```
> DB_TRUSTED_CONNECTION=yes
> ```
> (Không cần điền DB_USER và DB_PASSWORD)

> **Dùng SQL Server Authentication (username/password):**
> ```
> DB_TRUSTED_CONNECTION=no
> DB_USER=sa
> DB_PASSWORD=mật_khẩu_của_bạn
> ```

### Bước 4: Kiểm tra kết nối SQL Server

Chạy lệnh sau để kiểm tra kết nối đến SQL Server:

```bash
python -c "
import pyodbc
conn = pyodbc.connect(
    'DRIVER={ODBC Driver 17 for SQL Server};SERVER=localhost;Trusted_Connection=yes;TrustServerCertificate=yes',
    timeout=5
)
print('Kết nối SQL Server thành công!')
conn.close()
"
```

> Nếu dùng SQL Server Authentication, thay `Trusted_Connection=yes` bằng `UID=sa;PWD=mật_khẩu`.

### Bước 5: Tạo database (nếu chưa có)

Kết nối đến SQL Server (dùng SSMS, Azure Data Studio, hoặc dòng lệnh) và chạy:

```sql
CREATE DATABASE GoBusDB;
```

Hoặc kiểm tra database đã tồn tại chưa:

```bash
python -c "
import pyodbc
conn = pyodbc.connect('DRIVER={ODBC Driver 17 for SQL Server};SERVER=localhost;Trusted_Connection=yes;TrustServerCertificate=yes', timeout=5)
cur = conn.cursor()
cur.execute(\"SELECT name FROM sys.databases WHERE name='GoBusDB'\")
print('Database tồn tại' if cur.fetchone() else 'Chưa có database, hãy tạo bằng: CREATE DATABASE GoBusDB')
conn.close()
"
```

### Bước 6: Khởi tạo database (tạo bảng + dữ liệu mẫu + tài khoản admin)

> **Chú ý:** File `.env` PHẢI nằm ở thư mục `gobus_py/` (thư mục hiện tại). Script `init_db.py` sẽ tự động đọc `.env` từ đó.

```bash
python server/init_db.py
```

Kết quả mong đợi:
```
Đang kết nối SQL Server...
Kết nối thành công. Đang tạo bảng (schema.sql)...
Đang nạp dữ liệu mẫu (seed_data.sql)...
Đang tạo tài khoản admin mặc định...
✔ Hoàn tất! Database đã sẵn sàng, có thể chạy: python server/server.py
  Đăng nhập admin tại /admin.html bằng: admin@gobus.vn / Admin@123
```

### Bước 7: Chạy server

```bash
python server/server.py
```

Server sẽ chạy tại: **http://localhost:3000**

### Bước 8: Mở trình duyệt

- **Trang khách hàng:** http://localhost:3000/index.html
- **Trang quản trị:** http://localhost:3000/admin.html

---

## 🖥️ Hướng dẫn nhanh (khi đã cài đặt xong)

Mỗi lần muốn chạy lại, chỉ cần 2 bước:

```bash
cd đường_dẫn_tới/gobus_py
python server/server.py
```

Sau đó mở http://localhost:3000 trên trình duyệt.

---

## 🔐 Đăng nhập

### Khách hàng (index.html)
- Vào tab **"Khác"** → **"Đăng nhập / Đăng ký"** để tạo tài khoản hoặc đăng nhập.
- Đặt vé/mua thẻ tháng **không bắt buộc đăng nhập** (vẫn đặt được như khách vãng lai), nhưng nếu đã đăng nhập, vé sẽ tự động gắn với tài khoản của bạn.
- Mật khẩu được **mã hoá (hash)** bằng `werkzeug.security`.

### Quản trị viên (admin.html)
- Truy cập `admin.html` sẽ gặp **màn hình đăng nhập bắt buộc** trước khi vào dashboard.
- Tài khoản admin mặc định (tạo tự động khi chạy `init_db.py`):
  ```
  Email:    admin@gobus.vn
  Mật khẩu: Admin@123
  ```
- **Nên đổi mật khẩu này ngay sau lần đăng nhập đầu tiên nếu triển khai thật** — vào **admin.html → Cài đặt** để đổi.
- Tất cả API quản trị (thêm/sửa/xóa tuyến, đổi trạng thái vé, quản lý tài xế, khuyến mãi...) đều **yêu cầu đăng nhập admin**.

---

## 🗺️ Bản đồ Google Maps thời gian thực

Bản đồ (màn hình **Chi tiết tuyến** và **Theo dõi xe**) dùng **Google Maps** thay vì OpenStreetMap/Leaflet.

### Cấu hình Google Maps API Key
1. Vào https://console.cloud.google.com/google/maps-apis/credentials
2. Tạo project (nếu chưa có) → Bật **"Maps JavaScript API"**
3. Tạo API Key (Credentials → Create Credentials → API Key)
4. Dán key vào file `.env`:
   ```
   GOOGLE_MAPS_API_KEY=AIzaSy...key-cua-ban...
   ```
5. Khởi động lại server (`python server/server.py`)

> **Lưu ý:** Google Maps JavaScript API có gói miễn phí hàng tháng, nhưng cần **bật billing** (thẻ tín dụng) trên Google Cloud.

> **Bảo mật key:** Vào Google Cloud Console → API Key → **Application restrictions** → giới hạn theo domain (HTTP referrer) khi triển khai thật.

Nếu chưa điền key, khung bản đồ sẽ hiện thông báo "Chưa cấu hình Google Maps API Key..." thay vì lỗi.

---

## ✅ Chạy bộ kiểm thử (pytest)

Test **không cần SQL Server thật** (dùng `fake_repo.py` mô phỏng trong bộ nhớ).

```bash
cd gobus_py
pip install -r requirements.txt -r requirements-dev.txt
pytest -v
```

Kết quả: 28 kịch bản kiểm thử cho toàn bộ API.

---

## API endpoints chính

| Method | Endpoint | Ai gọi được | Chức năng |
|---|---|---|---|
| POST | `/api/auth/register` | Ai cũng gọi được | Đăng ký tài khoản khách hàng |
| POST | `/api/auth/login` | Ai cũng gọi được | Đăng nhập khách hàng |
| POST | `/api/auth/logout` | Đã đăng nhập | Đăng xuất khách hàng |
| GET | `/api/auth/me` | Đã đăng nhập | Thông tin tài khoản hiện tại |
| GET | `/api/my-bookings`, `/api/my-passes` | Đã đăng nhập | Vé/thẻ của tài khoản |
| POST | `/api/auth/admin-login` | Ai cũng gọi được | Đăng nhập quản trị viên |
| POST | `/api/auth/admin-logout` | Đã đăng nhập admin | Đăng xuất admin |
| GET | `/api/auth/admin-me` | Đã đăng nhập admin | Thông tin admin hiện tại |
| PATCH | `/api/auth/admin-password` | Đã đăng nhập admin | Đổi mật khẩu admin |
| GET | `/api/maps-key` | Ai cũng gọi được | Lấy Google Maps API Key |

## Xử lý sự cố thường gặp

| Lỗi | Nguyên nhân | Cách khắc phục |
|---|---|---|
| `pyodbc.InterfaceError: ... driver not found` | Thiếu ODBC Driver | Cài đặt "ODBC Driver 17/18 for SQL Server" từ Microsoft |
| `Cannot open database "GoBusDB"` | Chưa tạo database | Chạy `CREATE DATABASE GoBusDB` trong SQL Server |
| `Login failed for user` | Sai thông tin đăng nhập | Kiểm tra DB_USER, DB_PASSWORD trong `.env` hoặc dùng Windows Authentication |
| Port 3000 đã được sử dụng | Có ứng dụng khác đang chạy | Đổi PORT trong `.env` (ví dụ: PORT=3001) hoặc tắt ứng dụng kia |
| `KeyError: 'password_hash'` hoặc lỗi đăng nhập | Chưa chạy `init_db.py` | Chạy `python server/init_db.py` để tạo bảng và dữ liệu mẫu |
| Server không đọc được `.env` | Sai vị trí file `.env` | File `.env` phải nằm trong thư mục `gobus_py/` (cùng cấp với thư mục `server/`) |