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
  // Curated comparison sets, not broad lesson categories. A lesson may contain
  // plants AND animals: sharing a lesson is never enough to make a distractor.
  const comparisonSets={
    'classification-ranks':'kingdom phylum class order family genus species',
    'classification-concepts':'classification trait scientific-name',
    'cell-organisation':'cell tissue organ organ-system',
    'cell-count':'unicellular multicellular',
    'cell-types':'plant-cell animal-cell',
    'cell-parts':'cell-wall cell-membrane cell-nucleus cytoplasm vacuole chloroplast',
    'specialised-cells':'red-blood-cell nerve-cell muscle-cell',
    'microbial-groups':'fungi protists bacteria',
    'vascularity':'vascular nonvascular',
    'seed-presence':'seed-plants seedless',
    'seed-cover':'gymnosperms angiosperms',
    'seedless-plants':'moss fern',
    'plant-organs':'root stem leaf fruit',
    'root-types':'taproot fibrous',
    'root-parts':'root-hairs root-cap epidermis cortex',
    'stem-tissues':'xylem phloem cambium',
    'stem-types':'soft-stem woody-stem',
    'leaf-parts':'stomata guard-cells leaf-vein waxy-layer plant-epidermis',
    'plant-processes':'photosynthesis transpiration',
    'plant-gases':'carbon-dioxide oxygen',
    'plant-stored-food':'glucose starch',
    'backbone-groups':'vertebrates invertebrates',
    'invertebrate-groups':'sponges cnidarians flatworms roundworms annelids molluscs arthropods echinoderms',
    'vertebrate-groups':'fish amphibians reptiles birds mammals',
    'arthropod-groups':'insects arachnids crustaceans myriapods',
    'fish-groups':'bony-fish cartilaginous-fish jawless-fish',
    'animal-surface-organs':'gills scales',
    'animal-temperature':'warm-blooded cold-blooded',
    'subatomic-particles':'proton neutron electron',
    'chemical-particles':'atom molecule',
    'pure-substances':'element compound',
    'periodic-directions':'period group',
    'chemical-notation':'chemical-formula element-symbol chemical-equation',
    'element-classes':'metal nonmetal metalloid',
    'conductivity':'conductor insulator',
    'shaping-properties':'malleability ductility',
    'matter-states':'solid liquid gas',
    'phase-changes':'melting freezing evaporation condensation sublimation boiling',
    'phase-temperatures':'melting-point boiling-point freezing-point',
    'change-types':'physical-change chemical-change',
    'thermal-volume':'thermal-expansion thermal-contraction',
    'heat-transfer':'heating cooling',
    'measured-properties':'mass volume density',
    'mass-units':'gram kilogram',
    'volume-units':'cubic-centimeter cubic-meter',
    'measuring-instruments':'balance graduated-cylinder graduated-beaker',
    'waste-management':'reusing recycling',
    'reaction-roles':'reactants products',
    'metal-surface-changes':'rust tarnish',
    'reproduction-types':'sexual asexual',
    'asexual-methods':'division budding',
    'reproductive-cells':'sperm ovum zygote',
    'fertilisation-locations':'internal-fertilization external-fertilization',
    'metamorphosis-types':'complete-metamorphosis incomplete-metamorphosis',
    'insect-stages':'larva pupa nymph',
    'flower-cover-parts':'petal sepal',
    'flower-sex-organs':'stamen carpel',
    'stamen-parts':'anther filament',
    'carpel-parts':'stigma style ovary',
    'plant-propagules':'seed spore pollen',
    'pollination-types':'self-pollination cross-pollination',
    'earth-spheres':'atmosphere hydrosphere biosphere',
    'earth-layers':'crust mantle outer-core inner-core',
    'earth-rheology':'lithosphere asthenosphere',
    'earthquake-locations':'focus epicenter',
    'volcanic-materials':'magma lava',
    'volcano-status':'active-volcano dormant-volcano extinct-volcano',
    'weathering-types':'physical-weathering chemical-weathering',
    'sediment-movement':'erosion deposition',
    'sedimentary-landforms':'delta dune',
    'soil-layers':'topsoil subsoil parent-material',
    'soil-conservation-methods':'fertilizing crop-rotation strip-cropping contour-plowing terrace windbreak',
    'planets':'earth mercury venus mars jupiter saturn uranus neptune',
    'planet-groups':'rocky-planets giant-planets',
    'moon-phases':'new-moon crescent first-quarter gibbous full-moon last-quarter',
    'eclipses':'lunar-eclipse solar-eclipse',
    'earth-poles':'north-pole south-pole',
    'earth-reference-lines':'axis equator',
    'orbital-motions':'rotation revolution',
    'space-small-bodies':'comet asteroid meteor meteorite',
    'constellation-galaxy':'constellation galaxy',
    'digestive-organs':'mouth oesophagus stomach liver pancreas small-intestine large-intestine',
    'urinary-parts':'kidneys nephron ureter bladder urethra',
    'respiratory-parts':'pharynx larynx trachea bronchi bronchioles alveoli lungs diaphragm',
    'heart-chambers':'atrium ventricle',
    'blood-vessels':'artery vein capillary',
    'blood-oxygen':'oxygenated-blood deoxygenated-blood',
    'body-systems':'digestive-system urinary-system respiratory-system circulatory-system immune-system',
    'nutrition-classes':'carbohydrate vitamin mineral fat protein water-nutrient',
    'vitamins':'vitamin-a vitamin-c vitamin-d',
    'dietary-minerals':'calcium iron-nutrient',
    'carbohydrate-foods':'starch-food sugar-food',
    'pathogen-types':'virus-health bacteria-health'
  };
  // These concepts lack a mutually exclusive peer at this curriculum level.
  // Assess them by written recall rather than inventing unrelated alternatives.
  const recallOnly=`acid-rain aerial-roots algae annual-rings apparent-motion archaea artificial-satellite asteroid-belt atomic-nucleus atomic-number backbone balanced-diet barrier-island breathing buoyancy chlorophyll circulation combustion core corrosion crater day-night digestion dissolving earthquake embryo endoskeleton excretion fault fertilization gamete glacier gravity heart heat heredity humus inherited-trait lava-field life-cycle lunar-crater magnetism magnitude mass-conservation matter metamorphosis microscope milky-way moon moon-phases moulting nectar noble-gases nutrient orbit organic-matter pathogen periodic-table planet plants animals pollination pollinator pollution precipitate prevention prop-roots property red-tide reproduction respiration richter runner saliva sandbar satellite scientific-name seasons sediment seismic-waves seismometer semiconductor shadow soil soil-conservation soil-horizon solubility solar-system spreading-roots star sun tectonic-plate tides tissue transpiration true-bacteria tsunami vaccine vascular-tissue vegetative virus volcano water-vapour weathering yolk`;
  const groupById=Object.create(null);
  Object.entries(comparisonSets).forEach(([group,ids])=>ids.split(' ').forEach(id=>{
    if(groupById[id])throw new Error('Duplicate comparison term: '+id);
    groupById[id]=group;
  }));
  // A term in an explicit comparison set takes precedence over this conservative list.
  recallOnly.split(/\s+/).filter(Boolean).forEach(id=>{if(!groupById[id])groupById[id]=null;});
  // Images of a broad class, a contained structure, or an invisible property can
  // also depict its peer. Keep text comparisons, but do not ask ambiguous pictures.
  const textOnlyImages=new Set(`classification trait scientific-name kingdom phylum class order family genus species cell tissue organ organ-system unicellular multicellular vascular nonvascular seed-plants seedless gymnosperms angiosperms vertebrates invertebrates arthropods fish warm-blooded cold-blooded backbone endoskeleton atom molecule element compound metal nonmetal metalloid conductor insulator semiconductor melting-point freezing-point boiling-point physical-change chemical-change mass volume density gram kilogram cubic-centimeter cubic-meter sexual asexual zygote internal-fertilization external-fertilization stamen carpel atmosphere hydrosphere biosphere lithosphere asthenosphere active-volcano dormant-volcano extinct-volcano rocky-planets giant-planets first-quarter last-quarter constellation galaxy carbon-dioxide oxygen carbohydrate vitamin mineral fat protein water-nutrient vitamin-a vitamin-c vitamin-d calcium iron-nutrient`.split(' '));
  // Some concise textbook definitions also describe a nearby concept. Supply a
  // concrete, scientifically distinguishing context in assessment questions.
  // This does not broaden the accepted answer or reveal the term itself.
  const assessmentPrompts={
    crustaceans:'مفصليات مثل الروبيان وسرطان البحر، لها غطاء خارجي صلب ويعيش كثير منها في الماء.',
    'cartilaginous-fish':'أسماك لها فكّان ويتكون هيكلها الداخلي من غضاريف، ومن أمثلتها سمك القرش.',
    metal:'عناصر مثل الحديد والنحاس، تتميز غالبًا باللمعان والتوصيل الجيد للحرارة والكهرباء وقابلية التشكيل.',
    nonmetal:'عناصر مثل الكبريت والكربون، تختلف عن الفلزات ومعظمها ضعيف التوصيل للحرارة والكهرباء.',
    metalloid:'عناصر مثل السيليكون والبورون، تجمع بين بعض خصائص الفلزات وبعض خصائص اللافلزات.',
    rust:'مادة بنية محمرة تتكون على الحديد عند تفاعله مع الأكسجين بوجود الرطوبة.',
    tarnish:'فقدان سطح فلز لمعانه بسبب تفاعل كيميائي، مثل تكوّن طبقة داكنة على سطح الفضة.',
    division:'طريقة تكاثر لاجنسي تنتج فيها الخلية الأم خليتين متقاربتين في الحجم، دون أن يتكون برعم على جانبها.',
    carbohydrate:'مغذيات تشمل السكريات والنشويات، وتمد الجسم بالطاقة.',
    vitamin:'مغذيات يحتاجها الجسم بكميات قليلة، ومن أمثلتها أ، وج، ود.',
    mineral:'عناصر غذائية يحتاجها الجسم لأداء وظائفه، ومن أمثلتها الكالسيوم والحديد.',
    fat:'مغذيات تكثر في الزيوت والزبدة، وتساعد على تخزين الطاقة وبناء الخلايا.',
    protein:'مغذيات تساعد على بناء الأنسجة ونموها وإصلاحها، وتوجد بكثرة في اللحوم والبيض والعدس.',
    'water-nutrient':'سائل يحتاج الجسم إلى شربه، ويساعد على نقل المواد وتنظيم حرارة الجسم.',
    evaporation:'تحول السائل إلى غاز من سطحه، ويمكن أن يحدث دون أن يصل السائل إلى درجة الغليان.',
    boiling:'تحول السائل إلى غاز مع تكون فقاعات في جميع أجزائه عند بلوغه درجة غليانه.'
  };
  const assessmentPrompt=term=>assessmentPrompts[term.id]||term.meaning;
  function comparisonGroup(id){
    if(!Object.prototype.hasOwnProperty.call(groupById,id))throw new Error('Unreviewed comparison term: '+id);
    return groupById[id];
  }
  function imageEligible(term){return term.imageQuiz!==false&&!textOnlyImages.has(term.id)&&Boolean(comparisonGroup(term.id));}
  function peers(term,allTerms,images=false){
    const group=comparisonGroup(term.id);
    if(!group||images&&!imageEligible(term))return [];
    return allTerms.filter(candidate=>candidate.id!==term.id&&comparisonGroup(candidate.id)===group&&(!images||imageEligible(candidate)));
  }
  function imageSeeds(lesson,allTerms,random=Math.random){
    const local=shuffle(lesson.terms.map(id=>allTerms.find(t=>t.id===id)),random);
    for(const term of local){
      if(!term)throw new Error('Missing lesson term');
      const localPeers=peers(term,local,true);
      if(localPeers.length)return [term.id,localPeers[0].id];
    }
    return [];
  }
  function build(lesson,allTerms,random=Math.random){
    const terms=lesson.terms.map(id=>allTerms.find(t=>t.id===id));
    if(terms.some(t=>!t))throw new Error('Missing lesson term');
    allTerms.forEach(t=>comparisonGroup(t.id));
    const mixed=shuffle(terms,random),questions=[];
    let imageCount=0;
    mixed.forEach((term,i)=>{
      const textPeers=peers(term,allTerms),picturePeers=peers(term,allTerms,true);
      if(!textPeers.length)return;
      const image=picturePeers.length>0&&(i%2||!imageCount);
      if(image)imageCount++;
      const candidates=shuffle(image?picturePeers:textPeers,random).slice(0,3);
      questions.push({id:lesson.id+':recognise:'+term.id,type:image?'image':'term',term:term.id,prompt:assessmentPrompt(term),options:shuffle([term.id,...candidates.map(t=>t.id)],random)});
    });
    const matchingGroups=new Map();
    mixed.filter(imageEligible).forEach(t=>{const g=comparisonGroup(t.id);if(!matchingGroups.has(g))matchingGroups.set(g,[]);matchingGroups.get(g).push(t.id);});
    let batch=0;
    for(const ids of matchingGroups.values()){
      // No one-pair matching screens and no mixing groups to fill empty slots.
      for(let start=0;start<ids.length-1;){
        const count=ids.length-start===4?2:Math.min(3,ids.length-start);
        const selected=ids.slice(start,start+count);
        questions.push({id:lesson.id+':match:'+batch++,type:'match',terms:selected,words:shuffle(selected,random),pictures:shuffle(selected,random)});
        start+=count;
      }
    }
    // Every selected term is assessed, including recall-only concepts. Keep this
    // block last: never shuffle writing among recognition or matching questions.
    shuffle(terms,random).forEach(term=>questions.push({id:lesson.id+':write:'+term.id,type:'write',term:term.id,prompt:assessmentPrompt(term)}));
    return questions;
  }
  const api={shuffle,normalise,accepts,comparisonGroup,imageEligible,imageSeeds,assessmentPrompt,build};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  root.ScienceChallenge=api;
})(typeof globalThis!=='undefined'?globalThis:this);
