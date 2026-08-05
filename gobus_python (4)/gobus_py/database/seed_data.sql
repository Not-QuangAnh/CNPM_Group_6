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

-- ==================== TUYẾN MỚI ====================

-- Tuyến 01: Bến xe Gia Lâm – Hồ Gươm – Bến xe Mỹ Đình
INSERT INTO dbo.Routes (id, code, name, type, price, frequency, hour_start, hour_end, color) VALUES (N'01', N'01', N'Gia Lâm – Hồ Gươm – Mỹ Đình', N'regular', 7000, 10, N'05:00', N'22:00', N'#E0524A');
INSERT INTO dbo.RouteStops (route_id, seq, name, t, lat, lng) VALUES (N'01', 0, N'Bến xe Gia Lâm', 0, 21.0524, 105.8798);
INSERT INTO dbo.RouteStops (route_id, seq, name, t, lat, lng) VALUES (N'01', 1, N'Cầu Chương Dương', 10, 21.0363, 105.8659);
INSERT INTO dbo.RouteStops (route_id, seq, name, t, lat, lng) VALUES (N'01', 2, N'Hồ Gươm', 20, 21.0285, 105.8542);
INSERT INTO dbo.RouteStops (route_id, seq, name, t, lat, lng) VALUES (N'01', 3, N'Đại học Quốc gia', 30, 21.0342, 105.8054);
INSERT INTO dbo.RouteStops (route_id, seq, name, t, lat, lng) VALUES (N'01', 4, N'Bến xe Mỹ Đình', 45, 21.0335, 105.7818);

-- Tuyến 02: Sân bay Nội Bài – Hồ Gươm
INSERT INTO dbo.Routes (id, code, name, type, price, frequency, hour_start, hour_end, color) VALUES (N'07', N'07', N'Sân bay Nội Bài – Hồ Gươm', N'regular', 12000, 25, N'05:00', N'23:00', N'#8B5CF6');
INSERT INTO dbo.RouteStops (route_id, seq, name, t, lat, lng) VALUES (N'07', 0, N'Sân bay Nội Bài', 0, 21.2212, 105.8074);
INSERT INTO dbo.RouteStops (route_id, seq, name, t, lat, lng) VALUES (N'07', 1, N'Đông Anh', 18, 21.1428, 105.8625);
INSERT INTO dbo.RouteStops (route_id, seq, name, t, lat, lng) VALUES (N'07', 2, N'Cầu Nhật Tân', 25, 21.0854, 105.8275);
INSERT INTO dbo.RouteStops (route_id, seq, name, t, lat, lng) VALUES (N'07', 3, N'Chợ Long Biên', 38, 21.0435, 105.8619);
INSERT INTO dbo.RouteStops (route_id, seq, name, t, lat, lng) VALUES (N'07', 4, N'Hồ Gươm', 45, 21.0285, 105.8542);

-- Tuyến 03: Bến xe Yên Nghĩa – Royal City – Times City
INSERT INTO dbo.Routes (id, code, name, type, price, frequency, hour_start, hour_end, color) VALUES (N'21', N'21', N'Yên Nghĩa – Times City', N'electric', 9000, 15, N'05:30', N'22:00', N'#10B981');
INSERT INTO dbo.RouteStops (route_id, seq, name, t, lat, lng) VALUES (N'21', 0, N'Bến xe Yên Nghĩa', 0, 20.9558, 105.7628);
INSERT INTO dbo.RouteStops (route_id, seq, name, t, lat, lng) VALUES (N'21', 1, N'Royal City', 20, 20.9963, 105.8229);
INSERT INTO dbo.RouteStops (route_id, seq, name, t, lat, lng) VALUES (N'21', 2, N'Ngã Tư Sở', 28, 21.0048, 105.8306);
INSERT INTO dbo.RouteStops (route_id, seq, name, t, lat, lng) VALUES (N'21', 3, N'Bạch Mai', 35, 21.0026, 105.8496);
INSERT INTO dbo.RouteStops (route_id, seq, name, t, lat, lng) VALUES (N'21', 4, N'Times City', 42, 21.0049, 105.8624);

