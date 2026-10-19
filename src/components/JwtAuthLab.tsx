import React, { useState } from 'react';
import type { JwtTokenData, UserRole } from '../types';
import { generateJwtToken, parseJwtToken } from '../utils/jwtEngine';
import { 
  Key, 
  Check, 
  Copy, 
  ShieldCheck, 
  AlertTriangle, 
  Lock,
  RefreshCw
} from 'lucide-react';

interface JwtAuthLabProps {
  currentJwt: JwtTokenData;
  onUpdateActiveToken: (newToken: JwtTokenData) => void;
}

export const JwtAuthLab: React.FC<JwtAuthLabProps> = ({
  currentJwt,
  onUpdateActiveToken,
}) => {
  const [tokenInput, setTokenInput] = useState(currentJwt.rawToken);
  const [parsedToken, setParsedToken] = useState<JwtTokenData | null>(currentJwt);

  // Generator form state
  const [genEmail, setGenEmail] = useState('admin@coreapi.dev');
  const [genRole, setGenRole] = useState<UserRole>('admin');
  const [genExpires, setGenExpires] = useState<number>(3600);
  const [genScopes, setGenScopes] = useState<string[]>([
    'read:users',
    'write:payments',
    'manage:inventory',
    'admin:all'
  ]);
  const [copied, setCopied] = useState(false);

  const availableScopes = [
    { id: 'read:users', label: 'read:users (Consultar usuarios y perfiles)' },
    { id: 'write:payments', label: 'write:payments (Procesar cobros y reembolsos)' },
    { id: 'manage:inventory', label: 'manage:inventory (Ajustar stock de productos)' },
    { id: 'admin:all', label: 'admin:all (Control total del Gateway y métricas)' },
  ];

  const handleToggleScope = (scopeId: string) => {
    setGenScopes(prev => 
      prev.includes(scopeId) ? prev.filter(s => s !== scopeId) : [...prev, scopeId]
    );
  };

  const handleGenerateNewToken = (e: React.FormEvent) => {
    e.preventDefault();
    const tokenData = generateJwtToken(genEmail, genRole, genScopes, genExpires);
    setTokenInput(tokenData.rawToken);
    setParsedToken(tokenData);
    onUpdateActiveToken(tokenData);
  };

  const handleTokenInputChange = (val: string) => {
    setTokenInput(val);
    const parsed = parseJwtToken(val);
    setParsedToken(parsed);
    if (parsed && parsed.isValid) {
      onUpdateActiveToken(parsed);
    }
  };

  const handleCopyRawToken = () => {
    navigator.clipboard.writeText(tokenInput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tokenParts = tokenInput.split('.');
  const hasThreeParts = tokenParts.length === 3;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* LEFT COLUMN: Token Generator & Quick Profiles (5 cols) */}
      <div className="lg:col-span-5 flex flex-col gap-4">
        
        {/* Token Generator Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gateway-900 border border-gateway-border space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-gateway-border">
            <div className="p-2 rounded-xl bg-brand-indigo/15 text-brand-indigo border border-brand-indigo/30">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-mono text-sm font-bold text-white">
                Generador de Tokens JWT
              </h3>
              <p className="text-[11px] text-slate-400">
                Firma criptográfica HMAC-SHA256 para APIs seguras
              </p>
            </div>
          </div>

          <form onSubmit={handleGenerateNewToken} className="space-y-3.5">
            <div>
              <label className="text-xs font-mono text-slate-300 block mb-1">
                Subject / Email del Usuario:
              </label>
              <input
                type="email"
                value={genEmail}
                onChange={e => setGenEmail(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-gateway-950 border border-gateway-border text-xs font-mono text-white focus:outline-none focus:border-brand-indigo"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-mono text-slate-300 block mb-1">
                  Rol RBAC:
                </label>
                <select
                  value={genRole}
                  onChange={e => setGenRole(e.target.value as UserRole)}
                  className="w-full px-3 py-1.5 rounded-xl bg-gateway-950 border border-gateway-border text-xs font-mono text-white focus:outline-none focus:border-brand-indigo capitalize"
                >
                  <option value="admin">Admin</option>
                  <option value="developer">Developer</option>
                  <option value="consumer">Consumer</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-mono text-slate-300 block mb-1">
                  Expiración (TTL):
                </label>
                <select
                  value={genExpires}
                  onChange={e => setGenExpires(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-xl bg-gateway-950 border border-gateway-border text-xs font-mono text-white focus:outline-none focus:border-brand-indigo"
                >
                  <option value={900}>15 Minutos</option>
                  <option value={3600}>1 Hora</option>
                  <option value={86400}>24 Horas</option>
                  <option value={2592000}>30 Días</option>
                </select>
              </div>
            </div>

            {/* Permission Scopes */}
            <div>
              <label className="text-xs font-mono text-slate-300 block mb-1.5">
                Permisos & Scopes Asignados:
              </label>
              <div className="space-y-1.5">
                {availableScopes.map(sc => (
                  <label 
                    key={sc.id}
                    className="flex items-center gap-2 p-2 rounded-lg bg-gateway-950 border border-gateway-border cursor-pointer hover:border-slate-700 text-[11px] font-mono text-slate-300"
                  >
                    <input
                      type="checkbox"
                      checked={genScopes.includes(sc.id)}
                      onChange={() => handleToggleScope(sc.id)}
                      className="rounded border-slate-700 text-brand-indigo focus:ring-0"
                    />
                    <span>{sc.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-lead-800 hover:bg-lead-750 text-syntax-purple border border-syntax-purple/50 font-mono font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Emitir Token y Aplicar al Gateway</span>
            </button>
          </form>
        </div>

        {/* Quick Role Preset Buttons */}
        <div className="p-3.5 rounded-xl bg-lead-900 border border-lead-border">
          <span className="text-[10px] font-mono uppercase text-lead-muted block mb-2">
            Perfiles Rápidos para Pruebas:
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => {
                setGenEmail('admin@coreapi.dev');
                setGenRole('admin');
                setGenScopes(['admin:all', 'read:users', 'write:payments', 'manage:inventory']);
                const tk = generateJwtToken('admin@coreapi.dev', 'admin', ['admin:all', 'read:users', 'write:payments', 'manage:inventory']);
                setTokenInput(tk.rawToken);
                setParsedToken(tk);
                onUpdateActiveToken(tk);
              }}
              className="p-2 rounded-lg bg-lead-950 hover:bg-lead-800 border border-lead-border hover:border-syntax-purple/50 text-[11px] font-mono text-center text-syntax-purple transition-colors"
            >
              👑 Admin
            </button>
            <button
              type="button"
              onClick={() => {
                setGenEmail('developer@partner.io');
                setGenRole('developer');
                setGenScopes(['read:users', 'write:payments', 'manage:inventory']);
                const tk = generateJwtToken('developer@partner.io', 'developer', ['read:users', 'write:payments', 'manage:inventory']);
                setTokenInput(tk.rawToken);
                setParsedToken(tk);
                onUpdateActiveToken(tk);
              }}
              className="p-2 rounded-lg bg-lead-950 hover:bg-lead-800 border border-lead-border hover:border-syntax-cyan/50 text-[11px] font-mono text-center text-syntax-cyan transition-colors"
            >
              💻 Dev Partner
            </button>
            <button
              type="button"
              onClick={() => {
                setGenEmail('user@consumer.com');
                setGenRole('consumer');
                setGenScopes(['read:users']);
                const tk = generateJwtToken('user@consumer.com', 'consumer', ['read:users']);
                setTokenInput(tk.rawToken);
                setParsedToken(tk);
                onUpdateActiveToken(tk);
              }}
              className="p-2 rounded-lg bg-lead-950 hover:bg-lead-800 border border-lead-border hover:border-syntax-green/50 text-[11px] font-mono text-center text-syntax-green transition-colors"
            >
              🛒 Consumer
            </button>
          </div>
        </div>

      </div>

      {/* RIGHT COLUMN: Interactive JWT Visualizer & Decoder (7 cols) */}
      <div className="lg:col-span-7 flex flex-col gap-4">
        
        {/* Raw Encoded Token Input with Copy */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gateway-900 border border-gateway-border space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-300 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-brand-indigo" />
              Token JWT Codificado (Base64URL):
            </span>

            <div className="flex items-center gap-2">
              {parsedToken?.isValid ? (
                <span className="flex items-center gap-1 text-[11px] font-mono text-brand-emerald">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Firma Válida
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[11px] font-mono text-rose-400">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Token Inválido / Expirado
                </span>
              )}

              <button
                onClick={handleCopyRawToken}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-gateway-950 text-[11px] font-mono text-brand-cyan border border-gateway-border hover:text-white"
              >
                {copied ? <Check className="w-3 h-3 text-brand-emerald" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copiado' : 'Copiar'}</span>
              </button>
            </div>
          </div>

          {/* Color-coded 3 parts display */}
          <div className="p-3.5 rounded-xl bg-gateway-950 border border-gateway-border font-mono text-xs break-all leading-relaxed select-all">
            {hasThreeParts ? (
              <>
                <span className="text-rose-400 font-semibold">{tokenParts[0]}</span>
                <span className="text-slate-500 font-bold">.</span>
                <span className="text-brand-indigo font-semibold">{tokenParts[1]}</span>
                <span className="text-slate-500 font-bold">.</span>
                <span className="text-brand-cyan font-semibold">{tokenParts[2]}</span>
              </>
            ) : (
              <span className="text-slate-400">{tokenInput}</span>
            )}
          </div>

          <div className="mt-2">
            <textarea
              value={tokenInput}
              onChange={(e) => handleTokenInputChange(e.target.value)}
              rows={2}
              placeholder="Pega un token JWT aquí para inspección en vivo..."
              className="w-full bg-gateway-950 border border-gateway-border rounded-lg p-2 font-mono text-[11px] text-slate-300 focus:outline-none focus:border-brand-indigo resize-none"
            />
          </div>

          <p className="text-[11px] text-slate-500 font-mono">
            Puedes pegar cualquier token JWT arriba para decodificarlo automáticamente.
          </p>
        </div>

        {/* Decoded Inspector: Header, Payload, Signature */}
        {parsedToken && (
          <div className="grid grid-cols-1 gap-3.5">
            
            {/* 1. HEADER */}
            <div className="p-4 rounded-xl bg-gateway-900 border border-rose-500/30 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold text-rose-400 uppercase tracking-wider">
                  // HEADER: ALGORITMO & TIPO DE TOKEN
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-rose-500/15 text-rose-300">
                  {parsedToken.header.alg}
                </span>
              </div>
              <pre className="p-2.5 rounded-lg bg-gateway-950 border border-gateway-border text-xs font-mono text-rose-300 overflow-x-auto">
                <code>{JSON.stringify(parsedToken.header, null, 2)}</code>
              </pre>
            </div>

            {/* 2. PAYLOAD */}
            <div className="p-4 rounded-xl bg-gateway-900 border border-brand-indigo/40 space-y-1.5 shadow-glow-indigo">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold text-brand-indigo uppercase tracking-wider">
                  // PAYLOAD: DATOS & RECLAMOS (CLAIMS)
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-brand-indigo/15 text-brand-indigo font-bold capitalize">
                  Rol: {parsedToken.payload.role}
                </span>
              </div>
              <pre className="p-2.5 rounded-lg bg-gateway-950 border border-gateway-border text-xs font-mono text-purple-300 overflow-x-auto">
                <code>{JSON.stringify(parsedToken.payload, null, 2)}</code>
              </pre>
            </div>

            {/* 3. SIGNATURE */}
            <div className="p-4 rounded-xl bg-gateway-900 border border-brand-cyan/30 space-y-1.5">
              <span className="text-[11px] font-mono font-bold text-brand-cyan uppercase tracking-wider block">
                // VERIFY SIGNATURE (HMAC-SHA256)
              </span>
              <div className="p-2.5 rounded-lg bg-gateway-950 border border-gateway-border text-xs font-mono text-slate-300">
                HMACSHA256(
                  base64UrlEncode(header) + "." + base64UrlEncode(payload),
                  <span className="text-brand-cyan font-bold"> your-256-bit-secret-key</span>
                )
              </div>
            </div>

          </div>
        )}

      </div>

    </div>
  );
};
