import type { DatabaseTable } from '../types';

export const mysqlTables: DatabaseTable[] = [
  {
    name: 'users',
    description: 'Entidad principal de usuarios y cuentas de desarrollador registradas',
    rowCount: 248,
    sizeKb: 64,
    columns: [
      { name: 'id', type: 'VARCHAR(36)', isPrimary: true, nullable: false },
      { name: 'email', type: 'VARCHAR(255)', isPrimary: false, nullable: false },
      { name: 'password_hash', type: 'VARCHAR(255)', isPrimary: false, nullable: false },
      { name: 'role_id', type: 'VARCHAR(36)', isPrimary: false, isForeignKey: true, references: 'roles(id)', nullable: false },
      { name: 'status', type: 'ENUM("active", "suspended", "pending")', isPrimary: false, nullable: false },
      { name: 'created_at', type: 'DATETIME', isPrimary: false, nullable: false },
      { name: 'updated_at', type: 'DATETIME', isPrimary: false, nullable: false }
    ],
    sampleRows: [
      { id: 'usr-1001', email: 'admin@coreapi.dev', password_hash: '$argon2id$v=19$m=65536,t=3...', role_id: 'rol-admin', status: 'active', created_at: '2026-01-15 10:30:00' },
      { id: 'usr-1002', email: 'camila.t@stripe-partner.com', password_hash: '$argon2id$v=19$m=65536,t=3...', role_id: 'rol-developer', status: 'active', created_at: '2026-02-10 14:12:00' },
      { id: 'usr-1003', email: 'm.silva@ecom-corp.ar', password_hash: '$argon2id$v=19$m=65536,t=3...', role_id: 'rol-consumer', status: 'active', created_at: '2026-03-01 09:45:22' },
      { id: 'usr-1004', email: 'lucas.d@fintech-latam.io', password_hash: '$argon2id$v=19$m=65536,t=3...', role_id: 'rol-developer', status: 'active', created_at: '2026-04-18 16:20:05' }
    ]
  },
  {
    name: 'roles',
    description: 'Definición de roles RBAC y matriz de permisos JSON',
    rowCount: 3,
    sizeKb: 8,
    columns: [
      { name: 'id', type: 'VARCHAR(36)', isPrimary: true, nullable: false },
      { name: 'name', type: 'VARCHAR(50)', isPrimary: false, nullable: false },
      { name: 'permissions_json', type: 'JSON', isPrimary: false, nullable: false },
      { name: 'description', type: 'TEXT', isPrimary: false, nullable: true }
    ],
    sampleRows: [
      { id: 'rol-admin', name: 'admin', permissions_json: '["admin:all", "read:users", "write:payments", "manage:inventory"]', description: 'Control maestro de infraestructura y métricas' },
      { id: 'rol-developer', name: 'developer', permissions_json: '["read:users", "write:payments", "manage:inventory"]', description: 'Acceso a APIs de integración comercial y webhooks' },
      { id: 'rol-consumer', name: 'consumer', permissions_json: '["read:products", "create:orders"]', description: 'Consumo estándar de catálogo y compras' }
    ]
  },
  {
    name: 'api_keys',
    description: 'Llaves secretas de clientes con límite de peticiones por minuto',
    rowCount: 312,
    sizeKb: 48,
    columns: [
      { name: 'id', type: 'VARCHAR(36)', isPrimary: true, nullable: false },
      { name: 'user_id', type: 'VARCHAR(36)', isPrimary: false, isForeignKey: true, references: 'users(id)', nullable: false },
      { name: 'key_prefix', type: 'VARCHAR(16)', isPrimary: false, nullable: false },
      { name: 'key_hash', type: 'VARCHAR(64)', isPrimary: false, nullable: false },
      { name: 'tier', type: 'ENUM("free", "developer", "enterprise")', isPrimary: false, nullable: false },
      { name: 'rate_limit_rpm', type: 'INT', isPrimary: false, nullable: false },
      { name: 'is_active', type: 'TINYINT(1)', isPrimary: false, nullable: false },
      { name: 'last_used_at', type: 'DATETIME', isPrimary: false, nullable: true }
    ],
    sampleRows: [
      { id: 'key-901', user_id: 'usr-1001', key_prefix: 'sk_live_admin8', key_hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae...', tier: 'enterprise', rate_limit_rpm: 1000, is_active: 1, last_used_at: '2026-10-12 00:25:10' },
      { id: 'key-902', user_id: 'usr-1002', key_prefix: 'sk_live_dev441', key_hash: '2c26b46b68ffc68ff99b453c1d3041341342...', tier: 'developer', rate_limit_rpm: 120, is_active: 1, last_used_at: '2026-10-12 00:20:00' },
      { id: 'key-903', user_id: 'usr-1003', key_prefix: 'sk_test_free12', key_hash: 'fcde2b2edba56bf408601fb721fe9b5c338d...', tier: 'free', rate_limit_rpm: 30, is_active: 1, last_used_at: '2026-10-11 23:45:12' }
    ]
  },
  {
    name: 'transactions',
    description: 'Libro mayor de transacciones financieras procesadas por la pasarela',
    rowCount: 1845,
    sizeKb: 256,
    columns: [
      { name: 'id', type: 'VARCHAR(36)', isPrimary: true, nullable: false },
      { name: 'user_id', type: 'VARCHAR(36)', isPrimary: false, isForeignKey: true, references: 'users(id)', nullable: false },
      { name: 'amount', type: 'DECIMAL(12, 2)', isPrimary: false, nullable: false },
      { name: 'currency', type: 'VARCHAR(3)', isPrimary: false, nullable: false },
      { name: 'status', type: 'ENUM("succeeded", "pending", "failed", "refunded")', isPrimary: false, nullable: false },
      { name: 'gateway_ref', type: 'VARCHAR(64)', isPrimary: false, nullable: false },
      { name: 'created_at', type: 'DATETIME', isPrimary: false, nullable: false }
    ],
    sampleRows: [
      { id: 'tx-901', user_id: 'usr-1002', amount: 4500.50, currency: 'USD', status: 'succeeded', gateway_ref: 'gw_stripe_prod_90192', created_at: '2026-10-12 00:18:45' },
      { id: 'tx-900', user_id: 'usr-1003', amount: 1200.00, currency: 'USD', status: 'succeeded', gateway_ref: 'gw_stripe_prod_89410', created_at: '2026-10-11 22:45:10' },
      { id: 'tx-899', user_id: 'usr-1004', amount: 850.25, currency: 'EUR', status: 'succeeded', gateway_ref: 'gw_stripe_prod_88120', created_at: '2026-10-11 19:12:00' },
      { id: 'tx-898', user_id: 'usr-1003', amount: 240.00, currency: 'USD', status: 'refunded', gateway_ref: 'gw_stripe_prod_87410', created_at: '2026-10-11 15:30:20' }
    ]
  },
  {
    name: 'products',
    description: 'Catálogo de productos con SKU, precios y control transaccional de stock',
    rowCount: 54,
    sizeKb: 32,
    columns: [
      { name: 'id', type: 'VARCHAR(36)', isPrimary: true, nullable: false },
      { name: 'sku', type: 'VARCHAR(32)', isPrimary: false, nullable: false },
      { name: 'name', type: 'VARCHAR(150)', isPrimary: false, nullable: false },
      { name: 'price', type: 'DECIMAL(10, 2)', isPrimary: false, nullable: false },
      { name: 'stock', type: 'INT', isPrimary: false, nullable: false },
      { name: 'category', type: 'VARCHAR(50)', isPrimary: false, nullable: false }
    ],
    sampleRows: [
      { id: 'prd-01', sku: 'SRV-RACK-2U', name: 'Servidor Rack 2U Enterprise', price: 2899.00, stock: 43, category: 'servers' },
      { id: 'prd-02', sku: 'SW-10GB-POE', name: 'Switch de Red 10GbE 24 Puertos', price: 849.50, stock: 120, category: 'networking' },
      { id: 'prd-03', sku: 'SSD-NVME-4TB', name: 'Módulo NVMe Enterprise 4TB', price: 420.00, stock: 350, category: 'storage' }
    ]
  },
  {
    name: 'audit_logs',
    description: 'Registro de auditoría inmutable de solicitudes HTTP en el Gateway',
    rowCount: 24890,
    sizeKb: 2048,
    columns: [
      { name: 'id', type: 'BIGINT AUTO_INCREMENT', isPrimary: true, nullable: false },
      { name: 'endpoint', type: 'VARCHAR(150)', isPrimary: false, nullable: false },
      { name: 'method', type: 'VARCHAR(10)', isPrimary: false, nullable: false },
      { name: 'status_code', type: 'INT', isPrimary: false, nullable: false },
      { name: 'ip_address', type: 'VARCHAR(45)', isPrimary: false, nullable: false },
      { name: 'latency_ms', type: 'DECIMAL(6, 2)', isPrimary: false, nullable: false },
      { name: 'created_at', type: 'DATETIME', isPrimary: false, nullable: false }
    ],
    sampleRows: [
      { id: 99401, endpoint: '/api/v1/auth/login', method: 'POST', status_code: 200, ip_address: '190.220.14.88', latency_ms: 18.4, created_at: '2026-10-12 00:26:01' },
      { id: 99400, endpoint: '/api/v1/users', method: 'GET', status_code: 200, ip_address: '181.44.20.110', latency_ms: 12.1, created_at: '2026-10-12 00:25:50' },
      { id: 99399, endpoint: '/api/v1/payments/charge', method: 'POST', status_code: 201, ip_address: '201.240.18.9', latency_ms: 28.5, created_at: '2026-10-12 00:25:40' },
      { id: 99398, endpoint: '/api/v1/products/prd-01/stock', method: 'PATCH', status_code: 429, ip_address: '190.11.45.62', latency_ms: 4.2, created_at: '2026-10-12 00:25:12' }
    ]
  }
];

export const sampleSqlQueries = [
  {
    title: 'Auditoría: Últimas Peticiones Throttled (429 Too Many Requests)',
    sql: 'SELECT endpoint, method, ip_address, latency_ms, created_at\nFROM audit_logs\nWHERE status_code = 429\nORDER BY created_at DESC\nLIMIT 10;'
  },
  {
    title: 'Finanzas: Volumen Total de Pagos Aprobados por Moneda',
    sql: 'SELECT currency, COUNT(*) AS tx_count, SUM(amount) AS total_volume\nFROM transactions\nWHERE status = "succeeded"\nGROUP BY currency;'
  },
  {
    title: 'Seguridad: Usuarios Activos con Permisos de Administrador (JOIN)',
    sql: 'SELECT u.id, u.email, r.name AS role_name, r.permissions_json\nFROM users u\nINNER JOIN roles r ON u.role_id = r.id\nWHERE u.status = "active";'
  },
  {
    title: 'Inventario: Alerta de Artículos con Stock Crítico (< 50 unidades)',
    sql: 'SELECT sku, name, price, stock, category\nFROM products\nWHERE stock < 50\nORDER BY stock ASC;'
  }
];
