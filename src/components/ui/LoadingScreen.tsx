interface LoadingScreenProps {
  message?: string;
}

export const LoadingScreen = ({ message = 'Rodando as rotativas…' }: LoadingScreenProps) => (
  <div className="flex min-h-screen items-center justify-center">
    <p className="animate-pulse font-sans text-xs font-semibold uppercase tracking-[0.3em] text-ink-muted">{message}</p>
  </div>
);
