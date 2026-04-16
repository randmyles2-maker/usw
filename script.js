let editor;
let pyodide;
let currentLang = "python";

// 1. Safe Monaco Loader
require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs' }});
require(['vs/editor/editor.main'], function() {
    editor = monaco.editor.create(document.getElementById('editor-root'), {
        value: USW_CONFIG.DEFAULT_PYTHON,
        language: 'python',
        theme: 'vs-dark',
        automaticLayout: true,
        fontSize: 14,
        minimap: { enabled: true }
    });
});

// 2. Fixed Kernel Loader (Prevents "Kernel Failed" Error)
async function initUSW() {
    const status = document.getElementById('engine-status');
    const terminal = document.getElementById('console');
    
    try {
        status.innerText = "Engine: Loading Python WASM...";
        pyodide = await loadPyodide();
        status.innerText = "Engine: Online (Python/JS)";
        terminal.innerText = "USW Secure Kernel v2.0 Initialized.\nReady for Desktop Execution.\n";
    } catch (e) {
        console.error(e);
        status.innerText = "Engine: Offline";
        terminal.innerText = "Security Error: Kernel Failed. Check Internet connection or Browser Permissions.";
    }
}
initUSW();

// 3. Language Switching Logic
function changeLanguage() {
    currentLang = document.getElementById('language-select').value;
    const model = editor.getModel();
    monaco.editor.setModelLanguage(model, currentLang);
    
    if(currentLang === "javascript") editor.setValue(USW_CONFIG.DEFAULT_JS);
    if(currentLang === "python") editor.setValue(USW_CONFIG.DEFAULT_PYTHON);
}

// 4. Fixed Run Function
async function runCode() {
    const terminal = document.getElementById('console');
    const code = editor.getValue();
    terminal.innerText = `[System] Executing ${currentLang}...\n`;

    if (currentLang === "python") {
        if (!pyodide) { terminal.innerText = "Error: Python Kernel not ready."; return; }
        try {
            await pyodide.runPythonAsync(`import sys, io\nsys.stdout = io.StringIO()`);
            await pyodide.runPythonAsync(code);
            const output = pyodide.runPython("sys.stdout.getvalue()");
            terminal.innerText += output || "Done (No output).";
        } catch (err) { terminal.innerText += "Python Error:\n" + err; }
    } 
    
    else if (currentLang === "javascript") {
        try {
            const logs = [];
            const oldLog = console.log;
            console.log = (m) => logs.push(m);
            eval(code);
            console.log = oldLog;
            terminal.innerText += logs.join('\n') || "JS Executed successfully.";
        } catch (err) { terminal.innerText += "JS Error:\n" + err; }
    }
}

function deployToGithub() {
    window.open(`https://github.com/new?template_name=${USW_CONFIG.GITHUB.REPO}&template_owner=${USW_CONFIG.GITHUB.USER}`, '_blank');
}
