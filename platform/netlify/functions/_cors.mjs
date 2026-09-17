export function corsHeaders(req) {
  const origin=req.headers.get('origin')||'';
  const configured=(process.env.ALLOWED_ORIGINS||'').split(',').map(x=>x.trim()).filter(Boolean);
  const allowed=configured.includes('*')||configured.includes(origin);
  return {
    'Access-Control-Allow-Origin': allowed ? (configured.includes('*') ? '*' : origin) : 'null',
    'Access-Control-Allow-Headers':'Content-Type, x-admin-key',
    'Access-Control-Allow-Methods':'GET, POST, OPTIONS',
    'Vary':'Origin'
  };
}
export function preflight(req){ return new Response(null,{status:204,headers:corsHeaders(req)}); }
