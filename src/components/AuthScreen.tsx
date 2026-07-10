import { useState, useEffect, useLayoutEffect, useRef, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useTheme } from '../hooks/useTheme';
import { motion, AnimatePresence, useMotionValue, useSpring, useMotionTemplate } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { cn } from '../utils/cn';
import { FileText, ShieldAlert, MailOpen, Users, Globe2, CheckCircle2, ChevronRight, Sun, Moon } from 'lucide-react';
gsap.registerPlugin(ScrollTrigger);

type AuthMode = 'login' | 'signup' | 'forgot_password';
const DOSSIERS = [
  {
    codigo: 'ATO Nº 002/2026',
    titulo: 'Tratados Bilaterais',
    desc: 'O primeiro encontro é uma negociação de bom gosto: duas biografias colocadas à mesa, interesses declarados, fronteiras respeitadas — antes de qualquer promessa.',
    icone: FileText,
  },
  {
    codigo: 'ATO Nº 003/2026',
    titulo: 'Canais Confidenciais',
    desc: 'Um gabinete reservado, longe de olhares curiosos, onde a conversa amadurece no seu próprio tempo — sob sigilo de Estado.',
    icone: ShieldAlert,
  },
  {
    codigo: 'ATO Nº 004/2026',
    titulo: 'A Carta de Intenções',
    desc: 'Onde a diplomacia abre portas para o amor. Um espaço de agenciamento afetivo de alto nível, desenhado especificamente para conexões maduras.',
    icone: MailOpen,
  },
];

const STATS = [
  { numero: '12.400+', label: 'Credenciados Ativos', icone: Users },
  { numero: '38', label: 'Delegações Regionais', icone: Globe2 },
  { numero: '94%', label: 'Taxa de Sucesso', icone: CheckCircle2 },
];
const PROTOCOLO = [
  { numero: '01', titulo: 'Credenciamento', desc: 'Envie seu certificado e assine o compromisso protocolar de honestidade perante a comissão.' },
  { numero: '02', titulo: 'Triagem Diplomática', desc: 'Uma comissão avalia compatibilidade de tratados, interesses mútuos e afinidades de longo prazo.' },
  { numero: '03', titulo: 'Credencial Ativa', desc: 'Início oficial das negociações afetivas em canais confidenciais, sob sua total soberania.' },
];

function Logo({ size = 40, className = '' }: { size?: number; className?: string }) {
  const leafPoints = [
    { x: 46, y: 86, rot: -70 },
    { x: 40, y: 78, rot: -55 },
    { x: 35, y: 68, rot: -40 },
    { x: 31, y: 56, rot: -25 },
    { x: 29, y: 44, rot: -10 },
    { x: 29, y: 32, rot: 5 },
    { x: 31, y: 22, rot: 20 },
  ];

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
      <defs>
        <linearGradient id="dd-flame" x1="50" y1="20" x2="50" y2="58" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7ceaff" />
          <stop offset="55%" stopColor="#00d4f5" />
          <stop offset="100%" stopColor="#00a8c9" />
        </linearGradient>
        <linearGradient id="dd-gold" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f4d78c" />
          <stop offset="100%" stopColor="#9c7a1f" />
        </linearGradient>
      </defs>
      <g fill="url(#dd-gold)">
        {leafPoints.map((p, i) => (
          <ellipse key={`l-${i}`} cx={p.x} cy={p.y} rx={5.2 - i * 0.35} ry={2.2} transform={`rotate(${p.rot} ${p.x} ${p.y})`} />
        ))}
        {leafPoints.map((p, i) => (
          <ellipse key={`r-${i}`} cx={100 - p.x} cy={p.y} rx={5.2 - i * 0.35} ry={2.2} transform={`rotate(${-p.rot} ${100 - p.x} ${p.y})`} />
        ))}
      </g>
      <circle cx="50" cy="53" r="20" fill="none" stroke="url(#dd-gold)" strokeWidth="1.4" opacity="0.85" />
      <ellipse cx="50" cy="53" rx="20" ry="7" fill="none" stroke="url(#dd-gold)" strokeWidth="0.8" opacity="0.55" />
      <ellipse cx="50" cy="53" rx="9" ry="20" fill="none" stroke="url(#dd-gold)" strokeWidth="0.8" opacity="0.55" />
      <line x1="30" y1="53" x2="70" y2="53" stroke="url(#dd-gold)" strokeWidth="0.8" opacity="0.55" />
      <path d="M50,58 C44,50 44,40 50,24 C56,40 56,50 50,58 Z" fill="url(#dd-flame)" />
    </svg>
  );
}
function GlowLogo({ size = 40, className = '' }: { size?: number; className?: string }) {
  return (
    <motion.div
      animate={{
        filter: [
          'drop-shadow(0 0 2px rgba(0,212,245,0.35))',
          'drop-shadow(0 0 10px rgba(0,212,245,0.75))',
          'drop-shadow(0 0 2px rgba(0,212,245,0.35))',
        ],
      }}
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      className={className}
    >
      <Logo size={size} />
    </motion.div>
  );
}

