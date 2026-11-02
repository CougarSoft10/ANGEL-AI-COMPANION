/* User-supplied audio for Getaway FM, The Album and The Score; official station previews. */
(()=>{
 'use strict';
 const HUB='https://www.rockstargames.com/VI/music';
 const TRACKS=[
  {id:'combat',name:'Combat Music V2',artist:'Getaway FM · Uploaded audio',group:'uploads',local:'assets/audio/combat-music-v2.mp3',length:'1:46'},
  {id:'raul',name:'Raul Bautista Music',artist:'Getaway FM · Uploaded audio',group:'uploads',local:'assets/audio/raul-bautista-music.mp3',length:'3:02'},
  {id:'megamundo',name:'Megamundo Heist Music',artist:'Getaway FM · Uploaded audio',group:'uploads',local:'assets/audio/megamundo-heist-music-v2.mp3',length:'2:29'},
  {id:'thatsit',name:'That’s It',artist:'Yung Lean feat. Future & Metro Boomin',group:'album',local:'assets/audio/album-thats-it.mp3',length:'2:41',source:'https://gtavi-thealbum.lnk.to/thatsit'},
  {id:'rhyno',name:'RHYNO',artist:'Travis Scott',group:'album',local:'assets/audio/album-rhyno.mp3',length:'3:00',source:'https://gtavi-thealbum.lnk.to/rhyno'},
  {id:'sexymagic',name:'Sexy Magic',artist:'CA7RIEL & Paco Amoroso, PinkPantheress, Fred again.. & Etienne de Crécy',group:'album',local:'assets/audio/album-sexy-magic.mp3',length:'3:15',source:'https://gtavi-thealbum.lnk.to/sexymagic'},
  {id:'lastthing',name:'Last Thing You Need',artist:'Morgan Wallen',group:'album',local:'assets/audio/album-last-thing-you-need.mp3',length:'3:16',source:'https://gtavi-thealbum.lnk.to/lastthingyouneed'},
  {id:'suzuki',name:'Suzuki',artist:'Fuerza Regida',group:'album',local:'assets/audio/album-suzuki.mp3',length:'1:51',source:'https://gtavi-thealbum.lnk.to/suzuki'},
  {id:'macacoa',name:'Macacoa 2000',artist:'Rauw Alejandro',group:'album',local:'assets/audio/album-macacoa-2000.mp3',length:'2:53',source:'https://gtavi-thealbum.lnk.to/macacoa2000'},
  {id:'dontchart',name:'Don’t Chart',artist:'Cardi B',group:'album',local:'assets/audio/album-dont-chart.mp3',length:'2:44',source:'https://gtavi-thealbum.lnk.to/dontchart'},
  {id:'brightlights',name:'Bright Lights, Big City',artist:'Keith Richards',group:'album',local:'assets/audio/album-bright-lights-big-city.mp3',length:'3:30',source:'https://gtavi-thealbum.lnk.to/brightlightsbigcity'},
  {id:'flower',name:'Flower In A Hurricane',artist:'Justice feat. Tame Impala, SZA, King Gizzard & the Lizard Wizard',group:'score',local:'assets/audio/score-flower-in-a-hurricane.mp3',length:'3:44',source:'https://justice.lnk.to/flowerinahurricane'},
  {id:'pusher',name:'Pusher',artist:'Justice feat. Gesaffelstein',group:'score',local:'assets/audio/score-pusher.mp3',length:'7:02',source:'https://justice.lnk.to/pusher'},
  {id:'cocoteo',name:'Cocoteo FM',artist:'Official promotional station preview',group:'stations',file:'CocoTeo FM.0n-4zp0t4l~if.mp3'},
  {id:'country',name:'Back Country Radio',artist:'Official promotional station preview',group:'stations',file:'Back Country Radio.08cmgjn3.p-j_.mp3'},
  {id:'afrobank',name:'AfroBank FM',artist:'Official promotional station preview',group:'stations',file:'Afrobank.0rtmh0bm33.ky.mp3'},
  {id:'chamber',name:'The Chamber',artist:'Official promotional station preview',group:'stations',file:'The Chamber 106.6.11_iey2p6kb55.mp3'},
  {id:'flash',name:'Flash FM',artist:'Official promotional station preview',group:'stations',file:'Flash FM.059xksp1t-k7h.mp3'},
  {id:'dirty',name:'Dirty South Classics',artist:'Official promotional station preview',group:'stations',file:'Dirty South Classics.11o18zry-5mp7.mp3'}
 ];
 const $=s=>document.querySelector(s);
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const time=ms=>{const s=Math.max(0,Math.floor(ms/1000));return `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`};
 const artwork=t=>t.group==='uploads'?'assets/getaway-cover.jpg':`assets/${t.group==='stations'?'station':'music'}-${t.id}.webp`;
 let collection='uploads',query='',current=null,controller=null,audio=null,revision=0,sdkPromise=null,sdk=null,hintTimer;
 let ready=false,paused=true,finished=false,position=0,duration=0;
 const status=message=>{$('#radio-status').textContent=message};
 // Each track appears only in its assigned collection.
 const matches=()=>TRACKS.filter(t=>t.group===collection&&(!query||(t.name+' '+t.artist).toLowerCase().includes(query)));
 function render(){
  const list=matches();
  $('#radio-results').textContent=`${list.length} ${collection==='uploads'?'uploaded tracks':collection==='stations'?(list.length===1?'station preview':'station previews'):(list.length===1?'release':'releases')}${query?' matching your search':''}. ${collection==='uploads'?'Full uploaded files. Choose a track to start listening here.':collection==='album'?'All eight Album tracks use your full uploaded files.':collection==='score'?'Both Score tracks use your full uploaded files.':'Choose one to listen here.'}`;
  $('#radio-tracks').innerHTML=list.length?list.map(t=>`<button class="lounge-track" data-tune="${t.id}" aria-pressed="${current?.id===t.id}" aria-label="Listen to ${esc(t.name)} here"><img src="${artwork(t)}" alt="" loading="lazy"><span><strong>${esc(t.name)}</strong><span class="track-artist">${esc(t.artist)}${t.length?' · '+t.length:''}${t.local&&t.group!=='uploads'?' · Uploaded audio':''}</span></span><span class="track-action" aria-hidden="true">Play</span></button>`).join(''):'<div class="lounge-empty"><h3>No match.</h3><p>Try a different name or clear the search.</p><button id="radio-reset" class="text-action">Clear music search</button></div>';
  document.querySelectorAll('[data-tune]').forEach(b=>b.onclick=()=>choose(b.dataset.tune));
  if($('#radio-reset'))$('#radio-reset').onclick=()=>{query='';$('#radio-search').value='';render();$('#radio-search').focus()};
 }
 function sync(){
  $('#radio-toggle').disabled=!ready;
  $('#radio-toggle').textContent=finished?'Replay':paused?'Play':'Pause';
  $('#radio-clock').textContent=`${time(position)}${duration?' / '+time(duration):''}`;
  $('#radio-progress').max=duration||1;$('#radio-progress').value=Math.min(position,duration||1);
  const seek=$('#radio-seek');
  seek.disabled=!ready||!audio||duration<=0;
  seek.max=duration>0?String(duration/1000):'1';
  seek.value=String(Math.min(position,duration||1)/1000);
  seek.setAttribute('aria-valuetext',`${time(position)} of ${time(duration)}`);
  seek.style.setProperty('--seek-percent',`${duration>0?Math.min(100,position/duration*100):0}%`);
 }
 function dispose(){
  revision++;clearTimeout(hintTimer);
  if(audio){audio.pause();audio.removeAttribute('src');audio.load();audio=null}
  if(controller){try{controller.pause();controller.destroy()}catch{}controller=null}
  $('#radio-player').replaceChildren();
  ready=false;paused=true;finished=false;position=0;duration=0;
 }
 function nativeFallback(t){
  const frame=document.createElement('iframe');
  frame.title=`${t.name} — official Spotify player`;
  frame.src=`https://open.spotify.com/embed/${t.spotifyType||'track'}/${t.spotify}?utm_source=generator`;
  frame.allow='autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture';
  frame.referrerPolicy='strict-origin-when-cross-origin';
  $('#radio-player').replaceChildren(frame);
  status('Use the official player’s Play control above. Available playback stays on this page.');
  $('#radio-toggle').disabled=true;$('#radio-toggle').textContent='Use player';
 }
 function spotifyAPI(){
  if(sdk)return Promise.resolve(sdk);
  if(sdkPromise)return sdkPromise;
  sdkPromise=new Promise((resolve,reject)=>{
   const timer=setTimeout(()=>reject(new Error('Spotify player API timed out')),12000);
   window.onSpotifyIframeApiReady=api=>{clearTimeout(timer);sdk=api;resolve(api)};
   $('#atlas-spotify-api')?.remove();
   const script=document.createElement('script');script.id='atlas-spotify-api';script.async=true;
   script.src='https://open.spotify.com/embed/iframe-api/v1';
   script.onerror=()=>{clearTimeout(timer);reject(new Error('Spotify player API unavailable'))};
   document.body.append(script);
  }).catch(error=>{sdkPromise=null;throw error});
  return sdkPromise;
 }
 async function spotify(t,token){
  if(window.origin==='null'){
   const message=document.createElement('p');
   message.textContent='Spotify audio is blocked by this private preview. This track has no uploaded file. The eight uploaded Album tracks, Getaway FM and Rockstar radio previews remain playable here.';
   $('#radio-player').append(message);status('Private preview limitation: Spotify playback is unavailable here.');
   $('#radio-toggle').disabled=true;$('#radio-toggle').textContent='Preview blocked';return;
  }
  try{
   const api=await spotifyAPI();if(token!==revision)return;
   const mount=document.createElement('div');$('#radio-player').append(mount);
   hintTimer=setTimeout(()=>{if(token===revision&&!ready)status('The provider is still loading. If its controls appear, use its native Play button.')},12000);
   api.createController(mount,{uri:`spotify:${t.spotifyType||'track'}:${t.spotify}`,width:'100%',height:152},c=>{
    if(token!==revision){try{c.destroy()}catch{}return}
    controller=c;
    const frame=$('#radio-player iframe');if(frame)frame.title=`${t.name} — official Spotify player`;
    c.addListener('ready',()=>{
     if(token!==revision)return;clearTimeout(hintTimer);ready=true;sync();
     status('Player ready. Starting available playback; press Play if your browser pauses it.');
     c.play();
     hintTimer=setTimeout(()=>{if(token===revision&&position===0)status('Press Play below or use the official player above. Guest playback may be a short preview.')},4500);
    });
    c.addListener('playback_update',event=>{
     if(token!==revision)return;
     const s=event.data;ready=true;paused=s.isPaused;position=Number(s.position)||0;duration=Number(s.duration)||0;
     finished=duration>0&&position>=duration-80;
     sync();
     status(finished?'Preview finished. Replay or choose another selection.':s.isBuffering?'Buffering the official recording…':paused?'Paused. Continue here whenever you’re ready.':position>0?'Playing here. Keep exploring Leonida.':'Starting the official player…');
    });
   });
  }catch{if(token===revision)nativeFallback(t)}
 }
 function station(t,token){
  const uploaded=Boolean(t.local),stationName=t.group==='uploads'?'Getaway FM':t.group==='score'?'Justice / The Score':'The Album';
  const label=document.createElement('p');label.textContent=uploaded?`${stationName} · Full uploaded file. Native controls include seeking and volume. Uploaded tracks in this collection continue automatically.`:'Official promotional excerpt. Press Play here or in the native audio controls.';
  audio=document.createElement('audio');audio.controls=true;audio.preload='metadata';audio.setAttribute('aria-label',`${t.name} ${uploaded?'uploaded track':'official station preview'}`);
  audio.src=uploaded?t.local:`https://www.rockstargames.com/VI/_next/static/media/${encodeURIComponent(t.file)}`;
  $('#radio-player').append(label,audio);
  const update=()=>{
   if(token!==revision||!audio)return;
   ready=true;paused=audio.paused;position=audio.currentTime*1000;duration=Number.isFinite(audio.duration)?audio.duration*1000:0;finished=audio.ended;sync();
   status(uploaded?(finished?'Track finished. Moving to the next upload…':paused?`${stationName} paused. Press Play to continue.`:position>0?'Playing your uploaded audio in full. Keep browsing.':`Starting ${stationName}…`):(finished?'Station excerpt finished. Replay or try another station.':paused?'Station preview ready or paused. Press Play to listen here.':position>0?'Playing Rockstar’s official station preview. Keep browsing.':'Starting the station preview…'));
  };
  for(const event of ['loadedmetadata','timeupdate','play','pause','ended'])audio.addEventListener(event,update);
  audio.addEventListener('play',()=>window.dispatchEvent(new Event('vice-atlas:radio-play')));
  audio.onerror=()=>{if(token===revision){ready=false;sync();status(uploaded?'The uploaded file could not load. Choose the track again to retry.':'This station preview could not load. Try another selection or its official source.')}};
  if(uploaded)audio.addEventListener('ended',()=>{if(token===revision)step(1)});
  ready=true;sync();status(uploaded?'Starting your uploaded track…':'Official station preview loaded. Press Play to listen.');
  if(uploaded)audio.play().catch(()=>{if(token===revision)status('Your browser paused playback. Press Play below or in the native controls.')});
 }
 function choose(id){
  const t=TRACKS.find(t=>t.id===id);if(!t)return;
  dispose();current=t;const token=revision;
  $('#radio-player').hidden=false;$('#radio-dock').hidden=false;document.body.classList.add('radio-open');
  $('#radio-art').src=artwork(t);$('#radio-art').alt=t.group==='uploads'?'Jason and Lucia Lock and Load artwork supplied for Getaway FM':`${t.name} official artwork`;
  $('#radio-current-title').textContent=t.name;$('#radio-current-artist').textContent=t.artist;
  $('#radio-dock-title').textContent=t.name;$('#radio-dock-artist').textContent=`${t.local?'Full uploaded file':'Preview'} · ${t.artist}`;
  $('#radio-source').hidden=t.group==='uploads';$('#radio-upload-credit').hidden=!t.local;
  $('#radio-upload-credit').textContent=t.group==='uploads'?'Custom station using user-provided MP3s. Titles come from the uploaded filenames; official release status and artist credits have not been verified.':'Playback uses your supplied MP3, not Spotify. Track and artist labels identify the catalogue entry; the uploaded recording’s provenance has not been independently verified.';
  $('#radio-source').href=t.source||HUB;
  $('#radio-source').textContent=t.group==='stations'?'Official Rockstar station source':'Official release credits & source';
  sync();$('#radio-toggle').textContent='Loading…';status(t.local?'Loading your uploaded file…':'Loading the official player…');
  render();
  if(t.group==='stations'||t.local)station(t,token);else spotify(t,token);
 }
 function step(delta){
  let queue=current?.local?TRACKS.filter(t=>t.group===current.group&&t.local):matches();if(!queue.length)queue=TRACKS.filter(t=>t.group===(current?.group||collection));
  const index=queue.findIndex(t=>t.id===current?.id);
  const next=index<0?(delta>0?0:queue.length-1):(index+delta+queue.length)%queue.length;
  if(queue[next])choose(queue[next].id);
 }
 $('#radio-toggle').onclick=()=>{
  if(!ready)return;
  if(audio){
   if(finished)audio.currentTime=0;
   if(audio.paused){const token=revision;audio.play().catch(()=>{if(token===revision)status('Your browser paused playback. Use the native Play control above.')})}else audio.pause();
  }else if(controller){if(finished){controller.restart();controller.play()}else controller.togglePlay()}
 };
 $('#radio-prev').onclick=()=>step(-1);$('#radio-next').onclick=()=>step(1);
 let seekGesture=null;
 $('#radio-seek').onpointerdown=()=>{seekGesture=audio?{audio,time:audio.currentTime}:null};
 $('#radio-seek').onpointerup=()=>{seekGesture=null};
 $('#radio-seek').onpointercancel=()=>{
  // A vertical page swipe cancels the range gesture; undo its initial tap.
  if(seekGesture?.audio===audio&&audio){audio.currentTime=seekGesture.time;position=audio.currentTime*1000;sync()}
  seekGesture=null;
 };
 $('#radio-seek').oninput=e=>{
  if(!audio||!Number.isFinite(audio.duration))return;
  audio.currentTime=Math.min(audio.duration,Math.max(0,Number(e.target.value)));
  position=audio.currentTime*1000;sync();
 };
 $('#radio-dock a').onclick=e=>{
  e.preventDefault();$('#radio-player').scrollIntoView({behavior:'instant',block:'start'});
  $('#radio-player').focus({preventScroll:true});
 };
 $('#radio-close').onclick=()=>{
  dispose();current=null;$('#radio-dock').hidden=true;$('#radio-player').hidden=true;document.body.classList.remove('radio-open');render();
  status('Player closed. Choose another release whenever you’re ready.');
 };
 document.querySelectorAll('[data-radio-collection]').forEach(b=>b.onclick=()=>{
  collection=b.dataset.radioCollection;query='';$('#radio-search').value='';
  $('#radio-search').placeholder=collection==='album'?'Try RHYNO or Suzuki…':collection==='score'?'Try Justice or Pusher…':collection==='stations'?'Try Flash FM or Cocoteo…':'Try Combat or Megamundo…';
  document.querySelectorAll('[data-radio-collection]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));
  if(!current){
   const isScore=collection==='score',isRadio=collection==='stations',isUpload=collection==='uploads';
   $('#radio-art').src=isUpload?'assets/getaway-cover.jpg':isRadio?'assets/station-cocoteo.webp':`assets/music-${isScore?'score':'album'}.webp`;
   $('#radio-art').alt=isUpload?'Jason and Lucia Lock and Load artwork supplied for Getaway FM':isRadio?'Cocoteo FM official station artwork':`Grand Theft Auto VI: ${isScore?'Original Score':'The Album'} official cover`;
   $('#radio-current-title').textContent=isUpload?'Getaway FM.':isScore?'The Score.':isRadio?'The in-game dial.':'The Album.';
   $('#radio-current-artist').textContent=isUpload?'Your uploads · Three-track rotation':isScore?'Justice':isRadio?'Rockstar Games · Promotional excerpts':'Rockstar Games × Atlantic Records';
   $('#radio-source').hidden=isUpload;$('#radio-upload-credit').hidden=!isUpload;
   if(isUpload)$('#radio-upload-credit').textContent='Custom station using user-provided MP3s. Titles come from the uploaded filenames; official release status and artist credits have not been verified.';
  }
  render();
 });
 $('#radio-search').oninput=e=>{query=e.target.value.trim().toLowerCase();render()};
 window.addEventListener('vice-atlas:video-play',()=>{if(audio)audio.pause();if(controller)controller.pause()});
 new ResizeObserver(()=>document.documentElement.style.setProperty('--radio-dock-height',$('#radio-dock').hidden?'0px':`${Math.ceil($('#radio-dock').getBoundingClientRect().height)}px`)).observe($('#radio-dock'));
 render();
})();
