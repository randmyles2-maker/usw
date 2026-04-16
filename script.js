let editor, pyodide, activeLang, currentUser = null;

// Init Monaco
require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs' }});
require(['vs/editor/editor.main'], function() {
    editor = monaco.editor.create(document.getElementById('monaco-canvas'), {
        theme: 'vs-dark', automaticLayout: true, fontSize: 14, fontFamily: "'JetBrains Mono'", lineNumbers: "off", minimap: { enabled: false }
    });
});

// Auth Logic
function handleAuth(type) {
    const u = document.getElementById('username').value;
    const p = document.getElementById('password').value;
    const msg = document.getElementById('auth-msg');
    if (!u || !p) { msg.innerText = "MISSING_IDENTITY"; return; }

    if (type === 'signup') {
        if (USW_DATA.saveUser(u, p)) msg.innerText = "IDENTITY_CREATED. LOGIN.";
        else msg.innerText = "IDENTITY_EXISTS.";
    } else {
        if (USW_DATA.verifyUser(u, p)) {
            currentUser = u;
            document.getElementById('auth-overlay').classList.add('hidden');
        } else msg.innerText = "ACCESS_DENIED.";
    }
}

async function launchIDE(lang) {
    activeLang = lang;
    document.getElementById('dashboard').classList.add('hidden');
    document.getElementById('editor-stage').classList.remove('hidden');
    document.getElementById('runtime-controls').classList.remove('hidden');
    
    monaco.editor.setModelLanguage(editor.getModel(), lang);
    const savedCode = USW_DATA.loadCode(currentUser, lang);
    editor.setValue(savedCode || (lang === 'python' ? "print('Aether Node')" : "// Start coding"));

    if (lang === 'python' && !pyodide) {
        document.getElementById('output-stream').innerText = "Loading Kernel...";
        pyodide = await loadPyodide();
        document.getElementById('output-stream').innerText = "System Ready.";
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
            eval(code); output.innerText = "Logic Applied.";
        }
    } catch (e) { output.innerText = "Fault: " + e; }
}

function deployToGithub() {
    if (currentUser) {
        USW_DATA.saveCode(currentUser, activeLang, editor.getValue());
        document.getElementById('output-stream').innerText = "SNAPSHOT_SAVED.";
        window.open("https://github.com/new", "_blank");
    }
}