function FiligreeBar({ position }: { position: 'top' | 'bottom' }) {
  return (
    <div className={cn(
      "fixed left-0 right-0 z-40 h-9 flex items-center justify-center pointer-events-none",
      position === 'top' ? 'top-0' : 'bottom-0'
    )}>
      <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
      <div className="relative flex items-center gap-2.5 bg-white dark:bg-neutral-950 px-4">
        <span className="w-1 h-1 rotate-45 bg-amber-500" />
        <span className="w-2 h-2 rotate-45 border border-amber-500/60" />
        <span className="w-1 h-1 rotate-45 bg-amber-500" />
      </div>
    </div>
  );
}

function GoldParticles() {
  const dots = useMemo(
    () =>
      Array.from({ length: 28 }).map(() => ({
        left: `${Math.random() * 100}%`,
        size: Math.random() * 2 + 1.5,
        duration: Math.random() * 8 + 10,
        delay: Math.random() * 8,
        drift: Math.random() * 40 - 20,
        color: Math.random() > 0.65 ? 'bg-cyan-400' : 'bg-amber-500',
      })),
    []
  );
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {dots.map((d, i) => (
        <motion.span
          key={i}
          className={cn("absolute bottom-0 rounded-full", d.color)}
          style={{ left: d.left, width: d.size, height: d.size, opacity: 0.35 }}
          animate={{ y: ['0%', '-120%'], x: [0, d.drift], opacity: [0, 0.5, 0] }}
          transition={{ duration: d.duration, delay: d.delay, repeat: Infinity, ease: 'linear' }}
        />
      ))}
    </div>
  );
}
function RevealOnScroll({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { opacity: 0, y: 60, filter: 'blur(10px)' },
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' },
        }
      );
    }, el);
    return () => ctx.revert();
  }, []);
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

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
function DossierCard({ item }: { item: typeof DOSSIERS[number] }) {
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

  const IconComponent = item.icone;

  return (
    <div style={{ perspective: 900 }}>
      <motion.div
        ref={ref}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        className="group relative p-6 border border-amber-500/25 bg-white/60 dark:bg-neutral-900/40 backdrop-blur-md rounded-xl text-left overflow-hidden transition-shadow duration-300 hover:shadow-[0_0_28px_rgba(212,175,55,0.4)] hover:border-amber-500/70"
      >
        <motion.div style={{ background: spotlight }} className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <span className="absolute top-2 left-2 w-3 h-3 border-t border-l border-amber-500/70" />
        <span className="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-amber-500/70" />
        <div className="relative flex items-start justify-between mb-4">
          <div style={{ transform: 'translateZ(46px)' }} className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center border border-amber-500/20 shadow-lg text-amber-500">
            <IconComponent className="w-5 h-5" />
          </div>
          <span className="font-mono text-[9px] tracking-widest text-amber-600 uppercase">{item.codigo}</span>
        </div>
        <h3 style={{ transform: 'translateZ(24px)' }} className="relative font-serif italic text-xl font-semibold text-neutral-900 dark:text-white mb-2">
          {item.titulo}
        </h3>
        <p style={{ transform: 'translateZ(24px)' }} className="relative text-neutral-600 dark:text-neutral-400 text-[12px] leading-relaxed font-light">
          {item.desc}
        </p>
      </motion.div>
    </div>
  );
}

