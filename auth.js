// ===== WAVY AUTH - SAFE VERSION =====
function safeAuth(){ try{ return typeof auth !== 'undefined' ? auth : null; }catch(e){ return null; } }
function safeDb(){ try{ return typeof db !== 'undefined' ? db : null; }catch(e){ return null; } }
function getSavedAccounts(){ try{ return JSON.parse(localStorage.getItem('wavy_saved_accounts')||'[]'); }catch(e){ return []; } }
function saveAccount(name,email,password){ var list=getSavedAccounts(); list=list.filter(function(a){ return a.email!==email; }); list.unshift({name:name,email:email,password:password||''}); localStorage.setItem('wavy_saved_accounts', JSON.stringify(list.slice(0,5))); localStorage.setItem('wavy_last_account', email); localStorage.setItem('wavyName', name); }
function removeSavedAccount(email){ var list=getSavedAccounts().filter(function(a){ return a.email!==email; }); localStorage.setItem('wavy_saved_accounts', JSON.stringify(list)); if(window.renderSavedAccounts) renderSavedAccounts(); }
function wavyQuickLogin(email){ var acc=getSavedAccounts().find(function(a){ return a.email===email; }); if(!acc) return; var box=document.getElementById('quickPassBox'); if(box){ box.style.display='block'; document.getElementById('quickAvatar').textContent=(acc.name||'W')[0].toUpperCase(); document.getElementById('quickPassTitle').textContent='Log in as '+acc.name; document.getElementById('quickPassEmail').textContent=acc.email; document.getElementById('quickPassInput').value=acc.password||''; document.getElementById('quickPassInput').dataset.email=acc.email; document.getElementById('quickPassInput').dataset.name=acc.name; } }
function cancelQuickLogin(){ var box=document.getElementById('quickPassBox'); if(box) box.style.display='none'; }
async function wavyQuickLoginWithPass(){ var inp=document.getElementById('quickPassInput'); await wavyLogin(inp.dataset.email, inp.value, document.getElementById('quickRemember').checked, inp.dataset.name); }

async function wavyLogin(email, pass, remember, nameOverride){
  var myAuth=safeAuth();
  if(!myAuth) return alert('Firebase not loaded! Paste REAL apiKey in login.html!');
  if(!email || !pass) return alert('Enter email + password!');
  try{
    var cred=await myAuth.signInWithEmailAndPassword(email, pass);
    var user=cred.user;
    var name=nameOverride||user.displayName||localStorage.getItem('wavyName')||email.split('@')[0];
    if(remember!==false) saveAccount(name, email, pass);
    localStorage.setItem('wavyName', name);
    location.href='booting.html';
  }catch(e){ alert(e.message); }
}

async function wavyRegister(name, email, pass, remember){
  var myAuth=safeAuth();
  var myDb=safeDb();
  if(!myAuth) return alert('Firebase not loaded!');
  if(!name || !email || !pass) return alert('Fill all fields!');
  if(pass.length<6) return alert('Password must be 6+ chars!');
  try{
    var cred=await myAuth.createUserWithEmailAndPassword(email, pass);
    await cred.user.updateProfile({displayName:name});
    await myDb.collection("users").doc(cred.user.uid).set({uid:cred.user.uid,name:name,email:email,createdAt:firebase.firestore.FieldValue.serverTimestamp()});
    if(remember!==false) saveAccount(name, email, pass);
    localStorage.setItem('wavyName', name);
    location.href='booting.html';
  }catch(e){ alert(e.message); }
}

async function wavyGoogle(){
  var myAuth=safeAuth();
  var myDb=safeDb();
  if(!myAuth) return alert('Firebase not loaded!');
  try{
    var provider=new firebase.auth.GoogleAuthProvider();
    var res=await myAuth.signInWithPopup(provider);
    var user=res.user;
    var name=user.displayName||user.email.split('@')[0];
    await myDb.collection("users").doc(user.uid).set({uid:user.uid,name:name,email:user.email,pic:user.photoURL||'',createdAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true});
    saveAccount(name, user.email, '');
    location.href='booting.html';
  }catch(e){ alert(e.message); }
}

