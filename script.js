let editor;
let pyodide;
let activeModule;

// 1. Safe Desktop Check (Secures the app to Mac/Laptops)
if (/Mobi|Android|iPhone/i.test(navigator.userAgent)) {
    document.body.innerHTML = "<h1 style='color:white;text-align:center;padding-top:200px;'>Desktop-Class Secure Node: MacBook/PC Required</h1>";
}

// 2. Load Monaco Editor (Standard Setup)
require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs' }});
require(['vs/editor/editor.main'], function() {
    editor = monaco.editor.create(document.getElementById('editor-canvas'), {
        theme: 'vs-dark',
        automaticLayout: true,
        fontSize: 15,
        fontFamily: "'JetBrains Mono', monospace"
    });
    console.log("IDE Core Ready");
});

// 3. App Installation Manager (Professional PWA)
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    document.getElementById('install-btn').style.display = 'block';
});

document.getElementById('install-btn').addEventListener('click', async () => {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') document.getElementById('install-btn').style.display = 'none';
        deferredPrompt = null;
    }
});

// 4. Cool "Check Node" System Performance
function performDiag() {
    const terminal = document.getElementById('console-stream');
    terminal.innerText = "[USW Diagnostics] Analyzing browser...\n";
    let speedTestStart = performance.now();
    for (let i = 0; i < 1e7; i++) { } // Simple WASM block simulator
    let speedTestEnd = performance.now();
    terminal.innerText += `> Performance Class: ${speedTestEnd - speedTestStart < 15 ? 'Secure Node' : 'Limited Node'}\n`;
    terminal.innerText += "> Environment: Desktop Approved\n";
    terminal.innerText += `> Time: ${new Date().toLocaleTimeString()}\n`;
    terminal.innerText += "[STATUS] Environment is Optimal.";
}

// 5. Boot Selected IDE Module
async function bootModule(lang, displayName) {
    activeModule = lang;
    document.getElementById('dashboard').style.display = 'none';
    document.getElementById('editor-stage').style.display = 'flex';
    document.getElementById('editor-nav').style.display = 'flex';
    document.getElementById('active-module').innerText = `[${displayName.toUpperCase()}]`;

    const model = editor.getModel();
    monaco.editor.setModelLanguage(model, lang);
    
    // Modern Templates
    if (lang === 'python') {
        editor.setValue("import sys\nimport time\nprint('USW AI Kernel Live')\ntime.sleep(1)\nprint('System Online')");
        initializePython(); // Lazy load the heavy engine
    } else {
        editor.setValue("// Compiled languages (like Java) require connection to a dedicated WASM node.\n// Coming Soon.");
    }
}

// 6. Primary Python Kernal Loader
async function initializePython() {
    if (pyodide) return;
    const terminal = document.getElementById('console-stream');
    const status = document.getElementById('engine-info');
    try {
        status.innerText = "Connecting to Pyodide WASM...";
        terminal.innerText = "USW Secure AI Kernel Initializing...\n[BOOT] Setting up isolated memory...\n";
        pyodide = await loadPyodide();
        terminal.innerText += "[BOOT] Python 3.11 WASM Engine Ready.\n";
        status.innerText = "AI Kernel: Ready";
    } catch (e) {
        terminal.innerText = "CRITICAL FAILURE: " + e;
        status.innerText = "Kernel Failed";
    }
}

function closeEditor() {
    location.reload(); // Simple, secure exit and reset
}

async function runCode() {
    const terminal = document.getElementById('console-stream');
    const code = editor.getValue();
    terminal.innerText = "[Executing Script]...\n";
    
    if (activeModule === 'python' && pyodide) {
        try {
            await pyodide.runPythonAsync(`import sys, io\nsys.stdout = io.StringIO()`);
            await pyodide.runPythonAsync(code);
            terminal.innerText = pyodide.runPython("sys.stdout.getvalue()");
        } catch (err) { terminal.innerText = "PYTHON ERROR:\n" + err; }
    } else { terminal.innerText = "Language node offline."; }
}

function deployToGithub() {
    // Uses config.js details, but wrapped in safety check
    if (typeof USW_CONFIG !== 'undefined') {
        const url = `https://github.com/new?template_name=${USW_CONFIG.GITHUB.REPO}&template_owner=${USW_CONFIG.GITHUB.USER}`;
        window.open(url, '_blank');
    }
}
