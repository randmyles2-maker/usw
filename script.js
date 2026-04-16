let editor;
let pyodide;
let activeLang;

// Initialize Monaco Editor
require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs' }});
require(['vs/editor/editor.main'], function() {
    editor = monaco.editor.create(document.getElementById('monaco-root'), {
        theme: 'vs-dark',
        automaticLayout: true,
        fontSize: 15
    });
});

// Switch from Dashboard to IDE
async function bootIDE(lang, title) {
    activeLang = lang;
    document.getElementById('dashboard').style.display = 'none';
    document.getElementById('editor-view').style.display = 'flex';
    document.getElementById('ide-controls').style.display = 'flex';
    
    const terminal = document.getElementById('terminal-content');
    const model = editor.getModel();
    monaco.editor.setModelLanguage(model, lang);

    if (lang === 'python') {
        editor.setValue("# Python Node Initialized\nimport sys\nprint(f'WASM Python Active: {sys.version}')");
        if (!pyodide) {
            terminal.innerText = "Connecting to Isolated WASM Kernel...";
            try {
                pyodide = await loadPyodide();
                terminal.innerText = "Kernel 3.11 Ready.\n";
            } catch (e) {
                terminal.innerText = "Security Error: Kernel Failed to load.";
            }
        }
    } else if (lang === 'javascript') {
        editor.setValue("// JavaScript Web Kernel Active\nconsole.log('USW Network Ready');");
        terminal.innerText = "JS Engine Ready (Browser Native).\n";
    } else {
        editor.setValue(`// ${title} Node\n// Note: WASM execution for this language is currently read-only.`);
        terminal.innerText = "System: Compiler node offline.\n";
    }
}

// Execution Logic
async function runCode() {
    const terminal = document.getElementById('terminal-content');
    const code = editor.getValue();
    terminal.innerText = `[System] Executing ${activeLang}...\n`;

    try {
        if (activeLang === 'python' && pyodide) {
            await pyodide.runPythonAsync(`import sys, io\nsys.stdout = io.StringIO()`);
            await pyodide.runPythonAsync(code);
            terminal.innerText = pyodide.runPython("sys.stdout.getvalue()") || "Success (No output).";
        } else if (activeLang === 'javascript') {
            eval(code);
            terminal.innerText += "\n[Done] Script executed successfully.";
        } else {
            terminal.innerText += "\n[Error] Language kernel not found.";
        }
    } catch (err) {
        terminal.innerText = "Error: " + err;
    }
}

function deployToGithub() {
    window.open(`https://github.com/new`, '_blank');
}
