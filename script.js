let editor, pyodide, activeLang, currentUser = null;

/** 1. BOOT VIRTUAL SERVER **/
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('server.js').then(() => {
        console.log("Aether Kernel Online.");
    });
}

async function pingServer() {
    try {
        const res = await fetch('/api/system/status');
        const data = await res.json();
        alert(`Server Engine: ${data.engine}\nStatus: ${data.status}`);
    } catch(e) { console.log("Server Handshake Failed"); }
}

/** 2. INIT EDITOR **/
require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs' }});
require(['vs/editor/editor.main'], function() {
    editor = monaco.editor.create(document.getElementById('monaco-canvas'), {
        theme: 'vs-dark', automaticLayout: true, fontSize: 14, 
        fontFamily: "'JetBrains Mono'", lineNumbers: "off", minimap: { enabled: false },
        backgroundColor: "#00000000" // Transparent for Aether BG
    });
});

/** 3. AUTH & NAVIGATION **/
function handleAuth(type) {
    const u = document.getElementById('username').value;
    const p = document.getElementById('password').value;
    const msg = document.getElementById('auth-msg');
    if (!u || !p) return;

    if (type === 'signup') {
        if (USW_DATA.saveUser(u, p)) msg.innerText = "IDENTITY_CREATED. LOGIN.";
        else msg.innerText = "ID_UNAVAILABLE.";
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
        div.innerText = `archive_${lang}.src`;
        div.onclick = () => launchIDE(lang, false);
        list.appendChild(div);
    });
}

function backToMenu() {
    document.getElementById('editor-stage').classList.add('hidden');
    document.getElementById('runtime-controls').classList.add('hidden');
    document.getElementById('dashboard').classList.remove('hidden');
    updateSidebar();
}

/** 4. IDE CORE **/
async function launchIDE(lang, isNew) {
    activeLang = lang;
    document.getElementById('dashboard').classList.add('hidden');
    document.getElementById('editor-stage').classList.remove('hidden');
    document.getElementById('runtime-controls').classList.remove('hidden');
    
    monaco.editor.setModelLanguage(editor.getModel(), lang === 'html' ? 'html' : 'python');
    
    if (isNew) {
        editor.setValue(lang === 'python' ? "# New Session\nprint('Aether Live')" : "");
    } else {
        editor.setValue(USW_DATA.loadCode(currentUser, lang) || "");
    }

    if (lang.includes('python') && !pyodide) {
        document.getElementById('output-stream').innerText = "Mounting Python Kernel...";
        pyodide = await loadPyodide();
        document.getElementById('output-stream').innerText = "Kernel Mounted.";
    }
}

async function runCode() {
    const out = document.getElementById('output-stream');
    try {
        if (activeLang.includes('python')) {
            await pyodide.runPythonAsync(`import sys, io\nsys.stdout = io.StringIO()`);
            await pyodide.runPythonAsync(editor.getValue());
            out.innerText = pyodide.runPython("sys.stdout.getvalue()") || "Finished.";
        } else if (activeLang === 'javascript') {
            eval(editor.getValue()); out.innerText = "V8 Sequence Success.";
        } else {
            const w = window.open(); w.document.write(editor.getValue());
        }
    } catch (e) { out.innerText = "Error: " + e; }
}

function deployToGithub() {
    USW_DATA.saveCode(currentUser, activeLang, editor.getValue());
    document.getElementById('output-stream').innerText = "SNAPSHOT_DEPLOYED.";
    updateSidebar();
    window.open("https://github.com/new", "_blank");
}
