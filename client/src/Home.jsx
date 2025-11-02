import React, { useEffect, useState } from "react";

export default function Home({ user, setUser }) {
  const [videos, setVideos] = useState([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetch("/api/videos").then(r => r.json()).then(setVideos);
  }, []);

  const filtered = videos.filter(v => v.title.toLowerCase().includes(query.toLowerCase()));

  return (
    <div style={{ minHeight: "100vh", background: "#07070a", color: "#fff" }}>
      <header style={{ display: "flex", alignItems: "center", padding: 16, gap: 12 }}>
        <img src="/logo.png" alt="logo" style={{ width: 56, height: 56 }} />
        <h1 style={{ fontSize: 20 }}>Gbemisola Movies</h1>
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search..." style={{ marginLeft: 20, padding: 8, borderRadius: 6 }} />
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          {(user.role === "boss" || user.role === "bossboss") && (
            <button onClick={() => window.location.href = "/admin"} style={{ background: "#2b2d42", color: "#fff", padding: "8px 12px", borderRadius: 6, border: 0 }}>Admin Panel</button>
          )}
          <div style={{ alignSelf: "center" }}>{user.name} {user.role === "boss" ? "💖" : user.role === "bossboss" ? "💝" : "💗"}</div>
        </div>
      </header>

      <main style={{ padding: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 12 }}>
          {filtered.map(v => (
            <div key={v.id} style={{ background: "#0f1724", padding: 12, borderRadius: 8 }}>
              <img src={v.thumbnail || "/logo.png"} style={{ width: "100%", height: 120, objectFit: "cover" }} alt="" />
              <h3 style={{ marginTop: 8 }}>{v.title}</h3>
              <p style={{ color: "#9ca3af" }}>{v.duration} min • {v.views} views</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
        }
