import React, { useState } from 'react';
import type { DatabaseTable } from '../types';
import { mysqlTables, sampleSqlQueries } from '../data/databaseData';
import { 
  Database, 
  Table, 
  Key, 
  Play, 
  Clock, 
  CheckCircle2, 
  Code2, 
  Layers, 
  Search, 
  Sparkles,
  Server,
  Hash
} from 'lucide-react';

export const DatabaseExplorer: React.FC = () => {
  const [selectedTableName, setSelectedTableName] = useState<string>('users');
  const [activeTab, setActiveTab] = useState<'schema' | 'data' | 'sql'>('sql');
  const [sqlQuery, setSqlQuery] = useState<string>(sampleSqlQueries[0].sql);
  const [filterText, setFilterText] = useState<string>('');
  
  // SQL execution state
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [queryExecutionTime, setQueryExecutionTime] = useState<number>(2.4);
  const [queryRowsResult, setQueryRowsResult] = useState<Array<Record<string, unknown>>>([
    { endpoint: '/api/v1/products/prd-01/stock', method: 'PATCH', ip_address: '190.11.45.62', latency_ms: '4.20ms', status: 429, created_at: '2026-10-12 00:25:12' },
    { endpoint: '/api/v1/payments/charge', method: 'POST', ip_address: '181.44.20.110', latency_ms: '3.80ms', status: 429, created_at: '2026-10-12 00:24:45' },
    { endpoint: '/api/v1/users', method: 'GET', ip_address: '201.240.18.9', latency_ms: '2.90ms', status: 429, created_at: '2026-10-12 00:23:18' }
  ]);
  const [executionMessage, setExecutionMessage] = useState<string>('3 filas devueltas en 2.4ms (Query cache hit)');

  const selectedTable = mysqlTables.find(t => t.name === selectedTableName) || mysqlTables[0];

  const handleSelectTemplate = (queryObj: { title: string; sql: string }) => {
    setSqlQuery(queryObj.sql);
    executeSql(queryObj.sql);
  };

  const executeSql = (queryToRun: string = sqlQuery) => {
    setIsExecuting(true);
    setTimeout(() => {
      const lower = queryToRun.toLowerCase();
      const simulatedLatency = Number((Math.random() * 3 + 1.2).toFixed(2));
      setQueryExecutionTime(simulatedLatency);

      if (lower.includes('transactions') || lower.includes('currency')) {
        setQueryRowsResult([
          { currency: 'USD', tx_count: 1420, total_volume: '$1,842,500.00', avg_ticket: '$1,297.53', status: 'OK' },
          { currency: 'EUR', tx_count: 385, total_volume: '€412,890.50', avg_ticket: '€1,072.44', status: 'OK' },
          { currency: 'ARS', tx_count: 40, total_volume: '$15,400,000.00', avg_ticket: '$385,000.00', status: 'OK' }
        ]);
        setExecutionMessage(`Agrupación completada por moneda. 3 grupos calculados con éxito (${simulatedLatency}ms).`);
      } else if (lower.includes('roles') || lower.includes('permissions')) {
        setQueryRowsResult([
          { id: 'usr-1001', email: 'admin@coreapi.dev', role_name: 'admin', permissions_count: 4, auth_provider: 'Local Argon2id' },
          { id: 'usr-1002', email: 'camila.t@stripe-partner.com', role_name: 'developer', permissions_count: 3, auth_provider: 'OAuth Google' },
          { id: 'usr-1004', email: 'lucas.d@fintech-latam.io', role_name: 'developer', permissions_count: 3, auth_provider: 'API Key sk_live' }
        ]);
        setExecutionMessage(`INNER JOIN users ⋈ roles ejecutado. 3 usuarios administradores/desarrolladores (${simulatedLatency}ms).`);
      } else if (lower.includes('products') || lower.includes('stock')) {
        setQueryRowsResult([
          { sku: 'SRV-RACK-2U', name: 'Servidor Rack 2U Enterprise', price: '$2,899.00', stock: 43, status: 'CRITICAL', category: 'servers' },
          { sku: 'SW-10GB-POE', name: 'Switch de Red 10GbE 24 Puertos', price: '$849.50', stock: 120, status: 'NORMAL', category: 'networking' }
        ]);
        setExecutionMessage(`Filtro WHERE stock < 50 aplicado. 1 producto bajo umbral crítico (${simulatedLatency}ms).`);
      } else {
        // Default from audit_logs
        setQueryRowsResult([
          { endpoint: '/api/v1/products/prd-01/stock', method: 'PATCH', ip_address: '190.11.45.62', latency_ms: '4.20ms', status: 429, created_at: '2026-10-12 00:25:12' },
          { endpoint: '/api/v1/payments/charge', method: 'POST', ip_address: '181.44.20.110', latency_ms: '3.80ms', status: 429, created_at: '2026-10-12 00:24:45' },
          { endpoint: '/api/v1/users', method: 'GET', ip_address: '201.240.18.9', latency_ms: '2.90ms', status: 429, created_at: '2026-10-12 00:23:18' }
        ]);
        setExecutionMessage(`Query SELECT ejecutada correctamente en MySQL InnoDB (${simulatedLatency}ms).`);
      }

      setIsExecuting(false);
    }, 400);
  };

  const filteredSampleRows = selectedTable.sampleRows.filter(row => {
    if (!filterText) return true;
    return Object.values(row).some(val => 
      String(val).toLowerCase().includes(filterText.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Banner / MySQL Health Status */}
      <div className="bg-lead-900 border border-lead-border rounded-2xl p-6 shadow-lead-card">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-lead-800 border border-lead-border rounded-xl text-syntax-cyan">
              <Database className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  MySQL 8.0 Percona Cluster Explorer
                </h2>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-lead-950 text-syntax-green border border-syntax-green/30">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Conectado (InnoDB)
                </span>
              </div>
              <p className="text-sm text-lead-silver mt-1">
                Estructura relacional normalizada (3NF) que alimenta el API Gateway con índices B-Tree, transacciones ACID y logs de auditoría.
              </p>
            </div>
          </div>

          {/* Quick Metrics Badges */}
          <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
            <div className="px-3 py-2 bg-lead-input border border-lead-border rounded-lg flex items-center gap-2">
              <Server className="w-4 h-4 text-syntax-cyan" />
              <div>
                <span className="text-lead-muted block text-[10px]">HOST / PUERTO</span>
                <span className="text-white font-semibold">127.0.0.1:3306</span>
              </div>
            </div>
            <div className="px-3 py-2 bg-lead-input border border-lead-border rounded-lg flex items-center gap-2">
              <Layers className="w-4 h-4 text-syntax-purple" />
              <div>
                <span className="text-lead-muted block text-[10px]">CONEXIONES POOL</span>
                <span className="text-white font-semibold">28 / 60 Activas</span>
              </div>
            </div>
            <div className="px-3 py-2 bg-lead-input border border-lead-border rounded-lg flex items-center gap-2">
              <Clock className="w-4 h-4 text-syntax-green" />
              <div>
                <span className="text-lead-muted block text-[10px]">LATENCIA DB MEDIA</span>
                <span className="text-syntax-green font-semibold">1.4ms</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Table Navigation & Right Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column: Tables List */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-lead-900 border border-lead-border rounded-2xl p-4 shadow-lead-card">
            <div className="flex items-center justify-between mb-3 px-2">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                <Table className="w-4 h-4 text-syntax-cyan" />
                Tablas del Esquema ({mysqlTables.length})
              </h3>
              <span className="text-xs text-lead-muted font-mono">mysql_db</span>
            </div>

            <div className="space-y-2">
              {mysqlTables.map((tbl: DatabaseTable) => {
                const isSelected = tbl.name === selectedTableName;
                return (
                  <button
                    key={tbl.name}
                    onClick={() => setSelectedTableName(tbl.name)}
                    className={`w-full text-left p-3 rounded-xl transition-all border flex items-center justify-between ${
                      isSelected
                        ? 'bg-lead-800 border-syntax-cyan/50 text-syntax-cyan shadow-sm'
                        : 'bg-lead-950/60 border-lead-border/80 text-lead-silver hover:bg-lead-850 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Hash className={`w-4 h-4 shrink-0 ${isSelected ? 'text-syntax-cyan' : 'text-lead-muted'}`} />
                      <div className="truncate">
                        <div className="font-mono text-sm font-semibold text-white tracking-wide">
                          {tbl.name}
                        </div>
                        <div className="text-xs text-lead-muted truncate max-w-[200px]">
                          {tbl.description}
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0 font-mono text-[11px] text-lead-muted pl-2">
                      <span className="px-2 py-0.5 rounded bg-lead-950 text-slate-300 border border-lead-border">
                        {tbl.rowCount} rows
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Quick Schema Metadata */}
            <div className="mt-4 p-3 bg-lead-input border border-lead-border rounded-xl text-xs space-y-1.5 text-lead-silver">
              <div className="flex justify-between">
                <span>Motor de Almacenamiento:</span>
                <span className="text-slate-200 font-mono">InnoDB (ACID)</span>
              </div>
              <div className="flex justify-between">
                <span>Collation / Charset:</span>
                <span className="text-slate-200 font-mono">utf8mb4_unicode_ci</span>
              </div>
              <div className="flex justify-between">
                <span>Tamaño Total Estimado:</span>
                <span className="text-slate-200 font-mono">2.41 MB</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Tab view (SQL Console / Schema View / Data Preview) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-lead-900 border border-lead-border rounded-2xl p-5 shadow-lead-card">
            {/* Tab navigation headers */}
            <div className="flex flex-wrap items-center justify-between border-b border-lead-border pb-4 gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('sql')}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                    activeTab === 'sql'
                      ? 'bg-lead-800 text-syntax-purple border border-syntax-purple/40 shadow-sm'
                      : 'bg-lead-950 text-lead-silver border border-lead-border hover:text-white hover:bg-lead-850'
                  }`}
                >
                  <Code2 className="w-4 h-4" />
                  SQL Console Interactivo
                </button>
                <button
                  onClick={() => setActiveTab('data')}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                    activeTab === 'data'
                      ? 'bg-lead-800 text-syntax-cyan border border-syntax-cyan/40 shadow-sm'
                      : 'bg-lead-950 text-lead-silver border border-lead-border hover:text-white hover:bg-lead-850'
                  }`}
                >
                  <Table className="w-4 h-4" />
                  Explorador de Datos ({selectedTable.name})
                </button>
                <button
                  onClick={() => setActiveTab('schema')}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                    activeTab === 'schema'
                      ? 'bg-lead-800 text-syntax-green border border-syntax-green/40 shadow-sm'
                      : 'bg-lead-950 text-lead-silver border border-lead-border hover:text-white hover:bg-lead-850'
                  }`}
                >
                  <Key className="w-4 h-4" />
                  Esquema & Claves ({selectedTable.columns.length} cols)
                </button>
              </div>
            </div>

            {/* TAB 1: SQL CONSOLE */}
            {activeTab === 'sql' && (
              <div className="mt-4 space-y-4">
                {/* Pre-built Templates */}
                <div>
                  <label className="text-xs font-semibold text-lead-silver uppercase tracking-wider block mb-2">
                    Consultas Pre-diseñadas (Templates SQL):
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {sampleSqlQueries.map((template, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSelectTemplate(template)}
                        className="text-left p-2.5 rounded-lg bg-lead-950/60 border border-lead-border hover:border-syntax-purple/40 hover:bg-lead-850 text-xs transition-all group"
                      >
                        <div className="font-semibold text-slate-300 group-hover:text-syntax-purple flex items-center gap-1.5 truncate">
                          <Sparkles className="w-3.5 h-3.5 text-syntax-purple shrink-0" />
                          <span className="truncate">{template.title}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* SQL Editor Area */}
                <div className="relative">
                  <div className="flex items-center justify-between px-3 py-1.5 bg-lead-950 border border-lead-border rounded-t-xl text-xs text-lead-muted font-mono">
                    <span className="flex items-center gap-1.5">
                      <Code2 className="w-3.5 h-3.5 text-syntax-purple" />
                      Editor SQL (MySQL 8.0)
                    </span>
                    <span>Dialecto: MySQL ANSI</span>
                  </div>
                  <textarea
                    value={sqlQuery}
                    onChange={(e) => setSqlQuery(e.target.value)}
                    rows={5}
                    className="w-full bg-lead-input text-syntax-cyan font-mono text-sm p-4 border-x border-b border-lead-border rounded-b-xl focus:outline-none focus:border-syntax-purple resize-none selection:bg-syntax-purple/20"
                    placeholder="Escribe una sentencia SQL (SELECT, JOIN, WHERE, GROUP BY)..."
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={() => executeSql(sqlQuery)}
                      disabled={isExecuting}
                      className="px-5 py-2 bg-lead-800 hover:bg-lead-750 text-syntax-purple border border-syntax-purple/50 font-mono font-bold text-xs rounded-xl shadow-sm flex items-center gap-2 transition-all disabled:opacity-50"
                    >
                      <Play className="w-3.5 h-3.5 fill-syntax-purple text-syntax-purple" />
                      {isExecuting ? 'Ejecutando...' : 'Ejecutar Consulta (F5)'}
                    </button>
                  </div>
                </div>

                {/* Execution Result Banner */}
                <div className="flex items-center justify-between p-3 bg-lead-input border border-lead-border rounded-xl text-xs">
                  <div className="flex items-center gap-2 text-syntax-green font-mono">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{executionMessage}</span>
                  </div>
                  <div className="text-lead-silver font-mono">
                    Tiempo de respuesta: <span className="text-white font-bold">{queryExecutionTime} ms</span>
                  </div>
                </div>

                {/* Results Table */}
                <div className="border border-lead-border rounded-xl overflow-hidden bg-lead-input">
                  <div className="overflow-x-auto max-h-72">
                    {queryRowsResult.length > 0 ? (
                      <table className="w-full text-left text-xs font-mono">
                        <thead className="bg-lead-900 text-slate-300 border-b border-lead-border sticky top-0">
                          <tr>
                            {Object.keys(queryRowsResult[0]).map((key) => (
                              <th key={key} className="p-3 font-semibold uppercase tracking-wider text-lead-silver">
                                {key}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-lead-border/60 text-slate-300">
                          {queryRowsResult.map((row, idx) => (
                            <tr key={idx} className="hover:bg-lead-850/40 transition-colors">
                              {Object.values(row).map((val, cellIdx) => (
                                <td key={cellIdx} className="p-3 whitespace-nowrap">
                                  {typeof val === 'number' && val === 429 ? (
                                    <span className="px-2 py-0.5 rounded text-[11px] bg-syntax-red/15 text-syntax-red border border-syntax-red/30">
                                      429 Throttled
                                    </span>
                                  ) : typeof val === 'number' && val === 200 ? (
                                    <span className="px-2 py-0.5 rounded text-[11px] bg-syntax-green/15 text-syntax-green border border-syntax-green/30">
                                      200 OK
                                    </span>
                                  ) : (
                                    String(val)
                                  )}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="p-8 text-center text-lead-muted">
                        No hay datos devueltos para esta consulta.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: DATA EXPLORER */}
            {activeTab === 'data' && (
              <div className="mt-4 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-white font-mono">
                      SELECT * FROM {selectedTable.name} LIMIT 20;
                    </h4>
                    <p className="text-xs text-lead-silver">
                      Mostrando muestra representativa de registros sincronizados en MySQL.
                    </p>
                  </div>
                  {/* Search / Filter input */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-lead-muted absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={filterText}
                      onChange={(e) => setFilterText(e.target.value)}
                      placeholder="Filtrar registros..."
                      className="bg-lead-input text-xs text-slate-200 pl-8 pr-3 py-1.5 border border-lead-border rounded-lg focus:outline-none focus:border-syntax-cyan font-mono w-48"
                    />
                  </div>
                </div>

                <div className="border border-lead-border rounded-xl overflow-hidden bg-lead-input">
                  <div className="overflow-x-auto max-h-96">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-lead-900 text-slate-300 border-b border-lead-border sticky top-0">
                        <tr>
                          {selectedTable.columns.map((col) => (
                            <th key={col.name} className="p-3 uppercase text-lead-silver font-medium">
                              <div className="flex items-center gap-1.5">
                                {col.isPrimary && <Key className="w-3 h-3 text-syntax-amber" />}
                                {col.isForeignKey && <Key className="w-3 h-3 text-syntax-cyan" />}
                                <span>{col.name}</span>
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-lead-border/60 text-slate-300">
                        {filteredSampleRows.map((row, idx) => (
                          <tr key={idx} className="hover:bg-lead-850/40 transition-colors">
                            {selectedTable.columns.map((col) => {
                              const cellValue = row[col.name];
                              return (
                                <td key={col.name} className="p-3 whitespace-nowrap text-xs">
                                  {cellValue === null || cellValue === undefined ? (
                                    <span className="text-lead-muted italic">NULL</span>
                                  ) : col.name === 'status' ? (
                                    <span className="px-2 py-0.5 rounded text-[11px] bg-syntax-green/15 text-syntax-green border border-syntax-green/20">
                                      {String(cellValue)}
                                    </span>
                                  ) : (
                                    <span className="text-slate-300">{String(cellValue)}</span>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: SCHEMA & KEYS */}
            {activeTab === 'schema' && (
              <div className="mt-4 space-y-4">
                <div>
                  <h4 className="text-sm font-bold text-white font-mono">
                    DESCRIBE {selectedTable.name};
                  </h4>
                  <p className="text-xs text-lead-silver">
                    Definición de campos, tipos SQL de almacenamiento, restricciones de unicidad e índices relacionales.
                  </p>
                </div>

                <div className="border border-lead-border rounded-xl overflow-hidden bg-lead-input">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-lead-900 text-slate-300 border-b border-lead-border">
                      <tr>
                        <th className="p-3 text-lead-silver">Columna</th>
                        <th className="p-3 text-lead-silver">Tipo de Dato</th>
                        <th className="p-3 text-lead-silver">Clave</th>
                        <th className="p-3 text-lead-silver">Permite Null</th>
                        <th className="p-3 text-lead-silver">Relación (FK)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-lead-border/60 text-slate-300">
                      {selectedTable.columns.map((col) => (
                        <tr key={col.name} className="hover:bg-lead-850/40 transition-colors">
                          <td className="p-3 font-semibold text-white flex items-center gap-2">
                            {col.name}
                          </td>
                          <td className="p-3 text-syntax-cyan font-mono">{col.type}</td>
                          <td className="p-3">
                            {col.isPrimary ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-syntax-amber/15 text-syntax-amber border border-syntax-amber/30 text-[10px]">
                                <Key className="w-3 h-3" /> PRIMARY KEY
                              </span>
                            ) : col.isForeignKey ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-syntax-cyan/15 text-syntax-cyan border border-syntax-cyan/30 text-[10px]">
                                <Key className="w-3 h-3" /> FOREIGN KEY
                              </span>
                            ) : (
                              <span className="text-lead-muted">-</span>
                            )}
                          </td>
                          <td className="p-3">
                            {col.nullable ? (
                              <span className="text-syntax-amber">YES</span>
                            ) : (
                              <span className="text-slate-400 font-bold">NO</span>
                            )}
                          </td>
                          <td className="p-3 text-slate-400">
                            {col.references ? (
                              <span className="text-syntax-purple font-medium">→ {col.references}</span>
                            ) : (
                              <span className="text-lead-muted">None</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
