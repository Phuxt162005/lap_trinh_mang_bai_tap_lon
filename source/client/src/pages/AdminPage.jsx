import { useCallback, useEffect, useState } from "react";
import { apiRequest } from "../services/api";

const definitions = {
  songs: {
    label: "Bài hát",
    endpoint: "/admin/songs",
    listKey: "songs",
    fields: [
      { name: "title", label: "Tên bài hát", required: true },
      { name: "artist", label: "Tên nghệ sĩ", required: true },
      { name: "album", label: "Tên album" },
      { name: "duration_seconds", label: "Thời lượng (giây)", type: "number" },
      { name: "audio_url", label: "URL file âm thanh (MP3)" },
      { name: "cover_url", label: "URL ảnh bìa" },
    ],
    title: (item) => item.title,
    subtitle: (item) =>
      `${item.artist || ""} · ${item.album || "Chưa có album"}`,
  },
  artists: {
    label: "Nghệ sĩ",
    endpoint: "/admin/artists",
    listKey: "artists",
    fields: [
      { name: "name", label: "Tên nghệ sĩ", required: true },
      { name: "bio", label: "Giới thiệu", type: "textarea" },
      { name: "image_url", label: "URL ảnh nghệ sĩ" },
    ],
    title: (item) => item.name,
    subtitle: (item) => item.bio || "Chưa có giới thiệu",
  },
  albums: {
    label: "Album",
    endpoint: "/admin/albums",
    listKey: "albums",
    fields: [
      { name: "title", label: "Tên album", required: true },
      { name: "artist_id", label: "Nghệ sĩ", type: "artist", required: true },
      { name: "release_year", label: "Năm phát hành", type: "number" },
      { name: "cover_url", label: "URL ảnh bìa" },
    ],
    title: (item) => item.title,
    subtitle: (item) =>
      `${item.artist_name || ""} · ${item.release_year || "Chưa rõ năm"}`,
  },
};

