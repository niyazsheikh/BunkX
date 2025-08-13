/* script.js — Attendance PWA logic in one file */
const STORAGE_KEY="attendx-v1";
const defaultState={overall:{total:40,attended:36,plannedLeaves:0},subjects:[]};
let state=loadState();

// DOM refs
const totalInput=document.getElementById("total-classes"),
      attendedInput=document.getElementById("attended-classes"),
      plannedLeavesInput=document.getElementById("planned-leaves"),
      skipRange=document.getElementById("skip-sim"),
      skipValueLabel=document.getElementById("skip-value"),
      currentPercentEl=document.getElementById("current-percent"),
      simResultEl=document.getElementById("sim-result"),
      safeSuggestionEl=document.getElementById("safe-suggestion"),
      subjectsList=document.getElementById("subjects-list"),
      addSubjectBtn=document.getElementById("add-subject-btn"),
      clearBtn=document.getElementById("clear-btn"),
      subjectTemplate=document.getElementById("subject-template");

      function calculateAttendance() {
    let total = parseInt(document.getElementById("totalClasses").value);
    let attended = parseInt(document.getElementById("attendedClasses").value);
    let skip = parseInt(document.getElementById("skipClasses").value) || 0;

    if (isNaN(total) || isNaN(attended) || total <= 0 || attended < 0) {
        document.getElementById("result").innerHTML = "⚠ Please enter valid numbers.";
        return;
    }

    let newTotal = total + skip;
    let newAttended = attended;
    let percentage = ((newAttended / newTotal) * 100).toFixed(2);

    let message = `If you skip ${skip} classes, your attendance will be ${percentage}%.`;

    if (percentage < 75) {
        message += " ❌ Below safe limit!";
    } else {
        let safeSkips = Math.floor((attended / 0.75) - total);
        message += ` ✅ You can skip up to ${safeSkips} classes safely.`;
    }

    document.getElementById("result").innerHTML = message;
}

function addSubject() {
    const container = document.getElementById("subjectsContainer");

    const div = document.createElement("div");
    div.classList.add("subject-box");
    div.innerHTML = `
        <input type="text" placeholder="Subject Name">
        <input type="number" placeholder="Total Classes">
        <input type="number" placeholder="Attended Classes">
    `;
    container.appendChild(div);
}


