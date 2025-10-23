# MODULE CLIENT

> 📘 *Sinh viên mô tả phần server tại đây. Lưu ý điền đầy đủ và giữ nguyên cấu trúc các phần. Ví dụ là minh họa, tùy thuộc vào chủ đề và stack lựa chọn sẽ có sự khác biệt*

## 🎯 Mục tiêu
Client chịu trách nhiệm gửi yêu cầu đến server, hiển thị kết quả và hỗ trợ người dùng thao tác.

## ⚙️ Công nghệ
| Thành phần | Công nghệ |
|-------------|------------|
| Ngôn ngữ | Node.js / Python / Java |
| Thư viện chính | Axios / Requests / Socket.io (tuỳ chọn) |

## 🚀 Hướng dẫn chạy
1. Cài dependency:
   ```bash
   npm install
   ```
2. Chạy chương trình client:
   ```bash
   node main.js
   ```

## 📦 Cấu trúc
```
client/
├─ README.md
├─ package.json
├─ main.js
└─ lib/
   └─ helper.js
```

## 🧱 Ghi chú
- Port server mặc định: 8080  
- Có thể thay đổi endpoint trong `config.js`
