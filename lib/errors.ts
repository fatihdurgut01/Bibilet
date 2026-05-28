const ERROR_MAP: Record<string, string> = {
  'Invalid login credentials': 'E-posta veya şifre hatalı',
  'User already registered': 'Bu e-posta adresi zaten kayıtlı',
  'Email not confirmed': 'E-postanızı onaylamanız gerekiyor',
  'Password should be at least 6 characters': 'Şifre en az 6 karakter olmalıdır',
  'Unable to validate email address: invalid format': 'Geçerli bir e-posta adresi girin',
  'Email rate limit exceeded': 'Çok fazla deneme yaptınız, lütfen bekleyin',
  'For security purposes': 'Güvenlik nedeniyle kısa bir süre bekleyin',
  'Signup is disabled': 'Kayıt şu an kapalıdır',
  'over_email_send_rate_limit': 'Çok fazla deneme yaptınız, lütfen bekleyin',
}

const PATTERN_MAP: Array<[RegExp, string]> = [
  [/email address .* is invalid/i, 'Geçerli bir e-posta adresi girin'],
  [/invalid email/i, 'Geçerli bir e-posta adresi girin'],
  [/already registered/i, 'Bu e-posta adresi zaten kayıtlı'],
  [/password.*at least/i, 'Şifre en az 6 karakter olmalıdır'],
  [/rate limit/i, 'Çok fazla deneme yaptınız, lütfen bekleyin'],
  [/security purposes/i, 'Güvenlik nedeniyle kısa bir süre bekleyin'],
]

export function mapError(message: string): string {
  if (ERROR_MAP[message]) return ERROR_MAP[message]
  for (const [key, val] of Object.entries(ERROR_MAP)) {
    if (message.toLowerCase().includes(key.toLowerCase())) return val
  }
  for (const [pattern, val] of PATTERN_MAP) {
    if (pattern.test(message)) return val
  }
  return message
}
