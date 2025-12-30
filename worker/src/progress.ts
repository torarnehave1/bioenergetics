/**
 * Progress and visualization data handlers (UC5)
 */

import { Env, jsonResponse, errorResponse, requireAuth } from './index';

export async function handleProgress(request: Request, env: Env, path: string): Promise<Response> {
  const method = request.method;
  const auth = await requireAuth(request, env);
  if (auth instanceof Response) return auth;

  const url = new URL(request.url);

  // Get overall progress summary
  if ((path === '' || path === '/') && method === 'GET') {
    // Total experiences
    const totalExp = await env.DB.prepare(`
      SELECT COUNT(*) as count FROM body_experiences WHERE user_id = ?
    `).bind(auth.user.id).first() as any;

    // Average ratings
    const avgRatings = await env.DB.prepare(`
      SELECT
        AVG(mood_rating) as avg_mood,
        AVG(energy_rating) as avg_energy,
        AVG(grounding_rating) as avg_grounding
      FROM body_experiences
      WHERE user_id = ?
    `).bind(auth.user.id).first();

    // Sessions completed
    const sessions = await env.DB.prepare(`
      SELECT COUNT(DISTINCT session_id) as count
      FROM body_experiences
      WHERE user_id = ? AND session_id IS NOT NULL
    `).bind(auth.user.id).first() as any;

    // Most recent experience
    const lastExp = await env.DB.prepare(`
      SELECT created_at FROM body_experiences
      WHERE user_id = ?
      ORDER BY created_at DESC LIMIT 1
    `).bind(auth.user.id).first();

    return jsonResponse({
      total_experiences: totalExp?.count || 0,
      total_sessions: sessions?.count || 0,
      averages: avgRatings,
      last_experience: lastExp?.created_at || null,
    });
  }

  // Get rating trends over time (for charts)
  if (path === '/trends' && method === 'GET') {
    const days = parseInt(url.searchParams.get('days') || '30');

    const trends = await env.DB.prepare(`
      SELECT
        date(created_at) as date,
        AVG(mood_rating) as avg_mood,
        AVG(energy_rating) as avg_energy,
        AVG(grounding_rating) as avg_grounding,
        COUNT(*) as count
      FROM body_experiences
      WHERE user_id = ?
        AND created_at >= datetime('now', '-' || ? || ' days')
      GROUP BY date(created_at)
      ORDER BY date ASC
    `).bind(auth.user.id, days).all();

    return jsonResponse({ trends: trends.results });
  }

  // Get segment sensation history
  if (path === '/segments' && method === 'GET') {
    const days = parseInt(url.searchParams.get('days') || '30');

    const segmentData = await env.DB.prepare(`
      SELECT
        bs.id as segment_id,
        bs.name as segment_name,
        bs.color as segment_color,
        AVG(ss.intensity) as avg_intensity,
        COUNT(*) as sensation_count,
        GROUP_CONCAT(DISTINCT ss.sensation_type) as sensation_types
      FROM segment_sensations ss
      JOIN body_segments bs ON ss.segment_id = bs.id
      JOIN body_experiences be ON ss.experience_id = be.id
      WHERE be.user_id = ?
        AND be.created_at >= datetime('now', '-' || ? || ' days')
      GROUP BY bs.id
      ORDER BY bs.order_index
    `).bind(auth.user.id, days).all();

    return jsonResponse({ segments: segmentData.results });
  }

  // Get before/after comparison data
  if (path === '/comparisons' && method === 'GET') {
    const limit = parseInt(url.searchParams.get('limit') || '10');

    // Get sessions with both before and after
    const sessions = await env.DB.prepare(`
      SELECT DISTINCT session_id
      FROM body_experiences
      WHERE user_id = ?
        AND session_id IS NOT NULL
      GROUP BY session_id
      HAVING COUNT(DISTINCT experience_type) >= 2
      ORDER BY MAX(created_at) DESC
      LIMIT ?
    `).bind(auth.user.id, limit).all();

    const comparisons = [];

    for (const session of sessions.results as any[]) {
      const beforeAfter = await env.DB.prepare(`
        SELECT be.*, e.title as exercise_title
        FROM body_experiences be
        LEFT JOIN exercises e ON be.exercise_id = e.id
        WHERE be.session_id = ? AND be.experience_type IN ('before', 'after')
        ORDER BY be.created_at ASC
      `).bind(session.session_id).all();

      const before = beforeAfter.results.find((e: any) => e.experience_type === 'before');
      const after = beforeAfter.results.find((e: any) => e.experience_type === 'after');

      if (before && after) {
        comparisons.push({
          session_id: session.session_id,
          exercise_title: before.exercise_title || after.exercise_title,
          before: {
            mood: before.mood_rating,
            energy: before.energy_rating,
            grounding: before.grounding_rating,
          },
          after: {
            mood: after.mood_rating,
            energy: after.energy_rating,
            grounding: after.grounding_rating,
          },
          changes: {
            mood: (after.mood_rating || 0) - (before.mood_rating || 0),
            energy: (after.energy_rating || 0) - (before.energy_rating || 0),
            grounding: (after.grounding_rating || 0) - (before.grounding_rating || 0),
          },
          date: after.created_at,
        });
      }
    }

    return jsonResponse({ comparisons });
  }

  // Get exercise usage stats
  if (path === '/exercises' && method === 'GET') {
    const exerciseStats = await env.DB.prepare(`
      SELECT
        e.id,
        e.title,
        e.category_id,
        COUNT(be.id) as times_used,
        AVG(
          CASE WHEN be.experience_type = 'after' THEN be.mood_rating END
        ) as avg_mood_after,
        MAX(be.created_at) as last_used
      FROM exercises e
      LEFT JOIN body_experiences be ON e.id = be.exercise_id AND be.user_id = ?
      WHERE be.id IS NOT NULL
      GROUP BY e.id
      ORDER BY times_used DESC
    `).bind(auth.user.id).all();

    return jsonResponse({ exercises: exerciseStats.results });
  }

  return errorResponse('Not Found', 404);
}
