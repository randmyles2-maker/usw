let editor;
let pyodide;
let currentLang = "python";

// 1. Desktop Security Check
if (/Mobi|Android|iPhone/i.test(navigator.userAgent)) {
    window.location.href = "about:blank"; // Immediate block for non-desktops
}

// 2. Initialize Monaco Editor
require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs' }});
require(['vs/editor/editor.main'], function() {
    editor = monaco.editor.create(document.getElementById('editor-root'), {
        value: USW_CONFIG.TEMPLATES.python,
        language: 'python',
        theme: 'vs-dark',
        automaticLayout: true,
        fontSize: 14,
        fontFamily: "'Cascadia Code', 'Consolas', monospace"
    });
});

// 3. Initialize Python Engine (Pyodide)
async function startKernel() {
    const status = document.getElementById('engine-status');
    const terminal = document.getElementById('console');
    try {
        pyodide = await loadPyodide();
        status.innerText = "Engine: Python 3.11 (WASM) Ready";
        terminal.innerText = "USW Secure Kernel: ONLINE\n--------------------------\n";
    } catch (e) {
        status.innerText = "Engine: Security Error";
        terminal.innerText = "CRITICAL: Kernel Failed. Refresh (Cmd+R).";
    }
}
startKernel();

// 4. Multi-Language Switcher
function changeLanguage() {
    currentLang = document.getElementById('language-select').value;
    const model = editor.getModel();
    monaco.editor.setModelLanguage(model, currentLang);
    editor.setValue(USW_CONFIG.TEMPLATES[currentLang] || "");
}

// 5. Secure Execution Logic
async function runCode() {
    const terminal = document.getElementById('console');
    const code = editor.getValue();
    terminal.innerText = `[Executing ${currentLang.toUpperCase()}]\n`;

    if (currentLang === "python") {
        try {
            await pyodide.runPythonAsync(`import sys, io\nsys.stdout = io.StringIO()`);
            await pyodide.runPythonAsync(code);
            const stdout = pyodide.runPython("sys.stdout.getvalue()");
            terminal.innerText += stdout || "Execution finished (no output).";
        } catch (err) {
            terminal.innerText += "PYTHON ERROR:\n" + err;
        }
    } else if (currentLang === "javascript") {
        try {
            const logs = [];
            const tempLog = (m) => logs.push(m);
            const oldLog = console.log;
            console.log = tempLog;
            eval(code); // Sandboxed by browser tab
            console.log = oldLog;
            terminal.innerText += logs.join('\n') || "JS Executed.";
        } catch (err) {
            terminal.innerText += "JS ERROR:\n" + err;
        }
    } else {
        terminal.innerText += "This language requires a dedicated WASM compiler node (Coming Soon).";
    }
}

function deployToGithub() {
    const url = `https://github.com/new?template_name=${USW_CONFIG.GITHUB.REPO}&template_owner=${USW_CONFIG.GITHUB.USER}`;
    window.open(url, '_blank');
}
