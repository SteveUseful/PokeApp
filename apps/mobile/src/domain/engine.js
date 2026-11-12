/* Raidwell sandbox state machine. No game APIs or live players. */
(function(root){
const bosses=[
{id:'zamazenta',name:'Crowned Shield Zamazenta',tier:'Legendary',types:['Fighting','Steel'],color:'#9fb9ef',demand:168,ahead:2,wait:55,weather:'Unknown',form:'Crowned Shield',asset:'zamazenta'},
{id:'zacian',name:'Crowned Sword Zacian',tier:'Legendary',types:['Fairy','Steel'],color:'#e6a8d6',demand:120,ahead:2,wait:65,weather:'Unknown',form:'Crowned Sword',asset:'zacian'},
{id:'lugia',name:'Lugia',tier:'Legendary',types:['Psychic','Flying'],color:'#a49be5',cp:'45,925',demand:142,ahead:3,wait:90,weather:'Windy',form:'Standard',asset:'lugia'},
{id:'gengar',name:'Mega Gengar',tier:'Mega',types:['Ghost','Poison'],color:'#b78be3',cp:'65,215',demand:54,ahead:1,wait:45,weather:'Fog',form:'Mega',asset:'gengar'},
{id:'giratina',name:'Giratina',tier:'Legendary',types:['Ghost','Dragon'],color:'#e0b771',cp:'38,326',demand:86,ahead:2,wait:70,weather:'Windy',form:'Altered',asset:'giratina'},
{id:'salamence',name:'Mega Salamence',tier:'Mega',types:['Dragon','Flying'],color:'#82c6d7',cp:'50,285',demand:38,ahead:4,wait:120,weather:'Windy',form:'Mega',asset:'salamence'},
{id:'snorlax',name:'Snorlax',tier:'3-star',types:['Normal'],color:'#7ebeb3',cp:'16,684',demand:12,ahead:1,wait:40,weather:'Partly cloudy',form:'Standard',asset:'snorlax'},
{id:'dratini',name:'Dratini',tier:'1-star',types:['Dragon'],color:'#9ab6e6',cp:'3,379',demand:8,ahead:0,wait:20,weather:'Windy',form:'Standard',asset:'dratini'},
{id:'darkrai',name:'Darkrai',tier:'Legendary',types:['Dark'],color:'#c5a8be',cp:'53,623',demand:180,ahead:0,wait:180,weather:'Fog',form:'Standard',asset:'darkrai'},
{id:'rayquaza',name:'Rayquaza',tier:'Legendary',types:['Dragon','Flying'],color:'#a6cc7b',cp:'49,808',demand:210,ahead:0,wait:240,weather:'Windy',form:'Standard',asset:'rayquaza'}];
const names=['MapleTrainer','Moonbeam','SummitSeeker','BlueComet','NightOwl','CedarFox','NovaTrainer','RainyDay','SilverBirch','AuroraSky','RidgeRunner','Starlit'];
function initial(){return {version:2,view:'discover',profile:{name:'Steve',code:'',level:40},filters:{tier:'All',search:'',sort:'soonest',available:false,favorites:false},favorites:[],room:null,queue:null,history:[],reports:[],settings:{auto:true,scenario:'smooth',sound:false},simStep:0,hostDraft:{boss:'Lugia',tier:'Legendary',form:'Standard',minutes:25,spots:5,weather:'None',language:'English',minLevel:20,note:''}}}
function log(r,text,now){r.events.push({id:cryptoId(),text,at:now});r.events=r.events.slice(-40)}
function cryptoId(){return typeof crypto!=='undefined'&&crypto.randomUUID?crypto.randomUUID():Math.random().toString(36).slice(2)}
function activePlayers(r){return r.players.filter(p=>!p.removed)}
function createRoom(s,config,now=Date.now()){
 if(s.room||s.queue)throw Error('Finish or leave your current room or queue first.');
 if(!Number.isInteger(config.spots)||config.spots<1||config.spots>10)throw Error('Choose between 1 and 10 guest spots.');
 if(!config.name?.trim())throw Error('Choose a raid boss.');
 if(!Number.isFinite(config.minutes)||config.minutes<5||config.minutes>60)throw Error('Leave between 5 and 60 minutes to organize the raid.');
 const b=bosses.find(b=>b.name===config.name);s.room={id:cryptoId(),name:config.name.trim(),bossId:b?.id||'',role:config.role||'host',host:config.host||s.profile.name,code:config.code||s.profile.code,spots:config.spots,created:now,expires:now+config.minutes*60000,phase:config.role==='guest'||config.visibility==='private'?'matching':(b?.ahead?'queued':'matching'),ahead:config.role==='guest'||config.visibility==='private'?0:(b?.ahead||0),players:[],events:[],messages:[],step:0,serial:0,form:config.form||b?.form||'Standard',weather:config.weather||'None',language:config.language||'English',note:config.note||'',minLevel:config.minLevel||20,invitedBatches:0,visibility:config.visibility==='private'?'private':'public',inviteGate:config.visibility!=='private',gymTeam:config.gymTeam||'Unknown',locals:Math.max(0,Number(config.locals)||0),minReady:Math.min(config.spots,Math.max(1,Number(config.minReady)||1)),recognition:config.recognition||'Host entered',recovery:[]};
 log(s.room,s.room.visibility==='private'?'Invitation-only room opened. Public matching is paused.':'Room opened. '+(s.room.phase==='queued'?'Waiting in the host queue.':'Matching guests.'),now);
 if(config.role==='guest'){s.room.players.push({id:'self',name:s.profile.name,level:s.profile.level,self:true,assigned:0,request:false,ready:false,invited:false,received:false,removed:false})}
 s.view='room';return s.room;
}
function closeRoom(s,result,now=Date.now(),details={}){const r=s.room;if(!r)return;s.history.unshift({id:r.id,name:r.name,role:r.role,host:r.host,date:now,result,players:activePlayers(r).length,details,events:r.events,form:r.form});s.room=null;s.history=s.history.slice(0,100)}
function tick(s,now=Date.now()){
 s.simStep++;
 if(s.queue){s.queue.position=Math.max(0,s.queue.position-1);if(!s.queue.position){const q=s.queue;s.queue=null;createRoom(s,{...q.config,role:'guest',minutes:20},now);log(s.room,'A demo host became available. Queue matched.',now)}return}
 const r=s.room;if(!r)return;if(now>=r.expires){closeRoom(s,'Room expired',now);return}r.step++;
 if(r.visibility==='private'&&!r.inviteGate)return;
 if(r.phase==='queued'){if(r.ahead>0)r.ahead--;if(!r.ahead){r.phase='matching';log(r,'You reached the front of the host queue. Matching guests.',now)}return}
 if(r.phase==='matching'||r.phase==='ready'){
  if(r.role==='guest'&&r.stalledId){const p=activePlayers(r).find(p=>p.id===r.stalledId);if(p&&!p.ready&&r.step-p.assigned>=6){p.removed=true;r.phase='matching';log(r,'Demo host replaced unresponsive guest '+p.name+'. Other guests kept their places.',now)}}
  for(const p of activePlayers(r)){
   if(p.self)continue;
   if(s.settings.scenario==='no-show'&&p.id===r.stalledId)continue;
   if(!p.request&&r.step>p.assigned){p.request=true;log(r,p.name+' reported sending a friend request.',now)}
   if(p.request&&!p.ready&&r.step>p.assigned+1){p.ready=true;log(r,p.name+' confirmed ready.',now)}
  }
  if(activePlayers(r).length<r.spots){const n=r.serial++;const p={id:cryptoId(),name:names[n%names.length]+(n>=names.length?Math.floor(n/names.length)+1:''),level:Math.max(r.minLevel,38+n%10),assigned:r.step,request:false,ready:false,invited:false,received:false,removed:false};r.players.push(p);if(s.settings.scenario==='no-show'&&activePlayers(r).length===r.spots&&!r.stalledId)r.stalledId=p.id;log(r,p.name+' joined the room.',now)}
  if(activePlayers(r).length===r.spots&&r.phase==='matching'){r.phase='ready';log(r,'All spots filled. Waiting for ready confirmations.',now)}
  if(r.role==='guest'&&activePlayers(r).length===r.spots&&activePlayers(r).every(p=>p.ready)){r.phase='inviting';log(r,'Demo host is preparing invitations.',now)}
 }else if(r.phase==='inviting'&&r.role==='guest'){
   for(const p of activePlayers(r)){p.invited=true;if(!p.self)p.received=true}r.invitedBatches=Math.ceil(r.spots/5);r.phase='battle';log(r,'Demo host reported sending invitations.',now)
 }else if(r.phase==='battle'){
   for(const p of activePlayers(r)){if(!p.self&&p.invited&&!p.received){p.received=true;log(r,p.name+' reported receiving an invitation.',now)}}
 }
}
function lockReadyRoster(s,acknowledged=false,now=Date.now()){const r=s.room;if(!r||r.role!=='host'||!['matching','ready'].includes(r.phase))throw Error('Only the host can lock a roster before invitations.');if(!acknowledged)throw Error('Confirm that you accept the smaller group.');const ready=activePlayers(r).filter(p=>p.ready);if(ready.length<(r.minReady||1))throw Error('Not enough ready guests for your minimum.');const excluded=activePlayers(r).filter(p=>!p.ready);excluded.forEach(p=>{p.removed=true;p.reason='Roster locked before ready';r.recovery=(r.recovery||[]);r.recovery.push({playerId:p.id,reason:p.reason,originalAssigned:p.assigned})});r.spots=ready.length;r.phase='inviting';r.rosterLockedAt=now;log(r,'Host locked '+ready.length+' ready guests; '+excluded.length+' unready guests excluded without a rating penalty. No new seats will be assigned.',now)}
function startInvites(s,now=Date.now()){const r=s.room;if(!r||r.role!=='host'||!['matching','ready'].includes(r.phase))throw Error('Only the host can start invitations before the roster is locked.');if(activePlayers(r).length!==r.spots||!activePlayers(r).every(p=>p.ready))throw Error('Every guest must be matched and ready first.');r.phase='inviting';r.rosterLockedAt=now;log(r,'Ready check complete. Host preparing invitations.',now)}
function inviteBatch(s,now=Date.now()){const r=s.room;if(!r||r.role!=='host'||r.phase!=='inviting')throw Error('This room is not ready for invitations.');const batch=activePlayers(r).filter(p=>!p.invited).slice(0,5);batch.forEach(p=>p.invited=true);r.invitedBatches++;log(r,'Host reported sending invitations to batch '+r.invitedBatches+' ('+batch.length+' guests).',now);if(activePlayers(r).every(p=>p.invited))r.phase='battle'}
function removePlayer(s,id,now=Date.now()){const r=s.room;if(!r||r.role!=='host'||!['matching','ready'].includes(r.phase))throw Error('Guests can be replaced before invitations begin.');const p=activePlayers(r).find(p=>p.id===id);if(!p)throw Error('Guest not found.');p.removed=true;r.phase='matching';log(r,p.name+' removed by host. Finding a replacement; no automatic reputation penalty.',now)}
function selfReady(s,now=Date.now()){const r=s.room,p=r&&activePlayers(r).find(p=>p.self);if(!p)throw Error('You are not a guest in this room.');p.request=true;p.ready=true;log(r,'You reported adding the host and confirmed ready.',now)}
function queue(s,boss,now=Date.now()){if(s.room||s.queue)throw Error('Leave your existing room or queue first.');s.queue={id:cryptoId(),boss:boss.name,position:6,original:6,joined:now,config:{name:boss.name,spots:5,host:'DemoHost',code:'000000000000',form:boss.form}};s.view='room'}
function normalize(s){return s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'')}
function distance(a,b){const d=Array.from({length:b.length+1},(_,i)=>i);for(let i=1;i<=a.length;i++){let prev=d[0];d[0]=i;for(let j=1;j<=b.length;j++){let n=d[j];d[j]=Math.min(d[j]+1,d[j-1]+1,prev+(a[i-1]!==b[j-1]));prev=n}}return d[b.length]}
function parseOCR(text,species=[]){
 const sourceIsCompanion=/screenshot recognition failed|create a raid room|only verified guests|waiting for guests|best counters for this raid|express room|poke.?raid coins/i.test(text);
 const lines=text.split(/\n/).map(s=>s.trim()).filter(Boolean);let candidates=[];
 const all=species.length?species:bosses.map(b=>({name:b.name.replace(/^Mega /,'')}));
 for(const mon of all){const n=normalize(mon.name);if(n.length<3)continue;let score=0,matched='';for(const line of lines){const words=line.split(/[^\p{L}\p{N}♀♂'-]+/u).filter(Boolean);for(const token of [...words,...words.slice(0,-1).map((w,i)=>w+words[i+1])]){const t=normalize(token);if(Math.abs(t.length-n.length)>2)continue;const dist=distance(t,n);const s=t===n?1:1-dist/Math.max(t.length,n.length);if(s>score){score=s;matched=token}}}
 if(score>=.76)candidates.push({name:mon.name,score,matched});}
 candidates.sort((a,b)=>b.score-a.score||b.name.length-a.name.length);candidates=candidates.slice(0,5);
 const timers=[...text.matchAll(/\b(?:(\d{1,2})\s*:)\s*(\d{2})(?:\s*:\s*(\d{2}))?\b/g)].map(m=>({raw:m[0],seconds:m[3]!==undefined?+m[1]*3600+(+m[2])*60+(+m[3]):+m[1]*60+(+m[2])})).filter(t=>t.seconds>=60&&t.seconds<=3600);
 const cp=[...text.matchAll(/\bCP\s*([\d,. ]{3,10})/gi)].map(m=>m[1].replace(/\D/g,''));
 let detectedForm=/crowned\s+shield/i.test(text)?'Crowned Shield':/crowned\s+sword/i.test(text)?'Crowned Sword':/hero\s+of\s+many\s+battles/i.test(text)?'Hero of Many Battles':/origin(?:e)?\s*(?:forme|form)?/i.test(text)?'Origin':/altered(?:\s+forme)?/i.test(text)?'Altered':null;
 const best=sourceIsCompanion?null:candidates[0];return {candidates:sourceIsCompanion?[]:candidates,sourceIsCompanion,detectedForm,boss:best?.name||null,exact:best?.score===1,ambiguous:!!(best&&candidates[1]?.score===best.score),mega:/\bmega\b/i.test(text),shadow:/\bshadow\b/i.test(text),timers,cp,text};
}
root.RaidEngine={bosses,initial,activePlayers,createRoom,closeRoom,tick,startInvites,lockReadyRoster,inviteBatch,removePlayer,selfReady,queue,parseOCR,normalize,log};if(typeof module!=='undefined')module.exports=root.RaidEngine;
})(typeof window!=='undefined'?window:globalThis);
