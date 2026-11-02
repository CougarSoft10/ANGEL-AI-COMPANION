/* Curated selection from Rockstar's GTA VI media/video library, verified 1 November 2026.
   https://www.rockstargames.com/VI/media/videos
   Trailers 1/2 use browser-compatible H.264/AAC renditions of Rockstar's
   downloadable promotional videos in this private preview. Other videos
   stream from the publisher only after an explicit selection. */
(()=>{
 'use strict';
 const LIBRARY='https://www.rockstargames.com/VI/media/videos';
 const DOWNLOAD='https://media-rockstargames-com.akamaized.net/VI/downloads/videos/';
 const VIDEOS=[
  {id:'launch',title:'Launch Trailer',group:'trailers',date:'15 October 2026',src:DOWNLOAD+'GTAVI_Launch_Trailer/GTAVI_Launch_Trailer.mp4',page:'https://www.rockstargames.com/VI/launch-trailer'},
  {id:'extended',title:'An Extended Look',group:'trailers',date:'27 August 2026',ageGate:true,src:DOWNLOAD+'GTAVI_An_Extended_Look/GTAVI_An_Extended_Look.mp4',page:'https://www.rockstargames.com/VI/an-extended-look'},
  {id:'trailer2',title:'Trailer 2',group:'trailers',date:'6 May 2025',src:'assets/videos/trailer-2-browser.mp4',page:'https://www.rockstargames.com/VI/trailer-2'},
  {id:'trailer1',title:'Trailer 1',group:'trailers',date:'4 December 2023',src:'assets/videos/trailer-1-browser.mp4',page:'https://www.rockstargames.com/VI/trailer-1'},
  {id:'cover',title:'Official Cover Art Animation',group:'artwork',src:DOWNLOAD+'GTAVI_Official_Cover_Art_Landscape/GTAVI_Official_Cover_Art_Landscape.mp4'}
 ];
 const $=s=>document.querySelector(s);
 const label={trailers:'Trailer / feature',artwork:'Cover animation'};
 const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const poster=t=>`assets/videos/${t.id}.webp`;
 let filter='all',query='',current=null,player=null,adultConfirmed=false,token=0;
 let expanded=false,backgroundState=[];
 const screen=$('#video-screen'),fullscreenButton=$('#video-fullscreen');
 const nativeFullscreen=()=>document.fullscreenElement===screen||document.webkitFullscreenElement===screen||Boolean(player?.webkitDisplayingFullscreen);
 function syncFullscreen(){
  const active=expanded||nativeFullscreen();
  fullscreenButton.setAttribute('aria-pressed',String(active));
  fullscreenButton.textContent=active?'Exit fullscreen':'Fullscreen';
 }
 function leaveExpanded({focus=true}={}){
  if(!expanded)return;
  expanded=false;screen.classList.remove('is-expanded');$('.video-feature').classList.remove('is-watching');
  document.body.classList.remove('video-expanded');
  backgroundState.forEach(([element,inert])=>element.inert=inert);backgroundState=[];
  screen.removeAttribute('role');screen.removeAttribute('aria-modal');screen.removeAttribute('aria-label');
  syncFullscreen();
  if(player&&!player.error)$('#video-status').textContent='Returned to inline video. Your playback position is preserved.';
  if(focus&&player)fullscreenButton.focus({preventScroll:true});
 }
 function exitFullscreen({focus=true}={}){
  leaveExpanded({focus});
  if(document.fullscreenElement===screen)document.exitFullscreen().catch(()=>{});
  else if(document.webkitFullscreenElement===screen)document.webkitExitFullscreen?.();
  else if(player?.webkitDisplayingFullscreen)player.webkitExitFullscreen?.();
 }
 function expandPlayer(){
  if(!player)return;
  expanded=true;screen.classList.add('is-expanded');$('.video-feature').classList.add('is-watching');
  document.body.classList.add('video-expanded');
  screen.setAttribute('role','dialog');screen.setAttribute('aria-modal','true');screen.setAttribute('aria-label',`${current.title} expanded video player`);
  const background=document.querySelectorAll('.site-header,.hero,.map-chapter,.places,.screenshot-chapter,.shortlist,.about,.site-footer,.radio-lounge,.radio-dock,.video-chapter>.chapter-head,.video-note,#video-catalogue,.video-feature-copy,#video-browse');
  backgroundState=Array.from(background,element=>[element,element.inert]);
  background.forEach(element=>element.inert=true);
  $('#video-fullscreen-mode').textContent='Expanded preview';
  $('#video-status').textContent='Browser fullscreen is unavailable here. The expanded player fills this preview; use Exit expanded player or Escape to return.';
  $('#video-exit-fullscreen').textContent='Exit expanded player';
  $('#video-exit-fullscreen').focus({preventScroll:true});syncFullscreen();
 }
 async function enterFullscreen(){
  if(!player||fullscreenButton.disabled)return;
  if(expanded||nativeFullscreen()){exitFullscreen();return}
  const revision=token;
  $('#video-fullscreen-mode').textContent=current.title;
  $('#video-exit-fullscreen').textContent='Exit fullscreen';
  try{
   if(screen.requestFullscreen&&document.fullscreenEnabled)await screen.requestFullscreen();
   else if(screen.webkitRequestFullscreen&&document.webkitFullscreenEnabled)await screen.webkitRequestFullscreen();
   else if(player.webkitEnterFullscreen)player.webkitEnterFullscreen();
   else{expandPlayer();return}
   if(revision!==token){exitFullscreen({focus:false});return}
   syncFullscreen();
  }catch{if(revision===token)expandPlayer()}
 }
 fullscreenButton.onclick=enterFullscreen;
 for(const event of ['fullscreenchange','webkitfullscreenchange'])document.addEventListener(event,()=>{
  syncFullscreen();
  if(nativeFullscreen())$('#video-exit-fullscreen')?.focus({preventScroll:true});
  else if(player&&!expanded)fullscreenButton.focus({preventScroll:true});
 });
 document.addEventListener('keydown',event=>{
  if(event.key==='Escape'&&(expanded||nativeFullscreen())){event.preventDefault();exitFullscreen()}
 });
 document.addEventListener('focusin',event=>{
  if(expanded&&!screen.contains(event.target))$('#video-exit-fullscreen')?.focus({preventScroll:true});
 });
 const searchable=s=>s.normalize('NFKD').replace(/[\u0300-\u036f'’]/g,'').toLowerCase();
 function results(){return VIDEOS.filter(t=>(filter==='all'||t.group===filter)&&(!query||searchable(t.title+' '+label[t.group]).includes(searchable(query))))}
 function render(){
  const list=results();
  $('#video-clear').hidden=!query;
  $('#video-results').textContent=`${list.length} ${list.length===1?'video':'videos'}${query?' matching your search':''}. Select one to watch here.`;
  $('#video-grid').innerHTML=list.length?list.map(t=>`<button class="video-card" data-video="${t.id}" aria-pressed="${current?.id===t.id}" aria-label="Watch ${escape(t.title)} here"><span class="video-thumb"><img src="${poster(t)}" alt="" loading="lazy"><span class="video-play-word" aria-hidden="true">${current?.id===t.id?'Selected':'Watch'}</span></span><span class="video-card-copy"><strong>${escape(t.title)}</strong><span class="small">${escape(label[t.group])}${t.ageGate?' · 18+':''}${current?.id===t.id?' · Selected':''}</span></span></button>`).join(''):'<div class="video-empty"><h3>No footage found.</h3><p>Try a different name or clear your search.</p><button class="text-action" id="video-reset">Reset search</button></div>';
  document.querySelectorAll('[data-video]').forEach(b=>b.onclick=()=>choose(b.dataset.video));
  if($('#video-reset'))$('#video-reset').onclick=()=>{query='';$('#video-search').value='';render();$('#video-search').focus()};
 }
 function stop(){
  exitFullscreen({focus:false});fullscreenButton.disabled=true;
  token++;
  if(player){player.pause();player.removeAttribute('src');player.load();player=null}
  $('#video-screen').replaceChildren();
 }
 function showPoster(t){
  const image=document.createElement('img');image.src=poster(t);image.alt=`Rockstar's official ${t.title} poster`;
  $('#video-screen').replaceChildren(image);
 }
 function load(t){
  const revision=token;
  let pictureFailed=false;
  const video=document.createElement('video');player=video;
  video.controls=true;video.playsInline=true;video.preload='metadata';video.poster=poster(t);
  video.setAttribute('aria-label',`${t.title} official GTA VI video`);
  video.src=t.src;$('#video-screen').replaceChildren(video);
  const bar=document.createElement('div');bar.className='video-fullscreen-bar';
  const mode=document.createElement('span');mode.id='video-fullscreen-mode';mode.textContent=t.title;
  const exit=document.createElement('button');exit.id='video-exit-fullscreen';exit.type='button';exit.textContent='Exit fullscreen';exit.onclick=()=>exitFullscreen();
  bar.append(mode,exit);screen.append(bar);
  for(const event of ['webkitbeginfullscreen','webkitendfullscreen'])video.addEventListener(event,syncFullscreen);
  $('#video-status').textContent='Loading Rockstar’s official video source…';
  video.onloadedmetadata=()=>{if(revision===token){fullscreenButton.disabled=video.videoWidth===0;$('#video-status').textContent=video.videoWidth>0?'Video loaded. Use Fullscreen to watch larger, or the native controls for playback, seeking and volume.':'Checking the video format…'}};
  video.onplay=()=>{if(revision===token){window.dispatchEvent(new Event('vice-atlas:video-play'));$('#video-status').textContent='Starting the official video…'}};
  video.onplaying=()=>{if(revision===token&&video.videoWidth>0)$('#video-status').textContent='Playing here. Your radio is paused so the soundtracks do not overlap.'};
  video.ontimeupdate=()=>{
   if(revision===token&&video.currentTime>.5&&video.videoWidth===0){
    pictureFailed=true;
    fullscreenButton.disabled=true;
    video.pause();
    $('#video-status').textContent='This browser could not decode the picture, so audio-only playback has been stopped. Use the official page below or choose another video.';
   }
  };
  video.onpause=()=>{if(revision===token&&!video.ended&&!video.error&&!pictureFailed)$('#video-status').textContent='Video paused. Resume in the native controls whenever you’re ready.'};
  video.onended=()=>{if(revision===token)$('#video-status').textContent='Video finished. Replay or choose another official release.'};
  video.onerror=()=>{if(revision===token){fullscreenButton.disabled=true;$('#video-status').textContent='Rockstar’s video source could not play here. Use the official page below, or try another video. Provider availability and browser format support can vary.'}};
  video.play().catch(()=>{if(revision===token&&!video.error)$('#video-status').textContent='Your browser paused playback. Press Play in the video to start watching.'});
  video.focus({preventScroll:true});
 }
 function choose(id){
  const t=VIDEOS.find(t=>t.id===id);if(!t)return;
  if(current?.id===id&&player&&!player.error){
   const resuming=player;
   player.play().catch(()=>{if(player===resuming&&!resuming.error)$('#video-status').textContent='Press Play in the native controls to resume this video.'});
   player.focus({preventScroll:true});
   $('.video-feature').scrollIntoView({behavior:'instant',block:'start'});
   return;
  }
  stop();current=t;
  $('.video-feature').classList.add('has-selection');
  $('#video-current-title').textContent=t.title;
  $('#video-current-meta').textContent=`${label[t.group]} · Rockstar Games${t.date?' · '+t.date:''}`;
  $('#video-source').href=t.page||LIBRARY;$('#video-close').disabled=false;
  $('#video-launch').hidden=true;$('#video-age').hidden=true;render();
  if(t.ageGate&&!adultConfirmed){
   showPoster(t);$('#video-age').hidden=false;$('#video-adult').checked=false;$('#video-age-load').disabled=true;
   $('#video-status').textContent='Rockstar marks this feature as age-gated. Confirm you are 18 or older before loading it.';
   $('#video-age').scrollIntoView({behavior:'instant',block:'center'});$('#video-adult').focus({preventScroll:true});
   return;
  }
  load(t);
  $('.video-feature').scrollIntoView({behavior:'instant',block:'start'});
 }
 $('#video-launch').onclick=()=>choose('launch');
 $('#video-adult').onchange=e=>$('#video-age-load').disabled=!e.target.checked;
 $('#video-age-load').onclick=()=>{
  if(!$('#video-adult').checked||!current?.ageGate)return;
  adultConfirmed=true;$('#video-age').hidden=true;load(current);
 };
 $('#video-age-cancel').onclick=()=>reset();
 function browse(id=current?.id){
  if(player&&!player.paused)player.pause();
  const target=(id&&$(`[data-video="${id}"]`))||$('#video-search');
  target.focus({preventScroll:true});
  const tools=$('.video-tools'),headerBottom=$('.site-header').getBoundingClientRect().bottom;
  if(target===$('#video-search')){
   $('#video-catalogue').scrollIntoView({behavior:'instant',block:'start'});return;
  }
  const inset=headerBottom+(getComputedStyle(tools).position==='sticky'?tools.getBoundingClientRect().height:0)+12;
  const catalogueTop=scrollY+$('#video-catalogue').getBoundingClientRect().top-headerBottom;
  window.scrollTo({top:Math.max(catalogueTop,scrollY+target.getBoundingClientRect().top-inset),behavior:'instant'});
 }
 $('#video-browse').onclick=()=>browse();
 function reset(){
  const previous=current?.id;
  stop();current=null;$('.video-feature').classList.remove('has-selection');$('#video-age').hidden=true;$('#video-launch').hidden=false;$('#video-close').disabled=true;
  showPoster(VIDEOS[0]);$('#video-current-title').textContent='Launch Trailer';
  $('#video-current-meta').textContent='Rockstar Games · Select a video to load its official source.';
  $('#video-source').href=VIDEOS[0].page;$('#video-status').textContent='No video is loaded. Choose a release to watch without leaving Vice Atlas.';render();
  if(matchMedia('(max-width:800px)').matches)browse(previous);else $('#video-launch').focus({preventScroll:true});
 }
 $('#video-close').onclick=reset;
 document.querySelectorAll('[data-video-filter]').forEach(b=>b.onclick=()=>{
  filter=b.dataset.videoFilter;document.querySelectorAll('[data-video-filter]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));render();
 });
 $('#video-search').oninput=e=>{query=e.target.value.trim().toLowerCase();render()};
 $('#video-clear').onclick=()=>{query='';$('#video-search').value='';render();$('#video-search').focus()};
 window.addEventListener('vice-atlas:radio-play',()=>{if(player&&!player.paused)player.pause()});
 render();
})();
