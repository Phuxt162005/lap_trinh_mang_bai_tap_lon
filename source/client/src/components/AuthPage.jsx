import { useState } from "react";
import { apiRequest } from "../services/api";

export default function AuthPage({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

    const cleanEmail = email.trim().toLowerCase();

    if (mode === "register") {
      if (!name.trim()) {
        setIsError(true);
        setMessage("Vui lòng nhập họ tên.");
        return;
      }
      if (password.length < 8) {
        setIsError(true);
        setMessage("Mật khẩu phải có ít nhất 8 ký tự.");
        return;
      }
      if (password !== confirmPassword) {
        setIsError(true);
        setMessage("Mật khẩu nhập lại không khớp.");
        return;
      }
    }

    setLoading(true);
    setIsError(false);

    try {
      if (mode === "register") {
        await apiRequest("/auth/register", {
          method: "POST",
          body: { name: name.trim(), email: cleanEmail, password },
        });

        setMode("login");
        setPassword("");
        setConfirmPassword("");
        setMessage("Đăng ký thành công! Hãy đăng nhập bằng tài khoản vừa tạo.");
      } else {
        const data = await apiRequest("/auth/login", {
          method: "POST",
          body: { email: cleanEmail, password },
        });

        onLogin({ ...data.user, token: data.token });
      }
    } catch (error) {
      setIsError(true);
      setMessage(error.message || "Đã xảy ra lỗi. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }

  function toggleMode() {
    setMode(mode === "login" ? "register" : "login");
    setMessage("");
    setIsError(false);
    setPassword("");
    setConfirmPassword("");
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
                required
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

          {message && (
            <p
              className="auth-message"
              role="status"
              style={{ color: isError ? "#dc2626" : "#16a34a" }}
            >
              {message}
            </p>
          )}

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading
              ? "Đang xử lý..."
              : mode === "login"
                ? "Đăng nhập"
                : "Đăng ký"}
          </button>
        </form>

        <p className="auth-switch">
          {mode === "login" ? "Chưa có tài khoản?" : "Đã có tài khoản?"}
          <button type="button" onClick={toggleMode} disabled={loading}>
            {mode === "login" ? "Đăng ký ngay" : "Đăng nhập"}
          </button>
        </p>

        <p className="auth-disclaimer">
          Tài khoản được xác thực qua máy chủ Music App.
        </p>
      </section>
    </main>
  );
}
