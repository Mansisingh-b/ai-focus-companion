// ====================================
// AI Focus Companion - JavaScript
// ====================================

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    console.log('AI Focus Companion initialized');
    initializeTimer();
    initializeTaskManager();
    initializeSmoothScroll();
}

// ====================================
// Timer Functionality
// ====================================

let timerState = {
    minutes: 25,
    seconds: 0,
    isRunning: false,
    interval: null,
    workDuration: 25,
    breakDuration: 5,
    isWorkSession: true
};

function initializeTimer() {
    const startBtn = document.getElementById('start-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const resetBtn = document.getElementById('reset-btn');
    
    if (startBtn) {
        startBtn.addEventListener('click', startTimer);
    }
    
    if (pauseBtn) {
        pauseBtn.addEventListener('click', pauseTimer);
    }
    
    if (resetBtn) {
        resetBtn.addEventListener('click', resetTimer);
    }
    
    updateTimerDisplay();
}

function startTimer() {
    if (!timerState.isRunning) {
        timerState.isRunning = true;
        timerState.interval = setInterval(updateTimer, 1000);
        updateButtonStates();
    }
}

function pauseTimer() {
    if (timerState.isRunning) {
        timerState.isRunning = false;
        clearInterval(timerState.interval);
        updateButtonStates();
    }
}

function resetTimer() {
    pauseTimer();
    timerState.minutes = timerState.workDuration;
    timerState.seconds = 0;
    timerState.isWorkSession = true;
    updateTimerDisplay();
}

function updateTimer() {
    if (timerState.seconds === 0) {
        if (timerState.minutes === 0) {
            // Timer completed
            timerComplete();
            return;
        }
        timerState.minutes--;
        timerState.seconds = 59;
    } else {
        timerState.seconds--;
    }
    
    updateTimerDisplay();
}

function timerComplete() {
    pauseTimer();
    playNotificationSound();
    
    // Switch between work and break sessions
    if (timerState.isWorkSession) {
        alert('Great work! Time for a break!');
        timerState.minutes = timerState.breakDuration;
        timerState.isWorkSession = false;
    } else {
        alert('Break over! Ready to focus again?');
        timerState.minutes = timerState.workDuration;
        timerState.isWorkSession = true;
    }
    
    timerState.seconds = 0;
    updateTimerDisplay();
}

function updateTimerDisplay() {
    const display = document.getElementById('time-display');
    if (display) {
        const mins = String(timerState.minutes).padStart(2, '0');
        const secs = String(timerState.seconds).padStart(2, '0');
        display.textContent = `${mins}:${secs}`;
    }
}

function updateButtonStates() {
    const startBtn = document.getElementById('start-btn');
    const pauseBtn = document.getElementById('pause-btn');
    
    if (startBtn && pauseBtn) {
        if (timerState.isRunning) {
            startBtn.disabled = true;
            pauseBtn.disabled = false;
        } else {
            startBtn.disabled = false;
            pauseBtn.disabled = true;
        }
    }
}

function playNotificationSound() {
    // Simple beep sound using Web Audio API
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
        console.log('Audio notification not supported:', error);
    }
}

// ====================================
// Task Manager Functionality
// ====================================

let tasks = [];
let taskIdCounter = 0;

function initializeTaskManager() {
    const addTaskBtn = document.getElementById('add-task-btn');
    const taskInput = document.getElementById('task-input');
    
    if (addTaskBtn) {
        addTaskBtn.addEventListener('click', addTask);
    }
    
    if (taskInput) {
        taskInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                addTask();
            }
        });
    }
    
    // Load tasks from localStorage
    loadTasks();
    renderTasks();
}

function addTask() {
    const taskInput = document.getElementById('task-input');
    const taskText = taskInput.value.trim();
    
    if (taskText === '') {
        alert('Please enter a task');
        return;
    }
    
    const task = {
        id: taskIdCounter++,
        text: taskText,
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    tasks.push(task);
    taskInput.value = '';
    saveTasks();
    renderTasks();
}

function deleteTask(taskId) {
    tasks = tasks.filter(task => task.id !== taskId);
    saveTasks();
    renderTasks();
}

function toggleTaskComplete(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
    }
}

function renderTasks() {
    const taskList = document.getElementById('task-list');
    if (!taskList) return;
    
    taskList.innerHTML = '';
    
    if (tasks.length === 0) {
        taskList.innerHTML = '<li style="text-align: center; color: #6b7280; padding: 2rem;">No tasks yet. Add one to get started!</li>';
        return;
    }
    
    tasks.forEach(task => {
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''}`;
        
        const taskContent = document.createElement('div');
        taskContent.style.display = 'flex';
        taskContent.style.alignItems = 'center';
        taskContent.style.gap = '0.5rem';
        taskContent.style.flex = '1';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = task.completed;
        checkbox.addEventListener('change', () => toggleTaskComplete(task.id));
        
        const taskText = document.createElement('span');
        taskText.textContent = task.text;
        taskText.style.cursor = 'pointer';
        taskText.addEventListener('click', () => toggleTaskComplete(task.id));
        
        taskContent.appendChild(checkbox);
        taskContent.appendChild(taskText);
        
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.addEventListener('click', () => deleteTask(task.id));
        
        li.appendChild(taskContent);
        li.appendChild(deleteBtn);
        taskList.appendChild(li);
    });
}

function saveTasks() {
    try {
        localStorage.setItem('aiFocusTasks', JSON.stringify(tasks));
    } catch (error) {
        console.error('Error saving tasks:', error);
    }
}

function loadTasks() {
    try {
        const savedTasks = localStorage.getItem('aiFocusTasks');
        if (savedTasks) {
            tasks = JSON.parse(savedTasks);
            // Update taskIdCounter to avoid ID conflicts
            if (tasks.length > 0) {
                taskIdCounter = Math.max(...tasks.map(t => t.id)) + 1;
            }
        }
    } catch (error) {
        console.error('Error loading tasks:', error);
        tasks = [];
    }
}

// ====================================
// Smooth Scrolling for Navigation
// ====================================

function initializeSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ====================================
// AI Integration Placeholder
// ====================================

// This is a placeholder for future AI integration
// You can connect to your AI API endpoint here
async function getAISuggestions(context) {
    try {
        // TODO: Replace with actual AI API endpoint
        // const response = await fetch('YOUR_AI_API_ENDPOINT', {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //     },
        //     body: JSON.stringify({ context })
        // });
        // const data = await response.json();
        // return data.suggestions;
        
        console.log('AI suggestions requested for:', context);
        return 'AI integration coming soon!';
    } catch (error) {
        console.error('Error getting AI suggestions:', error);
        return null;
    }
}

// ====================================
// Utility Functions
// ====================================

function formatTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
}

function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
}

// Export functions for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeApp,
        startTimer,
        pauseTimer,
        resetTimer,
        addTask,
        deleteTask,
        toggleTaskComplete,
        getAISuggestions
    };
}
