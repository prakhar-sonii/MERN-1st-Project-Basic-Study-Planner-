let subjects = JSON.parse(localStorage.getItem("subjects")) || [];
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

function showSection(id) {
  document.querySelectorAll('.section').forEach(sec => sec.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
}

function addSubject() {
  const name = document.getElementById("subjectName").value;
  const priority = document.getElementById("priority").value;

  subjects.push({ name, priority });
  localStorage.setItem("subjects", JSON.stringify(subjects));
  renderSubjects();
}

function renderSubjects() {
  const list = document.getElementById("subjectList");
  list.innerHTML = "";
  subjects.forEach((s, i) => {
    list.innerHTML += `<li>${s.name} (${s.priority})
  });
}

function deleteSubject(i) {
  subjects.splice(i, 1);
  localStorage.setItem("subjects", JSON.stringify(subjects));
  renderSubjects();
}

function addTask() {
  const name = taskName.value;
  const deadline = document.getElementById("deadline").value;

  tasks.push({ name, deadline, done: false });
  localStorage.setItem("tasks", JSON.stringify(tasks));
}


renderSubjects();

