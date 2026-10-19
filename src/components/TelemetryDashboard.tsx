import React, { useState } from 'react';
import type { GatewayMetrics } from '../types';
import { defaultGatewayMetrics, clusterMicroservices } from '../data/microservicesData';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  ShieldAlert, 
  CheckCircle2, 
  Server, 
  Zap, 
  Layers, 
  RotateCw,
  Gauge
} from 'lucide-react';

export const TelemetryDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<GatewayMetrics>(defaultGatewayMetrics);
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d'>('24h');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const refreshMetrics = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setMetrics(prev => ({
        ...prev,
        totalRequests: prev.totalRequests + Math.floor(Math.random() * 450 + 50),
        activeJwtSessions: prev.activeJwtSessions + Math.floor(Math.random() * 20 - 10),
        avgLatencyMs: Number((14.0 + Math.random() * 1.5).toFixed(1)),
      }));
      setIsRefreshing(false);
    }, 400);
  };

  const successPercentage = ((metrics.successfulRequests / metrics.totalRequests) * 100).toFixed(2);
  const throttledPercentage = ((metrics.throttledRequests / metrics.totalRequests) * 100).toFixed(2);
  const errorPercentage = ((metrics.serverErrors / metrics.totalRequests) * 100).toFixed(2);

  const percentiles = [
    { label: 'P50 (Mediana)', latency: '10.2 ms', percent: 35, color: 'bg-syntax-green', desc: '50% de peticiones se resuelven en 10ms o menos' },
    { label: 'P90', latency: '18.5 ms', percent: 55, color: 'bg-syntax-cyan', desc: '90% de peticiones se resuelven bajo este umbral' },
    { label: 'P95', latency: `${metrics.p95LatencyMs} ms`, percent: 72, color: 'bg-syntax-purple', desc: 'Objetivo de SLA empresarial garantizado' },
    { label: 'P99 (Cola Crítica)', latency: `${metrics.p99LatencyMs} ms`, percent: 92, color: 'bg-syntax-amber', desc: 'Casos extremos de queries pesadas a MySQL o Cold Starts' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-lead-900 border border-lead-border rounded-2xl p-6 shadow-lead-card">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-lead-800 border border-lead-border rounded-xl text-syntax-purple">
              <BarChart3 className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Telemetría & Rendimiento del Gateway
                </h2>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-lead-950 text-syntax-green border border-syntax-green/30">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  SLO Cumplido (99.9%)
                </span>
              </div>
              <p className="text-sm text-lead-silver mt-1">
                Monitoreo en tiempo real de latencia, distribución de percentiles P50/P90/P99 y tasas de error HTTP.
              </p>
            </div>
          </div>

          {/* Controls: Time Range & Refresh */}
          <div className="flex items-center gap-3">
            <div className="bg-lead-input p-1 border border-lead-border rounded-xl flex items-center font-mono text-xs">
              {(['1h', '24h', '7d'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    timeRange === range
                      ? 'bg-lead-800 text-syntax-cyan font-semibold border border-syntax-cyan/40 shadow-sm'
                      : 'text-lead-silver hover:text-white'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>

            <button
              onClick={refreshMetrics}
              disabled={isRefreshing}
              className="p-2.5 bg-lead-input border border-lead-border hover:bg-lead-800 text-lead-silver rounded-xl hover:text-white transition-all disabled:opacity-50"
              title="Refrescar Métricas"
            >
              <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-syntax-cyan' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Main KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Volume */}
        <div className="bg-lead-900 border border-lead-border rounded-2xl p-5 shadow-lead-card">
          <div className="flex items-center justify-between text-lead-muted text-xs font-mono uppercase">
            <span>Peticiones Totales</span>
            <TrendingUp className="w-4 h-4 text-syntax-cyan" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-white tracking-tight">
            {metrics.totalRequests.toLocaleString()}
          </div>
          <div className="mt-2 text-xs text-syntax-green flex items-center gap-1 font-mono">
            <span>↑ +12.4% vs periodo previo</span>
          </div>
        </div>

        {/* Avg Latency */}
        <div className="bg-lead-900 border border-lead-border rounded-2xl p-5 shadow-lead-card">
          <div className="flex items-center justify-between text-lead-muted text-xs font-mono uppercase">
            <span>Latencia Media (RTT)</span>
            <Clock className="w-4 h-4 text-syntax-green" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-syntax-green tracking-tight">
            {metrics.avgLatencyMs} ms
          </div>
          <div className="mt-2 text-xs text-lead-muted flex items-center gap-1 font-mono">
            <span>Target SLA: &lt; 50ms</span>
          </div>
        </div>

        {/* Throttled Requests */}
        <div className="bg-lead-900 border border-lead-border rounded-2xl p-5 shadow-lead-card">
          <div className="flex items-center justify-between text-lead-muted text-xs font-mono uppercase">
            <span>Rate Limited (429)</span>
            <ShieldAlert className="w-4 h-4 text-syntax-amber" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-syntax-amber tracking-tight">
            {metrics.throttledRequests.toLocaleString()}
          </div>
          <div className="mt-2 text-xs text-lead-muted flex items-center gap-1 font-mono">
            <span>{throttledPercentage}% del tráfico total</span>
          </div>
        </div>

        {/* Active JWT Sessions */}
        <div className="bg-lead-900 border border-lead-border rounded-2xl p-5 shadow-lead-card">
          <div className="flex items-center justify-between text-lead-muted text-xs font-mono uppercase">
            <span>Sesiones JWT Activas</span>
            <Zap className="w-4 h-4 text-syntax-purple" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-syntax-purple tracking-tight">
            {metrics.activeJwtSessions.toLocaleString()}
          </div>
          <div className="mt-2 text-xs text-lead-muted flex items-center gap-1 font-mono">
            <span>Token State: In-Memory Redis</span>
          </div>
        </div>
      </div>

      {/* Latency Percentiles & HTTP Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Latency Distribution */}
        <div className="lg:col-span-7 bg-lead-900 border border-lead-border rounded-2xl p-6 shadow-lead-card space-y-4">
          <div className="flex items-center justify-between border-b border-lead-border pb-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200 flex items-center gap-2">
              <Gauge className="w-4 h-4 text-syntax-purple" />
              Distribución de Percentiles de Latencia
            </h3>
            <span className="text-xs text-lead-muted font-mono">Histograma RTT</span>
          </div>

          <div className="space-y-4 pt-2">
            {percentiles.map((p) => (
              <div key={p.label} className="p-3.5 bg-lead-input border border-lead-border/80 rounded-xl space-y-2">
                <div className="flex items-center justify-between font-mono text-xs">
                  <span className="text-white font-semibold">{p.label}</span>
                  <span className="text-syntax-cyan font-bold text-sm">{p.latency}</span>
                </div>
                <div className="w-full bg-lead-850 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`${p.color} h-full rounded-full transition-all duration-500`}
                    style={{ width: `${p.percent}%` }}
                  />
                </div>
                <div className="text-[11px] text-lead-muted">{p.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: HTTP Status Code Breakdown */}
        <div className="lg:col-span-5 bg-lead-900 border border-lead-border rounded-2xl p-6 shadow-lead-card space-y-4">
          <div className="flex items-center justify-between border-b border-lead-border pb-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200 flex items-center gap-2">
              <Layers className="w-4 h-4 text-syntax-cyan" />
              Desglose de Códigos de Respuesta
            </h3>
            <span className="text-xs text-lead-muted font-mono">Status Codes</span>
          </div>

          {/* Visual Bar Summary */}
          <div className="p-4 bg-lead-input border border-lead-border rounded-xl space-y-3 font-mono text-xs">
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span className="text-syntax-green font-semibold">2xx Exitosos (OK, Created)</span>
                <span>{successPercentage}%</span>
              </div>
              <div className="w-full bg-lead-850 h-2 rounded-full overflow-hidden">
                <div className="bg-syntax-green h-full rounded-full" style={{ width: `${successPercentage}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span className="text-syntax-amber font-semibold">429 Rate Limited (Throttled)</span>
                <span>{throttledPercentage}%</span>
              </div>
              <div className="w-full bg-lead-850 h-2 rounded-full overflow-hidden">
                <div className="bg-syntax-amber h-full rounded-full" style={{ width: `${Math.max(Number(throttledPercentage) * 10, 4)}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span className="text-syntax-red font-semibold">5xx Errores de Servidor</span>
                <span>{errorPercentage}%</span>
              </div>
              <div className="w-full bg-lead-850 h-2 rounded-full overflow-hidden">
                <div className="bg-syntax-red h-full rounded-full" style={{ width: `${Math.max(Number(errorPercentage) * 10, 2)}%` }} />
              </div>
            </div>
          </div>

          {/* Security & Token Health Card */}
          <div className="p-4 bg-lead-input border border-lead-border rounded-xl space-y-2 text-xs">
            <h4 className="font-bold text-white flex items-center gap-1.5 font-mono">
              <Zap className="w-4 h-4 text-syntax-purple" />
              Eventos de Seguridad & Control
            </h4>
            <ul className="space-y-1.5 text-lead-silver font-mono text-[11px]">
              <li className="flex justify-between">
                <span>Firmas HMAC-SHA256 Verificadas:</span>
                <span className="text-syntax-green">100% Integridad</span>
              </li>
              <li className="flex justify-between">
                <span>Tokens JWT Expirados Bloqueados:</span>
                <span className="text-white">142 eventos</span>
              </li>
              <li className="flex justify-between">
                <span>Ráfagas Mitigadas por Token Bucket:</span>
                <span className="text-syntax-amber">4,388 rechazos</span>
              </li>
              <li className="flex justify-between">
                <span>Consultas SQL Sanitizadas (Prepared):</span>
                <span className="text-syntax-cyan">100% Prevenidas</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Cluster Latency & Health Matrix Table */}
      <div className="bg-lead-900 border border-lead-border rounded-2xl p-6 shadow-lead-card">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200 mb-4 flex items-center gap-2">
          <Server className="w-4 h-4 text-syntax-green" />
          Rendimiento por Microservicio Interno
        </h3>

        <div className="border border-lead-border rounded-xl overflow-hidden bg-lead-input font-mono text-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-lead-900 text-lead-silver border-b border-lead-border">
                <tr>
                  <th className="p-3">SERVICIO</th>
                  <th className="p-3">PUERTO</th>
                  <th className="p-3">STACK TECNOLÓGICO</th>
                  <th className="p-3">LATENCIA PROMEDIO</th>
                  <th className="p-3">USO CPU</th>
                  <th className="p-3">UPTIME</th>
                  <th className="p-3">ESTADO</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-lead-border/60 text-slate-300">
                {clusterMicroservices.map((svc) => (
                  <tr key={svc.id} className="hover:bg-lead-850/40 transition-colors">
                    <td className="p-3 font-semibold text-white">{svc.name}</td>
                    <td className="p-3 text-syntax-cyan">:{svc.port}</td>
                    <td className="p-3 text-lead-silver">{svc.framework}</td>
                    <td className="p-3 text-syntax-green font-semibold">{svc.avgLatencyMs} ms</td>
                    <td className="p-3">{svc.cpuPercent}%</td>
                    <td className="p-3 text-syntax-purple">{svc.uptimePercent}%</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-lead-950 text-syntax-green border border-syntax-green/20">
                        {svc.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
