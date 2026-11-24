// Wavy App - WITH PHOTO + VIDEO - NO IMPORT
let selectedMedia = null;
let selectedMediaType = null; // 'image' or 'video'

function previewMedia(input){
  const file = input.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = function(e){
    selectedMedia = e.target.result;
    if(file.type.startsWith('image/')){
      selectedMediaType = 'image';
      document.getElementById('mediaPreview').innerHTML = '<img src="'+selectedMedia+'" style="width:100%;border-radius:12px;max-height:300px;object-fit:cover"><br><button class="btn btn-outline" style="margin-top:8px" onclick="removeMedia()">✕ Remove Photo</button>';
    } else if(file.type.startsWith('video/')){
      selectedMediaType = 'video';
      document.getElementById('mediaPreview').innerHTML = '<video src="'+selectedMedia+'" controls style="width:100%;border-radius:12px;max-height:300px"></video><br><button class="btn btn-outline" style="margin-top:8px" onclick="removeMedia()">✕ Remove Video</button>';
    }
  };
  reader.readAsDataURL(file);
}

function removeMedia(){
  selectedMedia = null;
  selectedMediaType = null;
  document.getElementById('mediaPreview').innerHTML = '';
  document.getElementById('postMedia').value = '';
}

function createPost(){
  const textEl = document.getElementById('postText');
  const text = textEl.value.trim();
  // Must have text OR media
  if(!text && !selectedMedia) return alert('Write something or add a photo/video first');
  const user = auth.currentUser;
  const name = user ? (user.displayName || localStorage.getItem('wavyName') || user.email.split('@')[0]) : 'Wavy User';
  const postData = {
    text: text,
    name: name,
    email: user ? user.email : 'anon',
    likes: [],
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  };
  // Add photo or video if selected
  if(selectedMediaType === 'image') postData.image = selectedMedia;
  if(selectedMediaType === 'video') postData.video = selectedMedia;

  db.collection("posts").add(postData).then(()=>{
    textEl.value = '';
    removeMedia();
  }).catch(e=>{
    if(e.message.includes('larger than') || e.message.includes('maximum')){
      alert('Photo/Video too big! Please choose a smaller photo or short video (under 1MB). Take a screenshot of your photo to make it smaller.');
    } else alert(e.message);
  });
}

function likePost(id){
  const uid = auth.currentUser ? auth.currentUser.uid : 'guest';
  const ref = db.collection("posts").doc(id);
  ref.get().then(doc=>{
    const likes = doc.data().likes || [];
    if(likes.includes(uid)){
      ref.update({ likes: firebase.firestore.FieldValue.arrayRemove(uid) });
    } else {
      ref.update({ likes: firebase.firestore.FieldValue.arrayUnion(uid) });
    }
  });
}

const feedEl = document.getElementById('feed');
if(feedEl){
  db.collection("posts").orderBy("createdAt","desc").onSnapshot(snap=>{
    feedEl.innerHTML = '';
    if(snap.empty){
      feedEl.innerHTML = '<div class="card center"><b>No posts yet</b><p class="muted">Be the first to post on Wavy!</p></div>';
      return;
    }
    snap.forEach(d=>{
      const p = d.data();
      const div = document.createElement('div');
      div.className = 'post';
      let mediaHTML = '';
      if(p.image){
        mediaHTML = '<img src="'+p.image+'" style="width:100%;border-radius:12px;margin:10px 0;max-height:400px;object-fit:cover" onclick="window.open(this.src)">';
      }
      if(p.video){
        mediaHTML = '<video src="'+p.video+'" controls style="width:100%;border-radius:12px;margin:10px 0;max-height:400px"></video>';
      }
      div.innerHTML = '<div class="avatar">' + (p.name||'W')[0].toUpperCase() + '</div><div style="flex:1"><b>' + p.name + '</b> <span class="muted">• Wavy</span><div style="margin:8px 0">' + (p.text||'') + '</div>' + mediaHTML + '<div style="display:flex;gap:16px"><b style="cursor:pointer" onclick="likePost(\'' + d.id + '\')">❤️ ' + (p.likes||[]).length + '</b><span>💬 Comment</span><span>↗ Share</span></div></div>';
      feedEl.appendChild(div);
    });
  });
}