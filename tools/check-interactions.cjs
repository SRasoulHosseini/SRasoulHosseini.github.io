const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const source = fs.readFileSync(require('node:path').join(__dirname, '../script.js'), 'utf8');

class Element {
  constructor(id='') {
    this.id=id; this.dataset={theme:'light'}; this.attrs={}; this.events={}; this.children=[];
    this.style={setProperty(k,v){this[k]=v;}}; this.hidden=true; this.value='25'; this.checked=true;
    this.textContent=''; this.rect={top:0,bottom:400,left:0,right:400,width:400,height:400}; this.scrollLeft=0; this.clientWidth=400; this.offsetWidth=70;
    const set=new Set(); this.classList={add:v=>set.add(v),remove:v=>set.delete(v),contains:v=>set.has(v),toggle:(v,on)=>on?set.add(v):set.delete(v)};
  }
  setAttribute(k,v){this.attrs[k]=String(v);}
  removeAttribute(k){delete this.attrs[k];}
  addEventListener(k,fn){(this.events[k]??=[]).push(fn);}
  fire(k,e={}){for(const fn of this.events[k]||[])fn({target:this,...e});}
  getBoundingClientRect(){return this.rect;}
  append(e){this.children.push(e);}
  replaceChildren(e){this.children=e.children;}
  closest(){return null;}
  contains(){return false;}
  focus(){this.focused=true;}
  querySelector(s){return this.selectors?.[s]||null;}
  scrollTo(o){this.scrollLeft=o.left;}
}

function boot({reduced=false, observer=false, compact=false, observerFails=false}={}) {
  const root=new Element(); root.scrollHeight=5000;
  const document=new Element(), window=new Element(), media=new Element(), compactMedia=new Element(); media.matches=reduced; compactMedia.matches=compact;
  const selectors={}; const get=s=>selectors[s]??=new Element();
  const ids={}; for(const id of ['past-points','new-points','learning-time','knowledge-toggle']) ids[id]=new Element(id);
  const study=get('.learning-study');
  get('.masthead').rect.height=88;get('.margin-column').rect.height=56;
  study.selectors={}; for(const s of ['.past-region','.new-region','.knowledge-trace','.study-status','[data-play-label]','.play-symbol','.study-controls']) study.selectors[s]=get(s);
  const chapters=['top','about','publications','work','certificates','service','contact'].map((id,i)=>{const e=new Element(id);e.rect={top:i*700,bottom:i*700+650,left:0};return e;});
  const links=chapters.map(c=>{const e=new Element();e.hash='#'+c.id;return e;});
  const reveal=new Element();reveal.rect.top=1200;
  document.documentElement=root; document.hidden=false;
  document.querySelector=s=>s==='.portrait-paper img'?null:get(s);
  document.querySelectorAll=s=>s==='main > section[id]'?chapters:s==='.contents a'?links:s==='.reveal'?[reveal]:[];
  document.getElementById=id=>ids[id]||null;
  document.createDocumentFragment=()=>new Element(); document.createElementNS=()=>new Element();
  const frames=new Map();let serial=0,clock=1;
  window.matchMedia=q=>q.includes('max-width')?compactMedia:media; window.innerHeight=900;window.innerWidth=compact?390:1200;window.scrollY=0;window.location={hash:''};
  window.requestAnimationFrame=fn=>{frames.set(++serial,fn);return serial;};window.cancelAnimationFrame=id=>frames.delete(id);
  const observers=[];
  class Observer{constructor(fn){if(observerFails)throw Error('Observer failed');this.fn=fn;this.targets=[];observers.push(this);}observe(e){this.targets.push(e);}unobserve(){}disconnect(){}}
  if(observer)window.IntersectionObserver=Observer;
  vm.runInNewContext(source,{window,document,localStorage:{setItem(){throw Error('storage denied');}},IntersectionObserver:Observer,Date,Math,Number,String});
  function step(count=1){for(let i=0;i<count;i++){const todo=[...frames.values()];frames.clear();clock+=80;todo.forEach(fn=>fn(clock));}}
  return {root,document,window,media,selectors,ids,chapters,links,reveal,observers,step,frames};
}

const a=boot();a.step();
assert.equal(a.selectors['[data-theme-label]'].textContent,'Day');
assert.equal(a.selectors['[data-theme-toggle]'].attrs['aria-label'],'Switch to night mode');
assert.equal(a.links[0].attrs['aria-current'],'location');
assert.equal(a.ids['past-points'].children.length,46);assert.equal(a.ids['new-points'].children.length,38);
assert.equal(a.selectors['.study-controls'].hidden,false);
assert(a.reveal.classList.contains('visible'));
a.selectors['[data-theme-toggle]'].fire('click');assert.equal(a.root.dataset.theme,'dark');
assert.equal(a.selectors['[data-theme-label]'].textContent,'Night');
assert.equal(a.selectors['[data-theme-toggle]'].attrs['aria-label'],'Switch to day mode');
a.selectors['[data-play]'].fire('click');const paused=a.ids['learning-time'].value;a.step(10);assert.equal(a.ids['learning-time'].value,paused);
a.ids['learning-time'].value='100';a.ids['learning-time'].fire('input');assert.equal(a.selectors['[data-play-label]'].textContent,'Restart');
a.ids['knowledge-toggle'].checked=false;a.ids['knowledge-toggle'].fire('change');
assert.equal(a.selectors['.past-region'].style.opacity,'0.180');assert(a.selectors['.study-status'].textContent.includes('can fade'));
a.ids['knowledge-toggle'].checked=true;a.ids['knowledge-toggle'].fire('change');assert.equal(a.selectors['.past-region'].style.opacity,'0.580');
a.selectors['[data-play]'].fire('click');a.step(240);assert.equal(a.ids['learning-time'].value,'100');assert.equal(a.selectors['[data-play-label]'].textContent,'Restart');
assert.equal(a.frames.size,0,'Animation stops at the end');
a.chapters.forEach((c,i)=>c.rect.top=(i-4)*700);a.window.fire('scroll');a.step();assert.equal(a.links[4].attrs['aria-current'],'location');
assert.equal(a.links[0].attrs['aria-current'],undefined);

