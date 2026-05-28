# BiBilet

**Türkiye'nin bilet devir platformu.** Gidemeyeceğiniz etkinlik biletlerini güvenle satın veya devredin — konser, tiyatro, spor, festival.

---

## Özellikler

| | |
|---|---|
| 🎟 **Bilet Sat** | Etkinlik biletinizi dakikalar içinde yayına alın |
| 🔍 **Bilet Ara** | Aradığınız bileti bulamazsanız arama ilanı açın, satıcılar sizi bulsun |
| 🛡️ **Fiyat Tavanı** | Satış fiyatı orijinal fiyatın %110'unu geçemez |
| ⭐ **Değerlendirme** | Alıcılar satıcıları puanlar; güvenilir satıcılar öne çıkar |
| 💬 **Teklif Sistemi** | Alıcılar bilet için fiyat teklifi gönderebilir |
| 📧 **E-posta Bildirimi** | Teklif gelince satıcıya otomatik e-posta gider |
| 🔐 **Doğrulanmış Kullanıcılar** | Her üye e-posta doğrulamasından geçer |

---

## Tech Stack

| Katman | Teknoloji |
|--------|-----------|
| Framework | [Next.js 14](https://nextjs.org/) (App Router) |
| Dil | TypeScript |
| Stil | Tailwind CSS |
| Backend / DB | [Supabase](https://supabase.com/) (PostgreSQL + Auth + Edge Functions) |
| İkonlar | [Lucide React](https://lucide.dev/) |
| E-posta | [Resend](https://resend.com/) (opsiyonel) |

---

## Kurulum

### Gereksinimler

- Node.js 18+
- Bir [Supabase](https://supabase.com/) projesi

### 1. Repoyu klonlayın

```bash
git clone https://github.com/kullaniciadiniz/bibilet.git
cd bibilet
npm install
```

### 2. Ortam değişkenlerini ayarlayın

`.env.local` dosyası oluşturun:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

### 3. Veritabanı şemasını uygulayın

Supabase Dashboard → SQL Editor'de `supabase/migrations/` klasöründeki dosyaları sırayla çalıştırın:

```
supabase/migrations/20241228000000_initial_schema.sql
```

Veya Supabase CLI kullanıyorsanız:

```bash
supabase db push
```

### 4. Geliştirme sunucusunu başlatın

```bash
npm run dev
```

Tarayıcıda [http://localhost:3000](http://localhost:3000) adresini açın.

---

## Proje Yapısı

```
app/
├── page.tsx              # Ana sayfa (bilet listesi + arananlar)
├── bilet/[id]/           # Bilet detay sayfası
├── bilet-ekle/           # Bilet satışa çıkarma formu
├── bilet-ara/            # Bilet arama ilanı formu
├── nasil-calisir/        # Platform tanıtım sayfası
├── profile/              # Kullanıcı profili
└── auth/
    ├── login/            # Giriş
    └── register/         # Kayıt

components/
├── Navbar.tsx
└── ToastProvider.tsx

lib/
├── api.ts                # Tüm Supabase sorguları
├── supabase.ts           # Supabase client
├── format.ts             # Tarih / fiyat formatlama
└── errors.ts             # Türkçe hata mesajları

supabase/
├── migrations/           # DB migration dosyaları
└── functions/
    └── notify-offer/     # Teklif bildirimi edge function
```

---

## Veritabanı Şeması

| Tablo | Açıklama |
|-------|----------|
| `tickets` | Satışa çıkarılan biletler |
| `offers` | Biletlere yapılan teklifler |
| `ratings` | Satıcı değerlendirmeleri |
| `wanted_tickets` | Kullanıcıların arama ilanları |
| `profiles` | Kullanıcı profil bilgileri |

Tüm tablolarda **Row Level Security (RLS)** aktif.

---

## E-posta Bildirimleri (Opsiyonel)

Teklif gelince otomatik bildirim için:

1. [Resend](https://resend.com/) hesabı açın, API key alın
2. Supabase Dashboard → Edge Functions → Secrets:
   ```
   RESEND_API_KEY = re_xxxxxxxxxxxx
   ```

---

## Lisans

MIT
