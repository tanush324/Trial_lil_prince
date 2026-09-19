import { getStore } from "@netlify/blobs";

const STORE_NAME="little-prince-name-reveal";
const STATE_KEY="game";
const CONFIG_KEY="config";
const ADMIN_PASSWORD="lilprince";
const BASE_NAMES=["Aarush", "Advay", "Atharv", "Ishaan", "Avir", "Vedant", "Ritvik", "Vihaan", "Tavish", "Aatreya", "Agniv", "Avyukt", "Anvay", "Ekansh", "Ekavir", "Havish", "Hriday", "Ishayu", "Kairav", "Kavish", "Medhansh", "Mihir", "Nihit", "Ojas", "Pravar", "Rishit", "Ritansh", "Srijan", "Sudarsh", "Udbhav", "Vaidik", "Vedarth", "Viraj", "Aarav", "Aditya", "Advait", "Agastya", "Ahaan", "Aayansh", "Abhay", "Abhinav", "Abhimanyu", "Achintya", "Adarsh", "Adit", "Aditesh", "Advaith", "Ahan", "Akshay", "Amay", "Amogh", "Anant", "Anay", "Aniket", "Anirudh", "Anish", "Ansh", "Anshuman", "Arhaan", "Arin", "Arjun", "Arnav", "Arpit", "Aryan", "Ashwin", "Atharva", "Atreya", "Avyaan", "Ayush", "Ayushman", "Bharat", "Bhargav", "Bhuvan", "Bodhi", "Brijesh", "Chaitanya", "Chirag", "Daksh", "Dakshesh", "Darsh", "Dhairya", "Dhruv", "Dhruva", "Divij", "Divit", "Divyansh", "Eeshan", "Ehan", "Eklavya", "Gaurav", "Girish", "Gokul", "Harsh", "Harshil", "Harshit", "Hemant", "Himanshu", "Hiran", "Hrishikesh", "Ivaan", "Ivaansh", "Ishank", "Ishwar", "Jai", "Jatin", "Jayant", "Jeevan", "Kabir", "Kartik", "Kartikeya", "Kavin", "Kiaan", "Kiran", "Kriyansh", "Krish", "Krishiv", "Kunal", "Laksh", "Lakshay", "Lakshit", "Lohit", "Madhav", "Manan", "Manav", "Manish", "Mayank", "Moksh", "Naksh", "Nakul", "Naman", "Nandan", "Naveen", "Neel", "Neerav", "Nihal", "Nirvaan", "Nishant", "Nitin", "Om", "Omkar", "Parth", "Pranav", "Pranay", "Pratham", "Pratyush", "Raghav", "Raghavendra", "Raj", "Rajat", "Rajveer", "Ranveer", "Reyansh", "Riaan", "Rishabh", "Rishi", "Rohan", "Rohit", "Rudra", "Rudransh", "Samar", "Samarth", "Sarthak", "Shaurya", "Shiv", "Shivansh", "Shlok", "Shrey", "Shreyansh", "Siddharth", "Soham", "Somesh", "Sparsh", "Sriansh", "Sthavir", "Tanay", "Tanish", "Tanishq", "Tarun", "Tejas", "Tejasvi", "Trishan", "Ujjwal", "Utkarsh", "Vansh", "Varun", "Vatsal", "Veer", "Vihan", "Vikram", "Vivan", "Vivaan", "Yash", "Yashas", "Yuvan", "Yuvaan", "Zoravar", "Amod", "Anvith", "Devarsh", "Varen"];

function json(data,status=200){
  return new Response(JSON.stringify(data),{status,headers:{"Content-Type":"application/json"}});
}
function shuffle(a){const x=[...a];for(let i=x.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[x[i],x[j]]=[x[j],x[i]];}return x;}
function canonicalName(input){
  const trimmed=String(input||"").trim();
  const match=BASE_NAMES.find(n=>n.toLowerCase()===trimmed.toLowerCase());
  return match || trimmed;
}
function makeAssignments(specialName,specialPosition){
  const ordinary=shuffle(BASE_NAMES.filter(n=>n.toLowerCase()!==specialName.toLowerCase()));
  const assignments={};
  let k=0;
  for(let slot=1;slot<=200;slot++) assignments[slot]=slot===specialPosition?specialName:ordinary[k++];
  return assignments;
}

export default async (req)=>{
  if(req.method!=="POST") return json({error:"POST only"},405);
  let body={};
  try{body=await req.json();}catch{return json({error:"Invalid request."},400);}
  if(body.password!==ADMIN_PASSWORD) return json({error:"Incorrect password."},401);
  const name=canonicalName(body.name);
  const position=Number(body.position);
  if(!name) return json({error:"Enter a name."},400);
  if(!Number.isInteger(position)||position<1||position>200) return json({error:"Position must be a whole number from 1 to 200."},400);
  if(name.length>50) return json({error:"Name is too long."},400);
  const store=getStore(STORE_NAME);
  const config={specialName:name,specialPosition:position};
  await store.setJSON(CONFIG_KEY,config);
  const state={round:Date.now(),nextParticipant:1,specialName:name,specialPosition:position,assignments:makeAssignments(name,position),participants:{}};
  await store.setJSON(STATE_KEY,state);
  return json({ok:true,config,state:{round:state.round}});
};
