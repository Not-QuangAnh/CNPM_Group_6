# AI Log — Tuần 03

| Tiếp nối `ai-logs/week-02.md` . Theo `AI_USAGE_POLICY.md` mục 5.

## Việc còn tồn đọng từ tuần 02

- [ ] Rà soát và hoàn thiện định nghĩa các yêu cầu chức năng (Requirements) cho toàn bộ hệ thống.
- [ ] Thống nhất lựa chọn giữa `CODEBASE_OVERVIEW.md` hoặc `UX_PROTOTYPE.md` dựa trên hiện trạng dự án.

---

## Tóm tắt tuần

- **Số phiên có AI hỗ trợ đáng kể:** 2
- **Phần code bị ảnh hưởng nhiều nhất:** Tài liệu thiết kế hệ thống và cấu trúc thư mục
- **Vấn đề đáng chú ý phát sinh:** Không có
- **Tài liệu mới tạo trong tuần:** `CODEBASE_OVERVIEW.md`, `REQUIREMENTS.md`

---

## Nhật ký chi tiết

### [08/08/2026] — Tổng quan Codebase & Khởi tạo Yêu cầu dự án

- **Công cụ AI dùng:** ChatGPT / Claude
- **Mục tiêu phiên làm việc:** Rà soát cấu trúc thư mục hiện tại của dự án để viết `CODEBASE_OVERVIEW.md`; đồng thời chuẩn hóa danh sách User Stories trong `REQUIREMENTS.md`.
- **File bị thay đổi:** `CODEBASE_OVERVIEW.md` (mới), `REQUIREMENTS.md` (mới)
- **Có chạm vào auth/admin/password/schema không?** Không (chỉ tài liệu, không sửa code)
- **Đã review bởi người trước khi merge?** Có — đã được các thành viên trong nhóm thống nhất về phạm vi tính năng.
- **Kết quả `pytest -v`:** Không áp dụng (không đổi code)
- **Ghi chú / rủi ro cần theo dõi:**
  - [ ] Danh sách User Story trong `REQUIREMENTS.md` cần bổ sung Tiêu chí chấp nhận (Acceptance Criteria) ở Tuần 04.
  - [ ] Cần đảm bảo các thành viên nắm rõ quy trình chạy project trong `CODEBASE_OVERVIEW.md`.

### [08/08/2026] — Cập nhật & Tối ưu hóa Luồng người dùng

- **Công cụ AI dùng:** Gemini
- **Mục tiêu phiên làm việc:** Chuẩn hóa quy trình làm việc với AI Log và hỗ trợ thao tác đẩy tài liệu lên GitHub.
- **File bị thay đổi:** `ai-logs/week-03.md` (mới)
- **Có chạm vào auth/admin/password/schema không?** Không
- **Đã review bởi người trước khi merge?** Có
- **Kết quả `pytest -v`:** Không áp dụng
- **Ghi chú / rủi ro cần theo dõi:**
  - [ ] Chuẩn bị danh sách Prompt mẫu cho tuần 04 trong file `PROMPTS.md`.
