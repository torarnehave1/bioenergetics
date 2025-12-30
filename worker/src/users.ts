/**
 * User management handlers (UC7 - Instructor features)
 */

import { Env, jsonResponse, errorResponse, requireAuth, requireInstructor } from './index';

function generateId(): string {
  return crypto.randomUUID();
}

export async function handleUsers(request: Request, env: Env, path: string): Promise<Response> {
  const method = request.method;

  // Update current user profile
  if (path === '/me' && method === 'PUT') {
    const auth = await requireAuth(request, env);
    if (auth instanceof Response) return auth;

    const body = await request.json() as any;
    const updates: string[] = [];
    const params: any[] = [];

    if (body.name !== undefined) {
      updates.push('name = ?');
      params.push(body.name);
    }

    if (body.consent_tracking !== undefined) {
      updates.push('consent_tracking = ?');
      params.push(body.consent_tracking ? 1 : 0);
    }

    if (updates.length === 0) {
      return errorResponse('No updates provided');
    }

    updates.push('updated_at = datetime("now")');
    params.push(auth.user.id);

    await env.DB.prepare(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`
    ).bind(...params).run();

    const user = await env.DB.prepare(
      'SELECT id, email, name, role, consent_tracking FROM users WHERE id = ?'
    ).bind(auth.user.id).first();

    return jsonResponse({ user });
  }

  // Get students for instructor (UC7)
  if (path === '/students' && method === 'GET') {
    const auth = await requireInstructor(request, env);
    if (auth instanceof Response) return auth;

    const students = await env.DB.prepare(`
      SELECT u.id, u.email, u.name, u.created_at, u.consent_tracking,
             isr.consent_given, isr.consent_date
      FROM users u
      JOIN instructor_students isr ON isr.student_id = u.id
      WHERE isr.instructor_id = ?
      ORDER BY u.name, u.email
    `).bind(auth.user.id).all();

    return jsonResponse({ students: students.results });
  }

  // Add student to instructor (invite)
  if (path === '/students' && method === 'POST') {
    const auth = await requireInstructor(request, env);
    if (auth instanceof Response) return auth;

    const body = await request.json() as any;
    const { email } = body;

    if (!email) {
      return errorResponse('Student email required');
    }

    // Find or create student
    let student = await env.DB.prepare(
      'SELECT id FROM users WHERE email = ?'
    ).bind(email.toLowerCase()).first() as any;

    if (!student) {
      const studentId = generateId();
      await env.DB.prepare(
        'INSERT INTO users (id, email, role) VALUES (?, ?, ?)'
      ).bind(studentId, email.toLowerCase(), 'student').run();
      student = { id: studentId };
    }

    // Check if relationship already exists
    const existing = await env.DB.prepare(
      'SELECT id FROM instructor_students WHERE instructor_id = ? AND student_id = ?'
    ).bind(auth.user.id, student.id).first();

    if (existing) {
      return errorResponse('Student already added');
    }

    // Create relationship
    await env.DB.prepare(`
      INSERT INTO instructor_students (id, instructor_id, student_id)
      VALUES (?, ?, ?)
    `).bind(generateId(), auth.user.id, student.id).run();

    return jsonResponse({ success: true }, 201);
  }

  // Grant consent to instructor
  if (path === '/consent' && method === 'POST') {
    const auth = await requireAuth(request, env);
    if (auth instanceof Response) return auth;

    const body = await request.json() as any;
    const { instructor_id, consent } = body;

    if (!instructor_id) {
      return errorResponse('Instructor ID required');
    }

    // Update consent in relationship
    await env.DB.prepare(`
      UPDATE instructor_students
      SET consent_given = ?, consent_date = datetime('now')
      WHERE instructor_id = ? AND student_id = ?
    `).bind(consent ? 1 : 0, instructor_id, auth.user.id).run();

    // Also update user's general consent flag
    await env.DB.prepare(`
      UPDATE users SET consent_tracking = ? WHERE id = ?
    `).bind(consent ? 1 : 0, auth.user.id).run();

    return jsonResponse({ success: true });
  }

  // Get my instructors (for students)
  if (path === '/my-instructors' && method === 'GET') {
    const auth = await requireAuth(request, env);
    if (auth instanceof Response) return auth;

    const instructors = await env.DB.prepare(`
      SELECT u.id, u.email, u.name, isr.consent_given, isr.consent_date
      FROM users u
      JOIN instructor_students isr ON isr.instructor_id = u.id
      WHERE isr.student_id = ?
    `).bind(auth.user.id).all();

    return jsonResponse({ instructors: instructors.results });
  }

  // Get student progress (for instructor, UC7)
  if (path.startsWith('/students/') && path.endsWith('/progress') && method === 'GET') {
    const auth = await requireInstructor(request, env);
    if (auth instanceof Response) return auth;

    const studentId = path.replace('/students/', '').replace('/progress', '');

    // Verify instructor has access and student consented
    const relationship = await env.DB.prepare(`
      SELECT * FROM instructor_students
      WHERE instructor_id = ? AND student_id = ? AND consent_given = 1
    `).bind(auth.user.id, studentId).first();

    if (!relationship) {
      return errorResponse('Access denied or consent not given', 403);
    }

    // Get student's experiences
    const experiences = await env.DB.prepare(`
      SELECT be.*, e.title as exercise_title
      FROM body_experiences be
      LEFT JOIN exercises e ON be.exercise_id = e.id
      WHERE be.user_id = ?
      ORDER BY be.created_at DESC
      LIMIT 100
    `).bind(studentId).all();

    // Get summary stats
    const stats = await env.DB.prepare(`
      SELECT
        COUNT(*) as total_experiences,
        AVG(mood_rating) as avg_mood,
        AVG(energy_rating) as avg_energy,
        AVG(grounding_rating) as avg_grounding
      FROM body_experiences
      WHERE user_id = ?
    `).bind(studentId).first();

    return jsonResponse({
      experiences: experiences.results,
      stats,
    });
  }

  return errorResponse('Not Found', 404);
}
