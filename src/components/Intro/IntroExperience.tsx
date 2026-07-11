import { useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import DiplomaticStamp, { SLICE_COUNT } from './DiplomaticStamp';

const PHRASES = [
  'Onde o amor é soberano.',
  'Sem falta de privacidade.',
  'Diplomacia misturada com relacionamento.',
  'Tudo em um só lugar.',
];

export default function IntroExperience() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const stampContainerRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const finalRef = useRef<HTMLDivElement>(null);
  const sliceRefs = useRef<(HTMLDivElement | null)[]>([]);
  const phraseRefs = useRef<(HTMLDivElement | null)[]>([]);

  const [finished, setFinished] = useState(false);

  const registerSlice = (el: HTMLDivElement | null, i: number) => {
    sliceRefs.current[i] = el;
  };
  const registerPhrase = (el: HTMLDivElement | null, i: number) => {
    phraseRefs.current[i] = el;
  };

  const { contextSafe } = useGSAP(
    () => {
      // --- Entrada: "impacto do carimbo" ao carregar a página ---
      gsap.fromTo(
        stampContainerRef.current,
        { scale: 1.5, opacity: 0, rotate: 4 },
        { scale: 1, opacity: 1, rotate: -5, duration: 1.1, ease: 'power4.out' }
      );

      // Dá mais profundidade de câmera pra sentir o 3D das camadas se afastando
      gsap.to(stageRef.current, {
        rotateX: 6,
        duration: 6,
        ease: 'power1.inOut',
      });

      const tl = gsap.timeline({
        delay: 0.9,
        onComplete: () => setFinished(true),
      });

      const phraseStart = 1.2;
      const perPhrase = 1.9;
      const totalPhrasesDuration = PHRASES.length * perPhrase;
      const finalStart = phraseStart + totalPhrasesDuration + 0.3;

      const disassembleStart = 0.3;
      const disassembleEnd = finalStart - 0.4;
      const disassembleSpan = disassembleEnd - disassembleStart;

      // Fase 1 — desmontagem 3D: as fatias se espalham em profundidade e
      // permanecem TODAS visíveis na tela (nada de sumir), como um raio-x explodido.
      const slices = sliceRefs.current;
      const sliceStep = disassembleSpan / (SLICE_COUNT - 1);

      slices.forEach((el, i) => {
        if (!el) return;
        const dir = i % 2 === 0 ? 1 : -1;
        const start = disassembleStart + i * sliceStep;
        const depth = 90 + i * 26; // profundidade crescente conforme a fatia
        const spreadX = dir * (18 + i * 3.4);
        const tiltY = dir * (10 + (i % 6) * 3.5);
        const tiltX = (i % 2 === 0 ? 1 : -1) * (3 + (i % 4));

        tl.to(
          el,
          {
            z: depth,
            x: spreadX,
            rotateY: tiltY,
            rotateX: tiltX,
            duration: 1.7,
            ease: 'power2.out',
          },
          start
        );
      });

      // Fase 2 — frases surgindo e girando entre as fatias já espalhadas
      phraseRefs.current.forEach((el, i) => {
        if (!el) return;
        const start = phraseStart + i * perPhrase;
        tl.fromTo(
          el,
          { autoAlpha: 0, rotateX: -100, z: 140 },
          { autoAlpha: 1, rotateX: 0, z: 140, duration: 0.7, ease: 'power2.out' },
          start
        ).to(
          el,
          { autoAlpha: 0, rotateX: 100, z: 140, duration: 0.6, ease: 'power2.in' },
          start + 1.15
        );
      });

      // Fase 3 — "Deletinder" final em destaque, à frente de todas as fatias
      tl.fromTo(
        finalRef.current,
        { autoAlpha: 0, scale: 0.8, rotateX: -100, z: 200 },
        { autoAlpha: 1, scale: 1, rotateX: 0, z: 200, duration: 0.6, ease: 'back.out(1.7)' },
        finalStart
      ).to(finalRef.current, { scale: 1.06, duration: 0.5, ease: 'power1.inOut' }, finalStart + 0.9);

      // Fase 4 — transição para o site: só aqui as fatias somem, todas juntas
      const outroStart = finalStart + 1.7;
      tl.to(
        slices.filter(Boolean),
        { autoAlpha: 0, duration: 0.6, ease: 'power1.in', stagger: 0.01 },
        outroStart
      )
        .to(bgRef.current, { backgroundColor: '#050914', duration: 0.6, ease: 'power2.inOut' }, outroStart)
        .to(finalRef.current, { autoAlpha: 0, y: -40, duration: 0.4 }, outroStart + 0.2)
        .to(sectionRef.current, { autoAlpha: 0, duration: 0.5 }, outroStart + 0.5);
    },
    { scope: sectionRef }
  );

  const handleSkip = contextSafe(() => {
    gsap.to(sectionRef.current, {
      autoAlpha: 0,
      duration: 0.4,
      ease: 'power1.out',
      onComplete: () => setFinished(true),
    });
  });

  if (finished) return null;

  return (
    <section
      ref={sectionRef}
      className="fixed inset-0 z-[100] w-full h-screen overflow-hidden"
      aria-label="Introdução Deletinder"
    >
      <div
        ref={bgRef}
        className="absolute inset-0 bg-cream-light"
        style={{
          backgroundImage:
            'radial-gradient(ellipse at center, rgba(0,0,0,0.03) 0%, transparent 70%), repeating-linear-gradient(0deg, rgba(0,0,0,0.015) 0px, transparent 1px, transparent 2px)',
        }}
      />

      <div
        ref={stageRef}
        className="relative w-full h-full flex items-center justify-center"
        style={{ perspective: 1800, transformStyle: 'preserve-3d' }}
      >
        <DiplomaticStamp ref={stampContainerRef} registerSlice={registerSlice} />

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ transformStyle: 'preserve-3d' }}>
          {PHRASES.map((phrase, i) => (
            <div
              key={phrase}
              ref={(el) => registerPhrase(el, i)}
              className="absolute font-display italic text-2xl sm:text-4xl text-ink text-center px-6 opacity-0"
              style={{ transformStyle: 'preserve-3d', willChange: 'transform, opacity' }}
            >
              {phrase}
            </div>
          ))}

          <div
            ref={finalRef}
            className="absolute font-display italic font-bold text-4xl sm:text-6xl text-ink text-center opacity-0"
            style={{ transformStyle: 'preserve-3d', willChange: 'transform, opacity' }}
          >
            Deletinder
          </div>
        </div>
      </div>

      <button
        onClick={handleSkip}
        className="absolute bottom-8 right-8 font-mono text-[10px] tracking-[0.3em] text-ink-light uppercase hover:text-ink transition-colors cursor-pointer"
      >
        pular →
      </button>
    </section>
  );
}