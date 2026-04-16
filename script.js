let editor;
let pyodide;

// 1. Load Editor immediately so the screen isn't blank
require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs' }});
require(['vs/editor/editor.main'], function() {
    editor = monaco.editor.create(document.getElementById('editor-root'), {
        value: "print('USW Network Ready')",
        language: 'python',
        theme: 'vs-dark',
        automaticLayout: true
    });
    console.log("Editor Loaded");
});

// 2. Load Python Engine second
async function initPython() {
    const status = document.getElementById('engine-status');
    try {
        pyodide = await loadPyodide();
        status.innerText = "Engine: Python Ready";
        document.getElementById('console').innerText = "System Online.\n";
    } catch (e) {
        status.innerText = "Engine: Offline (Python Load Failed)";
        console.error("Kernel Error:", e);
    }
}
initPython();

// 3. The Run Function
async function runCode() {
    const terminal = document.getElementById('console');
    if (!pyodide) {
        terminal.innerText = "Error: Engine still loading or failed. Please refresh.";
        return;
    }
    terminal.innerText = "Running...\n";
    try {
        const code = editor.getValue();
        await pyodide.runPythonAsync(`import sys, io\nsys.stdout = io.StringIO()`);
        await pyodide.runPythonAsync(code);
        terminal.innerText = pyodide.runPython("sys.stdout.getvalue()") || "Finished.";
    } catch (err) {
        terminal.innerText = "Error: " + err;
    }
}

// 4. The Deploy Function
function deployToGithub() {
    // Make sure config.js is present or this will error!
    const user = typeof USW_CONFIG !== 'undefined' ? USW_CONFIG.GITHUB.USER : "randmyles2-maker";
    const repo = typeof USW_CONFIG !== 'undefined' ? USW_CONFIG.GITHUB.REPO : "usw";
    window.open(`https://github.com/new?template_name=${repo}&template_owner=${user}`, '_blank');
}
