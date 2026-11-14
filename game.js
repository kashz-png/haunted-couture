const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const screens=["#title-screen","#character-screen","#scroll-screen","#game-screen","#case-screen","#ending-screen","#settings-screen","#credits-screen"];
let state={character:"Celeste",room:"showroom",clues:[],talked:[],file:false,accused:false,music:false,sfx:true,chapter:1};
const clueData={
showroom:[["Mannequin tag","A tag is pinned beneath the collar: 'The Last Stitch'. The name of the collection that was being prepared by Madame Rose. The collection was never publicaly released.","tag"],["Locked display cabinet","The cabinet is locked. A tiny engraved rose sits beside the keyhole.","cabinet"]],
sewing:[["Hidden note","A note is tucked beneath the pattern table: 'The original sketches were never Madame Rose's.'","note"],["Marked sketch","A sketch catches your attention that bears the initials R.V. in the corner. The ink is newer than the paper.","sketch"]],
office:[["Investor letter","A letter from Zain Lucien demands the sale of Maison Noire. He writes that the collection belongs in his hands.","letter"],["Financial record","A payment record shows a transfer to an account linked to Romaisa Vale.","record"]],
fitting:[["Secret diary","Behind a loose panel is Madame Rose's diary. She planned to reveal who truly designed The Last Stitch.","diary"],["Archive key","Your reflection smiles a moment later than you do. You investigate and find a small brass key hung behind the mirror. It may open the locked cabinet.","key"]]
};
const roomNames={showroom:"The Showroom",sewing:"The Sewing Room",office:"The Office",fitting:"Private Fitting Room"};
const roomDescriptions={showroom:"Strange mannequins stand beneath the chandelier. One dress looks almost finished.",sewing:"Patterns cover the table. A half-finished gown hangs beside the old sewing machine.",office:"Letters, photographs and financial records have been left in careful stacks.",fitting:"The private fitting room smells faintly of rosewater. A mirror stands slightly crooked."};
const suspects={
Romaisa:{title:"Romaisa Vale",portrait:"romaisa",text:"I worked for Madame Rose, yes. But I left Maison Noire long ago. I know nothing about a missing collection.",follow:"Her handwriting appears on a recent letter. She looks away when you mention the original sketches."},
Zain:{title:"Zain Lucien",portrait:"zain",text:"I offered to purchase the boutique. Madame Rose refused. That hardly makes me responsible for her disappearance.",follow:"He admits he argued with Madame Rose, but insists the collection was his investment."},
Amara:{title:"Amara Bell",portrait:"amara",text:"I modelled for Madame Rose years ago. She trusted me with more than dresses but i know nothing about her disappearance.",follow:"She says that Romaisa was desperate to get the original designs out of the boutique and sell them to Zain."}
}
function show(sel){screens.forEach(s=>$(s).classList.add("hidden"));$(sel).classList.remove("hidden");$("#modal-layer").classList.add("hidden")}
function sound(){if(state.sfx){try{let c=new(window.AudioContext||window.webkitAudioContext)(),o=c.createOscillator(),g=c.createGain();o.connect(g);g.connect(c.destination);o.frequency.value=520;g.gain.value=.035;o.start();o.stop(c.currentTime+.07)}catch(e){}}}
function save(){localStorage.setItem("hauntedCoutureSave",JSON.stringify(state));$("#save-btn").textContent="Saved ✓";setTimeout(()=>$("#save-btn").textContent="Save",1300)}
function load(){try{let x=JSON.parse(localStorage.getItem("hauntedCoutureSave"));if(x)state={...state,...x}}catch(e){}}
function start(){show("#character-screen")}
function choose(name){state.character=name;show("#scroll-screen")}
function begin(){show("#game-screen");renderRoom()}
function renderRoom(){
$("#room-title").textContent=roomNames[state.room];$("#room-subtitle").textContent="Maison Noire • 11:47 PM";$("#chapter-eyebrow").textContent="CHAPTER "+(state.room==="showroom"?2:3);$("#chapter-label").textContent=roomNames[state.room];$("#hintline").textContent=roomDescriptions[state.room];
let art=$("#room-art");art.className="room-art "+state.room;let spots=$("#hotspots");spots.innerHTML="";
let positions={showroom:[["Mannequin tag","tag",42,54],["Display cabinet","cabinet",72,39]],sewing:[["Pattern table","note",16,58],["Old sketch","sketch",62,50]],office:[["Investor letter","letter",16,50],["Financial records","record",66,56]],fitting:[["Loose wall panel","diary",73,44],["Mirror","key",35,35]]};
positions[state.room].forEach(([label,id,x,y])=>{let b=document.createElement("button");b.className="hotspot";b.textContent="✦ "+label;b.style.left=x+"%";b.style.top=y+"%";b.onclick=()=>interact(id);spots.append(b)});
let nav=$("#room-nav");nav.innerHTML="";Object.entries(roomNames).forEach(([id,name])=>{let b=document.createElement("button");b.textContent=name;b.disabled=id===state.room;b.onclick=()=>{state.room=id;sound();renderRoom();save()};nav.append(b)});
renderLists();
}
function renderLists(){
const entries=state.clues.map(x=>"<li>"+x+"</li>").join("");
$("#clue-list").innerHTML=entries||"<li class='muted'>No clues found yet.</li>";
$("#inventory-list").innerHTML=entries||"<li class='muted'>Nothing collected yet.</li>";
const total=9;
$("#progress-count").textContent=state.clues.length+" / "+total;
$("#progress-bar").style.width=Math.min(100,state.clues.length/total*100)+"%";
}
function modal(kind, title, text, portrait = "✦", options = []) {
  $("#dialogue-kind").textContent = kind;
  $("#dialogue-title").textContent = title;
  $("#dialogue-text").textContent = text;

  const portraitBox = $("#portrait");

  portraitBox.className = "portrait";

  const suspectPortraits = ["romaisa", "zain", "amara"];

  if (suspectPortraits.includes(portrait)) {
    portraitBox.classList.add(portrait);
    portraitBox.textContent = "";
  } else {
    portraitBox.textContent = portrait;
  }

  let box = $("#dialogue-options");
  box.innerHTML = "";

  options.forEach(([label, fn]) => {
    let b = document.createElement("button");
    b.textContent = label;
    b.onclick = fn;
    box.append(b);
  });

  $("#modal-layer").classList.remove("hidden");
  sound();
}
function closeModal(){$("#modal-layer").classList.add("hidden")}
function interact(id){
if(id==="cabinet"){if(state.clues.includes("Archive key")){state.file=true;modal("IMPORTANT DISCOVERY","The Missing File","The brass key turns. Inside is the missing file: The original designs, and proof that Madame Rose did not make the collection. The designs were stolen from a young designer and Madame Rose had been planning on revealing the truth. It also reveals that Romaisa had secretly taken the original designs and planned to sell them to Zain. Amara discovered the plan and tried to warn Madame Rose. Madame Rose decided to disappear from the boutique and Amara arranged for her to leave secretly. She hid the evidence throughout the boutique. The missing file is the final piece of proof.","✧",[["Add file to evidence",()=>{if(!state.clues.includes("Missing file"))state.clues.push("Missing file");state.file=true;closeModal();renderLists();save()}]]);}else modal("LOCKED","Display Cabinet","The cabinet is locked. Find a key somewhere in Maison Noire.");return}
let item=Object.values(clueData).flat().find(x=>x[2]===id);if(!item)return;
if(state.clues.includes(item[0])){modal("JOURNAL",item[0],"You have already examined this. "+item[1]);return}
modal("CLUE DISCOVERED",item[0],item[1],"✦",[["Add to journal",()=>{state.clues.push(item[0]);closeModal();renderLists();save();if(state.clues.length>=4)$("#journal-text").textContent="The clues point to a betrayal involving the original designs. Speak to the people involved."; }]]);
}
function talk(name){
let s=suspects[name];if(!s)return;
if(!state.talked.includes(name))state.talked.push(name);
let follow=s.follow;
if(name==="Romaisa"&&state.clues.includes("Marked sketch"))follow="You mention the R.V. initials on the original sketch. Romaisa says the letters could belong to anyone, but her answer comes too quickly.";
if(name==="Zain"&&state.clues.includes("Financial record"))follow="You show him the payment record. Zain admits he arranged a payment through an intermediary, but claims he never met Romaisa about the designs.";
if(name==="Amara"&&state.clues.includes("Secret diary"))follow="You tell her about Madame Rose's diary. Amara confirms that Madame Rose planned to reveal the theft and says Romaisa was afraid of being exposed.";
save();
modal("INTERROGATION",s.title,s.text,s.portrait,[["Ask about the collection",()=>modal("INTERROGATION",s.title,follow,s.portrait,[["Ask one more question",()=>modal("INTERROGATION",s.title,"Is there anything else you can tell me?",s.portrait,[["Return",closeModal]])],["Return",closeModal]])],["Return",closeModal]]);
}
function caseBoard(){
if(state.clues.length<5){
  modal("CASE BOARD","Not enough evidence","Collect at least five clues before making a serious accusation. Explore every room and question the suspects.","✦");
  return;
}
show("#case-screen");let board=$("#evidence-board");board.innerHTML="";
(state.clues.length?state.clues:["No evidence collected yet"]).forEach((c,i)=>{let d=document.createElement("div");d.className="evidence-note";d.style.setProperty("--tilt",(i%2?2:-2)+"deg");d.textContent=c;board.append(d)});
}
function ending(type){
show("#ending-screen");let title="",text="";
if(type==="Romaisa"&&state.file&&state.clues.length>=5){title="The Truth Revealed";text="You connect the payment record, the marked sketch, Amara's warning and the missing file. Romaisa's plan is exposed. Madame Rose returns, the stolen designs are recovered, and the truth is finally made public."}
else if(type==="Romaisa"&&!state.file&&state.clues.length>=5){title="The Secret Kept";text="You understand what happened, but choose not to expose it without the missing file. Maison Noire remains open, and the collection stays hidden."}
else if(type!=="Romaisa"){title="Wrong Accusation";text="Your accusation sends suspicion in the wrong direction. The real culprit slips away, and the missing file vanishes forever."}
else{title="The Final Collection";text="You find the file but misunderstand the clues. The collection is released under Romaisa's name, and Zain's reputation is restored on a lie."}
$("#ending-title").textContent=title;$("#ending-text").textContent=text;state.accused=true;save();
}
$$(".choose-character").forEach(b=>b.onclick=()=>choose(b.closest(".character-card").dataset.character));
$("#play-btn").onclick=start;$("#select-btn").onclick=start;$("#begin-btn").onclick=begin;$("#settings-btn").onclick=()=>show("#settings-screen");$("#credits-btn").onclick=()=>show("#credits-screen");
$$("[data-back]").forEach(b=>b.onclick=()=>show("#title-screen"));
$("#close-modal").onclick=closeModal;$("#save-btn").onclick=save;$("#case-board-btn").onclick=caseBoard;$("#case-back").onclick=()=>show("#game-screen");$("#restart-btn").onclick=()=>{state={character:"Celeste",room:"showroom",clues:[],talked:[],file:false,accused:false,music:false,sfx:true,chapter:1};save();show("#title-screen")};
$$("[data-tab]").forEach(b=>b.onclick=()=>{$$(".tab").forEach(x=>x.classList.remove("active"));b.classList.add("active");["journal","inventory","suspects"].forEach(t=>$("#"+t+"-tab").classList.toggle("hidden",t!==b.dataset.tab))});
$$("[data-suspect]").forEach(b=>b.onclick=()=>talk(b.dataset.suspect));
$$("[data-accuse]").forEach(b=>b.onclick=()=>ending(b.dataset.accuse));
$("#sound-toggle").onclick=()=>{state.sfx=!state.sfx;$("#sound-toggle").textContent="♪ SFX: "+(state.sfx?"On":"Off");save()};
$("#text-size").onchange=e=>document.body.style.fontSize=e.target.value==="large"?"19px":"16px";
$("#case-board-btn").addEventListener("click",()=>sound());
document.addEventListener("DOMContentLoaded", () => {
  console.log("Hey reader, this game was a struggle to make and my brain hurts but atleast it's done so yayy! (ig *rolls eyes*)");
});