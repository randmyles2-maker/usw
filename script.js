let editor, pyodide, activeLang;

require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs' }});
require(['vs/editor/editor.main'], function() {
    editor = monaco.editor.create(document.getElementById('monaco-canvas'), {
        theme: 'vs-dark',
        automaticLayout: true,
        fontSize: 14,
        fontFamily: "'JetBrains Mono', monospace",
        lineNumbers: "off",
        minimap: { enabled: false },
        backgroundColor: "#000000"
    });
});

async function launchIDE(lang) {
    activeLang = lang;
    document.getElementById('dashboard').classList.add('hidden');
    document.getElementById('editor-stage').classList.remove('hidden');
    document.getElementById('runtime-controls').classList.remove('hidden');
    
    const output = document.getElementById('output-stream');
    monaco.editor.setModelLanguage(editor.getModel(), lang);

    if (lang === 'python') {
        editor.setValue("print('Node: Python 3.11')");
        if (!pyodide) {
            output.innerText = "Initializing WASM Kernel...";
            pyodide = await loadPyodide();
            output.innerText = "System Active.";
        }
    } else {
        editor.setValue(lang === 'html' ? "" : "// Script Node");
        output.innerText = "Aether Node Ready.";
    }
}

async function runCode() {
    const output = document.getElementById('output-stream');
    const code = editor.getValue();
    
    try {
        if (activeLang === 'python' && pyodide) {
            await pyodide.runPythonAsync(`import sys, io\nsys.stdout = io.StringIO()`);
            await pyodide.runPythonAsync(code);
            output.innerText = pyodide.runPython("sys.stdout.getvalue()") || "Finished.";
        } else if (activeLang === 'javascript') {
            eval(code);
            output.innerText = "Logic executed.";
        }
    } catch (e) {
        output.innerText = "Fault: " + e;
    }
}
