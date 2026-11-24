requireLogin();
let me = getCurrentUser();
let params = new URLSearchParams(location.search);
let targetEmail = params.get("email");
let users = getUsers();
let targetUser = users.find(u => u.email === targetEmail);
if (!targetUser) {
  document.getElementById("userName").innerText = "User not found";
  document.getElementById("userBio").innerText = "This person doesn't exist on Mutarii-Net";
} else {
  document.getElementById("userAvatarWrap").innerHTML = avatarHTML(targetUser, "100px");
  document.getElementById("userName").innerText = targetUser.name;
  document.getElementById("userBio").innerText = targetUser.bio;
  document.getElementById("userEmail").innerText = targetUser.email;
  document.getElementById("chatBtn").onclick = () => {
    location.href = "chat.html?to=" + encodeURIComponent(targetUser.email);
  };
  let follows = JSON.parse(localStorage.getItem("mutarii_follows") || "{}");
  let myFollows = follows[me.email] || [];
  let followBtn = document.getElementById("followBtn");
  function updateFollowBtn() {
    if (myFollows.includes(targetUser.email)) {
      followBtn.innerText = "✓ Following";
      followBtn.style.background = "#42b72a";
      followBtn.style.color = "white";
    } else {
      followBtn.innerText = "Follow";
      followBtn.style.background = "#e4e6eb";
      followBtn.style.color = "black";
    }
  }
  updateFollowBtn();
  followBtn.onclick = () => {
    if (myFollows.includes(targetUser.email)) {
      myFollows = myFollows.filter(e => e !== targetUser.email);
    } else {
      myFollows.push(targetUser.email);
    }
    follows[me.email] = myFollows;
    localStorage.setItem("mutarii_follows", JSON.stringify(follows));
    updateFollowBtn();
  };
  let allPosts = JSON.parse(localStorage.getItem("mutarii_posts") || "[]");
  let theirPosts = allPosts.filter(p => p.email === targetUser.email);
  let container = document.getElementById("userPosts");
  if (theirPosts.length === 0) {
    container.innerHTML = `<div class="card" style="text-align:center; color:#65676b;">No posts yet from ${targetUser.name}</div>`;
  } else {
    theirPosts.forEach(p => {
      let mediaHtml = "";
      if (p.img) {
        if (p.isVideo) mediaHtml = `<video class="post-img" src="${p.img}" controls></video>`;
        else mediaHtml = `<img class="post-img" src="${p.img}">`;
      }
      container.innerHTML += `
        <div class="card">
          <div class="profile-row">${avatarHTML(targetUser)}<div><b>${p.name}</b><div style="font-size:12px; color:#65676b;">${p.time}</div></div></div>
          <p style="margin-top:10px;">${p.text}</p>
          ${mediaHtml}
          <p style="margin-top:10px; font-size:14px; color:#65676b;">👍 ${p.likes} Likes &nbsp; 💬 ${p.comments.length} Comments</p>
        </div>`;
    });
  }
}