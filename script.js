let editor;
let pyodide;
let activeID;

// Initial Monaco Setup
require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs' }});
require(['vs/editor/editor.main'], function() {
    editor = monaco.editor.create(document.getElementById('monaco-root'), {
        theme: 'vs-dark',
        automaticLayout: true,
        fontSize: 16,
        fontFamily: "'JetBrains Mono', monospace",
        lineNumbers: "on",
        glyphMargin: true
    });
});

async function bootIDE(id, label) {
    activeID = id;
    document.getElementById('matrix-dashboard').style.display = 'none';
    document.getElementById('ide-stage').style.display = 'flex';
    document.getElementById('ide-nav').style.display = 'flex';
    
    const term = document.getElementById('terminal-content');
    const model = editor.getModel();
    monaco.editor.setModelLanguage(model, id === 'python' ? 'python' : 'javascript');

    if (id === 'python') {
        editor.setValue("# NEURAL_NODE_ACTIVE\nprint('ACCESSING_KERNELS...')");
        if (!pyodide) {
            term.innerText = ">> INJECTING_WASM_PYTHON_RUNTIME...\n";
            pyodide = await loadPyodide();
            term.innerText += ">> UPLINK_SUCCESSFUL.\n";
        }
    } else {
        editor.setValue("// WEB_V8_UPLINK_READY");
        term.innerText = ">> STANDBY_FOR_INPUT...";
    }
}

async function runCode() {
    const term = document.getElementById('terminal-content');
    const code = editor.getValue();
    term.innerText = ">> EXECUTING_SEQUENCE...\n";

    try {
        if (activeID === 'python' && pyodide) {
            await pyodide.runPythonAsync(`import sys, io\nsys.stdout = io.StringIO()`);
            await pyodide.runPythonAsync(code);
            term.innerText = ">> RESULT_STREAM: \n" + pyodide.runPython("sys.stdout.getvalue()");
        } else {
            eval(code);
            term.innerText += ">> LOCAL_EXEC_COMPLETE.";
        }
    } catch (e) {
        term.innerText = ">> CRITICAL_ERROR: " + e;
    }
}

function deployToGithub() {
    window.open("https://github.com/new", "_blank");
}