// Init
function init(){
  totalInput.value=state.overall.total;
  attendedInput.value=state.overall.attended;
  plannedLeavesInput.value=state.overall.plannedLeaves;
  syncUI(); bindEvents(); renderSubjects(); registerServiceWorker();
}
function bindEvents(){
  [totalInput,attendedInput,plannedLeavesInput].forEach(el=>el.addEventListener("input",onOverallChange));
  skipRange.addEventListener("input",onSkipChange);
  addSubjectBtn.addEventListener("click",onAddSubject);
  clearBtn.addEventListener("click",onClear);
}
function onOverallChange(){
  const total=Math.max(0,parseInt(totalInput.value||0)),
        attended=Math.max(0,parseInt(attendedInput.value||0)),
        plannedLeaves=Math.max(0,parseInt(plannedLeavesInput.value||0));
  state.overall={total,attended,plannedLeaves};
  saveState(); syncUI(); renderSubjects();
}
function onSkipChange(){
  const skip=parseInt(skipRange.value||0);
  skipValueLabel.textContent=String(skip);
  computeSim(skip);
}
function computePercentage(attended,total){
  if(total<=0) return 0;
  return attended/total*100;
}
function computeSim(skip){
  const {total,attended}=state.overall;
  const newTotal=Math.max(total+skip,0);
  const percent=newTotal===0?0:(attended/newTotal)*100;
  simResultEl.textContent=`New %: ${percent.toFixed(2)}%`;
  const maxAllowedTotal=attended/0.75;
  const maxX=Math.floor(Math.max(0,maxAllowedTotal-total+1e-9));
  safeSuggestionEl.textContent=maxX>0?
    `Safe skip: You can skip up to ${maxX} class(es) and stay ≥ 75%`:
    `Safe skip: 0 — you will fall below 75% if you skip more`;
  const cur=computePercentage(attended,total);
  currentPercentEl.textContent=`${cur.toFixed(2)}%`;
  currentPercentEl.style.color=cur>=75?"":"var(--danger)";
}
function syncUI(){
  const {total,attended}=state.overall;
  const percent=computePercentage(attended,total);
  currentPercentEl.textContent=isNaN(percent)?"—%":`${percent.toFixed(2)}%`;
  currentPercentEl.style.color=percent>=75?"":"var(--danger)";
  computeSim(parseInt(skipRange.value||0));
}
function onAddSubject(){
  if(state.subjects.length>=7){alert("Maximum 7 subjects allowed.");return;}
  const name=prompt("Subject name (e.g., Math, Physics):")||`Subject ${state.subjects.length+1}`;
  const id="s"+Date.now();
  const subj={id,name,total:0,attended:0};
  state.subjects.push(subj); saveState(); renderSubjects();
}
function onClear(){
  if(!confirm("Reset all data to default?")) return;
  state=JSON.parse(JSON.stringify(defaultState));
  saveState(); init();
}
function renderSubjects(){
  subjectsList.innerHTML="";
  state.subjects.forEach(subj=>{
    const tpl=subjectTemplate.content.cloneNode(true);
    const card=tpl.querySelector(".subject-card"),
          title=card.querySelector(".subject-title"),
          attendedSpan=card.querySelector(".attended"),
          totalSpan=card.querySelector(".total"),
          progBar=card.querySelector(".progress-bar"),
          inputAtt=card.querySelector(".input-attended"),
          inputTotal=card.querySelector(".input-total"),
          editBtn=card.querySelector(".edit-btn"),
          removeBtn=card.querySelector(".remove-btn");
    title.textContent=subj.name;
    attendedSpan.textContent=subj.attended;
    totalSpan.textContent=subj.total;
    inputAtt.value=subj.attended;
    inputTotal.value=subj.total;
    const pct=subj.total===0?0:(subj.attended/subj.total)*100;
    progBar.style.width=pct+"%"; setProgressColor(progBar,pct);
    inputAtt.addEventListener("input",e=>{
      const v=Math.max(0,parseInt(e.target.value||0));
      subj.attended=v; attendedSpan.textContent=v;
      updateSubjUI(subj,progBar,totalSpan); saveState();
    });
    inputTotal.addEventListener("input",e=>{
      const v=Math.max(0,parseInt(e.target.value||0));
      subj.total=v; totalSpan.textContent=v;
      updateSubjUI(subj,progBar,attendedSpan); saveState();
    });
    editBtn.addEventListener("click",()=>{
      const newName=prompt("Rename subject:",subj.name);
      if(newName&&newName.trim()){subj.name=newName.trim();title.textContent=subj.name;saveState();}
    });
    removeBtn.addEventListener("click",()=>{
      if(!confirm(`Remove ${subj.name}?`)) return;
      state.subjects=state.subjects.filter(s=>s.id!==subj.id);
      saveState(); renderSubjects();
    });
    subjectsList.appendChild(card);
  });
}
function updateSubjUI(subj,progBar){
  const pct=subj.total===0?0:(subj.attended/subj.total)*100;
  progBar.style.width=pct+"%";
  setProgressColor(progBar,pct);
}
function setProgressColor(el,pct){
  if(pct>=75) el.style.background="linear-gradient(90deg,var(--success), #34d399)";
  else if(pct>=70) el.style.background="linear-gradient(90deg,var(--warn), #f97316)";
  else el.style.background="linear-gradient(90deg,var(--danger), #f43f5e)";
}
function saveState(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state));}catch(e){console.error(e);}}
function loadState(){try{const raw=localStorage.getItem(STORAGE_KEY);if(!raw)return JSON.parse(JSON.stringify(defaultState));return JSON.parse(raw);}catch(e){console.error(e);return JSON.parse(JSON.stringify(defaultState));}}
function registerServiceWorker(){
  if("serviceWorker" in navigator){
    navigator.serviceWorker.register("sw.js")
    .then(reg=>console.log("SW registered",reg.scope))
    .catch(err=>console.warn("SW register failed",err));
  }
}
init();
