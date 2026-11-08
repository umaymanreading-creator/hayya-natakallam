/* Shared append-only school activity ledger. Never includes speech, answers or drawings. */
(function(root){'use strict';
const QUEUE='school-activity-outbox-v1',BASE='school-activity-baselines-v1';
const API='https://uwevxjtgurkwotitxtac.supabase.co/rest/v1/rpc/record_training_event',KEY='sb_publishable_ugT8zyGJGwEyEcjBwNNOtg_uUN5ukSS';
const script=typeof document!=='undefined'?document.currentScript:null,site=new URL('.',script?.src||location.href);let timer,retry=0,sending=false,participantSource=null,participantKey='arabic-student-profile-v1';
const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))||fallback}catch{return fallback}};
function uuid(){if(root.crypto?.randomUUID)return root.crypto.randomUUID();const b=root.crypto.getRandomValues(new Uint8Array(16));b[6]=b[6]&15|64;b[8]=b[8]&63|128;const s=Array.from(b,v=>v.toString(16).padStart(2,'0')).join('');return s.slice(0,8)+'-'+s.slice(8,12)+'-'+s.slice(12,16)+'-'+s.slice(16,20)+'-'+s.slice(20)}
function profile(){let key=participantKey,p=participantSource?participantSource():read(key,null);if(!participantSource&&(!p?.name||!p?.grade)){p=read('science-trial-profile',null);key='science-trial-profile'}if(!p?.name?.trim()||!p?.grade?.trim())return null;if(!p.started){p.started=new Date().toISOString();const stored=read(key,null);if(stored?.name===p.name&&stored?.grade===p.grade)try{localStorage.setItem(key,JSON.stringify(p))}catch{return null}}return{student_name:(p.role==='parent'?'ولي أمر: ':'')+p.name.trim(),student_class:p.grade.trim(),role:p.role==='parent'?'parent':'student',training_started_at:p.started}}
function useParticipant(reader,key='arabic-student-profile-v1'){participantSource=reader;participantKey=key}
function identity(p){return [p.student_name,p.student_class,p.training_started_at].join('|')}
function notify(state){root.dispatchEvent?.(new CustomEvent('school-training-status',{detail:{state,pending:read(QUEUE,[]).length}}))}
function enqueue(event){const q=read(QUEUE,[]);if(!q.some(e=>e.id===event.id))q.push(event);try{localStorage.setItem(QUEUE,JSON.stringify(q));notify('saved');schedule();return true}catch{notify('storage-full');return false}}
const fields=['section','section_name','skill_id','skill_name','unit_id','unit_name','lesson_id','lesson_name','activity_id','activity_type','activity_name','kind','outcome','attempts','points','award_key'];
function record(meta){const p=profile();if(!p||!['speaking','writing','letters','curriculum'].includes(meta.section))return false;const e={id:uuid(),...p,occurred_at:new Date().toISOString(),kind:'attempt',outcome:'completed',attempts:0,points:0};for(const k of fields)if(meta[k]!==undefined)e[k]=meta[k];e.points=Math.max(0,Math.floor(Number(e.points)||0));e.attempts=Math.max(0,Math.floor(Number(e.attempts)||0));return enqueue(e)}
function baseline(section,total,scope=section){const p=profile();if(!p)return false;const id=identity(p)+'|'+section+'|'+scope,m=read(BASE,{});if(m[id])return true;const ok=record({section,section_name:{speaking:'هيا نتحدث',writing:'مدينة الكلمات',letters:'محطة الحروف',curriculum:'كلماتي في دروسي'}[section],skill_id:scope,skill_name:'تقدّم سابق محفوظ',activity_id:'legacy:'+scope,activity_type:'legacy-progress',activity_name:'نقاط سابقة؛ تفاصيل الأنشطة غير متاحة',kind:'baseline',outcome:'completed',points:Math.max(0,total),award_key:scope});if(ok){m[id]=true;try{localStorage.setItem(BASE,JSON.stringify(m))}catch{}}return ok}
function schedule(){clearTimeout(timer);timer=setTimeout(()=>{timer=null;flush()},800)}
async function flush(){
 if(sending)return;clearTimeout(timer);timer=null;
 if(root.navigator?.onLine===false){notify('offline');return}
 let blocked=false;sending=true;
 try{for(let n=0;n<30;n++){
  const e=read(QUEUE,[])[0];if(!e){retry=0;notify('sent');break}
  const c=new AbortController(),t=setTimeout(()=>c.abort(),20000);let res;
  try{res=await root.fetch(API,{method:'POST',headers:{apikey:KEY,'Content-Type':'application/json'},body:JSON.stringify({event:e}),signal:c.signal})}finally{clearTimeout(t)}
  if(!res.ok){const err=Error('send');err.status=res.status;throw err}
  if(await res.json()!==true)throw Error('unacknowledged');
  const fresh=read(QUEUE,[]).filter(x=>x.id!==e.id);localStorage.setItem(QUEUE,JSON.stringify(fresh));retry=0;notify(fresh.length?'sending':'sent');
 }}catch(e){
  blocked=[400,401,403,404].includes(e.status);notify(blocked?'setup-needed':'offline');
  if(!blocked){retry++;timer=setTimeout(()=>{timer=null;flush()},Math.min(300000,3000*2**Math.min(retry,7)))}
 }finally{sending=false;if(read(QUEUE,[]).length&&!timer&&!blocked)schedule()}
}
function url(page,params){const u=new URL(page||'index.html',site);u.search='?v=activity2';u.hash=new URLSearchParams(params).toString();return u.href}
function toast(text){let el=document.getElementById('schoolLinkToast');if(!el){el=document.createElement('div');el.id='schoolLinkToast';el.setAttribute('role','status');el.style.cssText='position:fixed;bottom:12px;left:50%;transform:translateX(-50%);max-width:90%;background:#204e4b;color:white;padding:10px 16px;border-radius:14px;z-index:20000;font:16px Tahoma;pointer-events:none';document.body.append(el)}el.textContent=text;el.hidden=false;clearTimeout(el._timer);el._timer=setTimeout(()=>el.hidden=true,2600)}
async function copy(page,params){const value=url(page,params);try{await navigator.clipboard.writeText(value);toast('نُسخ رابط التدريب')}catch{root.prompt('انسخي رابط التدريب:',value)}return value}
function button(parent,page,params){if(!parent||parent.querySelector('.schoolShare'))return;const b=document.createElement('button');b.type='button';b.className='schoolShare';b.textContent='↗';b.title='نسخ رابط التدريب';b.setAttribute('aria-label','نسخ رابط التدريب');b.style.cssText='flex:0 0 44px;min-width:44px;min-height:44px;padding:4px;font-size:24px';b.onclick=()=>copy(page,typeof params==='function'?params():params);parent.append(b)}
root.SchoolTraining={record,baseline,flush,profile,useParticipant,url,copy,button,identity};
root.addEventListener?.('online',()=>{retry=0;flush()});root.addEventListener?.('storage',e=>{if(e.key===QUEUE)schedule();if(['arabic-student-profile-v1','science-trial-profile'].includes(e.key)){let a,b;try{a=JSON.parse(e.oldValue||'null');b=JSON.parse(e.newValue||'null')}catch{}const sig=p=>p?[p.name,p.grade,p.role||'student',p.started].join('|'):'';if(sig(a)!==sig(b))location.reload()}});if(typeof document!=='undefined')document.addEventListener('visibilitychange',()=>{if(!document.hidden)flush()});schedule();
})(typeof window!=='undefined'?window:globalThis);
