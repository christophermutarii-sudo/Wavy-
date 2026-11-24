requireLogin();
let me = getCurrentUser();
document.getElementById("profileAvatar").innerHTML = avatarHTML(me, "100px");
document.getElementById("profileName").innerText = me.name;
document.getElementById("profileBio").innerText = me.bio;
document.getElementById("profileEmail").innerText = me.email;
document.getElementById("profileJoined").innerText = "Joined: " + (me.joined || "Recently");

let allPosts = JSON.parse(localStorage.getItem("mutarii_posts") || "[]");
let myPosts = allPosts.filter(p => p.email === me.email);
let container = document.getElementById("myPosts");
if (myPosts.length === 0) {
  container.innerHTML = `<div class="card" style="text-align:center; color:#65676b;">You haven't posted yet.<br><br><button onclick="location.href='index.html'">Create First Post</button></div>`;
} else {
  myPosts.forEach((p) => {
    let mediaHtml = "";
    if (p.img) {
      if (p.isVideo) mediaHtml = `<video class="post-img" src="${p.img}" controls></video>`;
      else mediaHtml = `<img class="post-img" src="${p.img}">`;
    }
    let commentsHtml = "";
    p.comments.forEach(c => { commentsHtml += `<div class="comment">${c}</div>`; });
    container.innerHTML += `
      <div class="card">
        <div class="profile-row">${avatarHTML(me)}<div><b>${p.name}</b><div style="font-size:12px; color:#65676b;">${p.time}</div></div></div>
        <p style="margin-top:10px;">${p.text}</p>
        ${mediaHtml}
        <p style="margin-top:10px; font-size:14px; color:#65676b;">👍 ${p.likes} Likes &nbsp; 💬 ${p.comments.length} Comments</p>
        ${commentsHtml}
      </div>`;
  });
}