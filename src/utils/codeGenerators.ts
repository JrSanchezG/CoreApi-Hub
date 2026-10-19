import type { ApiEndpoint } from '../types';

export function generateCurlSnippet(endpoint: ApiEndpoint, token?: string, requestBody?: Record<string, unknown>): string {
  const baseUrl = 'https://api.coreapi.io';
  let snippet = `curl -X ${endpoint.method} "${baseUrl}${endpoint.path}" \\\n`;
  snippet += `  -H "Accept: application/json" \\\n`;
  snippet += `  -H "Content-Type: application/json"`;

  if (endpoint.authRequired === 'bearer' && token) {
    snippet += ` \\\n  -H "Authorization: Bearer ${token}"`;
  } else if (endpoint.authRequired === 'apiKey') {
    snippet += ` \\\n  -H "X-API-Key: sk_live_demo99182"`;
  }

  if (requestBody && Object.keys(requestBody).length > 0 && ['POST', 'PUT', 'PATCH'].includes(endpoint.method)) {
    snippet += ` \\\n  -d '${JSON.stringify(requestBody, null, 2)}'`;
  }

  return snippet;
}

export function generatePythonSnippet(endpoint: ApiEndpoint, token?: string, requestBody?: Record<string, unknown>): string {
  const method = endpoint.method.toLowerCase();
  let code = `import requests\nimport json\n\n`;
  code += `url = "https://api.coreapi.io${endpoint.path}"\n`;
  code += `headers = {\n    "Accept": "application/json",\n    "Content-Type": "application/json",\n`;

  if (endpoint.authRequired === 'bearer') {
    code += `    "Authorization": "Bearer ${token || '<YOUR_JWT_TOKEN>'}",\n`;
  } else if (endpoint.authRequired === 'apiKey') {
    code += `    "X-API-Key": "sk_live_demo99182",\n`;
  }
  code += `}\n\n`;

  if (requestBody && Object.keys(requestBody).length > 0 && ['POST', 'PUT', 'PATCH'].includes(endpoint.method)) {
    code += `payload = ${JSON.stringify(requestBody, null, 4)}\n\n`;
    code += `response = requests.${method}(url, json=payload, headers=headers)\n`;
  } else {
    code += `response = requests.${method}(url, headers=headers)\n`;
  }

  code += `\nif response.status_code in [200, 201]:\n    print("Success:", response.json())\nelif response.status_code == 429:\n    print("Rate Limited. Retry in:", response.headers.get("Retry-After"))\nelse:\n    print("Error:", response.status_code, response.text)\n`;
  return code;
}

export function generateJavaScriptSnippet(endpoint: ApiEndpoint, token?: string, requestBody?: Record<string, unknown>): string {
  let code = `async function sendRequest() {\n`;
  code += `  const url = 'https://api.coreapi.io${endpoint.path}';\n`;
  code += `  const options = {\n`;
  code += `    method: '${endpoint.method}',\n`;
  code += `    headers: {\n`;
  code += `      'Accept': 'application/json',\n`;
  code += `      'Content-Type': 'application/json',\n`;

  if (endpoint.authRequired === 'bearer') {
    code += `      'Authorization': 'Bearer ${token || '<YOUR_JWT_TOKEN>'}',\n`;
  } else if (endpoint.authRequired === 'apiKey') {
    code += `      'X-API-Key': 'sk_live_demo99182',\n`;
  }
  code += `    },\n`;

  if (requestBody && Object.keys(requestBody).length > 0 && ['POST', 'PUT', 'PATCH'].includes(endpoint.method)) {
    code += `    body: JSON.stringify(${JSON.stringify(requestBody, null, 6)}),\n`;
  }

  code += `  };\n\n`;
  code += `  try {\n`;
  code += `    const res = await fetch(url, options);\n`;
  code += `    const data = await res.json();\n`;
  code += `    console.log('Response [' + res.status + ']:', data);\n`;
  code += `  } catch (err) {\n`;
  code += `    console.error('Request failed:', err);\n`;
  code += `  }\n`;
  code += `}\n\nsendRequest();`;
  return code;
}
