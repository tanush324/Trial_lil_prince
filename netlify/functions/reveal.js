import { getStore } from "@netlify/blobs";

const STORE_NAME="little-prince-name-reveal";
const STATE_KEY="game";
const CONFIG_KEY="config";

function json(data,status=200,extra={}){
  return new Response(JSON.stringify(data),{status,headers:{"Content-Type":"application/json",...extra}});
}
function parseCookies(req){
  const out={};
  const raw=req.headers.get("cookie")||"";
  raw.split(";").forEach(part=>{
    const i=part.indexOf("=");
    if(i>0) out[part.slice(0,i).trim()]=decodeURIComponent(part.slice(i+1).trim());
  });
  return out;
}

export default async (req)=>{
  const store=getStore(STORE_NAME);

  // Used by the welcome page to determine whether Admin has configured a name.
  if(req.method==="GET"){
    const cfg=await store.getWithMetadata(CONFIG_KEY,{type:"json",consistency:"strong"});
    return json({configured:!!cfg?.data?.specialName});
  }

  if(req.method!=="POST") return json({error:"POST only"},405);

  const cfgResult=await store.getWithMetadata(CONFIG_KEY,{type:"json",consistency:"strong"});
  const cfg=cfgResult?.data;
  if(!cfg?.specialName) return json({error:"Game has not started yet. Please wait for Admin to select the name."},409);

  const cookies=parseCookies(req);
  let participantId=cookies.lp_participant;

  for(let attempt=0;attempt<8;attempt++){
    const current=await store.getWithMetadata(STATE_KEY,{type:"json",consistency:"strong"});
    let state=current?.data;

    // If configuration exists but state is missing, initialize the round from that configuration.
    if(!state || state.specialName?.toLowerCase()!==cfg.specialName.toLowerCase() || Number(state.specialPosition)!==Number(cfg.specialPosition)){
      return json({error:"The game is being prepared. Please try again."},409);
    }

    const participants=state.participants||{};
    if(participantId && participants[participantId] && participants[participantId].round===state.round){
      return json({name:participants[participantId].name,participant:participants[participantId].slot});
    }

    const slot=state.nextParticipant;
    if(slot>200) return json({error:"All 200 participants have already been assigned. Use Admin to start a new round."},409);
    participantId=participantId || crypto.randomUUID();
    const name=state.assignments?.[slot];
    if(!name) return json({error:"Game configuration is incomplete. Please use Admin to start a new round."},500);

    const updated={
      ...state,
      nextParticipant:slot+1,
      participants:{...participants,[participantId]:{round:state.round,slot,name}}
    };
    const result=await store.setJSON(STATE_KEY,updated,{onlyIfMatch:current.etag});
    if(result.modified){
      return json({name,participant:slot},200,{"Set-Cookie":`lp_participant=${encodeURIComponent(participantId)}; Path=/; Max-Age=31536000; SameSite=Lax; Secure`});
    }
  }
  return json({error:"Please try again."},503);
};
