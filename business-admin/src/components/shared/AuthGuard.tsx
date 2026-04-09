import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { session, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 text-center">
        <div className="text-5xl">🚫</div>
        <h1 className="text-2xl font-bold">Доступ запрещён</h1>
        <p className="text-muted-foreground">У вашего аккаунта нет прав администратора.</p>
        <button
          className="text-sm text-primary underline"
          onClick={() => window.location.href = '/login'}
        >
          Выйти и войти с другим аккаунтом
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
