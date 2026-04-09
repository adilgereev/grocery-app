import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { formatPhoneDisplay } from '@/lib/authUtils';

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  const { profile, signOut } = useAuth();

  return (
    <header className="flex h-14 items-center justify-between border-b bg-card px-6">
      <h1 className="text-base font-semibold">{title}</h1>
      <div className="flex items-center gap-3">
        {profile?.phone && (
          <span className="text-sm text-muted-foreground">
            {formatPhoneDisplay(profile.phone)}
          </span>
        )}
        <Button variant="ghost" size="sm" onClick={signOut} className="gap-2">
          <LogOut size={14} />
          Выйти
        </Button>
      </div>
    </header>
  );
}
