// Recognition first, picture matching next, written recall last.
function normaliseTerm(s){return String(s).normalize('NFKC').replace(/[\u064b-\u065f\u0670\u0640]/g,'').replace(/[أإآٱ]/g,'ا').replace(/ى/g,'ي').replace(/[،,.!?؟؛:]/g,'').trim().replace(/\s+/g,' ').split(' ').map(w=>w.startsWith('ال')?w.slice(2):w).join(' ')}
function makeQuestions(){
 const all=UNIT.terms;
 const pending=shuffle(all.filter(t=>!progress().stars.includes('varied-write-'+t[6])));
 const selected=[...pending,...shuffle(all.filter(t=>!pending.includes(t)))].slice(0,8);
 const qs=selected.map((t,i)=>({id:'varied-recognise-'+t[6],type:i%2?'image':'term',term:t,options:shuffle([t,...shuffle(all.filter(x=>x!==t)).slice(0,3)])}));
 for(let i=0;i<selected.length;i+=3){const terms=selected.slice(i,i+3);qs.push({id:'varied-match-'+terms.map(t=>t[6]).sort().join('-'),type:'match',terms,words:shuffle(terms),pictures:shuffle(terms)})}
 qs.push(...shuffle(selected).map(t=>({id:'varied-write-'+t[6],type:'write',term:t})));
 return qs;
}
function startQuiz(){clearTimeout(nextTimer);questions=makeQuestions();qIndex=0;showQuestion()}
function finish(){stopSound();const completed=UNIT.terms.filter(t=>progress().stars.includes('varied-write-'+t[6])).length;persist();$('app').innerHTML=`<div class="quiz-prompt"><p class="eyebrow">أكملتِ جولة التدريب</p><h1>أحسنتِ يا ${safe(person.name)}!</h1><p class="meaning">تدرّبتِ على الاختيار والمطابقة وكتابة المصطلحات.</p><p>أتقنتِ كتابة ${completed} من ${UNIT.terms.length} مصطلحًا.</p><h2>★ ${progress().stars.length}</h2><button class="primary" id="again">جولة جديدة</button><button id="return">العودة للمفردات</button></div>`;$('again').onclick=startQuiz;$('return').onclick=home;speak('أحسنتِ');}
function quizAdvance(){nextTimer=setTimeout(()=>{if(qIndex<questions.length-1){qIndex++;showQuestion()}else finish()},1100)}
function quizCorrect(button){if(locked)return;locked=true;if(button)button.classList.add('correct');const q=questions[qIndex];if(!progress().stars.includes(q.id)){progress().stars.push(q.id);persist()}$('feedback').textContent=['أحسنتِ!','ممتازة، استمرّي!','رائع!'][qIndex%3];speak(['أحسنتِ','ممتازة','رائع'][qIndex%3]);quizAdvance()}
function showQuestion(){
 stopSound();locked=false;attempt=0;const q=questions[qIndex];setRoute('view=quiz');
 const names={term:'اختاري المصطلح',image:'اختاري الصورة',match:'وصّلي المصطلح بصورته',write:'اكتبي المصطلح'};
 let body='';
 if(q.type==='term')body=`<div class="quiz-prompt"><h2>${safe(q.term[1])}</h2><div class="choices">${q.options.map((t,i)=>`<button data-option="${i}">${safe(t[0])}</button>`).join('')}</div></div>`;
 if(q.type==='image')body=`<h2 class="quiz-heading">أي صورة توضّح ${safe(q.term[0])}؟</h2><div class="picture-options">${q.options.map((t,i)=>`<button data-option="${i}" aria-label="الصورة ${i+1}">${art(t)}<span>${i+1}</span></button>`).join('')}</div>`;
 if(q.type==='match')body=`<p class="quiz-heading">اضغطي على المصطلح ثم الصورة المناسبة له.</p><div class="match-board"><div class="match-words">${q.words.map((t,i)=>`<button data-word="${i}">${safe(t[0])}</button>`).join('')}</div><div class="match-pictures">${q.pictures.map((t,i)=>`<button data-picture="${i}" aria-label="الصورة ${i+1}">${art(t)}</button>`).join('')}</div></div>`;
 if(q.type==='write')body=`<div class="write-layout">${art(q.term)}<form id="writeForm"><h2>${safe(q.term[1])}</h2><label for="writtenAnswer">ما المصطلح؟</label><input id="writtenAnswer" autocomplete="off" autocorrect="off" spellcheck="false" maxlength="80" placeholder="اكتبي هنا"><button class="primary" type="submit">تحققي من إجابتي</button></form></div>`;
 $('app').innerHTML=`<div class="row"><strong class="grow">${names[q.type]}</strong><span>${qIndex+1} / ${questions.length}</span></div><div class="track"><div style="width:${qIndex/questions.length*100}%"></div></div><section class="varied-body">${body}</section><div class="feedback" role="status" id="feedback"></div><div class="controls"><button id="backLesson">العودة للمفردات</button><span class="note">${q.type==='write'?'المرحلة الأخيرة: الكتابة':'تدرّبي واجمعي النجوم'}</span></div>`;
 $('backLesson').onclick=()=>{clearTimeout(nextTimer);home()};
 document.querySelectorAll('[data-option]').forEach(b=>b.onclick=()=>{if(locked)return;if(q.options[Number(b.dataset.option)]===q.term)quizCorrect(b);else{b.classList.add('wrong');$('feedback').textContent='فكّري في المعنى وحاولي مجددًا.'}});
 if(q.type==='write')$('writeForm').onsubmit=e=>{e.preventDefault();if(locked)return;const value=normaliseTerm($('writtenAnswer').value);if(!value){$('feedback').textContent='اكتبي المصطلح أولًا.';return}if(value===normaliseTerm(q.term[0]))quizCorrect();else $('feedback').textContent='اقتربتِ! راجعي المعنى وحاولي مرة أخرى.'};
 if(q.type==='match'){
  let selected=null;const matched=new Set();
  document.querySelectorAll('[data-word]').forEach(b=>b.onclick=()=>{if(locked||b.disabled)return;document.querySelectorAll('[data-word]').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');selected=b;$('feedback').textContent='الآن اختاري الصورة المناسبة.'});
  document.querySelectorAll('[data-picture]').forEach(b=>b.onclick=()=>{if(locked||b.disabled)return;if(!selected){$('feedback').textContent='اختاري المصطلح أولًا.';return}const term=q.words[Number(selected.dataset.word)];if(term===q.pictures[Number(b.dataset.picture)]){matched.add(term[6]);selected.disabled=true;b.disabled=true;selected.classList.remove('selected');selected.classList.add('correct');b.classList.add('correct');selected=null;$('feedback').textContent='مطابقة صحيحة!';if(matched.size===q.terms.length)quizCorrect()}else $('feedback').textContent='جرّبي صورة أخرى.'});
 }
}
if(person?.name&&person?.grade)route();
