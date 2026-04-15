let editor;
let pyodide;

// Ensure it's not a phone (Desktop Security Check)
if (/Mobi|Android/i.test(navigator.userAgent)) {
    document.body.innerHTML = "<div style='color:white; padding:50px;'><h1>Access Denied</h1><p>USW Network is a Desktop-only environment for security and performance.</p></div>";
}

// 1. Setup Editor
require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs' }});
require(['vs/editor/editor.main'], function() {
    editor = monaco.editor.create(document.getElementById('editor-root'), {
        value: USW_CONFIG.DEFAULT_CODE,
        language: 'python',
        theme: 'vs-dark',
        automaticLayout: true,
        fontSize: 14, // Smaller font for desktop density
        fontFamily: "'Cascadia Code', 'Consolas', monospace",
        minimap: { enabled: true } // Enabled for desktop large screens
    });
});

// 2. Load Engine with Security Logging
async function loadUSW() {
    const status = document.getElementById('engine-status');
    try {
        pyodide = await loadPyodide();
        status.innerText = `Engine: ${USW_CONFIG.ENGINE}`;
        document.getElementById('console').innerText = "USW Secure Kernel: ONLINE\n--------------------------\n";
    } catch (e) {
        status.innerText = "Security Error: Kernel Failed";
    }
}
loadUSW();

// 3. Execution Logic with Error Sanitization
async function executePython() {
    if (!pyodide) return;
    const terminal = document.getElementById('console');
    terminal.innerText = "Executing in Sandbox...\n";
    
    try {
        // Standard Output Capture
        await pyodide.runPythonAsync(`import sys, io\nsys.stdout = io.StringIO()`);
        
        // Execute User Code
        await pyodide.runPythonAsync(editor.getValue());
        
        const output = pyodide.runPython("sys.stdout.getvalue()");
        terminal.innerText = output || "Process finished: No output.";
    } catch (err) {
        // Sanitize error to prevent script injection in console
        terminal.innerText = "Execution Error: Check your Python syntax.";
        console.error("USW Security Trace:", err);
    }
}

// 4. Deployment Logic
function deployToGithub() {
    const url = `https://github.com/new?template_name=${USW_CONFIG.GITHUB_SETTINGS.TEMPLATE_REPO}&template_owner=${USW_CONFIG.GITHUB_SETTINGS.USER}`;
    window.open(url, '_blank');
}
