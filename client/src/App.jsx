import React, { useState, useEffect } from "react";
import Login from "./Login";
import Home from "./Home";

export default function App() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    const raw = localStorage.getItem("gb_user");
    if (raw) setUser(JSON.parse(raw));
  }, []);
  if (!user) return <Login onLogin={u => { setUser(u); localStorage.setItem("gb_user", JSON.stringify(u)); }} />;
  return <Home user={user} setUser={setUser} />;
}
