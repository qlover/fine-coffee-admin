export interface JwtToken {}

// User
const tokenKey = 'fc_token'
export const getToken = () => {
    const token = window.localStorage.getItem(tokenKey)
    return token ? JSON.parse(token) : {}
}
export const setToken = (token: JwtToken) => {
  window.localStorage.setItem(tokenKey, JSON.stringify(token))
}
export const removeToken = () => window.localStorage.removeItem(tokenKey)
