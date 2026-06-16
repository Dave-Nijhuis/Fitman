import { request, saveToken, clearToken } from './client'

interface LoginResponse {
  access_token: string
  token_type: string
}

export async function login(username: string, password: string): Promise<void> {
  const data = await request<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })
  saveToken(data.access_token)
}

export function logout(): void {
  clearToken()
}
