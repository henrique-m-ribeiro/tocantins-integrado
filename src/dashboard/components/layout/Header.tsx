'use client';

import { Menu, MessageSquare, Sun, Moon, HelpCircle } from 'lucide-react';

interface HeaderProps {
  onMenuClick: () => void;
  onChatClick: () => void;
  isChatOpen: boolean;
}

export function Header({ onMenuClick, onChatClick, isChatOpen }: HeaderProps) {
  return (
    <header className="h-16 bg-tocantins-blue text-white flex items-center justify-between px-4 shadow-lg">
      {/* Left section */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          aria-label="Toggle menu"
        >
          <Menu className="h-6 w-6" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-tocantins-yellow rounded-full flex items-center justify-center">
            <span className="text-tocantins-blue font-bold text-lg">TI</span>
          </div>
          <div>
            <h1 className="text-xl font-bold">Tocantins Integrado</h1>
            <p className="text-xs text-white/70">Superinteligência Territorial</p>
          </div>
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2">
        <button
          onClick={onChatClick}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg transition-all
            ${isChatOpen
              ? 'bg-white text-tocantins-blue'
              : 'bg-white/10 hover:bg-white/20'
            }
          `}
        >
          <MessageSquare className="h-5 w-5" />
          <span className="font-medium">Assistente IA</span>
        </button>

        <button
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          aria-label="Ajuda"
        >
          <HelpCircle className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