-- Tuyến 04: Khu đô thị Linh Đàm – Cầu Giấy – Hồ Tây
INSERT INTO dbo.Routes (id, code, name, type, price, frequency, hour_start, hour_end, color) VALUES (N'29', N'29', N'Linh Đàm – Cầu Giấy – Hồ Tây', N'regular', 7000, 12, N'05:00', N'21:30', N'#F59E0B');
INSERT INTO dbo.RouteStops (route_id, seq, name, t, lat, lng) VALUES (N'29', 0, N'KĐT Linh Đàm', 0, 20.9627, 105.8445);
INSERT INTO dbo.RouteStops (route_id, seq, name, t, lat, lng) VALUES (N'29', 1, N'Giải Phóng', 10, 20.9833, 105.8397);
INSERT INTO dbo.RouteStops (route_id, seq, name, t, lat, lng) VALUES (N'29', 2, N'Bến xe Giáp Bát', 15, 20.9757, 105.8412);
INSERT INTO dbo.RouteStops (route_id, seq, name, t, lat, lng) VALUES (N'29', 3, N'Bạch Mai', 22, 21.0026, 105.8496);
INSERT INTO dbo.RouteStops (route_id, seq, name, t, lat, lng) VALUES (N'29', 4, N'Chợ Mơ', 28, 21.0118, 105.8484);
INSERT INTO dbo.RouteStops (route_id, seq, name, t, lat, lng) VALUES (N'29', 5, N'Huỳnh Thúc Kháng', 38, 21.0288, 105.8148);
INSERT INTO dbo.RouteStops (route_id, seq, name, t, lat, lng) VALUES (N'29', 6, N'Cầu Giấy', 45, 21.0325, 105.7935);
INSERT INTO dbo.RouteStops (route_id, seq, name, t, lat, lng) VALUES (N'29', 7, N'Hồ Tây', 55, 21.0578, 105.8194);

-- Tuyến 05: Vincom Bà Triệu – BigC Thăng Long – Lotte Mall
INSERT INTO dbo.Routes (id, code, name, type, price, frequency, hour_start, hour_end, color) VALUES (N'38', N'38', N'Vincom Bà Triệu – Lotte Mall', N'electric', 8000, 20, N'06:00', N'22:00', N'#EC4899');
INSERT INTO dbo.RouteStops (route_id, seq, name, t, lat, lng) VALUES (N'38', 0, N'Vincom Bà Triệu', 0, 21.0174, 105.8507);
INSERT INTO dbo.RouteStops (route_id, seq, name, t, lat, lng) VALUES (N'38', 1, N'Đại học Bách Khoa', 7, 21.0109, 105.8426);
INSERT INTO dbo.RouteStops (route_id, seq, name, t, lat, lng) VALUES (N'38', 2, N'Chợ Mơ', 14, 21.0118, 105.8484);
INSERT INTO dbo.RouteStops (route_id, seq, name, t, lat, lng) VALUES (N'38', 3, N'BigC Thăng Long', 22, 21.0197, 105.8327);
INSERT INTO dbo.RouteStops (route_id, seq, name, t, lat, lng) VALUES (N'38', 4, N'Đại học Giao thông', 30, 21.0168, 105.8202);
INSERT INTO dbo.RouteStops (route_id, seq, name, t, lat, lng) VALUES (N'38', 5, N'Lotte Mall Hà Nội', 38, 21.0216, 105.8122);

-- Tuyến 06: Khu CN Bắc Thăng Long – Cầu Giấy – KĐT Trung Hòa Nhân Chính
INSERT INTO dbo.Routes (id, code, name, type, price, frequency, hour_start, hour_end, color) VALUES (N'53', N'53', N'KCN Bắc Thăng Long – KĐT Trung Hòa', N'regular', 8000, 15, N'05:00', N'21:00', N'#6366F1');
INSERT INTO dbo.RouteStops (route_id, seq, name, t, lat, lng) VALUES (N'53', 0, N'KCN Bắc Thăng Long', 0, 21.1647, 105.7814);
INSERT INTO dbo.RouteStops (route_id, seq, name, t, lat, lng) VALUES (N'53', 1, N'Đại học Sư phạm', 25, 21.0483, 105.8062);
INSERT INTO dbo.RouteStops (route_id, seq, name, t, lat, lng) VALUES (N'53', 2, N'Cầu Giấy', 32, 21.0325, 105.7935);
INSERT INTO dbo.RouteStops (route_id, seq, name, t, lat, lng) VALUES (N'53', 3, N'KĐT Trung Hòa Nhân Chính', 45, 21.0008, 105.8061);

