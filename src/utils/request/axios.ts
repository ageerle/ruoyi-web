import axios, { type AxiosResponse } from 'axios'
import { getToken } from '@/store/modules/auth/helper'

const service = axios.create({
  baseURL: import.meta.env.VITE_GLOB_API_URL,
})

service.interceptors.request.use(
  (config: { headers: { Authorization: string } }) => {
    const token = getToken()
    if (token)
      config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error: { response: any }) => {
    return Promise.reject(error.response)
  },
)

service.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    if (response.status === 200)
      return response

    throw new Error(response.status.toString())
  },
  (error: any) => {
    return Promise.reject(error)
  },
)

export default service
