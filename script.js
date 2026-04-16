let editor, pyodide, activeLang, currentUser = null;

// 1. Initialize Monaco
require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs' }});
require(['vs/editor/editor.main'], function() {
    editor = monaco.editor.create(document.getElementById('monaco-canvas'), {
        theme: 'vs-dark',
        automaticLayout: true,
        fontSize: 14,
        fontFamily: "'JetBrains Mono'",
        lineNumbers: "off",
        minimap: { enabled: false },
        backgroundColor: "#000000"
    });
});

// 2. Auth Interface
function handleAuth(type) {
    const u = document.getElementById('username').value;
    const p = document.getElementById('password').value;
    const msg = document.getElementById('auth-msg');
    
    if (!u || !p) { msg.innerText = "IDENTITY_REQUIRED"; return; }

    if (type === 'signup') {
        if (USW_DATA.saveUser(u, p)) msg.innerText = "IDENTITY_SAVED. LOGIN NOW.";
        else msg.innerText = "ID_ALREADY_EXISTS.";
    } else {
        if (USW_DATA.verifyUser(u, p)) {
            currentUser = u;
            document.getElementById('auth-overlay').classList.add('hidden');
        } else msg.innerText = "ACCESS_DENIED.";
    }
}

// 3. Launch & Load Logic
async function launchIDE(lang) {
    activeLang = lang;
    document.getElementById('dashboard').classList.add('hidden');
    document.getElementById('editor-stage').classList.remove('hidden');
    document.getElementById('runtime-controls').classList.remove('hidden');
    
    // Switch Language
    monaco.editor.setModelLanguage(editor.getModel(), lang === 'html' ? 'html' : (lang.includes('python') ? 'python' : 'javascript'));

    // LOAD SAVED DATA
    const savedCode = USW_DATA.loadCode(currentUser, lang);
    if (savedCode) {
        editor.setValue(savedCode);
    } else {
        editor.setValue(lang === 'python' ? "# New Python Node\nprint('Hello')" : "// Start coding");
    }

    // Lazy load Python if needed
    if (lang.includes('python') && !pyodide) {
        document.getElementById('output-stream').innerText = "Initializing Kernel...";
        pyodide = await loadPyodide();
        document.getElementById('output-stream').innerText = "System Ready.";
    }
}

// 4. THE RUN FUNCTION
async function runCode() {
    const output = document.getElementById('output-stream');
    const code = editor.getValue();
    output.innerText = "Executing...";

    try {
        if (activeLang.includes('python') && pyodide) {
            await pyodide.runPythonAsync(`import sys, io\nsys.stdout = io.StringIO()`);
            await pyodide.runPythonAsync(code);
            output.innerText = pyodide.runPython("sys.stdout.getvalue()") || "Success (no output).";
        } else if (activeLang === 'javascript') {
            eval(code); 
            output.innerText = "Logic Applied.";
        } else if (activeLang === 'html') {
            const win = window.open();
            win.document.write(code);
            output.innerText = "HTML Rendered in new tab.";
        }
    } catch (e) {
        output.innerText = "Fault: " + e;
    }
}

// 5. THE DEPLOY (SAVE) FUNCTION
function deployToGithub() {
    if (!currentUser) return;
    
    const code = editor.getValue();
    const success = USW_DATA.saveCode(currentUser, activeLang, code);
    
    if (success) {
        const output = document.getElementById('output-stream');
        output.innerText = "SNAPSHOT_SAVED_TO_IDENTITY.";
        
        // Brief delay before opening GitHub to ensure save registers
        setTimeout(() => {
            window.open("https://github.com/new", "_blank");
        }, 500);
    }
}
