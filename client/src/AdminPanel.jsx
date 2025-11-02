import React, { useEffect, useState } from "react";

export default function AdminPanel({ user }) {
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    fetch("/api/videos").then(r => r.json()).then(setVideos);
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Delete this video?")) return;
    const r = await fetch(`/api/videos/${id}`, { method: "DELETE", headers: { "X-User-Name": user.name } });
    if (r.ok) setVideos(v => v.filter(x => x.id !== id));
    else {
      const data = await r.json();
      alert(data.message || "Error");
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#06060a", color: "#fff", padding: 20 }}>
      <div style={{ maxWidth: 1000, margin: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h1>Admin Panel</h1>
          <div>{user.name} {user.role === "boss" ? "💖" : "💝"}</div>
        </div>

        <div style={{ marginTop: 16, background: "#0b1220", padding: 12, borderRadius: 8 }}>
          <h3>Videos</h3>
          <table style={{ width: "100%", marginTop: 8 }}>
            <thead style={{ color: "#9ca3af" }}>
              <tr><th>Title</th><th>Uploader</th><th>Views</th><th>Duration</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {videos.map(v => (
                <tr key={v.id} style={{ borderTop: "1px solid #1f2937" }}>
                  <td style={{ padding: 8 }}>{v.title}</td>
                  <td style={{ padding: 8 }}>{v.uploader}</td>
                  <td style={{ padding: 8 }}>{v.views}</td>
                  <td style={{ padding: 8 }}>{v.duration} min</td>
                  <td style={{ padding: 8 }}>
                    <button onClick={() => handleDelete(v.id)} style={{ background: "#ff4d4f", color: "#fff", border: 0, padding: "6px 10px", borderRadius: 6 }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
          }
