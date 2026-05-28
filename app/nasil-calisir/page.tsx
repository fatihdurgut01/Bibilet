import Link from 'next/link'
import { CheckCircle, Shield, Star } from 'lucide-react'

const sellerSteps = [
  {
    n: 1,
    title: 'Hesap Oluştur',
    desc: 'E-posta adresinizle ücretsiz kayıt olun. Kimliğiniz doğrulanarak güvenli bir satıcı profili oluşturulur.',
    icon: '👤',
  },
  {
    n: 2,
    title: 'Biletini Ekle',
    desc: 'Etkinlik adı, tarih, konum ve fiyat bilgilerini girin. Biletiniz dakikalar içinde yayında olur.',
    icon: '🎫',
  },
  {
    n: 3,
    title: 'Alıcıyla Anlaş',
    desc: 'İlgilenen alıcılar sizinle doğrudan iletişime geçer. Anlaşınca bileti güvenle devredin.',
    icon: '🤝',
  },
]

const buyerSteps = [
  {
    n: 1,
    title: 'Etkinlik Ara',
    desc: 'Gitmek istediğiniz etkinliği arayın. Şehir ve kategori filtresiyle kolayca bulun.',
    icon: '🔍',
  },
  {
    n: 2,
    title: 'Satıcıyla İletişime Geç',
    desc: 'Bilet sahibinin iletişim bilgisi üzerinden doğrudan yazışın. Sorularınızı açıkça sorun.',
    icon: '💬',
  },
  {
    n: 3,
    title: 'Güvenle Devral',
    desc: 'Satıcıyı puanlayın, bileti teslim alın. Doğrulanmış kullanıcılar ve fiyat politikası her adımı korur.',
    icon: '✅',
  },
]

const trustItems = [
  {
    icon: <Shield className="h-7 w-7 text-primary-600" />,
    title: 'Fiyat Tavanı Politikası',
    desc: 'Satıcılar biletlerini orijinal fiyatın en fazla %110\'una satabili. Yüksek fiyat talep etmek teknik olarak engellenir.',
  },
  {
    icon: <CheckCircle className="h-7 w-7 text-green-600" />,
    title: 'Doğrulanmış Kullanıcılar',
    desc: 'Her üye e-posta doğrulamasından geçer. Sahte hesap ve spam ilanlar otomatik olarak engellenir.',
  },
  {
    icon: <Star className="h-7 w-7 text-yellow-500" />,
    title: 'Değerlendirme Sistemi',
    desc: 'Her işlem sonrası alıcılar satıcıyı puanlayabilir. Güvenilir satıcılar yıldız puanıyla öne çıkar.',
  },
]

export default function NasilCalisir() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

      {/* Başlık */}
      <div className="text-center mb-14">
        <div className="inline-block px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold mb-4">
          🎫 BiBilet Nasıl Çalışır?
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Basit, Hızlı ve Güvenli
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Biletinizi satın veya aradığınız bilete kavuşun — her adım şeffaf ve kolay.
        </p>
      </div>

      {/* Satıcılar İçin */}
      <section className="mb-16">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-10 w-10 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold text-lg">
            S
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Satıcılar İçin</h2>
          <span className="text-sm text-gray-500">— Biletinizi 3 adımda satışa çıkarın</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sellerSteps.map(step => (
            <div key={step.n}
              className="relative bg-white rounded-xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition">
              <div className="text-4xl mb-4">{step.icon}</div>
              <div className="absolute top-4 right-4 w-7 h-7 rounded-full bg-primary-100 text-primary-700 text-xs font-bold flex items-center justify-center">
                {step.n}
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 text-center">
          <Link href="/bilet-ekle"
            className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition shadow-md">
            🎟 Bilet Sat
          </Link>
        </div>
      </section>

      {/* Alıcılar İçin */}
      <section className="mb-16">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg">
            A
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Alıcılar İçin</h2>
          <span className="text-sm text-gray-500">— 3 adımda biletinize kavuşun</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {buyerSteps.map(step => (
            <div key={step.n}
              className="relative bg-white rounded-xl border border-blue-100 shadow-sm p-6 hover:shadow-md transition">
              <div className="text-4xl mb-4">{step.icon}</div>
              <div className="absolute top-4 right-4 w-7 h-7 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">
                {step.n}
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 text-center">
          <Link href="/"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition shadow-md">
            🔍 Bilet Bul
          </Link>
        </div>
      </section>

      {/* Güven Maddeleri */}
      <section className="bg-gray-50 rounded-2xl p-8 md:p-10">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
          Neden BiBilet'e Güvenebilirsiniz?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {trustItems.map((item, i) => (
            <div key={i} className="flex flex-col items-center text-center">
              <div className="mb-4 p-3 bg-white rounded-full shadow-sm">
                {item.icon}
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <div className="text-center mt-12">
        <p className="text-gray-500 mb-4">Hâlâ sorunuz mu var?</p>
        <div className="flex justify-center gap-4 flex-wrap">
          <Link href="/auth/register"
            className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition">
            Ücretsiz Kayıt Ol
          </Link>
          <Link href="/"
            className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition">
            İlanlara Göz At
          </Link>
        </div>
      </div>

    </div>
  )
}
