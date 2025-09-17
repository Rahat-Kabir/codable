let ws = null;
let currentFiles = [];
let currentFileIndex = 0;
let isGenerating = false;
let projectHistory = JSON.parse(localStorage.getItem('projectHistory')) || [];
let currentProject = null;

// Initialize WebSocket connection
function initWebSocket() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    ws = new WebSocket(`${protocol}//${window.location.host}/ws`);

    ws.onopen = () => {
        console.log('Connected to server');
    };

    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleServerMessage(data);
    };

    ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        addMessage('assistant', 'Connection error. Please refresh the page.');
    };

    ws.onclose = () => {
        console.log('Disconnected from server');
        if (isGenerating) {
            addMessage('assistant', 'Connection lost. Please refresh the page.');
            isGenerating = false;
            updateUI();
        }
    };
}

// Handle messages from server
function handleServerMessage(data) {
    const { stage, message, timestamp, data: additionalData } = data;

    // Update status bar
    updateStatusBar(stage, message);

    // Handle different stages
    switch (stage) {
        case 'planner':
            if (!document.querySelector('.message.assistant:last-child')) {
                addMessage('assistant', 'Planning your project...');
            }
            break;

        case 'architect':
            updateLastAssistantMessage('Designing the architecture...');
            break;

        case 'coder':
            updateLastAssistantMessage('Writing the code...');
            break;

        case 'complete':
            if (additionalData && additionalData.files) {
                displayGeneratedFiles(additionalData.files);
                // Save to project history
                currentProject.files = additionalData.files;
                saveProjectToHistory(currentProject);
            }
            isGenerating = false;
            updateUI();
            hideStatusBar();
            break;

        case 'error':
            showError(message);
            isGenerating = false;
            updateUI();
            hideStatusBar();
            break;
    }
}

// Update status bar
function updateStatusBar(stage, message) {
    const statusBar = document.getElementById('statusBar');
    const statusText = statusBar.querySelector('.status-text');
    const statusDot = statusBar.querySelector('.status-dot');

    statusBar.style.display = 'block';
    statusText.textContent = message;

    // Update stage indicators
    const stages = statusBar.querySelectorAll('.stage');
    stages.forEach(s => {
        s.classList.remove('active', 'completed');
        if (s.dataset.stage === stage) {
            s.classList.add('active');
        } else if (getStageOrder(s.dataset.stage) < getStageOrder(stage)) {
            s.classList.add('completed');
        }
    });

    // Update status dot color
    if (stage === 'complete') {
        statusDot.style.background = 'var(--success-color)';
    } else if (stage === 'error') {
        statusDot.style.background = 'var(--error-color)';
    } else {
        statusDot.style.background = 'var(--warning-color)';
    }
}

function getStageOrder(stage) {
    const order = { 'planner': 0, 'architect': 1, 'coder': 2, 'complete': 3 };
    return order[stage] || -1;
}

function hideStatusBar() {
    setTimeout(() => {
        const statusBar = document.getElementById('statusBar');
        statusBar.style.display = 'none';
    }, 3000);
}

// Send prompt to server
function sendPrompt() {
    const input = document.getElementById('promptInput');
    const prompt = input.value.trim();

    if (!prompt || isGenerating) return;

    // Create new project
    currentProject = {
        id: Date.now().toString(),
        prompt: prompt,
        name: generateProjectName(prompt),
        date: new Date().toISOString(),
        files: []
    };

    // Clear input
    input.value = '';
    input.style.height = 'auto';

    // Hide welcome and show generating state
    showGeneratingState();

    // Send to server
    isGenerating = true;
    updateUI();

    ws.send(JSON.stringify({
        type: 'generate',
        prompt: prompt,
        recursion_limit: 100
    }));
}

// Send suggestion
function sendSuggestion(prompt) {
    document.getElementById('promptInput').value = prompt;
    sendPrompt();
}



// Display generated files
function displayGeneratedFiles(files) {
    currentFiles = files;
    currentFileIndex = 0;

    // Hide default state and show code section
    document.getElementById('defaultState').style.display = 'none';
    const codeSection = document.getElementById('codeSection');
    codeSection.style.display = 'flex';

    // Update project title
    if (currentProject) {
        document.getElementById('projectTitle').textContent = currentProject.name;
    }

    // Create file tabs
    const fileTabs = document.getElementById('fileTabs');
    fileTabs.innerHTML = '';

    files.forEach((file, index) => {
        const tab = document.createElement('button');
        tab.className = `file-tab ${index === 0 ? 'active' : ''}`;
        tab.textContent = file.filepath;
        tab.onclick = () => showFile(index);
        fileTabs.appendChild(tab);
    });

    if (files.length > 0) {
        showFile(0);
    }
}

// Show specific file
function showFile(index) {
    currentFileIndex = index;
    const file = currentFiles[index];

    // Update tabs
    const tabs = document.querySelectorAll('.file-tab');
    tabs.forEach((tab, i) => {
        tab.classList.toggle('active', i === index);
    });

    // Update code content
    const codeContent = document.getElementById('codeContent');
    codeContent.textContent = file.content;
    codeContent.className = `language-${file.language}`;

    // Re-highlight code
    Prism.highlightElement(codeContent);
}

