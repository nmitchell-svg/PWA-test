export default async () => {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  if (!publicKey) {
    return Response.json({ error: 'VAPID_PUBLIC_KEY is not configured.' }, { status: 500 });
  }
  return Response.json({ publicKey }, {
    headers: { 'Cache-Control': 'no-store' }
  });
};
