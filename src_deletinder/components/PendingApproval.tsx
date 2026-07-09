import { useTheme } from '../hooks/useTheme';

export function PendingApproval({
  profile,
  onLogout,
}: {
  profile: any;
  onLogout: () => void;
}) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center p-4">
      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className="absolute top-4 right-4 p-3 bg-secondary rounded-full border border-theme shadow-sm hover:bg-tertiary transition-colors"
        title={theme === 'light' ? 'Modo escuro' : 'Modo claro'}
      >
        {theme === 'light' ? (
          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        ) : (
          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        )}
      </button>

      <div className="bg-secondary border border-theme rounded-lg max-w-md w-full p-8 text-center">
        {/* Icon */}
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#f7797d] via-[#FBD784] to-[#C6FFDD] flex items-center justify-center">
          <svg
            className="w-10 h-10 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        {/* Title */}
        <h2 className="text-xl font-semibold text-primary mb-2">
          Aguardando Aprovacao
        </h2>

        {/* Message */}
        <p className="text-secondary text-sm mb-6 leading-relaxed">
          Ola, <span className="font-semibold text-primary">{profile?.full_name || 'Diplomat'}</span>!
          <br />
          <br />
          Seu certificado esta sendo analisado por nossos moderadores.
          Assim que aprovado, voce recebera acesso completo ao Deletinder.
        </p>

        {/* Status indicator */}
        <div className="bg-primary rounded-lg p-4 mb-6">
          <div className="flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#f5a623] animate-pulse" />
            <span className="text-xs text-[#f5a623] font-medium">
              Status: Em analise
            </span>
          </div>
        </div>

        {/* Logout button */}
        <button
          onClick={onLogout}
          className="w-full bg-transparent border border-theme text-primary font-semibold text-sm py-2 rounded-lg hover:bg-tertiary transition-colors"
        >
          Sair
        </button>

        {/* Help text */}
        <p className="text-xs text-secondary mt-6">
          Isso pode levar ate 24 horas. Voce recebera um email quando aprovado.
        </p>
      </div>
    </div>
  );
}
