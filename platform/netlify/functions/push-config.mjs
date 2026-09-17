import { corsHeaders, preflight } from './_cors.mjs';
export default async req => {
  if(req.method==='OPTIONS') return preflight(req);
  const publicKey=process.env.VAPID_PUBLIC_KEY;
  if(!publicKey) return Response.json({error:'VAPID_PUBLIC_KEY is not configured.'},{status:500,headers:corsHeaders(req)});
  return Response.json({publicKey},{headers:{...corsHeaders(req),'Cache-Control':'no-store'}});
};
