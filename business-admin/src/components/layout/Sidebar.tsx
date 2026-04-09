import { NavLink } from 'react-router-dom';
import { Package, Tag, ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/products', label: 'Товары', icon: Package },
  { to: '/categories', label: 'Категории', icon: Tag },
  { to: '/orders', label: 'Заказы', icon: ShoppingCart },
];

export function Sidebar() {
  return (
    <aside className="flex h-full w-56 flex-shrink-0 flex-col border-r bg-card">
      {/* Логотип */}
      <div className="flex h-14 items-center gap-2 border-b px-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">
          D
        </div>
        <span className="font-semibold tracking-tight">DELIVA Admin</span>
      </div>

      {/* Навигация */}
      <nav className="flex-1 space-y-1 p-3">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