// Download project as ZIP
async function downloadProject() {
    // For now, we'll create a simple download of all files
    // In production, you'd want to use a library like JSZip

    if (currentFiles.length === 0) return;

    // Create a blob with all files content
    let content = "Generated Project Files:\n\n";
    currentFiles.forEach(file => {
        content += `\n========== ${file.filepath} ==========\n`;
        content += file.content;
        content += "\n";
    });

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'generated-project.txt';
    a.click();
    URL.revokeObjectURL(url);
}

// Theme toggle
function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);

    // Update icons
    const sunIcon = document.querySelector('.sun-icon');
    const moonIcon = document.querySelector('.moon-icon');

    if (newTheme === 'dark') {
        sunIcon.style.display = 'none';
        moonIcon.style.display = 'block';
    } else {
        sunIcon.style.display = 'block';
        moonIcon.style.display = 'none';
    }
}

// Update UI state
function updateUI() {
    const sendButton = document.getElementById('sendButton');
    const promptInput = document.getElementById('promptInput');

    sendButton.disabled = isGenerating;
    promptInput.disabled = isGenerating;
}

// Auto-resize textarea
function autoResizeTextarea() {
    const textarea = document.getElementById('promptInput');
    textarea.addEventListener('input', function() {
        this.style.height = 'auto';
        const maxHeight = 120; // Maximum height
        if (this.scrollHeight <= maxHeight) {
            this.style.height = this.scrollHeight + 'px';
        } else {
            this.style.height = maxHeight + 'px';
            this.style.overflowY = 'auto';
        }
    });
}

// Handle Enter key
function handleEnterKey() {
    const textarea = document.getElementById('promptInput');
    textarea.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendPrompt();
        }
    });
}

// Generate project name from prompt
function generateProjectName(prompt) {
    // Extract key words and create a readable name
    const words = prompt.toLowerCase().split(' ');
    const keyWords = words.filter(word =>
        !['a', 'an', 'the', 'with', 'for', 'to', 'in', 'on', 'at', 'by', 'and', 'or', 'but', 'build', 'create', 'make'].includes(word)
    );

    let name = keyWords.slice(0, 3).join(' ');
    name = name.charAt(0).toUpperCase() + name.slice(1);
    return name || 'New Project';
}

// Show generating state
function showGeneratingState() {
    document.getElementById('welcomeSection').style.display = 'none';
}

// Show error state
function showError(message) {
    // Could add a toast notification or error display here
    console.error('Generation error:', message);
}

// Save project to history
function saveProjectToHistory(project) {
    // Add to beginning of array
    projectHistory.unshift(project);

    // Limit to 10 projects
    if (projectHistory.length > 10) {
        projectHistory = projectHistory.slice(0, 10);
    }

    // Save to localStorage
    localStorage.setItem('projectHistory', JSON.stringify(projectHistory));

    // Update UI
    updateProjectHistoryUI();
}

// Update project history UI
function updateProjectHistoryUI() {
    const projectList = document.getElementById('projectList');

    if (projectHistory.length === 0) {
        projectList.innerHTML = '<div class="empty-state"><p>No projects yet. Create your first project above!</p></div>';
        return;
    }

    projectList.innerHTML = '';

    projectHistory.forEach(project => {
        const item = document.createElement('div');
        item.className = 'project-item';

        const date = new Date(project.date);
        const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

        item.innerHTML = `
            <div class="project-content" onclick="loadProject('${project.id}')">
                <div class="project-name">${project.name}</div>
                <div class="project-date">${formattedDate}</div>
            </div>
            <button class="delete-button" onclick="event.stopPropagation(); deleteProject('${project.id}')" title="Delete project">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14zM10 11v6M14 11v6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </button>
        `;

        projectList.appendChild(item);
    });
}

// Load project from history
function loadProject(projectIdOrProject) {
    let project;

    // Handle both old direct object calls and new ID-based calls
    if (typeof projectIdOrProject === 'string') {
        project = projectHistory.find(p => p.id === projectIdOrProject);
    } else {
        project = projectIdOrProject;
    }

    if (!project) return;

    currentProject = project;
    currentFiles = project.files;

    if (project.files && project.files.length > 0) {
        displayGeneratedFiles(project.files);
    }
}

// Delete project from history and filesystem
async function deleteProject(projectId) {
    // Show confirmation dialog
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
        return;
    }

    try {
        // Call backend to delete project files
        const response = await fetch(`/api/projects/${projectId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error(`Failed to delete project: ${response.statusText}`);
        }

        // Remove from localStorage
        projectHistory = projectHistory.filter(project => project.id !== projectId);
        localStorage.setItem('projectHistory', JSON.stringify(projectHistory));

        // Update UI
        updateProjectHistoryUI();

        // If the deleted project is currently being displayed, clear the view
        if (currentProject && currentProject.id === projectId) {
            currentProject = null;
            currentFiles = [];
            document.getElementById('codeSection').style.display = 'none';
            document.getElementById('defaultState').style.display = 'flex';
        }

        console.log(`Project ${projectId} deleted successfully`);

    } catch (error) {
        console.error('Error deleting project:', error);
        alert('Failed to delete project. Please try again.');
    }
}

// Initialize app
window.onload = () => {
    // Set initial theme
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);

    if (savedTheme === 'dark') {
        document.querySelector('.sun-icon').style.display = 'none';
        document.querySelector('.moon-icon').style.display = 'block';
    }

    // Initialize WebSocket
    initWebSocket();

    // Setup event handlers
    autoResizeTextarea();
    handleEnterKey();

    // Load project history
    updateProjectHistoryUI();
};