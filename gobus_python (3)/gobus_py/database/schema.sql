-- ============================================================
-- GoBus – Schema SQL Server
-- Chạy file này trên database của bạn trước (vd: GoBusDB) để tạo bảng.
-- Có thể chạy trong SQL Server Management Studio (SSMS) hoặc:
--   sqlcmd -S <server> -d GoBusDB -i database/schema.sql
-- ============================================================

IF OBJECT_ID('dbo.RouteStops', 'U') IS NOT NULL DROP TABLE dbo.RouteStops;
IF OBJECT_ID('dbo.Routes', 'U') IS NOT NULL DROP TABLE dbo.Routes;
IF OBJECT_ID('dbo.Bookings', 'U') IS NOT NULL DROP TABLE dbo.Bookings;
IF OBJECT_ID('dbo.Passes', 'U') IS NOT NULL DROP TABLE dbo.Passes;
IF OBJECT_ID('dbo.Drivers', 'U') IS NOT NULL DROP TABLE dbo.Drivers;
IF OBJECT_ID('dbo.Promos', 'U') IS NOT NULL DROP TABLE dbo.Promos;
IF OBJECT_ID('dbo.Users', 'U') IS NOT NULL DROP TABLE dbo.Users;
IF OBJECT_ID('dbo.Admins', 'U') IS NOT NULL DROP TABLE dbo.Admins;
GO

-- Tài khoản khách hàng
CREATE TABLE dbo.Users (
    id             NVARCHAR(20)  NOT NULL PRIMARY KEY,
    name           NVARCHAR(200) NOT NULL,
    email          NVARCHAR(200) NOT NULL UNIQUE,
    phone          NVARCHAR(20)  NULL,
    password_hash  NVARCHAR(255) NOT NULL,
    created_at     DATETIME      NOT NULL DEFAULT GETDATE()
);
GO

-- Tài khoản quản trị viên (tách riêng khỏi khách hàng)
CREATE TABLE dbo.Admins (
    id             NVARCHAR(20)  NOT NULL PRIMARY KEY,
    name           NVARCHAR(200) NOT NULL,
    email          NVARCHAR(200) NOT NULL UNIQUE,
    password_hash  NVARCHAR(255) NOT NULL,
    role           NVARCHAR(20)  NOT NULL DEFAULT 'admin',
    created_at     DATETIME      NOT NULL DEFAULT GETDATE()
);
GO

-- Tuyến xe buýt
CREATE TABLE dbo.Routes (
    id          NVARCHAR(20)  NOT NULL PRIMARY KEY,
    code        NVARCHAR(10)  NOT NULL,
    name        NVARCHAR(200) NOT NULL,
    type        NVARCHAR(20)  NOT NULL,   -- 'electric' | 'regular'
    price       INT           NOT NULL,
    frequency   INT           NOT NULL,   -- phút / chuyến
    hour_start  NVARCHAR(5)   NOT NULL,   -- '05:00'
    hour_end    NVARCHAR(5)   NOT NULL,   -- '22:00'
    color       NVARCHAR(10)  NOT NULL
);
GO

-- Trạm dừng của từng tuyến (1-n)
CREATE TABLE dbo.RouteStops (
    id          INT IDENTITY(1,1) PRIMARY KEY,
    route_id    NVARCHAR(20)  NOT NULL,
    seq         INT           NOT NULL,   -- thứ tự trạm trong tuyến
    name        NVARCHAR(200) NOT NULL,
    t           INT           NOT NULL,   -- số phút kể từ điểm đầu
    lat         FLOAT         NULL,
    lng         FLOAT         NULL,
    CONSTRAINT FK_RouteStops_Routes FOREIGN KEY (route_id) REFERENCES dbo.Routes(id) ON DELETE CASCADE
);
GO

-- Vé lượt đã đặt
CREATE TABLE dbo.Bookings (
    id               NVARCHAR(20)  NOT NULL PRIMARY KEY,
    user_id          NVARCHAR(20)  NULL,   -- NULL nếu khách đặt vé không đăng nhập
    route_code       NVARCHAR(10)  NOT NULL,
    customer         NVARCHAR(200) NOT NULL,
    booking_date     NVARCHAR(20)  NOT NULL,   -- 'dd/MM/yyyy'
    booking_time     NVARCHAR(10)  NOT NULL,   -- 'HH:mm'
    passenger_count  INT           NOT NULL,
    total            INT           NOT NULL,
    status           NVARCHAR(20)  NOT NULL DEFAULT 'confirmed',
    CONSTRAINT FK_Bookings_Users FOREIGN KEY (user_id) REFERENCES dbo.Users(id)
);
GO

-- Thẻ tháng
CREATE TABLE dbo.Passes (
    id             NVARCHAR(20)  NOT NULL PRIMARY KEY,
    user_id        NVARCHAR(20)  NULL,
    route_code     NVARCHAR(10)  NOT NULL,
    customer       NVARCHAR(200) NOT NULL,
    plan_label     NVARCHAR(50)  NOT NULL,
    purchase_date  NVARCHAR(20)  NOT NULL,
    expiry         NVARCHAR(20)  NOT NULL,
    total          INT           NOT NULL,
    status         NVARCHAR(20)  NOT NULL DEFAULT 'active',
    CONSTRAINT FK_Passes_Users FOREIGN KEY (user_id) REFERENCES dbo.Users(id)
);
GO

-- Tài xế
CREATE TABLE dbo.Drivers (
    id          NVARCHAR(20)  NOT NULL PRIMARY KEY,
    name        NVARCHAR(200) NOT NULL,
    phone       NVARCHAR(20)  NOT NULL,
    route_code  NVARCHAR(10)  NULL,
    vehicle     NVARCHAR(20)  NULL,
    status      NVARCHAR(20)  NOT NULL DEFAULT 'off_duty',  -- on_duty | off_duty | maintenance
    rating      FLOAT         NOT NULL DEFAULT 5
);
GO

-- Mã khuyến mãi (quản lý bởi admin)
CREATE TABLE dbo.Promos (
    id            NVARCHAR(20)  NOT NULL PRIMARY KEY,
    code          NVARCHAR(30)  NOT NULL UNIQUE,
    description   NVARCHAR(300) NOT NULL,
    discount      NVARCHAR(20)  NOT NULL,   -- ví dụ '10%' hoặc '5.000đ'
    uses          INT           NOT NULL DEFAULT 0,
    usage_limit   INT           NOT NULL DEFAULT 100,
    expiry        NVARCHAR(20)  NOT NULL,
    status        NVARCHAR(20)  NOT NULL DEFAULT 'active'
);
GO
