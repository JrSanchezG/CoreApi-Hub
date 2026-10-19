import React from 'react';
import { 
  Layers, 
  Terminal, 
  Key, 
  Gauge, 
  Database, 
  Network, 
  BarChart3, 
  CheckCircle2, 
  ExternalLink
} from 'lucide-react';
import type { RateLimitTier } from '../types';

export type ActiveTab = 'playground' | 'jwt' | 'ratelimit' | 'database' | 'topology' | 'telemetry';

interface NavbarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  activeRole: string;
  rateLimitTier: RateLimitTier;
  remainingTokens: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  activeRole,
  rateLimitTier,
  remainingTokens,
}) => {
  const tabs: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'playground', label: 'API Playground', icon: <Terminal className="w-4 h-4" /> },
    { id: 'jwt', label: 'JWT Auth Lab', icon: <Key className="w-4 h-4" /> },
    { id: 'ratelimit', label: 'Rate Limiter', icon: <Gauge className="w-4 h-4" /> },
    { id: 'database', label: 'MySQL Schema', icon: <Database className="w-4 h-4" /> },
    { id: 'topology', label: 'Service Mesh', icon: <Network className="w-4 h-4" /> },
    { id: 'telemetry', label: 'Telemetry', icon: <BarChart3 className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-lead-950/95 backdrop-blur-xl border-b border-lead-border shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-lead-900 border border-lead-border flex items-center justify-center shadow-sm">
              <Layers className="w-5 h-5 text-syntax-cyan" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-black text-base sm:text-lg text-white tracking-tight">
                  CoreAPI<span className="text-syntax-cyan">Hub</span>
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-syntax-green/15 text-syntax-green border border-syntax-green/30">
                  v3.4
                </span>
              </div>
              <p className="text-[11px] text-lead-muted font-mono hidden md:block">
                Microservices Gateway & MySQL Suite
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden lg:flex items-center gap-1 bg-lead-900 p-1 rounded-xl border border-lead-border">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-lead-800 text-syntax-cyan border border-syntax-cyan/40 shadow-sm'
                    : 'text-lead-silver hover:text-white hover:bg-lead-850'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>

          {/* Live Status Indicators */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* JWT Role Badge */}
            <div 
              onClick={() => onTabChange('jwt')}
              className="cursor-pointer hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-lead-900 border border-lead-border text-[11px] font-mono hover:border-syntax-purple transition-colors"
              title="Click para ver JWT activo"
            >
              <span className="w-2 h-2 rounded-full bg-syntax-purple animate-pulse" />
              <span className="text-lead-muted">JWT:</span>
              <span className="text-syntax-purple font-bold capitalize">{activeRole}</span>
            </div>

            {/* Rate Limit Remaining Tokens */}
            <div 
              onClick={() => onTabChange('ratelimit')}
              className="cursor-pointer flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-lead-900 border border-lead-border text-[11px] font-mono hover:border-syntax-amber transition-colors"
              title={`Rate Limiter: nivel ${rateLimitTier}`}
            >
              <Gauge className="w-3.5 h-3.5 text-syntax-amber" />
              <span className="text-lead-muted hidden sm:inline">Quota:</span>
              <span className="text-syntax-amber font-bold">{remainingTokens} left</span>
              <span className="text-lead-muted text-[10px] hidden md:inline capitalize">({rateLimitTier})</span>
            </div>

            {/* MySQL Status */}
            <div 
              onClick={() => onTabChange('database')}
              className="cursor-pointer hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-lead-900 border border-lead-border text-[11px] font-mono hover:border-syntax-green transition-colors"
              title="MySQL 8.0 Primary Node OK"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-syntax-green" />
              <span className="text-slate-300">MySQL:</span>
              <span className="text-syntax-green font-bold">1.2ms</span>
            </div>

            {/* Portfolio Link */}
            <a
              href="http://localhost:5173"
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-lg bg-lead-900 border border-lead-border text-lead-silver hover:text-white hover:border-syntax-cyan transition-colors"
              title="Ir al portafolio principal"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

        </div>

        {/* Mobile Navigation Row */}
        <div className="flex lg:hidden overflow-x-auto gap-1 py-2 border-t border-lead-border no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-lead-800 text-syntax-cyan border border-syntax-cyan/40 shadow-sm'
                  : 'text-lead-silver hover:text-white'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

      </div>
    </header>
  );
};
