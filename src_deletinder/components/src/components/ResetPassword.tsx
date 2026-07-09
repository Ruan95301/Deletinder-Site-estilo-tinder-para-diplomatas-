import { useState } from 'react';
import { supabase } from '../../../lib/supabase';

export function ResetPassword({ onComplete }: { onComplete: () => void }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    setLoading(true);
    try {
      // O Supabase gerencia o token do e-mail na URL automaticamente por baixo dos panos
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      setSuccess(true);
      setTimeout(() => {
        onComplete();
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar senha.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-secondary border border-theme rounded-[1px] px-10 py-8 shadow-sm">
        <div className="text-center mb-6">
          <h1 className="font-serif text-4xl text-primary">Nova Senha</h1>
          <p className="text-secondary text-xs mt-2">Digite sua nova senha de acesso abaixo</p>
        </div>

        {success ? (
          <div className="text-center p-4 bg-green-500/10 border border-green-500 rounded text-green-500 text-xs">
            Senha alterada com sucesso! Redirecionando para o login...
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-3">
            <input
              type="password"
              placeholder="Nova senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full bg-primary border border-theme rounded-[3px] px-2 py-2 text-xs placeholder-secondary text-primary focus:outline-none focus:border-[#e1306c]"
            />
            <input
              type="password"
              placeholder="Confirme a nova senha"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="w-full bg-primary border border-theme rounded-[3px] px-2 py-2 text-xs placeholder-secondary text-primary focus:outline-none focus:border-[#e1306c]"
            />

            {error && <p className="text-[#ed4956] text-xs text-center pt-1">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 bg-[#0095f6] hover:bg-[#1877f2] text-white font-semibold text-xs py-2 rounded-lg transition-colors disabled:bg-[#b2dffc] cursor-pointer"
            >
              {loading ? 'Salvando...' : 'Atualizar Senha'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
