let editor, pyodide, activeLang, currentUser = null;

// Register Service Worker for PWA (Downloadable App)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('server.js');
    });
}

// Session Recovery
window.onload = () => {
    const saved = sessionStorage.getItem('usw_user');
    if (saved) {
        currentUser = saved;
        document.getElementById('auth-overlay').classList.add('hidden');
        updateSidebar();
    }
};

// Monaco Init
require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs' }});
require(['vs/editor/editor.main'], function() {
    editor = monaco.editor.create(document.getElementById('monaco-canvas'), {
        theme: 'vs-dark', automaticLayout: true, fontSize: 16, 
        fontFamily: "'JetBrains Mono'", lineNumbers: "on", minimap: { enabled: false },
        padding: { top: 20 }
    });
});

function handleAuth(type) {
    const u = document.getElementById('username').value;
    const p = document.getElementById('password').value;
    const msg = document.getElementById('auth-msg');
    if (type === 'signup') {
        USW_DATA.saveUser(u, p);
        msg.innerText = "CREATED. LOGIN.";
    } else {
        if (USW_DATA.verifyUser(u, p)) {
            currentUser = u;
            sessionStorage.setItem('usw_user', u);
            document.getElementById('auth-overlay').classList.add('hidden');
            updateSidebar();
        } else msg.innerText = "FAILED.";
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
        div.innerText = `recover_${lang}.src`;
        div.style = "padding:10px; cursor:pointer; font-size:12px; border-bottom:1px solid #222";
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
    editor.setValue(isNew ? "" : (USW_DATA.loadCode(currentUser, lang) || ""));

    if (lang.includes('python') && !pyodide) {
        document.getElementById('output-stream').innerText = "SYSTEM: Loading Python...";
        pyodide = await loadPyodide();
        document.getElementById('output-stream').innerText = "SYSTEM: Ready.";
    }
}

function backToMenu() {
    document.getElementById('editor-stage').classList.add('hidden');
    document.getElementById('runtime-controls').classList.add('hidden');
    document.getElementById('dashboard').classList.remove('hidden');
    updateSidebar();
}

async function runCode() {
    const out = document.getElementById('output-stream');
    try {
        if (activeLang.includes('python')) {
            await pyodide.runPythonAsync(`import sys, io\nsys.stdout = io.StringIO()`);
            await pyodide.runPythonAsync(editor.getValue());
            out.innerText = "PY: " + pyodide.runPython("sys.stdout.getvalue()");
        } else {
            eval(editor.getValue());
            out.innerText = "JS: Logic Applied.";
        }
    } catch (e) { out.innerText = "ERR: " + e; }
}

function deployToGithub() {
    USW_DATA.saveCode(currentUser, activeLang, editor.getValue());
    document.getElementById('output-stream').innerText = "SYSTEM: Snapshot Saved.";
    updateSidebar();
    window.open("https://github.com/new", "_blank");
}