async function wavyLogout(){
  var myAuth=safeAuth();
  if(myAuth) await myAuth.signOut();
  location.href='login.html';
}
      let people = JSON.parse(localStorage.getItem('st_persons')||'[]');
let cases = JSON.parse(localStorage.getItem('st_cases')||'[]');
let admin = JSON.parse(localStorage.getItem('st_admin')||'{}');
let timeline = JSON.parse(localStorage.getItem('st_timeline')||'[]');
let chats = JSON.parse(localStorage.getItem('st_chats')||'[]');
let scans=parseInt(localStorage.getItem('st_scans')||0), matches=parseInt(localStorage.getItem('st_matches')||0);
let modelsLoaded=false, nightOn=false;
let selectedAvatar = 'https://i.pravatar.cc/100?img=12';

async function loadModels(){
  try{
    const U='https://justadudewhohacks.github.io/face-api.js/models';
    await faceapi.nets.tinyFaceDetector.loadFromUri(U);
    await faceapi.nets.faceLandmark68Net.loadFromUri(U);
    await faceapi.nets.faceRecognitionNet.loadFromUri(U);
    modelsLoaded=true;
    document.getElementById('aiStatus').textContent='Face AI Ready - Spider Web + Mask Active';
    document.getElementById('aiStatus').style.color='#00ff88';
  }catch(e){
    document.getElementById('aiStatus').textContent='Need internet first time for AI models';
  }
}
loadModels();

function addLog(text){ timeline.unshift({text:text, time:new Date().toLocaleString()}); if(timeline.length>20) timeline.pop(); localStorage.setItem('st_timeline', JSON.stringify(timeline)); }
function clearTimeline(){ timeline=[]; localStorage.setItem('st_timeline', JSON.stringify(timeline)); updateUI(); }
function updateOnline(){ let on=navigator.onLine; let d=document.getElementById('onlineDot'); if(d) d.style.background=on?'#00ff88':'#ff3b30'; let t=document.getElementById('onlineText'); if(t) t.textContent=on?'Online':'Offline'; }
window.addEventListener('online', updateOnline); window.addEventListener('offline', updateOnline); updateOnline();
function speak(text){ let v=document.getElementById('voiceAlert'); if(v && !v.checked) return; try{ let u=new SpeechSynthesisUtterance(text); u.lang='en-KE'; window.speechSynthesis.speak(u); }catch(e){} }
function testVoice(){ speak('Secure Trace voice alert working. Match found test.'); }

function switchTab(tab){
  document.getElementById('tabLogin').classList.toggle('active', tab==='login');
  document.getElementById('tabRegister').classList.toggle('active', tab==='register');
  document.getElementById('formLogin').classList.toggle('hidden', tab!=='login');
  document.getElementById('formRegister').classList.toggle('hidden', tab!=='register');
}
function togglePass(id, el){ let i=document.getElementById(id); i.type = i.type==='password' ? 'text' : 'password'; el.textContent = i.type==='password' ? 'SHOW' : 'HIDE'; }
function pickAvatar(img){ document.querySelectorAll('.avatarPick img').forEach(x=>x.classList.remove('selected')); img.classList.add('selected'); selectedAvatar = img.src; }
function checkStrength(v){ let bar=document.getElementById('strengthBar'); let w=0, color='#ff3b30'; if(v.length>=6) w=40; if(v.length>=8 && /[0-9]/.test(v)){ w=70; color='#ffb300'; } if(v.length>=8 && /[0-9]/.test(v) && /[A-Z]/.test(v)){ w=100; color='#00ff88'; } bar.style.width=w+'%'; bar.style.background=color; }
function forgotPass(){ let email = prompt('Enter your email to reset:'); if(email) alert('Reset link sent to '+email); }
function loginGoogle(){ alert('Google Login will work after Firebase setup. For now use Email Register.'); }

