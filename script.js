/**
 * USW AETHER // CORE ENGINE V2.1
 * Includes: PWA Support, Session Recovery, & Multi-Kernel Execution
 */

let editor, pyodide, activeLang, currentUser = null;

// 1. BOOT ENGINE & AUTO-LOGIN (Saves you from re-logging on refresh)
window.onload = () => {
    const savedSession = sessionStorage.getItem('usw_user');
    if (savedSession) {
        currentUser = savedSession;
        document.getElementById('auth-overlay').classList.add('hidden');
        updateSidebar();
        console.log("AETHER: Session Restored for " + currentUser);
    }

    // Register Service Worker for Downloadable App (PWA)
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('server.js')
            .then(() => console.log("AETHER: Internal Server Online"))
            .catch(err => console.log("AETHER: Server Fault", err));
    }
};

// 2. MONACO EDITOR INITIALIZATION
require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs' }});
require(['vs/editor/editor.main'], function() {
    editor = monaco.editor.create(document.getElementById('monaco-canvas'), {
        theme: 'vs-dark',
        automaticLayout: true,
        fontSize: 16,
        fontFamily: "'JetBrains Mono'",
        lineNumbers: "on",
        minimap: { enabled: false },
        padding: { top: 20 },
        backgroundColor: "#000000" // Solid black for typing visibility
    });
});

// 3. AUTHENTICATION SYSTEM
function handleAuth(type) {
    const u = document.getElementById('username').value;
    const p = document.getElementById('password').value;
    const msg = document.getElementById('auth-msg');

    if (!u || !p) {
        msg.innerText = "ID_REQUIRED";
        return;
    }

    if (type === 'signup') {
        if (USW_DATA.saveUser(u, p)) {
            msg.style.color = "#00ffaa";
            msg.innerText = "IDENTITY_CREATED. PROCEED TO LOGIN.";
        } else {
            msg.innerText = "ID_UNAVAILABLE.";
        }
    } else {
        if (USW_DATA.verifyUser(u, p)) {
            currentUser = u;
            sessionStorage.setItem('usw_user', u); // Saves session for refresh
            document.getElementById('auth-overlay').classList.add('hidden');
            updateSidebar();
        } else {
            msg.innerText = "ACCESS_DENIED.";
        }
    }
}

// 4. NAVIGATION & SIDEBAR
function updateSidebar() {
    const list = document.getElementById('saved-files-list');
    const users = JSON.parse(localStorage.getItem('usw_users') || '{}');
    const snippets = users[currentUser]?.snippets || {};
    list.innerHTML = "";
    
    Object.keys(snippets).forEach(lang => {
        const div = document.createElement('div');
        div.className = 'saved-item';
        div.innerText = `recover_${lang}.src`;
        div.style = "padding:12px; cursor:pointer; font-size:12px; border-bottom:1px solid rgba(255,255,255,0.05); color:#888; font-family:'JetBrains Mono'";
        div.onclick = () => launchIDE(lang, false);
        
        // Hover effect
        div.onmouseover = () => div.style.color = "white";
        div.onmouseout = () => div.style.color = "#888";
        
        list.appendChild(div);
    });
}

function backToMenu() {
    document.getElementById('editor-stage').classList.add('hidden');
    document.getElementById('runtime-controls').classList.add('hidden');
    document.getElementById('dashboard').classList.remove('hidden');
    updateSidebar();
}

// 5. IDE CORE LOGIC
async function launchIDE(lang, isNew) {
    activeLang = lang;
    document.getElementById('dashboard').classList.add('hidden');
    document.getElementById('editor-stage').classList.remove('hidden');
    document.getElementById('runtime-controls').classList.remove('hidden');
    
    // Set Editor Language Mode
    const mode = (lang === 'html') ? 'html' : (lang === 'javascript' ? 'javascript' : 'python');
    monaco.editor.setModelLanguage(editor.getModel(), mode);

    // Load Data
    if (isNew) {
        editor.setValue("");
    } else {
        const savedCode = USW_DATA.loadCode(currentUser, lang);
        editor.setValue(savedCode || "");
    }

    // Warm up Python Kernel if needed
    if (lang.includes('python') && !pyodide) {
        document.getElementById('output-stream').innerText = "SYSTEM: Mounting Python Kernel...";
        pyodide = await loadPyodide();
        document.getElementById('output-stream').innerText = "SYSTEM: Kernel Live.";
    }
}

// 6. EXECUTION ENGINE (THE RUN BUTTON)
async function runCode() {
    const out = document.getElementById('output-stream');
    const code = editor.getValue();
    out.style.color = "#00ffaa";
    out.innerText = "RUNNING...";

    try {
        if (activeLang.includes('python')) {
            if (!pyodide) throw new Error("Kernel Not Ready");
            
            await pyodide.runPythonAsync(`
import sys
import io
sys.stdout = io.StringIO()
            `);
            await pyodide.runPythonAsync(code);
            const result = pyodide.runPython("sys.stdout.getvalue()");
            out.innerText = result || "SYSTEM: Process Finished.";
        } 
        else if (activeLang === 'javascript') {
            // Hijack console.log to show in our mini-terminal
            const originalLog = console.log;
            console.log = (msg) => { out.innerText = "JS: " + msg; };
            eval(code);
            if (!code.includes("console.log")) out.innerText = "JS: Logic Executed.";
        } 
        else if (activeLang === 'html') {
            const win = window.open();
            win.document.write(code);
            out.innerText = "HTML: Instance Rendered.";
        }
    } catch (e) {
        out.style.color = "#ff4444";
        out.innerText = "FAULT: " + e.message;
    }
}

// 7. DEPLOYMENT (SAVE)
function deployToGithub() {
    if (!currentUser) return;
    USW_DATA.saveCode(currentUser, activeLang, editor.getValue());
    document.getElementById('output-stream').innerText = "SYSTEM: Snapshot Archived.";
    updateSidebar();
    
    // Optional: open GitHub as requested before
    window.open("https://github.com/new", "_blank");
}