-- Tuyến 07: Khu đô thị Mỹ Đình – Royal City – Bến xe Giáp Bát
INSERT INTO dbo.Routes (id, code, name, type, price, frequency, hour_start, hour_end, color) VALUES (N'60', N'60', N'Mỹ Đình – Royal City – Giáp Bát', N'electric', 9000, 18, N'05:30', N'22:30', N'#14B8A6');
INSERT INTO dbo.RouteStops (route_id, seq, name, t, lat, lng) VALUES (N'60', 0, N'KĐT Mỹ Đình', 0, 21.0276, 105.7703);
INSERT INTO dbo.RouteStops (route_id, seq, name, t, lat, lng) VALUES (N'60', 1, N'Chợ Mễ Trì', 8, 21.0194, 105.7768);
INSERT INTO dbo.RouteStops (route_id, seq, name, t, lat, lng) VALUES (N'60', 2, N'Đại học Quốc gia', 15, 21.0342, 105.8054);
INSERT INTO dbo.RouteStops (route_id, seq, name, t, lat, lng) VALUES (N'60', 3, N'Royal City', 22, 20.9963, 105.8229);
INSERT INTO dbo.RouteStops (route_id, seq, name, t, lat, lng) VALUES (N'60', 4, N'Bến xe Giáp Bát', 35, 20.9757, 105.8412);

-- Tuyến 08: Đại học Bách Khoa – Chợ Long Biên – Aeon Mall Long Biên
INSERT INTO dbo.Routes (id, code, name, type, price, frequency, hour_start, hour_end, color) VALUES (N'66', N'66', N'Bách Khoa – Aeon Mall Long Biên', N'regular', 7000, 15, N'05:30', N'22:00', N'#E0524A');
INSERT INTO dbo.RouteStops (route_id, seq, name, t, lat, lng) VALUES (N'66', 0, N'Đại học Bách Khoa', 0, 21.0109, 105.8426);
INSERT INTO dbo.RouteStops (route_id, seq, name, t, lat, lng) VALUES (N'66', 1, N'Trần Nhân Tông', 8, 21.0176, 105.8458);
INSERT INTO dbo.RouteStops (route_id, seq, name, t, lat, lng) VALUES (N'66', 2, N'Chợ Long Biên', 15, 21.0435, 105.8619);
INSERT INTO dbo.RouteStops (route_id, seq, name, t, lat, lng) VALUES (N'66', 3, N'Cầu Long Biên', 18, 21.0451, 105.8604);
INSERT INTO dbo.RouteStops (route_id, seq, name, t, lat, lng) VALUES (N'66', 4, N'Aeon Mall Long Biên', 30, 21.0453, 105.889);

-- Tuyến 09: Bến xe Mỹ Đình – Hoàng Quốc Việt – Chợ Long Biên
INSERT INTO dbo.Routes (id, code, name, type, price, frequency, hour_start, hour_end, color) VALUES (N'90', N'90', N'Mỹ Đình – Hoàng Quốc Việt – Long Biên', N'electric', 9000, 20, N'05:00', N'22:00', N'#1FAE7C');
INSERT INTO dbo.RouteStops (route_id, seq, name, t, lat, lng) VALUES (N'90', 0, N'Bến xe Mỹ Đình', 0, 21.0335, 105.7818);
INSERT INTO dbo.RouteStops (route_id, seq, name, t, lat, lng) VALUES (N'90', 1, N'Hoàng Quốc Việt', 12, 21.0459, 105.7852);
INSERT INTO dbo.RouteStops (route_id, seq, name, t, lat, lng) VALUES (N'90', 2, N'Đại học Thương Mại', 18, 21.0455, 105.7921);
INSERT INTO dbo.RouteStops (route_id, seq, name, t, lat, lng) VALUES (N'90', 3, N'Hồ Tây', 25, 21.0578, 105.8194);
INSERT INTO dbo.RouteStops (route_id, seq, name, t, lat, lng) VALUES (N'90', 4, N'Chợ Long Biên', 35, 21.0435, 105.8619);