function sendChat(){ let msg=document.getElementById('chatInput').value.trim(); if(!msg) return; let to=document.getElementById('chatTo').value; chats.push({from:admin.name||'Admin', to:to, text:msg, time:new Date().toLocaleString()}); localStorage.setItem('st_chats', JSON.stringify(chats)); document.getElementById('chatInput').value=''; addLog('Chat sent to '+to); updateUI(); }
function clearChat(){ chats=[]; localStorage.setItem('st_chats', JSON.stringify(chats)); updateUI(); }
function renderChat(){ let h=''; if(chats.length===0) h='<p class="small">No messages yet. Say hello to team.</p>'; chats.slice(-20).forEach(c=>{ let me = c.from===(admin.name||'Admin'); h+='<div class="chatMsg '+(me?'me':'')+'"><b>'+c.from+' to '+c.to+'</b><br>'+c.text+'<br><span class="small">'+c.time+'</span></div>'; }); document.getElementById('chatBox').innerHTML=h; document.getElementById('chatBox').scrollTop=9999; }
function toggleNight(){ nightOn=!nightOn; document.getElementById('cctvBox').classList.toggle('night', nightOn); document.getElementById('nightStatus').textContent='Night Mode: '+(nightOn?'ON - Brightened':'OFF'); if(nightOn) speak('Night mode on'); }

function detectMask(img, detection){
  try{
    let c=document.createElement('canvas'); c.width=img.naturalWidth; c.height=img.naturalHeight; let ctx=c.getContext('2d'); ctx.drawImage(img,0,0);
    let mouth = detection.landmarks.getMouth();
    let mx=0,my=0; mouth.forEach(p=>{ mx+=p.x; my+=p.y; }); mx/=mouth.length; my/=mouth.length;
    let data=ctx.getImageData(Math.max(0,mx-20), Math.max(0,my-10), 40, 20).data;
    let avg=0; for(let i=0;i<data.length;i+=4){ avg+=(data[i]+data[i+1]+data[i+2])/3; } avg/=(data.length/4);
    let mouthSpread = Math.max(...mouth.map(p=>p.y)) - Math.min(...mouth.map(p=>p.y));
    let isMask = (avg < 70 && mouthSpread < 18) || (mouthSpread < 8);
    return {isMask:isMask, avg:Math.round(avg), spread:Math.round(mouthSpread)};
  }catch(e){ return {isMask:false, avg:0, spread:0}; }
}

