# BÀI TẬP LỚN: LẬP TRÌNH MẠNG  
## [Tên dự án của nhóm]

> 📘 *Mẫu README này là khung hướng dẫn. Sinh viên chỉ cần điền thông tin của nhóm và nội dung dự án theo từng mục.*

---

## 🧑‍💻 THÔNG TIN NHÓM
| STT | Họ và Tên | MSSV | Email | Đóng góp 
|-----|------------|------|--------|
| 1 | Nguyễn Văn A | 20IT001 | a@example.com | ...
| 2 | Trần Thị B | 20IT002 | b@example.com | ...
| 3 | Lê Văn C | 20IT003 | c@example.com | ...

**Tên nhóm:** Nhóm 01 – Lập trình mạng  
**Chủ đề đã đăng ký:** (Ví dụ: Hệ thống truyền tệp tin qua mạng TCP, Chat Server, Web API xử lý dữ liệu…)

---

## 🧠 MÔ TẢ HỆ THỐNG
> Mô tả tổng quan hệ thống mà nhóm triển khai.

Ví dụ:
> Hệ thống bao gồm **server** xử lý yêu cầu và **client** gửi yêu cầu đến server qua giao thức HTTP.  
> Server cung cấp API cho phép tính toán đơn giản hoặc truyền dữ liệu.  
> Client có thể là chương trình CLI, web hoặc ứng dụng desktop.

**Cấu trúc logic tổng quát:**
```
client  <-->  server  <-->  (database / service nếu có)
```

Sơ đồ hệ thống (đặt file tại `statics/diagram.png`):  
```markdown
![System Diagram](./statics/diagram.png)
```

---

## ⚙️ CÔNG NGHỆ SỬ DỤNG
> Liệt kê công nghệ, framework, thư viện chính mà nhóm sử dụng.

| Thành phần | Công nghệ | Ghi chú |
|-------------|------------|---------|
| Server | Python 3.11 + Flask | REST API |
| Client | Node.js 20 + Axios | Giao tiếp HTTP |
| Database | SQLite | Lưu trữ dữ liệu tạm thời |
| Triển khai | Docker | (nếu có) |

---

## 🚀 HƯỚNG DẪN CHẠY DỰ ÁN
1. Clone repository
2. Chạy server
3. Chạy client
4. Kiểm thử nhanh

---

## 🔗 Giao tiếp (giao thức sử dụng)
| Endpoint | Protocol | Method | Input | Output |
|-----------|---------||---------|--------|---------|
| `/health` | HTTP/1.1  | GET | — | `{"status": "ok"}` |
| `/compute`| HTTP/2.0  | POST | `{"task":"sum","payload":[1,2,3]}` | `{"result":6}` |

---

## 📊 KẾT QUẢ THỰC NGHIỆM
> Đưa ảnh chụp kết quả hoặc mô tả log chạy thử.

```markdown
![Demo Result](./statics/result.png)
```

---

## 🧩 CẤU TRÚC DỰ ÁN
```
assignment-network-project/
├─ README.md
├─ INSTRUCTION.md
├─ statics/
│  ├─ diagram.png
│  └─ dataset_sample.csv
└─ source/
   ├─ .gitignore
   ├─ client/
   │  ├─ README.md
   │  └─ (client source files...)
   ├─ server/
   │  ├─ README.md
   │  └─ (server source files...)
   └─ (các module khác nếu có)
```

---

## 🧩 HƯỚNG PHÁT TRIỂN THÊM
> Nêu ý tưởng mở rộng hoặc cải tiến hệ thống.

---

## 📝 GHI CHÚ
- Repo tuân thủ đúng cấu trúc đã hướng dẫn trong `INSTRUCTION.md`.
