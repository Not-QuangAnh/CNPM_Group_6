-- ============================================================
-- GoBus – Dữ liệu mẫu (seed data)
-- Chạy SAU khi đã chạy schema.sql, trên cùng database.
-- ============================================================

-- Tuyến xe & trạm dừng
INSERT INTO dbo.Routes (id, code, name, type, price, frequency, hour_start, hour_end, color) VALUES (N'e03', N'E03', N'Vinhomes Ocean Park 1 – Long Biên', N'electric', 9000, 15, N'05:00', N'22:00', N'#1FAE7C');
INSERT INTO dbo.RouteStops (route_id, seq, name, t, lat, lng) VALUES (N'e03', 0, N'Vinhomes Ocean Park 1', 0, 20.993, 105.933);
INSERT INTO dbo.RouteStops (route_id, seq, name, t, lat, lng) VALUES (N'e03', 1, N'Vinhomes Ocean Park 3', 9, 20.985, 105.943);
INSERT INTO dbo.RouteStops (route_id, seq, name, t, lat, lng) VALUES (N'e03', 2, N'Cầu Vĩnh Tuy', 24, 21.008, 105.879);
INSERT INTO dbo.RouteStops (route_id, seq, name, t, lat, lng) VALUES (N'e03', 3, N'Long Biên', 38, 21.0378, 105.8611);
INSERT INTO dbo.Routes (id, code, name, type, price, frequency, hour_start, hour_end, color) VALUES (N'e05', N'E05', N'Vinhomes Smart City – Hồ Gươm', N'electric', 9000, 20, N'05:30', N'22:30', N'#1FAE7C');
INSERT INTO dbo.RouteStops (route_id, seq, name, t, lat, lng) VALUES (N'e05', 0, N'Vinhomes Smart City', 0, 21.014, 105.737);
INSERT INTO dbo.RouteStops (route_id, seq, name, t, lat, lng) VALUES (N'e05', 1, N'Cầu Giấy', 17, 21.0325, 105.7935);
INSERT INTO dbo.RouteStops (route_id, seq, name, t, lat, lng) VALUES (N'e05', 2, N'Kim Mã', 27, 21.0323, 105.8151);
INSERT INTO dbo.RouteStops (route_id, seq, name, t, lat, lng) VALUES (N'e05', 3, N'Hồ Gươm', 40, 21.0285, 105.8542);
INSERT INTO dbo.Routes (id, code, name, type, price, frequency, hour_start, hour_end, color) VALUES (N'09a', N'09A', N'Hồ Gươm – Hồ Tây – Cầu Giấy', N'regular', 7000, 10, N'05:00', N'21:00', N'#3C7CD9');
INSERT INTO dbo.RouteStops (route_id, seq, name, t, lat, lng) VALUES (N'09a', 0, N'Hồ Gươm', 0, 21.0285, 105.8542);
INSERT INTO dbo.RouteStops (route_id, seq, name, t, lat, lng) VALUES (N'09a', 1, N'Hồ Tây', 14, 21.0578, 105.8194);
INSERT INTO dbo.RouteStops (route_id, seq, name, t, lat, lng) VALUES (N'09a', 2, N'Bưởi', 24, 21.0483, 105.8095);
INSERT INTO dbo.RouteStops (route_id, seq, name, t, lat, lng) VALUES (N'09a', 3, N'Cầu Giấy', 34, 21.0325, 105.7935);
INSERT INTO dbo.Routes (id, code, name, type, price, frequency, hour_start, hour_end, color) VALUES (N'e09', N'E09', N'Vinhomes Ocean Park 1 – Aeon Mall Long Biên', N'electric', 8000, 15, N'05:00', N'22:00', N'#1FAE7C');
INSERT INTO dbo.RouteStops (route_id, seq, name, t, lat, lng) VALUES (N'e09', 0, N'Vinhomes Ocean Park 1', 0, 20.993, 105.933);
INSERT INTO dbo.RouteStops (route_id, seq, name, t, lat, lng) VALUES (N'e09', 1, N'Vinhomes Ocean Park 2', 6, 20.988, 105.938);
INSERT INTO dbo.RouteStops (route_id, seq, name, t, lat, lng) VALUES (N'e09', 2, N'Đa Tốn', 13, 20.98, 105.915);
INSERT INTO dbo.RouteStops (route_id, seq, name, t, lat, lng) VALUES (N'e09', 3, N'Aeon Mall Long Biên', 21, 21.0453, 105.889);
INSERT INTO dbo.Routes (id, code, name, type, price, frequency, hour_start, hour_end, color) VALUES (N'32', N'32', N'Nhổn – Cầu Giấy – Giáp Bát', N'regular', 7000, 12, N'05:00', N'21:30', N'#3C7CD9');
INSERT INTO dbo.RouteStops (route_id, seq, name, t, lat, lng) VALUES (N'32', 0, N'Nhổn', 0, 21.0796, 105.7332);
INSERT INTO dbo.RouteStops (route_id, seq, name, t, lat, lng) VALUES (N'32', 1, N'Cầu Giấy', 19, 21.0325, 105.7935);
INSERT INTO dbo.RouteStops (route_id, seq, name, t, lat, lng) VALUES (N'32', 2, N'Kim Mã', 29, 21.0323, 105.8151);
INSERT INTO dbo.RouteStops (route_id, seq, name, t, lat, lng) VALUES (N'32', 3, N'Bến xe Giáp Bát', 54, 20.9757, 105.8412);

