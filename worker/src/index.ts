/**
 * Body Experience App - Cloudflare Worker
 * Main API entry point
 */

import { handleAuth } from './auth';
import { handleExercises } from './exercises';
import { handleExperiences } from './experiences';
import { handleSegments } from './segments';
import { handleUsers } from './users';
import { handleProgress } from './progress';

export interface Env {
  DB: D1Database;
  ENVIRONMENT: string;
  APP_URL: string;
  EMAIL_API_KEY?: string;
}

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Helper to create JSON response
export function jsonResponse(data: any, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
    },
  });
}

// Helper to create error response
export function errorResponse(message: string, status = 400): Response {
  return jsonResponse({ error: message }, status);
}

// Get authenticated user from session token
export async function getAuthUser(request: Request, env: Env): Promise<any | null> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);

  const result = await env.DB.prepare(`
    SELECT u.* FROM users u
    JOIN sessions s ON s.user_id = u.id
    WHERE s.token = ? AND s.expires_at > datetime('now')
  `).bind(token).first();

  return result;
}

// Require authentication middleware
export async function requireAuth(request: Request, env: Env): Promise<{ user: any } | Response> {
  const user = await getAuthUser(request, env);
  if (!user) {
    return errorResponse('Unauthorized', 401);
  }
  return { user };
}

// Require instructor role
export async function requireInstructor(request: Request, env: Env): Promise<{ user: any } | Response> {
  const result = await requireAuth(request, env);
  if (result instanceof Response) return result;

  if (result.user.role !== 'instructor' && result.user.role !== 'admin') {
    return errorResponse('Instructor access required', 403);
  }
  return result;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // Route requests to appropriate handlers
      if (path.startsWith('/api/auth')) {
        return handleAuth(request, env, path.replace('/api/auth', ''));
      }

      if (path.startsWith('/api/exercises')) {
        return handleExercises(request, env, path.replace('/api/exercises', ''));
      }

      if (path.startsWith('/api/experiences')) {
        return handleExperiences(request, env, path.replace('/api/experiences', ''));
      }

      if (path.startsWith('/api/segments')) {
        return handleSegments(request, env, path.replace('/api/segments', ''));
      }

      if (path.startsWith('/api/users')) {
        return handleUsers(request, env, path.replace('/api/users', ''));
      }

      if (path.startsWith('/api/progress')) {
        return handleProgress(request, env, path.replace('/api/progress', ''));
      }

      // Health check
      if (path === '/api/health') {
        return jsonResponse({ status: 'ok', timestamp: new Date().toISOString() });
      }

      return errorResponse('Not Found', 404);
    } catch (error) {
      console.error('Worker error:', error);
      return errorResponse('Internal Server Error', 500);
    }
  },
};
