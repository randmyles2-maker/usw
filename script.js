// Initialize Python (Pyodide)
async function main() {
    let pyodide = await loadPyodide();
    document.getElementById("output").innerText = "Python Ready!";
    return pyodide;
}

let pyodideReadyPromise = main();

async function runCode() {
    let pyodide = await pyodideReadyPromise;
    const code = document.getElementById("code-editor").value;
    const outputElement = document.getElementById("output");
    
    outputElement.innerText = "Running...";
    
    try {
        // Redirects Python's 'print' to our output div
        pyodide.runPython(`
            import sys
            import io
            sys.stdout = io.StringIO()
        `);
        
        await pyodide.runPythonAsync(code);
        
        let stdout = pyodide.runPython("sys.stdout.getvalue()");
        outputElement.innerText = stdout || "Code executed successfully (no output).";
    } catch (err) {
        outputElement.innerText = "Error: " + err;
    }
}

function deployProject() {
    // This sends the user to GitHub to create their own copy of your project
    const githubUser = "YOUR_GITHUB_USERNAME";
    const repoTemplate = "YOUR_REPO_NAME";
    window.open(`https://github.com/new?template_name=${repoTemplate}&template_owner=${githubUser}`, '_blank');
}
