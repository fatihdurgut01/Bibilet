# Canlı Sunucuya Deploy Rehberi

## Vercel ile Deploy (Önerilen - En Kolay)

### Web Arayüzü ile:
1. https://vercel.com adresine gidin
2. GitHub hesabınızla giriş yapın
3. "Add New Project" → GitHub repo'nuzu seçin
4. "Deploy" butonuna tıklayın
5. Siteniz birkaç dakika içinde canlıda olacak!

### CLI ile:
```bash
npm install -g vercel
vercel
vercel --prod
```

## Netlify ile Deploy

1. https://app.netlify.com adresine gidin
2. GitHub hesabınızla giriş yapın
3. "Add new site" → "Import an existing project"
4. GitHub repo'nuzu seçin
5. "Deploy site" butonuna tıklayın

## Kendi Sunucunuzda (VPS/AWS/DigitalOcean)

### 1. Sunucuya Bağlanın
```bash
ssh kullanici@sunucu-ip
```

### 2. Node.js ve npm Kurulumu
```bash
# Ubuntu/Debian için
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Node.js versiyonunu kontrol edin
node --version
npm --version
```

### 3. Projeyi Klonlayın
```bash
git clone https://github.com/fatihdurgut01/bibilet.git
cd bibilet
```

### 4. Bağımlılıkları Yükleyin
```bash
npm install
```

### 5. Production Build Oluşturun
```bash
npm run build
```

### 6. PM2 ile Çalıştırın (Önerilen)
```bash
# PM2'yi global olarak yükleyin
npm install -g pm2

# Uygulamayı başlatın
pm2 start npm --name "bibilet" -- start

# PM2'yi sistem başlangıcında otomatik başlatmak için
pm2 startup
pm2 save
```

### 7. Nginx Reverse Proxy Kurulumu (Opsiyonel)
```bash
sudo apt-get install nginx

# Nginx config dosyası oluşturun
sudo nano /etc/nginx/sites-available/bibilet
```

Nginx config içeriği:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Config'i aktif edin
sudo ln -s /etc/nginx/sites-available/bibilet /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 8. SSL Sertifikası (Let's Encrypt)
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## Önemli Notlar

- **Vercel/Netlify**: Ücretsiz, otomatik SSL, CDN, kolay kullanım
- **Kendi Sunucu**: Daha fazla kontrol, ama kurulum ve bakım gerektirir
- **Environment Variables**: Gerekirse `.env` dosyası oluşturun
- **Database**: Şu anda in-memory kullanılıyor, production'da gerçek veritabanı gerekli

## Hızlı Başlangıç (Vercel - En Kolay)

1. https://vercel.com → Sign in with GitHub
2. Import Project → bibilet repo'sunu seç
3. Deploy → 2-3 dakika bekle
4. ✅ Siteniz canlıda!

