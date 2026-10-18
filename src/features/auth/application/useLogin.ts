import { useMutation } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { toApiError } from '@/shared/api/apiError'
import { authApi } from '../data/authApi'
import { classifyLoginError, LOCK_DURATION_MS } from '../domain/rules'
import { useAuthStore } from './authStore'

interface LoginInput {
  username: string
  password: string
}

interface Lock {
  username: string
  until: number
}

export function useLogin() {
  const [lock, setLock] = useState<Lock | null>(null)
  const [now, setNow] = useState(() => Date.now())

  const mutation = useMutation({
    mutationFn: ({ username, password }: LoginInput) =>
      authApi.login({ username: username.trim(), password }),
    onSuccess: (token) => {
      useAuthStore.getState().setSession(token)
      setLock(null)
    },
    onError: (error, { username }) => {
      // BE không trả thời gian khóa còn lại (BE-2) nên đếm 15 phút từ lúc máy này nhận lỗi
      if (classifyLoginError(toApiError(error)) === 'locked') {
        setNow(Date.now())
        setLock({ username: username.trim(), until: Date.now() + LOCK_DURATION_MS })
      }
    },
  })

  useEffect(() => {
    if (!lock) return
    const id = setInterval(() => {
      const t = Date.now()
      setNow(t)
      if (t >= lock.until) setLock(null)
    }, 1000)
    return () => clearInterval(id)
  }, [lock])

  const apiError = mutation.error ? toApiError(mutation.error) : null

  return {
    login: mutation.mutate,
    isPending: mutation.isPending,
    failure: apiError ? classifyLoginError(apiError) : null,
    fieldErrors: apiError?.fieldErrors ?? {},
    isLockedFor: (username: string) => lock !== null && lock.username === username.trim(),
    remainingMs: lock ? lock.until - now : 0,
  }
}
