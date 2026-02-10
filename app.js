

(function () {
  "use strict";
  const STORAGE_KEYS = {
    subjects: "ontime_subjects",
    tasks: "ontime_tasks",
    schedule: "ontime_schedule",
    settings: "ontime_settings",
  };

  function loadData(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function saveData(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error("LocalStorage save error:", e);
    }
  }

  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 6);
  }

  let subjects = loadData(STORAGE_KEYS.subjects) || [];
  let tasks = loadData(STORAGE_KEYS.tasks) || [];
  let schedule = loadData(STORAGE_KEYS.schedule) || [];
  let settings = loadData(STORAGE_KEYS.settings) || {
    darkMode: false,
    accent: "teal",
    reminders: true,
    reminderDays: 3,
  };

  const sidebar = document.getElementById("sidebar");
  const sidebarClose = document.getElementById("sidebarClose");
  const menuToggle = document.getElementById("menuToggle");
  const mainContent = document.getElementById("mainContent");
  const pageTitle = document.getElementById("pageTitle");
  const navItems = document.querySelectorAll(".nav-item");
  const themeToggleBtn = document.getElementById("themeToggleBtn");
  const modalOverlay = document.getElementById("modalOverlay");
  const modal = document.getElementById("modal");
  const modalTitle = document.getElementById("modalTitle");
  const modalBody = document.getElementById("modalBody");
  const modalFooter = document.getElementById("modalFooter");
  const modalClose = document.getElementById("modalClose");
  const toastContainer = document.getElementById("toastContainer");

  const statSubjects = document.getElementById("statSubjects");
  const statTasks = document.getElementById("statTasks");
  const statSessions = document.getElementById("statSessions");
  const statCompletion = document.getElementById("statCompletion");
  const upcomingDeadlines = document.getElementById("upcomingDeadlines");
  const todaySchedule = document.getElementById("todaySchedule");

  const addSubjectBtn = document.getElementById("addSubjectBtn");
  const subjectsList = document.getElementById("subjectsList");

  const addSessionBtn = document.getElementById("addSessionBtn");
  const todayDateLabel = document.getElementById("todayDateLabel");
  const scheduleTodayList = document.getElementById("scheduleTodayList");

  const addTaskBtn = document.getElementById("addTaskBtn");
  const tasksList = document.getElementById("tasksList");

  const darkModeToggle = document.getElementById("darkModeToggle");
  const exportDataBtn = document.getElementById("exportDataBtn");
  const resetDataBtn = document.getElementById("resetDataBtn");

  function showToast(message, type) {
    if (type === undefined) type = "success";
    var toast = document.createElement("div");
    toast.className = "toast toast-" + type;
    toast.textContent = message;
    toastContainer.appendChild(toast);
    setTimeout(function () {
      toast.classList.add("toast-out");
      setTimeout(function () {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 250);
    }, 3000);
  }

  const sectionTitles = {
    dashboard: "Dashboard",
    subjects: "Subjects",
    schedule: "Schedule Planner",
    tasks: "Task Manager",
    analytics: "Progress Analytics",
    settings: "Settings",
  };

  function switchSection(sectionName) {
    document.querySelectorAll(".content-section").forEach(function (s) {
      s.classList.remove("active");
    });
    var target = document.getElementById("section-" + sectionName);
    if (target) target.classList.add("active");

    navItems.forEach(function (n) {
      n.classList.remove("active");
      n.removeAttribute("aria-current");
    });
    var activeNav = document.querySelector(
      '.nav-item[data-section="' + sectionName + '"]'
    );
    if (activeNav) {
      activeNav.classList.add("active");
      activeNav.setAttribute("aria-current", "page");
    }

    pageTitle.textContent = sectionTitles[sectionName] || sectionName;

    sidebar.classList.remove("open");

    if (sectionName === "dashboard") refreshDashboard();
    if (sectionName === "subjects") renderSubjects();
    if (sectionName === "schedule") renderSchedule();
    if (sectionName === "tasks") renderTasks();
    if (sectionName === "analytics") renderAnalytics();
  }

  navItems.forEach(function (item) {
    item.addEventListener("click", function () {
      switchSection(this.dataset.section);
    });
  });

  menuToggle.addEventListener("click", function () {
    sidebar.classList.toggle("open");
  });

  sidebarClose.addEventListener("click", function () {
    sidebar.classList.remove("open");
  });

  mainContent.addEventListener("click", function () {
    if (sidebar.classList.contains("open")) {
      sidebar.classList.remove("open");
    }
  });

  function openModal(title, bodyHTML, footerHTML) {
    modalTitle.textContent = title;
    modalBody.innerHTML = bodyHTML;
    modalFooter.innerHTML = footerHTML;
    modalOverlay.removeAttribute("hidden");
    void modalOverlay.offsetWidth;
    modalOverlay.classList.add("open");
    var firstInput = modalBody.querySelector(
      "input, select, textarea"
    );
    if (firstInput) setTimeout(function () { firstInput.focus(); }, 100);
  }

  function closeModal() {
    modalOverlay.classList.remove("open");
    setTimeout(function () {
      modalOverlay.setAttribute("hidden", "");
      modalBody.innerHTML = "";
      modalFooter.innerHTML = "";
    }, 200);
  }

  modalClose.addEventListener("click", closeModal);
  modalOverlay.addEventListener("click", function (e) {
    if (e.target === modalOverlay) closeModal();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && modalOverlay.classList.contains("open")) {
      closeModal();
    }
  });

  var subjectColors = [
    "#0d9488",
    "#2563eb",
    "#ea580c",
    "#e11d48",
    "#7c3aed",
    "#059669",
    "#d97706",
    "#0284c7",
  ];

  function getSubjectFormHTML(existing) {
    var nameVal = existing ? existing.name : "";
    var notesVal = existing ? existing.notes : "";
    var priorityVal = existing ? existing.priority : "medium";

    return (
      '<div class="form-group">' +
      '<label class="form-label">Subject Name *</label>' +
      '<input class="form-input" id="subjectName" placeholder="e.g. Mathematics" value="' +
      escapeHTML(nameVal) +
      '" required />' +
      "</div>" +
      '<div class="form-group">' +
      '<label class="form-label">Priority</label>' +
      '<select class="form-select" id="subjectPriority">' +
      '<option value="high"' +
      (priorityVal === "high" ? " selected" : "") +
      ">High</option>" +
      '<option value="medium"' +
      (priorityVal === "medium" ? " selected" : "") +
      ">Medium</option>" +
      '<option value="low"' +
      (priorityVal === "low" ? " selected" : "") +
      ">Low</option>" +
      "</select>" +
      "</div>" +
      '<div class="form-group">' +
      '<label class="form-label">Notes</label>' +
      '<input class="form-input" id="subjectNotes" placeholder="Optional notes" value="' +
      escapeHTML(notesVal) +
      '" />' +
      "</div>"
    );
  }

  function escapeHTML(str) {
    var div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function saveSubject(existingId) {
    var name = document.getElementById("subjectName").value.trim();
    if (!name) {
      showToast("Please enter a subject name", "error");
      return;
    }
    var priority = document.getElementById("subjectPriority").value;
    var notes = document.getElementById("subjectNotes").value.trim();
    var color = subjectColors[subjects.length % subjectColors.length];

    if (existingId) {
      var idx = subjects.findIndex(function (s) {
        return s.id === existingId;
      });
      if (idx !== -1) {
        subjects[idx].name = name;
        subjects[idx].priority = priority;
        subjects[idx].notes = notes;
        showToast("Subject updated");
      }
    } else {
      subjects.push({
        id: generateId(),
        name: name,
        priority: priority,
        notes: notes,
        color: color,
        createdAt: new Date().toISOString(),
      });
      showToast("Subject added");
    }

    saveData(STORAGE_KEYS.subjects, subjects);
    closeModal();
    renderSubjects();
  }

  function deleteSubject(id) {
    var subj = subjects.find(function (s) {
      return s.id === id;
    });
    if (subj && confirm('Delete "' + subj.name + '"? This cannot be undone.')) {
      subjects = subjects.filter(function (s) {
        return s.id !== id;
      });
      saveData(STORAGE_KEYS.subjects, subjects);
      showToast("Subject deleted");
      renderSubjects();
    }
  }

  function openSubjectModal(existingId) {
    var existing = existingId
      ? subjects.find(function (s) {
          return s.id === existingId;
        })
      : null;
    var title = existing ? "Edit Subject" : "Add Subject";
    var body = getSubjectFormHTML(existing);
    var footer =
      '<button class="btn btn-secondary" id="modalCancel">Cancel</button>' +
      '<button class="btn btn-primary" id="modalSave">' +
      (existing ? "Update" : "Add") +
      "</button>";

    openModal(title, body, footer);

    document
      .getElementById("modalCancel")
      .addEventListener("click", closeModal);
    document.getElementById("modalSave").addEventListener("click", function () {
      saveSubject(existingId || null);
    });
  }

  function renderSubjects() {
    if (subjects.length === 0) {
      subjectsList.innerHTML =
        '<div class="empty-state-large">' +
        '<svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>' +
        "<h3>No subjects yet</h3>" +
        "<p>Add your first subject to start organizing your studies</p>" +
        "</div>";
      return;
    }

    subjectsList.innerHTML = subjects
      .map(function (s) {
        return (
          '<div class="subject-card" style="--subject-color:' +
          s.color +
          '">' +
          '<div class="subject-card-header">' +
          '<div>' +
          '<div class="subject-name">' +
          escapeHTML(s.name) +
          "</div>" +
          '<span class="subject-priority priority-' +
          s.priority +
          '">' +
          s.priority +
          "</span>" +
          "</div>" +
          '<div class="subject-actions">' +
          '<button class="btn btn-ghost btn-sm" onclick="window._editSubject(\'' +
          s.id +
          '\')" aria-label="Edit subject">' +
          '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>' +
          "</button>" +
          '<button class="btn btn-ghost btn-sm" onclick="window._deleteSubject(\'' +
          s.id +
          '\')" aria-label="Delete subject">' +
          '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>' +
          "</button>" +
          "</div>" +
          "</div>" +
          '<div class="subject-meta">' +
          (s.notes
            ? "<span>Notes: " + escapeHTML(s.notes) + "</span>"
            : "") +
          "</div>" +
          "</div>"
        );
      })
      .join("");
  }

  window._editSubject = openSubjectModal;
  window._deleteSubject = deleteSubject;

  addSubjectBtn.addEventListener("click", function () {
    openSubjectModal(null);
  });

  var timeSlots = [];
  for (var h = 6; h <= 22; h++) {
    timeSlots.push(h);
  }

  function formatDate(d) {
    return d.toISOString().split("T")[0];
  }

  function formatHour(h) {
    var ampm = h >= 12 ? "PM" : "AM";
    var h12 = h % 12 || 12;
    return h12 + " " + ampm;
  }

  function renderSchedule() {
    var today = new Date();
    todayDateLabel.textContent = today.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    var todayStr = formatDate(today);
    var todaySessions = schedule.filter(function (s) {
      return s.date === todayStr;
    });

    todaySessions.sort(function (a, b) {
      return parseInt(a.startHour) - parseInt(b.startHour);
    });

    if (todaySessions.length === 0) {
      scheduleTodayList.innerHTML =
        '<div class="empty-state-large">' +
        '<svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>' +
        "<h3>No sessions today</h3>" +
        "<p>Add a study session for today</p>" +
        "</div>";
      return;
    }

    scheduleTodayList.innerHTML = todaySessions
      .map(function (s) {
        var subj = subjects.find(function (sub) {
          return sub.id === s.subjectId;
        });
        var name = subj ? subj.name : "Unknown";
        return (
          '<div class="schedule-today-item">' +
          '<span class="schedule-today-time">' +
          formatHour(parseInt(s.startHour)) +
          " - " +
          formatHour(parseInt(s.endHour)) +
          "</span>" +
          '<span class="schedule-today-subject">' +
          escapeHTML(name) +
          "</span>" +
          '<button class="schedule-today-delete" onclick="window._deleteSession(\'' +
          s.id +
          '\')" aria-label="Remove session">' +
          '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>' +
          "</button>" +
          "</div>"
        );
      })
      .join("");
  }

  function openSessionModal() {
    if (subjects.length === 0) {
      showToast("Add a subject first before scheduling", "warning");
      return;
    }

    var subjectOptions = subjects
      .map(function (s) {
        return (
          '<option value="' + s.id + '">' + escapeHTML(s.name) + "</option>"
        );
      })
      .join("");

    var hourOptions = timeSlots
      .map(function (h) {
        return '<option value="' + h + '">' + formatHour(h) + "</option>";
      })
      .join("");

    var body =
      '<div class="form-group">' +
      '<label class="form-label">Subject *</label>' +
      '<select class="form-select" id="sessionSubject">' +
      subjectOptions +
      "</select>" +
      "</div>" +
      '<div class="form-row">' +
      '<div class="form-group">' +
      '<label class="form-label">Start Time</label>' +
      '<select class="form-select" id="sessionStart">' +
      hourOptions +
      "</select>" +
      "</div>" +
      '<div class="form-group">' +
      '<label class="form-label">End Time</label>' +
      '<select class="form-select" id="sessionEnd">' +
      hourOptions.replace('value="6"', 'value="7"') +
      "</select>" +
      "</div>" +
      "</div>";

    var footer =
      '<button class="btn btn-secondary" id="modalCancel">Cancel</button>' +
      '<button class="btn btn-primary" id="modalSave">Add Session</button>';

    openModal("Add Study Session", body, footer);

    document.getElementById("sessionStart").addEventListener("change", function() {
      var endSel = document.getElementById("sessionEnd");
      var startVal = parseInt(this.value);
      if (parseInt(endSel.value) <= startVal) {
        endSel.value = Math.min(startVal + 1, 22).toString();
      }
    });

    document
      .getElementById("modalCancel")
      .addEventListener("click", closeModal);
    document.getElementById("modalSave").addEventListener("click", function () {
      saveSession();
    });
  }

  function saveSession() {
    var subjectId = document.getElementById("sessionSubject").value;
    var startHour = parseInt(document.getElementById("sessionStart").value);
    var endHour = parseInt(document.getElementById("sessionEnd").value);

    if (endHour <= startHour) {
      showToast("End time must be after start time", "error");
      return;
    }

    var date = formatDate(new Date());

    var conflict = schedule.some(function (s) {
      if (s.date !== date) return false;
      var sStart = parseInt(s.startHour);
      var sEnd = parseInt(s.endHour);
      return startHour < sEnd && endHour > sStart;
    });

    if (conflict) {
      showToast("Time conflict with existing session!", "error");
      return;
    }

    schedule.push({
      id: generateId(),
      subjectId: subjectId,
      date: date,
      startHour: startHour.toString(),
      endHour: endHour.toString(),
    });
    saveData(STORAGE_KEYS.schedule, schedule);
    showToast("Session added");
    closeModal();
    renderSchedule();
  }

  function deleteSession(id) {
    schedule = schedule.filter(function (s) {
      return s.id !== id;
    });
    saveData(STORAGE_KEYS.schedule, schedule);
    showToast("Session removed");
    renderSchedule();
  }

  window._deleteSession = deleteSession;

  addSessionBtn.addEventListener("click", openSessionModal);

  function getTaskFormHTML() {
    var subjectOptions =
      '<option value="">No subject</option>' +
      subjects
        .map(function (s) {
          return (
            '<option value="' +
            s.id +
            '">' +
            escapeHTML(s.name) +
            "</option>"
          );
        })
        .join("");

    return (
      '<div class="form-group">' +
      '<label class="form-label">Task Title *</label>' +
      '<input class="form-input" id="taskTitle" placeholder="e.g. Chapter 5 Assignment" />' +
      "</div>" +
      '<div class="form-row">' +
      '<div class="form-group">' +
      '<label class="form-label">Subject</label>' +
      '<select class="form-select" id="taskSubject">' +
      subjectOptions +
      "</select>" +
      "</div>" +
      '<div class="form-group">' +
      '<label class="form-label">Due Date</label>' +
      '<input class="form-input" type="date" id="taskDue" />' +
      "</div>" +
      "</div>"
    );
  }

  function saveTask() {
    var title = document.getElementById("taskTitle").value.trim();
    if (!title) {
      showToast("Please enter a task title", "error");
      return;
    }
    var subjectId = document.getElementById("taskSubject").value;
    var dueDate = document.getElementById("taskDue").value;

    tasks.push({
      id: generateId(),
      title: title,
      type: "assignment",
      subjectId: subjectId,
      dueDate: dueDate,
      status: "pending",
      description: "",
      createdAt: new Date().toISOString(),
    });
    showToast("Task added");

    saveData(STORAGE_KEYS.tasks, tasks);
    closeModal();
    renderTasks();
  }

  function deleteTask(id) {
    var t = tasks.find(function (t) {
      return t.id === id;
    });
    if (t && confirm('Delete "' + t.title + '"?')) {
      tasks = tasks.filter(function (t) {
        return t.id !== id;
      });
      saveData(STORAGE_KEYS.tasks, tasks);
      showToast("Task deleted");
      renderTasks();
    }
  }

  function toggleTaskStatus(id) {
    var t = tasks.find(function (t) {
      return t.id === id;
    });
    if (t) {
      t.status = t.status === "completed" ? "pending" : "completed";
      saveData(STORAGE_KEYS.tasks, tasks);
      renderTasks();
    }
  }

  function changeTaskStatus(id, newStatus) {
    var t = tasks.find(function (t) {
      return t.id === id;
    });
    if (t) {
      t.status = newStatus;
      saveData(STORAGE_KEYS.tasks, tasks);
      renderTasks();
    }
  }

  function openTaskModal() {
    var body = getTaskFormHTML();
    var footer =
      '<button class="btn btn-secondary" id="modalCancel">Cancel</button>' +
      '<button class="btn btn-primary" id="modalSave">Add</button>';

    openModal("Add Task", body, footer);

    document
      .getElementById("modalCancel")
      .addEventListener("click", closeModal);
    document.getElementById("modalSave").addEventListener("click", function () {
      saveTask();
    });
  }

  function getDueInfo(dueDate) {
    if (!dueDate) return { text: "No due date", cls: "" };
    var now = new Date();
    now.setHours(0, 0, 0, 0);
    var due = new Date(dueDate + "T00:00:00");
    var diff = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
    if (diff < 0) return { text: Math.abs(diff) + "d overdue", cls: "overdue" };
    if (diff === 0) return { text: "Due today", cls: "overdue" };
    if (diff === 1) return { text: "Due tomorrow", cls: "soon" };
    if (diff <= 3) return { text: "Due in " + diff + " days", cls: "soon" };
    return { text: "Due " + new Date(dueDate + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" }), cls: "" };
  }

  function renderTasks() {
    var filtered = tasks;

    filtered.sort(function (a, b) {
      var aComp = a.status === "completed" ? 1 : 0;
      var bComp = b.status === "completed" ? 1 : 0;
      if (aComp !== bComp) return aComp - bComp;
      if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;
      return 0;
    });

    if (filtered.length === 0) {
      var msg = "<h3>No tasks yet</h3><p>Create tasks to track your assignments and exams</p>";
      tasksList.innerHTML =
        '<div class="empty-state-large">' +
        '<svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>' +
        msg +
        "</div>";
      return;
    }

    tasksList.innerHTML = filtered
      .map(function (t) {
        var subj = subjects.find(function (s) {
          return s.id === t.subjectId;
        });
        var dueInfo = getDueInfo(t.dueDate);
        var isCompleted = t.status === "completed";

        return (
          '<div class="task-item">' +
          '<button class="task-checkbox' +
          (isCompleted ? " checked" : "") +
          '" onclick="window._toggleTask(\'' +
          t.id +
          '\')" aria-label="' +
          (isCompleted ? "Mark as incomplete" : "Mark as complete") +
          '">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>' +
          "</button>" +
          '<div class="task-info">' +
          '<div class="task-title' +
          (isCompleted ? " completed" : "") +
          '">' +
          escapeHTML(t.title) +
          "</div>" +
          '<div class="task-details">' +
          (subj
            ? '<span style="color:' + subj.color + '">' + escapeHTML(subj.name) + "</span>"
            : "") +
          (t.dueDate
            ? '<span class="task-due ' +
              dueInfo.cls +
              '">' +
              '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>' +
              dueInfo.text +
              "</span>"
            : "") +
          "</div>" +
          "</div>" +
          '<div class="task-actions">' +
          '<button class="btn btn-ghost btn-sm" onclick="window._deleteTask(\'' +
          t.id +
          '\')" aria-label="Delete task">' +
          '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>' +
          "</button>" +
          "</div>" +
          "</div>"
        );
      })
      .join("");
  }

  window._toggleTask = toggleTaskStatus;
  window._deleteTask = deleteTask;

  addTaskBtn.addEventListener("click", function () {
    openTaskModal();
  });

  function refreshDashboard() {
    statSubjects.textContent = subjects.length;
    var pendingTasks = tasks.filter(function (t) {
      return t.status !== "completed";
    });
    statTasks.textContent = pendingTasks.length;

    var today = formatDate(new Date());
    var todaySessions = schedule.filter(function (s) {
      return s.date === today;
    });
    statSessions.textContent = todaySessions.length;

    var completionRate =
      tasks.length > 0
        ? Math.round(
            (tasks.filter(function (t) {
              return t.status === "completed";
            }).length /
              tasks.length) *
              100
          )
        : 0;
    statCompletion.textContent = completionRate + "%";

    var upcoming = tasks
      .filter(function (t) {
        return t.dueDate && t.status !== "completed";
      })
      .sort(function (a, b) {
        return a.dueDate.localeCompare(b.dueDate);
      })
      .slice(0, 5);

    if (upcoming.length === 0) {
      upcomingDeadlines.innerHTML =
        '<div class="empty-state">' +
        '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>' +
        "<p>No upcoming deadlines</p>" +
        "<span>Add tasks to see them here</span>" +
        "</div>";
    } else {
      upcomingDeadlines.innerHTML = upcoming
        .map(function (t) {
          var dueInfo = getDueInfo(t.dueDate);
          var dotClass =
            dueInfo.cls === "overdue"
              ? "urgent"
              : dueInfo.cls === "soon"
              ? "soon"
              : "later";
          return (
            '<div class="deadline-item">' +
            '<div class="deadline-dot ' +
            dotClass +
            '"></div>' +
            '<div class="deadline-info">' +
            '<div class="deadline-title">' +
            escapeHTML(t.title) +
            "</div>" +
            '<div class="deadline-date">' +
            dueInfo.text +
            "</div>" +
            "</div>" +
            "</div>"
          );
        })
        .join("");
    }

    if (todaySessions.length === 0) {
      todaySchedule.innerHTML =
        '<div class="empty-state">' +
        '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>' +
        "<p>No sessions planned for today</p>" +
        "<span>Create a schedule to get started</span>" +
        "</div>";
    } else {
      todaySessions.sort(function (a, b) {
        return parseInt(a.startHour) - parseInt(b.startHour);
      });
      todaySchedule.innerHTML = todaySessions
        .map(function (s) {
          var subj = subjects.find(function (sub) {
            return sub.id === s.subjectId;
          });
          return (
            '<div class="today-session">' +
            '<span class="today-session-time">' +
            formatHour(parseInt(s.startHour)) +
            " - " +
            formatHour(parseInt(s.endHour)) +
            "</span>" +
            '<span class="today-session-subject">' +
            escapeHTML(subj ? subj.name : "Unknown") +
            "</span>" +
            "</div>"
          );
        })
        .join("");
    }

    if (settings.reminders) {
      checkReminders();
    }
  }

  function checkReminders() {
    var now = new Date();
    now.setHours(0, 0, 0, 0);
    var reminderDays = parseInt(settings.reminderDays) || 3;

    tasks.forEach(function (t) {
      if (!t.dueDate || t.status === "completed") return;
      var due = new Date(t.dueDate + "T00:00:00");
      var diff = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
      if (diff >= 0 && diff <= reminderDays) {
        var dueInfo = getDueInfo(t.dueDate);
        var reminderKey = "reminder_" + t.id + "_" + formatDate(now);
        if (!sessionStorage.getItem(reminderKey)) {
          sessionStorage.setItem(reminderKey, "1");
          setTimeout(function () {
            showToast(
              "Reminder: " + t.title + " - " + dueInfo.text,
              "warning"
            );
          }, 500);
        }
      }
    });
  }

  function renderAnalytics() {
    renderCompletionChart();
    renderSubjectChart();
  }

  function renderCompletionChart() {
    var canvas = document.getElementById("completionChart");
    var ctx = canvas.getContext("2d");
    var w = canvas.width;
    var h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    var completed = tasks.filter(function (t) {
      return t.status === "completed";
    }).length;
    var inProgress = tasks.filter(function (t) {
      return t.status === "in-progress";
    }).length;
    var pending = tasks.filter(function (t) {
      return t.status === "pending";
    }).length;
    var total = completed + inProgress + pending;

    if (total === 0) {
      ctx.fillStyle = getComputedStyle(document.documentElement)
        .getPropertyValue("--color-text-muted")
        .trim();
      ctx.font = "14px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("No task data yet", w / 2, h / 2);
      return;
    }

    var data = [
      { value: completed, color: "#16a34a", label: "Completed" },
      { value: inProgress, color: "#f59e0b", label: "In Progress" },
      { value: pending, color: "#94a3b8", label: "Pending" },
    ];

    var cx = w / 2 - 60;
    var cy = h / 2;
    var outerR = Math.min(cx, cy) - 20;
    var innerR = outerR * 0.6;
    var startAngle = -Math.PI / 2;

    data.forEach(function (d) {
      if (d.value === 0) return;
      var sliceAngle = (d.value / total) * 2 * Math.PI;
      ctx.beginPath();
      ctx.arc(cx, cy, outerR, startAngle, startAngle + sliceAngle);
      ctx.arc(cx, cy, innerR, startAngle + sliceAngle, startAngle, true);
      ctx.closePath();
      ctx.fillStyle = d.color;
      ctx.fill();
      startAngle += sliceAngle;
    });

    ctx.fillStyle = getComputedStyle(document.documentElement)
      .getPropertyValue("--color-text")
      .trim();
    ctx.font = "bold 24px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(total, cx, cy - 8);
    ctx.font = "12px sans-serif";
    ctx.fillStyle = getComputedStyle(document.documentElement)
      .getPropertyValue("--color-text-muted")
      .trim();
    ctx.fillText("Total", cx, cy + 14);

    var legendX = w - 110;
    var legendY = h / 2 - 30;
    data.forEach(function (d, i) {
      ctx.fillStyle = d.color;
      ctx.fillRect(legendX, legendY + i * 24, 12, 12);
      ctx.fillStyle = getComputedStyle(document.documentElement)
        .getPropertyValue("--color-text")
        .trim();
      ctx.font = "12px sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillText(d.label + " (" + d.value + ")", legendX + 18, legendY + i * 24);
    });
  }

  function renderSubjectChart() {
    var canvas = document.getElementById("subjectChart");
    var ctx = canvas.getContext("2d");
    var w = canvas.width;
    var h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    if (subjects.length === 0) {
      ctx.fillStyle = getComputedStyle(document.documentElement)
        .getPropertyValue("--color-text-muted")
        .trim();
      ctx.font = "14px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("No subject data yet", w / 2, h / 2);
      return;
    }

    var data = subjects.map(function (s) {
      var count = tasks.filter(function (t) {
        return t.subjectId === s.id;
      }).length;
      return { name: s.name, count: count, color: s.color };
    });

    var total = data.reduce(function (sum, d) {
      return sum + d.count;
    }, 0);

    if (total === 0) {
      var cx = w / 2 - 60;
      var cy = h / 2;
      var outerR = Math.min(cx, cy) - 20;
      var innerR = outerR * 0.6;
      var sliceAngle = (2 * Math.PI) / data.length;
      var startAngle = -Math.PI / 2;

      data.forEach(function (d) {
        ctx.beginPath();
        ctx.arc(cx, cy, outerR, startAngle, startAngle + sliceAngle);
        ctx.arc(cx, cy, innerR, startAngle + sliceAngle, startAngle, true);
        ctx.closePath();
        ctx.fillStyle = d.color;
        ctx.fill();
        startAngle += sliceAngle;
      });

      var legendX = w - 120;
      var legendY = Math.max(20, h / 2 - (data.length * 22) / 2);
      data.forEach(function (d, i) {
        ctx.fillStyle = d.color;
        ctx.fillRect(legendX, legendY + i * 22, 10, 10);
        ctx.fillStyle = getComputedStyle(document.documentElement)
          .getPropertyValue("--color-text")
          .trim();
        ctx.font = "11px sans-serif";
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        var displayName = d.name.length > 10 ? d.name.substring(0, 10) + ".." : d.name;
        ctx.fillText(displayName, legendX + 16, legendY + i * 22);
      });
      return;
    }

    var outerR = Math.min(w / 2 - 60, h / 2) - 20;
    var innerR = outerR * 0.6;
    var startAngle = -Math.PI / 2;

    data.forEach(function (d) {
      if (d.count === 0) return;
      var sliceAngle = (d.count / total) * 2 * Math.PI;
      ctx.beginPath();
      ctx.arc(w / 2 - 60, h / 2, outerR, startAngle, startAngle + sliceAngle);
      ctx.arc(w / 2 - 60, h / 2, innerR, startAngle + sliceAngle, startAngle, true);
      ctx.closePath();
      ctx.fillStyle = d.color;
      ctx.fill();
      startAngle += sliceAngle;
    });

    var legendX = w - 120;
    var legendY = Math.max(20, h / 2 - (data.length * 22) / 2);
    data.forEach(function (d, i) {
      ctx.fillStyle = d.color;
      ctx.fillRect(legendX, legendY + i * 22, 10, 10);
      ctx.fillStyle = getComputedStyle(document.documentElement)
        .getPropertyValue("--color-text")
        .trim();
      ctx.font = "11px sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      var displayName = d.name.length > 10 ? d.name.substring(0, 10) + ".." : d.name;
      ctx.fillText(displayName + " (" + d.count + ")", legendX + 16, legendY + i * 22);
    });
  }

  function applySettings() {
    if (settings.darkMode) {
      document.documentElement.setAttribute("data-theme", "dark");
      darkModeToggle.checked = true;
    } else {
      document.documentElement.removeAttribute("data-theme");
      darkModeToggle.checked = false;
    }
  }

  function toggleTheme() {
    settings.darkMode = !settings.darkMode;
    saveData(STORAGE_KEYS.settings, settings);
    applySettings();
  }

  darkModeToggle.addEventListener("change", function () {
    settings.darkMode = this.checked;
    saveData(STORAGE_KEYS.settings, settings);
    applySettings();
  });

  themeToggleBtn.addEventListener("click", toggleTheme);

  exportDataBtn.addEventListener("click", function () {
    var exportData = {
      subjects: subjects,
      tasks: tasks,
      schedule: schedule,
      settings: settings,
      exportedAt: new Date().toISOString(),
    };
    var blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "ontime-backup-" + formatDate(new Date()) + ".json";
    a.click();
    URL.revokeObjectURL(url);
    showToast("Data exported successfully");
  });

  resetDataBtn.addEventListener("click", function () {
    if (
      confirm(
        "Are you sure you want to delete ALL data? This action cannot be undone."
      )
    ) {
      subjects = [];
      tasks = [];
      schedule = [];
      saveData(STORAGE_KEYS.subjects, subjects);
      saveData(STORAGE_KEYS.tasks, tasks);
      saveData(STORAGE_KEYS.schedule, schedule);
      showToast("All data has been reset");
      refreshDashboard();
    }
  });

  applySettings();
  refreshDashboard();
  renderSchedule();
})();
