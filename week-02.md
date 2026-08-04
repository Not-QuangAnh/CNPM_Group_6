# AI Log — Tuần 02

> Tiếp nối `ai-logs/week-01.md`. Theo `AI_USAGE_POLICY.md` mục 5.

## Việc còn tồn đọng từ tuần 01

- [ ] Xác minh lỗi 401 ở `student-verify`/`/api/auth/me` bằng công cụ giữ session (`requests.Session()`), loại trừ nguyên nhân do `test_student.py` không giữ cookie.
- [ ] Quyết định: nếu là bug thật → sửa + viết test chính thức trong `tests/`. Nếu là lỗi script → xoá/chuyển `test_student.py` thành test hợp lệ.

## Tóm tắt tuần

- Số phiên có AI hỗ trợ đáng kể: _điền số_
- Phần code bị ảnh hưởng nhiều nhất: _điền_
- Vấn đề đáng chú ý phát sinh: _điền, hoặc "không có"_
- Tài liệu mới tạo trong tuần: `PRODUCT_ANALYSIS.md`, `AI_FEATURE_PROPOSAL.md`

---

## Nhật ký chi tiết

### [Ngày] — Phân tích sản phẩm & đề xuất tính năng AI

- **Công cụ AI dùng:** Claude
- **Mục tiêu phiên làm việc:** Rà soát trạng thái hiện tại của GoBus (README, cấu trúc test, endpoint) để viết `PRODUCT_ANALYSIS.md`; từ đó đề xuất các tính năng AI khả thi trong `AI_FEATURE_PROPOSAL.md`.
- **File bị thay đổi:** `PRODUCT_ANALYSIS.md` (mới), `AI_FEATURE_PROPOSAL.md` (mới)
- **Có chạm vào auth/admin/password/schema không?** Không (chỉ tài liệu, không sửa code)
- **Đã review bởi người trước khi merge?** Chưa — cần chủ dự án xác nhận các giả định (đặc biệt mục 3 "khoảng trống so với kỳ vọng người dùng" trong `PRODUCT_ANALYSIS.md`, vì đây là suy đoán, chưa có dữ liệu người dùng thật)
- **Kết quả `pytest -v`:** Không áp dụng (không đổi code)
- **Ghi chú / rủi ro cần theo dõi:**
  - [ ] Các đề xuất AI feature (mục 2.1–2.4 trong `AI_FEATURE_PROPOSAL.md`) đều **chưa triển khai**, chỉ là đề xuất — không tự ý bắt đầu code nếu chưa có quyết định ưu tiên từ chủ dự án (xem câu hỏi mục 4).
  - [ ] Cân nhắc chi phí API khi đề xuất mục 2.1 (trợ lý tìm tuyến) — chưa có ước tính traffic thực tế để tính chi phí.

### [Ngày] — [Tiêu đề phiên làm việc tiếp theo]

- **Công cụ AI dùng:**
- **Mục tiêu phiên làm việc:**
- **File bị thay đổi:**
- **Có chạm vào auth/admin/password/schema không?** Có / Không
- **Đã review bởi người trước khi merge?** Có / Không / Chưa merge
- **Kết quả `pytest -v` sau thay đổi:** Pass / Fail
- **Ghi chú / rủi ro cần theo dõi:**
