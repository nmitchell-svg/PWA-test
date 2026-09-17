import { createClient } from '@supabase/supabase-js';
import { corsHeaders, preflight } from './_cors.mjs';
const supabase=createClient(process.env.SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false}});
export default async req=>{
  if(req.method==='OPTIONS') return preflight(req);
  if(req.method!=='POST') return Response.json({error:'Method not allowed.'},{status:405,headers:corsHeaders(req)});
  try{
    const {contractorId,subscription,userAgent,siteOrigin}=await req.json();
    if(!contractorId||!subscription?.endpoint||!subscription?.keys?.p256dh||!subscription?.keys?.auth) return Response.json({error:'Invalid subscription payload.'},{status:400,headers:corsHeaders(req)});
    const allowedIds=(process.env.ALLOWED_CONTRACTOR_IDS||'').split(',').map(x=>x.trim()).filter(Boolean);
    if(allowedIds.length&&!allowedIds.includes(contractorId)) return Response.json({error:'Unknown contractor.'},{status:403,headers:corsHeaders(req)});
    const row={contractor_id:contractorId,endpoint:subscription.endpoint,subscription,user_agent:userAgent||null,site_origin:siteOrigin||null,last_seen_at:new Date().toISOString()};
    const {error}=await supabase.from('push_subscriptions').upsert(row,{onConflict:'endpoint'}); if(error) throw error;
    return Response.json({ok:true},{headers:corsHeaders(req)});
  }catch(e){console.error('subscribe error',e);return Response.json({error:'Could not save subscription.'},{status:500,headers:corsHeaders(req)});}
};
