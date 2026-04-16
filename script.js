let editor;
let pyodide;
let activeLang;

// Initialize Monaco with a clean, high-end config
require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs' }});
require(['vs/editor/editor.main'], function() {
    editor = monaco.editor.create(document.getElementById('monaco-canvas'), {
        theme: 'vs-dark',
        automaticLayout: true,
        fontSize: 14,
        fontFamily: "'JetBrains Mono', monospace",
        lineNumbers: "off",
        minimap: { enabled: false },
        backgroundColor: "#000000",
        cursorSmoothCaretAnimation: "on",
        smoothScrolling: true
    });
    console.log("Aether Editor: Initialized");
});

async function launchIDE(lang) {
    console.log("Launching Node:", lang);
    activeLang = lang;
    
    // UI Transition
    document.getElementById('dashboard').classList.add('hidden');
    document.getElementById('editor-stage').classList.remove('hidden');
    document.getElementById('runtime-controls').classList.remove('hidden');
    
    const output = document.getElementById('output-stream');
    const model = editor.getModel();
    
    // Language Mapping
    monaco.editor.setModelLanguage(model, lang === 'python 3' ? 'python' : lang);

    if (lang.includes('python')) {
        editor.setValue("# Python Node Active\nprint('Hello World')");
        if (!pyodide) {
            output.innerText = "Initializing Kernel...";
            try {
                pyodide = await loadPyodide();
                output.innerText = "System Online.";
            } catch (e) {
                output.innerText = "Kernel Fault: Check Connection.";
            }
        }
    } else if (lang === 'html') {
        editor.setValue("<!DOCTYPE html>\n<html>\n<body>\n  <h1>USW Node</h1>\n</body>\n</html>");
        output.innerText = "HTML5 Node Active.";
    } else {
        editor.setValue("// JavaScript Node Active\nconsole.log('Uplink active');");
        output.innerText = "V8 Engine Ready.";
    }
}

async function runCode() {
    console.log("Executing...");
    const output = document.getElementById('output-stream');
    const code = editor.getValue();
    
    try {
        if (activeLang.includes('python') && pyodide) {
            // Capture standard output
            await pyodide.runPythonAsync(`import sys, io\nsys.stdout = io.StringIO()`);
            await pyodide.runPythonAsync(code);
            const result = pyodide.runPython("sys.stdout.getvalue()");
            output.innerText = result || "Sequence Complete (No Output).";
        } else if (activeLang === 'javascript') {
            // Run JS directly in browser
            eval(code);
            output.innerText = "Execution Successful.";
        } else if (activeLang === 'html') {
            // Open HTML in a new clean window
            const win = window.open();
            win.document.write(code);
            output.innerText = "Rendered in new tab.";
        }
    } catch (e) {
        console.error(e);
        output.innerText = "Fault: " + e.message;
    }
}

function deployToGithub() {
    console.log("Deploying...");
    // Redirects to your specific GitHub repo creation page
    const repoName = "usw-deployment-" + Date.now();
    window.open(`https://github.com/new?name=${repoName}`, '_blank');
}
