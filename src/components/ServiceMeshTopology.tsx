import React, { useState, useEffect } from 'react';
import type { MicroserviceNode, TrafficLogEntry, HttpMethod } from '../types';
import { clusterMicroservices, initialTrafficLogs } from '../data/microservicesData';
import { 
  Network, 
  Server, 
  Activity, 
  Cpu, 
  HardDrive, 
  ShieldCheck, 
  ArrowRight, 
  Play, 
  Pause, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  Terminal,
  Filter
} from 'lucide-react';

export const ServiceMeshTopology: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<MicroserviceNode>(clusterMicroservices[0]);
  const [trafficLogs, setTrafficLogs] = useState<TrafficLogEntry[]>(initialTrafficLogs);
  const [isStreaming, setIsStreaming] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<'all' | '200' | '429'>('all');

  // Automatic simulated traffic generation when streaming is active
  useEffect(() => {
    if (!isStreaming) return;

    const endpointsPool = [
      { path: '/api/v1/auth/verify', method: 'POST' as HttpMethod, svc: 'Auth & Identity Engine', auth: 'Bearer JWT', baseLatency: 11 },
      { path: '/api/v1/users', method: 'GET' as HttpMethod, svc: 'User RBAC & Quotas Service', auth: 'Bearer JWT', baseLatency: 14 },
      { path: '/api/v1/products', method: 'GET' as HttpMethod, svc: 'Product Catalog & Inventory', auth: 'Public', baseLatency: 6 },
      { path: '/api/v1/payments/charge', method: 'POST' as HttpMethod, svc: 'Payments & Billing Gateway', auth: 'Bearer JWT', baseLatency: 28 },
      { path: '/api/v1/products/prd-01/stock', method: 'PATCH' as HttpMethod, svc: 'Product Catalog & Inventory', auth: 'API Key', baseLatency: 4 },
      { path: '/api/v1/orders', method: 'POST' as HttpMethod, svc: 'Order Fulfillment & RabbitMQ Dispatcher', auth: 'Bearer JWT', baseLatency: 19 },
      { path: '/api/v1/gateway/health', method: 'GET' as HttpMethod, svc: 'MySQL 8.0 Primary Cluster (Percona)', auth: 'Internal', baseLatency: 2 },
    ];

    const interval = setInterval(() => {
      const sample = endpointsPool[Math.floor(Math.random() * endpointsPool.length)];
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0');
      
      const isThrottled = Math.random() < 0.15;
      const status = isThrottled ? 429 : (sample.method === 'POST' ? 201 : 200);
      const latency = isThrottled ? Number((Math.random() * 2 + 2).toFixed(1)) : Number((sample.baseLatency + Math.random() * 8).toFixed(1));

      const newEntry: TrafficLogEntry = {
        id: 'log-' + Date.now().toString().slice(-5),
        timestamp: timeStr,
        method: sample.method,
        path: sample.path,
        status: status,
        latencyMs: latency,
        ip: `190.220.${Math.floor(Math.random() * 200 + 10)}.${Math.floor(Math.random() * 250 + 1)}`,
        authMethod: isThrottled ? 'API Key (Throttled)' : sample.auth,
        service: sample.svc,
      };

      setTrafficLogs(prev => [newEntry, ...prev.slice(0, 24)]);
    }, 2800);

    return () => clearInterval(interval);
  }, [isStreaming]);

  const handleManualPing = () => {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0');
    const newEntry: TrafficLogEntry = {
      id: 'log-' + Date.now().toString().slice(-5),
      timestamp: timeStr,
      method: 'GET',
      path: '/api/v1/gateway/health',
      status: 200,
      latencyMs: 1.4,
      ip: '127.0.0.1 (Manual Ping)',
      authMethod: 'Session Active',
      service: 'Ingress Gateway Router',
    };
    setTrafficLogs(prev => [newEntry, ...prev.slice(0, 24)]);
  };

  const filteredLogs = trafficLogs.filter(log => {
    if (statusFilter === 'all') return true;
    if (statusFilter === '200') return log.status >= 200 && log.status < 300;
    if (statusFilter === '429') return log.status === 429;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-lead-900 border border-lead-border rounded-2xl p-6 shadow-lead-card">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-lead-800 border border-lead-border rounded-xl text-syntax-purple">
              <Network className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Malla de Microservicios & Topología de Red
                </h2>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-lead-950 text-syntax-green border border-syntax-green/30">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  6 / 6 Nodos Operacionales
                </span>
              </div>
              <p className="text-sm text-lead-silver mt-1">
                Visualización de infraestructura distribuida en alta disponibilidad con enrutamiento inverso y balanceo de carga L7.
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
            <div className="px-3 py-2 bg-lead-input border border-lead-border rounded-lg flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-syntax-green" />
              <div>
                <span className="text-lead-muted block text-[10px]">UPTIME CLUSTER</span>
                <span className="text-syntax-green font-semibold">99.98%</span>
              </div>
            </div>
            <div className="px-3 py-2 bg-lead-input border border-lead-border rounded-lg flex items-center gap-2">
              <Cpu className="w-4 h-4 text-syntax-cyan" />
              <div>
                <span className="text-lead-muted block text-[10px]">CPU PROMEDIO</span>
                <span className="text-white font-semibold">23.8%</span>
              </div>
            </div>
            <div className="px-3 py-2 bg-lead-input border border-lead-border rounded-lg flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-syntax-purple" />
              <div>
                <span className="text-lead-muted block text-[10px]">MEMORIA TOTAL</span>
                <span className="text-white font-semibold">4,060 MB</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Topology Diagram Interactive View */}
      <div className="bg-lead-900 border border-lead-border rounded-2xl p-6 shadow-lead-card">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200 mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4 text-syntax-purple" />
          Mapa de Arquitectura & Capas del Sistema
        </h3>

        {/* 3-Tier Layer Architecture Layout */}
        <div className="space-y-6">
          {/* Layer 1: Ingress Gateway */}
          <div className="p-4 bg-lead-950 border border-lead-border rounded-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 px-3 py-1 bg-lead-800 text-syntax-purple text-[10px] font-mono border-b border-l border-lead-border rounded-bl-lg">
              PUERTO 8000 • TLS 1.3
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-lead-800 text-syntax-cyan rounded-lg border border-syntax-cyan/30 shadow-sm">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white flex items-center gap-2 font-mono">
                    CoreAPI Edge Ingress Gateway
                    <span className="w-2 h-2 rounded-full bg-syntax-green animate-pulse"></span>
                  </h4>
                  <p className="text-xs text-lead-silver">
                    Inspección JWT de firmas criptográficas, Token Bucket Rate Limiting, CORS & Proxy Inverso L7
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 font-mono text-xs text-slate-300">
                <span className="px-2.5 py-1 bg-lead-input rounded border border-lead-border">Envoy Router</span>
                <span className="px-2.5 py-1 bg-lead-input rounded border border-lead-border">JWT Auth Filter</span>
                <span className="px-2.5 py-1 bg-lead-input rounded border border-lead-border">Bucket Engine</span>
              </div>
            </div>
          </div>

          {/* Connection Arrows Divider */}
          <div className="flex justify-around items-center px-8 text-lead-muted">
            <ArrowRight className="w-4 h-4 rotate-90" />
            <ArrowRight className="w-4 h-4 rotate-90" />
            <ArrowRight className="w-4 h-4 rotate-90" />
            <ArrowRight className="w-4 h-4 rotate-90" />
            <ArrowRight className="w-4 h-4 rotate-90" />
          </div>

          {/* Layer 2: Microservices Nodes Grid */}
          <div>
            <div className="text-xs font-semibold uppercase text-lead-silver mb-3 tracking-wider">
              Nodos de Microservicios Internos (Haz click para inspeccionar telemetría):
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {clusterMicroservices.map((node) => {
                const isSelected = selectedNode.id === node.id;
                return (
                  <button
                    key={node.id}
                    onClick={() => setSelectedNode(node)}
                    className={`text-left p-4 rounded-xl transition-all border relative overflow-hidden ${
                      isSelected
                        ? 'bg-lead-800 border-syntax-purple/50 shadow-sm'
                        : 'bg-lead-950/60 border-lead-border hover:border-lead-700 hover:bg-lead-850'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className={`p-2 rounded-lg ${isSelected ? 'bg-lead-950 text-syntax-purple border border-syntax-purple/40' : 'bg-lead-850 text-lead-silver'}`}>
                          <Server className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-sm text-white">{node.name}</div>
                          <div className="text-[11px] text-lead-muted font-mono">Port :{node.port}</div>
                        </div>
                      </div>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-lead-950 text-syntax-green border border-syntax-green/20">
                        {node.uptimePercent}%
                      </span>
                    </div>

                    <div className="mt-3 pt-3 border-t border-lead-border/80 text-xs text-lead-silver font-mono flex items-center justify-between">
                      <span>{node.framework.split('/')[0]}</span>
                      <span className="text-syntax-cyan">{node.avgLatencyMs}ms</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Node Detail Inspector Drawer */}
        <div className="mt-6 p-4 bg-lead-input border border-lead-border rounded-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-lead-border pb-3">
            <div className="flex items-center gap-2.5">
              <Server className="w-5 h-5 text-syntax-purple" />
              <div>
                <h4 className="text-sm font-bold text-white font-mono">{selectedNode.name}</h4>
                <span className="text-xs text-lead-silver">{selectedNode.framework}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="text-lead-silver">Instancias Pods: <strong className="text-white">{selectedNode.instanceCount} réplicas</strong></span>
              <span className="text-lead-silver">Uptime: <strong className="text-syntax-green">{selectedNode.uptimePercent}%</strong></span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 font-mono text-xs">
            <div className="p-3 bg-lead-950 rounded-lg border border-lead-border">
              <span className="text-lead-muted block text-[10px]">CPU LOAD</span>
              <span className="text-lg font-bold text-white">{selectedNode.cpuPercent}%</span>
              <div className="w-full bg-lead-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                <div className="bg-syntax-purple h-full rounded-full" style={{ width: `${selectedNode.cpuPercent}%` }}></div>
              </div>
            </div>

            <div className="p-3 bg-lead-950 rounded-lg border border-lead-border">
              <span className="text-lead-muted block text-[10px]">RAM ASIGNADA</span>
              <span className="text-lg font-bold text-syntax-cyan">{selectedNode.memoryMb} MB</span>
              <span className="text-lead-muted text-[10px] block mt-1">Dedicada por pod</span>
            </div>

            <div className="p-3 bg-lead-950 rounded-lg border border-lead-border">
              <span className="text-lead-muted block text-[10px]">LATENCIA INTERNA</span>
              <span className="text-lg font-bold text-syntax-green">{selectedNode.avgLatencyMs} ms</span>
              <span className="text-lead-muted text-[10px] block mt-1">gRPC / Unix Socket</span>
            </div>

            <div className="p-3 bg-lead-950 rounded-lg border border-lead-border">
              <span className="text-lead-muted block text-[10px]">HEALTHCHECK</span>
              <span className="text-lg font-bold text-syntax-green">HTTP 200</span>
              <span className="text-lead-muted text-[10px] block mt-1">/health/liveness</span>
            </div>
          </div>
        </div>
      </div>

      {/* Live Traffic Stream Console */}
      <div className="bg-lead-900 border border-lead-border rounded-2xl p-6 shadow-lead-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-lead-border gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-lead-800 border border-lead-border rounded-lg text-syntax-green">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2 font-mono">
                Consola de Tráfico en Vivo (Streaming HTTP Logs)
                {isStreaming && <span className="w-2 h-2 rounded-full bg-syntax-green animate-ping"></span>}
              </h3>
              <p className="text-xs text-lead-silver">
                Registro secuencial en tiempo real de solicitudes filtradas por el Gateway
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Filter Buttons */}
            <div className="flex items-center bg-lead-input p-1 border border-lead-border rounded-lg text-xs font-mono">
              <Filter className="w-3.5 h-3.5 text-lead-muted ml-1.5 mr-1" />
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-2 py-0.5 rounded text-[11px] ${statusFilter === 'all' ? 'bg-lead-800 text-syntax-cyan border border-syntax-cyan/40' : 'text-lead-silver hover:text-white'}`}
              >
                Todos
              </button>
              <button
                onClick={() => setStatusFilter('200')}
                className={`px-2 py-0.5 rounded text-[11px] ${statusFilter === '200' ? 'bg-lead-800 text-syntax-green border border-syntax-green/40' : 'text-lead-silver hover:text-white'}`}
              >
                2xx OK
              </button>
              <button
                onClick={() => setStatusFilter('429')}
                className={`px-2 py-0.5 rounded text-[11px] ${statusFilter === '429' ? 'bg-lead-800 text-syntax-red border border-syntax-red/40' : 'text-lead-silver hover:text-white'}`}
              >
                429 RateLimit
              </button>
            </div>

            {/* Stream Toggle */}
            <button
              onClick={() => setIsStreaming(!isStreaming)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                isStreaming
                  ? 'bg-lead-950 text-syntax-amber border border-lead-border hover:bg-lead-850'
                  : 'bg-lead-950 text-syntax-green border border-lead-border hover:bg-lead-850'
              }`}
            >
              {isStreaming ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  Pausar
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  Reanudar
                </>
              )}
            </button>

            {/* Test Ping */}
            <button
              onClick={handleManualPing}
              className="px-3 py-1.5 bg-lead-800 hover:bg-lead-750 text-syntax-cyan text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all border border-syntax-cyan/40 shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Test Ping
            </button>
          </div>
        </div>

        {/* Logs Table */}
        <div className="mt-4 border border-lead-border rounded-xl overflow-hidden bg-lead-input font-mono text-xs">
          <div className="overflow-x-auto max-h-80">
            <table className="w-full text-left">
              <thead className="bg-lead-900 text-lead-silver border-b border-lead-border sticky top-0">
                <tr>
                  <th className="p-2.5">TIMESTAMP</th>
                  <th className="p-2.5">MÉTODO</th>
                  <th className="p-2.5">ENDPOINT</th>
                  <th className="p-2.5">STATUS</th>
                  <th className="p-2.5">LATENCIA</th>
                  <th className="p-2.5">IP ORIGEN</th>
                  <th className="p-2.5">MICROSERVICIO DESTINO</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-lead-border/50 text-slate-300">
                {filteredLogs.map((log) => {
                  const is2xx = log.status >= 200 && log.status < 300;
                  const is429 = log.status === 429;
                  return (
                    <tr key={log.id} className="hover:bg-lead-850/40 transition-colors">
                      <td className="p-2.5 text-lead-muted flex items-center gap-1.5 whitespace-nowrap">
                        <Clock className="w-3 h-3" />
                        {log.timestamp}
                      </td>
                      <td className="p-2.5 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.method === 'GET' ? 'bg-syntax-green/15 text-syntax-green' :
                          log.method === 'POST' ? 'bg-syntax-cyan/15 text-syntax-cyan' :
                          log.method === 'PATCH' ? 'bg-syntax-purple/15 text-syntax-purple' :
                          'bg-syntax-amber/15 text-syntax-amber'
                        }`}>
                          {log.method}
                        </span>
                      </td>
                      <td className="p-2.5 text-white font-medium whitespace-nowrap">
                        {log.path}
                      </td>
                      <td className="p-2.5 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          is2xx ? 'bg-syntax-green/15 text-syntax-green border border-syntax-green/30' :
                          is429 ? 'bg-syntax-red/15 text-syntax-red border border-syntax-red/30 animate-pulse' :
                          'bg-syntax-amber/15 text-syntax-amber border border-syntax-amber/30'
                        }`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="p-2.5 whitespace-nowrap text-syntax-cyan font-semibold">
                        {log.latencyMs} ms
                      </td>
                      <td className="p-2.5 text-lead-muted whitespace-nowrap">
                        {log.ip}
                      </td>
                      <td className="p-2.5 text-slate-300 truncate max-w-[220px]">
                        {log.service}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
