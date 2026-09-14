import { createClient } from '@supabase/supabase-js';
import webpush from 'web-push';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

function configureWebPush() {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || 'mailto:admin@example.com';

  if (!publicKey || !privateKey) throw new Error('VAPID keys are not configured.');
  webpush.setVapidDetails(subject, publicKey, privateKey);
}

export default async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed.' }, { status: 405 });
  }

  if (!process.env.ADMIN_SECRET || req.headers.get('x-admin-key') !== process.env.ADMIN_SECRET) {
    return Response.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    configureWebPush();

    const { contractorId, title, body, url } = await req.json();
    if (!contractorId || !title || !body) {
      return Response.json({ error: 'contractorId, title, and body are required.' }, { status: 400 });
    }

    const { data: rows, error } = await supabase
      .from('push_subscriptions')
      .select('id, endpoint, subscription')
      .eq('contractor_id', contractorId);

    if (error) throw error;

    let sent = 0;
    let failed = 0;
    const staleIds = [];
    const payload = JSON.stringify({
      title,
      body,
      url: url || '/',
      tag: `contractor-${Date.now()}`
    });

    await Promise.all((rows || []).map(async row => {
      try {
        await webpush.sendNotification(row.subscription, payload);
        sent += 1;
      } catch (err) {
        failed += 1;
        console.error('push failed', row.endpoint, err.statusCode, err.body);

        if (err.statusCode === 404 || err.statusCode === 410) {
          staleIds.push(row.id);
        }
      }
    }));

    if (staleIds.length) {
      await supabase.from('push_subscriptions').delete().in('id', staleIds);
    }

    return Response.json({
      ok: true,
      subscribers: rows?.length || 0,
      sent,
      failed,
      removedStale: staleIds.length
    });
  } catch (error) {
    console.error('send-push error', error);
    return Response.json({ error: error.message || 'Could not send notification.' }, { status: 500 });
  }
};
