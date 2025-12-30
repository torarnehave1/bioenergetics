/**
 * Authentication handlers - Magic Link Flow
 */

import { Env, jsonResponse, errorResponse } from './index';

// Generate UUID
function generateId(): string {
  return crypto.randomUUID();
}

// Generate secure token
function generateToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
}

export async function handleAuth(request: Request, env: Env, path: string): Promise<Response> {
  const method = request.method;

  // Check if email exists
  if (path === '/check-email' && method === 'POST') {
    const { email } = await request.json() as { email: string };

    if (!email || !email.includes('@')) {
      return errorResponse('Valid email required');
    }

    const user = await env.DB.prepare(
      'SELECT id, email, role FROM users WHERE email = ?'
    ).bind(email.toLowerCase()).first();

    return jsonResponse({
      exists: !!user,
      role: user?.role || null,
    });
  }

  // Request magic link
  if (path === '/magic-link' && method === 'POST') {
    const { email, name } = await request.json() as { email: string; name?: string };

    if (!email || !email.includes('@')) {
      return errorResponse('Valid email required');
    }

    const normalizedEmail = email.toLowerCase();

    // Check if user exists, create if not
    let user = await env.DB.prepare(
      'SELECT id FROM users WHERE email = ?'
    ).bind(normalizedEmail).first();

    if (!user) {
      const userId = generateId();
      await env.DB.prepare(
        'INSERT INTO users (id, email, name, role) VALUES (?, ?, ?, ?)'
      ).bind(userId, normalizedEmail, name || null, 'student').run();
      user = { id: userId };
    }

    // Generate magic link token
    const token = generateToken();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutes

    await env.DB.prepare(
      'INSERT INTO auth_tokens (id, email, token, expires_at) VALUES (?, ?, ?, ?)'
    ).bind(generateId(), normalizedEmail, token, expiresAt).run();

    // In production, send email. For now, return token in dev
    const magicLink = `${env.APP_URL}/auth/verify?token=${token}`;

    if (env.ENVIRONMENT === 'development') {
      return jsonResponse({
        success: true,
        message: 'Magic link generated',
        // Only expose in development
        devLink: magicLink,
        devToken: token,
      });
    }

    // Production: send email via email worker
    // TODO: Integrate with email worker
    return jsonResponse({
      success: true,
      message: 'Check your email for the magic link',
    });
  }

  // Verify magic link token
  if (path === '/verify' && method === 'POST') {
    const { token } = await request.json() as { token: string };

    if (!token) {
      return errorResponse('Token required');
    }

    // Find valid token
    const authToken = await env.DB.prepare(`
      SELECT * FROM auth_tokens
      WHERE token = ? AND used = 0 AND expires_at > datetime('now')
    `).bind(token).first() as any;

    if (!authToken) {
      return errorResponse('Invalid or expired token', 401);
    }

    // Mark token as used
    await env.DB.prepare(
      'UPDATE auth_tokens SET used = 1 WHERE id = ?'
    ).bind(authToken.id).run();

    // Get user
    const user = await env.DB.prepare(
      'SELECT * FROM users WHERE email = ?'
    ).bind(authToken.email).first();

    if (!user) {
      return errorResponse('User not found', 404);
    }

    // Create session
    const sessionToken = generateToken();
    const sessionExpires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days

    await env.DB.prepare(
      'INSERT INTO sessions (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)'
    ).bind(generateId(), (user as any).id, sessionToken, sessionExpires).run();

    return jsonResponse({
      success: true,
      token: sessionToken,
      user: {
        id: (user as any).id,
        email: (user as any).email,
        name: (user as any).name,
        role: (user as any).role,
      },
    });
  }

  // Get current user (with session token)
  if (path === '/me' && method === 'GET') {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse('Unauthorized', 401);
    }

    const token = authHeader.substring(7);

    const result = await env.DB.prepare(`
      SELECT u.id, u.email, u.name, u.role, u.created_at, u.consent_tracking
      FROM users u
      JOIN sessions s ON s.user_id = u.id
      WHERE s.token = ? AND s.expires_at > datetime('now')
    `).bind(token).first();

    if (!result) {
      return errorResponse('Unauthorized', 401);
    }

    return jsonResponse({ user: result });
  }

  // Get user role
  if (path === '/get-role' && method === 'POST') {
    const { email } = await request.json() as { email: string };

    if (!email) {
      return errorResponse('Email required');
    }

    const user = await env.DB.prepare(
      'SELECT role FROM users WHERE email = ?'
    ).bind(email.toLowerCase()).first();

    return jsonResponse({
      role: user ? (user as any).role : null,
    });
  }

  // Logout
  if (path === '/logout' && method === 'POST') {
    const authHeader = request.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      await env.DB.prepare('DELETE FROM sessions WHERE token = ?').bind(token).run();
    }

    return jsonResponse({ success: true });
  }

  return errorResponse('Not Found', 404);
}
