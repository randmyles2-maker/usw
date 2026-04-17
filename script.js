let editor, pyodide, activeLang, currentUser = null;

// 1. BOOT ENGINE & AUTO-LOGIN
window.onload = () => {
    // Check if we are already logged in from a previous session
    const savedSession = sessionStorage.getItem('usw_active_user');
    if (savedSession) {
        currentUser = savedSession;
        document.getElementById('auth-overlay').classList.add('hidden');
        updateSidebar();
        console.log("Session Restored:", currentUser);
    }
};

// 2. MAXED SERVER (Service Worker)
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('server.js');
}

// 3. AUTH LOGIC (With Session Saving)
function handleAuth(type) {
    const u = document.getElementById('username').value;
    const p = document.getElementById('password').value;
    const msg = document.getElementById('auth-msg');

    if (type === 'signup') {
        if (USW_DATA.saveUser(u, p)) msg.innerText = "IDENTITY_CREATED. LOGIN.";
        else msg.innerText = "ID_TAKEN.";
    } else {
        if (USW_DATA.verifyUser(u, p)) {
            currentUser = u;
            // SAVE SESSION so reload doesn't trigger login
            sessionStorage.setItem('usw_active_user', u);
            document.getElementById('auth-overlay').classList.add('hidden');
            updateSidebar();
        } else {
            msg.innerText = "INVALID_ACCESS.";
        }
    }
}

// 4. EDITOR INIT
require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs' }});
require(['vs/editor/editor.main'], function() {
    editor = monaco.editor.create(document.getElementById('monaco-canvas'), {
        theme: 'vs-dark', automaticLayout: true, fontSize: 14, 
        fontFamily: "'JetBrains Mono'", lineNumbers: "off", minimap: { enabled: false },
        backgroundColor: "#00000000"
    });
});

// 5. CORE FUNCTIONS
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

async function launchIDE(lang, isNew) {
    activeLang = lang;
    document.getElementById('dashboard').classList.add('hidden');
    document.getElementById('editor-stage').classList.remove('hidden');
    document.getElementById('runtime-controls').classList.remove('hidden');
    
    monaco.editor.setModelLanguage(editor.getModel(), lang === 'html' ? 'html' : 'python');
    editor.setValue(isNew ? "" : (USW_DATA.loadCode(currentUser, lang) || ""));

    if (lang.includes('python') && !pyodide) {
        pyodide = await loadPyodide();
    }
}

function deployToGithub() {
    USW_DATA.saveCode(currentUser, activeLang, editor.getValue());
    updateSidebar();
    window.open("https://github.com/new", "_blank");
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
            out.innerText = pyodide.runPython("sys.stdout.getvalue()");
        } else {
            eval(editor.getValue());
            out.innerText = "Executed.";
        }
    } catch (e) { out.innerText = e; }
}
