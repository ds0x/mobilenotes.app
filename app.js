const tagListEl=document.getElementById("tag-list");
const postsEl=document.getElementById("post-list");
const contentEl=document.getElementById("post-content");
const searchEl=document.getElementById("search");

let POSTS=[];
let activeTag="All";
let activePost=null;
let readState=JSON.parse(localStorage.getItem("readState")||"{}");
let accent=localStorage.getItem("accent")||"#ffd60a";
document.documentElement.style.setProperty("--accent",accent);

async function loadPosts(){
 const files=["welcome.md","offline.md"];
 for(const f of files){
  const raw=await fetch(`posts/${f}`).then(r=>r.text());
  POSTS.push(parsePost(raw,f));
 }
 POSTS.sort((a,b)=>b.date-a.date);
}

function parsePost(raw,file){
 const m=raw.match(/---([\s\S]*?)---([\s\S]*)/);
 const meta={};
 m[1].trim().split("\n").forEach(l=>{
  const [k,...v]=l.split(":");
  meta[k.trim()]=v.join(":").trim();
 });
 return{
  id:file.replace(".md",""),
  title:meta.title,
  date:new Date(meta.date),
  tags:meta.tags.split(",").map(t=>t.trim()),
  body:m[2].trim(),
  preview:m[2].replace(/[#>*_]/g,"").slice(0,80)
 };
}

function group(date){
 const d=new Date(date);
 const now=new Date();
 const diff=(now-d)/(1000*60*60*24);
 if(diff<1) return "Today";
 if(diff<2) return "Yesterday";
 if(diff<7) return "Last 7 Days";
 return "Older";
}

function renderTags(){
 const tags=["All",...new Set(POSTS.flatMap(p=>p.tags))];
 tagListEl.innerHTML="";
 tags.forEach(t=>{
  const d=document.createElement("div");
  d.className="tag"+(t===activeTag?" active":"");
  d.textContent=t;
  d.onclick=()=>{activeTag=t;renderTags();renderPosts()};
  tagListEl.appendChild(d);
 });
}

function renderPosts(){
 postsEl.innerHTML="";
 let list=activeTag==="All"?POSTS:POSTS.filter(p=>p.tags.includes(activeTag));
 const q=searchEl.value.toLowerCase();
 if(q) list=list.filter(p=>p.title.toLowerCase().includes(q));
 const groups={};
 list.forEach(p=>{
  const g=group(p.date);
  groups[g]=groups[g]||[];
  groups[g].push(p);
 });
 ["Today","Yesterday","Last 7 Days","Older"].forEach(g=>{
  if(!groups[g]) return;
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
   t.innerHTML=`<strong>${p.title}</strong><div class="post-preview">${p.preview}...</div>`;
   d.appendChild(t);
   d.onclick=()=>openPost(p);
   postsEl.appendChild(d);
  });
 });
}

function openPost(p){
 activePost=p;
 readState[p.id]=true;
 localStorage.setItem("readState",JSON.stringify(readState));
 history.replaceState(null,"",`#${p.id}`);
 contentEl.innerHTML=p.body;
 renderPosts();
}

searchEl.oninput=renderPosts;
document.getElementById("toggle-tags").onclick=()=>document.getElementById("tags").classList.toggle("collapsed");
document.getElementById("back").onclick=()=>history.back();
document.getElementById("fullscreen").onclick=()=>document.documentElement.requestFullscreen();
document.getElementById("about").onclick=()=>{
 contentEl.innerHTML=`<h2>About MobileNotes</h2>`;
};
document.getElementById("share").onclick=async()=>{
 if(!activePost) return;
 await navigator.clipboard.writeText(location.href);
};

(async()=>{
 await loadPosts();
 renderTags();
 renderPosts();
 if(location.hash){
  const p=POSTS.find(x=>x.id===location.hash.slice(1));
  if(p) openPost(p);
 }
 if(!activePost) openPost(POSTS[0]);
})();