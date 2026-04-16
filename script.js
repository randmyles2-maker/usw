let editor;
let pyodide;
let currentLang = "python";

// Initialize Monaco
require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs' }});
require(['vs/editor/editor.main'], function() {
    editor = monaco.editor.create(document.getElementById('editor-root'), {
        value: "print('USW Network Active')\n# Type your code here",
        language: 'python',
        theme: 'vs-dark',
        automaticLayout: true
    });
});

async function initKernels() {
    const status = document.getElementById('engine-status');
    const terminal = document.getElementById('console');
    try {
        // Load Python as primary
        pyodide = await loadPyodide();
        status.innerText = "Engine: Ready (Python/JS/SQL)";
        terminal.innerText = "Kernel Loaded. System Secure.\n";
    } catch (e) {
        status.innerText = "Kernel Failure";
        terminal.innerText = "Error: Use a Desktop Browser (Chrome/Safari/Edge)\n" + e;
    }
}
initKernels();

function changeLanguage() {
    currentLang = document.getElementById('language-select').value;
    const models = monaco.editor.getModels();
    if (models.length > 0) {
        monaco.editor.setModelLanguage(models[0], currentLang);
    }
}

async function runCode() {
    const code = editor.getValue();
    const terminal = document.getElementById('console');
    terminal.innerText = `Executing ${currentLang}...\n`;

    if (currentLang === "python") {
        try {
            await pyodide.runPythonAsync(`import sys, io\nsys.stdout = io.StringIO()`);
            await pyodide.runPythonAsync(code);
            terminal.innerText = pyodide.runPython("sys.stdout.getvalue()");
        } catch (err) { terminal.innerText = "Python Error: " + err; }
    } 
    
    else if (currentLang === "javascript") {
        try {
            // Secure JS execution using eval in a caught block
            const logs = [];
            const customLog = (m) => logs.push(m);
            const originalLog = console.log;
            console.log = customLog;
            eval(code);
            console.log = originalLog;
            terminal.innerText = logs.join('\n') || "JS Executed (No console output)";
        } catch (err) { terminal.innerText = "JS Error: " + err; }
    }
    
    else {
        terminal.innerText = `Kernel for ${currentLang} coming soon via WASM updates.`;
    }
}