-- Vé lượt
INSERT INTO dbo.Bookings (id, route_code, customer, booking_date, booking_time, passenger_count, total, status) VALUES (N'GB7F3K2A', N'E03', N'Nguyễn Văn An', N'17/06/2026', N'07:15', 2, 18000, N'confirmed');
INSERT INTO dbo.Bookings (id, route_code, customer, booking_date, booking_time, passenger_count, total, status) VALUES (N'GB2H9L4D', N'E05', N'Trần Thị Bình', N'17/06/2026', N'08:00', 1, 9000, N'used');
INSERT INTO dbo.Bookings (id, route_code, customer, booking_date, booking_time, passenger_count, total, status) VALUES (N'GB5K1M8P', N'09A', N'Lê Hoàng Cường', N'16/06/2026', N'17:30', 3, 21000, N'used');
INSERT INTO dbo.Bookings (id, route_code, customer, booking_date, booking_time, passenger_count, total, status) VALUES (N'GB9Q3N2R', N'E09', N'Phạm Thị Dung', N'18/06/2026', N'09:10', 1, 8000, N'confirmed');
INSERT INTO dbo.Bookings (id, route_code, customer, booking_date, booking_time, passenger_count, total, status) VALUES (N'GB4T7V1X', N'32', N'Hoàng Văn Em', N'15/06/2026', N'06:45', 2, 14000, N'cancelled');
INSERT INTO dbo.Bookings (id, route_code, customer, booking_date, booking_time, passenger_count, total, status) VALUES (N'GB6W2Y9Z', N'E03', N'Vũ Thị Hoa', N'18/06/2026', N'12:00', 4, 36000, N'confirmed');

-- Thẻ tháng
INSERT INTO dbo.Passes (id, route_code, customer, plan_label, purchase_date, expiry, total, status) VALUES (N'GB3G6H9J', N'E03', N'Nguyễn Văn An', N'3 tháng', N'01/05/2026', N'01/08/2026', 540000, N'active');
INSERT INTO dbo.Passes (id, route_code, customer, plan_label, purchase_date, expiry, total, status) VALUES (N'GB5K8L2M', N'E05', N'Trần Thị Bình', N'1 tháng', N'01/06/2026', N'01/07/2026', 200000, N'active');
INSERT INTO dbo.Passes (id, route_code, customer, plan_label, purchase_date, expiry, total, status) VALUES (N'GB9R3S6T', N'E09', N'Phạm Thị Dung', N'1 tháng', N'01/03/2026', N'01/04/2026', 200000, N'expired');

-- Tài xế
INSERT INTO dbo.Drivers (id, name, phone, route_code, vehicle, status, rating) VALUES (N'D001', N'Trần Văn Bình', N'0912 345 678', N'E03', N'51B-123.45', N'on_duty', 4.8);
INSERT INTO dbo.Drivers (id, name, phone, route_code, vehicle, status, rating) VALUES (N'D002', N'Nguyễn Thị Cúc', N'0987 654 321', N'E05', N'51B-678.90', N'on_duty', 4.9);
INSERT INTO dbo.Drivers (id, name, phone, route_code, vehicle, status, rating) VALUES (N'D003', N'Lê Hoàng Dũng', N'0934 111 222', N'09A', N'51B-246.80', N'off_duty', 4.7);
INSERT INTO dbo.Drivers (id, name, phone, route_code, vehicle, status, rating) VALUES (N'D004', N'Phạm Văn Đức', N'0978 333 444', N'E09', N'51B-135.79', N'on_duty', 4.6);
INSERT INTO dbo.Drivers (id, name, phone, route_code, vehicle, status, rating) VALUES (N'D005', N'Vũ Thị Hằng', N'0901 555 666', N'32', N'51B-357.91', N'maintenance', 4.5);

-- Mã khuyến mãi
INSERT INTO dbo.Promos (id, code, description, discount, uses, usage_limit, expiry, status) VALUES (N'P001', N'GOBUS10', N'Giảm 10% tất cả vé lượt', N'10%', 142, 500, N'31/07/2026', N'active');
INSERT INTO dbo.Promos (id, code, description, discount, uses, usage_limit, expiry, status) VALUES (N'P002', N'BUYT2026', N'Giảm 5.000đ mỗi vé', N'5.000đ', 89, 200, N'30/06/2026', N'active');
INSERT INTO dbo.Promos (id, code, description, discount, uses, usage_limit, expiry, status) VALUES (N'P003', N'GOGREEN', N'Giảm 15% vé buýt điện', N'15%', 200, 200, N'15/06/2026', N'expired');
