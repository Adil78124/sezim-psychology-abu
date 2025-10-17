import React, { useState, useEffect } from "react";
import { auth } from "../../firebase";
import Login from "../../components/Login/Login";
import AdminPanel from "../../components/AdminPanel/AdminPanel";

export default function AdminPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(u => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <p>Загрузка...</p>
      </div>
    );
  }

  return user ? <AdminPanel /> : <Login onLogin={() => window.location.reload()} />;
}