function downloadPDF(i){ let c=cases[i]; let w=window.open('', '_blank'); w.document.write('<html><head><title>Case Report</title><style>body{font-family:sans-serif;padding:20px}h1{color:#00aa66}table{width:100%;border-collapse:collapse}td{border:1px solid #ddd;padding:8px}</style></head><body><h1>SECURE TRACE - CASE REPORT</h1><p>Generated: '+new Date().toLocaleString()+'</p><table><tr><td><b>Case Title</b></td><td>'+c.title+'</td></tr><tr><td><b>Location</b></td><td>'+c.location+'</td></tr><tr><td><b>Date</b></td><td>'+c.date+'</td></tr><tr><td><b>Type</b></td><td>'+c.type+'</td></tr><tr><td><b>Suspect</b></td><td>'+(c.suspect||'None')+'</td></tr><tr><td><b>Description</b></td><td>'+c.desc+'</td></tr><tr><td><b>Notes</b></td><td>'+(c.notes||'No notes')+'</td></tr><tr><td><b>Admin</b></td><td>'+(admin.name||'Admin')+'</td></tr></table><p>Private Test System</p><button onclick="window.print()">Print / Save as PDF</button></body></html>'); }
function shareCase(i){ let c=cases[i]; let msg='SECURE TRACE CASE: '+c.title+' | Location: '+c.location+' | Date: '+c.date+' | Suspect: '+(c.suspect||'None')+' | Notes: '+(c.notes||''); window.open('https://wa.me/?text='+encodeURIComponent(msg),'_blank'); }
function showQR(i){ let p=people[i]; let qr='https://api.qrserver.com/v1/create-qr-code/?size=200x200&data='+encodeURIComponent('Name:'+p.name+' ID:'+p.id+' Tel:'+p.tel); let w=window.open('', '_blank'); w.document.write('<h2>'+p.name+'</h2><p>ID: '+p.id+'</p><img src="'+qr+'"><p>Scan this QR</p><button onclick="window.print()">Print QR</button>'); }
async function startLiveCamera(){ try{ let stream=await navigator.mediaDevices.getUserMedia({video:true}); let v=document.getElementById('liveVideo'); v.srcObject=stream; v.style.display='block'; document.getElementById('cctvImg').style.display='none'; document.getElementById('cctvText').style.display='none'; }catch(e){ alert('Camera permission denied. Allow camera.'); } }
function captureLive(){ let v=document.getElementById('liveVideo'); if(v.style.display==='none'){ alert('Start live camera first!'); return; } let c=document.createElement('canvas'); c.width=v.videoWidth; c.height=v.videoHeight; c.getContext('2d').drawImage(v,0,0); let img=document.getElementById('cctvImg'); img.src=c.toDataURL('image/png'); img.style.display='block'; v.style.display='none'; if(v.srcObject) v.srcObject.getTracks().forEach(t=>t.stop()); alert('Photo captured! Now tap ANALYSE.'); }
function setTheme(t){ if(t==='auto'){ let isLight=window.matchMedia('(prefers-color-scheme: light)').matches; document.body.className=isLight?'light':''; document.getElementById('autoThemeInfo').textContent='Auto: Now using '+(isLight?'Light':'Dark')+' from your phone.'; localStorage.setItem('st_theme','auto'); return; } document.body.className=t; localStorage.setItem('st_theme', t); }
if(window.matchMedia) window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', e=>{ if(localStorage.getItem('st_theme')==='auto'){ document.body.className=e.matches?'light':''; } });
function showPage(p){ ['dashboard','register','case','footage','settings'].forEach(x=>{ document.getElementById('page-'+x).classList.toggle('hidden', x!==p); document.getElementById('nav-'+x).classList.toggle('active', x===p); }); updateUI(); }

