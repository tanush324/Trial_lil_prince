import { getStore } from "@netlify/blobs";

const STORE_NAME="little-prince-name-reveal";
const STATE_KEY="game";
const ADMIN_PASSWORD=process.env.TRIAL_ADMIN_PASSWORD || "trial123";
const ALL_NAMES=["Aarush","Advay","Atharv","Ishaan","Avir","Shrinivasprasad","Vedant","Ritvik","Vihaan","Tavish"];

function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{"Content-Type":"application/json"}});}
function shuffle(a){const x=[...a];for(let i=x.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[x[i],x[j]]=[x[j],x[i]];}return x;}
function makeAssignments(){
  const remaining=shuffle(ALL_NAMES.filter(n=>n!=="Shrinivasprasad"));
  const a={};let k=0;
  for(let slot=1;slot<=10;slot++) a[slot]=slot===6?"Shrinivasprasad":remaining[k++];
  return a;
}
export default async (req)=>{
  if(req.method!=="POST") return json({error:"POST only"},405);
  let body={}; try{body=await req.json();}catch{}
  if(body.password!==ADMIN_PASSWORD) return json({error:"Incorrect password."},401);
  const store=getStore(STORE_NAME);
  for(let attempt=0;attempt<8;attempt++){
    const current=await store.getWithMetadata(STATE_KEY,{type:"json", consistency:"strong"});
    const oldRound=current?.data?.round || 0;
    const state={round:oldRound+1,nextParticipant:1,assignments:makeAssignments(),participants:{}};
    if(!current){
      const r=await store.setJSON(STATE_KEY,state,{onlyIfNew:true});
      if(r.modified) return json({ok:true,round:state.round});
    }else{
      const r=await store.setJSON(STATE_KEY,state,{onlyIfMatch:current.etag});
      if(r.modified) return json({ok:true,round:state.round});
    }
  }
  return json({error:"Reset collided with another request. Please try again."},503);
};
