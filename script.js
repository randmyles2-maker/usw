let editor, pyodide, activeLang, currentUser = null;

// BOOT & SESSION RECOVERY
window.addEventListener('load', () => {
    const savedUser = sessionStorage.getItem('usw_user');
    const savedLang = sessionStorage.getItem('active_lang');
    
    if (savedUser) {
        currentUser = savedUser;
        document.getElementById('auth-overlay').classList.add('hidden');
        if (savedLang) launchIDE(savedLang, false); // Resume where you left off
        else updateSidebar();
    }

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./server.js');
    }
});

// MONACO CONFIG
require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs' }});
require(['vs/editor/editor.main'], function() {
    editor = monaco.editor.create(document.getElementById('monaco-canvas'), {
        theme: 'vs-dark',
        automaticLayout: true,
        fontSize: 16,
        fontFamily: "'JetBrains Mono'",
        backgroundColor: "#000000"
    });
});

// AUTH
function handleAuth(type) {
    const u = document.getElementById('username').value;
    const p = document.getElementById('password').value;
    const msg = document.getElementById('auth-msg');
    if (type === 'signup') {
        if(USW_DATA.saveUser(u, p)) msg.innerText = "IDENTITY CREATED.";
        else msg.innerText = "ID TAKEN.";
    } else {
        if (USW_DATA.verifyUser(u, p)) {
            currentUser = u;
            sessionStorage.setItem('usw_user', u);
            document.getElementById('auth-overlay').classList.add('hidden');
            updateSidebar();
        } else msg.innerText = "ACCESS DENIED.";
    }
}

// IDE CONTROLS
async function launchIDE(lang, isNew) {
    activeLang = lang;
    sessionStorage.setItem('active_lang', lang);
    document.getElementById('dashboard').classList.add('hidden');
    document.getElementById('editor-stage').classList.remove('hidden');
    document.getElementById('runtime-controls').classList.remove('hidden');
    
    const model = editor.getModel();
    monaco.editor.setModelLanguage(model, lang === 'html' ? 'html' : (lang === 'javascript' ? 'javascript' : 'python'));
    
    if (!isNew) editor.setValue(USW_DATA.loadCode(currentUser, lang) || "");
    else editor.setValue("");

    if (lang === 'python' && !pyodide) {
        document.getElementById('output-stream').innerText = "MOUNTING PYTHON...";
        pyodide = await loadPyodide();
        document.getElementById('output-stream').innerText = "READY.";
    }
}

async function runCode() {
    const out = document.getElementById('output-stream');
    const code = editor.getValue();
    out.innerText = "EXECUTING...";
    try {
        if (activeLang === 'python') {
            await pyodide.runPythonAsync(`import sys, io\nsys.stdout = io.StringIO()`);
            await pyodide.runPythonAsync(code);
            out.innerText = "PY: " + pyodide.runPython("sys.stdout.getvalue()");
        } else if (activeLang === 'javascript') {
            const runner = new Function(code);
            runner();
            out.innerText = "JS: LOGIC APPLIED.";
        } else if (activeLang === 'html') {
            const win = window.open();
            win.document.write(code);
            out.innerText = "HTML: RENDERED.";
        }
    } catch (e) { out.innerText = "ERR: " + e.message; }
}

function backToMenu() {
    sessionStorage.removeItem('active_lang');
    document.getElementById('editor-stage').classList.add('hidden');
    document.getElementById('runtime-controls').classList.add('hidden');
    document.getElementById('dashboard').classList.remove('hidden');
    updateSidebar();
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
        div.onclick = () => launchIDE(lang, false);
        list.appendChild(div);
    });
}

function deployToGithub() {
    USW_DATA.saveCode(currentUser, activeLang, editor.getValue());
    updateSidebar();
}
