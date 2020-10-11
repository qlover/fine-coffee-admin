export interface JwtToken {
  key: string,
  repeat: boolean
  token: string
  type: string,
  void: boolean
}

export const defaultJwtToken = {
  key: 'Authorization',
  repeat: false,
  token: '',
  type: 'apiKey',
  void: true
}

export const isInvalid = (token: JwtToken): boolean => !token || token.void || !token.token

// User
const tokenKey = 'fc_token'
export const getToken = (): JwtToken => {
  const token = window.localStorage.getItem(tokenKey)
  return token ? JSON.parse(token) : defaultJwtToken
}
export const setToken = (token: JwtToken) => {
  window.localStorage.setItem(tokenKey, JSON.stringify(token))
}
export const removeToken = () => window.localStorage.removeItem(tokenKey)
