let editor, pyodide, currentLang;

// 1. App Installation (PWA)
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    document.getElementById('install-btn').style.display = 'block';
});

document.getElementById('install-btn').addEventListener('click', async () => {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt = null;
    }
});

// 2. Load Monaco Editor
require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs' }});
require(['vs/editor/editor.main'], function() {
    editor = monaco.editor.create(document.getElementById('editor-root'), {
        theme: 'vs-dark',
        automaticLayout: true,
        fontSize: 15
    });
});

// 3. Open Selected Module
async function openIDE(lang, displayName) {
    currentLang = lang;
    document.getElementById('dashboard').style.display = 'none';
    document.getElementById('editor-view').style.display = 'flex';
    document.getElementById('editor-controls').style.display = 'flex';
    document.getElementById('active-lang-indicator').innerText = displayName;

    const model = editor.getModel();
    monaco.editor.setModelLanguage(model, lang === 'cpp' ? 'cpp' : lang);
    
    // Initial Templates
    const templates = {
        python: "print('Python Kernel Active')",
        javascript: "console.log('JavaScript Active');",
        cpp: "#include <iostream>\nint main() { std::cout << 'C++ Active'; return 0; }",
        sql: "SELECT 'SQL Kernel Active' AS status;"
    };
    editor.setValue(templates[lang] || "// Start coding...");

    if (lang === 'python' && !pyodide) {
        document.getElementById('console').innerText = "Loading Python WASM Engine...";
        pyodide = await loadPyodide();
        document.getElementById('console').innerText = "Python Ready.\n";
    }
}

// 4. Run & Deploy Functions
async function runCode() {
    const terminal = document.getElementById('console');
    const code = editor.getValue();
    terminal.innerText = `[Running ${currentLang}]...\n`;

    if (currentLang === 'python') {
        try {
            await pyodide.runPythonAsync(`import sys, io\nsys.stdout = io.StringIO()`);
            await pyodide.runPythonAsync(code);
            terminal.innerText = pyodide.runPython("sys.stdout.getvalue()");
        } catch (e) { terminal.innerText = "Error: " + e; }
    } else if (currentLang === 'javascript') {
        try {
            eval(code); 
            terminal.innerText += "\n(Check Browser Console for detailed logs)";
        } catch (e) { terminal.innerText = "JS Error: " + e; }
    } else {
        terminal.innerText = "Compiled languages (C++/Java) require WASM backend connection.";
    }
}

function deployToGithub() {
    const user = USW_CONFIG.GITHUB.USER;
    const repo = USW_CONFIG.GITHUB.REPO;
    window.open(`https://github.com/new?template_name=${repo}&template_owner=${user}`, '_blank');
}
