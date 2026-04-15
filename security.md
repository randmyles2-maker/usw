# USW Network Security Protocol

### 1. Client-Side Execution
All code executed within the USW Network is processed via **WebAssembly (WASM)** using Pyodide. This means the code runs in your browser's sandbox, not on a central server. 

### 2. No Data Persistence
USW Network does not have a database that stores your source code. Once you refresh the page, the memory is cleared unless you have deployed to your own GitHub repository.

### 3. Isolation
We use `.nojekyll` to prevent GitHub from executing server-side scripts, ensuring only static, safe assets are served.

### 4. User Responsibility
Users are responsible for the code they deploy to their own GitHub accounts. USW Network provides the interface; GitHub provides the secure hosting environment.
