import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    const body = await req.json()
    const record = body.record ?? body

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { persistSession: false } }
    )

    // Bilet başlığı ve sahibi
    const { data: ticket } = await supabaseAdmin
      .from('tickets')
      .select('title, owner_id')
      .eq('id', record.ticket_id)
      .single()

    if (!ticket) return new Response('Bilet bulunamadı', { status: 404 })

    // Bilet sahibinin e-postası
    const { data: { user: owner } } = await supabaseAdmin.auth.admin.getUserById(ticket.owner_id)
    if (!owner?.email) return new Response('Kullanıcı bulunamadı', { status: 404 })

    // Teklif verenin e-postası (opsiyonel)
    const { data: { user: offerUser } } = await supabaseAdmin.auth.admin.getUserById(record.user_id)

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
    if (!RESEND_API_KEY) {
      console.log('RESEND_API_KEY ayarlanmamış, e-posta atlandı')
      return new Response(JSON.stringify({ skipped: true }), { status: 200 })
    }

    const amount = Number(record.amount).toLocaleString('tr-TR')

    const html = `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px">
        <h2 style="color:#0284c7;margin-bottom:8px">🎫 Biletinize Yeni Teklif!</h2>
        <p style="color:#374151"><strong>${ticket.title}</strong> adlı biletinize yeni bir teklif geldi.</p>
        <div style="background:#f0f9ff;border-radius:8px;padding:16px;margin:16px 0">
          <p style="margin:0;font-size:28px;font-weight:bold;color:#0284c7">₺${amount}</p>
          ${offerUser?.email ? `<p style="margin:8px 0 0;color:#6b7280;font-size:14px">Teklif veren: ${offerUser.email}</p>` : ''}
        </div>
        <p style="color:#6b7280;font-size:14px">Profil sayfanızdan tüm teklifleri görüntüleyebilirsiniz.</p>
        <a href="https://bibilet.vercel.app/profile"
           style="display:inline-block;background:#0284c7;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin-top:8px">
          Teklifleri Gör →
        </a>
      </div>
    `

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'BiBilet <bildirim@bibilet.com>',
        to: owner.email,
        subject: `Biletinize ₺${amount} teklif geldi: ${ticket.title}`,
        html,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('Resend hatası:', err)
      return new Response(JSON.stringify({ error: err }), { status: 500 })
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 })
  } catch (err) {
    console.error('Edge function hatası:', err)
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 })
  }
})
