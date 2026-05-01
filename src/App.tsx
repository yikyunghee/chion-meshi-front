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

const initForm = { station: "", name: "", menu: "", price: "", rating: 0, comment: "", url: "", author: "" };

function App() {
  const [spots, setSpots] = useState<Spot[]>([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [form, setForm] = useState(initForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("https://chion-meshi-map-production.up.railway.app/api/spots")
      .then((res) => res.json())
      .then((data) => setSpots(data));
  }, []);

  const stations = [...new Set(spots.map((s) => s.station))];
  const filtered = activeFilter === "all" ? spots : spots.filter((s) => s.station === activeFilter);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.station) e.station = "駅名を入力してください";
    if (!form.name) e.name = "お店の名前を入力してください";
    if (!form.menu) e.menu = "メニューを入力してください";
    if (!form.rating) e.rating = "評価を選んでください";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    const res = await fetch("https://chion-meshi-map-production.up.railway.app/api/spots", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const newSpot = await res.json();
    setSpots([newSpot, ...spots]);
    setForm(initForm);
    setErrors({});
  };

  const stars = (n: number) =>
    [1,2,3,4,5].map((i) => (
      <span key={i} style={{ color: i <= n ? "#EF9F27" : "#ccc" }}>★</span>
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
          <input
            placeholder="例: 950"
            value={form.price.replace("円", "")}
            onChange={(e) => {
              const val = e.target.value.replace(/[^0-9]/g, "");
              setForm({ ...form, price: val ? val + "円" : "" });
            }}
          />
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
          {[1,2,3,4,5].map((n) => (
            <span key={n} className={`star ${n <= form.rating ? "on" : ""}`} onClick={() => setForm({ ...form, rating: n })}>★</span>
          ))}
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
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;