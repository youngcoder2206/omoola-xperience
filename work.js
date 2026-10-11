(function(){
const grid=document.getElementById('work-grid');if(!grid)return;
const chips=document.getElementById('work-filters'),box=document.getElementById('lightbox'),stage=document.getElementById('lightbox-stage'),cap=document.getElementById('lightbox-cap');
const thumb=i=>i.type==='video'?i.url.replace('/upload/','/upload/so_0,f_jpg,w_700,h_700,c_fill,q_auto/').replace(/\.[a-z0-9]+$/i,'.jpg'):i.url.replace('/upload/','/upload/f_auto,q_auto,w_700,h_700,c_fill/');
const full=i=>i.url.replace('/upload/',i.type==='video'?'/upload/f_auto,q_auto/':'/upload/f_auto,q_auto,w_1600/');
let works=[],cat='All';
function render(){grid.innerHTML='';
 const list=works.filter(w=>cat==='All'||w.category===cat);
 list.forEach(w=>{const b=document.createElement('button');b.className='work-card';b.type='button';
  const img=document.createElement('img');img.src=thumb(w.items[0]);img.alt=w.title;img.loading='lazy';b.append(img);
  if(w.items[0].type==='video'){const p=document.createElement('span');p.className='work-play';p.textContent='▶';b.append(p)}
  if(w.items.length>1){const n=document.createElement('span');n.className='work-count';n.textContent='+'+(w.items.length-1);b.append(n)}
  const t=document.createElement('span');t.className='work-title';t.textContent=w.title;b.append(t);
  b.onclick=()=>open(w);grid.append(b)});
 if(!list.length)grid.innerHTML='<p class="fine-print">No work in this category yet.</p>'}
function open(w){stage.innerHTML='';
 w.items.forEach(i=>{let el;if(i.type==='video'){el=document.createElement('video');el.controls=true;el.playsInline=true;el.preload='metadata';el.src=full(i)}else{el=document.createElement('img');el.src=full(i);el.alt=w.title}stage.append(el)});
 cap.textContent=w.title+(w.caption?' — '+w.caption:'');box.showModal()}
function close(){box.close();stage.innerHTML=''}
document.getElementById('lightbox-close').onclick=close;box.addEventListener('click',e=>{if(e.target===box)close()});box.addEventListener('close',()=>{stage.innerHTML=''});
fetch('/api/works').then(r=>r.ok?r.json():[]).catch(()=>[]).then(d=>{works=d;
 if(!works.length){document.getElementById('work').hidden=true;document.querySelectorAll('a[href="#work"]').forEach(a=>a.hidden=true);return}
 ['All',...new Set(works.map(w=>w.category))].forEach(c=>{const b=document.createElement('button');b.type='button';b.textContent=c;b.className='chip'+(c==='All'?' on':'');
  b.onclick=()=>{cat=c;chips.querySelectorAll('.chip').forEach(x=>x.classList.toggle('on',x===b));render()};chips.append(b)});
 render()});
})();
