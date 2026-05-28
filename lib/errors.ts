const ERROR_MAP: Record<string, string> = {
  'Invalid login credentials': 'E-posta veya şifre hatalı',
  'User already registered': 'Bu e-posta adresi zaten kayıtlı',
  'Email not confirmed': 'E-postanızı onaylamanız gerekiyor',
  'Password should be at least 6 characters': 'Şifre en az 6 karakter olmalıdır',
  'Unable to validate email address: invalid format': 'Geçersiz e-posta formatı',
  'Email rate limit exceeded': 'Çok fazla deneme yaptınız, lütfen bekleyin',
  'For security purposes': 'Güvenlik nedeniyle kısa bir süre bekleyin',
}

export function mapError(message: string): string {
  if (ERROR_MAP[message]) return ERROR_MAP[message]
  for (const [key, val] of Object.entries(ERROR_MAP)) {
    if (message.toLowerCase().includes(key.toLowerCase())) return val
  }
  return message
}
