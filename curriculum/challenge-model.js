/* Lesson challenges progress from recognition to recall. Writing is always last. */
(function(root){
  function shuffle(values, random=Math.random){
    const a=[...values];
    for(let i=a.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}
    return a;
  }
  function normalise(value){
    return String(value).normalize('NFKC').replace(/[\u064B-\u065F\u0670\u0640]/g,'').replace(/[أإآٱ]/g,'ا').replace(/ى/g,'ي').replace(/[،,.!?؟؛:]/g,'').replace(/\s+/g,' ').trim();
  }
  function accepts(term,value){
    const answer=normalise(value);
    if(!answer)return false;
    const withoutArticle=s=>s.split(' ').map(w=>w.startsWith('ال')?w.slice(2):w).join(' ');
    return [term.name,...(term.aliases||[])].some(candidate=>normalise(candidate)===answer||withoutArticle(normalise(candidate))===withoutArticle(answer));
  }
  function build(lesson,allTerms,random=Math.random){
    const terms=lesson.terms.map(id=>allTerms.find(t=>t.id===id));
    if(terms.some(t=>!t))throw new Error('Missing lesson term');
    const mixed=shuffle(terms,random);
    const family=id=>({corrosion:'rust',rust:'rust',gamete:'gametes',fertilization:'gametes',ovum:'gametes',zygote:'gametes',metamorphosis:'cycle', 'complete-metamorphosis':'cycle','life-cycle':'cycle', 'melting-point':'zero','freezing-point':'zero'}[id]||id);
    const choices=t=>shuffle([t,...shuffle(terms.filter(x=>x.id!==t.id&&family(x.id)!==family(t.id)),random).slice(0,3)],random).map(x=>x.id);
    const questions=[];
    // Every term appears once in recognition, then in a picture match and written recall.
    const imagePool=allTerms.filter(t=>t.lesson===lesson.id&&t.imageQuiz!==false);
    let imageCount=0;mixed.forEach((term,i)=>{const candidates=shuffle(imagePool.filter(t=>t.id!==term.id&&family(t.id)!==family(term.id)),random).slice(0,3);const image=term.imageQuiz!==false&&candidates.length>=2&&(i%2||!imageCount);if(image)imageCount++;questions.push({id:lesson.id+':recognise:'+term.id,type:image?'image':'term',term:term.id,options:image?shuffle([term.id,...candidates.map(t=>t.id)],random):choices(term)})});
    const remaining=mixed.filter(t=>t.imageQuiz!==false);let batch=0;
    while(remaining.length){
      const selected=[],families=new Set();for(let i=0;i<remaining.length&&selected.length<3;){if(!families.has(family(remaining[i].id))){const t=remaining.splice(i,1)[0];selected.push(t);families.add(family(t.id))}else i++}
      const ids=selected.map(t=>t.id);
      questions.push({id:lesson.id+':match:'+batch++,type:'match',terms:ids,words:shuffle(ids,random),pictures:shuffle(ids,random)});
    }
    // Keep this block last: never shuffle questions across activity types.
    shuffle(terms,random).forEach(term=>questions.push({id:lesson.id+':write:'+term.id,type:'write',term:term.id}));
    return questions;
  }
  const api={shuffle,normalise,accepts,build};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  root.ScienceChallenge=api;
})(typeof globalThis!=='undefined'?globalThis:this);
