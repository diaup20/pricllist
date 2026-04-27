import { Link } from 'react-router-dom';
import { Search, LayoutDashboard, UtensilsCrossed } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-emerald-600 text-white h-16 md:h-20 px-4 md:px-8 flex items-center justify-between shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity whitespace-nowrap">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-white rounded-full flex items-center justify-center shrink-0">
            <UtensilsCrossed className="w-5 h-5 md:w-6 md:h-6 text-emerald-600" />
          </div>
          <h1 className="text-lg md:text-2xl font-bold tracking-tight truncate">نظام الأسعار</h1>
        </Link>

        <nav className="flex gap-3 md:gap-6 items-center">
          <Link 
            to="/" 
            className="flex items-center gap-2 font-medium hover:text-emerald-100 transition-colors text-sm md:text-base whitespace-nowrap"
          >
            <Search className="w-4 h-4" />
            <span className="hidden sm:inline">البحث العام</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
