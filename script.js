// Particle Background
window.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('particle-container');

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 400;

  const renderer = new THREE.WebGLRenderer({ alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  const particles = new THREE.BufferGeometry();
  const particleCount = 1000;
  const positions = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 800;
  }

  particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({ color: 0xffffff, size: 2 });
  const particleSystem = new THREE.Points(particles, material);
  scene.add(particleSystem);

  function animate() {
    requestAnimationFrame(animate);
    particleSystem.rotation.y += 0.002;
    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
});

// Attendance Logic
function showPage(pageId) {
  document.getElementById('overallPage').style.display = 'none';
  document.getElementById('subjectPage').style.display = 'none';
  document.getElementById(pageId).style.display = 'block';
}

function calculateOverall() {
  let attended = parseFloat(document.getElementById("attended").value);
  let taken = parseFloat(document.getElementById("taken").value);
  let skip = parseFloat(document.getElementById("skip").value);

  if (isNaN(attended) || isNaN(taken) || isNaN(skip) || taken === 0) {
    document.getElementById("overallResult").innerHTML = "Please fill all fields correctly.";
    return;
  }

  let newAttendance = (attended / (taken + skip)) * 100;
  document.getElementById("overallResult").innerHTML = "New Attendance: " + newAttendance.toFixed(2) + "%";
}

// Subject-wise Attendance
let subjectsContainer = document.getElementById("subjectsContainer");
let maxSubjects = 7;
let subjects = ["OS", "DBMS", "CN", "AI", "Python", "C", "Java"];
let addedSubjects = 0;

addSubject();

function addSubject() {
  if (addedSubjects >= maxSubjects) return;
  let subjectName = subjects[addedSubjects];
  let div = document.createElement("div");
  div.className = "subject-block";
  div.innerHTML = `
    <label>${subjectName} - Total Classes:</label>
    <input type="number" id="subTotal${addedSubjects}" placeholder="Total classes">
    <label>${subjectName} - Attended Classes:</label>
    <input type="number" id="subAttended${addedSubjects}" placeholder="Attended classes">
  `;
  subjectsContainer.appendChild(div);
  addedSubjects++;
}

function openSubjectAttendance() {
  let subjectData = [];
  for (let i = 0; i < addedSubjects; i++) {
    let total = parseInt(document.getElementById(`subTotal${i}`).value);
    let attended = parseInt(document.getElementById(`subAttended${i}`).value);
    if (!isNaN(total) && total > 0) {
      let percentage = ((attended / total) * 100).toFixed(2);
      let status = (percentage < 75) ? "⚠️ Low" : "✅ Good";
      subjectData.push({ subject: subjects[i], percentage, status });
    }
  }

  if (subjectData.length === 0) {
    alert("Enter data!");
    return;
  }

  let newWin = window.open("", "_blank");
  newWin.document.write(`<html><head><title>Subjects</title>
    <style>
      body {
        font-family: 'Poppins', sans-serif;
        padding: 2rem;
        background: linear-gradient(135deg, #00BFFF, #FF00FF);
        color: #fff;
      }
      .card {
        background: rgba(255,255,255,0.15);
        padding: 1rem;
        margin: 1rem 0;
        border-radius: 12px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
      }
      h2 {
        color: #fff;
      }
    </style></head><body><h2>Subject-wise Attendance</h2>`);

  subjectData.forEach(s => {
    newWin.document.write(`<div class="card"><strong>${s.subject}</strong><br>${s.percentage}% ${s.status}</div>`);
  });

  newWin.document.write("</body></html>");
  newWin.document.close();
}



