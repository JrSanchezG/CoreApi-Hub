import type { JwtTokenData, JwtTokenPayload, UserRole } from '../types';

function base64UrlEncode(str: string): string {
  return btoa(unescape(encodeURIComponent(str)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function base64UrlDecode(str: string): string {
  let output = str.replace(/-/g, '+').replace(/_/g, '/');
  switch (output.length % 4) {
    case 0: break;
    case 2: output += '=='; break;
    case 3: output += '='; break;
    default: break;
  }
  try {
    return decodeURIComponent(escape(atob(output)));
  } catch {
    return atob(output);
  }
}

export function generateJwtToken(
  email: string,
  role: UserRole,
  scopes: string[],
  expiresInSeconds: number = 3600
): JwtTokenData {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'HS256', typ: 'JWT' };
  
  const payload: JwtTokenPayload = {
    sub: `usr-${Math.floor(1000 + Math.random() * 9000)}`,
    email,
    role,
    scopes,
    iss: 'coreapi-gateway.io',
    iat: now,
    exp: now + expiresInSeconds,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const simulatedSignature = base64UrlEncode(`sig_hmac256_${email}_${now}_verified`);
  const rawToken = `${encodedHeader}.${encodedPayload}.${simulatedSignature}`;

  return {
    rawToken,
    header,
    payload,
    signature: simulatedSignature,
    isValid: true,
  };
}

export function parseJwtToken(token: string): JwtTokenData | null {
  try {
    const parts = token.trim().split('.');
    if (parts.length !== 3) return null;

    const header = JSON.parse(base64UrlDecode(parts[0]));
    const payload: JwtTokenPayload = JSON.parse(base64UrlDecode(parts[1]));
    const signature = parts[2];
    const now = Math.floor(Date.now() / 1000);
    const isValid = payload.exp > now && signature.length > 5;

    return {
      rawToken: token,
      header,
      payload,
      signature,
      isValid,
    };
  } catch {
    return null;
  }
}
