# AI Log — Tuần 01

> Mẫu nhật ký ghi lại các phiên làm việc có AI hỗ trợ đáng kể, theo `AI_USAGE_POLICY.md` mục 5. Điền vào mỗi khi có phiên làm việc mới; xoá phần ví dụ khi dùng thật.

## Tóm tắt tuần

- Số phiên có AI hỗ trợ đáng kể: _điền số_
- Phần code bị ảnh hưởng nhiều nhất: _điền (vd: server/repository.py, tests/...)_
- Vấn đề đáng chú ý phát sinh: _điền, hoặc "không có"_

---

## Nhật ký chi tiết

### [Ngày] — [Tiêu đề ngắn gọn của việc đã làm]

- **Công cụ AI dùng:** (vd: Claude Code / Claude.ai / khác)
- **Mục tiêu phiên làm việc:** _mô tả ngắn_
- **File bị thay đổi:** _liệt kê_
- **Có chạm vào auth/admin/password/schema không?** Có / Không
- **Đã review bởi người trước khi merge?** Có / Không / Chưa merge
- **Kết quả `pytest -v` sau thay đổi:** Pass / Fail (_ghi rõ nếu fail_)
- **Ghi chú / rủi ro cần theo dõi:** _điền_

---

### Ví dụ minh hoạ (dựa trên `test_student.py` đã có trong repo)

- **Công cụ AI dùng:** _(điền thực tế)_
- **Mục tiêu phiên làm việc:** Viết script kiểm tra thủ công luồng đăng nhập → xác thực học sinh → lấy thông tin tài khoản (`/api/auth/login` → `/api/auth/student-verify` → `/api/auth/me`).
- **File bị thay đổi:** `test_student.py` (script debug thủ công, nằm ngoài `tests/`, không thuộc bộ pytest chính thức)
- **Có chạm vào auth/admin/password/schema không?** Có (auth flow)
- **Đã review bởi người trước khi merge?** Chưa merge — đây là script debug tạm thời
- **Kết quả:** Phát hiện `student-verify` và `/api/auth/me` trả về 401 dù bước login trả 200. Nghi vấn ban đầu: `http.client` trong script không giữ cookie session giữa các request, nên các request sau bị coi là chưa đăng nhập.
- **Ghi chú / rủi ro cần theo dõi:**
  - [ ] Xác minh lại bằng công cụ giữ session (vd: `requests.Session()`) để loại trừ nguyên nhân do script trước khi kết luận đây là bug ở server.
  - [ ] Nếu xác nhận là bug thật ở server, chuyển thành test chính thức trong `tests/` (theo `AGENT_GUIDE.md` mục 4) thay vì để mãi ở dạng script rời.
