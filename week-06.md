# AI Log — Tuần 06

| Tiếp nối `ai-logs/week-05.md` . Theo `AI_USAGE_POLICY.md` mục 5.

## Việc còn tồn đọng từ tuần 05

- [ ] Lập trình hoàn thiện 01 tính năng cốt lõi (Core Feature) trên nhánh riêng.
- [ ] Viết Unit Test và tạo Pull Request (PR) kiểm thử code.

---

## Tóm tắt tuần

- **Số phiên có AI hỗ trợ đáng kể:** 2
- **Phần code bị ảnh hưởng nhiều nhất:** Logic xử lý tính năng chính (Core Feature) và suite Unit Test
- **Vấn đề đáng chú ý phát sinh:** Refactor lại các hàm xử lý dữ liệu phức tạp để đạt chuẩn Clean Code.
- **Tài liệu mới tạo trong tuần:** `ai-logs/week-06.md`

---

## Nhật ký chi tiết

### [08/08/2026] — Lập trình Chức năng Core & Tối ưu mã nguồn

- **Công cụ AI dùng:** GitHub Copilot / ChatGPT
- **Mục tiêu phiên làm việc:** Hỗ trợ viết logic cho tính năng Core chính của ứng dụng và refactor các đoạn code dài vi phạm nguyên tắc Clean Code.
- **File bị thay đổi:** Các file mã nguồn thuộc tính năng Core
- **Có chạm vào auth/admin/password/schema không?** Có — cập nhật hàm xử lý xác thực/dữ liệu chính.
- **Đã review bởi người trước khi merge?** Chưa — đã tạo Pull Request (PR) để thành viên khác vào review.
- **Kết quả `pytest -v`:** Pass (Tất cả test case cho tính năng Core đều chạy thành công)
- **Ghi chú / rủi ro cần theo dõi:**
  - [ ] Chờ thành viên trong nhóm hoàn tất Code Review trên Pull Request trước khi bấm Merge vào `main`.

### [08/08/2026] — Sinh Unit Test & Đóng gói bài nộp

- **Công cụ AI dùng:** Gemini
- **Mục tiêu phiên làm việc:** Sinh các case Unit Test phủ các trường hợp biên (boundary value tests) và tổng hợp kết quả test.
- **File bị thay đổi:** Các file test trong thư mục `tests/`, `ai-logs/week-06.md` (mới)
- **Có chạm vào auth/admin/password/schema không?** Không
- **Đã review bởi người trước khi merge?** Có
- **Kết quả `pytest -v`:** Pass
- **Ghi chú / rủi ro cần theo dõi:**
  - [ ] Lưu lại ảnh chụp màn hình kết quả chạy test vào mô tả PR hoặc báo cáo.
