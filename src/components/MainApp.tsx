import { useState } from 'react';
import { useTheme } from '../hooks/useTheme';

export function MainApp({ 
  profile, 
  onLogout 
}: { 
  profile: any; 
  onLogout: () => void; 
}) {
  const { theme, toggleTheme } = useTheme();
  const [copied, setCopied] = useState(false);

  const handleToggleTheme = () => {
    if (toggleTheme) toggleTheme();
    const html = document.documentElement;
    if (html.classList.contains('dark-mode')) {
      html.classList.remove('dark-mode');
    } else {
      html.classList.add('dark-mode');
    }
  };

  const handleCopyPix = () => {
    navigator.clipboard.writeText('79988772172');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-primary text-primary transition-colors flex flex-col justify-between select-none">
      
      {/* BARRA DE NAVEGAÇÃO SUPERIOR */}
      <nav className="bg-secondary border-b border-theme sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌐</span>
            <h1 className="font-serif text-2xl tracking-tight text-[#0095f6]">Deletinder</h1>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-secondary">Olá, {profile?.full_name || 'Diplomata'}</span>
            <button 
              onClick={handleToggleTheme} 
              className="p-2 hover:bg-tertiary rounded-full text-sm border-0 bg-transparent cursor-pointer"
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
            <button 
              onClick={onLogout} 
              className="px-3 py-1.5 border border-theme text-xs rounded-lg hover:bg-tertiary bg-secondary cursor-pointer text-primary"
            >
              Sair
            </button>
          </div>
        </div>
      </nav>

      {/* CONTEÚDO CENTRAL COM SUA MENSAGEM DO PROJETO */}
      <main className="flex-1 max-w-lg w-full mx-auto px-4 py-12 flex flex-col items-center justify-center text-center">
        <div className="bg-secondary border border-theme p-8 rounded-2xl shadow-xl w-full">
          
          {/* Emblema Animado de Desenvolvimento */}
          <div className="w-16 h-16 mx-auto mb-6 bg-blue-500/10 rounded-full flex items-center justify-center border border-blue-500/10">
            <span className="text-2xl animate-pulse">🚀</span>
          </div>

          <h2 className="text-lg font-black mb-3 uppercase tracking-wider text-primary">Fase de Testes Definitiva</h2>
          
          {/* Sua Mensagem Original Exata */}
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed mb-6 font-light">
            Este projeto foi construído para fins de testes de criação e comprovação de habilidade logo está em Beta, gostou deste projeto que tal me apoiar?
          </p>

          {/* CAIXA DO PIX COPIAR E COLAR */}
          <div className="bg-primary border border-theme p-4 rounded-xl flex flex-col gap-2 items-center mb-6 relative group">
            <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Chave PIX (Telefone)</span>
            <span className="text-base font-mono font-bold text-primary tracking-wide">79 98877-2172</span>
            
            <button
              onClick={handleCopyPix}
              className={`mt-1 px-4 py-1.5 rounded-full text-[11px] font-bold transition-all border-0 cursor-pointer ${
                copied 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:opacity-90 shadow-md'
              }`}
            >
              {copied ? '✓ Chave Copiada!' : '📋 Copiar Chave'}
            </button>
          </div>

          {/* Assinatura da Equipe */}
          <div className="pt-2 border-t border-theme">
            <p className="text-[11px] font-medium text-secondary italic">
              A equipe da devs <span className="text-[#0095f6] font-bold not-italic">Prynce</span> agradece!
            </p>
          </div>

        </div>
      </main>

      {/* FOOTER */}
      <footer className="w-full text-center py-4 text-[10px] text-secondary border-t border-theme bg-secondary/10 shrink-0">
        <p>© 2026 Deletinder Open Source Project. Pronto para o deploy.</p>
      </footer>

    </div>
  );
}
