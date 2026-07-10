import { useState, useEffect, useLayoutEffect, useRef, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useTheme } from '../hooks/useTheme';
import { motion, AnimatePresence, useMotionValue, useSpring, useMotionTemplate } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

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

const PROTOCOLO = [
  { numero: '01', titulo: 'Credenciamento', desc: 'Envie seu certificado e assine o compromisso protocolar de honestidade perante a comissão.' },
  { numero: '02', titulo: 'Triagem Diplomática', desc: 'Uma comissão avalia compatibilidade de tratados, interesses mútuos e afinidades de longo prazo.' },
  { numero: '03', titulo: 'Credencial Ativa', desc: 'Início oficial das negociações afetivas em canais confidenciais, sob sua total soberania.' },
];

/* ---------- gold filigree bar, fixed top/bottom, seal-style flourish ---------- */
function FiligreeBar({ position }: { position: 'top' | 'bottom' }) {
  return (
    <div className={`fixed left-0 right-0 ${position === 'top' ? 'top-0' : 'bottom-0'} z-40 h-9 flex items-center justify-center pointer-events-none`}>
      <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-seal to-transparent" />
      <div className="relative flex items-center gap-2.5 bg-white px-4">
        <span className="w-1 h-1 rotate-45 bg-seal" />
        <span className="w-2 h-2 rotate-45 border border-seal" />
        <span className="w-1 h-1 rotate-45 bg-seal" />
      </div>
    </div>
  );
}

/* ---------- subtle gold particle field, no external deps ---------- */
function GoldParticles() {
  const dots = useMemo(
    () =>
      Array.from({ length: 28 }).map(() => ({
        left: `${Math.random() * 100}%`,
        size: Math.random() * 2 + 1.5,
        duration: Math.random() * 8 + 10,
        delay: Math.random() * 8,
        drift: Math.random() * 40 - 20,
      })),
    []
  );
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {dots.map((d, i) => (
        <motion.span
          key={i}
          className="absolute bottom-0 rounded-full bg-seal"
          style={{ left: d.left, width: d.size, height: d.size, opacity: 0.35 }}
          animate={{ y: ['0%', '-120%'], x: [0, d.drift], opacity: [0, 0.5, 0] }}
          transition={{ duration: d.duration, delay: d.delay, repeat: Infinity, ease: 'linear' }}
        />
      ))}
    </div>
  );
}

/* ---------- reusable: reveal content as it arrives on screen while scrolling ---------- */
function RevealOnScroll({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    gsap.fromTo(
      el,
      { opacity: 0, y: 60, filter: 'blur(10px)' },
      {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 88%' },
      }
    );
  }, []);
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

/* ---------- magnetic button ---------- */
function MagneticButton({ children, onClick, className }: { children: React.ReactNode; onClick: () => void; className?: string }) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 150, damping: 12 });
  const sy = useSpring(y, { stiffness: 150, damping: 12 });

  const handleMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    x.set((e.clientX - rect.left - rect.width / 2) * 0.35);
    y.set((e.clientY - rect.top - rect.height / 2) * 0.35);
  };
  const handleLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      ref={ref}
      style={{ x: sx, y: sy }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className={className}
    >
      {children}
    </motion.button>
  );
}

/* ---------- dossier card: 3D tilt + cursor spotlight + gold glow on hover + glassmorphism ---------- */
function DossierCard({ item, setRef }: { item: (typeof DOSSIERS)[number]; setRef: (el: HTMLDivElement | null) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rotateX = useSpring(useMotionValue(0), { stiffness: 160, damping: 16 });
  const rotateY = useSpring(useMotionValue(0), { stiffness: 160, damping: 16 });
  const xPercent = useTransformSafe(mx);
  const yPercent = useTransformSafe(my);
  const spotlight = useMotionTemplate`radial-gradient(240px circle at ${xPercent}% ${yPercent}%, rgba(212,175,55,0.25), transparent 70%)`;

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    mx.set(px);
    my.set(py);
    rotateX.set((0.5 - py) * 12);
    rotateY.set((px - 0.5) * 12);
  };
  const handleLeave = () => {
    mx.set(0.5);
    my.set(0.5);
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <div
      ref={(el) => {
        setRef(el);
      }}
      style={{ perspective: 900 }}
    >
      <motion.div
        ref={ref}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        className="group relative p-6 border border-seal/25 bg-white/60 dark:bg-embassy/40 backdrop-blur-md rounded-xl text-left overflow-hidden transition-shadow duration-300 hover:shadow-[0_0_28px_rgba(212,175,55,0.4)] hover:border-seal/70"
      >
        <motion.div style={{ background: spotlight }} className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <span className="absolute top-2 left-2 w-3 h-3 border-t border-l border-seal/70" />
        <span className="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-seal/70" />

        <div className="relative flex items-start justify-between mb-4">
          <div style={{ transform: 'translateZ(46px)' }} className="w-10 h-10 rounded-lg bg-seal/10 flex items-center justify-center text-lg border border-seal/20 shadow-lg">
            {item.icone}
          </div>
          <span className="font-mono text-[9px] tracking-widest text-seal-dark uppercase">{item.codigo}</span>
        </div>
        <h3 style={{ transform: 'translateZ(24px)' }} className="relative font-display italic text-xl font-semibold text-ink dark:text-white mb-2">
          {item.titulo}
        </h3>
        <p style={{ transform: 'translateZ(24px)' }} className="relative text-ink-soft dark:text-slate-400 text-[12px] leading-relaxed font-light">
          {item.desc}
        </p>
      </motion.div>
    </div>
  );
}