function UsersManagementPanel() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await apiRequest("/admin/users");
      setUsers(data.users || []);
    } catch (err) {
      setError(err.message || "Không thể tải danh sách tài khoản.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const visibleUsers = users.filter((user) => {
    const q = search.trim().toLowerCase();
    return (
      !q ||
      user.name.toLowerCase().includes(q) ||
      user.email.toLowerCase().includes(q)
    );
  });

  async function changeRole(user, role) {
    if (user.role === role) return;

    const confirmed = window.confirm(
      `Đổi vai trò của ${user.email} thành "${role}"?`,
    );
    if (!confirmed) return;

    setBusyId(user.id);
    setError("");
    setNotice("");

    try {
      await apiRequest(`/admin/users/${user.id}/role`, {
        method: "PATCH",
        body: { role },
      });
      setNotice(`Đã cập nhật vai trò của ${user.email}.`);
      await loadUsers();
    } catch (err) {
      setError(err.message || "Không thể cập nhật vai trò.");
    } finally {
      setBusyId(null);
    }
  }

  async function deleteUser(user) {
    if (
      !window.confirm(
        `Bạn có chắc muốn xóa tài khoản "${user.email}"? Các playlist của tài khoản này cũng sẽ bị xóa.`,
      )
    )
      return;

    setBusyId(user.id);
    setError("");
    setNotice("");

    try {
      const data = await apiRequest(`/admin/users/${user.id}`, {
        method: "DELETE",
      });
      setNotice(data.message || "Đã xóa tài khoản.");
      await loadUsers();
    } catch (err) {
      setError(err.message || "Không thể xóa tài khoản.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="admin-panel users-admin-panel">
      <div className="admin-list-heading">
        <div>
          <h3>Quản lý người dùng</h3>
          <p>{visibleUsers.length} tài khoản</p>
        </div>
        <button
          className="admin-secondary-button"
          type="button"
          onClick={loadUsers}
          disabled={loading}
        >
          Làm mới
        </button>
      </div>

      <label className="admin-field">
        <span>Tìm theo tên hoặc email</span>
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Nhập tên hoặc email..."
        />
      </label>

      {error && (
        <div className="admin-message error" role="alert">
          {error}
        </div>
      )}
      {notice && (
        <div className="admin-message success" role="status">
          {notice}
        </div>
      )}

      {loading ? (
        <div className="admin-empty">Đang tải tài khoản...</div>
      ) : visibleUsers.length === 0 ? (
        <div className="admin-empty">Không tìm thấy tài khoản.</div>
      ) : (
        <div className="admin-record-list">
          {visibleUsers.map((user) => (
            <article className="admin-record" key={user.id}>
              <div className="admin-record-info">
                <strong>{user.name}</strong>
                <span>{user.email}</span>
                <small>
                  ID: {user.id} · Tạo lúc:{" "}
                  {user.created_at
                    ? new Date(user.created_at).toLocaleString("vi-VN")
                    : "Không rõ"}
                </small>
              </div>

              <div className="admin-record-actions">
                <select
                  aria-label={`Vai trò của ${user.email}`}
                  value={user.role}
                  disabled={busyId === user.id}
                  onChange={(event) => changeRole(user, event.target.value)}
                >
                  <option value="user">Người dùng</option>
                  <option value="admin">Quản trị viên</option>
                </select>
                <button
                  type="button"
                  className="playlist-danger-button"
                  disabled={busyId === user.id}
                  onClick={() => deleteUser(user)}
                >
                  {busyId === user.id ? "Đang xử lý..." : "Xóa"}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

const emptyForm = (fields) =>
  Object.fromEntries(fields.map((field) => [field.name, ""]));

export default function AdminPage() {
  const [tab, setTab] = useState("songs");
  const [items, setItems] = useState([]);
  const [artists, setArtists] = useState([]);
  const [form, setForm] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const config = definitions[tab] || definitions.songs;

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiRequest(config.endpoint);
      setItems(data[config.listKey] || []);
      if (tab === "albums") {
        const artistData = await apiRequest("/admin/artists");
        setArtists(artistData.artists || []);
      }
    } catch (err) {
      setError(err.message || "Không thể tải dữ liệu quản trị.");
    } finally {
      setLoading(false);
    }
  }, [config.endpoint, config.listKey, tab]);

  useEffect(() => {
    if (tab === "users") return;
    setForm(emptyForm(definitions[tab].fields));
    setEditingId(null);
    setNotice("");
    loadData();
  }, [tab, loadData]);

  function startEdit(item) {
    const nextForm = emptyForm(config.fields);
    config.fields.forEach((field) => {
      nextForm[field.name] =
        item[field.name] == null ? "" : String(item[field.name]);
    });
    setForm(nextForm);
    setEditingId(item.id);
    setNotice("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm(config.fields));
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");

    try {
      const body = { ...form };
      for (const field of config.fields) {
        if (field.type === "number") {
          body[field.name] =
            body[field.name] === "" ? null : Number(body[field.name]);
        }
        if (field.name === "artist_id") {
          body.artist_id =
            body.artist_id === "" ? null : Number(body.artist_id);
        }
      }

      const path = editingId
        ? `${config.endpoint}/${editingId}`
        : config.endpoint;
      await apiRequest(path, {
        method: editingId ? "PUT" : "POST",
        body,
      });

      setNotice(
        editingId ? "Cập nhật dữ liệu thành công." : "Thêm dữ liệu thành công.",
      );
      setEditingId(null);
      setForm(emptyForm(config.fields));
      await loadData();
    } catch (err) {
      setError(err.message || "Không thể lưu dữ liệu.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(item) {
    if (!window.confirm(`Bạn có chắc muốn xóa "${config.title(item)}"?`))
      return;

    setError("");
    setNotice("");
    try {
      await apiRequest(`${config.endpoint}/${item.id}`, { method: "DELETE" });
      if (String(editingId) === String(item.id)) cancelEdit();
      setNotice("Đã xóa dữ liệu.");
      await loadData();
    } catch (err) {
      setError(err.message || "Không thể xóa dữ liệu.");
    }
  }

  return (
    <section className="content-section admin-page">
      <div className="admin-intro">
        <div>
          <span className="eyebrow">ADMINISTRATION</span>
          <h2>Quản trị thư viện</h2>
          <p>Quản lý bài hát, nghệ sĩ và album trong hệ thống.</p>
        </div>
        <span className="admin-count">{items.length} bản ghi</span>
      </div>

      <div
        className="admin-tabs"
        role="tablist"
        aria-label="Loại dữ liệu quản trị"
      >
        {Object.entries(definitions).map(([key, value]) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={tab === key}
            className={`admin-tab ${tab === key ? "active" : ""}`}
            onClick={() => setTab(key)}
          >
            {value.label}
          </button>
        ))}

        <button
          type="button"
          role="tab"
          aria-selected={tab === "users"}
          className={`admin-tab ${tab === "users" ? "active" : ""}`}
          onClick={() => setTab("users")}
        >
          Người dùng
        </button>
      </div>

      {notice && (
        <div className="admin-message success" role="status">
          {notice}
        </div>
      )}
      {error && (
        <div className="admin-message error" role="alert">
          {error}
        </div>
      )}

      {tab === "users" ? (
        <UsersManagementPanel />
      ) : (
        <div className="admin-layout">
          <section className="admin-panel">
            <h3>
              {editingId
                ? `Sửa ${config.label.toLowerCase()}`
                : `Thêm ${config.label.toLowerCase()}`}
            </h3>
            <form className="admin-form" onSubmit={handleSubmit}>
              {config.fields.map((field) => (
                <label className="admin-field" key={field.name}>
                  <span>
                    {field.label}
                    {field.required ? " *" : ""}
                  </span>
                  {field.type === "artist" ? (
                    <select
                      required={field.required}
                      value={form[field.name] || ""}
                      onChange={(e) =>
                        setForm({ ...form, [field.name]: e.target.value })
                      }
                    >
                      <option value="">-- Chọn nghệ sĩ --</option>
                      {artists.map((artist) => (
                        <option key={artist.id} value={artist.id}>
                          {artist.name}
                        </option>
                      ))}
                    </select>
                  ) : field.type === "textarea" ? (
                    <textarea
                      rows={4}
                      maxLength={5000}
                      value={form[field.name] || ""}
                      onChange={(e) =>
                        setForm({ ...form, [field.name]: e.target.value })
                      }
                    />
                  ) : (
                    <input
                      type={field.type || "text"}
                      required={field.required}
                      min={
                        field.name === "duration_seconds"
                          ? 0
                          : field.name === "release_year"
                            ? 1900
                            : undefined
                      }
                      max={field.name === "release_year" ? 2100 : undefined}
                      value={form[field.name] || ""}
                      onChange={(e) =>
                        setForm({ ...form, [field.name]: e.target.value })
                      }
                    />
                  )}
                </label>
              ))}
              <div className="admin-form-actions">
                <button
                  className="playlist-primary-button"
                  type="submit"
                  disabled={saving}
                >
                  {saving
                    ? "Đang lưu..."
                    : editingId
                      ? "Lưu thay đổi"
                      : "Thêm mới"}
                </button>
                {editingId && (
                  <button
                    className="admin-secondary-button"
                    type="button"
                    onClick={cancelEdit}
                  >
                    Hủy sửa
                  </button>
                )}
              </div>
            </form>
          </section>

          <section className="admin-panel">
            <div className="admin-list-heading">
              <h3>Danh sách {config.label.toLowerCase()}</h3>
              <button
                className="admin-secondary-button"
                type="button"
                onClick={loadData}
                disabled={loading}
              >
                Làm mới
              </button>
            </div>

            {loading ? (
              <div className="admin-empty">Đang tải dữ liệu...</div>
            ) : items.length === 0 ? (
              <div className="admin-empty">Chưa có dữ liệu.</div>
            ) : (
              <div className="admin-record-list">
                {items.map((item) => (
                  <article className="admin-record" key={item.id}>
                    <div className="admin-record-info">
                      <strong>{config.title(item)}</strong>
                      <span>{config.subtitle(item)}</span>
                      <small>ID: {item.id}</small>
                    </div>
                    <div className="admin-record-actions">
                      <button
                        type="button"
                        className="admin-edit-button"
                        onClick={() => startEdit(item)}
                      >
                        Sửa
                      </button>
                      <button
                        type="button"
                        className="playlist-danger-button"
                        onClick={() => handleDelete(item)}
                      >
                        Xóa
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </section>
  );
}
