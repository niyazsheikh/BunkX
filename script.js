// Overall Attendance
function calculateDrop(){
    let attended = parseInt(document.getElementById("attended").value);
    let total = parseInt(document.getElementById("total").value);
    let skip = parseInt(document.getElementById("skip").value);
    let result = document.getElementById("result");
    if(isNaN(attended) || isNaN(total) || isNaN(skip) || total===0){
        result.innerHTML="Please enter valid numbers!"; return;
    }
    let newPercentage = ((attended)/(total+skip)*100).toFixed(2);
    result.innerHTML=`After skipping ${skip} classes, attendance = ${newPercentage}%`;
    if(newPercentage<75) result.innerHTML+=" ⚠️ Below safe limit"; else result.innerHTML+=" ✅ Safe to skip";
}

// Subject-wise Attendance
let subjectsContainer = document.getElementById("subjectsContainer");
let maxSubjects = 7;
let subjects = ["OS","DBMS","CN","AI","Python","C","Java"];
let addedSubjects = 0;

// Add default subject
addSubject();

// Add subject function
function addSubject(){
    if(addedSubjects >= maxSubjects) return;
    let subjectName = subjects[addedSubjects];
    let div = document.createElement("div");
    div.className = "input-group";
    div.innerHTML = `<label>${subjectName} - Total Classes:</label>
                     <input type="number" id="subTotal${addedSubjects}" placeholder="Total classes">
                     <label>${subjectName} - Attended Classes:</label>
                     <input type="number" id="subAttended${addedSubjects}" placeholder="Attended classes">`;
    subjectsContainer.appendChild(div);
    addedSubjects++;
}

// Open subject-wise attendance in new tab
function openSubjectAttendance(){
    let subjectData = [];
    for(let i=0;i<addedSubjects;i++){
        let total = parseInt(document.getElementById(`subTotal${i}`).value);
        let attended = parseInt(document.getElementById(`subAttended${i}`).value);
        if(!isNaN(total) && total>0){
            let percentage = ((attended/total)*100).toFixed(2);
            let status = (percentage<75)?"⚠️ Low":"✅ Good";
            subjectData.push({subject:subjects[i], percentage, status});
        }
    }
    if(subjectData.length===0){alert("Enter data!"); return;}
    let newWin = window.open("","_blank");
    newWin.document.write(`<html><head><title>Subjects</title>
    <style>
    body{font-family:'Inter',sans-serif; padding:2rem; background: linear-gradient(135deg, #00BFFF, #FF00FF); color:#fff;}
    .card{background: rgba(255,255,255,0.15); padding:1rem; margin:1rem 0; border-radius:12px; box-shadow:0 5px 15px rgba(0,0,0,0.3);}
    h2{color:#fff;}
    </style></head><body><h2>Subject-wise Attendance</h2>`);
    subjectData.forEach(s=>{
        newWin.document.write(`<div class="card"><strong>${s.subject}</strong><br>${s.percentage}% ${s.status}</div>`);
    });
    newWin.document.write("</body></html>");
}
