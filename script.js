const WA='https://wa.me/message/K52JZXEUA63YB1';
const FALLBACK={'Pinterest Frames':'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=600&q=75','Wall Collages':'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=600&q=75','Regular Photo Frames':'https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&w=600&q=75'};
const SECTION={'Pinterest Frames':'pinterest','Wall Collages':'collages','Regular Photo Frames':'regular'};
const naira=n=>'₦'+Number(n).toLocaleString('en-NG');
const thumb=i=>i.type==='video'?i.url.replace('/upload/','/upload/so_0,f_jpg,w_600,h_600,c_fill,q_auto/').replace(/\.[a-z0-9]+$/i,'.jpg'):i.url.replace('/upload/','/upload/f_auto,q_auto,w_600,h_600,c_fill/');
const fullUrl=i=>i.url.replace('/upload/',i.type==='video'?'/upload/f_auto,q_auto/':'/upload/f_auto,q_auto,w_1200/');
const cover=p=>p.items&&p.items.length?thumb(p.items[0]):FALLBACK[p.category];
const priced=p=>p.variants.filter(v=>v.price!==null).map(v=>v.price);
function priceText(p){const a=priced(p);if(!a.length)return 'Ask for price';const lo=Math.min(...a);return (a.length>1&&Math.max(...a)!==lo?'From ':'')+naira(lo)}
let products=[];
function el(t,c,x){const e=document.createElement(t);if(c)e.className=c;if(x!==undefined)e.textContent=x;return e}
function render(q=''){
 q=q.trim().toLowerCase();let any=false;
 document.querySelectorAll('.grid[data-cat]').forEach(g=>{
  g.innerHTML='';const c=g.dataset.cat;
  const list=products.filter(p=>SECTION[p.category]===c&&(!q||(p.name+' '+p.description+' '+p.category+' '+p.variants.map(v=>v.size+' '+(v.price??'')).join(' ')).toLowerCase().includes(q)));
  list.forEach(p=>{
   const a=el('article','card'+(p.inStock?'':' oos'));a.tabIndex=0;
   const w=el('div','card-img');const im=el('img');im.src=cover(p);im.alt=p.name;im.loading='lazy';w.append(im);
   if(p.badge)w.append(el('span','badge',p.badge));if(!p.inStock)w.append(el('span','soldout','Sold out'));
   const sizes=p.variants.map(v=>v.size).filter(Boolean);
   const b=el('button','', p.inStock?'View & order':'View details');b.type='button';
   a.append(w,el('h3','',p.name),el('p','size',sizes.length>1?sizes.length+' sizes available':(sizes[0]||'')),el('p','price',priceText(p)),b);
   const open=()=>detail(p);a.onclick=open;a.onkeydown=e=>{if(e.key==='Enter')open()};
   g.append(a)});
  g.parentElement.hidden=!list.length;if(list.length)any=true;
 });
 document.getElementById('none').hidden=any;
}
const dlg=document.getElementById('pdialog'),dbody=document.getElementById('pbody');
function detail(p){
 dbody.innerHTML='';
 const gal=el('div','pgal');const main=el('div','pmain');
 const showItem=i=>{main.innerHTML='';if(!i){const im=el('img');im.src=FALLBACK[p.category];im.alt=p.name;main.append(im);return}
  if(i.type==='video'){const v=el('video');v.controls=true;v.playsInline=true;v.preload='metadata';v.src=fullUrl(i);main.append(v)}else{const im=el('img');im.src=fullUrl(i);im.alt=p.name;main.append(im)}};
 showItem(p.items[0]);gal.append(main);
 if(p.items.length>1){const tr=el('div','pthumbs');p.items.forEach(i=>{const t=el('img');t.src=thumb(i);t.alt='';t.onclick=()=>showItem(i);tr.append(t)});gal.append(tr)}
 const info=el('div','pinfo');
 info.append(el('p','pcat',p.category),el('h2','',p.name));
 if(p.badge)info.append(el('span','badge inline',p.badge));
 const price=el('p','pprice');let sel=null;
 if(p.variants.length>1){const l=el('label','','Choose size');sel=el('select');p.variants.forEach((v,i)=>{const o=el('option','',v.size+(v.price!==null?' — '+naira(v.price):' — ask for price'));o.value=i;sel.append(o)});info.append(price,l,sel)}else info.append(price);
 const cur=()=>p.variants[sel?Number(sel.value):0];
 const upd=()=>{const v=cur();price.textContent=v.price!==null?naira(v.price):'Ask for price'+(v.size&&!sel?' · '+v.size:'')+'';if(!sel&&v.price!==null&&v.size)price.textContent=naira(v.price)+' · '+v.size};
 if(sel)sel.onchange=upd;upd();
 if(p.description)info.append(el('p','pdesc',p.description));
 const ob=el('button','btn wa',p.inStock?'Order on WhatsApp':'Ask about availability');ob.type='button';
 ob.onclick=()=>{const v=cur();const line=`${p.name}${v.size?', '+v.size:''}${v.price!==null?' ('+naira(v.price)+')':''}`;
  const msg=p.inStock?`Hello OMOOLA XPERIENCE! I'd like to order: ${line}. Please confirm availability, delivery and payment details.`:`Hello OMOOLA XPERIENCE! Is this available again: ${line}?`;
  window.open(`${WA}?text=${encodeURIComponent(msg)}`,'_blank','noopener')};
 info.append(ob,el('p','pnote','We confirm the total, delivery and payment with you on WhatsApp.'));
 dbody.append(gal,info);dlg.showModal();
}
const closeP=()=>{dlg.close();dbody.innerHTML=''};
document.getElementById('pclose').onclick=closeP;dlg.addEventListener('click',e=>{if(e.target===dlg)closeP()});dlg.addEventListener('close',()=>{dbody.innerHTML=''});
products=window.OX_DEFAULTS;render();
fetch('/api/products').then(r=>r.ok?r.json():[]).catch(()=>[]).then(d=>{if(Array.isArray(d)&&d.length){products=d;render(document.getElementById('q').value)}});
const form=document.getElementById('search'),qi=document.getElementById('q');
form.addEventListener('submit',e=>{e.preventDefault();render(qi.value);document.getElementById('pinterest').scrollIntoView({behavior:'smooth'})});
qi.addEventListener('input',()=>render(qi.value));
document.getElementById('year').textContent=new Date().getFullYear();
