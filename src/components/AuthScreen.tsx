import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useTheme } from '../hooks/useTheme';
import { motion, AnimatePresence } from 'framer-motion';

type AuthMode = 'login' | 'signup' | 'forgot_password';

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

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    if (showModal) {
      html.style.overflow = 'hidden';
      html.style.height = '100%';
      body.style.overflow = 'hidden';
      body.style.height = '100%';
    } else {
      html.style.overflow = '';
      html.style.height = '';
      body.style.overflow = '';
      body.style.height = '';
    }
    return () => {
      html.style.overflow = '';
      html.style.height = '';
      body.style.overflow = '';
      body.style.height = '';
    };
  }, [showModal]);

  const handleToggleTheme = () => {
    if (toggleTheme) toggleTheme();
    const html = document.documentElement;
    if (html.classList.contains('dark-mode')) {
      html.classList.remove('dark-mode');
    } else {
      html.classList.add('dark-mode');
    }
  };

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

        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
        });

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
          .insert({
            id: authData.user.id,
            full_name: fullName,
            bio,
            email,
            status: 'pending',
          });

        if (profileError) throw profileError;

        const { error: certError = null } = await supabase
          .from('certificate_requests')
          .insert({
            user_id: authData.user.id,
            certificate_url: fileName,
            status: 'pending',
          });

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
    <div className="h-screen w-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-500 flex flex-col relative overflow-hidden select-none">
      
      {/* GLOW DE FUNDO AMBIENTAL */}
      <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-cyan-400/10 dark:bg-cyan-500/5 rounded-full filter blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-indigo-400/10 dark:bg-indigo-500/5 rounded-full filter blur-[120px] pointer-events-none" />

      {/* HEADER DA LANDING PAGE */}
      <header className="w-full max-w-6xl mx-auto px-8 py-6 flex items-center justify-between z-10 shrink-0">
        <motion.div 
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2.5"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <span className="text-xl text-white">🌐</span>
          </div>
          <h1 className="font-serif text-3xl tracking-tight bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent font-bold">Deletinder</h1>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4"
        >
          <button
            onClick={() => { setMode('login'); setError(null); setMessage(null); setShowModal(true); }}
            className="px-6 py-2.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-bold rounded-xl text-xs uppercase tracking-widest shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer border border-slate-200 dark:border-slate-800"
          >
            Entrar
          </button>
          
          {/* BOTÃO DE MUDAR TEMA TOTALMENTE REFORMULADO COMO EMOJI INTERATIVO */}
          <motion.button
            whileHover={{ scale: 1.1, rotate: 15 }}
            whileTap={{ scale: 0.9, rotate: -15 }}
            onClick={handleToggleTheme}
            className="w-10 h-10 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-center text-lg cursor-pointer transition-colors duration-300"
          >
            {theme === 'light' ? '✨' : '🌙'}
          </motion.button>
        </motion.div>
      </header>

      {/* HERO SECTION PRINCIPAL */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-2 z-10 relative max-w-4xl mx-auto w-full overflow-hidden">
        
        {/* LOGO DE CHAMA EM BRASAS AZUIS DA ONU */}
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 100, delay: 0.1 }}
          className="relative w-28 h-28 mb-6 flex items-center justify-center shrink-0"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-blue-600 via-cyan-400 to-transparent rounded-full filter blur-xl opacity-80 animate-pulse" />
          <div className="absolute bottom-1 w-16 h-16 bg-blue-500 rounded-full filter blur-md opacity-40 mix-blend-screen animate-bounce" />
          
          <div className="relative z-10 w-20 h-20 rounded-2xl bg-slate-950 border border-cyan-400/30 shadow-2xl flex items-center justify-center transform rotate-12 group hover:rotate-0 transition-transform duration-500">
            <svg className="w-10 h-10 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)] -rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M6 12c0 2 2 4 6 4s6-2 6-4" />
            </svg>
          </div>
        </motion.div>

        <motion.h2 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-4xl md:text-6xl font-black tracking-tight mb-3 uppercase bg-gradient-to-r from-slate-900 via-blue-600 to-cyan-500 dark:from-white dark:via-cyan-400 dark:to-blue-500 bg-clip-text text-transparent px-2"
        >
          Diplomatize Seus Encontros
        </motion.h2>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-xs md:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-10 font-light leading-relaxed px-4 uppercase tracking-widest"
        >
          Networking Afetivo e Tratados de Amor Sênior
        </motion.p>
        
        {/* BOTÃO PRINCIPAL GLOW REFORMULADO */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="relative z-20 shrink-0"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl blur-xl opacity-40 group-hover:opacity-80 transition-all duration-300 scale-95" />
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => { setMode('signup'); setError(null); setMessage(null); setShowModal(true); }}
            className="relative px-16 py-4.5 bg-gradient-to-r from-cyan-500 via-blue-600 to-cyan-500 bg-[length:200%_auto] hover:bg-right text-white font-black text-xs rounded-2xl shadow-xl transition-all duration-500 tracking-widest uppercase cursor-pointer border border-cyan-400/20"
          >
            <span>✨ Simule o amor da sua vida</span>
          </motion.button>
        </motion.div>

        {/* VITRINE DE TRATADOS DIPLOMÁTICOS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 w-full mt-14 max-w-4xl px-6 shrink-0 relative z-10">
          {[
            { titulo: "Tratados Bilaterais", desc: "Chega de conversas superficiais. Aqui as afinidades são resolvidas por meio de acordos multilaterais e diplomacia do afeto.", icone: "📜", delay: 0.5 },
            { titulo: "Pactos de Afinidade", desc: "Encontre seu match sênior de acordo com as afinidades de blocos econômicos, comissões de segurança e pactos globais.", icone: "❤️", delay: 0.6 },
            { titulo: "Canais Confidenciais", desc: "Salas de negociação direta e criptografadas para traçar planos e estabelecer alianças duradouras de delegação.", icone: "🥂", delay: 0.7 }
          ].map((item, idx) => (
            <motion.div 
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: item.delay, type: 'spring', stiffness: 70 }}
              key={idx} 
              className="p-5 border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl rounded-2xl text-left flex flex-col gap-2 hover:border-cyan-500/30 transition-all duration-300 hover:shadow-md"
            >
              <div className="w-9 h-9 rounded-xl bg-cyan-500/10 dark:bg-cyan-500/5 flex items-center justify-center text-lg border border-cyan-500/10">
                {item.icone}
              </div>
              <h3 className="font-black text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider mt-1">{item.titulo}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed font-light">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </main>

      <footer className="w-full text-center py-4 text-[10px] text-slate-400 dark:text-slate-500 border-t border-slate-200 dark:border-slate-900 z-10 bg-slate-100/50 dark:bg-slate-900/10 shrink-0">
        <p>© 2026 Deletinder. Permissão institucional soberana reservada para maiores de 18 anos.</p>
      </footer>
      {/* POPUP FLUTUANTE MODAL ANIMAÇÃO DE ALTO PADRÃO */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/40 dark:bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 overflow-hidden">
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="w-full max-w-sm max-h-[85vh] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl relative overflow-hidden"
            >
              
              <button 
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold text-sm bg-slate-100 dark:bg-slate-800 w-6 h-6 rounded-lg flex items-center justify-center cursor-pointer border-0 z-50 transition-colors"
              >
                ✕
              </button>

              <div className="flex-1 overflow-y-auto px-8 py-8 custom-scrollbar">
                <div className="text-center mb-5">
                  <div className="flex justify-center mb-1.5 text-xl">🌐</div>
                  <h1 className="font-serif text-3xl tracking-tight bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent font-bold">Deletinder</h1>
                  <p className="text-slate-400 dark:text-slate-500 text-[11px] mt-1 font-light">
                    {mode === 'login' ? 'Insira suas credenciais verificadas' : mode === 'signup' ? 'Inicie sua requisição de acesso' : 'Insira seu e-mail cadastrado'}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3">
                  {mode === 'signup' && (
                    <>
                      <input
                        type="text"
                        placeholder="Nome completo"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs placeholder-slate-400 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-cyan-500 dark:focus:border-cyan-400 transition-colors"
                      />
                      <input
                        type="text"
                        placeholder="Bio ou Filiação Acadêmica"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs placeholder-slate-400 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-cyan-500 dark:focus:border-cyan-400 transition-colors"
                      />
                    </>
                  )}

                  <input
                    type="email"
                    placeholder="E-mail de acesso"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs placeholder-slate-400 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-cyan-500 dark:focus:border-cyan-400 transition-colors"
                  />

                  {mode !== 'forgot_password' && (
                    <input
                      type="password"
                      placeholder="Senha secreta"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs placeholder-slate-400 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-cyan-500 dark:focus:border-cyan-400 transition-colors"
                    />
                  )}

                  {mode === 'signup' && (
                    <>
                      <div className="pt-1">
                        <label className="block text-[10px] text-slate-400 dark:text-slate-500 mb-1.5 font-semibold">Anexar Certificado ONU (PDF, JPG, PNG)</label>
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => setCertificateFile(e.target.files?.[0] || null)}
                          required
                          className="w-full text-xs text-slate-500 file:mr-2.5 file:py-1.5 file:px-3 file:border-0 file:rounded-xl file:bg-slate-100 dark:file:bg-slate-800 file:text-slate-700 dark:file:text-slate-300 file:text-[11px] file:font-bold hover:file:bg-cyan-500 hover:file:text-white cursor-pointer transition-colors"
                        />
                      </div>

                      <div className="flex items-start gap-2 pt-2.5 pb-0.5">
                        <input
                          type="checkbox"
                          id="age-confirmation"
                          checked={isOfAge}
                          onChange={(e) => setIsOfAge(e.target.checked)}
                          className="mt-0.5 h-3.5 w-3.5 rounded border-slate-300 text-cyan-500 focus:ring-cyan-500 cursor-pointer"
                        />
                        <label htmlFor="age-confirmation" className="text-[11px] leading-tight text-slate-400 dark:text-slate-500 select-none cursor-pointer">
                          Declaro que possuo <strong>18 anos ou mais</strong> e assumo total responsabilidade legal.
                        </label>
                      </div>
                    </>
                  )}

                  {error && <p className="text-red-500 text-xs text-center pt-1.5 font-semibold">{error}</p>}
                  {message && <p className="text-green-500 text-xs text-center pt-1.5 font-semibold">{message}</p>}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs py-3 rounded-xl transition-all disabled:opacity-50 cursor-pointer shadow-md shadow-cyan-500/10 hover:opacity-95"
                  >
                    {loading ? 'Processando...' : mode === 'login' ? 'Autenticar' : mode === 'signup' ? 'Enviar Pedido' : 'Enviar Link'}
                  </button>
                </form>

                {mode === 'login' && (
                  <div className="text-center mt-4">
                    <button
                      type="button"
                      onClick={() => { setMode('forgot_password'); setError(null); setMessage(null); }}
                      className="text-[11px] text-slate-400 dark:text-slate-500 hover:text-cyan-500 bg-transparent border-0 cursor-pointer"
                    >
                      Esqueceu seus dados de acesso?
                    </button>
                  </div>
                )}

                <div className="flex items-center my-4">
                  <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
                  <span className="px-2.5 text-slate-400 dark:text-slate-600 text-[10px] font-bold">OU</span>
                  <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
                </div>

                <div className="text-center text-xs pb-1">
                  <span className="text-slate-400 dark:text-slate-500 text-[11px]">
                    {mode === 'login' ? 'Ainda não é credenciado?' : mode === 'signup' ? 'Já possui cadastro ativo?' : 'Lembrou seus dados?'}
                  </span>{' '}
                  <button
                    type="button"
                    onClick={() => {
                      if (mode === 'login') setMode('signup');
                      else setMode('login');
                      setIsOfAge(false); setError(null); setMessage(null);
                    }}
                    className="text-[11px] text-cyan-500 font-bold hover:underline bg-transparent border-0 cursor-pointer"
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
