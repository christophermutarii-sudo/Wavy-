requireLogin();
let me = getCurrentUser();

function userCard(u) {
  return `
    <div class="profile-row" style="margin:12px 0; cursor:pointer;" onclick="location.href='user.html?email=${encodeURIComponent(u.email)}'">
      ${avatarHTML(u)}
      <div>
        <b>${u.name}</b>
        <div style="font-size:12px; color:#65676b;">${u.bio}</div>
        <div style="font-size:11px; color:#65676b;">${u.email}</div>
      </div>
      <div style="margin-left:auto; color:#1877f2; font-weight:bold;">View →</div>
    </div>
    <hr style="border:1px solid #eee;">`;
}

function showAllUsers() {
  let users = getUsers().filter(u => u.email !== me.email);
  let container = document.getElementById("allUsers");
  if (users.length === 0) {
    container.innerHTML = `<p style="color:#65676b; text-align:center;">No other users yet. Invite your friends to join!</p>`;
    return;
  }
  container.innerHTML = "";
  users.forEach(u => { container.innerHTML += userCard(u); });
}

function doSearch() {
  let q = document.getElementById("searchInput").value.trim().toLowerCase();
  let resultsBox = document.getElementById("results");
  let allCard = document.getElementById("allUsersCard");
  if (!q) {
    resultsBox.innerHTML = "";
    allCard.style.display = "block";
    return;
  }
  allCard.style.display = "none";
  let found = getUsers().filter(u => u.email !== me.email && (u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)));
  if (found.length === 0) {
    resultsBox.innerHTML = `<div class="card" style="text-align:center; color:#65676b;">No person found for "${q}"</div>`;
    return;
  }
  resultsBox.innerHTML = `<div class="card"><h3>Results (${found.length})</h3><div id="searchList"></div></div>`;
  let list = document.getElementById("searchList");
  found.forEach(u => { list.innerHTML += userCard(u); });
}
showAllUsers();