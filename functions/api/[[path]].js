/**
 * API Catch-all - Cloudflare Pages Function
 * Pattern copied from WCX - calls dashboard.vegvisr.org DIRECTLY for token validation
 */

export async function onRequest(context) {
  const { request, env, params } = context;

  const corsHeaders = buildCorsHeaders(request);

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Build the path from catch-all params
  const pathSegments = params.path || [];
  const apiPath = '/' + pathSegments.join('/');

  try {
    // Check origin
    if (!isAllowedOrigin(request)) {
      return unauthorizedResponse(corsHeaders, 'Origin not allowed');
    }

    // Verify session - calls dashboard DIRECTLY
    const authResult = await verifySession(request);
    if (!authResult.ok) {
      return unauthorizedResponse(corsHeaders, 'Login required', authResult.status);
    }

    // Proxy to body-experience-worker for data operations
    const workerUrl = `https://body-experience-worker-production.torarnehave.workers.dev/api${apiPath}`;
    const response = await fetch(workerUrl, {
      method: request.method,
      headers: {
        'Content-Type': 'application/json',
        'x-user-email': authResult.email || '',
        'x-user-role': authResult.role || '',
      },
      body: request.method !== 'GET' && request.method !== 'HEAD'
        ? await request.text()
        : undefined,
    });

    const data = await response.text();
    return new Response(data, {
      status: response.status,
      headers: corsHeaders,
    });

  } catch (error) {
    console.error('API error:', error);
    return new Response(JSON.stringify({
      error: error.message || 'API service unavailable'
    }), {
      status: 500,
      headers: corsHeaders,
    });
  }
}

function buildCorsHeaders(request) {
  const origin = request.headers.get('Origin');
  const allowedOrigin = origin === 'https://bioenergetics.vegvisr.org' ? origin : '*';
  const headers = {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
  };

  if (allowedOrigin !== '*') {
    headers['Access-Control-Allow-Credentials'] = 'true';
  }

  return headers;
}

function unauthorizedResponse(corsHeaders, reason, status = 401) {
  return new Response(JSON.stringify({ error: reason || 'Unauthorized' }), {
    status,
    headers: corsHeaders
  });
}

function isAllowedOrigin(request) {
  const origin = request.headers.get('Origin');
  if (origin && origin !== 'https://bioenergetics.vegvisr.org') {
    return false;
  }

  const referer = request.headers.get('Referer');
  if (referer && !referer.startsWith('https://bioenergetics.vegvisr.org/')) {
    return false;
  }

  return true;
}

// CALLS DASHBOARD DIRECTLY - same as WCX pattern
async function verifySession(request) {
  try {
    const token = getAuthToken(request);
    if (!token) {
      return { ok: false, status: 401 };
    }

    const response = await fetch('https://dashboard.vegvisr.org/auth/validate-token', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json'
      }
    });

    if (!response.ok) {
      return { ok: false, status: response.status };
    }

    const data = await response.json().catch(() => null);
    const role = data?.role;
    // Allow User, Admin, Superadmin for bioenergetics
    if (data?.valid && (role === 'Superadmin' || role === 'Admin' || role === 'User')) {
      return { ok: true, status: 200, email: data?.email, role: role };
    }

    return { ok: false, status: 403 };
  } catch (error) {
    console.error('Auth check failed:', error);
    return { ok: false, status: 500 };
  }
}

function getAuthToken(request) {
  // Check X-API-Token header first
  const headerToken = request.headers.get('X-API-Token');
  if (headerToken) return headerToken;

  // Check Authorization header
  const authHeader = request.headers.get('Authorization') || '';
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }

  // Check vegvisr_token cookie
  const cookieHeader = request.headers.get('Cookie') || '';
  const cookies = Object.fromEntries(
    cookieHeader.split(';').map((entry) => {
      const [key, ...rest] = entry.trim().split('=');
      return [key, rest.join('=')];
    })
  );
  return cookies.vegvisr_token || null;
}
