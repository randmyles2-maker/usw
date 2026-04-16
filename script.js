/**
 * USW Network | Secure Node Logic
 * Version: 2.3.0
 */

let editor;
let pyodide;
let activeLang = 'python';

// --- 1. CORE INITIALIZATION ---

// Load Monaco Editor with JetBrains font and dark theme
require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs' }});
require(['vs/editor/editor.main'], function() {
    editor = monaco.editor.create(document.getElementById('monaco-root'), {
        theme: 'vs-dark',
        automaticLayout: true,
        fontSize: 15,
        fontFamily: "'JetBrains Mono', monospace",
        minimap: { enabled: false }
    });
    console.log("IDE Canvas Ready");
});

// --- 2. MODULE NAVIGATION ---

/**
 * Switch from Dashboard to IDE
 * @param {string} lang - Language ID (python, javascript, cpp, etc.)
 * @param {string} title - Display Name
 */
async function bootIDE(lang, title) {
    activeLang = lang;
    
    // UI Transitions
    document.getElementById('dashboard-view').style.display = 'none';
    document.getElementById('editor-view').style.display = 'flex';
    document.getElementById('ide-actions').style.display = 'flex';
    
    // Set Monaco Language
    const model = editor.getModel();
    monaco.editor.setModelLanguage(model, lang === 'cpp' ? 'cpp' : lang);

    // Language-Specific Logic
    const output = document.getElementById('terminal-content');
    
    if (lang === 'python') {
        editor.setValue("# USW Python Node\nimport sys\nprint('Kernel Live:', sys.version)\n");
        if (!pyodide) {
            output.innerText = "Initializing Python WASM Kernel...";
            try {
                pyodide = await loadPyodide();
                output.innerText = "Python 3.11 Node Online.\n";
            } catch (e) {
                output.innerText = "Security Error: Python Kernel Failed.";
            }
        }
    } else if (lang === 'javascript') {
        editor.setValue("// USW JavaScript Node\nconsole.log('Web Kernel Active');\n");
        output.innerText = "JavaScript Engine Ready (Browser Native).";
    } else {
        editor.setValue(`// ${title} Node\n// Note: This language requires a WASM compiler connection.\n`);
        output.innerText = "WASM Node for this language is in Alpha.";
    }
}

// --- 3. EXECUTION ENGINE ---

async function runCode() {
    const output = document.getElementById('terminal-content');
    const code = editor.getValue();
    output.innerText = `[System: Executing ${activeLang.toUpperCase()}]\n`;

    try {
        if (activeLang === 'python' && pyodide) {
            // Setup virtual stdout to capture prints
            await pyodide.runPythonAsync(`import sys, io\nsys.stdout = io.StringIO()`);
            await pyodide.runPythonAsync(code);
            const result = pyodide.runPython("sys.stdout.getvalue()");
            output.innerText += result || "Execution finished (no output).";
        } else if (activeLang === 'javascript') {
            // Secure local eval for JS
            const logs = [];
            const originalLog = console.log;
            console.log = (m) => logs.push(m);
            eval(code);
            console.log = originalLog;
            output.innerText += logs.join('\n') || "JS Finished.";
        } else {
            output.innerText += "Engine Warning: Selected language kernel is currently read-only.";
        }
    } catch (err) {
        output.innerText += "\n[ERROR] " + err;
    }
}

// --- 4. GITHUB DEPLOYMENT ---

function deployToGithub() {
    // Uses details from your config.js
    const user = typeof USW_CONFIG !== 'undefined' ? USW_CONFIG.GITHUB.USER : "randmyles2-maker";
    const repo = typeof USW_CONFIG !== 'undefined' ? USW_CONFIG.GITHUB.REPO : "usw";
    
    const url = `https://github.com/new?template_name=${repo}&template_owner=${user}`;
    window.open(url, '_blank');
}

// --- 5. PWA (DOWNLOADABLE APP) LOGIC ---

let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    const installBtn = document.getElementById('install-btn');
    if (installBtn) installBtn.style.display = 'block';
});

async function triggerInstall() {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            document.getElementById('install-btn').style.display = 'none';
        }
        deferredPrompt = null;
    }
}

// Bind install button if it exists
document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('install-btn');
    if (btn) btn.onclick = triggerInstall;
});
