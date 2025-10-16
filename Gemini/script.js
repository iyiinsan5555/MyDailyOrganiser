// --- Global State and Initialization ---
let tasks = [];
let alarmCheckInterval; // To store the interval timer for alarms

// DOM Elements
const taskUl = document.getElementById('tasks-ul');
const descriptionInput = document.getElementById('task-description');
const alarmTimeInput = document.getElementById('task-alarm-time');
const importanceInput = document.getElementById('task-importance');
const importanceValueSpan = document.getElementById('importance-value');
const noTasksMessage = document.getElementById('no-tasks-message');
const wakeUpInput = document.getElementById('wake-up-time');
const sleepInput = document.getElementById('sleep-time');
const scheduleStart = document.getElementById('schedule-start');
const scheduleEnd = document.getElementById('schedule-end');

document.addEventListener('DOMContentLoaded', () => {
    loadTimeSchedule();
    loadTasks();
    // Start checking alarms when the page loads
    startAlarmChecker();

    // Event listener for importance slider change
    importanceInput.addEventListener('input', () => {
        importanceValueSpan.textContent = importanceInput.value;
    });
    
    // Event listeners for time schedule change
    wakeUpInput.addEventListener('change', saveTimeSchedule);
    sleepInput.addEventListener('change', saveTimeSchedule);
});


// --- LocalStorage Functions ---

function saveTimeSchedule() {
    localStorage.setItem('wakeUpTime', wakeUpInput.value);
    localStorage.setItem('sleepTime', sleepInput.value);
    updateScheduleDisplay();
}

function loadTimeSchedule() {
    wakeUpInput.value = localStorage.getItem('wakeUpTime') || '';
    sleepInput.value = localStorage.getItem('sleepTime') || '';
    updateScheduleDisplay();
}

function updateScheduleDisplay() {
    scheduleStart.textContent = wakeUpInput.value || '--:--';
    scheduleEnd.textContent = sleepInput.value || '--:--';
}

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    renderTasks();
}

function loadTasks() {
    const storedTasks = localStorage.getItem('tasks');
    if (storedTasks) {
        tasks = JSON.parse(storedTasks);
    }
    renderTasks();
}

// --- Task Management Functions ---

function addTask() {
    const description = descriptionInput.value.trim();
    const alarmTime = alarmTimeInput.value;
    const importance = importanceInput.value;

    if (!description) {
        alert('Please enter a task description.');
        return;
    }

    const newTask = {
        id: Date.now(), // Unique ID
        description: description,
        alarmTime: alarmTime,
        importance: importance,
        isAlarmed: false // Flag to prevent repeated alerts
    };

    tasks.push(newTask);
    saveTasks();

    // Clear inputs
    descriptionInput.value = '';
    alarmTimeInput.value = '';
    importanceInput.value = '3';
    importanceValueSpan.textContent = '3';
}

function renderTasks() {
    taskUl.innerHTML = ''; // Clear existing tasks

    if (tasks.length === 0) {
        noTasksMessage.style.display = 'block';
    } else {
        noTasksMessage.style.display = 'none';
    }

    // Sort tasks by alarm time for better organization
    tasks.sort((a, b) => a.alarmTime.localeCompare(b.alarmTime));

    tasks.forEach(task => {
        const li = document.createElement('li');
        li.className = 'task-item';
        // Add alarm style if needed
        if (task.isAlarmed) {
             li.classList.add('alarm-due');
        }
        li.dataset.taskId = task.id;

        const shortDescription = task.description.length > 50 
            ? task.description.substring(0, 50) + '...'
            : task.description;

        // Importance span with color
        const importanceSpan = `<span class="importance-level imp-${task.importance}">Imp: ${task.importance}</span>`;
        
        li.innerHTML = `
            <div class="task-details">
                <span class="task-description-short" title="Click to expand">${shortDescription}</span>
                <p class="task-description-full">${task.description}</p>
                <div class="task-meta">
                    ${task.alarmTime ? `<span>⏰ Alarm: ${task.alarmTime}</span>` : '<span>No Alarm Set</span>'}
                    ${importanceSpan}
                </div>
            </div>
            <button onclick="deleteTask(${task.id})">Remove</button>
        `;

        // Toggle full description on click
        li.querySelector('.task-description-short').addEventListener('click', () => {
            li.classList.toggle('expanded');
        });

        taskUl.appendChild(li);
    });
}

function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    saveTasks();
}

// --- Alarm Checker Functionality ---

function startAlarmChecker() {
    // Check every minute (60000 ms)
    alarmCheckInterval = setInterval(checkAlarms, 60000);
    // Initial check right away
    checkAlarms(); 
}

function checkAlarms() {
    const now = new Date();
    // Get time in 'HH:MM' format
    const currentTimeString = now.toTimeString().substring(0, 5); 

    tasks.forEach(task => {
        if (task.alarmTime && !task.isAlarmed) {
            if (task.alarmTime === currentTimeString) {
                // ALARM TRIGGERED!
                task.isAlarmed = true; // Mark as alarmed to prevent repeating alert
                saveTasks(); // Persist the isAlarmed state

                // 1. Alert the user (as requested, the website should be open)
                alert(`🔔 ALARM: Time for your task: "${task.description.substring(0, 30)}..." (Importance: ${task.importance})`);

                // 2. Update the UI to highlight the task
                renderTasks(); 
            }
        }
    });
}

// Note: To make the alarm check more precise (e.g., to the second), 
// you would change the interval to a smaller number like 1000ms. 
// However, checking every minute is usually sufficient for a time planner.