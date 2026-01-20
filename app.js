const tagsEl = document.getElementById("tags");
const postsEl = document.getElementById("posts");
const contentEl = document.getElementById("post-content");

let activeTag = "All";
let readState = JSON.parse(localStorage.getItem("readState") || "{}");

function saveReadState() {
  localStorage.setItem("readState", JSON.stringify(readState));
}

function renderTags() {
  const tags = [...new Set(POSTS.flatMap(p => p.tags))];
  tagsEl.innerHTML = "";
  tags.forEach(tag => {
    const div = document.createElement("div");
    div.className = "tag" + (tag === activeTag ? " active" : "");
    div.textContent = tag;
    div.onclick = () => {
      activeTag = tag;
      renderTags();
      renderPosts();
    };
    tagsEl.appendChild(div);
  });
}

function renderPosts() {
  postsEl.innerHTML = "";
  const filtered = POSTS.filter(p => p.tags.includes(activeTag));
  filtered.forEach((post, idx) => {
    const div = document.createElement("div");
    div.className = "post";
    if (!readState[post.id]) {
      const dot = document.createElement("div");
      dot.className = "unread-dot";
      div.appendChild(dot);
    }
    const text = document.createElement("div");
    text.innerHTML = `<strong>${post.title}</strong><div class="post-preview">${post.content.replace(/<[^>]+>/g, "").slice(0, 60)}...</div>`;
    div.appendChild(text);
    div.onclick = () => openPost(post);
    postsEl.appendChild(div);
    if (idx === 0) openPost(post);
  });
}

function openPost(post) {
  contentEl.innerHTML = post.content;
  readState[post.id] = true;
  saveReadState();
  renderPosts();
}

renderTags();
renderPosts();
