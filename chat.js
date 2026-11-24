requireLogin();
let me = getCurrentUser();
let params = new URLSearchParams(location.search);
let chattingWith = params.get("to");
let allChats = JSON.parse(localStorage.getItem("mutarii_chats") || "{}");

function getChatKey(email1, email2) { return [email1, email2].sort().join("___"); }
function saveChats() { localStorage.setItem("mutarii_chats", JSON.stringify(allChats)); }

function showPeople() {
  let users = getUsers().filter(u => u.email !== me.email);
  let list = document.getElementById("peopleList");
  if (users.length === 0) {
    list.innerHTML = `<p style="color:#65676b; text-align:center;">No people yet.<br><a href="search.html">Find people to chat with</a></p>`;
    return;
  }
  list.innerHTML = "";
  users.forEach(u => {
    let key = getChatKey(me.email, u.email);
    let msgs = allChats[key] || [];
    let lastMsg = msgs.length > 0 ? msgs[msgs.length - 1].text : "Start chatting...";
    if (lastMsg.length > 35) lastMsg = lastMsg.substring(0, 35) + "...";
    list.innerHTML += `
      <div class="profile-row" style="margin:12px 0; cursor:pointer;" onclick="openChat('${u.email}')">
        ${avatarHTML(u)}
        <div><b>${u.name}</b><div style="font-size:12px; color:#65676b;">${lastMsg}</div></div>
        <div style="margin-left:auto; color:#1877f2; font-weight:bold;">💬</div>
      </div>
      <hr style="border:1px solid #eee;">`;
  });
}

function openChat(email) {
  chattingWith = email;
  history.replaceState(null, "", "chat.html?to=" + encodeURIComponent(email));
  let other = getUserByEmail(email);
  if (!other) return;
  document.getElementById("peopleListCard").style.display = "none";
  document.getElementById("chatWindow").style.display = "block";
  document.getElementById("chatAvatarWrap").innerHTML = avatarHTML(other);
  document.getElementById("chatName").innerText = other.name;
  showMessages();
}

function backToList() {
  document.getElementById("peopleListCard").style.display = "block";
  document.getElementById("chatWindow").style.display = "none";
  chattingWith = null;
  history.replaceState(null, "", "chat.html");
  showPeople();
}

function showMessages() {
  if (!chattingWith) return;
  let key = getChatKey(me.email, chattingWith);
  let msgs = allChats[key] || [];
  let box = document.getElementById("messages");
  if (msgs.length === 0) {
    box.innerHTML = `<p style="text-align:center; color:#65676b; margin-top:50px;">Say Hi<br>No messages yet.</p>`;
    return;
  }
  box.innerHTML = "";
  msgs.forEach(m => {
    let isMine = m.from === me.email;
    let bg = isMine ? "#1877f2" : "#e4e6eb";
    let color = isMine ? "white" : "black";
    let align = isMine ? "margin-left:auto; text-align:right;" : "margin-right:auto;";
    box.innerHTML += `<div style="background:${bg}; color:${color}; padding:10px 14px; border-radius:18px; margin:8px 0; max-width:75%; ${align}">${m.text}<div style="font-size:10px; opacity:0.7; margin-top:3px;">${m.time}</div></div>`;
  });
  box.scrollTop = box.scrollHeight;
}

function sendMessage() {
  let input = document.getElementById("msgInput");
  let text = input.value.trim();
  if (!text || !chattingWith) return;
  let key = getChatKey(me.email, chattingWith);
  if (!allChats[key]) allChats[key] = [];
  allChats[key].push({ from: me.email, text: text, time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) });
  saveChats();
  input.value = "";
  showMessages();
}

document.getElementById("msgInput").addEventListener("keypress", function(e) { if (e.key === "Enter") sendMessage(); });
if (chattingWith) { openChat(chattingWith); } else { showPeople(); }