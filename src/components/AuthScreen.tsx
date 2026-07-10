import { useState, useEffect, useRef, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useTheme } from '../hooks/useTheme';
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
  useMotionTemplate,
} from 'framer-motion';

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
  {
    numero: '01',
    titulo: 'Credenciamento',
    desc: 'Envie seu certificado e assine o compromisso protocolar de honestidade perante a comissão.',
  },
  {
    numero: '02',
    titulo: 'Triagem Diplomática',
    desc: 'Uma comissão avalia compatibilidade de tratados, interesses mútuos e afinidades de longo prazo.',
  },
  {
    numero: '03',
    titulo: 'Credencial Ativa',
    desc: 'Início oficial das negociações afetivas em canais confidenciais, sob sua total soberania.',
  },
];

const RIBBONS = [
  { top: '10%', left: '6%', size: 46, duration: 5.4 },
  { top: '66%', left: '4%', size: 34, duration: 6.1 },
  { top: '16%', right: '5%', size: 40, duration: 5.8 },
  { top: '70%', right: '8%', size: 52, duration: 6.6 },
  { top: '40%', left: '2%', size: 26, duration: 4.9 },
];

function Ribbon({ pos, size, duration }: { pos: React.CSSProperties; size: number; duration: number }) {
  return (
    <motion.svg
      viewBox="0 0 64 64"
      style={{ width: size, height: size, position: 'absolute', ...pos }}
      animate={{ rotate: [-5, 5, -5] }}
      transition={{ duration, repeat: Infinity, ease: 'easeInOut' }}
      whileHover={{ scale: 1.3, rotate: 12 }}
      className="text-seal drop-shadow-sm cursor-default pointer-events-auto"
    >
      <path
        d="M32 32c-6-10-20-10-24-2-3 6 3 12 12 10-6 4-8 12-2 16 6 4 12-2 14-10 2 8 8 14 14 10 6-4 4-12-2-16 9 2 15-4 12-10-4-8-18-8-24 2z"
        fill="currentColor"
        opacity="0.8"
      />
      <circle cx="32" cy="32" r="4" fill="#fdfaf3" opacity="0.7" />
    </motion.svg>
  );
}

function Scratches() {
  const marks = useMemo(
    () =>
      Array.from({ length: 6 }).map(() => ({
        top: `${Math.random() * 90}%`,
        left: `${Math.random() * 90}%`,
        rotate: Math.random() * 60 - 30,
        length: Math.random() * 36 + 26,
      })),
    []
  );
  return (
    <div className="dark:hidden absolute inset-0 pointer-events-none overflow-hidden">
      {marks.map((m, i) => (
        <span
          key={i}
          className="absolute h-px bg-seal/25"
          style={{ top: m.top, left: m.left, width: m.length, transform: `rotate(${m.rotate}deg)` }}
        />
      ))}
    </div>
  );
}

/* ---------- reusable: reveal content as it arrives on screen while scrolling ---------- */
function RevealOnScroll({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.92', 'start 0.4'] });
  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [64, 0]);
  const blurVal = useTransform(scrollYProgress, [0, 1], [14, 0]);
  const filter = useTransform(blurVal, (v) => `blur(${v}px)`);
  return (
    <motion.div ref={ref} style={{ opacity, y, filter, transitionDelay: `${delay}s` }} className={className}>
      {children}
    </motion.div>
  );
}