/* small helper so xPercent/yPercent read as 0-100 in the motion template above */
function useTransformSafe(v: ReturnType<typeof useMotionValue<number>>) {
  const out = useMotionValue(50);
  useEffect(() => {
    const unsub = v.on('change', (val) => out.set(val * 100));
    return unsub;
  }, [v, out]);
  return out;
}

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

  // ---- Lenis smooth scroll, wired into GSAP's ScrollTrigger ----
  useEffect(() => {
    const lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    function raf(time: number) {
      lenis.raf(time);
      ScrollTrigger.update();
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    lenis.on('scroll', ScrollTrigger.update);
    return () => lenis.destroy();
  }, []);

  // ---- Cena 1: carta pinada, girando no eixo Y conforme o scroll ----
  const pinRef = useRef<HTMLDivElement>(null);
  const letterRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const cardItemRefs = useRef<Array<HTMLDivElement | null>>([]);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(cardsRef.current, { autoAlpha: 0 });
      gsap.set(cardItemRefs.current, { y: -90, opacity: 0, rotate: () => gsap.utils.random(-8, 8) });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: pinRef.current,
          start: 'top top',
          end: '+=3200',
          scrub: true,
          pin: true,
          anticipatePin: 1,
        },
      });

      // a carta gira várias voltas no eixo Y enquanto dá zoom out
      tl.to(letterRef.current, { rotationY: 1440, scale: 0.3, transformPerspective: 1200, ease: 'none' }, 0)
        // some em fade perto do fim da rotação
        .to(letterRef.current, { autoAlpha: 0, ease: 'none' }, 0.82)
        // os cards entram em fade + caem na "mesa diplomática" com stagger
        .to(cardsRef.current, { autoAlpha: 1, ease: 'none' }, 0.84)
        .to(cardItemRefs.current, { y: 0, opacity: 1, rotate: 0, duration: 1, stagger: 0.18, ease: 'back.out(1.6)' }, 0.86);
    }, pinRef);

    return () => ctx.revert();
  }, []);

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
        if (!isOfAge) throw new Error('Você precisa confirmar que tem 18 anos ou mais para se cadastrar.');
        if (!certificateFile) throw new Error('Por favor, envie seu certificado');

        const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
        if (authError) throw authError;
        if (!authData.user) throw new Error('Erro ao criar conta');

        const fileExt = certificateFile.name.split('.').pop();
        const fileName = `${authData.user.id}/certificate.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('certificates').upload(fileName, certificateFile);
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

  const openModal = (m: AuthMode) => {
    setMode(m);
    setError(null);
    setMessage(null);
    setShowModal(true);
  };

  return (
    <div className="min-h-screen w-full bg-white dark:bg-obsidian text-ink dark:text-slate-100 relative overflow-x-hidden">
      <FiligreeBar position="top" />
      <FiligreeBar position="bottom" />

      {/* HEADER */}
      <header className="fixed top-9 left-0 right-0 z-30 bg-white/80 dark:bg-obsidian/70 backdrop-blur-xl border-b border-seal/15">
        <div className="w-full max-w-6xl mx-auto px-6 md:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-seal-dark to-seal flex items-center justify-center shadow-lg shadow-seal/30 rotate-45">
              <span className="text-base text-white -rotate-45">◈</span>
            </div>
            <div className="leading-none">
              <h1 className="font-display text-2xl italic font-semibold tracking-tight text-ink dark:text-white">Deletinder</h1>
              <p className="hidden sm:block font-mono text-[9px] tracking-[0.25em] text-seal-dark uppercase mt-0.5">Corpo Diplomático · Sênior</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => openModal('login')}
              className="px-5 py-2.5 bg-obsidian dark:bg-white text-white dark:text-obsidian font-bold rounded-lg text-[11px] uppercase tracking-widest hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer"
            >
              Entrar
            </button>
            <button
              onClick={toggleTheme}
              className="w-10 h-10 bg-seal/10 dark:bg-embassy rounded-lg border border-seal/25 flex items-center justify-center text-base cursor-pointer"
              aria-label="Alternar tema"
            >
              {theme === 'light' ? '✨' : '🌙'}
            </button>
          </div>
        </div>
      </header>

      {/* TELA 1 — a carta pinada girando no eixo Y conforme o scroll */}
      <section ref={pinRef} className="relative w-full h-screen flex items-center justify-center overflow-hidden">
        <GoldParticles />
        <div ref={letterRef} className="relative w-[300px] sm:w-[380px] aspect-[3/4]" style={{ transformStyle: 'preserve-3d' }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.7, y: 80, filter: 'blur(16px)' }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ type: 'spring', stiffness: 70, damping: 14, delay: 0.2 }}
            className="relative w-full h-full rounded-sm bg-white border border-seal/40 shadow-[0_30px_70px_-15px_rgba(120,95,30,0.4)] px-8 py-10 flex flex-col items-center justify-center text-center overflow-hidden"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full bg-gradient-to-br from-seal to-seal-dark border-4 border-white shadow-lg flex items-center justify-center text-white text-lg">
              ◈
            </div>
            <p className="font-mono text-[9px] tracking-[0.3em] text-seal-dark uppercase mt-8 mb-4">Ato Diplomático Nº 001/2026</p>
            <h2 className="font-display italic text-3xl sm:text-4xl font-semibold text-ink leading-tight">Diplomatizando<br />Encontros</h2>
            <p className="font-mono text-[9px] tracking-[0.2em] text-ink-soft uppercase mt-4">Networking afetivo · Tratados de amor sênior</p>
          </motion.div>
        </div>
      </section>

      {/* TELA 2 — cards, revelados após a rotação da carta */}
      <section ref={cardsRef} className="relative z-10 w-full max-w-5xl mx-auto px-6 pb-24 pt-32">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {DOSSIERS.map((item, idx) => (
            <DossierCard key={item.titulo} item={item} setRef={(el) => (cardItemRefs.current[idx] = el)} />
          ))}
        </div>
      </section>

      {/* PROTOCOLO DE ADESÃO */}
      <section className="relative z-10 w-full max-w-3xl mx-auto px-6 pb-28">
        <RevealOnScroll className="text-center mb-14">
          <p className="font-mono text-[10px] tracking-[0.3em] text-seal-dark uppercase mb-2">Protocolo Nº 07/2026</p>
          <h3 className="font-display italic text-3xl md:text-4xl font-semibold text-ink dark:text-white">Ordem de Adesão</h3>
        </RevealOnScroll>

        <div className="relative pl-10 md:pl-14">
          <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-seal via-seal/40 to-transparent" />
          <div className="flex flex-col gap-14">
            {PROTOCOLO.map((step) => (
              <RevealOnScroll key={step.numero} className="relative">
                <span className="absolute -left-10 md:-left-14 top-0 w-8 h-8 md:w-10 md:h-10 rounded-full bg-white dark:bg-embassy border border-seal/50 flex items-center justify-center font-mono text-[10px] text-seal-dark dark:text-seal shadow-lg">
                  {step.numero}
                </span>
                <div className="pb-1">
                  <h4 className="font-display italic text-2xl font-semibold text-ink dark:text-white mb-1.5">{step.titulo}</h4>
                  <p className="text-ink-soft dark:text-slate-400 text-[13px] leading-relaxed font-light max-w-md">{step.desc}</p>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative z-10 w-full max-w-3xl mx-auto px-6 pb-28 text-center">
        <RevealOnScroll>
          <div className="relative py-14 px-8 rounded-2xl border border-seal/25 bg-white/60 dark:bg-embassy/40 backdrop-blur-md overflow-hidden">
            <p className="font-mono text-[10px] tracking-[0.3em] text-seal-dark uppercase mb-3">Sessão Extraordinária</p>
            <h3 className="font-display italic text-3xl md:text-4xl font-semibold text-ink dark:text-white mb-6">Pronto para ratificar seu próximo tratado?</h3>
            <MagneticButton
              onClick={() => openModal('signup')}
              className="relative px-10 py-3.5 bg-gradient-to-r from-seal-dark via-seal to-seal-dark bg-[length:200%_auto] hover:bg-right text-white font-bold text-xs rounded-xl shadow-xl tracking-widest uppercase cursor-pointer"
            >
              Abrir Credencial
            </MagneticButton>
          </div>
        </RevealOnScroll>
      </section>

      <footer className="relative z-10 w-full text-center py-10 text-[10px] font-mono tracking-wider text-ink-light dark:text-slate-500 border-t border-seal/15">
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
              className="w-full max-w-sm max-h-[85vh] flex flex-col bg-white dark:bg-embassy border border-seal/25 rounded-2xl shadow-2xl relative overflow-hidden"
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
                  <p className="font-mono text-[10px] text-seal-dark mt-1.5 uppercase tracking-widest">
                    {mode === 'login' ? 'Credenciais Verificadas' : mode === 'signup' ? 'Requisição de Acesso' : 'Recuperação de Acesso'}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3">
                  {mode === 'signup' && (
                    <>
                      <input
                        type="text" placeholder="Nome completo" value={fullName}
                        onChange={(e) => setFullName(e.target.value)} required
                        className="w-full bg-slate-50 dark:bg-obsidian border border-seal/20 rounded-xl px-3.5 py-2.5 text-xs placeholder-slate-400 text-ink dark:text-white focus:outline-none focus:border-seal transition-colors"
                      />
                      <input
                        type="text" placeholder="Bio ou Filiação Acadêmica" value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-obsidian border border-seal/20 rounded-xl px-3.5 py-2.5 text-xs placeholder-slate-400 text-ink dark:text-white focus:outline-none focus:border-seal transition-colors"
                      />
                    </>
                  )}

                  <input
                    type="email" placeholder="E-mail de acesso" value={email}
                    onChange={(e) => setEmail(e.target.value)} required
                    className="w-full bg-slate-50 dark:bg-obsidian border border-seal/20 rounded-xl px-3.5 py-2.5 text-xs placeholder-slate-400 text-ink dark:text-white focus:outline-none focus:border-seal transition-colors"
                  />

                  {mode !== 'forgot_password' && (
                    <input
                      type="password" placeholder="Senha secreta" value={password}
                      onChange={(e) => setPassword(e.target.value)} required minLength={6}
                      className="w-full bg-slate-50 dark:bg-obsidian border border-seal/20 rounded-xl px-3.5 py-2.5 text-xs placeholder-slate-400 text-ink dark:text-white focus:outline-none focus:border-seal transition-colors"
                    />
                  )}

                  {mode === 'signup' && (
                    <>
                      <div className="pt-1">
                        <label className="block text-[10px] text-ink-light dark:text-slate-500 mb-1.5 font-semibold">Anexar Certificado ONU (PDF, JPG, PNG)</label>
                        <input
                          type="file" accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => setCertificateFile(e.target.files?.[0] || null)} required
                          className="w-full text-xs text-slate-500 file:mr-2.5 file:py-1.5 file:px-3 file:border-0 file:rounded-xl file:bg-slate-100 dark:file:bg-obsidian file:text-slate-700 dark:file:text-slate-300 file:text-[11px] file:font-bold hover:file:bg-seal hover:file:text-white cursor-pointer transition-colors"
                        />
                      </div>
                      <div className="flex items-start gap-2 pt-2.5 pb-0.5">
                        <input
                          type="checkbox" id="age-confirmation" checked={isOfAge}
                          onChange={(e) => setIsOfAge(e.target.checked)}
                          className="mt-0.5 h-3.5 w-3.5 rounded border-slate-300 text-seal focus:ring-seal cursor-pointer"
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
                    className="w-full mt-4 bg-gradient-to-r from-seal-dark to-seal text-white font-bold text-xs py-3 rounded-xl transition-all disabled:opacity-50 cursor-pointer hover:opacity-95"
                  >
                    {loading ? 'Processando...' : mode === 'login' ? 'Autenticar' : mode === 'signup' ? 'Enviar Pedido' : 'Enviar Link'}
                  </button>
                </form>

                {mode === 'login' && (
                  <div className="text-center mt-4">
                    <button
                      type="button"
                      onClick={() => { setMode('forgot_password'); setError(null); setMessage(null); }}
                      className="text-[11px] text-ink-light dark:text-slate-500 hover:text-seal-dark bg-transparent border-0 cursor-pointer"
                    >
                      Esqueceu seus dados de acesso?
                    </button>
                  </div>
                )}

                <div className="flex items-center my-4">
                  <div className="flex-1 h-px bg-seal/15" />
                  <span className="px-2.5 text-slate-400 dark:text-slate-600 text-[10px] font-bold">OU</span>
                  <div className="flex-1 h-px bg-seal/15" />
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
                    className="text-[11px] text-seal-dark font-bold hover:underline bg-transparent border-0 cursor-pointer"
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