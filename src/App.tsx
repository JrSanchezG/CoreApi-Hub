import { useState, useMemo, useEffect } from 'react';
import type { 
  ApiEndpoint, 
  ApiExecutionResult, 
  JwtTokenData, 
  RateLimitTier 
} from './types';
import type { ActiveTab } from './components/Navbar';
import { Navbar } from './components/Navbar';
import { ApiPlayground } from './components/ApiPlayground';
import { JwtAuthLab } from './components/JwtAuthLab';
import { RateLimiterVisualizer } from './components/RateLimiterVisualizer';
import { DatabaseExplorer } from './components/DatabaseExplorer';
import { ServiceMeshTopology } from './components/ServiceMeshTopology';
import { TelemetryDashboard } from './components/TelemetryDashboard';
import { generateJwtToken } from './utils/jwtEngine';
import { TokenBucketRateLimiter } from './utils/rateLimiterEngine';
import { 
  ExternalLink, 
  CheckCircle2, 
  Layers 
} from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('playground');
  
  // Rate limiter instance and tier state
  const [currentTier, setCurrentTier] = useState<RateLimitTier>('developer');
  const limiter = useMemo(() => new TokenBucketRateLimiter(currentTier), [currentTier]);
  const [remainingTokens, setRemainingTokens] = useState<number>(limiter.getStatus().tokensRemaining);

  // Synchronize remaining tokens counter periodically
  useEffect(() => {
    const timer = setInterval(() => {
      setRemainingTokens(limiter.getStatus().tokensRemaining);
    }, 200);
    return () => clearInterval(timer);
  }, [limiter]);

  // Initial Admin JWT session
  const [currentJwt, setCurrentJwt] = useState<JwtTokenData>(() => 
    generateJwtToken('admin@coreapi.dev', 'admin', [
      'admin:all',
      'read:users',
      'write:payments',
      'manage:inventory'
    ], 3600)
  );

  const handleTierChange = (newTier: RateLimitTier) => {
    setCurrentTier(newTier);
    limiter.setTier(newTier);
    setRemainingTokens(limiter.getStatus().tokensRemaining);
  };

  const handleUpdateActiveToken = (newToken: JwtTokenData) => {
    setCurrentJwt(newToken);
  };

  // Execution engine for live API calls from Playground
  const handleExecuteRequest = (endpoint: ApiEndpoint, _body?: Record<string, unknown>): ApiExecutionResult => {
    const timestamp = new Date().toISOString();
    
    // 1. Rate Limiter check
    const rateCheck = limiter.consume(1);
    if (!rateCheck.allowed) {
      return {
        statusCode: 429,
        statusText: 'Too Many Requests',
        latencyMs: 3.1,
        responseHeaders: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': rateCheck.headers['X-RateLimit-Limit'] || '120',
          'X-RateLimit-Remaining': '0',
          'Retry-After': String(rateCheck.retryAfterSeconds),
          'X-Gateway-Node': 'ingress-worker-eu-01',
          'X-Throttler-Reason': 'Token bucket quota exhausted'
        },
        responseBody: {
          error: 'RateLimitExceeded',
          message: `Límite de solicitudes por minuto alcanzado para el nivel ${currentTier.toUpperCase()}. Espere ${rateCheck.retryAfterSeconds} segundos antes de reintentar.`,
          currentTier: currentTier,
          refillRate: 'Tokens se regeneran continuamente en el balde',
          documentation: 'https://docs.coreapi.dev/ratelimiting'
        },
        timestamp
      };
    }

    // 2. Auth inspection if endpoint requires bearer token
    if (endpoint.authRequired === 'bearer') {
      if (!currentJwt.isValid) {
        return {
          statusCode: 401,
          statusText: 'Unauthorized',
          latencyMs: 4.8,
          responseHeaders: {
            'Content-Type': 'application/json',
            'WWW-Authenticate': 'Bearer error="invalid_token", error_description="Signature verification failed"',
            'X-Gateway-Node': 'ingress-worker-eu-01'
          },
          responseBody: {
            error: 'InvalidToken',
            message: 'El token Bearer proporcionado posee una firma HMAC-SHA256 corrupta o inválida.',
            tip: 'Genera un token válido en la pestaña "JWT Auth Lab"'
          },
          timestamp
        };
      }

      // Check scope requirement
      if (endpoint.requiredScopes && endpoint.requiredScopes.length > 0) {
        const hasScope = endpoint.requiredScopes.some(reqScope => 
          currentJwt.payload.scopes.includes(reqScope) || currentJwt.payload.scopes.includes('admin:all')
        );

        if (!hasScope) {
          return {
            statusCode: 403,
            statusText: 'Forbidden',
            latencyMs: 6.2,
            responseHeaders: {
              'Content-Type': 'application/json',
              'X-Gateway-Node': 'ingress-worker-eu-01',
              'X-Required-Scopes': endpoint.requiredScopes.join(', ')
            },
            responseBody: {
              error: 'ForbiddenScope',
              message: `Tu token JWT actual no posee los scopes requeridos para esta operación. Se requiere uno de: [${endpoint.requiredScopes.join(', ')}].`,
              currentScopes: currentJwt.payload.scopes,
              userRole: currentJwt.payload.role
            },
            timestamp
          };
        }
      }
    }

    // 3. Successful execution simulation with real headers and payload
    const successSample = endpoint.responseSamples.find(s => s.statusCode >= 200 && s.statusCode < 300) || endpoint.responseSamples[0];
    const simulatedLatency = Number((Math.random() * 18 + 8).toFixed(1));

    return {
      statusCode: successSample.statusCode,
      statusText: successSample.statusCode === 201 ? 'Created' : 'OK',
      latencyMs: simulatedLatency,
      responseHeaders: {
        'Content-Type': 'application/json; charset=utf-8',
        'X-RateLimit-Limit': rateCheck.headers['X-RateLimit-Limit'] || '120',
        'X-RateLimit-Remaining': String(rateCheck.remaining),
        'X-RateLimit-Reset': rateCheck.headers['X-RateLimit-Reset'] || '60',
        'X-Gateway-Node': 'ingress-worker-eu-01',
        'X-Service-Routed': endpoint.serviceName,
        'X-Response-Time': `${simulatedLatency}ms`,
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
        'Cache-Control': endpoint.method === 'GET' ? 'public, max-age=60' : 'no-cache, no-store'
      },
      responseBody: successSample.body,
      timestamp
    };
  };

  return (
    <div className="min-h-screen bg-lead-950 text-slate-200 flex flex-col font-sans selection:bg-syntax-cyan/20 selection:text-syntax-cyan">
      {/* Top Main Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        activeRole={currentJwt.payload.role}
        rateLimitTier={currentTier}
        remainingTokens={remainingTokens}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'playground' && (
          <ApiPlayground
            jwtToken={currentJwt.rawToken}
            onExecuteRequest={handleExecuteRequest}
          />
        )}

        {activeTab === 'jwt' && (
          <JwtAuthLab
            currentJwt={currentJwt}
            onUpdateActiveToken={handleUpdateActiveToken}
          />
        )}

        {activeTab === 'ratelimit' && (
          <RateLimiterVisualizer
            limiter={limiter}
            currentTier={currentTier}
            onTierChange={handleTierChange}
          />
        )}

        {activeTab === 'database' && (
          <DatabaseExplorer />
        )}

        {activeTab === 'topology' && (
          <ServiceMeshTopology />
        )}

        {activeTab === 'telemetry' && (
          <TelemetryDashboard />
        )}
      </main>

      {/* Enterprise Gateway Footer */}
      <footer className="border-t border-lead-border bg-lead-950/95 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono text-lead-silver">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-lead-800 border border-lead-border rounded-lg text-syntax-cyan font-bold">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <span className="text-white font-bold tracking-wide">CoreAPI Hub</span>
              <span className="text-lead-muted mx-2">•</span>
              <span className="text-slate-400">Gateway & Integration Suite v2.4</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1.5 text-syntax-green">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>TLS 1.3 Strict • Percona InnoDB • TokenBucket Engine</span>
            </div>
            <a
              href="http://localhost:5173"
              className="text-lead-silver hover:text-syntax-cyan flex items-center gap-1 transition-colors"
            >
              <span>Volver al Portafolio</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="text-lead-muted text-center md:text-right">
            Desarrollado por <span className="text-slate-200 font-semibold">Junior Sánchez</span> • Full-Stack Engineer
          </div>
        </div>
      </footer>
    </div>
  );
}
export default App;
