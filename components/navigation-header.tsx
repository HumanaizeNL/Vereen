'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Database, FileText } from 'lucide-react';

export function NavigationHeader() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/uc1', label: 'Data Management', icon: Database },
    { href: '/uc2', label: 'Herindicatie', icon: FileText },
  ];

  return (
    <header className="bg-white border-b border-gray-200">
      <nav className="max-w-full px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
            >
              Vereen
            </Link>
            <span className="text-gray-400">|</span>
            <span className="text-sm text-gray-600">WLZ Zorgplatform</span>
          </div>

          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </header>
  );
}