function doRegister(){
  let name=document.getElementById('regName').value.trim();
  let phone=document.getElementById('regPhone').value.trim();
  let email=document.getElementById('regEmail').value.trim();
  let pass=document.getElementById('regPass').value;
  let pass2=document.getElementById('regPass2').value;
  let err=document.getElementById('regError');
  let ok=document.getElementById('regSuccess');
  err.textContent=''; ok.textContent='';
  if(!name || !email || !pass) return err.textContent='Fill Name, Email, Password';
  if(!document.getElementById('agree').checked) return err.textContent='Tick agree box first';
  if(pass.length<6) return err.textContent='Password must be 6+ characters';
  if(pass!==pass2) return err.textContent='Passwords do not match';
  let users = JSON.parse(localStorage.getItem('st_users')||'[]');
  if(users.find(u=>u.email===email)) return err.textContent='Email already registered. Login.';
  users.push({name:name, phone:phone, email:email, pass:pass, avatar:selectedAvatar});
  localStorage.setItem('st_users', JSON.stringify(users));
  ok.textContent='Account created! Now login.';
  setTimeout(()=>switchTab('login'), 800);
}
function doLogin(){
  let email=document.getElementById('loginEmail').value.trim();
  let pass=document.getElementById('loginPass').value;
  let err=document.getElementById('loginError');
  err.textContent='';
  if(!email || !pass) return err.textContent='Enter Email + Password';
  let users = JSON.parse(localStorage.getItem('st_users')||'[]');
  let u = users.find(x=>x.email===email && x.pass===pass);
  if(!u && users.length===0){ u = {name:email.split('@')[0], email:email, phone:'', avatar:selectedAvatar}; }
  if(!u) return err.textContent='Wrong email or password. Register first.';
  admin={name:u.name, email:u.email, phone:u.phone||'', avatar:u.avatar||selectedAvatar, role: admin.role||''};
  localStorage.setItem('st_admin', JSON.stringify(admin));
  localStorage.setItem('st_logged_in','1');
  document.getElementById('loginPage').classList.add('hidden');
  document.getElementById('app').classList.remove('hidden');
  addLog('Admin '+admin.name+' logged in');
  updateUI();
}
function doLogout(){ addLog('Admin logged out'); localStorage.removeItem('st_logged_in'); document.getElementById('app').classList.add('hidden'); document.getElementById('loginPage').classList.remove('hidden'); }
function saveAdmin(){ let n=document.getElementById('setAdminName').value; let ph=document.getElementById('setAdminPhone').value; let rl=document.getElementById('setAdminRole').value; if(n) admin.name=n; if(ph) admin.phone=ph; if(rl) admin.role=rl; localStorage.setItem('st_admin', JSON.stringify(admin)); updateUI(); alert('Saved!'); }
function changeAvatar(e){ let r=new FileReader(); r.onload=function(){ admin.avatar=r.result; localStorage.setItem('st_admin', JSON.stringify(admin)); updateUI(); }; r.readAsDataURL(e.target.files[0]); }
function previewFinger(e){ let r=new FileReader(); r.onload=function(){ document.getElementById('fingerPreview').src=r.result; document.getElementById('fingerPreview').style.display='block'; }; r.readAsDataURL(e.target.files[0]); }
function saveSettings(){ let s={ tfa:document.getElementById('tfa').checked, appLock:document.getElementById('appLock').checked, autoLogout:document.getElementById('autoLogout').checked, notifMatch:document.getElementById('notifMatch').checked, notifCase:document.getElementById('notifCase').checked, notifSound:document.getElementById('notifSound').checked, lang:document.getElementById('langSelect').value, voice:document.getElementById('voiceAlert').checked }; localStorage.setItem('st_settings', JSON.stringify(s)); }
function changePassword(){ let p=document.getElementById('newPass').value; if(!p){ alert('Enter new password'); return; } localStorage.setItem('st_pass', p); alert('Password changed!'); }
function exportData(){ let data={ persons:people, cases:cases, admin:admin, timeline:timeline, chats:chats }; let blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}); let a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='secure-trace-backup.json'; a.click(); }
function importData(e){ let r=new FileReader(); r.onload=function(){ try{ let d=JSON.parse(r.result); if(d.persons) people=d.persons; if(d.cases) cases=d.cases; if(d.chats) chats=d.chats; localStorage.setItem('st_persons', JSON.stringify(people)); localStorage.setItem('st_cases', JSON.stringify(cases)); updateUI(); alert('Import done!'); }catch(err){ alert('Invalid file'); } }; r.readAsText(e.target.files[0]); }
function changeFontSize(){ document.body.style.fontSize=document.getElementById('fontSelect').value; }
function drawChart(){ let max=Math.max(people.length, cases.length, scans, matches, 1); let rows=[['Persons',people.length],['Cases',cases.length],['Scans',scans],['Matches',matches]]; let h=''; rows.forEach(r=>{ let w=Math.round((r[1]/max)*100); h+='<div class="barRow"><span style="width:60px">'+r[0]+'</span><div class="barBg"><div class="barFill" style="width:'+w+'%"></div></div><b>'+r[1]+'</b></div>'; }); document.getElementById('chartArea').innerHTML=h; }

