'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/components/ToastProvider'
import { mapError } from '@/lib/errors'

export default function RegisterPage() {
  const router = useRouter()
  const toast = useToast()
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [usernameError, setUsernameError] = useState<string | null>(null)
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleUsernameChange = (value: string) => {
    if (value.includes(' ')) {
      setUsernameError('Kullanıcı adı boşluk içeremez.')
      setUsername(value.replace(/ /g, ''))
      return
    }
    if (value && !/^[a-zA-Z0-9_]+$/.test(value)) {
      setUsernameError('Yalnızca harf, rakam ve alt çizgi (_) kullanabilirsiniz.')
      setUsername(value.replace(/[^a-zA-Z0-9_]/g, ''))
      return
    }
    setUsernameError(null)
    setUsername(value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (usernameError) {
      toast('Kullanıcı adını düzeltin.', 'error')
      return
    }
    if (username && !/^[a-zA-Z0-9_]+$/.test(username)) {
      toast('Kullanıcı adı yalnızca harf, rakam ve alt çizgi içerebilir.', 'error')
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          username,
          phone: phone ? `+90${phone}` : '',
        },
      },
    })
    setLoading(false)
    if (error) {
      toast(mapError(error.message), 'error')
    } else {
      toast('Kayıt başarılı! E-postanıza gelen bağlantıyla hesabınızı onaylayın.', 'success')
      setTimeout(() => router.push('/auth/login'), 1500)
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <h1 className="text-2xl font-bold mb-6 text-center">Kayıt Ol</h1>
      <form onSubmit={handleSubmit} className="space-y-4">

        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
            Tam Adınız
          </label>
          <input
            type="text"
            id="fullName"
            required
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            placeholder="Örn: Ahmet Yılmaz"
            className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700">
            Kullanıcı Adı
          </label>
          <input
            type="text"
            id="username"
            required
            value={username}
            onChange={e => handleUsernameChange(e.target.value)}
            placeholder="Örn: ahmetyilmaz (boşluksuz)"
            className={`mt-1 block w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
              usernameError ? 'border-red-400 bg-red-50' : 'border-gray-300'
            }`}
          />
          {usernameError && (
            <p className="mt-1 text-sm text-red-600">{usernameError}</p>
          )}
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            Telefon
          </label>
          <div className="mt-1 flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-transparent">
            <span className="px-3 py-3 bg-gray-50 text-gray-600 text-sm border-r border-gray-300 whitespace-nowrap select-none">
              🇹🇷 +90
            </span>
            <input
              type="tel"
              id="phone"
              value={phone}
              onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
              placeholder="532 123 45 67"
              maxLength={10}
              className="flex-1 px-3 py-3 focus:outline-none bg-white text-sm"
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            E-posta
          </label>
          <input
            type="email"
            id="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="ornek@gmail.com"
            className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Şifre
          </label>
          <input
            type="password"
            id="password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="En az 6 karakter"
            className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Kaydolunuyor...' : 'Kayıt Ol'}
        </button>
      </form>
      <p className="mt-4 text-center text-sm">
        Zaten bir hesabın var mı?{' '}
        <a href="/auth/login" className="text-primary-600 hover:underline">Giriş Yap</a>
      </p>
    </div>
  )
}
