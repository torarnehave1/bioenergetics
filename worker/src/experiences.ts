/**
 * Body experience logging handlers (UC1)
 */

import { Env, jsonResponse, errorResponse, requireAuth, getAuthUser } from './index';

function generateId(): string {
  return crypto.randomUUID();
}

export async function handleExperiences(request: Request, env: Env, path: string): Promise<Response> {
  const method = request.method;

  // Get all experiences for current user
  if ((path === '' || path === '/') && method === 'GET') {
    const auth = await requireAuth(request, env);
    if (auth instanceof Response) return auth;

    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const sessionId = url.searchParams.get('session_id');

    let query = `
      SELECT be.*, e.title as exercise_title
      FROM body_experiences be
      LEFT JOIN exercises e ON be.exercise_id = e.id
      WHERE be.user_id = ?
    `;
    const params: any[] = [auth.user.id];

    if (sessionId) {
      query += ' AND be.session_id = ?';
      params.push(sessionId);
    }

    query += ' ORDER BY be.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const experiences = await env.DB.prepare(query).bind(...params).all();

    // Get sensations for each experience
    for (const exp of experiences.results as any[]) {
      const sensations = await env.DB.prepare(`
        SELECT ss.*, bs.name as segment_name, bs.color as segment_color
        FROM segment_sensations ss
        JOIN body_segments bs ON ss.segment_id = bs.id
        WHERE ss.experience_id = ?
      `).bind(exp.id).all();
      exp.sensations = sensations.results;
    }

    return jsonResponse({ experiences: experiences.results });
  }

  // Create new body experience log
  if ((path === '' || path === '/') && method === 'POST') {
    const auth = await requireAuth(request, env);
    if (auth instanceof Response) return auth;

    const body = await request.json() as any;
    const {
      exercise_id,
      experience_type,
      session_id,
      notes,
      mood_rating,
      energy_rating,
      grounding_rating,
      sensations,
    } = body;

    const experienceId = generateId();
    const effectiveSessionId = session_id || generateId();

    // Create the experience
    await env.DB.prepare(`
      INSERT INTO body_experiences (
        id, user_id, exercise_id, experience_type, session_id,
        notes, mood_rating, energy_rating, grounding_rating
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      experienceId,
      auth.user.id,
      exercise_id || null,
      experience_type || 'general',
      effectiveSessionId,
      notes || null,
      mood_rating || null,
      energy_rating || null,
      grounding_rating || null
    ).run();

    // Add sensations if provided
    if (sensations && Array.isArray(sensations)) {
      for (const sensation of sensations) {
        await env.DB.prepare(`
          INSERT INTO segment_sensations (
            id, experience_id, segment_id, sensation_type, intensity, notes
          ) VALUES (?, ?, ?, ?, ?, ?)
        `).bind(
          generateId(),
          experienceId,
          sensation.segment_id,
          sensation.sensation_type || null,
          sensation.intensity || null,
          sensation.notes || null
        ).run();
      }
    }

    // Fetch the created experience with sensations
    const experience = await env.DB.prepare(
      'SELECT * FROM body_experiences WHERE id = ?'
    ).bind(experienceId).first();

    const experienceSensations = await env.DB.prepare(`
      SELECT ss.*, bs.name as segment_name, bs.color as segment_color
      FROM segment_sensations ss
      JOIN body_segments bs ON ss.segment_id = bs.id
      WHERE ss.experience_id = ?
    `).bind(experienceId).all();

    return jsonResponse({
      experience: {
        ...experience,
        sensations: experienceSensations.results,
      },
      session_id: effectiveSessionId,
    }, 201);
  }

  // Get single experience
  const expMatch = path.match(/^\/([a-zA-Z0-9-]+)$/);
  if (expMatch && method === 'GET') {
    const auth = await requireAuth(request, env);
    if (auth instanceof Response) return auth;

    const experienceId = expMatch[1];

    const experience = await env.DB.prepare(`
      SELECT be.*, e.title as exercise_title
      FROM body_experiences be
      LEFT JOIN exercises e ON be.exercise_id = e.id
      WHERE be.id = ? AND be.user_id = ?
    `).bind(experienceId, auth.user.id).first();

    if (!experience) {
      return errorResponse('Experience not found', 404);
    }

    const sensations = await env.DB.prepare(`
      SELECT ss.*, bs.name as segment_name, bs.color as segment_color
      FROM segment_sensations ss
      JOIN body_segments bs ON ss.segment_id = bs.id
      WHERE ss.experience_id = ?
    `).bind(experienceId).all();

    return jsonResponse({
      experience: {
        ...experience,
        sensations: sensations.results,
      },
    });
  }

  // Get experiences by session (before/after pair)
  if (path.startsWith('/session/') && method === 'GET') {
    const auth = await requireAuth(request, env);
    if (auth instanceof Response) return auth;

    const sessionId = path.replace('/session/', '');

    const experiences = await env.DB.prepare(`
      SELECT be.*, e.title as exercise_title
      FROM body_experiences be
      LEFT JOIN exercises e ON be.exercise_id = e.id
      WHERE be.session_id = ? AND be.user_id = ?
      ORDER BY be.created_at ASC
    `).bind(sessionId, auth.user.id).all();

    for (const exp of experiences.results as any[]) {
      const sensations = await env.DB.prepare(`
        SELECT ss.*, bs.name as segment_name, bs.color as segment_color
        FROM segment_sensations ss
        JOIN body_segments bs ON ss.segment_id = bs.id
        WHERE ss.experience_id = ?
      `).bind(exp.id).all();
      exp.sensations = sensations.results;
    }

    return jsonResponse({ experiences: experiences.results, session_id: sessionId });
  }

  // Delete experience
  if (expMatch && method === 'DELETE') {
    const auth = await requireAuth(request, env);
    if (auth instanceof Response) return auth;

    const experienceId = expMatch[1];

    const existing = await env.DB.prepare(
      'SELECT id FROM body_experiences WHERE id = ? AND user_id = ?'
    ).bind(experienceId, auth.user.id).first();

    if (!existing) {
      return errorResponse('Experience not found', 404);
    }

    // Delete sensations first
    await env.DB.prepare(
      'DELETE FROM segment_sensations WHERE experience_id = ?'
    ).bind(experienceId).run();

    // Delete experience
    await env.DB.prepare(
      'DELETE FROM body_experiences WHERE id = ?'
    ).bind(experienceId).run();

    return jsonResponse({ success: true });
  }

  // Safety check-in endpoint
  if (path === '/safety-checkin' && method === 'POST') {
    const auth = await requireAuth(request, env);
    if (auth instanceof Response) return auth;

    const body = await request.json() as any;
    const { experience_id, feeling_safe, needs_support, notes } = body;

    const checkinId = generateId();

    await env.DB.prepare(`
      INSERT INTO safety_checkins (
        id, user_id, experience_id, feeling_safe, needs_support, notes
      ) VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
      checkinId,
      auth.user.id,
      experience_id || null,
      feeling_safe ? 1 : 0,
      needs_support ? 1 : 0,
      notes || null
    ).run();

    return jsonResponse({ success: true, id: checkinId }, 201);
  }

  return errorResponse('Not Found', 404);
}