function useTransformSafe(v: ReturnType<typeof useMotionValue<number>>) {
  const out = useMotionValue(50);
  useEffect(() => {
    const unsub = v.on('change', (val) => out.set(val * 100));
    return unsub;
  }, [v, out]);
  return out;
}

function PopReveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { opacity: 0, scale: 0.92, y: 30 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          delay: delay,
          duration: 0.7,
          ease: 'back.out(1.2)',
          scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' },
        }
      );
    }, el);
    return () => ctx.revert();
  }, [delay]);
  return <div ref={ref}>{children}</div>;
}
export default function AuthScreen({ onAuthSuccess }: { onAuthSuccess: () => void }) {
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

  const pinRef = useRef<HTMLDivElement>(null);
  const letterRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: pinRef.current,
          start: 'top top',
          end: '+=1300',
          scrub: 0.6,
          pin: true,
          anticipatePin: 1,
        },
      });
      tl.to(letterRef.current, { rotationZ: 640, scale: 0.32, ease: 'none' }, 0)
        .to(letterRef.current, { autoAlpha: 0, ease: 'none' }, 0.78);
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

        const { error: profileError = null } = await supabase
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
    <div className="min-h-screen w-full bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 relative overflow-x-hidden selection:bg-amber-500/30">
      <FiligreeBar position="top" />
      <FiligreeBar position="bottom" />

      <header className="fixed top-9 left-0 right-0 z-30 bg-white/80 dark:bg-neutral-950/70 backdrop-blur-xl border-b border-amber-500/15">
        <div className="w-full max-w-6xl mx-auto px-6 md:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <GlowLogo size={40} />
            <div className="leading-none">
              <h1 className="font-serif text-2xl italic font-semibold tracking-tight text-neutral-900 dark:text-white">Deletinder</h1>
              <p className="hidden sm:block font-mono text-[9px] tracking-[0.25em] text-amber-600 uppercase mt-0.5">Relações Amorosas Soberanas</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => openModal('login')}
              className="px-5 py-2.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold rounded-lg text-[11px] uppercase tracking-widest hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer"
            >
              Entrar
            </button>
            <button
              onClick={toggleTheme}
              className="w-10 h-10 bg-amber-500/10 dark:bg-neutral-900 rounded-lg border border-amber-500/25 flex items-center justify-center text-base cursor-pointer text-amber-500"
              aria-label="Alternar tema"
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      <section ref={pinRef} className="relative w-full h-screen flex items-center justify-center overflow-hidden">
        <GoldParticles />
        <div ref={letterRef} className="relative w-[300px] sm:w-[380px] aspect-[3/4]" style={{ transformStyle: 'preserve-3d' }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.7, y: 80, filter: 'blur(16px)' }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ type: 'spring', stiffness: 70, damping: 14, delay: 0.2 }}
            className="relative w-full h-full rounded-sm bg-stone-100 dark:bg-neutral-900 border-[3px] border-double border-amber-500/70 shadow-[0_30px_70px_-15px_rgba(120,95,30,0.45)] px-8 py-10 flex flex-col items-center justify-center text-center overflow-hidden"
            style={{
              backfaceVisibility: 'hidden',
              backgroundImage:
                'repeating-linear-gradient(135deg, rgba(156,122,31,0.035) 0px, rgba(156,122,31,0.035) 1px, transparent 1px, transparent 6px)',
            }}
          >
            <div className="absolute inset-2 border border-amber-500/35 pointer-events-none" />
            <span className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-amber-500/70 pointer-events-none" />
            <span className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-amber-500/70 pointer-events-none" />
            <span className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-amber-500/70 pointer-events-none" />
            <span className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-amber-500/70 pointer-events-none" />
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.06] pointer-events-none">
              <Logo size={220} />
            </div>
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-stone-100 dark:bg-neutral-900 border-4 border-white dark:border-neutral-800 shadow-[0_8px_24px_rgba(156,122,31,0.35)] flex items-center justify-center ring-1 ring-amber-500/60">
              <GlowLogo size={40} />
            </div>
            <p className="relative font-mono text-[9px] tracking-[0.3em] text-amber-600 uppercase mt-8 mb-4">Ato Diplomático Nº 001/2026</p>
            <h2 className="relative font-serif italic text-3xl sm:text-4xl font-semibold text-neutral-900 dark:text-white leading-tight">Diplomatizando<br />Encontros</h2>
            <p className="relative font-mono text-[9px] tracking-[0.2em] text-neutral-500 uppercase mt-4">Onde a diplomacia abre portas para o amor</p>
          </motion.div>
        </div>
      </section>

      <section className="relative z-10 w-full max-w-5xl mx-auto px-6 pb-24 pt-32">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {DOSSIERS.map((item, idx) => (
            <PopReveal key={item.titulo} delay={idx * 0.06}>
              <DossierCard item={item} />
            </PopReveal>
          ))}
        </div>
      </section>

      <section className="relative z-10 w-full max-w-4xl mx-auto px-6 pb-24">
        <RevealOnScroll className="grid grid-cols-3 gap-4 md:gap-10 py-10 border-y border-amber-500/20">
          {STATS.map((s) => {
            const StatIcon = s.icone;
            return (
              <div key={s.label} className="text-center flex flex-col items-center justify-center">
                <div className="p-2 rounded-full bg-amber-500/5 border border-amber-500/10 mb-2 text-amber-500">
                  <StatIcon className="w-4 h-4" />
                </div>
                <p className="font-serif italic text-2xl md:text-4xl font-semibold text-amber-600 dark:text-amber-500">{s.numero}</p>
                <p className="font-mono text-[8px] md:text-[10px] tracking-[0.15em] md:tracking-[0.2em] text-neutral-500 dark:text-neutral-400 uppercase mt-2">{s.label}</p>
              </div>
            );
          })}
        </RevealOnScroll>
      </section>
      <section className="relative z-10 w-full max-w-3xl mx-auto px-6 pb-28">
        <RevealOnScroll className="text-center mb-14">
          <p className="font-mono text-[10px] tracking-[0.3em] text-amber-600 uppercase mb-2">Protocolo Nº 07/2026</p>
          <h3 className="font-serif italic text-3xl md:text-4xl font-semibold text-neutral-900 dark:text-white">Ordem de Adesão</h3>
        </RevealOnScroll>
        <div className="relative pl-10 md:pl-14">
          <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-amber-500 via-amber-500/40 to-transparent" />
          <div className="flex flex-col gap-14">
            {PROTOCOLO.map((step) => (
              <RevealOnScroll key={step.numero} className="relative">
                <motion.span
                  initial={{ opacity: 0, scale: 1.6, rotate: -12 }}
                  whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                  viewport={{ once: true, amount: 0.8 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 14 }}
                  className="absolute -left-10 md:-left-14 top-0 w-8 h-8 md:w-10 md:h-10 rounded-full bg-white dark:bg-neutral-900 border-2 border-amber-500/60 flex items-center justify-center font-mono text-[10px] text-amber-600 dark:text-amber-500 shadow-lg"
                >
                  {step.numero}
                </motion.span>
                <div className="pb-1">
                  <h4 className="font-serif italic text-2xl font-semibold text-neutral-900 dark:text-white mb-1.5">{step.titulo}</h4>
                  <p className="text-neutral-500 dark:text-neutral-400 text-[13px] leading-relaxed font-light max-w-md">{step.desc}</p>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 w-full max-w-3xl mx-auto px-6 pb-28 text-center">
        <RevealOnScroll>
          <div className="relative py-14 px-8 rounded-2xl border border-amber-500/25 bg-white/60 dark:bg-neutral-900/40 backdrop-blur-md overflow-hidden">
            <p className="font-mono text-[10px] tracking-[0.3em] text-amber-600 uppercase mb-3">Sessão Extraordinária</p>
            <h3 className="font-serif italic text-3xl md:text-4xl font-semibold text-neutral-900 dark:text-white mb-6">Pronto para ratificar seu próximo tratado?</h3>
            <div className="inline-block p-[2px] rounded-xl bg-gradient-to-r from-amber-600 via-amber-400 via-amber-500 to-amber-600 bg-[length:200%_auto] shadow-xl">
              <MagneticButton
                onClick={() => openModal('signup')}
                className="relative px-10 py-3.5 bg-neutral-950 text-white font-bold text-xs rounded-[10px] tracking-widest uppercase cursor-pointer flex items-center gap-1"
              >
                Abrir Credencial <ChevronRight className="w-4 h-4" />
              </MagneticButton>
            </div>
          </div>
        </RevealOnScroll>
      </section>

      <AnimatePresence>
        {showModal && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-neutral-950/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white dark:bg-neutral-900 border border-amber-500/20 max-w-md w-full rounded-2xl p-8 shadow-2xl relative"
            >
              <button 
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-xs font-mono text-neutral-400 hover:text-white cursor-pointer"
              >
                [fechar]
              </button>
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="text-xl font-serif text-center italic text-neutral-950 dark:text-white">
                  {mode === 'login' ? 'Autenticar Acesso' : mode === 'signup' ? 'Nova Credencial' : 'Recuperar Conta'}
                </h3>
                {error && <p className="text-red-500 text-xs text-center">{error}</p>}
                {message && <p className="text-green-500 text-xs text-center">{message}</p>}
                <input 
                  type="email" 
                  placeholder="E-mail Institucional" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-xs text-neutral-900 dark:text-white"
                  required
                />
                {mode !== 'forgot_password' && (
                  <input 
                    type="password" 
                    placeholder="Assinatura Digital (Senha)" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-xs text-neutral-900 dark:text-white"
                    required
                  />
                )}
                {mode === 'signup' && (
                  <>
                    <input 
                      type="text" 
                      placeholder="Nome Completo" 
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-4 py-3 bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-xs text-neutral-900 dark:text-white"
                      required
                    />
                    <textarea 
                      placeholder="Breve memorial/biografia acadêmica ou profissional" 
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="w-full px-4 py-3 bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-xs h-20 resize-none text-neutral-900 dark:text-white"
                    />
                    <div className="space-y-2">
                      <label className="block text-[10px] uppercase font-mono text-neutral-400">Anexar Certificado Requerido</label>
                      <input 
                        type="file" 
                       onChange={(e) => setCertificateFile(e.target.files ? e.target.files[0] : null)}
                        className="text-xs text-neutral-400"
                        required
                      />
                    </div>
                    <label className="flex items-center gap-2 text-xs text-neutral-400 cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={isOfAge}
                        onChange={(e) => setIsOfAge(e.target.checked)}
                      />
                      Declaro possuir maioridade legal (18+ anos)
                    </label>
                  </>
                )}
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-neutral-950 font-bold rounded-xl text-xs uppercase tracking-wider disabled:opacity-50"
                >
                  {loading ? 'Processando...' : mode === 'login' ? 'Entrar no Gabinete' : mode === 'signup' ? 'Solicitar Adesão' : 'Enviar Link'}
                </button>
                <div className="flex justify-between items-center text-[10px] text-neutral-400 font-mono pt-2">
                  {mode === 'login' ? (
                    <>
                      <button type="button" onClick={() => setShowModal(false)} className="hover:underline">Criar Credencial</button>
                      <button type="button" onClick={() => setShowModal(false)} className="hover:underline">Esqueci a senha</button>
                    </>
                  ) : (
                    <button type="button" onClick={() => setMode('login')} className="w-full text-center hover:underline">Já possuo credencial protocolada</button>
                  )}
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="relative z-10 w-full text-center py-10 text-[10px] font-mono tracking-wider text-neutral-400 border-t border-neutral-200 dark:border-neutral-900">
        © 2026 Deletinder Corretora Affectio. Todos os direitos reservados sob sigilo protocolar.
      </footer>
    </div>
  );
}