const b=boot({reduced:true,observer:true});b.step(4);
assert.equal(b.selectors['[data-play-label]'].textContent,'Play');assert.equal(b.ids['learning-time'].value,'25');
assert(!b.root.classList.contains('motion-ready'));
b.selectors['[data-play]'].fire('click');b.step(5);assert(Number(b.ids['learning-time'].value)>25);
b.media.fire('change',{matches:true});const stopped=b.ids['learning-time'].value;b.step(5);assert.equal(b.ids['learning-time'].value,stopped);

const c=boot({observer:true});c.step(3);c.document.hidden=true;c.document.fire('visibilitychange');c.step(3);
const hidden=c.ids['learning-time'].value;c.step(5);assert.equal(c.ids['learning-time'].value,hidden);assert.equal(c.frames.size,0);
c.document.hidden=false;c.document.fire('visibilitychange');c.step(4);assert(Number(c.ids['learning-time'].value)>Number(hidden));
const studyObserver=c.observers.find(o=>o.targets.includes(c.selectors['.learning-study']));
studyObserver.fn([{isIntersecting:false}]);c.step(3);const offscreen=c.ids['learning-time'].value;c.step(5);assert.equal(c.ids['learning-time'].value,offscreen);
studyObserver.fn([{isIntersecting:true}]);c.step(4);assert(Number(c.ids['learning-time'].value)>Number(offscreen));
console.log('PASS: theme with blocked storage, navigation including certificates, play/pause/restart, slider, knowledge preservation, reduced motion, hidden-tab and offscreen suspension. DOM logic only; no rendering assertions.');

// Regressions in navigation geometry, bottom-of-page selection, and enhancement failures.
a.window.scrollY=4100;a.window.fire('scroll');a.step();assert.equal(a.links[6].attrs['aria-current'],'location');
const d=boot({compact:true,observer:true});d.step();assert.equal(d.root.style['--sticky-height'],'144px');
d.selectors['.masthead'].rect.height=112;d.window.fire('resize');d.step();assert.equal(d.root.style['--sticky-height'],'168px');
assert.equal(d.root.style['--masthead-height'],'112px');assert(!d.root.classList.contains('motion-ready'));
const revealObserver=d.observers.find(o=>o.targets.includes(d.reveal));let cancelled=false;
d.reveal.animate=()=>({cancel(){cancelled=true;}});revealObserver.fn([{target:d.reveal,isIntersecting:true}],revealObserver);
d.window.fire('beforeprint');assert(cancelled);
const e=boot({observer:true,observerFails:true});e.step();assert(e.reveal.classList.contains('visible'));assert(!e.root.classList.contains('motion-ready'));
e.selectors['[data-theme-toggle]'].fire('click');assert.equal(e.root.dataset.theme,'dark');
console.log('PASS: measured mobile offsets, header resizing, final-section selection, finite reveal cancellation, failed observer fallback, and page visibility without animations.');

// A tall viewport can reach the document bottom before Reviewing reaches the
// sticky header. Every chapter must still activate in order during slow scroll.
for (const height of [900, 1700, 2000]) {
  const page=boot({reduced:true,compact:height===900});
  const starts=[88,780,1680,2380,3030,3630,4280];
  page.window.innerHeight=height;
  page.root.scrollHeight=5000;
  const end=5000-height;
  const expected=page.chapters.map(chapter=>chapter.id);
  function position(y) {
    page.window.scrollY=y;
    page.chapters.forEach((chapter,i)=>{
      const bottom=starts[i+1]||4900;
      chapter.rect={top:starts[i]-y,bottom:bottom-y,height:bottom-starts[i],left:0};
    });
    page.window.fire('scroll');page.step();
    return page.links.find(link=>link.attrs['aria-current']==='location').hash.slice(1);
  }
  const down=[];
  for(let y=0;y<=end;y=Math.min(end,y+8)) {
    const active=position(y);if(down.at(-1)!==active)down.push(active);
    if(y===end)break;
  }
  assert.deepEqual(down,expected,`No skipped chapter at viewport height ${height}`);
  const up=[];
  for(let y=end;y>=0;y=Math.max(0,y-8)) {
    const active=position(y);if(up.at(-1)!==active)up.push(active);
    if(y===0)break;
  }
  assert.deepEqual(up,[...expected].reverse(),`Reverse order at viewport height ${height}`);
}
console.log('PASS: every section activates in both scroll directions at mobile, desktop, and tall/zoomed-out viewport heights.');

