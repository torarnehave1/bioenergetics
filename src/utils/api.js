/**
 * API utility for making requests to the backend
 */

const API_BASE = import.meta.env.VITE_API_URL || ''

class ApiError extends Error {
  constructor(message, status, data) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

async function request(method, path, data = null) {
  const token = localStorage.getItem('auth_token')

  const headers = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const options = {
    method,
    headers,
  }

  if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    options.body = JSON.stringify(data)
  }

  const response = await fetch(`${API_BASE}${path}`, options)
  const responseData = await response.json().catch(() => null)

  if (!response.ok) {
    throw new ApiError(
      responseData?.error || 'Request failed',
      response.status,
      responseData
    )
  }

  return responseData
}

export default {
  get: (path) => request('GET', path),
  post: (path, data) => request('POST', path, data),
  put: (path, data) => request('PUT', path, data),
  patch: (path, data) => request('PATCH', path, data),
  delete: (path) => request('DELETE', path),
}

export { ApiError }