/* ---------- reusable: magnetic button that leans toward the cursor ---------- */
function MagneticButton({
  children,
  onClick,
  className,
}: {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
}) {
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

/* ---------- dossier card: 3D tilt + cursor spotlight + floating icon ---------- */
function DossierCard({ item }: { item: (typeof DOSSIERS)[number] }) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(my, [0, 1], [10, -10]), { stiffness: 160, damping: 16 });
  const rotateY = useSpring(useTransform(mx, [0, 1], [-10, 10]), { stiffness: 160, damping: 16 });
  const xPercent = useTransform(mx, [0, 1], [0, 100]);
  const yPercent = useTransform(my, [0, 1], [0, 100]);
  const spotlight = useMotionTemplate`radial-gradient(240px circle at ${xPercent}% ${yPercent}%, rgba(212,175,55,0.22), transparent 70%)`;

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    mx.set((e.clientX - rect.left) / rect.width);
    my.set((e.clientY - rect.top) / rect.height);
  };
  const handleLeave = () => {
    mx.set(0.5);
    my.set(0.5);
  };

  return (
    <div style={{ perspective: 900 }}>
      <motion.div
        ref={ref}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        className="group relative p-6 border border-seal/20 dark:border-electric-500/15 bg-cream-light dark:bg-embassy/50 rounded-xl text-left overflow-hidden"
      >
        {/* cursor spotlight */}
        <motion.div style={{ background: spotlight }} className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* ID-card corner brackets */}
        <span className="absolute top-2 left-2 w-3 h-3 border-t border-l border-seal/70" />
        <span className="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-seal/70" />

        {/* holographic scanline on hover */}
        <span className="pointer-events-none absolute left-0 right-0 h-16 bg-gradient-to-b from-transparent via-electric-400/15 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-scan transition-opacity" />

        <div className="relative flex items-start justify-between mb-4">
          <div
            style={{ transform: 'translateZ(46px)' }}
            className="w-10 h-10 rounded-lg bg-electric-500/10 flex items-center justify-center text-lg border border-electric-500/10 shadow-lg"
          >
            {item.icone}
          </div>
          <span className="font-mono text-[9px] tracking-widest text-shimmer bg-[length:200%_auto] animate-shimmer uppercase">
            {item.codigo}
          </span>
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