-- Tuyến 10: KĐT Gamuda – Vinhomes Ocean Park 1
INSERT INTO dbo.Routes (id, code, name, type, price, frequency, hour_start, hour_end, color) VALUES (N'e16', N'E16', N'Gamuda – Vinhomes Ocean Park 1', N'electric', 9000, 20, N'05:30', N'22:00', N'#1FAE7C');
INSERT INTO dbo.RouteStops (route_id, seq, name, t, lat, lng) VALUES (N'e16', 0, N'KĐT Gamuda', 0, 20.9867, 105.8842);
INSERT INTO dbo.RouteStops (route_id, seq, name, t, lat, lng) VALUES (N'e16', 1, N'Chợ Đại Từ', 10, 20.9775, 105.8956);
INSERT INTO dbo.RouteStops (route_id, seq, name, t, lat, lng) VALUES (N'e16', 2, N'Đa Tốn', 18, 20.98, 105.915);
INSERT INTO dbo.RouteStops (route_id, seq, name, t, lat, lng) VALUES (N'e16', 3, N'Vinhomes Ocean Park 2', 25, 20.988, 105.938);
INSERT INTO dbo.RouteStops (route_id, seq, name, t, lat, lng) VALUES (N'e16', 4, N'Vinhomes Ocean Park 1', 30, 20.993, 105.933);

-- Tuyến 11: Bến xe Lương Yên – BigC Thăng Long – Bến xe Cầu Giấy
INSERT INTO dbo.Routes (id, code, name, type, price, frequency, hour_start, hour_end, color) VALUES (N'44', N'44', N'Lương Yên – Cầu Giấy (qua BigC)', N'regular', 7000, 12, N'05:00', N'21:30', N'#3C7CD9');
INSERT INTO dbo.RouteStops (route_id, seq, name, t, lat, lng) VALUES (N'44', 0, N'Bến xe Lương Yên', 0, 21.0288, 105.8577);
INSERT INTO dbo.RouteStops (route_id, seq, name, t, lat, lng) VALUES (N'44', 1, N'Trần Hưng Đạo', 8, 21.021, 105.8461);
INSERT INTO dbo.RouteStops (route_id, seq, name, t, lat, lng) VALUES (N'44', 2, N'BigC Thăng Long', 16, 21.0197, 105.8327);
INSERT INTO dbo.RouteStops (route_id, seq, name, t, lat, lng) VALUES (N'44', 3, N'Chùa Bộc', 24, 21.0119, 105.8313);
INSERT INTO dbo.RouteStops (route_id, seq, name, t, lat, lng) VALUES (N'44', 4, N'Bến xe Cầu Giấy', 35, 21.0299, 105.7982);

-- Tuyến 12: Ecopark – Văn Giang – Hồ Gươm
INSERT INTO dbo.Routes (id, code, name, type, price, frequency, hour_start, hour_end, color) VALUES (N'e10', N'E10', N'Ecopark – Hồ Gươm', N'electric', 10000, 30, N'05:00', N'22:00', N'#1FAE7C');
INSERT INTO dbo.RouteStops (route_id, seq, name, t, lat, lng) VALUES (N'e10', 0, N'Ecopark', 0, 20.9488, 105.9247);
INSERT INTO dbo.RouteStops (route_id, seq, name, t, lat, lng) VALUES (N'e10', 1, N'Văn Giang', 10, 20.9372, 105.9191);
INSERT INTO dbo.RouteStops (route_id, seq, name, t, lat, lng) VALUES (N'e10', 2, N'Cầu Thanh Trì', 22, 20.9833, 105.882);
INSERT INTO dbo.RouteStops (route_id, seq, name, t, lat, lng) VALUES (N'e10', 3, N'KĐT Linh Đàm', 30, 20.9627, 105.8445);
INSERT INTO dbo.RouteStops (route_id, seq, name, t, lat, lng) VALUES (N'e10', 4, N'Hồ Gươm', 50, 21.0285, 105.8542);

