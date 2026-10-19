export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type AuthType = 'none' | 'bearer' | 'apiKey';

export type UserRole = 'admin' | 'developer' | 'consumer';

export type RateLimitTier = 'free' | 'developer' | 'enterprise';

export interface ParameterDefinition {
  name: string;
  in: 'path' | 'query' | 'header';
  type: string;
  required: boolean;
  description: string;
  default?: string;
}

export interface ResponseSample {
  statusCode: number;
  description: string;
  body: Record<string, unknown> | Array<unknown>;
}

export interface ApiEndpoint {
  id: string;
  serviceId: string;
  serviceName: string;
  path: string;
  method: HttpMethod;
  summary: string;
  description: string;
  authRequired: AuthType;
  requiredScopes?: string[];
  rateLimitTier: RateLimitTier;
  parameters?: ParameterDefinition[];
  sampleRequestBody?: Record<string, unknown>;
  responseSamples: ResponseSample[];
}

export interface ApiExecutionResult {
  statusCode: number;
  statusText: string;
  latencyMs: number;
  responseHeaders: Record<string, string>;
  responseBody: unknown;
  timestamp: string;
}

export interface JwtTokenPayload {
  sub: string;
  email: string;
  role: UserRole;
  scopes: string[];
  iss: string;
  iat: number;
  exp: number;
}

export interface JwtTokenData {
  rawToken: string;
  header: { alg: string; typ: string };
  payload: JwtTokenPayload;
  signature: string;
  isValid: boolean;
}

export interface RateLimitStatus {
  tier: RateLimitTier;
  limitPerMinute: number;
  tokensRemaining: number;
  totalAllowed: number;
  totalThrottled: number;
  lastRefillTime: number;
}

export interface TableColumn {
  name: string;
  type: string;
  isPrimary: boolean;
  isForeignKey?: boolean;
  references?: string;
  nullable: boolean;
}

export interface DatabaseTable {
  name: string;
  description: string;
  rowCount: number;
  sizeKb: number;
  columns: TableColumn[];
  sampleRows: Record<string, unknown>[];
}

export interface MicroserviceNode {
  id: string;
  name: string;
  framework: string;
  port: number;
  status: 'healthy' | 'degraded' | 'down';
  uptimePercent: number;
  avgLatencyMs: number;
  cpuPercent: number;
  memoryMb: number;
  instanceCount: number;
}

export interface TrafficLogEntry {
  id: string;
  timestamp: string;
  method: HttpMethod;
  path: string;
  status: number;
  latencyMs: number;
  ip: string;
  authMethod: string;
  service: string;
}

export interface GatewayMetrics {
  totalRequests: number;
  successfulRequests: number;
  throttledRequests: number;
  serverErrors: number;
  avgLatencyMs: number;
  p95LatencyMs: number;
  p99LatencyMs: number;
  activeJwtSessions: number;
}
