'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()

  useEffect(() => {
    // redirect to new auth route
    router.replace('/auth/login')
  }, [router])

  return null

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <h1 className="text-2xl font-bold mb-6 text-center">Giriş Yap</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            İsim veya Kullanıcı Adı
          </label>
          <input
            type="text"
            id="name"
            required
            value={name}
            onChange={e => setName(e.target.value)}
            className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-primary-700 transition"
        >
          Giriş Yap
        </button>
      </form>
    </div>
  )
}
