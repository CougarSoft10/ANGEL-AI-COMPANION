const PLACES=[
 {id:'vice',name:'Vice City',image:'city',alt:'Vice City’s waterfront and high-rises in official GTA VI imagery',description:'The coastal metropolis: beaches, high-rises and a commercial waterfront. Start with the skyline, then look beyond the postcard.',tag:'Coast & city'},
 {id:'keys',name:'Leonida Keys',image:'keys',alt:'The tropical islands and water of the Leonida Keys in official GTA VI imagery',description:'A tropical archipelago with islands and open water. The landscape trades Vice City’s towers for a lower, saltwater horizon.',tag:'Islands & open water'},
 {id:'grassrivers',name:'Grassrivers',image:'swamp',alt:'Mangroves and shallow wetland waterways in official GTA VI imagery',description:'Mangroves, wetlands and shallow waterways. The city’s hard edges give way to a landscape shaped by water.',tag:'Wetlands & waterways'},
 {id:'gellhorn',name:'Port Gellhorn',image:'port',alt:'The faded roadside landscape of Port Gellhorn in official GTA VI imagery',description:'A faded holiday destination of motels, shuttered attractions and empty strip malls. A different side of the sunshine-state postcard.',tag:'Faded holiday coast'},
 {id:'ambrosia',name:'Ambrosia',image:'ambrosia',alt:'Ambrosia and its industrial setting in official GTA VI imagery',description:'A town shaped by sugar production and refinery industry. Here the working landscape takes the foreground.',tag:'Sugar & industry'},
 {id:'kalaga',name:'Mount Kalaga',image:'kalaga',alt:'Wooded ridges of Mount Kalaga National Park in official GTA VI imagery',description:'Mount Kalaga National Park sits in the northern wilderness, with wooded ridges and backwoods far from Vice City’s skyline.',tag:'Ridges & backwoods'}
];
const REGION_SOURCE='https://consolepulse.com/multiplatform/gta/guides/gta-6-vice-city-leonida-locations-guide';
const MAP_URL='https://map.stateofleonida.net/en/';
const RESTRICTED_PREVIEW=window.origin==='null';
const PREVIEW_MAP_NOTICE='This private preview blocks storage required by the map provider. Use Open original map, or publish Vice Atlas to a standalone address for in-page viewing.';
const $=s=>document.querySelector(s);
const escapeHTML=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let activePlace='vice',saved=[],note='',mapLoaded=false,mapExpanded=false,mapTimer,toastTimer,previousFocus;
function notify(message){$('#toast').textContent=message;$('#toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),2600)}
function selectPlace(id,{notifySelection=false}={}){
 const p=PLACES.find(p=>p.id===id);if(!p)return;
 activePlace=id;
 $('#place-image').src=`assets/${p.image}.webp`;$('#place-image').alt=p.alt;
 $('#place-name').textContent=p.name;$('#place-description').textContent=p.description;
 document.querySelectorAll('[data-place]').forEach(b=>{const selected=b.dataset.place===id;b.classList.toggle('selected',selected);b.setAttribute('aria-pressed',String(selected))});
 updateSaveButton();
 if(!matchMedia('(prefers-reduced-motion: reduce)').matches)$('#place-image').animate([{opacity:.6},{opacity:1}],{duration:350,easing:'ease-out'});
 if(notifySelection)notify(`Your detour: ${p.name}.`);
}
function updateSaveButton(){
 const has=saved.includes(activePlace);
 $('#save-place').setAttribute('aria-pressed',String(has));
 $('#save-place').textContent=has?'Saved. Remove place':'Save this place +';
}
function filterPlaces(){
 const query=$('#place-search').value.trim().toLowerCase();let visible=0;
 document.querySelectorAll('[data-place]').forEach(b=>{b.hidden=!b.textContent.toLowerCase().includes(query);if(!b.hidden)visible++});
 $('#place-empty').hidden=visible>0;
}
document.querySelectorAll('[data-place]').forEach(b=>b.onclick=()=>selectPlace(b.dataset.place));
$('#place-search').oninput=filterPlaces;
$('#reset-search').onclick=()=>{$('#place-search').value='';filterPlaces();$('#place-search').focus()};
$('#surprise-place').onclick=()=>{
 $('#place-search').value='';filterPlaces();
 const choices=PLACES.filter(p=>p.id!==activePlace);
 selectPlace(choices[Math.floor(Math.random()*choices.length)].id,{notifySelection:true});
};
$('#save-place').onclick=()=>{
 const p=PLACES.find(p=>p.id===activePlace);
 if(saved.includes(activePlace)){saved=saved.filter(id=>id!==activePlace);notify(`${p.name} removed.`)}
 else{saved.push(activePlace);notify(`${p.name} saved to your shortlist.`)}
 renderSaved();updateSaveButton();
};
function renderSaved(){
 $('#nav-count').textContent=`(${saved.length})`;
 $('#clear-list').disabled=!saved.length;$('#export-list').disabled=!saved.length;
 $('#list-feedback').textContent=saved.length?`${saved.length} saved ${saved.length===1?'place':'places'}. Your export follows this order.`:'Save a region above to get started.';
 $('#saved-list').innerHTML=saved.length?saved.map((id,i)=>{
  const p=PLACES.find(p=>p.id===id);
  return `<article class="saved-item"><div><h3>${escapeHTML(p.name)}</h3><p>${escapeHTML(p.tag)}</p></div><div class="saved-item-actions"><button data-move="${id}" data-direction="-1" ${i===0?'disabled':''} aria-label="Move ${escapeHTML(p.name)} up">Up</button><button data-move="${id}" data-direction="1" ${i===saved.length-1?'disabled':''} aria-label="Move ${escapeHTML(p.name)} down">Down</button><button data-remove="${id}" aria-label="Remove ${escapeHTML(p.name)}">Remove</button></div></article>`;
 }).join(''):'<div class="list-empty"><p>No stops.<br>Not yet.</p><a href="#places" class="button primary">Find a place</a></div>';
 document.querySelectorAll('[data-remove]').forEach(b=>b.onclick=()=>{
  const name=PLACES.find(p=>p.id===b.dataset.remove).name;
  saved=saved.filter(id=>id!==b.dataset.remove);renderSaved();updateSaveButton();notify(`${name} removed.`);
 });
 document.querySelectorAll('[data-move]').forEach(b=>b.onclick=()=>{
  const index=saved.indexOf(b.dataset.move),next=index+Number(b.dataset.direction);
  if(index<0||next<0||next>=saved.length)return;
  [saved[index],saved[next]]=[saved[next],saved[index]];renderSaved();
  $(`[data-move="${saved[next]}"][data-direction="${b.dataset.direction}"]`)?.focus();
 });
}
$('#clear-list').onclick=()=>{saved=[];renderSaved();updateSaveButton();notify('Shortlist cleared. Your note is kept.')};
$('#trip-note').value=note;
$('#trip-note').oninput=e=>{note=e.target.value.slice(0,600)};
$('#export-list').onclick=()=>{
 if(!saved.length)return;
 const text=['VICE ATLAS','Your Leonida shortlist','',
  ...saved.map((id,i)=>{const p=PLACES.find(p=>p.id===id);return `${i+1}. ${p.name}\n${p.description}\n${REGION_SOURCE}\n`}),
  'Your note:',note||'(No note)','',
  'A personal wishlist, not a driving route. Separate from the community map.',
  `Community map: ${MAP_URL}`,'GTA VI: https://www.rockstargames.com/VI'
 ].join('\n');
 const url=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'}));
 const link=document.createElement('a');link.href=url;link.download='vice-atlas-shortlist.txt';document.body.append(link);link.click();link.remove();
 setTimeout(()=>URL.revokeObjectURL(url),30000);
 $('#list-feedback').textContent='Your shortlist text file is ready. Check your browser’s downloads.';
};
function setMapStatus(message){$('#map-status').textContent=message}
$('#copy-map').onclick=async()=>{
 try{await navigator.clipboard.writeText(MAP_URL);notify('Map address copied.')}
 catch{const range=document.createRange();range.selectNodeContents($('#map-address'));const selection=getSelection();selection.removeAllRanges();selection.addRange(range);notify('Address selected. Copy it manually if copying is blocked.')}
};
function loadMap({reload=false}={}){
 if(RESTRICTED_PREVIEW){setMapStatus(PREVIEW_MAP_NOTICE);notify('The embedded map needs a standalone site address.');return}
 if(mapLoaded&&!reload)return;
 clearTimeout(mapTimer);
 $('#map-stage iframe')?.remove();
 $('#map-invitation').hidden=true;
 const frame=document.createElement('iframe');
 frame.id='leonida-map';frame.title='State of Leonida interactive GTA VI community map';
 frame.src=MAP_URL;
 frame.allow='fullscreen';
 frame.allowFullscreen=true;
 frame.referrerPolicy='strict-origin-when-cross-origin';
 frame.setAttribute('sandbox','allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-forms allow-downloads');
 frame.onload=()=>{setMapStatus('Map frame opened. Its own loading screen may take a moment.');clearTimeout(mapTimer)};
 frame.onerror=()=>{setMapStatus('The map could not load here. Try Reload or Open original map.');clearTimeout(mapTimer)};
 $('#map-stage').append(frame);mapLoaded=true;
 ['expand-map','reload-map','unload-map'].forEach(id=>$('#'+id).disabled=false);
 setMapStatus('Opening the State of Leonida map…');
 mapTimer=setTimeout(()=>setMapStatus('Still waiting? Try Reload or use Open original map. The provider controls availability.'),18000);
}
function setExpanded(expanded){
 if(expanded&&!mapLoaded)return;
 mapExpanded=expanded;
 const shell=$('#map-shell');
 shell.classList.toggle('is-expanded',expanded);
 document.body.classList.toggle('map-expanded',expanded);
 $('#expand-map').textContent=expanded?'Return to site':'Expand map';
 $('#expand-map').setAttribute('aria-expanded',String(expanded));
 shell.setAttribute('role',expanded?'dialog':'region');
 if(expanded)shell.setAttribute('aria-modal','true');else shell.removeAttribute('aria-modal');
 document.querySelectorAll('.site-header,.hero,.places,.video-chapter,.screenshot-chapter,.radio-lounge,.radio-dock,.shortlist,.about,.site-footer,.map-chapter>.chapter-head,.map-credit').forEach(el=>el.inert=expanded);
 if(expanded){previousFocus=document.activeElement;$('#expand-map').focus()}else previousFocus?.focus();
}
$('#load-map').onclick=()=>loadMap();
$('#reload-map').onclick=()=>loadMap({reload:true});
$('#expand-map').onclick=()=>setExpanded(!mapExpanded);
$('#unload-map').onclick=()=>{
 if(mapExpanded)setExpanded(false);
 clearTimeout(mapTimer);$('#map-stage iframe')?.remove();mapLoaded=false;
 $('#map-invitation').hidden=false;
 ['expand-map','reload-map','unload-map'].forEach(id=>$('#'+id).disabled=true);
 setMapStatus('Map unloaded. Load it again whenever you’re ready.');
 $('#load-map').focus();
};
function setMenu(open){
 $('#navigation').classList.toggle('open',open);$('#menu-toggle').setAttribute('aria-expanded',String(open));$('#menu-toggle').textContent=open?'Close':'Menu';
}
$('#menu-toggle').onclick=()=>setMenu($('#menu-toggle').getAttribute('aria-expanded')!=='true');
document.querySelectorAll('#navigation a').forEach(a=>a.onclick=()=>setMenu(false));
document.addEventListener('keydown',e=>{
 if(mapExpanded&&e.key==='Tab'){
  const first=$('#map-shell .map-owner'),last=$('#map-shell .map-foot a');
  if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
  else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
 }
 if(e.key==='Escape'){if(mapExpanded)setExpanded(false);if($('#menu-toggle').getAttribute('aria-expanded')==='true')$('#menu-toggle').focus();setMenu(false)}
});
const toneColors={dark:['var(--ink)','var(--paper)'],navy:['var(--field-navy)','var(--paper)'],forest:['var(--field-forest)','var(--paper)'],plum:['var(--field-plum)','var(--paper)']};
const header=$('.site-header');
function updateHeader(){
 const below=document.elementFromPoint(innerWidth/2,Math.min(innerHeight-1,Math.ceil(header.getBoundingClientRect().bottom)+24))?.closest('[data-tone]');
 const tone=toneColors[below?.dataset.tone]||toneColors.dark;
 header.style.background=tone[0];header.style.color=tone[1];
}
let scrollQueued=false;
addEventListener('scroll',()=>{if(scrollQueued)return;scrollQueued=true;requestAnimationFrame(()=>{updateHeader();scrollQueued=false})},{passive:true});
addEventListener('resize',()=>{updateHeader();if(innerWidth>700)setMenu(false)});
if('IntersectionObserver' in window){
 const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target)}}),{threshold:.12});
 document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
}
if(RESTRICTED_PREVIEW){
 $('#map-invite-description').textContent='This private preview cannot run the map. A standalone site address is needed for in-page browsing.';
 $('#load-map').textContent='Map needs standalone site';
 setMapStatus(PREVIEW_MAP_NOTICE);
}
renderSaved();updateSaveButton();updateHeader();
