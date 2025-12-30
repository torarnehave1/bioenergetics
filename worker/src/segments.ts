/**
 * Body segments handlers (Reich's 7 segments)
 */

import { Env, jsonResponse, errorResponse } from './index';

export async function handleSegments(request: Request, env: Env, path: string): Promise<Response> {
  const method = request.method;

  // Get all body segments
  if ((path === '' || path === '/') && method === 'GET') {
    const segments = await env.DB.prepare(
      'SELECT * FROM body_segments ORDER BY order_index'
    ).all();

    return jsonResponse({ segments: segments.results });
  }

  // Get single segment by ID
  const segmentMatch = path.match(/^\/([a-zA-Z0-9-]+)$/);
  if (segmentMatch && method === 'GET') {
    const segmentId = segmentMatch[1];

    const segment = await env.DB.prepare(
      'SELECT * FROM body_segments WHERE id = ?'
    ).bind(segmentId).first();

    if (!segment) {
      return errorResponse('Segment not found', 404);
    }

    return jsonResponse({ segment });
  }

  return errorResponse('Not Found', 404);
}
