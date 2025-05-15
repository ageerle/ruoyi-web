import { ss } from '@/utils/storage'

const LOCAL_NAME = 'TOKEN'
const USER_NAME = 'USER'

export function getToken() {
  return ss.get(LOCAL_NAME)
}

export function setToken(token: string) {
  return ss.set(LOCAL_NAME, token)
}

export function removeToken() {
  return ss.remove(LOCAL_NAME)
}

export function getUser(){
  return ss.get(USER_NAME)
}
export function setUser(user: any){
  return ss.set(USER_NAME, user)
}
export function removeUser(){
  return ss.remove(USER_NAME)
}