function updateUI(){
  document.getElementById('welcomeName').textContent = admin.name||'Admin';
  document.getElementById('topAvatar').src = admin.avatar||'https://i.pravatar.cc/100?img=12';
  document.getElementById('profilePic').src = admin.avatar||'https://i.pravatar.cc/150?img=12';
  document.getElementById('setAdminName').value = admin.name||'';
  document.getElementById('setAdminPhone').value = admin.phone||'';
  document.getElementById('setAdminRole').value = admin.role||'';
  document.getElementById('statPersons').textContent = people.length;
  document.getElementById('statCases').textContent = cases.length;
  document.getElementById('statScans').textContent = scans;
  document.getElementById('statMatch').textContent = matches;
  drawChart(); renderChat();
  let tl=''; timeline.slice(0,8).forEach(t=>{ tl+='<div class="timelineItem"><b>'+t.text+'</b><br><span class="small">'+t.time+'</span></div>'; }); if(!tl) tl='<p class="small">No history yet.</p>'; document.getElementById('timeline').innerHTML=tl;
  let act=''; cases.slice(-3).reverse().forEach(c=>{ act+='<div class="person"><div><b>'+c.title+'</b><br><span class="small">'+c.location+' | '+c.date+'</span></div><span class="badge">'+c.type+'</span></div>'; }); if(!act) act='<p class="small">No activity yet.</p>'; document.getElementById('activity').innerHTML=act;
  let mapHtml=''; cases.forEach(c=>{ mapHtml+='<div class="person"><div><b>'+c.title+'</b><br><span class="small">'+c.location+'</span></div><button onclick="window.open(\'https://www.openstreetmap.org/search?query='+encodeURIComponent(c.location)+'\',\'_blank\')" style="margin-left:auto;background:var(--main);border:none;padding:6px 10px;border-radius:20px;font-weight:bold">View Map</button></div>'; }); document.getElementById('mapList').innerHTML = mapHtml || '<p class="small">No cases on map yet.</p>';
  let q=(document.getElementById('searchInput')?.value||'').toLowerCase();
  let plist=''; people.filter(p=> (p.name+' '+p.id).toLowerCase().includes(q)).forEach((p,i)=>{ plist+='<div class="person"><img src="'+p.photo+'"><div><b>'+p.name+'</b><br><span class="small">ID: '+p.id+' | Tel: '+p.tel+' | '+p.location+'</span><br><span class="small">DOB: '+p.dob+' | Origin: '+p.mother+'</span><br><button class="miniBtn" onclick="showQR('+i+')">Show QR Code</button></div><button onclick="delPerson('+i+')" style="margin-left:auto;background:#ff3b30;border:none;color:white;padding:6px 10px;border-radius:20px">X</button></div>'; });
  if(!plist) plist='<p class="small">No persons found.</p>'; document.getElementById('personList').innerHTML=plist;
  let filterType=document.getElementById('cType')?.value||'All'; let caseQ=(document.getElementById('searchCase')?.value||'').toLowerCase();
  let clist=''; cases.filter(c=> (filterType==='All' || c.type===filterType || filterType==='Filter: All Types') && (c.title+' '+c.location).toLowerCase().includes(caseQ)).forEach((c,i)=>{ clist+='<div class="person"><div><b>'+c.title+'</b><br><span class="small">'+c.location+' | '+c.date+' | Suspect: '+(c.suspect||'None')+'</span><br><span class="small">'+c.desc+'</span><br><span class="small" style="color:var(--main)">Notes: '+(c.notes||'No notes')+'</span><br><button class="miniBtn" onclick="downloadPDF('+i+')">Download PDF</button><button class="miniBtn" onclick="shareCase('+i+')">Share WhatsApp</button><button class="miniBtn" onclick="speak(\'Case '+c.title+' at '+c.location+'\')">Voice Read</button></div><button onclick="delCase('+i+')" style="margin-left:auto;background:#ff3b30;border:none;color:white;padding:6px 10px;border-radius:20px">X</button></div>'; });
  if(!clist) clist='<p class="small">No cases yet.</p>'; document.getElementById('caseList').innerHTML=clist;
  let opts='<option value="">-- Select Suspect --</option>'; people.forEach(p=>{ opts+='<option>'+p.name+' (ID:'+p.id+')</option>'; }); document.getElementById('cSuspect').innerHTML=opts;
  let copts='<option value="">Link to Case (optional)</option>'; cases.forEach(c=>{ copts+='<option>'+c.title+'</option>'; }); document.getElementById('linkCase').innerHTML=copts;
}
function delPerson(i){ addLog('Deleted person '+people[i].name); people.splice(i,1); localStorage.setItem('st_persons', JSON.stringify(people)); updateUI(); }
function delCase(i){ addLog('Deleted case '+cases[i].title); cases.splice(i,1); localStorage.setItem('st_cases', JSON.stringify(cases)); updateUI(); }

