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
          'drop-shadow(0 0 2px rgba(0,212,245,0.25))',
          'drop-shadow(0 0 14px rgba(0,212,245,0.65))',
          'drop-shadow(0 0 2px rgba(0,212,245,0.25))',
        ],
      }}
      transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
      className={className}
    >
      <Logo size={size} />
    </motion.div>
  );
}

function FiligreeBar({ position }: { position: 'top' | 'bottom' }) {
  return (
    <div className={cn(
      "fixed left-0 right-0 z-50 h-9 flex items-center justify-center pointer-events-none",
      position === 'top' ? 'top-0' : 'bottom-0'
    )}>
      <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
      <div className="relative flex items-center gap-2.5 bg-white dark:bg-neutral-950 px-4 transition-colors duration-300">
        <span className="w-1 h-1 rotate-45 bg-amber-500 animate-pulse" />
        <span className="w-2 h-2 rotate-45 border border-amber-500/60" />
        <span className="w-1 h-1 rotate-45 bg-amber-500 animate-pulse" />
      </div>
    </div>
  );
}

function GoldParticles() {
  const dots = useMemo(
    () =>
      Array.from({ length: 45 }).map(() => ({
        left: `${Math.random() * 100}%`,
        size: Math.random() * 2.5 + 1.5,
        duration: Math.random() * 10 + 12,
        delay: Math.random() * -10,
        drift: Math.random() * 60 - 30,
        color: Math.random() > 0.7 ? 'bg-cyan-400/40' : 'bg-amber-500/40',
      })),
    []
  );
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
      {dots.map((d, i) => (
        <motion.span
          key={i}
          className={cn("absolute bottom-0 rounded-full blur-[0.5px]", d.color)}
          style={{ left: d.left, width: d.size, height: d.size }}
          animate={{ y: ['0%', '-115%'], x: [0, d.drift], opacity: [0, 0.7, 0] }}
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
        { opacity: 0, y: 50, filter: 'blur(12px)' },
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' },
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
  const sx = useSpring(x, { stiffness: 120, damping: 10 });
  const sy = useSpring(y, { stiffness: 120, damping: 10 });

  const handleMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    x.set((e.clientX - rect.left - rect.width / 2) * 0.45);
    y.set((e.clientY - rect.top - rect.height / 2) * 0.45);
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
      whileTap={{ scale: 0.95 }}
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
  const rotateX = useSpring(useMotionValue(0), { stiffness: 140, damping: 14 });
  const rotateY = useSpring(useMotionValue(0), { stiffness: 140, damping: 14 });
  const xPercent = useTransformSafe(mx);
  const yPercent = useTransformSafe(my);
  
  // Spotlight dinâmico seguindo o cursor do mouse
  const spotlight = useMotionTemplate`radial-gradient(280px circle at ${xPercent}% ${yPercent}%, rgba(212,175,55,0.2), transparent 75%)`;

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    mx.set(px);
    my.set(py);
    rotateX.set((0.5 - py) * 14); // Inclinação 3D mais nítida
    rotateY.set((px - 0.5) * 14);
  };
  
  const handleLeave = () => {
    mx.set(0.5);
    my.set(0.5);
    rotateX.set(0);
    rotateY.set(0);
  };

  const IconComponent = item.icone;

  return (
    <div style={{ perspective: 1000 }} className="premium-card-border p-[1.5px]">
      <motion.div
        ref={ref}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        className="group relative p-6 bg-white/70 dark:bg-neutral-900/60 backdrop-blur-xl rounded-xl text-left overflow-hidden transition-all duration-300 hover:shadow-[0_20px_50px_rgba(212,175,55,0.18)]"
      >
        <motion.div style={{ background: spotlight }} className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <span className="absolute top-2 left-2 w-3 h-3 border-t border-l border-amber-500/40 group-hover:border-amber-500/90 transition-colors" />
        <span className="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-amber-500/40 group-hover:border-amber-500/90 transition-colors" />
        
        <div className="relative flex items-start justify-between mb-4" style={{ transform: 'translateZ(40px)' }}>
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center border border-amber-500/20 shadow-md text-amber-500 group-hover:scale-110 transition-transform duration-300">
            <IconComponent className="w-5 h-5 animate-pulse" />
          </div>
          <span className="font-mono text-[9px] tracking-widest text-amber-600 dark:text-amber-500/80 uppercase">{item.codigo}</span>
        </div>
        
        <h3 style={{ transform: 'translateZ(25px)' }} className="relative font-serif italic text-xl font-semibold text-neutral-900 dark:text-white mb-2">
          {item.titulo}
        </h3>
        <p style={{ transform: 'translateZ(15px)' }} className="relative text-neutral-600 dark:text-neutral-400 text-[12px] leading-relaxed font-light">
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
        { opacity: 0, scale: 0.9, y: 35 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          delay: delay,
          duration: 0.8,
          ease: 'back.out(1.4)',
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

  // Ativação da Navbar Dinâmica no Scroll
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const lenis = new Lenis({ duration: 1.2, smoothWheel: true });
    function raf(time: number) {
      lenis.raf(time);
      ScrollTrigger.update();
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    
    lenis.on('scroll', (e: any) => {
      ScrollTrigger.update();
      setIsScrolled(e.scroll > 40);
    });
    
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

  // Efeito do Mouse para a Carta 3D Física do Hero
  const cardRef = useRef<HTMLDivElement>(null);
  const heroX = useMotionValue(0);
  const heroY = useMotionValue(0);
  const heroRotateX = useSpring(heroY, { stiffness: 100, damping: 15 });
  const heroRotateY = useSpring(heroX, { stiffness: 100, damping: 15 });

  const handleHeroMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left - width / 2;
    const mouseY = e.clientY - rect.top - height / 2;
    heroX.set((mouseX / width) * 25); // Força do efeito de inclinação 3D
    heroY.set(-(mouseY / height) * 25);
  };

  const handleHeroMouseLeave = () => {
    heroX.set(0);
    heroY.set(0);
  };

  return (
    <div className="min-h-screen w-full bg-white dark:bg-[#030712] text-neutral-900 dark:text-neutral-100 relative overflow-x-hidden selection:bg-amber-500/30 transition-colors duration-500">
      <div className="bg-glow-layer" />
      <FiligreeBar position="top" />
      <FiligreeBar position="bottom" />

      {/* 📱 NAVBAR DINÂMICA: Muda no Scroll e encolhe com efeito glass */}
      <header className={cn(
        "fixed left-0 right-0 z-40 transition-all duration-500 border-b",
        isScrolled 
          ? "top-4 max-w-4xl mx-auto rounded-full bg-white/70 dark:bg-neutral-950/60 backdrop-blur-xl border-amber-500/30 shadow-[0_10px_30px_rgba(0,0,0,0.2)] px-2 py-2" 
          : "top-9 max-w-full bg-white/80 dark:bg-transparent backdrop-blur-none border-amber-500/15 py-3.5 px-0"
      )}>
        <div className={cn(
          "w-full max-w-6xl mx-auto flex items-center justify-between transition-all duration-300",
          isScrolled ? "px-4" : "px-6 md:px-8"
        )}>
          <div className="flex items-center gap-2.5 group cursor-pointer">
            <GlowLogo size={isScrolled ? 34 : 40} className="group-hover:scale-105 transition-transform duration-300" />
            <div className="leading-none">
              <h1 className={cn("font-serif italic font-semibold tracking-tight text-neutral-900 dark:text-white transition-all duration-300", isScrolled ? "text-xl" : "text-2xl")}>Deletinder</h1>
              <p className={cn("hidden sm:block font-mono text-[9px] tracking-[0.25em] text-amber-600 uppercase mt-0.5 transition-all duration-300", isScrolled ? "opacity-0 h-0 overflow-hidden" : "opacity-100")}>Relações Amorosas Soberanas</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <MagneticButton
              onClick={() => openModal('login')}
              className="px-5 py-2.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold rounded-full text-[11px] uppercase tracking-widest hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] active:scale-[0.98] transition-all cursor-pointer"
            >
              Entrar
            </MagneticButton>
            <button
              onClick={toggleTheme}
              className="w-10 h-10 bg-amber-500/10 dark:bg-neutral-900 rounded-full border border-amber-500/25 flex items-center justify-center text-base cursor-pointer text-amber-500 hover:rotate-12 transition-transform"
              aria-label="Alternar tema"
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* 🃏 HERO IMPACTANTE: Com Perspectiva 3D Avançada na Carta */}
      <section ref={pinRef} onMouseMove={handleHeroMouseMove} onMouseLeave={handleHeroMouseLeave} className="relative w-full h-screen flex items-center justify-center overflow-hidden perspective-container z-20">
        <GoldParticles />
        <div ref={letterRef} className="relative w-[300px] sm:w-[380px] aspect-[3/4]" style={{ transformStyle: 'preserve-3d' }}>
          <motion.div
            ref={cardRef}
            initial={{ opacity: 0, scale: 0.7, y: 80, filter: 'blur(16px)' }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
            style={{ rotateX: heroRotateX, rotateY: heroRotateY, transformStyle: 'preserve-3d' }}
            transition={{ type: 'spring', stiffness: 70, damping: 14, delay: 0.2 }}
            className="3d-card-hero relative w-full h-full rounded-sm bg-stone-100 dark:bg-neutral-900 border-[3px] border-double border-amber-500/70 shadow-[0_30px_70px_-15px_rgba(120,95,30,0.45)] px-8 py-10 flex flex-col items-center justify-center text-center overflow-hidden"
          >
            <div className="hero-shine-effect" />
            <div className="absolute inset-2 border border-amber-500/35 pointer-events-none" />
            <span className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-amber-500/70 pointer-events-none" />
            <span className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-amber-500/70 pointer-events-none" />
            <span className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-amber-500/70 pointer-events-none" />
            <span className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-amber-500/70 pointer-events-none" />
            
            <div style={{ transform: 'translateZ(30px)' }} className="absolute inset-0 flex items-center justify-center opacity-[0.06] pointer-events-none">
              <Logo size={220} />
            </div>
            
            <div style={{ transform: 'translateZ(60px)' }} className="absolute -top-8 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-stone-100 dark:bg-neutral-900 border-4 border-white dark:border-neutral-800 shadow-[0_8px_24px_rgba(156,122,31,0.35)] flex items-center justify-center ring-1 ring-amber-500/60">
              <GlowLogo size={40} />
            </div>
            
            <p style={{ transform: 'translateZ(40px)' }} className="relative font-mono text-[9px] tracking-[0.3em] text-amber-600 uppercase mt-8 mb-4">Ato Diplomático Nº 001/2026</p>
            <h2 style={{ transform: 'translateZ(50px)' }} className="relative font-serif italic text-3xl sm:text-4xl font-semibold text-neutral-900 dark:text-white leading-tight">Diplomatizando<br />Encontros</h2>
            <p style={{ transform: 'translateZ(35px)' }} className="relative font-mono text-[9px] tracking-[0.2em] text-neutral-500 uppercase mt-4">Onde a diplomacia abre portas para o amor</p>
          </motion.div>
        </div>
      </section>
      {/* 📜 SCROLL REVEAL: Cards premium com efeito de fade + translate + blur */}
      <section className="relative z-30 w-full max-w-5xl mx-auto px-6 pb-24 pt-32">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {DOSSIERS.map((item, idx) => (
            <PopReveal key={item.titulo} delay={idx * 0.08}>
              <DossierCard item={item} />
            </PopReveal>
          ))}
        </div>
      </section>

      <section className="relative z-30 w-full max-w-4xl mx-auto px-6 pb-24">
        <RevealOnScroll className="grid grid-cols-3 gap-4 md:gap-10 py-10 border-y border-amber-500/20 backdrop-blur-sm bg-white/5 dark:bg-transparent rounded-xl px-4">
          {STATS.map((s) => {
            const StatIcon = s.icone;
            return (
              <div key={s.label} className="text-center flex flex-col items-center justify-center group cursor-pointer">
                <div className="p-2 rounded-full bg-amber-500/5 border border-amber-500/10 mb-2 text-amber-500 group-hover:bg-amber-500/20 group-hover:scale-110 transition-all duration-300">
                  <StatIcon className="w-4 h-4" />
                </div>
                <p className="font-serif italic text-2xl md:text-4xl font-semibold text-amber-600 dark:text-amber-500 transition-colors group-hover:text-amber-400">{s.numero}</p>
                <p className="font-mono text-[8px] md:text-[10px] tracking-[0.15em] md:tracking-[0.2em] text-neutral-500 dark:text-neutral-400 uppercase mt-2">{s.label}</p>
              </div>
            );
          })}
        </RevealOnScroll>
      </section>

      <section className="relative z-30 w-full max-w-3xl mx-auto px-6 pb-28">
        <RevealOnScroll className="text-center mb-14">
          <p className="font-mono text-[10px] tracking-[0.3em] text-amber-600 uppercase mb-2">Protocolo Nº 07/2026</p>
          <h3 className="font-serif italic text-3xl md:text-4xl font-semibold text-neutral-900 dark:text-white">Ordem de Adesão</h3>
        </RevealOnScroll>
        <div className="relative pl-10 md:pl-14">
          <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-amber-500 via-amber-500/40 to-transparent" />
          <div className="flex flex-col gap-14">
            {PROTOCOLO.map((step) => (
              <RevealOnScroll key={step.numero} className="relative group">
                <motion.span
                  initial={{ opacity: 0, scale: 1.6, rotate: -12 }}
                  whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                  viewport={{ once: true, amount: 0.8 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 14 }}
                  className="absolute -left-10 md:-left-14 top-0 w-8 h-8 md:w-10 md:h-10 rounded-full bg-white dark:bg-neutral-900 border-2 border-amber-500/60 flex items-center justify-center font-mono text-[10px] text-amber-600 dark:text-amber-500 shadow-lg group-hover:border-amber-400 group-hover:text-amber-400 transition-colors duration-300"
                >
                  {step.numero}
                </motion.span>
                <div className="pb-1 transform group-hover:translate-x-1 transition-transform duration-300">
                  <h4 className="font-serif italic text-2xl font-semibold text-neutral-900 dark:text-white mb-1.5">{step.titulo}</h4>
                  <p className="text-neutral-500 dark:text-neutral-400 text-[13px] leading-relaxed font-light max-w-md">{step.desc}</p>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* 🔒 INÍCIO DO BANNER E GANCHO DO MODAL DE CADASTRO/LOGIN (MANTIDO 100% INTEGRADO) */}
      <section className="relative z-30 w-full max-w-3xl mx-auto px-6 pb-28 text-center">
        <RevealOnScroll>
          <div className="relative py-14 px-8 rounded-2xl border border-amber-500/25 bg-white/60 dark:bg-neutral-900/40 backdrop-blur-md overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-transparent pointer-events-none" />
            <h3 className="font-serif italic text-3xl font-semibold text-neutral-900 dark:text-white mb-4">Pronto para iniciar as tratativas?</h3>
            <p className="text-neutral-600 dark:text-neutral-400 text-sm max-w-md mx-auto mb-8 font-light">Solicite suas credenciais oficiais e faça parte de um ecossistema afetivo exclusivo e seguro.</p>
            <MagneticButton
              onClick={() => openModal('signup')}
              className="px-8 py-3.5 bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold rounded-lg text-xs uppercase tracking-widest transition-all shadow-[0_4px_20px_rgba(212,175,55,0.25)] hover:shadow-[0_4px_30px_rgba(212,175,55,0.45)] cursor-pointer"
            >
              Solicitar Credenciamento
            </MagneticButton>
          </div>
        </RevealOnScroll>
      </section>
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-md p-6 bg-white dark:bg-neutral-900 border border-amber-500/30 rounded-xl shadow-2xl">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
            >
              ✕
            </button>
            
            <h4 className="font-serif italic text-2xl font-semibold mb-4 text-center">
              {mode === 'login' ? 'Entrar' : mode === 'forgot_password' ? 'Recuperar Senha' : 'Credenciamento'}
            </h4>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input
                type="email"
                placeholder="Seu e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent"
                required
              />
              
              {mode !== 'forgot_password' && (
                <input
                  type="password"
                  placeholder="Sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent"
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
                    className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent"
                    required
                  />
                  <textarea
                    placeholder="Sua Bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent resize-none h-20"
                  />
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-neutral-500">Certificado de Idoneidade (PDF/Imagem):</label>
                    <input
                      type="file"
                      onChange={(e) => setCertificateFile(e.target.files?.[0] || null)}
                      className="text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-amber-500/10 file:text-amber-500 cursor-pointer"
                      required
                    />
                  </div>
                  <label className="flex items-center gap-2 text-xs text-neutral-500 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isOfAge}
                      onChange={(e) => setIsOfAge(e.target.checked)}
                      className="rounded border-neutral-300 dark:border-neutral-700 text-amber-500 focus:ring-amber-500"
                    />
                    Confirmo que tenho 18 anos ou mais.
                  </label>
                </>
              )}

              {error && <p className="text-xs text-red-500 text-center font-medium">{error}</p>}
              {message && <p className="text-xs text-emerald-500 text-center font-medium">{message}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-neutral-950 font-bold rounded-lg text-xs uppercase tracking-widest transition-all mt-2"
              >
                {loading ? 'Processando...' : mode === 'login' ? 'Acessar Painel' : mode === 'forgot_password' ? 'Enviar Link' : 'Enviar Solicitação'}
              </button>
            </form>
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-800 text-[11px] text-neutral-500">
              {mode === 'login' ? (
                <>
                  <button onClick={() => setMode('signup')} className="hover:text-amber-500 transition-colors">Criar conta</button>
                  <button onClick={() => setMode('forgot_password')} className="hover:text-amber-500 transition-colors">Esqueceu a senha?</button>
                </>
              ) : (
                <button onClick={() => setMode('login')} className="hover:text-amber-500 transition-colors mx-auto">Já tenho uma conta (Entrar)</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
