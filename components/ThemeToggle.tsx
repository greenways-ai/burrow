'use client';

import { useThemeStore } from '@/lib/store/themeStore';
import { Sun, Moon } from '@/components/icons';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch - don't render until mounted
  if (!mounted) {
    return (
      <button
        className="p-2 border border-transparent opacity-0"
        aria-hidden="true"
      >
        <Sun className="w-5 h-5" />
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="p-2 hover:bg-surface-hover transition-colors border border-transparent hover:border-border"
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {theme === 'dark' ? (
        <Sun className="w-5 h-5" />
      ) : (
        <Moon className="w-5 h-5" />
      )}
    </button>
  );
}
