import React, { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import Login from "../../components/Login/Login";
import AdminPanel from "../../components/AdminPanel/AdminPanel";
import SupabaseTest from "../../components/SupabaseTest/SupabaseTest";

export default function AdminPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Получаем текущего пользователя
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    getCurrentUser();

    // Слушаем изменения аутентификации
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
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

  return (
    <div>
      <SupabaseTest />
      {user ? <AdminPanel /> : <Login onLogin={() => window.location.reload()} />}
    </div>
  );
}

