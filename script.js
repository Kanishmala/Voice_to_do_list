const startBtn = document.getElementById("start-btn");
const taskList = document.getElementById("task-list");
const message = document.getElementById("message");
const command = document.getElementById("command");

const recognition = new (window.SpeechRecognition ||
  window.webkitSpeechRecognition)();
recognition.lang = "en-US";

// Load tasks from localStorage
window.onload = () => {
  const saved = JSON.parse(localStorage.getItem("tasks")) || [];
  saved.forEach(addTask);
};

recognition.onresult = function (event) {
  const transcript = event.results[0][0].transcript.toLowerCase().trim();
  command.textContent = `You said: "${transcript}"`;

  if (transcript.startsWith("add")) {
    const item = transcript.replace("add", "").trim();
    if (item) addTask(item, true);
  } else if (transcript.startsWith("delete")) {
    const item = transcript.replace("delete", "").trim();
    if (item) deleteTask(item);
  } else if (transcript.includes("clear all")) {
    clearAllTasks();
  } else if (transcript.includes("help")) {
    showHelp();
  } else {
    showMessage(
      "Unrecognized command. Say: Add, Delete, Clear all, or Help.",
      true
    );
  }
};

startBtn.addEventListener("click", () => {
  message.textContent = "🎙️ Listening...";
  document.getElementById("mic-status").textContent = "🎤 Listening...";
  recognition.start();
});

recognition.onend = () => {
  document.getElementById("mic-status").textContent = "🎤 Idle";
};

// Task saving helpers
function saveTasks() {
  const items = Array.from(taskList.children).map(
    (li) => li.firstChild.textContent
  );
  localStorage.setItem("tasks", JSON.stringify(items));
}

function addTask(text, showMsg = false) {
  const exists = Array.from(taskList.children).some(
    (item) => item.firstChild.textContent.toLowerCase() === text.toLowerCase()
  );
  if (exists) {
    showMessage(`"${text}" already exists.`, true);
    return;
  }

  const li = document.createElement("li");
  const taskText = document.createElement("span");
  taskText.textContent = text;
  const timestamp = document.createElement("span");
  timestamp.className = "timestamp";
  timestamp.textContent = new Date().toLocaleTimeString();
  li.appendChild(taskText);
  li.appendChild(timestamp);
  taskList.appendChild(li);

  saveTasks();
  if (showMsg) showMessage(`Task "${text}" added.`);
}

function deleteTask(text) {
  const items = Array.from(taskList.children);
  const match = items.find((item) =>
    item.firstChild.textContent.toLowerCase().includes(text.toLowerCase())
  );
  if (match) {
    taskList.removeChild(match);
    saveTasks();
    showMessage(`Task "${text}" deleted.`);
  } else {
    showMessage(`Task "${text}" not found.`, true);
  }
}

function clearAllTasks() {
  taskList.innerHTML = "";
  localStorage.removeItem("tasks");
  showMessage("All tasks cleared.");
}

function showHelp() {
  showMessage(
    "Commands: 'Add [task]', 'Delete [task]', 'Clear all tasks'",
    false
  );
}

function showMessage(msg, isError = false) {
  message.textContent = msg;
  message.style.color = isError ? "#ef4444" : "#10b981";
}

document.getElementById("dark-toggle").addEventListener("change", (e) => {
  document.body.classList.toggle("dark", e.target.checked);
});

if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("service-worker.js")
    .then(() => console.log("✅ Service Worker registered"))
    .catch((err) => console.error("Service Worker registration failed:", err));
}
