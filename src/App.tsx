import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import { ThemeProvider } from './hooks/useTheme';
import AuthScreen from './components/AuthScreen';
import { PendingApproval } from './components/PendingApproval';
import { MainApp } from './components/MainApp';
import { ModeratorDashboard } from './components/ModeratorDashboard';

function AppContent() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function checkSession() {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user ?? null);
    if (session?.user) {
      await fetchProfile(session.user.id);
    }
    setLoading(false);
  }

  async function fetchProfile(userId: string) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (data) {
      setProfile(data);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#0095f6] border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <AuthScreen onAuthSuccess={() => {}} />;
  }

  // REGRA DIRETA: Força a entrada se for o seu e-mail de administrador
  if (user?.email === 'ruanlanches23@gmail.com' || profile?.is_moderator) {
    return <ModeratorDashboard profile={profile || { full_name: 'Ruan Moderador' }} onLogout={handleLogout} />;
  }

  // Pending approval
  if (profile && profile.status === 'pending') {
    return <PendingApproval profile={profile} onLogout={handleLogout} />;
  }

  // Approved user
  if (profile && profile.status === 'approved') {
    return <MainApp profile={profile} onLogout={handleLogout} />;
  }

  // User exists but no profile yet (fresh signup)
  if (user && !profile) {
    return <PendingApproval profile={{ full_name: 'Novo Usuário' }} onLogout={handleLogout} />;
  }

  return <PendingApproval profile={profile} onLogout={handleLogout} />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
