# AI_FEATURE_PROPOSAL.md — Đề xuất tính năng dùng AI cho GoBus

> Đây là **đề xuất để thảo luận**, không phải kế hoạch đã chốt. Mỗi mục có mức độ ưu tiên, độ phức tạp ước lượng, và rủi ro cần cân nhắc — chủ dự án quyết định mục nào triển khai.

## 1. Nguyên tắc chọn tính năng AI

- Chỉ đề xuất AI ở nơi nó **thực sự tốt hơn logic quy tắc (rule-based)** đơn giản — không thêm AI cho vui.
- Ưu tiên tính năng giải quyết khoảng trống đã nêu trong `PRODUCT_ANALYSIS.md` mục 3.
- Không tính năng nào được đề xuất thay thế các luồng xác thực/bảo mật hiện có — AI chỉ hỗ trợ ở lớp trải nghiệm người dùng.

## 2. Đề xuất chi tiết

### 2.1. Trợ lý tìm tuyến bằng ngôn ngữ tự nhiên (ưu tiên: Cao)

**Vấn đề giải quyết:** người dùng mới không biết tên tuyến/mã tuyến, chỉ biết điểm đi–điểm đến bằng ngôn ngữ tự nhiên ("từ Cầu Giấy đến Bờ Hồ đi tuyến nào rẻ nhất").

**Cách làm:**
- Ô chat nhỏ trên `index.html`, gọi API `/v1/messages` (Anthropic API) với system prompt mô tả dữ liệu tuyến hiện có.
- **Không để model tự bịa tuyến/giá** — bắt buộc model gọi tool (function calling) trả về từ DB thật (`repository.py`), không trả lời tự do bằng kiến thức nội tại.

**Độ phức tạp:** Trung bình. **Rủi ro:** Model có thể trả lời sai nếu không ràng buộc chặt bằng tool — cần test kỹ trường hợp tuyến không tồn tại.

### 2.2. Cảnh báo xe trễ/sắp đến chủ động (ưu tiên: Cao)

**Vấn đề giải quyết:** khoảng trống nêu ở `PRODUCT_ANALYSIS.md` — theo dõi real-time đã có nhưng thụ động (người dùng phải tự mở app xem).

**Lưu ý:** đây **không phải bài toán AI/LLM** mà là bài toán dữ liệu real-time + notification (WebSocket/push). Đề xuất **không dùng LLM** cho phần này — ghi vào đây để tránh nhầm "AI feature" = "LLM feature". Nếu có nhu cầu dự đoán thời gian đến dựa trên dữ liệu lịch sử, đó mới là bài toán ML (không phải Claude/LLM) và nên tách thành đề xuất riêng có đủ dữ liệu huấn luyện trước.

### 2.3. Tóm tắt/phân loại phản hồi người dùng (ưu tiên: Trung bình, phụ thuộc mục 3 trong PRODUCT_ANALYSIS.md)

**Điều kiện tiên quyết:** phải có cơ chế thu thập feedback trước (hiện chưa có endpoint nào cho việc này).

**Cách làm:** khi đã có bảng feedback, dùng AI để tóm tắt/gắn nhãn (vd: "trễ giờ", "thái độ tài xế", "xe bẩn") cho dashboard admin, giúp admin không phải đọc từng feedback thủ công.

**Độ phức tạp:** Thấp (sau khi có dữ liệu). **Rủi ro:** thấp, vì đây là công cụ hỗ trợ nội bộ cho admin, không đối diện trực tiếp người dùng cuối, dễ kiểm soát sai sót.

### 2.4. Trợ lý cho admin khi tạo/sửa tuyến (ưu tiên: Thấp)

**Vấn đề giải quyết:** admin nhập liệu tuyến mới (điểm dừng, giờ chạy) thủ công, dễ sai định dạng.

**Cách làm:** AI hỗ trợ chuẩn hoá dữ liệu nhập vào (vd: parse địa chỉ, gợi ý toạ độ) trước khi admin xác nhận lưu — **luôn có bước admin xác nhận cuối cùng**, AI không tự ghi DB.

**Độ phức tạp:** Trung bình. **Rủi ro:** thấp vì có người duyệt cuối.

## 3. Việc CHƯA nên làm ngay

- **Chatbot thay thế hoàn toàn tìm kiếm/lọc hiện có** — rủi ro làm chậm và kém tin cậy hơn UI có sẵn cho các thao tác đơn giản (tra cứu tuyến quen thuộc).
- **Dùng AI để quyết định giá vé/khuyến mãi tự động** — đây là quyết định kinh doanh nhạy cảm, không nên giao cho AI mà không có con người duyệt.
- **Dùng AI xử lý xác thực học sinh (`student-verify`) thay logic hiện tại** — vấn đề ở đây là lỗi kỹ thuật (session/cookie), không phải bài toán cần AI; xem `PRODUCT_ANALYSIS.md` mục 2.

## 4. Câu hỏi cần chủ dự án trả lời trước khi triển khai bất kỳ mục nào ở trên

1. Ngân sách cho API AI (theo lượt gọi) có được chấp nhận không, và ai chịu chi phí này khi scale?
2. Có sẵn sàng để dữ liệu tuyến/giá vé được gửi tới API bên ngoài (Anthropic) không, hay cần self-host?
3. Ưu tiên mục 2.1 (trợ lý tìm tuyến) hay mục 2.3 (tóm tắt feedback) trước — tuỳ vào việc feedback endpoint đã có kế hoạch xây chưa?
