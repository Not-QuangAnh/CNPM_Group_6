# AI Log — Tuần 05

| Tiếp nối `ai-logs/week-04.md` . Theo `AI_USAGE_POLICY.md` mục 5.

## Việc còn tồn đọng từ tuần 04

- [ ] Hoàn thiện sơ đồ kiến trúc hệ thống tổng quan trong `docs/architecture.md`.
- [ ] Thiết kế CSDL chi tiết (ERD) và viết mô tả bảng trong `docs/data-model.md`.

---

## Tóm tắt tuần

- **Số phiên có AI hỗ trợ đáng kể:** 2
- **Phần code bị ảnh hưởng nhiều nhất:** Tài liệu kiến trúc, Database schema & AI Feature Design
- **Vấn đề đáng chú ý phát sinh:** Cần chọn phương án xử lý dự phòng (fallback) khi AI API gặp lỗi timeout.
- **Tài liệu mới tạo trong tuần:** `docs/architecture.md`, `docs/data-model.md`, `AI_FEATURE_DESIGN.md`

---

## Nhật ký chi tiết

### [Ngày] — [Tiêu đề ngắn gọn của việc đã làm]

- **Công cụ AI dùng:** Claude / ChatGPT
- **Mục tiêu phiên làm việc:** Sinh mã Mermaid.js cho sơ đồ ERD, thiết kế cấu trúc bảng dữ liệu và lập sơ đồ kiến trúc hệ thống 3 tầng (3-tier architecture).
- **File bị thay đổi:** `docs/architecture.md` (mới), `docs/data-model.md` (mới)
- **Có chạm vào auth/admin/password/schema không?** Có — định nghĩa cấu trúc bảng `USERS` và các khóa ngoại/khóa chính.
- **Đã review bởi người trước khi merge?** Có — nhóm đã đồng ý với thiết kế CSDL mới.
- **Kết quả `pytest -v`:** Không áp dụng
- **Ghi chú / rủi ro cần theo dõi:**
  - [ ] Cần tạo file Migration SQL khởi tạo CSDL dựa trên schema trong `data-model.md`.
  - [ ] Kiểm tra tính toàn vẹn dữ liệu giữa khóa chính và khóa ngoại.

### [Ngày] — [Tiêu đề ngắn gọn của việc đã làm]

- **Công cụ AI dùng:** Gemini
- **Mục tiêu phiên làm việc:** Soạn thảo tài liệu `AI_FEATURE_DESIGN.md` mô tả input/output, mô hình sử dụng và cơ chế xử lý ngoại lệ cho tính năng AI.
- **File bị thay đổi:** `AI_FEATURE_DESIGN.md` (mới)
- **Có chạm vào auth/admin/password/schema không?** Không
- **Đã review bởi người trước khi merge?** Có
- **Kết quả `pytest -v`:** Không áp dụng
- **Ghi chú / rủi ro cần theo dõi:**
  - [ ] Thiết lập timeout cho API call ở mức 5s để tránh nghẽn luồng xử lý chính.
