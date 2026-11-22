// Edge Function: envia um e-mail a cada vez que um convidado escolhe um item.
// Chamada pelo Database Webhook da tabela "claims" (evento INSERT).
import { createClient } from 'npm:@supabase/supabase-js@2'

Deno.serve(async (req) => {
  if (req.headers.get('x-webhook-secret') !== Deno.env.get('WEBHOOK_SECRET')) {
    return new Response('forbidden', { status: 403 })
  }

  const payload = await req.json()
  if (payload.type !== 'INSERT' || payload.table !== 'claims') {
    return new Response('ignored')
  }
  const claim = payload.record as { item_id: string; guest_name: string }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const { data: item } = await supabase
    .from('items')
    .select('name, max_claims')
    .eq('id', claim.item_id)
    .single()
  const { count } = await supabase
    .from('claims')
    .select('*', { count: 'exact', head: true })
    .eq('item_id', claim.item_id)

  const itemName = item?.name ?? 'um item da lista'
  const progress = item && item.max_claims > 1 ? ` (${count} de ${item.max_claims})` : ''

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Chá do Oliver <onboarding@resend.dev>',
      to: [Deno.env.get('NOTIFY_EMAIL')],
      subject: `${claim.guest_name} escolheu: ${itemName}`,
      text: `${claim.guest_name} vai levar ${itemName}${progress}.`,
    }),
  })

  if (!res.ok) return new Response(await res.text(), { status: 502 })
  return new Response('ok')
})
