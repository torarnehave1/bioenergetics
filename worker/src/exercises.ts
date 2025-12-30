/**
 * Exercise library handlers
 */

import { Env, jsonResponse, errorResponse, requireAuth, requireInstructor, getAuthUser } from './index';

function generateId(): string {
  return crypto.randomUUID();
}

export async function handleExercises(request: Request, env: Env, path: string): Promise<Response> {
  const method = request.method;

  // Get all exercise categories
  if (path === '/categories' && method === 'GET') {
    const categories = await env.DB.prepare(
      'SELECT * FROM exercise_categories ORDER BY name'
    ).all();

    return jsonResponse({ categories: categories.results });
  }

  // Get all public exercises + user's own exercises
  if ((path === '' || path === '/') && method === 'GET') {
    const user = await getAuthUser(request, env);
    const url = new URL(request.url);
    const category = url.searchParams.get('category');
    const difficulty = url.searchParams.get('difficulty');

    let query = `
      SELECT e.*, c.name as category_name
      FROM exercises e
      LEFT JOIN exercise_categories c ON e.category_id = c.id
      WHERE e.is_public = 1
    `;
    const params: any[] = [];

    if (user) {
      query = `
        SELECT e.*, c.name as category_name
        FROM exercises e
        LEFT JOIN exercise_categories c ON e.category_id = c.id
        WHERE e.is_public = 1 OR e.created_by = ?
      `;
      params.push(user.id);
    }

    if (category) {
      query += ' AND e.category_id = ?';
      params.push(category);
    }

    if (difficulty) {
      query += ' AND e.difficulty = ?';
      params.push(difficulty);
    }

    query += ' ORDER BY e.created_at DESC';

    const stmt = env.DB.prepare(query);
    const exercises = await (params.length > 0 ? stmt.bind(...params) : stmt).all();

    return jsonResponse({ exercises: exercises.results });
  }

  // Get single exercise by ID
  const exerciseMatch = path.match(/^\/([a-zA-Z0-9-]+)$/);
  if (exerciseMatch && method === 'GET') {
    const exerciseId = exerciseMatch[1];

    const exercise = await env.DB.prepare(`
      SELECT e.*, c.name as category_name
      FROM exercises e
      LEFT JOIN exercise_categories c ON e.category_id = c.id
      WHERE e.id = ?
    `).bind(exerciseId).first();

    if (!exercise) {
      return errorResponse('Exercise not found', 404);
    }

    return jsonResponse({ exercise });
  }

  // Create new exercise (instructors only)
  if ((path === '' || path === '/') && method === 'POST') {
    const auth = await requireInstructor(request, env);
    if (auth instanceof Response) return auth;

    const body = await request.json() as any;
    const {
      title,
      description,
      instructions,
      duration_minutes,
      category_id,
      target_segments,
      difficulty,
      safety_notes,
      is_public,
    } = body;

    if (!title) {
      return errorResponse('Title is required');
    }

    const exerciseId = generateId();

    await env.DB.prepare(`
      INSERT INTO exercises (
        id, title, description, instructions, duration_minutes,
        category_id, target_segments, difficulty, safety_notes,
        created_by, is_public
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      exerciseId,
      title,
      description || null,
      instructions || null,
      duration_minutes || null,
      category_id || null,
      JSON.stringify(target_segments || []),
      difficulty || 'beginner',
      safety_notes || null,
      auth.user.id,
      is_public ? 1 : 0
    ).run();

    const exercise = await env.DB.prepare(
      'SELECT * FROM exercises WHERE id = ?'
    ).bind(exerciseId).first();

    return jsonResponse({ exercise }, 201);
  }

  // Update exercise (owner or admin only)
  if (exerciseMatch && method === 'PUT') {
    const auth = await requireAuth(request, env);
    if (auth instanceof Response) return auth;

    const exerciseId = exerciseMatch[1];

    const existing = await env.DB.prepare(
      'SELECT * FROM exercises WHERE id = ?'
    ).bind(exerciseId).first() as any;

    if (!existing) {
      return errorResponse('Exercise not found', 404);
    }

    if (existing.created_by !== auth.user.id && auth.user.role !== 'admin') {
      return errorResponse('Not authorized to edit this exercise', 403);
    }

    const body = await request.json() as any;
    const updates: string[] = [];
    const params: any[] = [];

    const fields = [
      'title', 'description', 'instructions', 'duration_minutes',
      'category_id', 'difficulty', 'safety_notes', 'is_public'
    ];

    for (const field of fields) {
      if (body[field] !== undefined) {
        updates.push(`${field} = ?`);
        params.push(field === 'is_public' ? (body[field] ? 1 : 0) : body[field]);
      }
    }

    if (body.target_segments !== undefined) {
      updates.push('target_segments = ?');
      params.push(JSON.stringify(body.target_segments));
    }

    if (updates.length === 0) {
      return errorResponse('No updates provided');
    }

    updates.push('updated_at = datetime("now")');
    params.push(exerciseId);

    await env.DB.prepare(
      `UPDATE exercises SET ${updates.join(', ')} WHERE id = ?`
    ).bind(...params).run();

    const exercise = await env.DB.prepare(
      'SELECT * FROM exercises WHERE id = ?'
    ).bind(exerciseId).first();

    return jsonResponse({ exercise });
  }

  // Delete exercise (owner or admin only)
  if (exerciseMatch && method === 'DELETE') {
    const auth = await requireAuth(request, env);
    if (auth instanceof Response) return auth;

    const exerciseId = exerciseMatch[1];

    const existing = await env.DB.prepare(
      'SELECT * FROM exercises WHERE id = ?'
    ).bind(exerciseId).first() as any;

    if (!existing) {
      return errorResponse('Exercise not found', 404);
    }

    if (existing.created_by !== auth.user.id && auth.user.role !== 'admin') {
      return errorResponse('Not authorized to delete this exercise', 403);
    }

    await env.DB.prepare('DELETE FROM exercises WHERE id = ?').bind(exerciseId).run();

    return jsonResponse({ success: true });
  }

  return errorResponse('Not Found', 404);
}
