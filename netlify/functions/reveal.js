import { getStore } from "@netlify/blobs";

const STORE_NAME = "little-prince-name-reveal";
const STATE_KEY = "game";
const CONFIG_KEY = "config";
const DEFAULT_SPECIAL_NAME = "Shrinivasprasad";
const DEFAULT_SPECIAL_POSITION = 6;
const BASE_NAMES=["Aarush", "Advay", "Atharv", "Ishaan", "Avir", "Vedant", "Ritvik", "Vihaan", "Tavish", "Aatreya", "Agniv", "Avyukt", "Anvay", "Ekansh", "Ekavir", "Havish", "Hriday", "Ishayu", "Kairav", "Kavish", "Medhansh", "Mihir", "Nihit", "Ojas", "Pravar", "Rishit", "Ritansh", "Srijan", "Sudarsh", "Udbhav", "Vaidik", "Vedarth", "Viraj", "Aarav", "Aditya", "Advait", "Agastya", "Ahaan", "Aayansh", "Abhay", "Abhinav", "Abhimanyu", "Achintya", "Adarsh", "Adit", "Aditesh", "Advaith", "Ahan", "Akshay", "Amay", "Amogh", "Anant", "Anay", "Aniket", "Anirudh", "Anish", "Ansh", "Anshuman", "Arhaan", "Arin", "Arjun", "Arnav", "Arpit", "Aryan", "Ashwin", "Atharva", "Atreya", "Avyaan", "Ayush", "Ayushman", "Bharat", "Bhargav", "Bhuvan", "Bodhi", "Brijesh", "Chaitanya", "Chirag", "Daksh", "Dakshesh", "Darsh", "Dhairya", "Dhruv", "Dhruva", "Divij", "Divit", "Divyansh", "Eeshan", "Ehan", "Eklavya", "Gaurav", "Girish", "Gokul", "Harsh", "Harshil", "Harshit", "Hemant", "Himanshu", "Hiran", "Hrishikesh", "Ivaan", "Ivaansh", "Ishank", "Ishwar", "Jai", "Jatin", "Jayant", "Jeevan", "Kabir", "Kartik", "Kartikeya", "Kavin", "Kiaan", "Kiran", "Kriyansh", "Krish", "Krishiv", "Kunal", "Laksh", "Lakshay", "Lakshit", "Lohit", "Madhav", "Manan", "Manav", "Manish", "Mayank", "Moksh", "Naksh", "Nakul", "Naman", "Nandan", "Naveen", "Neel", "Neerav", "Nihal", "Nirvaan", "Nishant", "Nitin", "Om", "Omkar", "Parth", "Pranav", "Pranay", "Pratham", "Pratyush", "Raghav", "Raghavendra", "Raj", "Rajat", "Rajveer", "Ranveer", "Reyansh", "Riaan", "Rishabh", "Rishi", "Rohan", "Rohit", "Rudra", "Rudransh", "Samar", "Samarth", "Sarthak", "Shaurya", "Shiv", "Shivansh", "Shlok", "Shrey", "Shreyansh", "Siddharth", "Soham", "Somesh", "Sparsh", "Sriansh", "Sthavir", "Tanay", "Tanish", "Tanishq", "Tarun", "Tejas", "Tejasvi", "Trishan", "Ujjwal", "Utkarsh", "Vansh", "Varun", "Vatsal", "Veer", "Vihan", "Vikram", "Vivan", "Vivaan", "Yash", "Yashas", "Yuvan", "Yuvaan", "Zoravar", "Amod", "Anvith", "Devarsh", "Varen"];

function json(data, status=200, extraHeaders={}) {
  return new Response(JSON.stringify(data), {status, headers:{"Content-Type":"application/json", ...extraHeaders}});
}
function parseCookies(req) {
  const out={};
  const raw=req.headers.get("cookie")||"";
  for(const part of raw.split(";")){
    const i=part.indexOf("=");
    if(i>-1) out[part.slice(0,i).trim()]=decodeURIComponent(part.slice(i+1).trim());
  }
  return out;
}
function shuffle(a){
  const x=[...a];
  for(let i=x.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[x[i],x[j]]=[x[j],x[i]];}
  return x;
}
function canonicalName(input){
  const trimmed=String(input||"").trim();
  const match=BASE_NAMES.find(n=>n.toLowerCase()===trimmed.toLowerCase());
  return match || trimmed;
}
function makeAssignments(specialName,specialPosition){
  specialName=canonicalName(specialName);
  const matches=BASE_NAMES.filter(n=>n.toLowerCase()===specialName.toLowerCase());
  let ordinary=shuffle(BASE_NAMES.filter(n=>n.toLowerCase()!==specialName.toLowerCase()));
  // Always create exactly 200 participant assignments. If the admin name is
  // already in the 200-name pool, move that existing name to the selected slot.
  // If it is a new custom name, keep it at the selected slot and randomly use
  // 199 of the 200 pool names for the remaining slots.
  if(matches.length===0) ordinary=ordinary.slice(0,199);
  const assignments={}; let k=0;
  for(let slot=1;slot<=200;slot++) assignments[slot]=slot===specialPosition?specialName:ordinary[k++];
  return assignments;
}
async function getConfig(store){
  const got=await store.getWithMetadata(CONFIG_KEY,{type:"json",consistency:"strong"});
  return got?.data || {specialName:DEFAULT_SPECIAL_NAME,specialPosition:DEFAULT_SPECIAL_POSITION};
}
async function ensureState(store){
  const got=await store.getWithMetadata(STATE_KEY,{type:"json",consistency:"strong"});
  if(got) return got;
  const cfg=await getConfig(store);
  const state={round:1,nextParticipant:1,specialName:cfg.specialName,specialPosition:cfg.specialPosition,assignments:makeAssignments(cfg.specialName,cfg.specialPosition),participants:{}};
  const result=await store.setJSON(STATE_KEY,state,{onlyIfNew:true});
  if(result.modified) return {data:state,etag:result.etag};
  return await store.getWithMetadata(STATE_KEY,{type:"json",consistency:"strong"});
}

export default async (req)=>{
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
    if(slot>200) return json({error:"All 200 participants have already been assigned. Use Admin to start a new round."},409);
    participantId=participantId || crypto.randomUUID();
    const name=state.assignments[slot];
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
