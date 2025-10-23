# MODULE SERVER

> 📘 *Sinh viên mô tả phần server tại đây. Lưu ý điền đầy đủ và giữ nguyên cấu trúc các phần. Ví dụ là minh họa, tùy thuộc vào chủ đề và stack lựa chọn sẽ có sự khác biệt*

## 🎯 Mục tiêu
Server tiếp nhận yêu cầu từ client, xử lý dữ liệu và trả kết quả thông qua API hoặc socket.

## ⚙️ Công nghệ
| Thành phần | Công nghệ |
|-------------|------------|
| Ngôn ngữ | Python 3.11 |
| Framework | Flask |
| Cơ sở dữ liệu | SQLite (nếu có) |

## 🚀 Hướng dẫn chạy
1. Cài dependency:
   ```bash
   pip install -r requirements.txt
   ```
2. Khởi chạy server:
   ```bash
   python app.py
   ```

## 🔗 API Mẫu
| Endpoint | Method | Input | Output |
|-----------|---------|--------|---------|
| `/health` | GET | — | `{"status":"ok"}` |
| `/compute` | POST | `{"task":"sum","payload":[1,2,3]}` | `{"status":"ok","result":6}` |

## 📦 Cấu trúc
```
server/
├─ README.md
├─ app.py
├─ requirements.txt
├─ utils/
│  └─ compute.py
└─ test/
   └─ test_server.py
```

## 🧱 Ghi chú
- Biến môi trường: `PORT=8080`
