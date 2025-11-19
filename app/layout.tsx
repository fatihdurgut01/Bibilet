import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Link from 'next/link'
import { Ticket } from 'lucide-react'
import { ReactNode } from 'react'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'BiBilet - Bilet Devret ve Sat',
  description: 'Gidemeyeceğiniz etkinlik biletlerinizi satın veya devredin',
}

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="tr">
      <body className={inter.className}>
        <nav className="bg-white shadow-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/" className="flex items-center space-x-2">
                <Ticket className="h-8 w-8 text-primary-600" />
                <span className="text-2xl font-bold text-primary-600">BiBilet</span>
              </Link>
              <div className="flex space-x-4">
                <Link 
                  href="/" 
                  className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition"
                >
                  Ana Sayfa
                </Link>
                <Link 
                  href="/bilet-ekle" 
                  className="bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700 transition"
                >
                  Bilet Ekle
                </Link>
              </div>
            </div>
          </div>
        </nav>
        <main className="min-h-screen bg-gray-50">
          {children}
        </main>
        <footer className="bg-gray-900 text-white mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <Ticket className="h-6 w-6 text-primary-400" />
                  <span className="text-xl font-bold text-white">BiBilet</span>
                </div>
                <p className="text-gray-400 text-sm">
                  Gidemeyeceğiniz etkinlik biletlerinizi güvenle satın veya devredin.
                </p>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-4">Hızlı Linkler</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="/" className="text-gray-400 hover:text-white text-sm transition">
                      Ana Sayfa
                    </Link>
                  </li>
                  <li>
                    <Link href="/bilet-ekle" className="text-gray-400 hover:text-white text-sm transition">
                      Bilet Ekle
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-4">Hakkında</h3>
                <p className="text-gray-400 text-sm">
                  BiBilet, başka platformlardan aldığınız biletleri gidemeyeceğiniz için satmak veya devretmek isteyenler için tasarlanmış bir platformdur.
                </p>
              </div>
            </div>
            <div className="border-t border-gray-800 pt-8 text-center">
              <p className="text-gray-400 text-sm">© 2024 BiBilet. Tüm hakları saklıdır.</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}

