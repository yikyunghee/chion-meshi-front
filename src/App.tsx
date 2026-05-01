import { useState, useEffect } from "react";
import "./App.css";

type Spot = {
  id: number;
  station: string;
  name: string;
  menu: string;
  price: string;
  rating: number;
  comment: string;
  url: string;
  author: string;
};

const API = "https://chion-meshi-map-production.up.railway.app/api/spots";
const initForm = { station: "", name: "", menu: "", price: "", rating: 0, comment: "", url: "", author: "" };

function App() {
  const [spots, setSpots] = useState<Spot[]>([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [form, setForm] = useState(initForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [editSpot, setEditSpot] = useState<Spot | null>(null);

  useEffect(() => {
    fetch(API).then((res) => res.json()).then((data) => setSpots(data));
  }, []);

  const stations = [...new Set(spots.map((s) => s.station))];
  const filtered = activeFilter === "all" ? spots : spots.filter((s) => s.station === activeFilter);

  const validate = (f: typeof initForm) => {
    const e: Record<string, string> = {};
    if (!f.station) e.station = "駅名を入力してください";
    if (!f.name) e.name = "お店の名前を入力してください";
    if (!f.menu) e.menu = "メニューを入力してください";
    if (!f.rating) e.rating = "評価を選んでください";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate(form)) return;
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const newSpot = await res.json();
    setSpots([newSpot, ...spots]);
    setForm(initForm);
    setErrors({});
  };

  const handleDelete = async (id: number) => {
    if (!confirm("削除しますか？")) return;
    await fetch(`${API}/${id}`, { method: "DELETE" });
    setSpots(spots.filter((s) => s.id !== id));
  };

  const handleUpdate = async () => {
    if (!editSpot) return;
    if (!validate(editSpot)) return;
    const res = await fetch(`${API}/${editSpot.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editSpot),
    });
    const updated = await res.json();
    setSpots(spots.map((s) => s.id === updated.id ? updated : s));
    setEditSpot(null);
    setErrors({});
  };

  const stars = (n: number, onClick?: (i: number) => void) =>
    [1,2,3,4,5].map((i) => (
      <span key={i} className={`star ${i <= n ? "on" : ""}`}
        onClick={() => onClick && onClick(i)}
        style={{ cursor: onClick ? "pointer" : "default" }}>★</span>
    ));

  return (
    <div className="wrap">
      <div className="top">
        <h1>🍜 Chion_meshi_map</h1>
        <span>{filtered.length}件</span>
      </div>

      <div className="filters">
        <button className={`filter-btn ${activeFilter === "all" ? "active" : ""}`} onClick={() => setActiveFilter("all")}>すべて</button>
        {stations.map((s) => (
          <button key={s} className={`filter-btn ${activeFilter === s ? "active" : ""}`} onClick={() => setActiveFilter(s)}>{s}</button>
        ))}
      </div>

      <div className="form-card">
        <h3>+ 新しいお店を追加</h3>
        <div className="row2">
          <div className="field">
            <label>最寄り駅<span className="req">*</span></label>
            <input className={errors.station ? "error" : ""} placeholder="例: 渋谷" value={form.station} onChange={(e) => setForm({ ...form, station: e.target.value })} />
            <span className="err-msg">{errors.station}</span>
          </div>
          <div className="field">
            <label>お店の名前<span className="req">*</span></label>
            <input className={errors.name ? "error" : ""} placeholder="例: 麺屋武蔵" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <span className="err-msg">{errors.name}</span>
          </div>
        </div>
        <div className="row3">
          <div className="field">
            <label>おすすめメニュー<span className="req">*</span></label>
            <input className={errors.menu ? "error" : ""} placeholder="例: 特製ラーメン" value={form.menu} onChange={(e) => setForm({ ...form, menu: e.target.value })} />
            <span className="err-msg">{errors.menu}</span>
          </div>
          <div className="field">
            <label>価格</label>
            <input placeholder="例: 950" value={form.price.replace("円", "")}
              onChange={(e) => { const val = e.target.value.replace(/[^0-9]/g, ""); setForm({ ...form, price: val ? val + "円" : "" }); }} />
          </div>
          <div className="field">
            <label>投稿者名</label>
            <input placeholder="任意" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} />
          </div>
        </div>
        <div className="row1">
          <div className="field">
            <label>URL</label>
            <input placeholder="食べログ・ぐるなび等 (任意)" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
          </div>
        </div>
        <div className="row1">
          <div className="field">
            <label>一言コメント</label>
            <textarea placeholder="おすすめポイントなど" value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} />
          </div>
        </div>
        <div className="stars-row">
          <label>評価<span className="req">*</span></label>
          {stars(form.rating, (n) => setForm({ ...form, rating: n }))}
          <span className="err-msg">{errors.rating}</span>
        </div>
        <button className="submit-btn" onClick={handleSubmit}>登録する</button>
      </div>

      <div className="grid">
        {filtered.map((s) => (
          <div key={s.id} className="card">
            <div className="card-head">
              <span className="card-name">{s.name}</span>
              <span className="badge">{s.station}駅</span>
            </div>
            <div className="card-stars">{stars(s.rating)}</div>
            <div className="card-menu">{s.menu}</div>
            <div className="card-price">{s.price}</div>
            <div className="card-comment">{s.comment}</div>
            <div className="card-foot">
              <span className="card-author">{s.author ? `投稿: ${s.author}` : "匿名"}</span>
              {s.url && <a className="card-link" href={s.url} target="_blank" rel="noreferrer">リンクを見る →</a>}
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button onClick={() => { setEditSpot(s); setErrors({}); }}
                style={{ flex: 1, padding: "5px", fontSize: 12, border: "1px solid #ddd", borderRadius: 6, background: "white", cursor: "pointer" }}>編集</button>
              <button onClick={() => handleDelete(s.id)}
                style={{ flex: 1, padding: "5px", fontSize: 12, border: "1px solid #ffcccc", borderRadius: 6, background: "#fff5f5", color: "#e24b4a", cursor: "pointer" }}>削除</button>
            </div>
          </div>
        ))}
      </div>

      {editSpot && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div style={{ background: "white", borderRadius: 12, padding: 24, width: "90%", maxWidth: 500, maxHeight: "90vh", overflowY: "auto" }}>
            <h3 style={{ marginBottom: 16 }}>編集</h3>
            <div className="row2">
              <div className="field">
                <label>最寄り駅<span className="req">*</span></label>
                <input className={errors.station ? "error" : ""} value={editSpot.station} onChange={(e) => setEditSpot({ ...editSpot, station: e.target.value })} />
                <span className="err-msg">{errors.station}</span>
              </div>
              <div className="field">
                <label>お店の名前<span className="req">*</span></label>
                <input className={errors.name ? "error" : ""} value={editSpot.name} onChange={(e) => setEditSpot({ ...editSpot, name: e.target.value })} />
                <span className="err-msg">{errors.name}</span>
              </div>
            </div>
            <div className="row3">
              <div className="field">
                <label>メニュー<span className="req">*</span></label>
                <input className={errors.menu ? "error" : ""} value={editSpot.menu} onChange={(e) => setEditSpot({ ...editSpot, menu: e.target.value })} />
                <span className="err-msg">{errors.menu}</span>
              </div>
              <div className="field">
                <label>価格</label>
                <input value={editSpot.price.replace("円", "")}
                  onChange={(e) => { const val = e.target.value.replace(/[^0-9]/g, ""); setEditSpot({ ...editSpot, price: val ? val + "円" : "" }); }} />
              </div>
              <div className="field">
                <label>投稿者名</label>
                <input value={editSpot.author} onChange={(e) => setEditSpot({ ...editSpot, author: e.target.value })} />
              </div>
            </div>
            <div className="row1">
              <div className="field">
                <label>URL</label>
                <input value={editSpot.url} onChange={(e) => setEditSpot({ ...editSpot, url: e.target.value })} />
              </div>
            </div>
            <div className="row1">
              <div className="field">
                <label>コメント</label>
                <textarea value={editSpot.comment} onChange={(e) => setEditSpot({ ...editSpot, comment: e.target.value })} />
              </div>
            </div>
            <div className="stars-row" style={{ marginBottom: 16 }}>
              <label>評価<span className="req">*</span></label>
              {stars(editSpot.rating, (n) => setEditSpot({ ...editSpot, rating: n }))}
              <span className="err-msg">{errors.rating}</span>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={handleUpdate} style={{ flex: 1, padding: 10, background: "#E1F5EE", border: "1px solid #5DCAA5", borderRadius: 8, cursor: "pointer", fontWeight: 500 }}>保存</button>
              <button onClick={() => { setEditSpot(null); setErrors({}); }} style={{ flex: 1, padding: 10, background: "white", border: "1px solid #ddd", borderRadius: 8, cursor: "pointer" }}>キャンセル</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;