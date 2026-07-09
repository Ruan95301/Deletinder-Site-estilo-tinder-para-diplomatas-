import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useTheme } from '../hooks/useTheme';

const MOCK_MODE = false;

interface CertificateRequest {
  id: string;
  user_id: string;
  certificate_url: string;
  status: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  rejection_reason?: string | null;
  profiles: {
    full_name: string;
    bio: string;
    email: string;
  };
}

function extractStoragePath(url: string): string | null {
  if (!url) return null;
  
  let cleanPath = url;
  if (url.includes('/certificates/')) {
    const parts = url.split('/certificates/');
    cleanPath = parts.length > 1 ? parts[1] : url;
  }
  
  // Remove parâmetros com "?" no final (como tokens do Supabase) para ler o arquivo puro
  return cleanPath.split('?')[0];
}

export function ModeratorDashboard({
  profile,
  onLogout,
}: {
  profile: any;
  onLogout: () => void;
}) {
  const [requests, setRequests] = useState<CertificateRequest[]>([]);
  const [loading, setLoading] = useState(!MOCK_MODE);
  const [processing, setProcessing] = useState<string | null>(null);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const { theme, toggleTheme } = useTheme();
  const [selectedRequest, setSelectedRequest] = useState<CertificateRequest | null>(null);
  const [certificateSignedUrl, setCertificateSignedUrl] = useState<string | null>(null);
  const [loadingCertificate, setLoadingCertificate] = useState(false);

  const handleToggleTheme = () => {
    if (toggleTheme) toggleTheme();
    const html = document.documentElement;
    if (html.classList.contains('dark-mode')) {
      html.classList.remove('dark-mode');
    } else {
      html.classList.add('dark-mode');
    }
  };

  useEffect(() => {
    if (!selectedRequest) {
      setCertificateSignedUrl(null);
      return;
    }
    let cancelled = false;
    setLoadingCertificate(true);

    const storagePath = extractStoragePath(selectedRequest.certificate_url);
    if (!storagePath) {
      console.error('Nao foi possivel extrair caminho:', selectedRequest.certificate_url);
      setLoadingCertificate(false);
      return;
    }

    supabase.storage
      .from('certificates')
      .createSignedUrl(storagePath, 600)
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          console.error('Erro ao gerar signed URL:', error, 'caminho:', storagePath);
        }
        if (!error && data) {
          setCertificateSignedUrl(data.signedUrl);
        }
        setLoadingCertificate(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedRequest]);

  useEffect(() => {
    if (!MOCK_MODE) {
      fetchRequests();
    }
  }, [filter]);

  async function fetchRequests() {
    setLoading(true);
    try {
      const selectQuery = '*, profiles!certificate_requests_user_id_fkey (full_name, bio, email)';
      let query = supabase
        .from('certificate_requests')
        .select(selectQuery)
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;
      if (!error && data) {
        setRequests(data as CertificateRequest[]);
      }
    } catch (err) {
      console.error('Erro ao buscar requisições:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(request: CertificateRequest) {
    if (!window.confirm(`Aprovar certificado de ${request.profiles?.full_name}?`)) return;
    setProcessing(request.id);

    try {
      const { error: certError } = await supabase
        .from('certificate_requests')
        .update({ status: 'approved', reviewed_by: profile?.id || null, reviewed_at: new Date().toISOString() })
        .eq('id', request.id);
      if (certError) throw certError;

      const { error: profileError } = await supabase
        .from('profiles')
        .update({ status: 'approved' })
        .eq('id', request.user_id);
      if (profileError) throw profileError;

      fetchRequests();
      if (selectedRequest?.id === request.id) setSelectedRequest(null);
    } catch (err) {
      console.error('Erro ao aprovar:', err);
      alert('Erro ao aprovar certificado');
    } finally {
      setProcessing(null);
    }
  }

  async function handleReject(request: CertificateRequest) {
    const reason = window.prompt('Motivo da rejeição (opcional):');
    if (reason === null) return; 
    setProcessing(request.id);

    try {
      const { error: certError } = await supabase
        .from('certificate_requests')
        .update({ status: 'rejected', reviewed_by: profile?.id || null, reviewed_at: new Date().toISOString(), rejection_reason: reason })
        .eq('id', request.id);
      if (certError) throw certError;

      const { error: profileError } = await supabase
        .from('profiles')
        .update({ status: 'rejected' })
        .eq('id', request.user_id);
      if (profileError) throw profileError;

      fetchRequests();
      if (selectedRequest?.id === request.id) setSelectedRequest(null);
    } catch (err) {
      console.error('Erro ao rejeitar:', err);
      alert('Erro ao rejeitar certificado');
    } finally {
      setProcessing(null);
    }
  }

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-amber-500 text-white',
      approved: 'bg-green-500 text-white',
      rejected: 'bg-red-500 text-white',
    };
    const labels: Record<string, string> = {
      pending: 'Pendente',
      approved: 'Aprovado',
      rejected: 'Rejeitado',
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${styles[status] ?? ''}`}>
        {labels[status] ?? status}
      </span>
    );
  };
  return (
    <div className="min-h-screen bg-primary text-primary transition-colors">
      <nav className="sticky top-0 bg-secondary border-b border-theme z-40">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-400 via-amber-400 to-emerald-400 flex items-center justify-center text-white">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h1 className="font-bold text-lg text-primary">Painel do Moderador</h1>
              <p className="text-xs text-secondary">{profile?.full_name || 'Mod'}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={handleToggleTheme} className="p-2 hover:bg-tertiary rounded-lg text-lg">
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
            <button onClick={onLogout} className="px-3 py-1.5 border border-theme text-sm rounded-lg hover:bg-tertiary text-primary bg-secondary">
              Sair
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <div className="flex gap-2 border-b border-theme pb-3">
            {(['pending', 'approved', 'rejected', 'all'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`px-3 py-1 text-xs rounded-full capitalize font-medium ${
                  filter === t 
                    ? 'bg-primary text-primary border border-theme font-bold' 
                    : 'bg-tertiary text-secondary hover:bg-secondary'
                }`}
              >
                {t === 'pending' ? 'Pendentes' : t === 'approved' ? 'Aprovados' : t === 'rejected' ? 'Rejeitados' : 'Todos'}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="p-8 text-center text-secondary">Carregando solicitações...</div>
          ) : requests.length === 0 ? (
            <div className="p-8 text-center text-secondary border border-dashed border-theme rounded-xl">Nenhuma solicitação encontrada neste filtro.</div>
          ) : (
            <div className="space-y-3">
              {requests.map((req) => (
                <div 
                  key={req.id} 
                  className={`p-4 border rounded-xl bg-secondary transition-all ${
                    selectedRequest?.id === req.id ? 'border-blue-500 ring-2 ring-blue-500/10' : 'border-theme'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-base text-primary">{req.profiles?.full_name || 'Sem nome'}</h3>
                      <p className="text-xs text-secondary">{req.profiles?.email}</p>
                    </div>
                    {statusBadge(req.status)}
                  </div>
                  <p className="text-sm italic text-secondary mb-4">"{req.profiles?.bio || 'Sem bio...'}"</p>
                  
                  <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-theme">
                    <button
                      onClick={() => setSelectedRequest(req)}
                      className="px-3 py-1.5 bg-tertiary hover:bg-primary rounded-lg text-xs font-semibold flex items-center gap-1 text-blue-500"
                    >
                      👁️ Ver Foto do Certificado
                    </button>
                    
                    {req.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          disabled={processing === req.id}
                          onClick={() => handleReject(req)}
                          className="px-3 py-1.5 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg text-xs font-bold disabled:opacity-50"
                        >
                          Rejeitar
                        </button>
                        <button
                          disabled={processing === req.id}
                          onClick={() => handleApprove(req)}
                          className="px-3 py-1.5 bg-green-600 text-white hover:bg-green-700 rounded-lg text-xs font-bold disabled:opacity-50"
                        >
                          {processing === req.id ? 'Processando...' : 'Aprovar'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="md:col-span-1">
          <div className="sticky top-20 p-4 border border-theme bg-secondary rounded-xl min-h-[300px] flex flex-col justify-between">
            {selectedRequest ? (
              <div className="flex flex-col h-full gap-3">
                <div className="flex justify-between items-center border-b border-theme pb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-secondary">Documento Anexado</span>
                  <button onClick={() => setSelectedRequest(null)} className="text-secondary hover:text-primary text-sm">✕ Fechar</button>
                </div>
                
                <div className="flex-1 flex items-center justify-center bg-primary rounded-lg overflow-hidden border border-theme p-2 min-h-[200px]">
                  {loadingCertificate ? (
                    <div className="text-xs text-secondary animate-pulse">Carregando imagem segura...</div>
                  ) : certificateSignedUrl ? (
                    <img 
                      src={certificateSignedUrl} 
                      alt="Certificado do Usuário" 
                      className="max-w-full max-h-[350px] object-contain rounded shadow-sm"
                      onError={(e) => {
                        console.error('Erro de carregamento da imagem.');
                        e.currentTarget.src = "https://placehold.co";
                      }}
                    />
                  ) : (
                    <div className="text-xs text-red-500 text-center p-2">Erro ao carregar endereço da foto. Verifique o Storage do Supabase.</div>
                  )}
                </div>

                <div className="text-center pt-2">
                  <p className="text-xs text-secondary truncate mb-2">Dono: {selectedRequest.profiles?.full_name}</p>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-4 text-secondary">
                <span className="text-3xl mb-2">🖼️</span>
                <p className="text-xs">Selecione um pedido na lista ao lado para inspecionar a foto do certificado aqui.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