async function registerPerson(){
  if(!modelsLoaded){ alert('Wait for AI to load!'); return; }
  let name=document.getElementById('pName').value, id=document.getElementById('pID').value, tel=document.getElementById('pTel').value, dob=document.getElementById('pDOB').value, loc=document.getElementById('pLocation').value, mother=document.getElementById('pMother').value;
  let file=document.getElementById('pPhoto').files[0];
  if(!name||!file){ alert('Need Name + Face Photo!'); return; }
  document.getElementById('regMsg').textContent='Detecting face...';
  let fingerFile=document.getElementById('pFinger').files[0]; let fingerData='';
  if(fingerFile){ fingerData=await new Promise(res=>{ let r=new FileReader(); r.onload=()=>res(r.result); r.readAsDataURL(fingerFile); }); }
  let reader=new FileReader();
  reader.onload=async function(){
    let img=new Image(); img.src=reader.result;
    img.onload=async function(){
      let det=await faceapi.detectSingleFace(img, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptor();
      if(!det){ document.getElementById('regMsg').textContent='NO FACE FOUND! Use clear front photo.'; return; }
      people.push({name:name,id:id||'NO-ID',tel:tel,dob:dob,location:loc,mother:mother,photo:reader.result,finger:fingerData,descriptor:Array.from(det.descriptor)});
      localStorage.setItem('st_persons', JSON.stringify(people)); addLog('Registered person '+name); updateUI();
      document.getElementById('regMsg').textContent=name+' saved!'; speak('Person '+name+' registered successfully.'); alert(name+' registered!');
    };
  };
  reader.readAsDataURL(file);
}
function registerCase(){
  let title=document.getElementById('cTitle').value, loc=document.getElementById('cLocation').value, date=document.getElementById('cDate').value, type=document.getElementById('cType').value, desc=document.getElementById('cDesc').value, notes=document.getElementById('cNotes').value, suspect=document.getElementById('cSuspect').value;
  if(!title){ alert('Need Case Title!'); return; }
  if(type==='All'||type==='Filter: All Types') type='Theft';
  cases.push({title:title,location:loc,date:date,type:type,desc:desc,notes:notes,suspect:suspect});
  localStorage.setItem('st_cases', JSON.stringify(cases)); addLog('Created case '+title+' at '+loc); updateUI(); speak('Case '+title+' saved.'); alert('Case saved!'); showPage('footage');
}
function loadFootage(e){ let r=new FileReader(); r.onload=function(){ let img=document.getElementById('cctvImg'); img.src=r.result; img.style.display='block'; document.getElementById('cctvText').style.display='none'; document.getElementById('liveVideo').style.display='none'; document.getElementById('overlayCanvas').style.display='none'; document.getElementById('analyseResult').innerHTML=''; document.getElementById('maskResult').innerHTML=''; }; r.readAsDataURL(e.target.files[0]); }

async function analyseFootage(){
  if(!modelsLoaded){ alert('Wait for AI!'); return; }
  let img=document.getElementById('cctvImg');
  if(img.style.display==='none'){ alert('Upload footage or capture from live camera first!'); return; }
  let scan=document.getElementById('scanLine'); scan.style.display='block'; let pos=0; let interval=setInterval(()=>{ pos+=8; scan.style.top=pos+'px'; if(pos>200){ clearInterval(interval); scan.style.display='none'; } },30);
  document.getElementById('analyseResult').innerHTML='Analysing biometrics... Drawing spider web + Mask check...';
  scans++; localStorage.setItem('st_scans', scans); addLog('Scanned footage');
  let detection = await faceapi.detectSingleFace(img, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptor();
  let canvas=document.getElementById('overlayCanvas'); let ctx=canvas.getContext('2d'); canvas.width=img.clientWidth; canvas.height=img.clientHeight; canvas.style.display='block';
  if(!detection){ ctx.clearRect(0,0,canvas.width,canvas.height); document.getElementById('analyseResult').innerHTML='<b style="color:#ff3b30">NO FACE FOUND</b><br><span class="small">No face in footage. No result.</span>'; speak('No face found in footage.'); updateUI(); return; }
  let mask = detectMask(img, detection);
  document.getElementById('maskResult').innerHTML = mask.isMask ? '<div style="background:#3d2a00;border:1px solid #ffb300;padding:10px;border-radius:10px">Mask Detection: <span class="maskYes">MASK YES - Mouth covered</span><br><span class="small">Mouth brightness: '+mask.avg+' | Mouth spread: '+mask.spread+'</span></div>' : '<div style="background:#003d1f;border:1px solid #00ff88;padding:10px;border-radius:10px">Mask Detection: <span class="maskNo">MASK NO - Face clear</span><br><span class="small">Mouth brightness: '+mask.avg+' | Mouth spread: '+mask.spread+'</span></div>';
  if(mask.isMask) speak('Warning, person is wearing a mask.');
  ctx.clearRect(0,0,canvas.width,canvas.height);
  let box=detection.detection.box; let scaleX=canvas.width/img.naturalWidth, scaleY=canvas.height/img.naturalHeight;
  ctx.strokeStyle='#00ff88'; ctx.lineWidth=2; ctx.shadowColor='#00ff88'; ctx.shadowBlur=10; ctx.strokeRect(box.x*scaleX, box.y*scaleY, box.width*scaleX, box.height*scaleY);
  let points=detection.landmarks.positions; points.forEach((pt,i)=>{ let x=pt.x*scaleX, y=pt.y*scaleY; ctx.beginPath(); ctx.moveTo((box.x+box.width/2)*scaleX, (box.y+box.height/2)*scaleY); ctx.lineTo(x,y); ctx.stroke(); ctx.fillStyle='#00ff88'; ctx.beginPath(); ctx.arc(x,y,2,0,Math.PI*2); ctx.fill(); });
  for(let r=10;r<80;r+=15){ ctx.beginPath(); ctx.arc((box.x+box.width/2)*scaleX,(box.y+box.height/2)*scaleY,r,0,Math.PI*2); ctx.strokeStyle='rgba(0,255,136,0.4)'; ctx.stroke(); }
  let best=null, bestDist=10; people.forEach(p=>{ let d=faceapi.euclideanDistance(detection.descriptor, p.descriptor); if(d<bestDist){ bestDist=d; best=p; } });
  let linked=document.getElementById('linkCase').value;
  if(best && bestDist<0.6){ matches++; localStorage.setItem('st_matches', matches); addLog('MATCH FOUND: '+best.name); document.getElementById('analyseResult').innerHTML='<div style="background:#003d1f;border:1px solid #00ff88;padding:12px;border-radius:10px"><b style="color:#00ff88">MATCH FOUND - '+Math.round((1-bestDist)*100)+'%</b><br><img src="'+best.photo+'" style="width:60px;height:60px;border-radius:50%;margin-top:8px"><br><b>'+best.name+'</b> | ID: '+best.id+' | Tel: '+best.tel+'<br><span class="small">Location: '+best.location+' | Origin: '+best.mother+' | DOB: '+best.dob+'<br>Linked Case: '+(linked||'None')+'</span><br><button class="btn" onclick="alert(\'Report sent!\')">Send Report</button></div>'; speak('Match found. '+best.name+'. ID '+best.id+'. Linked to case '+linked); }
  else { addLog('UNKNOWN FACE detected'); document.getElementById('analyseResult').innerHTML='<div style="background:#3d2a00;border:1px solid #ffb300;padding:12px;border-radius:10px"><b style="color:#ffb300">FACE FOUND BUT UNKNOWN</b><br><span class="small">Real face detected, but NOT in registered list. Distance: '+bestDist.toFixed(2)+'<br>Linked Case: '+(linked||'None')+'</span></div>'; speak('Warning. Unknown face detected. Not in database.'); }
  updateUI();
}

if(localStorage.getItem('st_theme')==='auto'){ setTheme('auto'); }
if(localStorage.getItem('st_logged_in')==='1' && admin.name){ document.getElementById('loginPage').classList.add('hidden'); document.getElementById('app').classList.remove('hidden'); }
updateUI();