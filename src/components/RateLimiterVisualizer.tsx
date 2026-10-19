import React, { useState, useEffect } from 'react';
import type { RateLimitTier, RateLimitStatus } from '../types';
import { TokenBucketRateLimiter, TIER_CONFIG } from '../utils/rateLimiterEngine';
import { 
  Gauge, 
  Zap, 
  RotateCcw, 
  AlertTriangle, 
  CheckCircle2
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface RateLimiterVisualizerProps {
  limiter: TokenBucketRateLimiter;
  currentTier: RateLimitTier;
  onTierChange: (tier: RateLimitTier) => void;
}

export const RateLimiterVisualizer: React.FC<RateLimiterVisualizerProps> = ({
  limiter,
  currentTier,
  onTierChange,
}) => {
  const [status, setStatus] = useState<RateLimitStatus>(() => limiter.getStatus());
  const [lastEvent, setLastEvent] = useState<{ allowed: boolean; count: number; retryAfter?: number } | null>(null);

  // Auto-refresh token refill display every 150ms
  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(limiter.getStatus());
    }, 150);
    return () => clearInterval(interval);
  }, [limiter]);

  const handleFireRequests = (count: number) => {
    let allowedCount = 0;
    let throttledCount = 0;
    let retryAfter = 0;

    for (let i = 0; i < count; i++) {
      const res = limiter.consume(1);
      if (res.allowed) {
        allowedCount++;
      } else {
        throttledCount++;
        retryAfter = res.retryAfterSeconds;
      }
    }

    setStatus(limiter.getStatus());
    setLastEvent({
      allowed: throttledCount === 0,
      count,
      retryAfter: throttledCount > 0 ? retryAfter : undefined,
    });

    if (throttledCount > 0) {
      // Trigger warning feedback
    } else if (count >= 10) {
      confetti({ particleCount: 20, spread: 50, origin: { y: 0.7 } });
    }
  };

  const handleReset = () => {
    limiter.resetTokens();
    setStatus(limiter.getStatus());
    setLastEvent(null);
  };

  const capacity = TIER_CONFIG[currentTier].capacity;
  const fillPercent = Math.min(100, Math.max(0, (status.tokensRemaining / capacity) * 100));

  return (
    <div className="space-y-6">
      
      {/* Top Banner: Tier Selector & Global Overview */}
      <div className="p-4 sm:p-6 rounded-2xl bg-lead-900 border border-lead-border flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-lead-800 text-syntax-amber border border-syntax-amber/30">
              <Gauge className="w-5 h-5" />
            </span>
            <h2 className="font-display font-black text-lg text-white">
              Motor de Rate Limiting (Token Bucket Algorithm)
            </h2>
          </div>
          <p className="text-xs text-lead-silver mt-1 max-w-xl">
            Protege los microservicios downstream frente a sobrecargas y ataques DoS mediante cuotas de recarga continua de fichas por segundo.
          </p>
        </div>

        {/* Tier Buttons */}
        <div className="flex items-center gap-2 bg-lead-950 p-1.5 rounded-xl border border-lead-border">
          {(['free', 'developer', 'enterprise'] as const).map(tier => (
            <button
              key={tier}
              onClick={() => {
                onTierChange(tier);
                limiter.setTier(tier);
                setStatus(limiter.getStatus());
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold capitalize transition-all ${
                currentTier === tier
                  ? 'bg-lead-800 text-syntax-amber border border-syntax-amber/40 shadow-sm'
                  : 'text-lead-silver hover:text-white'
              }`}
            >
              {tier} ({TIER_CONFIG[tier].limitPerMinute} rpm)
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Visual Tank + Stats + Stress Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Visual Token Tank (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-gateway-900 border border-gateway-border flex flex-col items-center justify-between space-y-6">
          <div className="w-full flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Estado de la Cubeta:</span>
            <span className="text-brand-cyan font-bold">
              {status.tokensRemaining} / {capacity} Tokens
            </span>
          </div>

          {/* Interactive Tank Container */}
          <div className="relative w-48 h-64 bg-gateway-950 border-4 border-slate-700 rounded-3xl overflow-hidden shadow-inner flex flex-col justify-end p-2">
            {/* Water / Liquid Level */}
            <div
              style={{ height: `${fillPercent}%` }}
              className={`w-full rounded-2xl transition-all duration-300 relative flex items-center justify-center ${
                fillPercent > 50
                  ? 'bg-gradient-to-t from-emerald-600 to-brand-cyan shadow-glow-cyan'
                  : fillPercent > 20
                  ? 'bg-gradient-to-t from-amber-600 to-amber-400 shadow-glow-amber'
                  : 'bg-gradient-to-t from-rose-600 to-red-400'
              }`}
            >
              {/* Token Bubbles indicator */}
              <div className="text-center font-mono text-xs font-black text-black">
                {Math.round(fillPercent)}%
              </div>
            </div>

            {/* Empty Tank Overlay warning */}
            {status.tokensRemaining === 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20 animate-pulse">
                <AlertTriangle className="w-8 h-8 text-rose-500 mb-1" />
                <span className="font-mono text-xs text-rose-400 font-bold uppercase">
                  BUCKET VACÍO (429)
                </span>
              </div>
            )}
          </div>

          {/* Refill Rate indicator */}
          <div className="text-center">
            <span className="text-xs font-mono text-slate-400 block">
              Tasa de Recarga Automática:
            </span>
            <span className="text-sm font-mono font-bold text-brand-emerald">
              +{TIER_CONFIG[currentTier].refillRatePerSec} tokens / segundo
            </span>
          </div>
        </div>

        {/* Stats & Stress Controls (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          
          {/* Counters Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl bg-gateway-900 border border-gateway-border">
              <span className="text-[10px] font-mono text-slate-500 uppercase block">Tokens Listos</span>
              <span className="text-2xl font-mono font-black text-brand-cyan">{status.tokensRemaining}</span>
            </div>

            <div className="p-4 rounded-xl bg-gateway-900 border border-gateway-border">
              <span className="text-[10px] font-mono text-slate-500 uppercase block">Aprobadas (200 OK)</span>
              <span className="text-2xl font-mono font-black text-emerald-400">{status.totalAllowed}</span>
            </div>

            <div className="p-4 rounded-xl bg-gateway-900 border border-gateway-border col-span-2 sm:col-span-1">
              <span className="text-[10px] font-mono text-slate-500 uppercase block">Throttled (429 Error)</span>
              <span className="text-2xl font-mono font-black text-rose-400">{status.totalThrottled}</span>
            </div>
          </div>

          {/* Interactive Stress Controls */}
          <div className="p-5 rounded-2xl bg-gateway-900 border border-gateway-border space-y-4">
            <h4 className="text-xs font-mono uppercase tracking-wider text-lead-silver flex items-center gap-1.5 font-bold">
              <Zap className="w-4 h-4 text-syntax-amber" />
              Simulador de Carga & Tráfico de Red:
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => handleFireRequests(1)}
                className="py-3 px-3 rounded-xl bg-lead-950 hover:bg-lead-800 border border-lead-border hover:border-syntax-cyan/50 text-xs font-mono font-bold text-slate-200 transition-colors flex flex-col items-center gap-1"
              >
                <span>Petición Individual</span>
                <span className="text-[10px] text-syntax-cyan font-normal">-1 Token</span>
              </button>

              <button
                onClick={() => handleFireRequests(10)}
                className="py-3 px-3 rounded-xl bg-lead-950 hover:bg-lead-800 border border-lead-border hover:border-syntax-amber/50 text-xs font-mono font-bold text-slate-200 transition-colors flex flex-col items-center gap-1"
              >
                <span>Ráfaga de 10 Req</span>
                <span className="text-[10px] text-syntax-amber font-normal">-10 Tokens</span>
              </button>

              <button
                onClick={() => handleFireRequests(50)}
                className="py-3 px-3 rounded-xl bg-lead-950 hover:bg-lead-800 border border-lead-border hover:border-syntax-red/50 text-xs font-mono font-bold text-slate-200 transition-colors flex flex-col items-center gap-1"
              >
                <span>Pico de 50 Req</span>
                <span className="text-[10px] text-syntax-red font-normal">Estrés Masivo</span>
              </button>
            </div>

            <button
              onClick={handleReset}
              className="w-full py-2 rounded-xl bg-lead-950 hover:bg-lead-800 border border-lead-border text-lead-silver hover:text-white text-xs font-mono flex items-center justify-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restablecer Cubeta al Máximo</span>
            </button>
          </div>

          {/* Feedback Card for Last Event */}
          {lastEvent && (
            <div className={`p-4 rounded-xl border flex items-center justify-between text-xs font-mono ${
              lastEvent.allowed
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                : 'bg-rose-950/40 border-rose-500/40 text-rose-300 animate-shake'
            }`}>
              <div className="flex items-center gap-2">
                {lastEvent.allowed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                )}
                <span>
                  {lastEvent.allowed 
                    ? `[200 OK] Se procesaron ${lastEvent.count} solicitudes exitosamente dentro de la cuota.`
                    : `[429 TOO MANY REQUESTS] Cuota agotada. Tiempo de espera requerido: ${lastEvent.retryAfter}s.`}
                </span>
              </div>

              <span className="px-2 py-0.5 rounded bg-black/60 text-[10px] font-bold">
                {lastEvent.allowed ? 'PASS' : 'THROTTLED'}
              </span>
            </div>
          )}

          {/* HTTP Rate Limit Headers Inspector */}
          <div className="p-4 rounded-xl bg-gateway-950 border border-gateway-border font-mono text-xs space-y-2">
            <span className="text-[10px] uppercase text-slate-500 block font-bold">
              // CABECERAS HTTP RETORNADAS POR EL GATEWAY:
            </span>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-slate-500">X-RateLimit-Limit: </span>
                <span className="text-brand-cyan">{TIER_CONFIG[currentTier].limitPerMinute}</span>
              </div>
              <div>
                <span className="text-slate-500">X-RateLimit-Remaining: </span>
                <span className="text-emerald-400">{status.tokensRemaining}</span>
              </div>
              <div>
                <span className="text-slate-500">X-RateLimit-Reset: </span>
                <span className="text-brand-indigo">
                  {Math.ceil((capacity - status.tokensRemaining) / TIER_CONFIG[currentTier].refillRatePerSec)}s
                </span>
              </div>
              <div>
                <span className="text-slate-500">Algorithm: </span>
                <span className="text-brand-amber">Token Bucket</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
