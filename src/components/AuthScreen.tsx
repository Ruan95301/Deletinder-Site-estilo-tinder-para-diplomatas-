import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useTheme } from '../hooks/useTheme';
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';

type AuthMode = 'login' | 'signup' | 'forgot_password';

const DOSSIERS = [
  {
    codigo: 'ATO Nº 001/2026',
    titulo: 'Tratados Bilaterais',
    desc: 'Chega de conversas superficiais. Aqui as afinidades são resolvidas por meio de acordos multilaterais e diplomacia do afeto.',
    icone: '📜',
  },
  {
    codigo: 'ATO Nº 002/2026',
    titulo: 'Pactos de Afinidade',
    desc: 'Encontre seu match sênior de acordo com afinidades de blocos econômicos, comissões de segurança e pactos globais.',
    icone: '❤️',
  },
  {
    codigo: 'ATO Nº 003/2026',
    titulo: 'Canais Confidenciais',
    desc: 'Salas de negociação direta e criptografadas para traçar planos e estabelecer alianças duradouras de delegação.',
    icone: '🥂',
  },
];

export function AuthScreen({ onAuthSuccess }: { onAuthSuccess: () => void }) {
  const [showModal, setShowModal] = useState(false);
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [certificateFile, setCertificateFile] = useState<File | null>(null);
  const [isOfAge, setIsOfAge] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const { theme, toggleTheme } = useTheme();

  // ---- scroll-linked parallax for the ambient grid/glow ----
  const { scrollY } = useScroll();
  const gridY = useTransform(scrollY, [0, 800], [0, 140]);
  const glowLeftY = useTransform(scrollY, [0, 800], [0, -100]);
  const glowRightY = useTransform(scrollY, [0, 800], [0, 120]);

  // ---- mouse tilt for the central emblem ----
  const emblemRef = useRef<HTMLDivElement>(null);
  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const springX = useSpring(tiltX, { stiffness: 120, damping: 12 });
  const springY = useSpring(tiltY, { stiffness: 120, damping: 12 });

  const handleEmblemMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = emblemRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    tiltY.set(px * 22);
    tiltX.set(py * -22);
  };
  const handleEmblemLeave = () => {
    tiltX.set(0);
    tiltY.set(0);
  };

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    if (showModal) {
      html.style.overflow = 'hidden';
      body.style.overflow = 'hidden';
    } else {
      html.style.overflow = '';
      body.style.overflow = '';
    }
    return () => {
      html.style.overflow = '';
      body.style.overflow = '';
    };
  }, [showModal]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onAuthSuccess();
      } else if (mode === 'forgot_password') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        setMessage('E-mail de recuperação enviado! Verifique sua caixa de entrada.');
      } else {
        if (!isOfAge) {
          throw new Error('Você precisa confirmar que tem 18 anos ou mais para se cadastrar.');
        }
        if (!certificateFile) {
          throw new Error('Por favor, envie seu certificado');
        }

        const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
        if (authError) throw authError;
        if (!authData.user) throw new Error('Erro ao criar conta');

        const fileExt = certificateFile.name.split('.').pop();
        const fileName = `${authData.user.id}/certificate.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('certificates')
          .upload(fileName, certificateFile);
        if (uploadError) throw uploadError;

        const { error: profileError } = await supabase
          .from('profiles')
          .insert({ id: authData.user.id, full_name: fullName, bio, email, status: 'pending' });
        if (profileError) throw profileError;

        const { error: certError = null } = await supabase
          .from('certificate_requests')
          .insert({ user_id: authData.user.id, certificate_url: fileName, status: 'pending' });
        if (certError) throw certError;

        onAuthSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full bg-white dark:bg-obsidian text-ink dark:text-slate-100 transition-colors duration-500 relative overflow-x-hidden selection:bg-electric-500/20">

      {/* ambient circuit grid, dark mode only */}
      <motion.div
        style={{ y: gridY }}
        className="hidden dark:block absolute inset-0 bg-grid pointer-events-none [mask-image:radial-gradient(ellipse_60%_50%_at_50%_20%,black,transparent)]"
      />

      {/* ambient glows */}
      <motion.div style={{ y: glowLeftY }} className="absolute top-[-10%] left-[-10%] w-[45vw] h-[45vw] bg-electric-500/10 dark:bg-electric-500/10 rounded-full blur-[130px] pointer-events-none" />
      <motion.div style={{ y: glowRightY }} className="absolute top-[10%] right-[-10%] w-[40vw] h-[40vw] bg-diplomat-500/10 rounded-full blur-[130px] pointer-events-none" />

      {/* HEADER */}
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-white/70 dark:bg-obsidian/60 border-b border-slate-200 dark:border-electric-500/10">
        <div className="w-full max-w-6xl mx-auto px-6 md:px-8 py-4 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2.5"
          >
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-electric-500 to-diplomat-500 flex items-center justify-center shadow-lg shadow-electric-500/20 rotate-45">
              <span className="text-base text-white -rotate-45">◈</span>
            </div>
            <div className="leading-none">
              <h1 className="font-display text-2xl italic font-semibold tracking-tight text-ink dark:text-white">Deletinder</h1>
              <p className="hidden sm:block font-mono text-[9px] tracking-[0.25em] text-seal dark:text-seal-light/90 uppercase mt-0.5">Corpo Diplomático · Sênior</p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
            <button
              onClick={() => { setMode('login'); setError(null); setMessage(null); setShowModal(true); }}
              className="px-5 py-2.5 bg-obsidian dark:bg-white text-white dark:text-obsidian font-bold rounded-lg text-[11px] uppercase tracking-widest hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer"
            >
              Entrar
            </button>

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={toggleTheme}
              className="w-10 h-10 bg-slate-100 dark:bg-embassy rounded-lg border border-slate-200 dark:border-electric-500/20 flex items-center justify-center text-base cursor-pointer"
              aria-label="Alternar tema"
            >
              {theme === 'light' ? '✨' : '🌙'}
            </motion.button>
          </motion.div>
        </div>
      </header>

      {/* HERO */}
      <main className="relative z-10 w-full max-w-4xl mx-auto px-6 pt-16 pb-8 md:pt-24 md:pb-14 flex flex-col items-center text-center">

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="font-mono text-[10px] tracking-[0.3em] text-diplomat-500 dark:text-diplomat-400 uppercase mb-6 flex items-center gap-2"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-diplomat-500 animate-pulse-soft" />
          Credencial Diplomática Ativa · Setor Afetivo
        </motion.p>

        {/* EMBLEM */}
        <div
          ref={emblemRef}
          onMouseMove={handleEmblemMove}
          onMouseLeave={handleEmblemLeave}
          className="relative w-32 h-32 mb-8 flex items-center justify-center shrink-0"
          style={{ perspective: 600 }}
        >
          {/* radar pings */}
          <span className="absolute inset-0 m-auto w-20 h-20 rounded-full border border-electric-500/40 animate-ping-slow" />
          <span className="absolute inset-0 m-auto w-20 h-20 rounded-full border border-electric-500/40 animate-ping-slow [animation-delay:1.3s]" />

          {/* orbiting embassy nodes */}
          <div className="absolute inset-0 m-auto w-1 h-1">
            <div className="absolute w-2 h-2 rounded-full bg-electric-400 shadow-[0_0_8px_2px_rgba(34,232,255,0.6)] animate-orbit" />
            <div className="absolute w-1.5 h-1.5 rounded-full bg-seal shadow-[0_0_8px_2px_rgba(212,175,55,0.6)] animate-orbit-reverse" />
          </div>

          <motion.div
            style={{ rotateX: springX, rotateY: springY, transformStyle: 'preserve-3d' }}
            className="relative w-20 h-20 rounded-2xl bg-obsidian dark:bg-embassy border border-seal/40 shadow-2xl flex items-center justify-center"
          >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-electric-500/15 to-diplomat-500/15" />
            <svg className="w-9 h-9 text-electric-400 drop-shadow-[0_0_8px_rgba(34,232,255,0.6)] relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.4} d="M12 21c-4-2.6-7-6.2-7-10.2C5 7 8 4 12 4s7 3 7 6.8c0 4-3 7.6-7 10.2z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M9 10.5c0-1.4 1.2-2.3 2.3-1.7.3.2.5.4.7.7.2-.3.4-.5.7-.7 1.1-.6 2.3.3 2.3 1.7 0 1.5-1.5 2.6-3 3.6-1.5-1-3-2.1-3-3.6z" />
            </svg>
          </motion.div>
        </div>

        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="font-display italic text-5xl md:text-7xl font-semibold tracking-tight mb-4 text-ink dark:text-white px-2"
        >
          Diplomatize<br className="hidden md:block" /> seus encontros
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="font-mono text-[11px] md:text-xs text-ink-soft dark:text-slate-400 max-w-sm mx-auto mb-10 leading-relaxed px-4 uppercase tracking-[0.15em]"
        >
          Networking afetivo e tratados de amor sênior
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-electric-500 to-diplomat-500 rounded-xl blur-lg opacity-40" />
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => { setMode('signup'); setError(null); setMessage(null); setShowModal(true); }}
            className="relative px-12 py-4 bg-gradient-to-r from-electric-500 via-diplomat-500 to-electric-500 bg-[length:200%_auto] hover:bg-right text-white font-bold text-xs rounded-xl shadow-xl transition-all duration-500 tracking-widest uppercase cursor-pointer"
          >
            ✨ Simule o amor da sua vida
          </motion.button>
        </motion.div>
      </main>

      {/* DOSSIER CARDS */}
      <section className="relative z-10 w-full max-w-5xl mx-auto px-6 pb-24 pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {DOSSIERS.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ delay: idx * 0.12, type: 'spring', stiffness: 70 }}
              className="group relative p-6 border border-slate-200 dark:border-electric-500/15 bg-white dark:bg-embassy/50 rounded-xl text-left overflow-hidden"
            >
              {/* ID-card corner brackets */}
              <span className="absolute top-2 left-2 w-3 h-3 border-t border-l border-seal/70" />
              <span className="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-seal/70" />

              {/* holographic scanline on hover */}
              <span className="pointer-events-none absolute left-0 right-0 h-16 bg-gradient-to-b from-transparent via-electric-400/15 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-scan transition-opacity" />

              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-electric-500/10 flex items-center justify-center text-lg border border-electric-500/10">
                  {item.icone}
                </div>
                <span className="font-mono text-[9px] tracking-widest text-shimmer bg-[length:200%_auto] animate-shimmer uppercase">
                  {item.codigo}
                </span>
              </div>
              <h3 className="font-display italic text-xl font-semibold text-ink dark:text-white mb-2">{item.titulo}</h3>
              <p className="text-ink-soft dark:text-slate-400 text-[12px] leading-relaxed font-light">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <footer className="relative z-10 w-full text-center py-6 text-[10px] font-mono tracking-wider text-ink-light dark:text-slate-500 border-t border-slate-200 dark:border-electric-500/10">
        <p>© 2026 DELETINDER · PERMISSÃO INSTITUCIONAL SOBERANA RESERVADA PARA MAIORES DE 18 ANOS</p>
      </footer>

      {/* AUTH MODAL */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 bg-obsidian/60 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="w-full max-w-sm max-h-[85vh] flex flex-col bg-white dark:bg-embassy border border-slate-200 dark:border-electric-500/20 rounded-2xl shadow-2xl relative overflow-hidden"
            >
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white font-bold text-sm bg-slate-100 dark:bg-obsidian w-6 h-6 rounded-lg flex items-center justify-center cursor-pointer border-0 z-50 transition-colors"
              >
                ✕
              </button>

              <div className="flex-1 overflow-y-auto px-8 py-8">
                <div className="text-center mb-5">
                  <div className="flex justify-center mb-1.5 text-xl">◈</div>
                  <h1 className="font-display italic text-3xl font-semibold text-ink dark:text-white">Deletinder</h1>
                  <p className="font-mono text-[10px] text-seal dark:text-seal-light/80 mt-1.5 uppercase tracking-widest">
                    {mode === 'login' ? 'Credenciais Verificadas' : mode === 'signup' ? 'Requisição de Acesso' : 'Recuperação de Acesso'}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3">
                  {mode === 'signup' && (
                    <>
                      <input
                        type="text" placeholder="Nome completo" value={fullName}
                        onChange={(e) => setFullName(e.target.value)} required
                        className="w-full bg-slate-50 dark:bg-obsidian border border-slate-200 dark:border-electric-500/15 rounded-xl px-3.5 py-2.5 text-xs placeholder-slate-400 text-ink dark:text-white focus:outline-none focus:border-electric-500 transition-colors"
                      />
                      <input
                        type="text" placeholder="Bio ou Filiação Acadêmica" value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-obsidian border border-slate-200 dark:border-electric-500/15 rounded-xl px-3.5 py-2.5 text-xs placeholder-slate-400 text-ink dark:text-white focus:outline-none focus:border-electric-500 transition-colors"
                      />
                    </>
                  )}

                  <input
                    type="email" placeholder="E-mail de acesso" value={email}
                    onChange={(e) => setEmail(e.target.value)} required
                    className="w-full bg-slate-50 dark:bg-obsidian border border-slate-200 dark:border-electric-500/15 rounded-xl px-3.5 py-2.5 text-xs placeholder-slate-400 text-ink dark:text-white focus:outline-none focus:border-electric-500 transition-colors"
                  />

                  {mode !== 'forgot_password' && (
                    <input
                      type="password" placeholder="Senha secreta" value={password}
                      onChange={(e) => setPassword(e.target.value)} required minLength={6}
                      className="w-full bg-slate-50 dark:bg-obsidian border border-slate-200 dark:border-electric-500/15 rounded-xl px-3.5 py-2.5 text-xs placeholder-slate-400 text-ink dark:text-white focus:outline-none focus:border-electric-500 transition-colors"
                    />
                  )}

                  {mode === 'signup' && (
                    <>
                      <div className="pt-1">
                        <label className="block text-[10px] text-ink-light dark:text-slate-500 mb-1.5 font-semibold">Anexar Certificado ONU (PDF, JPG, PNG)</label>
                        <input
                          type="file" accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => setCertificateFile(e.target.files?.[0] || null)} required
                          className="w-full text-xs text-slate-500 file:mr-2.5 file:py-1.5 file:px-3 file:border-0 file:rounded-xl file:bg-slate-100 dark:file:bg-obsidian file:text-slate-700 dark:file:text-slate-300 file:text-[11px] file:font-bold hover:file:bg-electric-500 hover:file:text-white cursor-pointer transition-colors"
                        />
                      </div>

                      <div className="flex items-start gap-2 pt-2.5 pb-0.5">
                        <input
                          type="checkbox" id="age-confirmation" checked={isOfAge}
                          onChange={(e) => setIsOfAge(e.target.checked)}
                          className="mt-0.5 h-3.5 w-3.5 rounded border-slate-300 text-electric-500 focus:ring-electric-500 cursor-pointer"
                        />
                        <label htmlFor="age-confirmation" className="text-[11px] leading-tight text-ink-light dark:text-slate-500 select-none cursor-pointer">
                          Declaro que possuo <strong>18 anos ou mais</strong> e assumo total responsabilidade legal.
                        </label>
                      </div>
                    </>
                  )}

                  {error && <p className="text-red-500 text-xs text-center pt-1.5 font-semibold">{error}</p>}
                  {message && <p className="text-green-500 text-xs text-center pt-1.5 font-semibold">{message}</p>}

                  <button
                    type="submit" disabled={loading}
                    className="w-full mt-4 bg-gradient-to-r from-electric-500 to-diplomat-500 text-white font-bold text-xs py-3 rounded-xl transition-all disabled:opacity-50 cursor-pointer hover:opacity-95"
                  >
                    {loading ? 'Processando...' : mode === 'login' ? 'Autenticar' : mode === 'signup' ? 'Enviar Pedido' : 'Enviar Link'}
                  </button>
                </form>

                {mode === 'login' && (
                  <div className="text-center mt-4">
                    <button
                      type="button"
                      onClick={() => { setMode('forgot_password'); setError(null); setMessage(null); }}
                      className="text-[11px] text-ink-light dark:text-slate-500 hover:text-electric-500 bg-transparent border-0 cursor-pointer"
                    >
                      Esqueceu seus dados de acesso?
                    </button>
                  </div>
                )}

                <div className="flex items-center my-4">
                  <div className="flex-1 h-px bg-slate-200 dark:bg-electric-500/10" />
                  <span className="px-2.5 text-slate-400 dark:text-slate-600 text-[10px] font-bold">OU</span>
                  <div className="flex-1 h-px bg-slate-200 dark:bg-electric-500/10" />
                </div>

                <div className="text-center text-xs pb-1">
                  <span className="text-ink-light dark:text-slate-500 text-[11px]">
                    {mode === 'login' ? 'Ainda não é credenciado?' : mode === 'signup' ? 'Já possui cadastro ativo?' : 'Lembrou seus dados?'}
                  </span>{' '}
                  <button
                    type="button"
                    onClick={() => {
                      if (mode === 'login') setMode('signup'); else setMode('login');
                      setIsOfAge(false); setError(null); setMessage(null);
                    }}
                    className="text-[11px] text-electric-500 font-bold hover:underline bg-transparent border-0 cursor-pointer"
                  >
                    {mode === 'login' ? 'Cadastre-se' : 'Conecte-se'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}