// ===== VANTA HALO BACKGROUND =====
window.addEventListener("DOMContentLoaded", () => {
 
});

// ===== PAGE SWITCH =====
function showPage(id) {
  document.querySelectorAll(".card").forEach(c => c.style.display = "none");
  document.getElementById(id).style.display = "block";
}

// ===== PROGRESS BAR =====
function updateProgress(bar, value) {
  bar.style.width = `${Math.min(value, 100)}%`;
  if (value < 50) bar.style.background = "#FF4C4C";
  else if (value < 75) bar.style.background = "#FFD700";
  else bar.style.background = "#00FF7F";
}

// ===== CONFETTI =====
function launchConfetti() {
  const colors=["#FF4C4C","#00FFAA","#FFD700","#00BFFF","#FF69B4","#FF8C00"];
  for(let i=0;i<80;i++){
    let conf=document.createElement("div");
    conf.className="confetti";
    conf.style.left=Math.random()*window.innerWidth+"px";
    conf.style.width=conf.style.height=6+Math.random()*6+"px";
    conf.style.background=colors[Math.floor(Math.random()*colors.length)];
    document.body.appendChild(conf);
    conf.animate([
      { transform:`translateY(0px) rotate(0deg)`, opacity:1 },
      { transform:`translateY(${window.innerHeight+50}px) rotate(${Math.random()*720}deg)`, opacity:0 }
    ], { duration: 3000+Math.random()*2000, easing: "linear" });
    setTimeout(()=>conf.remove(), 5000);
  }
}

// ===== SHAKE SCREEN =====
function shakeScreen(el=document.body) {
  el.classList.add("shake");
  setTimeout(()=>el.classList.remove("shake"),400);
}

// ===== AUDIO =====
const soundConfetti = new Audio("https://www.myinstants.com/media/sounds/1gift-confetti.mp3");
const soundBuzzer = new Audio("https://www.myinstants.com/media/sounds/buzzer_message.mp3");

// Ensure they preload
soundConfetti.preload = "auto";
soundBuzzer.preload = "auto";

let audioAllowed = false;
function unlockAudio() {
  if (!audioAllowed) {
    // Fully buffer both sounds
    soundBuzzer.play().then(() => {
      soundBuzzer.pause();
      soundBuzzer.currentTime = 0;
    }).catch(() => {});

    soundConfetti.play().then(() => {
      soundConfetti.pause();
      soundConfetti.currentTime = 0;
    }).catch(() => {});

    audioAllowed = true;
  }
}

["click", "touchstart", "keydown"].forEach(event => {
  document.body.addEventListener(event, unlockAudio, { once: true });
});

function playConfettiSound() { if(audioAllowed) soundConfetti.play().catch(e=>console.error(e)); }
function playBuzzerSound() { if(audioAllowed) soundBuzzer.play().catch(e=>console.error(e)); }


// ===== CALCULATE OVERALL =====
function calculateOverall() {
  const attended = parseFloat(document.getElementById("attended").value);
  const taken = parseFloat(document.getElementById("taken").value);
  const skip = parseFloat(document.getElementById("skip").value);
  const result = document.getElementById("overallResult");
  const progress = document.getElementById("overallProgress");

  if(isNaN(attended)||isNaN(taken)||isNaN(skip)||taken<=0){
    result.innerHTML="⚠️ Please fill all fields correctly.";
    result.style.color="#FF4C4C";
    return;
  }

  const newAtt = (attended / (taken + skip)) * 100;
  result.innerHTML = `📊 New Attendance: <strong>${newAtt.toFixed(2)}%</strong>`;
  updateProgress(progress,newAtt);

  if(newAtt >= 90){
    playConfettiSound();
    result.innerHTML += " 🎉 Excellent Attendance!";
    launchConfetti();
  } else if(newAtt < 75){
    playBuzzerSound();
    result.innerHTML += " ⚠️ Low Attendance!";
    shakeScreen();
  } else {
    result.style.color = "#FFD700";
  }
}

// ===== SUBJECT-WISE CALCULATOR =====
let subjectsContainer = document.getElementById("subjectsContainer");
let subjects = ["OS","DBMS","CN","AI","Python","C","Java"];
let addedSubjects = 0;

function addSubject(){
  if(addedSubjects >= subjects.length) return;
  let div=document.createElement("div");
  div.className="subject-block";
  div.innerHTML=`
    <label>${subjects[addedSubjects]} - Total Classes:</label>
    <input type="number" id="subTotal${addedSubjects}" placeholder="Total classes">
    <label>${subjects[addedSubjects]} - Attended Classes:</label>
    <input type="number" id="subAttended${addedSubjects}" placeholder="Attended classes">
  `;
  subjectsContainer.appendChild(div);
  addedSubjects++;
}

function calculateSubjectAttendance(){
  let resultsDiv=document.getElementById("subjectResults");
  if(!resultsDiv){
    resultsDiv=document.createElement("div");
    resultsDiv.id="subjectResults";
    subjectsContainer.appendChild(resultsDiv);
  }
  resultsDiv.innerHTML="";

  for(let i=0;i<addedSubjects;i++){
    let total=parseFloat(document.getElementById(`subTotal${i}`).value);
    let attended=parseFloat(document.getElementById(`subAttended${i}`).value);
    if(isNaN(total)||isNaN(attended)||total<=0){
      alert("Enter valid numbers for all subjects!");
      return;
    }

    let percentage=(attended/total*100).toFixed(2);
    let status = (percentage<75) ? "⚠️ Low" : "✅ Good";

    let card = document.createElement("div");
    card.className="card";
    card.innerHTML=`<strong>${subjects[i]}</strong> - <span>${percentage}%</span> ${status}`;
    let progBar = document.createElement("div");
    progBar.className="progress-container";
    progBar.innerHTML=`<div class="progress-bar" style="width:${percentage}%"></div>`;
    card.appendChild(progBar);
    resultsDiv.appendChild(card);

    if(percentage >= 90){
      playConfettiSound();
      launchConfetti();
    } else if(percentage < 75){
      playBuzzerSound();
      shakeScreen(card);
    }
  }
}

// Auto-add first subject
addSubject();

