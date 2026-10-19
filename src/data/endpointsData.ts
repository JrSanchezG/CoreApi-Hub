import type { ApiEndpoint } from '../types';

export const microserviceEndpoints: ApiEndpoint[] = [
  // --- AUTH SERVICE (Python / Django REST Framework & FastAPI) ---
  {
    id: 'auth-login',
    serviceId: 'svc-auth',
    serviceName: 'Auth & Identity Service (Python/Django)',
    path: '/api/v1/auth/login',
    method: 'POST',
    summary: 'Autenticar credenciales y emitir par de tokens JWT',
    description: 'Valida las credenciales del usuario contra la base de datos MySQL, verifica el hash Argon2/Bcrypt y genera un Access Token firmado (HS256) junto con un Refresh Token de larga duración.',
    authRequired: 'none',
    rateLimitTier: 'free',
    sampleRequestBody: {
      email: 'admin@coreapi.dev',
      password: 'SuperSecretPassword!2026',
      device_fingerprint: 'web-chrome-mac-99a4'
    },
    responseSamples: [
      {
        statusCode: 200,
        description: 'Autenticación exitosa - Tokens emitidos',
        body: {
          success: true,
          token_type: 'Bearer',
          expires_in: 3600,
          access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c3ItOTAxOSIsImVtYWlsIjoiYWRtaW5AY29yZWFwaS5kZXYiLCJyb2xlIjoiYWRtaW4iLCJzY29wZXMiOlsicmVhZDp1c2VycyIsIndyaXRlOnBheW1lbnRzIiwiYWRtaW46YWxsIl0sImlzcyI6ImNvcmVhcGktZ2F0ZXdheSIsImlhdCI6MTc2MDI1MjAwMCwiZXhwIjoxNzYwMjU1NjAwfQ.demo_signature_ok',
          refresh_token: 'rft_99182a0b4cd7812ef65e',
          user: {
            id: 'usr-9019',
            email: 'admin@coreapi.dev',
            name: 'Junior Sánchez',
            role: 'admin',
            two_factor_verified: true
          }
        }
      },
      {
        statusCode: 401,
        description: 'Credenciales inválidas',
        body: {
          error: 'UNAUTHORIZED',
          message: 'El correo electrónico o contraseña suministrada no coinciden con nuestros registros.',
          code: 40101
        }
      }
    ]
  },
  {
    id: 'auth-register',
    serviceId: 'svc-auth',
    serviceName: 'Auth & Identity Service (Python/Django)',
    path: '/api/v1/auth/register',
    method: 'POST',
    summary: 'Registrar nuevo consumidor o desarrollador de API',
    description: 'Crea una nueva entidad de usuario en la tabla MySQL `users` con asignación automática de rol y clave de API inicial.',
    authRequired: 'none',
    rateLimitTier: 'free',
    sampleRequestBody: {
      email: 'dev_partner@fintech.io',
      password: 'SecurePartnerPass2026#',
      full_name: 'Alex Rivera',
      company_name: 'FinTech Innovations Inc.',
      tier: 'developer'
    },
    responseSamples: [
      {
        statusCode: 201,
        description: 'Usuario creado exitosamente',
        body: {
          success: true,
          message: 'Cuenta registrada. Se ha generado una clave API de prueba.',
          user_id: 'usr-4412',
          api_key: 'sk_test_7a1b9c8d2e3f4051a6b7c8d9e0',
          tier: 'developer',
          rate_limit: '120 req/min'
        }
      }
    ]
  },
  {
    id: 'auth-verify',
    serviceId: 'svc-auth',
    serviceName: 'Auth & Identity Service (Python/Django)',
    path: '/api/v1/auth/verify',
    method: 'GET',
    summary: 'Verificar validez de token JWT activo y scopes',
    description: 'Inspecciona los claims en el header Authorization Bearer, verifica la firma criptográfica y retorna el contexto de permisos actual.',
    authRequired: 'bearer',
    requiredScopes: ['read:users'],
    rateLimitTier: 'free',
    responseSamples: [
      {
        statusCode: 200,
        description: 'Token válido',
        body: {
          valid: true,
          authenticated_as: 'admin@coreapi.dev',
          role: 'admin',
          scopes: ['read:users', 'write:payments', 'manage:inventory', 'admin:all'],
          token_age_seconds: 342,
          expires_in_seconds: 3258
        }
      },
      {
        statusCode: 401,
        description: 'Token expirado o inválido',
        body: {
          valid: false,
          error: 'TOKEN_EXPIRED',
          message: 'La firma del token ha expirado. Utilice /auth/refresh para renovar su sesión.'
        }
      }
    ]
  },

  // --- USERS SERVICE (Node.js / Express) ---
  {
    id: 'users-list',
    serviceId: 'svc-users',
    serviceName: 'Users & Permissions Service (Node.js)',
    path: '/api/v1/users',
    method: 'GET',
    summary: 'Listar usuarios con paginación y filtros de rol',
    description: 'Consulta la tabla `users` con JOIN a la tabla `roles` en MySQL. Soporta paginación por cursor y ordenamiento por timestamp.',
    authRequired: 'bearer',
    requiredScopes: ['read:users'],
    rateLimitTier: 'developer',
    parameters: [
      { name: 'limit', in: 'query', type: 'integer', required: false, description: 'Cantidad máxima de registros (1-100)', default: '10' },
      { name: 'role', in: 'query', type: 'string', required: false, description: 'Filtrar por rol (admin, developer, consumer)', default: 'developer' }
    ],
    responseSamples: [
      {
        statusCode: 200,
        description: 'Lista paginada de usuarios',
        body: {
          data: [
            { id: 'usr-1001', name: 'Junior Sánchez', email: 'admin@coreapi.dev', role: 'admin', status: 'active', requests_count: 45290 },
            { id: 'usr-1002', name: 'Camila Torres', email: 'camila.t@stripe-partner.com', role: 'developer', status: 'active', requests_count: 12040 },
            { id: 'usr-1003', name: 'Marcos Silva', email: 'm.silva@ecom-corp.ar', role: 'consumer', status: 'active', requests_count: 3400 }
          ],
          pagination: { total_count: 248, current_page: 1, total_pages: 25, has_next: true }
        }
      }
    ]
  },
  {
    id: 'users-get-by-id',
    serviceId: 'svc-users',
    serviceName: 'Users & Permissions Service (Node.js)',
    path: '/api/v1/users/{userId}',
    method: 'GET',
    summary: 'Obtener perfil detallado de usuario y cuotas de API',
    description: 'Devuelve información completa del usuario incluyendo su cuota de consumo, historial de rate limit y llaves de acceso asociadas.',
    authRequired: 'bearer',
    requiredScopes: ['read:users'],
    rateLimitTier: 'developer',
    parameters: [
      { name: 'userId', in: 'path', type: 'string', required: true, description: 'ID único del usuario', default: 'usr-1001' }
    ],
    responseSamples: [
      {
        statusCode: 200,
        description: 'Detalle de usuario encontrado',
        body: {
          id: 'usr-1001',
          name: 'Junior Sánchez',
          email: 'admin@coreapi.dev',
          role: 'admin',
          created_at: '2026-01-15T10:30:00Z',
          api_quota: { tier: 'enterprise', limit_per_minute: 1000, current_usage: 142 },
          linked_services: ['payment_gateway', 'auth_engine', 'inventory_sync']
        }
      }
    ]
  },
  {
    id: 'users-update-role',
    serviceId: 'svc-users',
    serviceName: 'Users & Permissions Service (Node.js)',
    path: '/api/v1/users/{userId}/role',
    method: 'PATCH',
    summary: 'Actualizar rol y permisos RBAC de usuario',
    description: 'Modifica el `role_id` del usuario en MySQL y revoca la caché de permisos en Redis para forzar la revalidación en el Gateway.',
    authRequired: 'bearer',
    requiredScopes: ['admin:all'],
    rateLimitTier: 'enterprise',
    parameters: [
      { name: 'userId', in: 'path', type: 'string', required: true, description: 'ID del usuario a modificar', default: 'usr-1002' }
    ],
    sampleRequestBody: {
      new_role: 'developer',
      reason: 'Ascenso a integración de producción',
      granted_by: 'usr-1001'
    },
    responseSamples: [
      {
        statusCode: 200,
        description: 'Rol actualizado exitosamente',
        body: {
          success: true,
          user_id: 'usr-1002',
          previous_role: 'consumer',
          current_role: 'developer',
          updated_at: '2026-10-12T00:15:20Z',
          active_permissions: ['read:users', 'write:payments', 'read:inventory']
        }
      }
    ]
  },

  // --- PAYMENTS SERVICE (Python / Django) ---
  {
    id: 'payments-charge',
    serviceId: 'svc-payments',
    serviceName: 'Payments & Billing Gateway (Python/Django)',
    path: '/api/v1/payments/charge',
    method: 'POST',
    summary: 'Procesar cobro con idempotencia y registro contable',
    description: 'Valida la tarjeta o billetera digital, aplica claves de idempotencia en Redis para evitar doble cobro e inserta la transacción en la tabla `transactions` de MySQL.',
    authRequired: 'bearer',
    requiredScopes: ['write:payments'],
    rateLimitTier: 'developer',
    sampleRequestBody: {
      amount: 4500.50,
      currency: 'USD',
      customer_id: 'cus_9941a8',
      payment_method: 'pm_card_visa_4242',
      idempotency_key: 'idem_tx_20261012_001',
      description: 'Suscripción API Gateway Enterprise Tier'
    },
    responseSamples: [
      {
        statusCode: 201,
        description: 'Cobro procesado exitosamente',
        body: {
          charge_id: 'ch_881902401',
          status: 'succeeded',
          amount_charged: 4500.50,
          currency: 'USD',
          fee: 130.51,
          net: 4369.99,
          gateway_ref: 'gw_stripe_prod_90192',
          created_at: '2026-10-12T00:18:45Z'
        }
      },
      {
        statusCode: 429,
        description: 'Rate limit excedido en pasarela',
        body: {
          error: 'RATE_LIMIT_EXCEEDED',
          message: 'Has superado el límite de 120 transacciones por minuto asignado a tu cuenta.',
          retry_after_seconds: 14
        }
      }
    ]
  },
  {
    id: 'payments-transactions',
    serviceId: 'svc-payments',
    serviceName: 'Payments & Billing Gateway (Python/Django)',
    path: '/api/v1/payments/transactions',
    method: 'GET',
    summary: 'Consultar transacciones financieras y estados de liquidación',
    description: 'Extrae el historial de pagos desde la base de datos MySQL con filtros por fecha, rango de monto y estado de liquidación.',
    authRequired: 'bearer',
    requiredScopes: ['read:users'],
    rateLimitTier: 'developer',
    parameters: [
      { name: 'status', in: 'query', type: 'string', required: false, description: 'Filtrar por estado (succeeded, pending, refunded)', default: 'succeeded' },
      { name: 'limit', in: 'query', type: 'integer', required: false, description: 'Límite de registros', default: '5' }
    ],
    responseSamples: [
      {
        statusCode: 200,
        description: 'Historial de transacciones recuperado',
        body: {
          transactions: [
            { id: 'tx-901', amount: 4500.50, currency: 'USD', status: 'succeeded', customer: 'cus_9941a8', timestamp: '2026-10-12T00:18:45Z' },
            { id: 'tx-900', amount: 1200.00, currency: 'USD', status: 'succeeded', customer: 'cus_2210b4', timestamp: '2026-10-11T22:45:10Z' },
            { id: 'tx-899', amount: 850.25, currency: 'EUR', status: 'succeeded', customer: 'cus_5519c1', timestamp: '2026-10-11T19:12:00Z' }
          ],
          total_volume_usd: 6550.75
        }
      }
    ]
  },

  // --- INVENTORY SERVICE (Node.js) ---
  {
    id: 'products-list',
    serviceId: 'svc-inventory',
    serviceName: 'Products & Inventory Service (Node.js)',
    path: '/api/v1/products',
    method: 'GET',
    summary: 'Consultar catálogo de productos y existencias de almacén',
    description: 'Accede a la tabla relacional `products` con almacenamiento en caché local Redis para lecturas ultrarrápidas (< 5ms).',
    authRequired: 'none',
    rateLimitTier: 'free',
    parameters: [
      { name: 'category', in: 'query', type: 'string', required: false, description: 'Categoría de producto', default: 'electronics' },
      { name: 'in_stock', in: 'query', type: 'boolean', required: false, description: 'Solo artículos con stock disponible', default: 'true' }
    ],
    responseSamples: [
      {
        statusCode: 200,
        description: 'Catálogo de productos',
        body: {
          items: [
            { id: 'prd-01', sku: 'SRV-RACK-2U', name: 'Servidor Rack 2U Enterprise', price: 2899.00, stock: 45, category: 'servers' },
            { id: 'prd-02', sku: 'SW-10GB-POE', name: 'Switch de Red 10GbE 24 Puertos', price: 849.50, stock: 120, category: 'networking' },
            { id: 'prd-03', sku: 'SSD-NVME-4TB', name: 'Módulo NVMe Enterprise 4TB', price: 420.00, stock: 350, category: 'storage' }
          ]
        }
      }
    ]
  },
  {
    id: 'products-update-stock',
    serviceId: 'svc-inventory',
    serviceName: 'Products & Inventory Service (Node.js)',
    path: '/api/v1/products/{productId}/stock',
    method: 'PATCH',
    summary: 'Ajustar stock de inventario con bloqueo transaccional MySQL',
    description: 'Aplica `SELECT ... FOR UPDATE` a nivel de fila en la tabla `products` para garantizar consistencia ACID ante compras concurrentes.',
    authRequired: 'bearer',
    requiredScopes: ['manage:inventory'],
    rateLimitTier: 'developer',
    parameters: [
      { name: 'productId', in: 'path', type: 'string', required: true, description: 'Identificador del producto', default: 'prd-01' }
    ],
    sampleRequestBody: {
      adjustment: -2,
      operation: 'order_fulfillment',
      warehouse_id: 'wh_ar_bue_01'
    },
    responseSamples: [
      {
        statusCode: 200,
        description: 'Stock actualizado',
        body: {
          product_id: 'prd-01',
          previous_stock: 45,
          new_stock: 43,
          reserved_units: 2,
          warehouse: 'wh_ar_bue_01',
          synced_at: '2026-10-12T00:22:10Z'
        }
      }
    ]
  },

  // --- ORDERS SERVICE (Node.js) ---
  {
    id: 'orders-create',
    serviceId: 'svc-orders',
    serviceName: 'Orders & Fulfillment Service (Node.js)',
    path: '/api/v1/orders',
    method: 'POST',
    summary: 'Crear nueva orden y despachar evento a cola RabbitMQ',
    description: 'Valida la orden, calcula impuestos y emite un mensaje JSON a la cola distribuida `orders.events` para su procesamiento asíncrono.',
    authRequired: 'bearer',
    requiredScopes: ['write:payments'],
    rateLimitTier: 'developer',
    sampleRequestBody: {
      customer_id: 'usr-1002',
      items: [
        { product_id: 'prd-01', quantity: 1, unit_price: 2899.00 }
      ],
      shipping_address: {
        street: 'Av. Corrientes 1234',
        city: 'Buenos Aires',
        country: 'Argentina'
      }
    },
    responseSamples: [
      {
        statusCode: 201,
        description: 'Orden creada y despachada a workers',
        body: {
          order_id: 'ord-88914',
          status: 'pending_fulfillment',
          total_amount: 2899.00,
          tracking_number: 'TRK-AR-2026-8812',
          estimated_dispatch: '2026-10-13T12:00:00Z'
        }
      }
    ]
  },

  // --- GATEWAY TELEMETRY & DIAGNOSTICS ---
  {
    id: 'gateway-health',
    serviceId: 'svc-gateway',
    serviceName: 'CoreAPI Gateway Controller',
    path: '/api/v1/gateway/health',
    method: 'GET',
    summary: 'Chequeo de salud del API Gateway y microservicios upstream',
    description: 'Verifica la conectividad de los pools de conexión a MySQL, Redis Sentinel y los 5 microservicios downstream.',
    authRequired: 'none',
    rateLimitTier: 'free',
    responseSamples: [
      {
        statusCode: 200,
        description: 'Todos los servicios operando normalmente',
        body: {
          status: 'HEALTHY',
          gateway_version: '3.4.1',
          uptime: '99.98%',
          active_nodes: 4,
          upstream_services: {
            auth_service: { status: 'UP', latency_ms: 12.1 },
            users_service: { status: 'UP', latency_ms: 14.8 },
            payments_service: { status: 'UP', latency_ms: 18.2 },
            inventory_service: { status: 'UP', latency_ms: 8.5 },
            mysql_cluster: { status: 'UP', open_connections: 48, replica_lag_ms: 0.4 }
          }
        }
      }
    ]
  },
  {
    id: 'gateway-metrics',
    serviceId: 'svc-gateway',
    serviceName: 'CoreAPI Gateway Controller',
    path: '/api/v1/gateway/metrics',
    method: 'GET',
    summary: 'Telemetría de rendimiento, tasa de peticiones y latencia P99',
    description: 'Provee contadores de Prometheus compatibles con visualización en Grafana para monitoreo continuo de DevOps.',
    authRequired: 'bearer',
    requiredScopes: ['admin:all'],
    rateLimitTier: 'enterprise',
    responseSamples: [
      {
        statusCode: 200,
        description: 'Métricas de rendimiento del clúster',
        body: {
          total_requests_24h: 1482900,
          requests_per_second: 184.2,
          latency: { p50_ms: 11.2, p90_ms: 22.4, p99_ms: 45.1 },
          error_rates: { '4xx': 0.08, '5xx': 0.01 },
          rate_limit_dropped_count: 312,
          active_jwt_sessions: 2410
        }
      }
    ]
  }
];
