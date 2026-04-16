let editor, pyodide, activeLang;

// Initialize Editor
require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs' }});
require(['vs/editor/editor.main'], function() {
    editor = monaco.editor.create(document.getElementById('monaco-canvas'), {
        theme: 'vs-dark',
        automaticLayout: true,
        fontSize: 15,
        fontFamily: "'JetBrains Mono', monospace",
        lineNumbers: "off", // Cleaner look
        roundedSelection: true,
        scrollBeyondLastLine: false,
        backgroundColor: "#000000"
    });
});

async function launchIDE(lang) {
    activeLang = lang;
    document.getElementById('dashboard').classList.add('hidden');
    document.getElementById('editor-stage').classList.remove('hidden');
    document.getElementById('runtime-controls').classList.remove('hidden');
    
    const output = document.getElementById('output-stream');
    const model = editor.getModel();
    monaco.editor.setModelLanguage(model, lang);

    if (lang === 'python') {
        editor.setValue("print('Environment Live')");
        if (!pyodide) {
            output.innerText = "Loading Kernel...";
            pyodide = await loadPyodide();
            output.innerText = "System Online.";
        }
    } else {
        editor.setValue("// Script Node Ready");
        output.innerText = "Ready.";
    }
}

async function runCode() {
    const output = document.getElementById('output-stream');
    const code = editor.getValue();
    output.innerText = "Executing...";

    try {
        if (activeLang === 'python' && pyodide) {
            await pyodide.runPythonAsync(`import sys, io\nsys.stdout = io.StringIO()`);
            await pyodide.runPythonAsync(code);
            output.innerText = pyodide.runPython("sys.stdout.getvalue()") || "Finished.";
        } else if (activeLang === 'javascript') {
            eval(code);
            output.innerText = "Success.";
        }
    } catch (e) {
        output.innerText = "Error: " + e;
    }
}

function deployToGithub() {
    window.open("https://github.com/new", "_blank");
}
