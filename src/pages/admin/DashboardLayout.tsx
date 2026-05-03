import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Image as ImageIcon, 
  Settings, 
  LogOut, 
  Sparkles,
  MessageSquare,
  QrCode,
  Palette
} from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

import { useParams, Link as RouterLink } from 'react-router-dom';

const navItems = [
  { icon: LayoutDashboard, label: 'Overview', path: '' },
  { icon: Palette, label: 'Customization', path: 'customize' },
  { icon: Calendar, label: 'Events', path: 'events' },
  { icon: Users, label: 'Guest List', path: 'guests' },
  { icon: MessageSquare, label: 'RSVP Data', path: 'rsvp' },
  { icon: ImageIcon, label: 'Gallery', path: 'gallery' },
  { icon: QrCode, label: 'QR Generator', path: 'qrcode' },
  { icon: Settings, label: 'Settings', path: 'settings' },
];

export default function DashboardLayout() {
  const navigate = useNavigate();
  const { weddingId } = useParams();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/admin/login');
  };

  return (
    <div className="flex h-screen bg-stone-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-stone-200 flex flex-col">
        <RouterLink to="/admin/weddings" className="p-8 border-b border-stone-100 flex items-center gap-3 hover:bg-stone-50 transition-colors">
          <div className="w-10 h-10 bg-stone-900 rounded-xl flex items-center justify-center text-wedding-gold">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-display text-xl leading-tight">Eternal</h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-bold leading-none mt-0.5">Vows Manager</p>
          </div>
        </RouterLink>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={`/admin/${weddingId}/${item.path}`}
              end={item.path === ''}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                isActive 
                  ? "bg-stone-900 text-white shadow-lg shadow-stone-200" 
                  : "text-stone-500 hover:bg-stone-50 hover:text-stone-900"
              )}
            >
              <item.icon className={cn("w-5 h-5", "transition-colors")} />
              <span className="font-medium text-sm tracking-wide">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-stone-100">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors font-medium text-sm"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white border-b border-stone-200 flex items-center justify-between px-10">
          <h2 className="text-stone-400 font-serif italic text-lg">Managing the union of hearts</h2>
          <div className="flex items-center gap-4">
            <div className="h-8 w-px bg-stone-100" />
            <div className="text-right">
              <p className="text-xs font-bold uppercase tracking-widest text-stone-900">Administrator</p>
              <p className="text-[10px] text-stone-400">{auth.currentUser?.email}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-stone-100 border border-stone-200" />
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto p-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
