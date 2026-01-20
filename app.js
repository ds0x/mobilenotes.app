const tagsEl=document.getElementById("tags");
const postsEl=document.getElementById("post-list");
const contentEl=document.getElementById("post-content");
const searchEl=document.getElementById("search");

let activeTag="All";
let activePost=null;
let readState=JSON.parse(localStorage.getItem("readState")||"{}");
let accent=localStorage.getItem("accent")||"#ffd60a";

document.documentElement.style.setProperty("--accent",accent);
document.documentElement.style.setProperty("--accent-text","#1c1c1e");

function save(){localStorage.setItem("readState",JSON.stringify(readState))}

function renderTags(){
 const tags=["All",...new Set(POSTS.flatMap(p=>p.tags))];
 tagsEl.innerHTML="";
 tags.forEach(t=>{
  const d=document.createElement("div");
  d.className="tag"+(t===activeTag?" active":"");
  d.textContent=t;
  d.onclick=()=>{activeTag=t;renderTags();renderPosts()};
  tagsEl.appendChild(d);
 });
}

function groupByDate(posts){
 const groups={};
 posts.forEach(p=>{
  const d=new Date(p.date);
  const key=d.toDateString();
  groups[key]=groups[key]||[];
  groups[key].push(p);
 });
 return groups;
}

function renderPosts(){
 postsEl.innerHTML="";
 const q=searchEl.value.toLowerCase();
 let list=activeTag==="All"?POSTS:POSTS.filter(p=>p.tags.includes(activeTag));
 if(q) list=list.filter(p=>p.title.toLowerCase().includes(q));
 const groups=groupByDate(list);
 Object.keys(groups).sort((a,b)=>new Date(b)-new Date(a)).forEach(g=>{
  const h=document.createElement("div");
  h.className="group";
  h.textContent=g;
  postsEl.appendChild(h);
  groups[g].forEach(p=>{
   const d=document.createElement("div");
   d.className="post"+(activePost&&p.id===activePost.id?" active":"");
   if(!readState[p.id]){
    const dot=document.createElement("div");
    dot.className="unread-dot";
    d.appendChild(dot);
   }
   const t=document.createElement("div");
   t.innerHTML=`<strong>${p.title}</strong><div class="post-preview">${p.content.replace(/<[^>]+>/g,"").slice(0,60)}...</div>`;
   d.appendChild(t);
   d.onclick=()=>openPost(p);
   postsEl.appendChild(d);
  });
 });
}

function openPost(p){
 activePost=p;
 readState[p.id]=true;
 save();
 history.replaceState(null,"",`#${p.id}`);
 contentEl.innerHTML=p.content;
 renderPosts();
}

searchEl.oninput=renderPosts;

document.getElementById("toggle-tags").onclick=()=>tagsEl.classList.toggle("collapsed");
document.getElementById("back").onclick=()=>history.back();
document.getElementById("fullscreen").onclick=()=>document.documentElement.requestFullscreen();

document.getElementById("about").onclick=()=>{
 contentEl.innerHTML=`<div class="about">
 <h2>About MobileNotes</h2>
 <p>Accent color:</p>
 <div style="display:flex;gap:8px">
 ${["#ffd60a","#ff9f0a","#ff453a","#bf5af2","#64d2ff","#30d158","#0a84ff","#5e5ce6"]
   .map(c=>`<div class="color" style="background:${c}" onclick="setAccent('${c}')"></div>`).join("")}
 </div></div>`;
};

window.setAccent=c=>{
 localStorage.setItem("accent",c);
 document.documentElement.style.setProperty("--accent",c);
};

document.getElementById("share").onclick=async()=>{
 if(!activePost) return;
 const url=location.origin+location.pathname+"#"+activePost.id;
 await navigator.clipboard.writeText(url);
};

renderTags();
renderPosts();
if(location.hash){
 const p=POSTS.find(x=>x.id===location.hash.slice(1));
 if(p) openPost(p);
}
if(!activePost) openPost(POSTS[0]);
