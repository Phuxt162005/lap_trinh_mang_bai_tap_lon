import { useState } from "react";

export default function AuthPage({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Vui lòng nhập email và mật khẩu.");
      return;
    }

    if (mode === "register") {
      if (!name.trim()) {
        setError("Vui lòng nhập họ tên.");
        return;
      }
      if (password.length < 8) {
        setError("Mật khẩu phải có ít nhất 8 ký tự.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Mật khẩu nhập lại không khớp.");
        return;
      }

      setError(
        "Giao diện đã kiểm tra dữ liệu. Chức năng đăng ký sẽ được kết nối với backend sau.",
      );
      return;
    }

    onLogin({ name: email.split("@")[0], email });
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-brand">
          <span className="auth-logo">♫</span>
          <span>Music App</span>
        </div>

        <h1>{mode === "login" ? "Chào mừng trở lại!" : "Tạo tài khoản mới"}</h1>
        <p className="auth-subtitle">
          {mode === "login"
            ? "Đăng nhập để khám phá thế giới âm nhạc."
            : "Đăng ký để bắt đầu quản lý thư viện âm nhạc."}
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === "register" && (
            <label>
              Họ và tên
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nhập họ và tên"
                autoComplete="name"
              />
            </label>
          )}

          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              autoComplete="email"
              required
            />
          </label>

          <label>
            Mật khẩu
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ít nhất 8 ký tự khi đăng ký"
              autoComplete={
                mode === "login" ? "current-password" : "new-password"
              }
              required
            />
          </label>

          {mode === "register" && (
            <label>
              Nhập lại mật khẩu
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu"
                autoComplete="new-password"
                required
              />
            </label>
          )}

          {error && (
            <p className="auth-message" role="status">
              {error}
            </p>
          )}

          <button type="submit" className="auth-submit">
            {mode === "login" ? "Đăng nhập" : "Đăng ký"}
          </button>
        </form>

        <p className="auth-switch">
          {mode === "login" ? "Chưa có tài khoản?" : "Đã có tài khoản?"}
          <button
            type="button"
            onClick={() => {
              setMode(mode === "login" ? "register" : "login");
              setError("");
            }}
          >
            {mode === "login" ? "Đăng ký ngay" : "Đăng nhập"}
          </button>
        </p>

        <p className="auth-disclaimer">
          Phiên bản giao diện thử nghiệm — chưa kết nối máy chủ.
        </p>
      </section>
    </main>
  );
}
