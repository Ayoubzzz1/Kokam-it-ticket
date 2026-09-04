import axios from 'axios'

const api = axios.create({
  baseURL: (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, ''),
})

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('kokam_access')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true

      const refresh = sessionStorage.getItem('kokam_refresh')

      if (refresh) {
        try {
          const { data } = await api.post('/auth/refresh/', { refresh })

          sessionStorage.setItem('kokam_access', data.access)

          original.headers.Authorization = `Bearer ${data.access}`

          return api(original)
        } catch {
          sessionStorage.removeItem('kokam_access')
          sessionStorage.removeItem('kokam_refresh')
          window.location.href = '/login'
        }
      }
    }

    return Promise.reject(error)
  }
)

export default api