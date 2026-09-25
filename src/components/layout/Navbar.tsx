import React from 'react';
import { LogOut, Package, RefreshCw, Clock, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useProductOverlay } from '../../context/ProductOverlayContext';

interface NavbarProps {
  onNavigateHome: () => void;
  delay?: number;
  onToggleDelay: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onNavigateHome,
  delay,
  onToggleDelay,
}) => {
  const { user, logout } = useAuth();
  const { hasLocalChanges, resetAllLocalChanges } = useProductOverlay();

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onNavigateHome}
              className="flex items-center gap-2.5 text-left group focus:outline-none cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center shadow-sm shadow-indigo-200 group-hover:scale-105 transition-transform">
                <Package className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-base sm:text-lg tracking-tight group-hover:text-indigo-600 transition-colors">
                    Product Admin
                  </span>
                  <span className="hidden sm:inline-block px-2 py-0.5 text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-md">
                    DummyJSON
                  </span>
                </div>
                <p className="text-xs text-slate-500 hidden sm:block">
                  Inventory & Catalog Management
                </p>
              </div>
            </button>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Delay simulator toggle (Testing race condition requirement) */}
            <button
              type="button"
              onClick={onToggleDelay}
              title={
                delay
                  ? 'Simulated delay active: 2000ms. Click to disable.'
                  : 'Click to simulate 2000ms delay to test race condition handling.'
              }
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                delay
                  ? 'bg-amber-500/10 text-amber-700 border-amber-300 ring-2 ring-amber-400/30'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span className="hidden md:inline">API Delay:</span>
              <span className="font-bold">{delay ? '2000ms' : '0ms'}</span>
            </button>

            {/* Reset Local Changes button if changes exist */}
            {hasLocalChanges && (
              <button
                type="button"
                onClick={resetAllLocalChanges}
                title="Reset all locally added, edited, or deleted items"
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-violet-50 text-violet-700 border border-violet-200 hover:bg-violet-100 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">Reset Local Data</span>
              </button>
            )}

            {/* User Profile Pill */}
            {user && (
              <div className="flex items-center gap-2.5 pl-2 sm:pl-3 border-l border-slate-200">
                <img
                  src={
                    user.image ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`
                  }
                  alt={user.username}
                  className="w-8 h-8 rounded-full border border-slate-200 bg-slate-100 object-cover"
                />
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-semibold text-slate-800 leading-tight">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-[11px] text-slate-400 leading-tight">
                    @{user.username}
                  </p>
                </div>
              </div>
            )}

            {/* Logout Button */}
            <button
              type="button"
              onClick={logout}
              title="Log out of Product Admin"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-rose-600 bg-slate-100 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
