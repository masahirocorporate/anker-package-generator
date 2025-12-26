"use client";

import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface HeaderProps {
  user: User;
}

export default function Header({ user }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <header className="glass sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--accent)] to-[#00b4d8] flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="font-bold text-lg hidden sm:block">Anker Package Generator</span>
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[var(--card-bg)] transition-colors"
            >
              {user.user_metadata.avatar_url ? (
                <img
                  src={user.user_metadata.avatar_url}
                  alt="Avatar"
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[var(--accent)] flex items-center justify-center text-white font-medium">
                  {user.email?.[0].toUpperCase()}
                </div>
              )}
              <span className="text-sm text-[var(--text-muted)] hidden sm:block">
                {user.user_metadata.full_name || user.email}
              </span>
              <svg className="w-4 h-4 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isMenuOpen && (
              <>
                <div className="fixed inset-0" onClick={() => setIsMenuOpen(false)} />
                <div className="absolute right-0 mt-2 w-48 glass rounded-xl overflow-hidden animate-fade-in">
                  <div className="p-3 border-b border-[var(--card-border)]">
                    <p className="text-sm font-medium truncate">{user.user_metadata.full_name}</p>
                    <p className="text-xs text-[var(--text-muted)] truncate">{user.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-3 text-left text-sm text-red-400 hover:bg-red-400/10 transition-colors"
                  >
                    ログアウト
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}



