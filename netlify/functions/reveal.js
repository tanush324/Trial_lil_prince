import { getStore } from "@netlify/blobs";

const STORE_NAME = "little-prince-name-reveal";
const STATE_KEY = "game";
const FIXED_SLOT = 6;
const FIXED_NAME = "Shrinivasprasad";
const ALL_NAMES = ["Aarush","Advay","Atharv","Ishaan","Avir","Shrinivasprasad","Vedant","Ritvik","Vihaan","Tavish"];
const ADMIN_PASSWORD = process.env.TRIAL_ADMIN_PASSWORD || "trial123";

function json(data, status=200, extraHeaders={}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {"Content-Type":"application/json", ...extraHeaders}
  });
}
function parseCookies(req) {
  const out = {};
  const raw = req.headers.get("cookie") || "";
  for (const part of raw.split(";")) {
    const i = part.indexOf("=");
    if (i > -1) out[part.slice(0,i).trim()] = decodeURIComponent(part.slice(i+1).trim());
  }
  return out;
}
function shuffle(a) {
  const x=[...a];
  for(let i=x.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [x[i],x[j]]=[x[j],x[i]];
  }
  return x;
}
function makeAssignments() {
  const remaining = shuffle(ALL_NAMES.filter(n => n !== FIXED_NAME));
  const assignments = {};
  let k=0;
  for(let slot=1;slot<=10;slot++){
    assignments[slot] = slot===FIXED_SLOT ? FIXED_NAME : remaining[k++];
  }
  return assignments;
}
async function readState(store) {
  const got = await store.getWithMetadata(STATE_KEY, {type:"json"});
  if (!got) return {round:1,nextParticipant:1,assignments:makeAssignments(),participants:{}};
  return got;
}
async function ensureState(store) {
  const got = await store.getWithMetadata(STATE_KEY, {type:"json"});
  if (got) return got;
  const state={round:1,nextParticipant:1,assignments:makeAssignments(),participants:{}};
  const result=await store.set(STATE_KEY,state,{onlyIfNew:true});
  if (result.modified) return {data:state,etag:result.etag};
  return await store.getWithMetadata(STATE_KEY,{type:"json"});
}

export default async (req) => {
  if(req.method!=="POST") return json({error:"POST only"},405);
  const store=getStore(STORE_NAME);
  const cookies=parseCookies(req);
  let participantId=cookies.lp_participant;
  for(let attempt=0;attempt<8;attempt++){
    const current=await ensureState(store);
    const state=current.data;
    const participants=state.participants||{};
    if(participantId && participants[participantId] && participants[participantId].round===state.round){
      return json({name:participants[participantId].name,participant:participants[participantId].slot});
    }

    const slot=state.nextParticipant;
    if(slot>10) return json({error:"All 10 trial participants have already been assigned. Use Admin → Reset Game for a new round."},409);
    participantId=participantId || crypto.randomUUID();
    const name=state.assignments[slot] || (slot===FIXED_SLOT ? FIXED_NAME : shuffle(ALL_NAMES.filter(n=>n!==FIXED_NAME))[0]);
    const updated={
      ...state,
      nextParticipant:slot+1,
      participants:{
        ...participants,
        [participantId]:{round:state.round,slot,name}
      }
    };
    const result=await store.set(STATE_KEY,updated,{onlyIfMatch:current.etag});
    if(result.modified){
      return json(
        {name,participant:slot},
        200,
        {"Set-Cookie":`lp_participant=${encodeURIComponent(participantId)}; Path=/; Max-Age=31536000; SameSite=Lax; Secure`}
      );
    }
  }
  return json({error:"Please try again."},503);
};
