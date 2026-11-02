(()=>{
 'use strict';
 const items=window.VICE_SCREENSHOTS||[],find=s=>document.querySelector(s);
 const grid=find('#shot-grid'),dialog=find('#shot-dialog');
 let filter='all',limit=12,filtered=[],viewItems=[],index=0,trigger=null,request=0,overflow='',touch=null;
 function render(){
  const query=find('#shot-search').value.trim().toLowerCase();
  filtered=items.filter(item=>(filter==='all'||item.category===filter)&&`${item.title} ${item.subject} ${item.collection||''}`.toLowerCase().includes(query));
  const shown=filtered.slice(0,limit);
  grid.replaceChildren();
  shown.forEach(item=>{
   const button=document.createElement('button');button.type='button';button.className='shot-card';
   button.dataset.shot=item.id;button.setAttribute('aria-label',`View ${item.title} screenshot`);button.setAttribute('aria-haspopup','dialog');
   const thumb=document.createElement('span');thumb.className='shot-thumb';
   const image=document.createElement('img');image.src=item.thumb;image.alt=item.alt;image.loading='lazy';image.decoding='async';image.width=640;image.height=400;
   image.onerror=()=>{image.remove();const error=document.createElement('span');error.textContent='Image unavailable · Open to retry';thumb.append(error)};
   thumb.append(image);
   const caption=document.createElement('span');caption.className='shot-caption';
   const title=document.createElement('strong');title.textContent=item.title;
   const action=document.createElement('small');action.textContent='View image';
   caption.append(title,action);button.append(thumb,caption);
   button.onclick=()=>{trigger=button;viewItems=filtered.slice();index=viewItems.indexOf(item);overflow=document.body.style.overflow;dialog.showModal();document.body.style.overflow='hidden';paint()};
   grid.append(button);
  });
  find('#shot-empty').hidden=filtered.length>0;find('#shot-more').hidden=shown.length>=filtered.length;
  find('#shot-results').textContent=filtered.length?`Showing ${shown.length} of ${filtered.length} official images.`:'No screenshots match your search.';
  document.querySelectorAll('[data-shot-filter]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.shotFilter===filter)));
 }
 function paint(){
  const item=viewItems[index],id=++request;
  find('#shot-view-title').textContent=item.title;
  find('#shot-view-count').textContent=`${index+1} of ${viewItems.length}`;
  find('#shot-original').href=item.source;
  find('#shot-prev').disabled=find('#shot-next').disabled=viewItems.length<2;
  const box=find('#shot-image-box'),status=find('#shot-image-status');
  box.querySelector('img')?.remove();status.hidden=false;status.textContent='Loading image…';find('#shot-retry').hidden=true;
  const image=new Image();image.alt=item.alt;image.hidden=true;image.decoding='async';
  image.onload=async()=>{try{await image.decode()}catch{}if(id!==request)return;image.hidden=false;status.hidden=true};
  image.onerror=()=>{if(id!==request)return;status.textContent='This image could not load. Retry or use View Rockstar original.';find('#shot-retry').hidden=false};
  box.append(image);image.src=item.image;
 }
 function move(step){if(!dialog.open||viewItems.length<2)return;index=(index+step+viewItems.length)%viewItems.length;paint()}
 function close(){if(dialog.open)dialog.close()}
 document.querySelectorAll('[data-shot-filter]').forEach(button=>{
  const count=button.dataset.shotFilter==='all'?items.length:items.filter(item=>item.category===button.dataset.shotFilter).length;
  button.textContent=`${button.dataset.shotLabel} ${count}`;
  button.onclick=()=>{filter=button.dataset.shotFilter;limit=12;render()};
 });
 find('#shot-search').oninput=()=>{limit=12;render()};
 find('#shot-reset').onclick=()=>{filter='all';limit=12;find('#shot-search').value='';render();find('#shot-search').focus()};
 find('#shot-more').onclick=()=>{const count=Math.min(limit,filtered.length);limit+=12;render();grid.children[count]?.focus()};
 find('#shot-close').onclick=close;find('#shot-prev').onclick=()=>move(-1);find('#shot-next').onclick=()=>move(1);find('#shot-retry').onclick=paint;
 dialog.addEventListener('cancel',event=>{event.preventDefault();close()});
 dialog.addEventListener('close',()=>{request++;touch=null;document.body.style.overflow=overflow;trigger?.isConnected&&trigger.focus()});
 dialog.addEventListener('keydown',event=>{
  if(event.key==='ArrowLeft'){event.preventDefault();move(-1)}
  if(event.key==='ArrowRight'){event.preventDefault();move(1)}
  if(event.key==='Tab'){
   const controls=Array.from(dialog.querySelectorAll('button:not([disabled]):not([hidden]),a[href]')).filter(element=>element.getClientRects().length);
   const first=controls[0],last=controls[controls.length-1];
   if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus()}
   else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus()}
  }
 });
 dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)close()}});
 find('#shot-image-box').addEventListener('touchstart',event=>{touch=event.touches.length===1?{x:event.touches[0].clientX,y:event.touches[0].clientY}:null},{passive:true});
 find('#shot-image-box').addEventListener('touchend',event=>{if(!touch)return;const end=event.changedTouches[0],dx=end.clientX-touch.x,dy=end.clientY-touch.y;touch=null;if(Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy)*1.5)move(dx<0?1:-1)},{passive:true});
 render();
})();