/* ---------- ambient starfield, dark mode only ---------- */
function Starfield() {
  const stars = useMemo(
    () =>
      Array.from({ length: 46 }).map(() => ({
        top: Math.random() * 100,
        left: Math.random() * 100,
        size: Math.random() * 1.6 + 0.6,
        delay: Math.random() * 4,
        duration: Math.random() * 3 + 2.5,
      })),
    []
  );
  return (
    <div className="hidden dark:block absolute inset-0 overflow-hidden pointer-events-none">
      {stars.map((s, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-electric-300 animate-pulse-soft"
          style={{
            top: `${s.top}%`,
            left: `${s.left}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`,
            opacity: 0.5,
          }}
        />
      ))}
    </div>
  );
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

  // page scroll progress bar
  const { scrollYProgress: pageProgress } = useScroll();
  const progressScaleX = useSpring(pageProgress, { stiffness: 120, damping: 24, restDelta: 0.001 });

  // ambient background parallax
  const { scrollY } = useScroll();
  const gridY = useTransform(scrollY, [0, 800], [0, 140]);
  const glowLeftY = useTransform(scrollY, [0, 800], [0, -100]);
  const glowRightY = useTransform(scrollY, [0, 800], [0, 120]);

  // letter-pull hero: tall wrapper + sticky card, transformed by scroll progress
  const letterWrapRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: letterProgress } = useScroll({ target: letterWrapRef, offset: ['start start', 'end start'] });
  const letterY = useTransform(letterProgress, [0, 1], [0, -300]);
  const letterRotate = useTransform(letterProgress, [0, 1], [0, -9]);
  const letterScale = useTransform(letterProgress, [0, 0.6, 1], [1, 1.02, 0.8]);
  const letterOpacity = useTransform(letterProgress, [0, 0.7, 1], [1, 1, 0]);
  const revealOpacity = useTransform(letterProgress, [0.15, 0.55], [0, 1]);
  const revealY = useTransform(letterProgress, [0.15, 0.55], [40, 0]);

  // timeline connector path, tied to the protocol section's scroll progress
  const timelineRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: timelineProgress } = useScroll({ target: timelineRef, offset: ['start 0.75', 'end 0.4'] });
  const pathLength = useSpring(timelineProgress, { stiffness: 90, damping: 24 });

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

  const openModal = (m: AuthMode) => {
    setMode(m);
    setError(null);
    setMessage(null);
    setShowModal(true);
  };

  return (
    <div className="min-h-screen w-full bg-cream dark:bg-obsidian text-ink dark:text-slate-100 transition-colors duration-500 relative overflow-x-hidden selection:bg-electric-500/20">

      {/* scroll progress bar */}
      <motion.div
        style={{ scaleX: progressScaleX }}
        className="fixed top-0 left-0 right-0 h-[2px] origin-left z-40 bg-gradient-to-r from-electric-400 via-diplomat-500 to-seal"
      />

      {/* ambient circuit grid + starfield, dark mode only */}
      <motion.div
        style={{ y: gridY }}
        className="hidden dark:block absolute inset-0 bg-grid pointer-events-none [mask-image:radial-gradient(ellipse_60%_50%_at_50%_20%,black,transparent)]"
      />
      <Starfield />

      {/* ambient glows, dark mode only */}
      <motion.div style={{ y: glowLeftY }} className="hidden dark:block absolute top-[-10%] left-[-10%] w-[45vw] h-[45vw] bg-electric-500/10 rounded-full blur-[130px] pointer-events-none" />
      <motion.div style={{ y: glowRightY }} className="hidden dark:block absolute top-[10%] right-[-10%] w-[40vw] h-[40vw] bg-diplomat-500/10 rounded-full blur-[130px] pointer-events-none" />

      {/* HEADER */}
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-cream-light/70 dark:bg-obsidian/60 border-b border-seal/15 dark:border-electric-500/10">
        <div className="w-full max-w-6xl mx-auto px-6 md:px-8 py-4 flex items-center justify-between">
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-electric-500 to-diplomat-500 flex items-center justify-center shadow-lg shadow-electric-500/20 rotate-45">
              <span className="text-base text-white -rotate-45">◈</span>
            </div>
            <div className="leading-none">
              <h1 className="font-display text-2xl italic font-semibold tracking-tight text-ink dark:text-white">Deletinder</h1>
              <p className="hidden sm:block font-mono text-[9px] tracking-[0.25em] text-seal dark:text-seal-light/90 uppercase mt-0.5">
                Corpo Diplomático · Sênior
              </p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
            <button
              onClick={() => openModal('login')}
              className="px-5 py-2.5 bg-obsidian dark:bg-white text-white dark:text-obsidian font-bold rounded-lg text-[11px] uppercase tracking-widest hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer"
            >
              Entrar
            </button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={toggleTheme}
              className="w-10 h-10 bg-cream-deep/60 dark:bg-embassy rounded-lg border border-seal/25 dark:border-electric-500/20 flex items-center justify-center text-base cursor-pointer"
              aria-label="Alternar tema"
            >
              {theme === 'light' ? '✨' : '🌙'}
            </motion.button>
          </motion.div>
        </div>
      </header>

      {/* HERO — cream backdrop, ribbons, letter-pull scroll */}
      <div className="relative dark:hidden">
        <div className="absolute inset-0 bg-cream" />
        <Scratches />
        <div className="absolute inset-0 pointer-events-none">
          {RIBBONS.map((r, i) => (
            <Ribbon key={i} pos={r as React.CSSProperties} size={r.size} duration={r.duration} />
          ))}
        </div>
      </div>

      <main ref={letterWrapRef} className="relative z-10 w-full min-h-[170vh]">
        <div className="sticky top-24 w-full flex flex-col items-center px-6">
          <motion.div
            style={{ y: letterY, rotate: letterRotate, scale: letterScale, opacity: letterOpacity }}
            className="relative w-[300px] sm:w-[380px] aspect-[3/4]"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.82, rotateX: -18, filter: 'blur(14px)' }}
              animate={{ opacity: 1, scale: 1, rotateX: 0, filter: 'blur(0px)' }}
              transition={{ type: 'spring', stiffness: 80, damping: 16, delay: 0.15 }}
              className="relative w-full h-full rounded-sm bg-cream-light dark:bg-embassy border border-seal/40 shadow-[0_30px_60px_-15px_rgba(120,95,30,0.35)] dark:shadow-2xl px-8 py-10 flex flex-col items-center justify-center text-center overflow-hidden"
            >
              <div className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(circle_at_1px_1px,#000_1px,transparent_0)] [background-size:6px_6px] pointer-events-none" />
              <div className="absolute -left-10 top-10 w-[140%] h-8 bg-gradient-to-r from-seal-dark via-seal to-seal-light rotate-[-8deg] shadow-md" />
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full bg-gradient-to-br from-diplomat-400 to-diplomat-600 border-4 border-cream-light shadow-lg flex items-center justify-center text-white text-lg">
                ❤
              </div>

              <p className="font-mono text-[9px] tracking-[0.3em] text-seal-dark uppercase mt-8 mb-4">
                Ato Diplomático Nº 001/2026
              </p>
              <h2 className="font-display italic text-3xl sm:text-4xl font-semibold text-ink leading-tight">
                Diplomatize<br />seus encontros
              </h2>
              <p className="font-mono text-[9px] tracking-[0.2em] text-ink-soft uppercase mt-4">
                Networking afetivo · Tratados de amor sênior
              </p>
            </motion.div>
          </motion.div>

          <motion.div
            style={{ opacity: revealOpacity, y: revealY }}
            className="relative mt-10 flex flex-col items-center gap-5"
          >
            <p className="font-mono text-[10px] tracking-[0.3em] text-diplomat-500 uppercase">Credencial Liberada</p>
            <MagneticButton
              onClick={() => openModal('signup')}
              className="relative px-12 py-4 bg-gradient-to-r from-seal-dark via-seal to-diplomat-500 bg-[length:200%_auto] hover:bg-right text-white font-bold text-xs rounded-xl shadow-xl transition-[background-position] duration-500 tracking-widest uppercase cursor-pointer"
            >
              ✨ Simule o amor da sua vida
            </MagneticButton>
          </motion.div>
        </div>
      </main>

      {/* DOSSIER CARDS */}
      <section className="relative z-10 w-full max-w-5xl mx-auto px-6 pb-24 pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {DOSSIERS.map((item, idx) => (
            <RevealOnScroll key={item.titulo} delay={idx * 0.08}>
              <DossierCard item={item} />
            </RevealOnScroll>
          ))}
        </div>
      </section>

      {/* PROTOCOLO DE ADESÃO — scroll-drawn timeline */}
      <section ref={timelineRef} className="relative z-10 w-full max-w-3xl mx-auto px-6 pb-28">
        <RevealOnScroll className="text-center mb-14">
          <p className="font-mono text-[10px] tracking-[0.3em] text-seal uppercase mb-2">Protocolo Nº 07/2026</p>
          <h3 className="font-display italic text-3xl md:text-4xl font-semibold text-ink dark:text-white">Ordem de Adesão</h3>
        </RevealOnScroll>

        <div className="relative pl-10 md:pl-14">
          <svg className="absolute left-0 top-0 h-full w-8 md:w-10 overflow-visible" preserveAspectRatio="none">
            <motion.line
              x1="1" y1="0" x2="1" y2="100%"
              stroke="url(#treatyGradient)"
              strokeWidth="2"
              strokeLinecap="round"
              style={{ pathLength }}
            />
            <defs>
              <linearGradient id="treatyGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22e8ff" />
                <stop offset="50%" stopColor="#d4af37" />
                <stop offset="100%" stopColor="#ff2d78" />
              </linearGradient>
            </defs>
          </svg>

          <div className="flex flex-col gap-14">
            {PROTOCOLO.map((step, idx) => (
              <RevealOnScroll key={step.numero} delay={idx * 0.1} className="relative">
                <span className="absolute -left-10 md:-left-14 top-0 w-8 h-8 md:w-10 md:h-10 rounded-full bg-cream-light dark:bg-embassy border border-seal/50 flex items-center justify-center font-mono text-[10px] text-seal-dark dark:text-seal shadow-lg">
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
          <div className="relative py-14 px-8 rounded-2xl border border-seal/20 dark:border-electric-500/15 bg-cream-deep/40 dark:bg-embassy/40 overflow-hidden">
            <div className="absolute -inset-24 bg-gradient-to-r from-seal/10 via-transparent to-diplomat-500/10 blur-2xl pointer-events-none" />
            <p className="font-mono text-[10px] tracking-[0.3em] text-diplomat-500 dark:text-diplomat-400 uppercase mb-3">Sessão Extraordinária</p>
            <h3 className="font-display italic text-3xl md:text-4xl font-semibold text-ink dark:text-white mb-6">
              Pronto para ratificar seu próximo tratado?
            </h3>
            <MagneticButton
              onClick={() => openModal('signup')}
              className="relative px-10 py-3.5 bg-gradient-to-r from-seal-dark via-seal to-diplomat-500 bg-[length:200%_auto] hover:bg-right text-white font-bold text-xs rounded-xl shadow-xl tracking-widest uppercase cursor-pointer"
            >
              Abrir Credencial
            </MagneticButton>
          </div>
        </RevealOnScroll>
      </section>

      <footer className="relative z-10 w-full text-center py-6 text-[10px] font-mono tracking-wider text-ink-light dark:text-slate-500 border-t border-seal/15 dark:border-electric-500/10">
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