-- Vé lượt (mở rộng)
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

-- Tài xế (mở rộng)
INSERT INTO dbo.Drivers (id, name, phone, route_code, vehicle, status, rating) VALUES (N'D001', N'Trần Văn Bình', N'0912 345 678', N'E03', N'51B-123.45', N'on_duty', 4.8);
INSERT INTO dbo.Drivers (id, name, phone, route_code, vehicle, status, rating) VALUES (N'D002', N'Nguyễn Thị Cúc', N'0987 654 321', N'E05', N'51B-678.90', N'on_duty', 4.9);
INSERT INTO dbo.Drivers (id, name, phone, route_code, vehicle, status, rating) VALUES (N'D003', N'Lê Hoàng Dũng', N'0934 111 222', N'09A', N'51B-246.80', N'off_duty', 4.7);
INSERT INTO dbo.Drivers (id, name, phone, route_code, vehicle, status, rating) VALUES (N'D004', N'Phạm Văn Đức', N'0978 333 444', N'E09', N'51B-135.79', N'on_duty', 4.6);
INSERT INTO dbo.Drivers (id, name, phone, route_code, vehicle, status, rating) VALUES (N'D005', N'Vũ Thị Hằng', N'0901 555 666', N'32', N'51B-357.91', N'maintenance', 4.5);
INSERT INTO dbo.Drivers (id, name, phone, route_code, vehicle, status, rating) VALUES (N'D006', N'Nguyễn Văn Nam', N'0918 777 888', N'01', N'51B-468.12', N'on_duty', 4.9);
INSERT INTO dbo.Drivers (id, name, phone, route_code, vehicle, status, rating) VALUES (N'D007', N'Đặng Thị Hương', N'0968 222 333', N'07', N'51B-579.24', N'on_duty', 4.7);
INSERT INTO dbo.Drivers (id, name, phone, route_code, vehicle, status, rating) VALUES (N'D008', N'Hoàng Văn Tùng', N'0903 444 555', N'21', N'51B-680.36', N'off_duty', 4.6);
INSERT INTO dbo.Drivers (id, name, phone, route_code, vehicle, status, rating) VALUES (N'D009', N'Phạm Thị Lan', N'0977 666 777', N'29', N'51B-791.48', N'on_duty', 4.8);
INSERT INTO dbo.Drivers (id, name, phone, route_code, vehicle, status, rating) VALUES (N'D010', N'Vũ Văn Hưng', N'0915 888 999', N'E10', N'51B-802.50', N'on_duty', 4.5);

-- Mã khuyến mãi
INSERT INTO dbo.Promos (id, code, description, discount, uses, usage_limit, expiry, status) VALUES (N'P001', N'GOBUS10', N'Giảm 10% tất cả vé lượt', N'10%', 142, 500, N'31/07/2026', N'active');
INSERT INTO dbo.Promos (id, code, description, discount, uses, usage_limit, expiry, status) VALUES (N'P002', N'BUYT2026', N'Giảm 5.000đ mỗi vé', N'5.000đ', 89, 200, N'30/06/2026', N'active');
INSERT INTO dbo.Promos (id, code, description, discount, uses, usage_limit, expiry, status) VALUES (N'P003', N'GOGREEN', N'Giảm 15% vé buýt điện', N'15%', 200, 200, N'15/06/2026', N'expired');
INSERT INTO dbo.Promos (id, code, description, discount, uses, usage_limit, expiry, status) VALUES (N'P004', N'ECO25', N'Giảm 25% vé tuyến điện', N'25%', 50, 300, N'31/08/2026', N'active');
INSERT INTO dbo.Promos (id, code, description, discount, uses, usage_limit, expiry, status) VALUES (N'P005', N'WELCOME', N'Giảm 5.000đ cho lần đầu đặt vé', N'5.000đ', 210, 500, N'31/12/2026', N'active');