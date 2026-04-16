let editor;
let pyodide;

// Load Monaco
require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs' }});
require(['vs/editor/editor.main'], function() {
    editor = monaco.editor.create(document.getElementById('editor-root'), {
        theme: 'vs-dark',
        automaticLayout: true
    });
});

function openModule(lang) {
    // UI Swapping
    document.getElementById('dashboard').style.display = 'none';
    document.getElementById('main-container').style.display = 'flex';
    document.getElementById('editor-nav').style.display = 'flex';
    
    // Set Language Template
    const model = editor.getModel();
    monaco.editor.setModelLanguage(model, lang);
    
    if (lang === 'python') {
        editor.setValue("import sys\nprint('Python Module Initialized')\nprint(sys.version)");
        initPython(); // Only load Python engine if needed
    } else if (lang === 'javascript') {
        editor.setValue("console.log('JS Module Initialized');");
    }
}

function showDashboard() {
    document.getElementById('dashboard').style.display = 'block';
    document.getElementById('main-container').style.display = 'none';
    document.getElementById('editor-nav').style.display = 'none';
}

async function initPython() {
    if (pyodide) return; // Don't reload if already there
    const status = document.getElementById('engine-status');
    try {
        pyodide = await loadPyodide();
        status.innerText = "Python Kernel Ready";
    } catch (e) {
        status.innerText = "Kernel Error";
    }
}

// ... Keep your runCode() and deployToGithub() functions from before ...
