import React, { useState } from 'react';
import type { ApiEndpoint, ApiExecutionResult, HttpMethod } from '../types';
import { microserviceEndpoints } from '../data/endpointsData';
import { 
  Play, 
  Copy, 
  Check, 
  Search, 
  Lock, 
  Unlock, 
  Clock, 
  AlertCircle, 
  Gauge, 
  Code2, 
  FileJson, 
  Sliders
} from 'lucide-react';
import { generateCurlSnippet, generatePythonSnippet, generateJavaScriptSnippet } from '../utils/codeGenerators';

interface ApiPlaygroundProps {
  jwtToken: string;
  onExecuteRequest: (endpoint: ApiEndpoint, body?: Record<string, unknown>) => ApiExecutionResult;
}

export const ApiPlayground: React.FC<ApiPlaygroundProps> = ({
  jwtToken,
  onExecuteRequest,
}) => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpoint>(microserviceEndpoints[0]);
  const [methodFilter, setMethodFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Request builder state
  const [activeRequestTab, setActiveRequestTab] = useState<'body' | 'headers' | 'snippets'>('body');
  const [jsonBody, setJsonBody] = useState<string>(() => 
    selectedEndpoint.sampleRequestBody ? JSON.stringify(selectedEndpoint.sampleRequestBody, null, 2) : ''
  );
  const [jsonError, setJsonError] = useState<string | null>(null);

  // Execution state
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<ApiExecutionResult | null>(null);
  const [activeSnippetTab, setActiveSnippetTab] = useState<'curl' | 'python' | 'js'>('curl');
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [copiedResponse, setCopiedResponse] = useState(false);

  // When switching endpoint, update JSON sample
  const handleSelectEndpoint = (ep: ApiEndpoint) => {
    setSelectedEndpoint(ep);
    setJsonBody(ep.sampleRequestBody ? JSON.stringify(ep.sampleRequestBody, null, 2) : '');
    setJsonError(null);
    setExecutionResult(null);
  };

  const handleJsonChange = (val: string) => {
    setJsonBody(val);
    try {
      if (val.trim()) JSON.parse(val);
      setJsonError(null);
    } catch (e: unknown) {
      setJsonError((e as Error).message);
    }
  };

  const handleSendRequest = () => {
    let parsedBody: Record<string, unknown> | undefined;
    if (jsonBody.trim() && ['POST', 'PUT', 'PATCH'].includes(selectedEndpoint.method)) {
      try {
        parsedBody = JSON.parse(jsonBody);
      } catch {
        setJsonError('JSON inválido en el cuerpo de la petición.');
        return;
      }
    }

    setIsExecuting(true);
    setTimeout(() => {
      const res = onExecuteRequest(selectedEndpoint, parsedBody);
      setExecutionResult(res);
      setIsExecuting(false);
    }, 280);
  };

  const handleCopyCode = (text: string, type: 'snippet' | 'response') => {
    navigator.clipboard.writeText(text);
    if (type === 'snippet') {
      setCopiedSnippet(true);
      setTimeout(() => setCopiedSnippet(false), 2000);
    } else {
      setCopiedResponse(true);
      setTimeout(() => setCopiedResponse(false), 2000);
    }
  };

  // Filter endpoints
  const filteredEndpoints = microserviceEndpoints.filter(ep => {
    const matchesMethod = methodFilter === 'ALL' || ep.method === methodFilter;
    const matchesSearch = 
      ep.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ep.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ep.serviceName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesMethod && matchesSearch;
  });

  const getMethodBadgeClass = (m: HttpMethod) => {
    switch (m) {
      case 'GET': return 'bg-syntax-green/15 text-syntax-green border-syntax-green/30';
      case 'POST': return 'bg-syntax-cyan/15 text-syntax-cyan border-syntax-cyan/30';
      case 'PUT': return 'bg-syntax-amber/15 text-syntax-amber border-syntax-amber/30';
      case 'PATCH': return 'bg-syntax-purple/15 text-syntax-purple border-syntax-purple/30';
      case 'DELETE': return 'bg-syntax-red/15 text-syntax-red border-syntax-red/30';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* LEFT COLUMN: Endpoints Navigator (4 cols) */}
      <div className="lg:col-span-4 flex flex-col gap-3">
        
        {/* Search & Method Filters */}
        <div className="p-3.5 rounded-2xl bg-lead-900 border border-lead-border space-y-2.5">
          <div className="relative">
            <Search className="w-4 h-4 text-lead-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar endpoints..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-lead-input border border-lead-border text-xs text-white placeholder-lead-muted focus:outline-none focus:border-syntax-cyan transition-colors"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pt-1">
            {['ALL', 'GET', 'POST', 'PATCH', 'DELETE'].map(m => (
              <button
                key={m}
                onClick={() => setMethodFilter(m)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all ${
                  methodFilter === m
                    ? 'bg-lead-800 text-syntax-cyan border border-syntax-cyan/40 shadow-sm'
                    : 'bg-lead-input text-lead-silver border border-lead-border hover:text-white'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Endpoints List */}
        <div className="p-2 rounded-2xl bg-gateway-900 border border-gateway-border max-h-[640px] overflow-y-auto space-y-1">
          {filteredEndpoints.map(ep => {
            const isSelected = selectedEndpoint.id === ep.id;
            return (
              <div
                key={ep.id}
                onClick={() => handleSelectEndpoint(ep)}
                className={`p-3 rounded-xl cursor-pointer transition-all border ${
                  isSelected
                    ? 'bg-gateway-800 border-brand-cyan/60 shadow-glow-cyan'
                    : 'bg-gateway-950/60 border-gateway-border/60 hover:border-gateway-border hover:bg-gateway-850'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${getMethodBadgeClass(ep.method)}`}>
                      {ep.method}
                    </span>
                    <span className="font-mono text-xs font-semibold text-slate-200 truncate">
                      {ep.path}
                    </span>
                  </div>
                  {ep.authRequired === 'bearer' ? (
                    <span title="Requiere Bearer JWT" className="shrink-0">
                      <Lock className="w-3 h-3 text-brand-indigo" />
                    </span>
                  ) : (
                    <span title="Acceso público" className="shrink-0">
                      <Unlock className="w-3 h-3 text-slate-500" />
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 truncate leading-relaxed">
                  {ep.summary}
                </p>
                <span className="text-[9px] font-mono text-slate-500 mt-1 block">
                  {ep.serviceName}
                </span>
              </div>
            );
          })}
        </div>

      </div>

      {/* RIGHT COLUMN: Endpoint Detail & Live Executor (8 cols) */}
      <div className="lg:col-span-8 flex flex-col gap-4">
        
        {/* Endpoint Header Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gateway-900 border border-gateway-border space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <span className={`px-2.5 py-1 rounded-lg text-xs font-mono font-black border ${getMethodBadgeClass(selectedEndpoint.method)}`}>
                {selectedEndpoint.method}
              </span>
              <h3 className="font-mono text-sm sm:text-base font-bold text-white tracking-wide">
                {selectedEndpoint.path}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-gateway-950 text-slate-300 border border-gateway-border">
                {selectedEndpoint.authRequired === 'bearer' ? 'JWT Bearer' : 'Public Endpoint'}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/30">
                Tier: {selectedEndpoint.rateLimitTier}
              </span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {selectedEndpoint.description}
          </p>
        </div>

        {/* Request Configuration & Send Button */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gateway-900 border border-gateway-border space-y-4">
          
          <div className="flex items-center justify-between border-b border-gateway-border pb-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveRequestTab('body')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeRequestTab === 'body'
                    ? 'bg-brand-cyan/15 text-brand-cyan border border-brand-cyan/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileJson className="w-3.5 h-3.5" />
                <span>Body JSON</span>
              </button>

              <button
                onClick={() => setActiveRequestTab('headers')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeRequestTab === 'headers'
                    ? 'bg-brand-indigo/15 text-brand-indigo border border-brand-indigo/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Headers</span>
              </button>

              <button
                onClick={() => setActiveRequestTab('snippets')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeRequestTab === 'snippets'
                    ? 'bg-brand-emerald/15 text-brand-emerald border border-brand-emerald/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Snippets</span>
              </button>
            </div>

            {/* SEND REQUEST BUTTON */}
            <button
              onClick={handleSendRequest}
              disabled={isExecuting}
              className="px-5 py-2 rounded-xl bg-lead-800 hover:bg-lead-750 text-syntax-cyan border border-syntax-cyan/50 font-mono font-bold text-xs shadow-sm transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-syntax-cyan text-syntax-cyan" />
              <span>{isExecuting ? 'Enviando...' : 'Ejecutar Petición'}</span>
            </button>
          </div>

          {/* TAB 1: BODY JSON */}
          {activeRequestTab === 'body' && (
            <div className="space-y-2">
              {['POST', 'PUT', 'PATCH'].includes(selectedEndpoint.method) ? (
                <>
                  <textarea
                    rows={6}
                    value={jsonBody}
                    onChange={e => handleJsonChange(e.target.value)}
                    className="w-full p-3 rounded-xl bg-gateway-950 border border-gateway-border text-xs font-mono text-brand-cyan focus:outline-none focus:border-brand-cyan transition-colors"
                    placeholder="Payload en formato JSON..."
                  />
                  {jsonError && (
                    <div className="text-[11px] text-rose-400 font-mono flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{jsonError}</span>
                    </div>
                  )}
                </>
              ) : (
                <div className="p-6 text-center text-xs font-mono text-slate-500 rounded-xl bg-gateway-950 border border-dashed border-gateway-border">
                  Las peticiones de tipo {selectedEndpoint.method} no requieren un cuerpo JSON de solicitud.
                </div>
              )}
            </div>
          )}

          {/* TAB 2: HEADERS */}
          {activeRequestTab === 'headers' && (
            <div className="space-y-2 font-mono text-xs">
              <div className="p-3 rounded-xl bg-gateway-950 border border-gateway-border flex items-center justify-between">
                <span className="text-slate-400">Content-Type</span>
                <span className="text-brand-cyan font-semibold">application/json</span>
              </div>
              <div className="p-3 rounded-xl bg-gateway-950 border border-gateway-border flex items-center justify-between">
                <span className="text-slate-400">Authorization</span>
                <span className="text-brand-indigo font-semibold truncate max-w-xs sm:max-w-md">
                  {selectedEndpoint.authRequired === 'bearer' ? `Bearer ${jwtToken.slice(0, 24)}...` : 'None (Public)'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-gateway-950 border border-gateway-border flex items-center justify-between">
                <span className="text-slate-400">X-Gateway-Client</span>
                <span className="text-slate-300">CoreAPI-Console/3.4</span>
              </div>
            </div>
          )}

          {/* TAB 3: CODE SNIPPETS */}
          {activeRequestTab === 'snippets' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {(['curl', 'python', 'js'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveSnippetTab(tab)}
                      className={`px-2.5 py-1 rounded text-[11px] font-mono uppercase transition-colors ${
                        activeSnippetTab === tab
                          ? 'bg-gateway-800 text-white border border-gateway-border'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => {
                    const snippet = 
                      activeSnippetTab === 'curl' ? generateCurlSnippet(selectedEndpoint, jwtToken) :
                      activeSnippetTab === 'python' ? generatePythonSnippet(selectedEndpoint, jwtToken) :
                      generateJavaScriptSnippet(selectedEndpoint, jwtToken);
                    handleCopyCode(snippet, 'snippet');
                  }}
                  className="flex items-center gap-1 text-[11px] font-mono text-brand-cyan hover:underline"
                >
                  {copiedSnippet ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedSnippet ? 'Copiado' : 'Copiar'}</span>
                </button>
              </div>

              <pre className="p-3.5 rounded-xl bg-gateway-950 border border-gateway-border text-xs font-mono text-slate-300 overflow-x-auto max-h-48">
                <code>
                  {activeSnippetTab === 'curl' && generateCurlSnippet(selectedEndpoint, jwtToken)}
                  {activeSnippetTab === 'python' && generatePythonSnippet(selectedEndpoint, jwtToken)}
                  {activeSnippetTab === 'js' && generateJavaScriptSnippet(selectedEndpoint, jwtToken)}
                </code>
              </pre>
            </div>
          )}

        </div>

        {/* Response Viewport */}
        {executionResult && (
          <div className="p-4 sm:p-5 rounded-2xl bg-gateway-900 border border-gateway-border space-y-3 animate-fadeIn">
            
            <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-gateway-border">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold ${
                  executionResult.statusCode >= 200 && executionResult.statusCode < 300
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : executionResult.statusCode === 429
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                }`}>
                  {executionResult.statusCode} {executionResult.statusText}
                </span>

                <span className="flex items-center gap-1 text-xs font-mono text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-brand-cyan" />
                  {executionResult.latencyMs} ms
                </span>

                <span className="flex items-center gap-1 text-xs font-mono text-slate-400">
                  <Gauge className="w-3.5 h-3.5 text-brand-indigo" />
                  Quota: {executionResult.responseHeaders['X-RateLimit-Remaining'] || 'N/A'} left
                </span>
              </div>

              <button
                onClick={() => handleCopyCode(JSON.stringify(executionResult.responseBody, null, 2), 'response')}
                className="flex items-center gap-1 text-[11px] font-mono text-slate-400 hover:text-white"
              >
                {copiedResponse ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedResponse ? 'Copiado' : 'Copiar Respuesta'}</span>
              </button>
            </div>

            {/* Response Body JSON */}
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-500 block">
                Response Payload:
              </span>
              <pre className="p-3.5 rounded-xl bg-gateway-950 border border-gateway-border text-xs font-mono text-emerald-300 overflow-x-auto max-h-72">
                <code>{JSON.stringify(executionResult.responseBody, null, 2)}</code>
              </pre>
            </div>

          </div>
        )}

      </div>

    </div>
  );
};
