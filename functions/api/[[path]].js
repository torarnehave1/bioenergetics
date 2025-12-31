/**
 * API Catch-all - Cloudflare Pages Function
 * Proxies all /api/* requests to the body-experience-worker
 */

export async function onRequest(context) {
  const { request, env, params } = context;

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json',
  };

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Build the path from catch-all params
  const pathSegments = params.path || [];
  const apiPath = '/api/' + pathSegments.join('/');

  try {
    // Check if we have the worker binding
    if (env.BODY_EXPERIENCE_WORKER?.fetch) {
      // Use service binding to call worker
      const workerUrl = `https://body-experience-worker${apiPath}`;
      const response = await env.BODY_EXPERIENCE_WORKER.fetch(workerUrl, {
        method: request.method,
        headers: request.headers,
        body: request.method !== 'GET' && request.method !== 'HEAD'
          ? await request.text()
          : undefined,
      });

      // Clone response with CORS headers
      const data = await response.text();
      return new Response(data, {
        status: response.status,
        headers: {
          ...corsHeaders,
          'Content-Type': response.headers.get('Content-Type') || 'application/json',
        },
      });
    }

    // Fallback: Direct fetch to worker URL
    const workerUrl = `https://body-experience-worker-production.torarnehave.workers.dev${apiPath}`;
    const response = await fetch(workerUrl, {
      method: request.method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('Authorization') || '',
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
    console.error('API proxy error:', error);
    return new Response(JSON.stringify({
      error: 'API service unavailable',
      details: error.message
    }), {
      status: 500,
      headers: corsHeaders,
    });
  }
}
