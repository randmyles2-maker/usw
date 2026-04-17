let editor, pyodide, activeLang, currentUser = null;

require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs' }});
require(['vs/editor/editor.main'], function() {
    editor = monaco.editor.create(document.getElementById('monaco-canvas'), {
        theme: 'vs-dark', automaticLayout: true, fontSize: 14, 
        fontFamily: "'JetBrains Mono'", lineNumbers: "off", minimap: { enabled: false }
    });
});

function handleAuth(type) {
    const u = document.getElementById('username').value;
    const p = document.getElementById('password').value;
    const msg = document.getElementById('auth-msg');
    if (!u || !p) { msg.innerText = "IDENTITY_REQUIRED"; return; }

    if (type === 'signup') {
        if (USW_DATA.saveUser(u, p)) msg.innerText = "SUCCESS. PROCEED TO LOGIN.";
        else msg.innerText = "ID_ALREADY_EXISTS.";
    } else {
        if (USW_DATA.verifyUser(u, p)) {
            currentUser = u;
            document.getElementById('auth-overlay').classList.add('hidden');
            updateSidebar();
        } else msg.innerText = "ACCESS_DENIED.";
    }
}

function updateSidebar() {
    const list = document.getElementById('saved-files-list');
    const users = JSON.parse(localStorage.getItem('usw_users') || '{}');
    const snippets = users[currentUser]?.snippets || {};
    list.innerHTML = "";
    
    Object.keys(snippets).forEach(lang => {
        const div = document.createElement('div');
        div.className = 'saved-item';
        div.innerText = `recovered_${lang}.src`;
        div.onclick = () => launchIDE(lang, false);
        list.appendChild(div);
    });
}

async function launchIDE(lang, isNew) {
    activeLang = lang;
    document.getElementById('dashboard').classList.add('hidden');
    document.getElementById('editor-stage').classList.remove('hidden');
    document.getElementById('runtime-controls').classList.remove('hidden');
    
    monaco.editor.setModelLanguage(editor.getModel(), lang === 'html' ? 'html' : 'python');

    if (isNew) {
        editor.setValue(lang === 'python' ? "# New Session\nprint('Hello World')" : "");
    } else {
        const savedCode = USW_DATA.loadCode(currentUser, lang);
        editor.setValue(savedCode || "");
    }

    if (lang.includes('python') && !pyodide) {
        document.getElementById('output-stream').innerText = "Initializing Kernel...";
        pyodide = await loadPyodide();
        document.getElementById('output-stream').innerText = "System Ready.";
    }
}

async function runCode() {
    const output = document.getElementById('output-stream');
    const code = editor.getValue();
    try {
        if (activeLang.includes('python') && pyodide) {
            await pyodide.runPythonAsync(`import sys, io\nsys.stdout = io.StringIO()`);
            await pyodide.runPythonAsync(code);
            output.innerText = pyodide.runPython("sys.stdout.getvalue()") || "Finished.";
        } else if (activeLang === 'javascript') {
            eval(code); output.innerText = "Logic Applied.";
        } else if (activeLang === 'html') {
            const win = window.open();
            win.document.write(code);
        }
    } catch (e) { output.innerText = "Fault: " + e; }
}

function deployToGithub() {
    if (currentUser) {
        USW_DATA.saveCode(currentUser, activeLang, editor.getValue());
        updateSidebar();
        document.getElementById('output-stream').innerText = "SNAPSHOT_SAVED.";
        window.open("https://github.com/new", "_blank");
    }
}

// FIXED: Returns to menu without logging out
function backToMenu() {
    document.getElementById('editor-stage').classList.add('hidden');
    document.getElementById('runtime-controls').classList.add('hidden');
    document.getElementById('dashboard').classList.remove('hidden');
    updateSidebar(); // Ensure sidebar reflects recent saves
}
