/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta base Negro Plomo / Grafito Carbón
        lead: {
          950: '#0b0d10', // Fondo negro plomo base de la app
          900: '#111419', // Superficie principal de tarjetas y paneles
          850: '#151920', // Sub-paneles y áreas de navegación
          800: '#1a1f28', // Elementos interactivos / activos
          750: '#222834', // Hover y resaltes
          700: '#2c3342', // Bordes más visibles
          border: '#1f2530', // Borde sutil plomizo
          input: '#090b0e', // Fondo ultra oscuro para inputs y editores de código
          muted: '#636c7e', // Texto secundario / gris plomo
          silver: '#9aa3b2', // Texto intermedio
        },
        // Mapeo retrocompatible para 'gateway' hacia la paleta plomiza
        gateway: {
          950: '#0b0d10',
          900: '#111419',
          850: '#151920',
          800: '#1a1f28',
          750: '#222834',
          700: '#2c3342',
          border: '#1f2530',
          card: '#111419',
          input: '#090b0e',
        },
        // Colores de acento inspirados en tokens de sintaxis de código (VS Code / One Dark)
        syntax: {
          purple: '#c678dd',  // Keywords, JWT, methods (PATCH, POST)
          cyan: '#61afef',    // Functions, variables, types, endpoints (GET)
          green: '#98c379',   // Strings, success (200 OK), health
          amber: '#e5c07b',   // Numbers, warnings, keys, rate limits (PUT)
          red: '#e06c75',     // Errors, throttled (429), deletions (DELETE)
          comment: '#5c6370', // Comentarios y metadatos
        },
        brand: {
          emerald: '#98c379',
          cyan: '#61afef',
          indigo: '#a78bfa',
          violet: '#c678dd',
          amber: '#e5c07b',
          rose: '#e06c75',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Fira Code', 'monospace'],
        display: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      boxShadow: {
        'glow-emerald': '0 0 20px -5px rgba(152, 195, 121, 0.25)',
        'glow-cyan': '0 0 20px -5px rgba(97, 175, 239, 0.25)',
        'glow-indigo': '0 0 20px -5px rgba(198, 120, 221, 0.25)',
        'glow-amber': '0 0 20px -5px rgba(229, 192, 123, 0.25)',
        'lead-card': '0 4px 20px -2px rgba(0, 0, 0, 0.7), inset 0 1px 0 0 rgba(255, 255, 255, 0.03)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-slow': 'ping 2.5s cubic-bezier(0, 0, 0.2, 1) infinite',
      }
    },
  },
  plugins: [],
}
