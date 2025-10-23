
> Đây là tài liệu **do giảng viên soạn sẵn**, sinh viên không chỉnh sửa.  
> Nó hướng dẫn các bước thực hiện, quy định repo và cách thức đánh giá.

```markdown
# HƯỚNG DẪN THỰC HIỆN BÀI TẬP LỚN — MÔN LẬP TRÌNH MẠNG

Giảng viên phụ trách: **TS. Đặng Ngọc Hùng**  
Khoa: **Công nghệ thông tin 1**

---

## 🎯 Mục tiêu
Sinh viên lựa chọn một chủ đề liên quan tới các nội dung đã được giới thiệu/topic trong môn lập trình mạng.

---

## 🧩 Cấu trúc repository bắt buộc
assignment-network-project/
├─ README.md # mô tả dự án (do sinh viên hoàn thiện)
├─ INSTRUCTION.md # hướng dẫn (file này — không chỉnh sửa)
├─ statics/ # chứa hình ảnh, dataset, diagram
│ ├─ logo.png
│ ├─ dataset_sample.csv
│ └─ diagram.png
└─ source/ # chứa toàn bộ mã nguồn dự án
├─── .gitignore
├─── client/ # module phía client
│ ├─── README.md
│ └─── (client source files...)
├─── server/ # module phía server
│ ├─── README.md
│ └─── (server source files...)
└─── (các module khác nếu có, ví dụ: common/, db/, service/, ...)



**Yêu cầu:**
- Các nhóm **không chỉnh sửa hoặc xoá file `INSTRUCTION.md`**.
- Toàn bộ mô tả hệ thống, giao tiếp, hướng dẫn build/run phải nằm trong `README.md`.

---

## 🧠 Yêu cầu kỹ thuật
- Mỗi nhóm được phép dùng ngôn ngữ và framework tùy chọn (Python, Node.js, Java, Go…).
- Dự án phải chạy được **local** hoặc **trong Docker**.

---

## 🚀 Hướng dẫn quy trình
1. **Fork hoặc clone** repo starter này.  
2. Giữ nguyên cấu trúc thư mục
3. Đọc nội dung trong  `INSTRUCTION.md`
4. Điền thông tin nhóm vào `README.md` (root).
5. Phát triển code trong `source/` (tạo thêm `client/`, `server/`, hoặc module khác tùy thiết kế).
6. Commit đầy đủ, push lên GitHub.
7. Trước hạn nộp:
   - Đảm bảo `README.md` đầy đủ như hướng dẫn.
   - Merge code về nhánh `main` hoặc tạo release.

---

## 🔍 Tiêu chí chấm điểm
| Hạng mục | Tỷ trọng |
|-----------|-----------|
| Ý tưởng và Chức năng chính | 40% |
| Tổ chức mã nguồn & cấu trúc repo | 20% |
| Tài liệu & hướng dẫn chạy | 15% |
| Trình bày & báo cáo | 25% |

---

## 🧩 Cách kiểm tra
Giảng viên / TA sẽ kiểm tra theo thứ tự:
1. Đọc các file `README.md` để hiểu hệ thống.
2. Xem demo
3. Vấn đáp các thành viên

---

## 📅 Hạn nộp
- Mỗi nhóm tối đa 03 sinh viên.
- Chỉ chấm các repo có file `README.md` đầy đủ và chạy được.

---

