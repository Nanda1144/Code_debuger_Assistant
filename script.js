document.addEventListener('DOMContentLoaded', function() {
    // Initialize CodeMirror editors
    const inputEditor = CodeMirror.fromTextArea(document.getElementById('input-code'), {
        lineNumbers: true,
        mode: 'javascript',
        theme: 'monokai',
        autoCloseBrackets: true,
        matchBrackets: true,
        indentUnit: 4,
        tabSize: 4,
        lineWrapping: true,
        foldGutter: true,
        gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter", "CodeMirror-lint-markers"],
        lint: true
    });

    const outputEditor = CodeMirror.fromTextArea(document.getElementById('output-code'), {
        lineNumbers: true,
        mode: 'javascript',
        theme: 'monokai',
        readOnly: true,
        lineWrapping: true,
        foldGutter: true,
        gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"]
    });

    // Language selector
    const languageSelector = document.getElementById('language');
    languageSelector.addEventListener('change', function() {
        const language = this.value;
        let mode = 'javascript';
        
        switch(language) {
            case 'python':
                mode = 'python';
                break;
            case 'java':
            case 'cpp':
            case 'csharp':
            case 'c':
                mode = 'text/x-java';
                break;
            case 'php':
                mode = 'php';
                break;
            case 'ruby':
                mode = 'ruby';
                break;
            case 'go':
                mode = 'go';
                break;
            case 'rust':
                mode = 'rust';
                break;
            case 'swift':
                mode = 'swift';
                break;
            case 'kotlin':
                mode = 'text/x-kotlin';
                break;
            default:
                mode = 'javascript';
        }
        
        inputEditor.setOption('mode', mode);
        outputEditor.setOption('mode', mode);
    });

    // Settings toggles
    const autoDebugToggle = document.getElementById('auto-debug-toggle');
    const lineNumbersToggle = document.getElementById('line-numbers-toggle');
    const codeFoldingToggle = document.getElementById('code-folding-toggle');
    const autoFormatToggle = document.getElementById('auto-format-toggle');

    autoDebugToggle.addEventListener('click', function() {
        this.classList.toggle('active');
    });

    lineNumbersToggle.addEventListener('click', function() {
        this.classList.toggle('active');
        const isActive = this.classList.contains('active');
        inputEditor.setOption('lineNumbers', isActive);
        outputEditor.setOption('lineNumbers', isActive);
    });

    codeFoldingToggle.addEventListener('click', function() {
        this.classList.toggle('active');
        const isActive = this.classList.contains('active');
        inputEditor.setOption('foldGutter', isActive);
        outputEditor.setOption('foldGutter', isActive);
    });

    autoFormatToggle.addEventListener('click', function() {
        this.classList.toggle('active');
    });

    // Debug button
    const debugButton = document.getElementById('debug-button');
    debugButton.addEventListener('click', function() {
        const code = inputEditor.getValue();
        const language = languageSelector.value;
        
        if (!code.trim()) {
            showNotification('Please enter some code to debug', 'warning');
            return;
        }
        
        debugCode(code, language);
    });

    // Format button
    const formatButton = document.getElementById('format-button');
    formatButton.addEventListener('click', function() {
        const code = inputEditor.getValue();
        const language = languageSelector.value;
        
        if (!code.trim()) {
            showNotification('Please enter some code to format', 'warning');
            return;
        }
        
        const formattedCode = formatCode(code, language);
        outputEditor.setValue(formattedCode);
        
        // Update results
        const resultsContainer = document.getElementById('results-container');
        resultsContainer.innerHTML = `
            <div class="result-card">
                <div class="result-header">
                    <span class="result-type success">Success</span>
                </div>
                <div class="result-body">
                    <div class="result-message">
                        Code has been formatted according to ${language} style guidelines.
                    </div>
                </div>
            </div>
        `;
        
        showNotification('Code formatted successfully', 'success');
    });

    // Optimize button
    const optimizeButton = document.getElementById('optimize-button');
    optimizeButton.addEventListener('click', function() {
        const code = inputEditor.getValue();
        const language = languageSelector.value;
        
        if (!code.trim()) {
            showNotification('Please enter some code to optimize', 'warning');
            return;
        }
        
        optimizeCode(code, language);
    });

    // Clear button
    const clearButton = document.getElementById('clear-button');
    clearButton.addEventListener('click', function() {
        inputEditor.setValue('');
        outputEditor.setValue('');
        document.getElementById('results-container').innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🐞</div>
                <p>Enter your code and click "Debug Code" to analyze for errors and warnings.</p>
            </div>
        `;
        
        // Reset stats
        document.getElementById('error-count').textContent = '0';
        document.getElementById('warning-count').textContent = '0';
        document.getElementById('success-count').textContent = '0';
    });

    // Copy input button
    document.getElementById('copy-input').addEventListener('click', function() {
        const code = inputEditor.getValue();
        if (!code.trim()) {
            showNotification('No code to copy', 'warning');
            return;
        }
        
        navigator.clipboard.writeText(code).then(() => {
            showNotification('Input code copied to clipboard', 'success');
        });
    });

    // Paste input button
    document.getElementById('paste-input').addEventListener('click', function() {
        navigator.clipboard.readText().then(text => {
            inputEditor.setValue(text);
            showNotification('Code pasted from clipboard', 'success');
        }).catch(err => {
            showNotification('Failed to paste from clipboard', 'error');
        });
    });

    // Copy output button
    document.getElementById('copy-output').addEventListener('click', function() {
        const code = outputEditor.getValue();
        if (!code.trim()) {
            showNotification('No code to copy', 'warning');
            return;
        }
        
        navigator.clipboard.writeText(code).then(() => {
            showNotification('Output code copied to clipboard', 'success');
        });
    });

    // Apply fix button
    document.getElementById('apply-fix').addEventListener('click', function() {
        const code = outputEditor.getValue();
        if (!code.trim()) {
            showNotification('No fixed code to apply', 'warning');
            return;
        }
        
        inputEditor.setValue(code);
        showNotification('Fixed code applied to input', 'success');
    });

    // Filter buttons
    const filterButtons = document.querySelectorAll('.filter-button');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Update active state
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Filter results
            const filter = this.getAttribute('data-filter');
            filterResults(filter);
        });
    });

    // Example buttons
    const exampleButtons = document.querySelectorAll('.example-button');
    exampleButtons.forEach(button => {
        button.addEventListener('click', function() {
            const example = this.getAttribute('data-example');
            loadExample(example);
        });
    });

    // Auto debug on input change
    let debugTimeout;
    inputEditor.on('change', function() {
        if (autoDebugToggle.classList.contains('active')) {
            clearTimeout(debugTimeout);
            debugTimeout = setTimeout(() => {
                const code = inputEditor.getValue();
                const language = languageSelector.value;
                
                if (code.trim()) {
                    debugCode(code, language);
                }
            }, 1000);
        }
    });

    // Function to debug code
    function debugCode(code, language) {
        // Show loading state
        const resultsContainer = document.getElementById('results-container');
        resultsContainer.innerHTML = `
            <div class="loading">
                <div class="spinner"></div>
            </div>
        `;

        // Simulate processing delay
        setTimeout(() => {
            try {
                // This is where we would normally call a backend service
                // For this demo, we'll use a simulated response
                const results = analyzeCode(code, language);
                
                // Display results
                displayResults(results);
                
                // Update stats
                document.getElementById('error-count').textContent = results.stats.errors;
                document.getElementById('warning-count').textContent = results.stats.warnings;
                document.getElementById('success-count').textContent = results.stats.optimizations;
                
                // Update output editor with fixed code
                if (results.fixedCode) {
                    outputEditor.setValue(results.fixedCode);
                }
            } catch (error) {
                console.error('Error debugging code:', error);
                resultsContainer.innerHTML = `
                    <div class="result-card">
                        <div class="result-header">
                            <span class="result-type error">Error</span>
                        </div>
                        <div class="result-body">
                            <div class="result-message">
                                An error occurred while analyzing your code. Please try again.
                            </div>
                        </div>
                    </div>
                `;
            }
        }, 1500);
    }

    // Function to format code
    function formatCode(code, language) {
        // This is a simplified code formatter for demonstration purposes
        // In a real implementation, this would use proper parsing and formatting rules
        
        let formattedCode = code;
        
        // Basic formatting for all languages
        // Remove extra whitespace
        formattedCode = formattedCode.replace(/\s+/g, ' ');
        
        // Add proper line breaks after semicolons and braces
        formattedCode = formattedCode.replace(/;\s*/g, ';\n');
        formattedCode = formattedCode.replace(/\{\s*/g, ' {\n');
        formattedCode = formattedCode.replace(/\s*\}/g, '\n}');
        
        // Language-specific formatting
        if (language === 'javascript') {
            // Format JavaScript code
            formattedCode = formattedCode.replace(/function\s+(\w+)\s*\(([^)]*)\)\s*\{/g, 'function $1($2) {');
            formattedCode = formattedCode.replace(/(if|for|while|switch)\s*\(([^)]*)\)\s*\{/g, '$1 ($2) {');
        } else if (language === 'python') {
            // Format Python code
            const lines = formattedCode.split('\n');
            let indentLevel = 0;
            const formattedLines = [];
            
            for (const line of lines) {
                const trimmedLine = line.trim();
                if (!trimmedLine) continue;
                
                // Decrease indent after certain keywords
                if (trimmedLine.startsWith('return ') || 
                    trimmedLine.startsWith('break') || 
                    trimmedLine.startsWith('continue') ||
                    trimmedLine.startsWith('pass')) {
                    indentLevel = Math.max(0, indentLevel - 1);
                }
                
                // Add proper indentation
                formattedLines.push('    '.repeat(indentLevel) + trimmedLine);
                
                // Increase indent after certain keywords
                if (trimmedLine.endsWith(':')) {
                    indentLevel++;
                }
            }
            
            formattedCode = formattedLines.join('\n');
        } else if (language === 'java' || language === 'cpp' || language === 'c') {
            // Format C-like languages
            formattedCode = formattedCode.replace(/(public|private|protected)\s+(static\s+)?(class|interface|enum)\s+(\w+)\s*\{/g, '$1 $2$3 $4 {');
            formattedCode = formattedCode.replace(/(public|private|protected)\s+(static\s+)?(\w+)\s+(\w+)\s*\(([^)]*)\)\s*\{/g, '$1 $2$3 $4($5) {');
        }
        
        return formattedCode;
    }

    // Function to optimize code
    function optimizeCode(code, language) {
        // Show loading state
        const resultsContainer = document.getElementById('results-container');
        resultsContainer.innerHTML = `
            <div class="loading">
                <div class="spinner"></div>
            </div>
        `;

        // Simulate processing delay
        setTimeout(() => {
            try {
                // This is where we would normally call a backend service
                // For this demo, we'll use a simulated response
                const results = optimizeCodeAnalysis(code, language);
                
                // Display results
                displayResults(results);
                
                // Update stats
                document.getElementById('error-count').textContent = results.stats.errors;
                document.getElementById('warning-count').textContent = results.stats.warnings;
                document.getElementById('success-count').textContent = results.stats.optimizations;
                
                // Update output editor with optimized code
                if (results.optimizedCode) {
                    outputEditor.setValue(results.optimizedCode);
                }
            } catch (error) {
                console.error('Error optimizing code:', error);
                resultsContainer.innerHTML = `
                    <div class="result-card">
                        <div class="result-header">
                            <span class="result-type error">Error</span>
                        </div>
                        <div class="result-body">
                            <div class="result-message">
                                An error occurred while optimizing your code. Please try again.
                            </div>
                        </div>
                    </div>
                `;
            }
        }, 1500);
    }

    // Function to analyze code (simulated)
    function analyzeCode(code, language) {
        // This is a more advanced code analysis for demonstration purposes
        // In a real implementation, this would use proper parsing and NLP techniques
        
        const issues = [];
        let fixedCode = code;
        let stats = {
            errors: 0,
            warnings: 0,
            optimizations: 0
        };
        
        // Advanced syntax errors for different languages
        if (language === 'javascript') {
            // Check for missing semicolons with more accuracy
            const semicolonRegex = /([^;\s])\n(?!\s*[\{\}\/])/g;
            if (semicolonRegex.test(code)) {
                issues.push({
                    type: 'warning',
                    message: 'Missing semicolons detected. JavaScript statements should end with semicolons.',
                    fix: 'Add semicolons at the end of statements.',
                    line: findLineNumber(code, semicolonRegex),
                    severity: 'medium'
                });
                stats.warnings++;
                
                fixedCode = code.replace(semicolonRegex, '$1;\n');
            }
            
            // Check for undefined variables with more context
            const undefinedVarRegex = /(?:var|let|const)\s+(\w+)(?!\s*=)/g;
            let match;
            while ((match = undefinedVarRegex.exec(code)) !== null) {
                // Check if the variable is used later in the code
                const varUsageRegex = new RegExp(`\\b${match[1]}\\s*=`);
                if (!varUsageRegex.test(code.substring(match.index))) {
                    issues.push({
                        type: 'error',
                        message: `Variable '${match[1]}' is declared but not initialized.`,
                        fix: `Initialize the variable with a value: var ${match[1]} = value;`,
                        line: findLineNumber(code, new RegExp(`(?:var|let|const)\\s+${match[1]}(?!\s*=)`)),
                        severity: 'high'
                    });
                    stats.errors++;
                }
            }
            
            // Check for missing closing braces with better accuracy
            const openBraces = (code.match(/\{/g) || []).length;
            const closeBraces = (code.match(/\}/g) || []).length;
            if (openBraces !== closeBraces) {
                const diff = openBraces - closeBraces;
                issues.push({
                    type: 'error',
                    message: `Mismatched braces detected. There are ${diff > 0 ? diff : -diff} too many ${diff > 0 ? 'opening' : 'closing'} braces.`,
                    fix: diff > 0 ? `Add ${diff} closing brace(s) at the appropriate locations.` : `Remove ${-diff} extra closing brace(s).`,
                    line: findLineNumber(code, /\{|\}/g),
                    severity: 'high'
                });
                stats.errors++;
            }
            
            // Check for unused variables with more accuracy
            const varDeclarations = code.match(/\b(?:var|let|const)\s+(\w+)\s*[=;]/g);
            if (varDeclarations) {
                for (const declaration of varDeclarations) {
                    const varName = declaration.match(/\b(?:var|let|const)\s+(\w+)\s*[=;]/)[1];
                    
                    // Skip special variables that might be used externally
                    if (varName === '_' || varName.startsWith('$')) continue;
                    
                    // Count usages (excluding the declaration)
                    const varUsageRegex = new RegExp(`\\b${varName}\\b(?!\\s*[=;:])`, 'g');
                    const usages = (code.match(varUsageRegex) || []).length;
                    
                    if (usages === 0) {
                        issues.push({
                            type: 'warning',
                            message: `Variable '${varName}' is declared but never used.`,
                            fix: 'Remove the unused variable declaration.',
                            line: findLineNumber(code, new RegExp(`\\b(?:var|let|const)\\s+${varName}\\s*[=;]`)),
                            severity: 'low'
                        });
                        stats.warnings++;
                    }
                }
            }
            
            // Check for potential memory leaks
            const setIntervalRegex = /setInterval\([^,]+,\s*\d+\s*\)/g;
            while ((match = setIntervalRegex.exec(code)) !== null) {
                // Check if there's a corresponding clearInterval
                const clearIntervalRegex = /clearInterval\([^)]+\)/g;
                if (!clearIntervalRegex.test(code)) {
                    issues.push({
                        type: 'warning',
                        message: 'Potential memory leak detected. setInterval is used without a corresponding clearInterval.',
                        fix: 'Store the interval ID and clear it when no longer needed: const intervalId = setInterval(...); clearInterval(intervalId);',
                        line: findLineNumber(code, new RegExp(`setInterval\\([^,]+,\\s*\\d+\\s*\\)`)),
                        severity: 'medium'
                    });
                    stats.warnings++;
                }
            }
            
            // Check for use of deprecated features
            const deprecatedFeatures = [
                { regex: /\bnew\s+Date\(\s*\)/, message: 'Using new Date() without arguments can be ambiguous.', fix: 'Use new Date(Date.now()) for clarity.' },
                { regex: /\bescape\(/, message: 'escape() is deprecated.', fix: 'Use encodeURIComponent() instead.' },
                { regex: /\bunescape\(/, message: 'unescape() is deprecated.', fix: 'Use decodeURIComponent() instead.' }
            ];
            
            for (const feature of deprecatedFeatures) {
                if (feature.regex.test(code)) {
                    issues.push({
                        type: 'warning',
                        message: feature.message,
                        fix: feature.fix,
                        line: findLineNumber(code, feature.regex),
                        severity: 'low'
                    });
                    stats.warnings++;
                }
            }
        } else if (language === 'python') {
            // Check for indentation issues with more accuracy
            const lines = code.split('\n');
            let prevIndent = 0;
            let inBlock = false;
            let blockStack = [];
            
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                if (line.trim() === '') continue;
                
                const indent = line.search(/\S/);
                
                // Check for inconsistent indentation (mixing spaces and tabs)
                if (line.includes('\t') && line.includes(' ')) {
                    issues.push({
                        type: 'error',
                        message: 'Inconsistent indentation detected. Mixing spaces and tabs is not recommended in Python.',
                        fix: 'Use either spaces or tabs consistently for indentation.',
                        line: i + 1,
                        severity: 'high'
                    });
                    stats.errors++;
                }
                
                if (line.trim().endsWith(':')) {
                    // This line starts a new block
                    blockStack.push(indent);
                    inBlock = true;
                    prevIndent = indent;
                } else if (inBlock && blockStack.length > 0) {
                    const expectedIndent = blockStack[blockStack.length - 1] + 4; // Python standard is 4 spaces
                    
                    if (indent !== expectedIndent && indent <= prevIndent) {
                        // Check if this is a dedent (end of block)
                        if (blockStack.includes(indent)) {
                            // Pop blocks until we reach this indent level
                            while (blockStack.length > 0 && blockStack[blockStack.length - 1] >= indent) {
                                blockStack.pop();
                            }
                        } else {
                            // This line should be indented more than the previous line
                            issues.push({
                                type: 'error',
                                message: 'Incorrect indentation detected. Python uses indentation to define code blocks.',
                                fix: `Add proper indentation to this line. Expected ${expectedIndent} spaces, found ${indent}.`,
                                line: i + 1,
                                severity: 'high'
                            });
                            stats.errors++;
                        }
                    }
                }
            }
            
            // Check for missing colons with more accuracy
            const colonRegex = /(if|for|while|def|class|else|elif|try|except|finally|with|async\s+def|async\s+with)\s+([^\n:]+)(?<!:)$/gm;
            while ((match = colonRegex.exec(code)) !== null) {
                issues.push({
                    type: 'error',
                    message: `Missing colon after '${match[1]}' statement.`,
                    fix: `Add a colon at the end of the line: ${match[1]} ${match[2]}:`,
                    line: findLineNumber(code, new RegExp(`(${match[1]}\\s+${match[2].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})(?<!:)$`)),
                    severity: 'high'
                });
                stats.errors++;
                
                fixedCode = fixedCode.replace(new RegExp(`(${match[1]}\\s+${match[2].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})(?<!:)$`, 'gm'), `$1:`);
            }
            
            // Check for Python-specific issues
            // Check for use of mutable default arguments
            const mutableDefaultRegex = /def\s+\w+\s*\([^)]*=\s*(\[\]|\{\}|\(\)|set\(\))[^)]*\)/g;
            while ((match = mutableDefaultRegex.exec(code)) !== null) {
                issues.push({
                    type: 'warning',
                    message: `Mutable default argument detected. Using ${match[1]} as a default argument can lead to unexpected behavior.`,
                    fix: 'Use None as the default and check for it inside the function: def my_func(arg=None): if arg is None: arg = []',
                    line: findLineNumber(code, new RegExp(`def\\s+\\w+\\s*\\([^)]*=\\s*${match[1].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^)]*\\)`)),
                    severity: 'medium'
                });
                stats.warnings++;
            }
            
            // Check for use of '==' for comparing with None
            const noneCompareRegex = /\w+\s*==\s*None/g;
            while ((match = noneCompareRegex.exec(code)) !== null) {
                issues.push({
                    type: 'warning',
                    message: "Using '==' to compare with None is not idiomatic in Python.",
                    fix: "Use 'is' instead: if variable is None:",
                    line: findLineNumber(code, new RegExp(`\\w+\\s*==\\s*None`)),
                    severity: 'low'
                });
                stats.warnings++;
            }
        } else if (language === 'java' || language === 'cpp' || language === 'c') {
            // Check for missing semicolons with more accuracy
            const semicolonRegex = /([^;\s])\n(?!\s*[\{\}\/])/g;
            if (semicolonRegex.test(code)) {
                issues.push({
                    type: 'error',
                    message: 'Missing semicolons detected. Statements in C-like languages must end with semicolons.',
                    fix: 'Add semicolons at the end of statements.',
                    line: findLineNumber(code, semicolonRegex),
                    severity: 'high'
                });
                stats.errors++;
                
                fixedCode = code.replace(semicolonRegex, '$1;\n');
            }
            
            // Check for missing type declarations with more accuracy
            const varRegex = /\b(var|let|const)\s+(\w+)\s*=/g;
            while ((match = varRegex.exec(code)) !== null) {
                // Skip if this is inside a comment or string
                const lineStart = code.lastIndexOf('\n', match.index) + 1;
                const lineEnd = code.indexOf('\n', match.index);
                const line = lineEnd === -1 ? code.substring(lineStart) : code.substring(lineStart, lineEnd);
                
                if (line.trim().startsWith('//') || line.trim().startsWith('/*') || line.trim().startsWith('*')) {
                    continue;
                }
                
                issues.push({
                    type: 'error',
                    message: `Invalid variable declaration '${match[1]}' used in ${language}.`,
                    fix: `Use proper type declaration: int ${match[2]} = value;`,
                    line: findLineNumber(code, new RegExp(`\\b${match[1]}\\s+${match[2]}\\s*=`)),
                    severity: 'high'
                });
                stats.errors++;
            }
            
            // Check for potential null pointer dereferences
            const nullPointerRegex = /\b(\w+)\s*->\s*(\w+)\b/g;
            while ((match = nullPointerRegex.exec(code)) !== null) {
                // Check if the pointer might be null
                const varName = match[1];
                const nullCheckRegex = new RegExp(`if\\s*\\(\\s*${varName}\\s*==\\s*(NULL|null|0)\\s*\\)|if\\s*\\(\\s*${varName}\\s*!=\\s*(NULL|null|0)\\s*\\)`);
                
                if (!nullCheckRegex.test(code)) {
                    issues.push({
                        type: 'warning',
                        message: `Possible null pointer dereference when accessing '${varName}->${match[2]}'.`,
                        fix: `Add a null check before accessing the member: if (${varName} != NULL) { ... }`,
                        line: findLineNumber(code, new RegExp(`\\b${varName}\\s*->\\s*${match[2]}`)),
                        severity: 'high'
                    });
                    stats.warnings++;
                }
            }
            
            // Check for memory leaks in C/C++
            if (language === 'c' || language === 'cpp') {
                const mallocRegex = /\b(\w+)\s*=\s*(?:malloc|calloc|realloc)\s*\([^)]+\)/g;
                while ((match = mallocRegex.exec(code)) !== null) {
                    const varName = match[1];
                    const freeRegex = new RegExp(`free\\s*\\(\\s*${varName}\\s*\\)`);
                    
                    if (!freeRegex.test(code)) {
                        issues.push({
                            type: 'warning',
                            message: `Possible memory leak. Memory allocated for '${varName}' is not freed.`,
                            fix: `Add a corresponding free() call when the memory is no longer needed: free(${varName});`,
                            line: findLineNumber(code, new RegExp(`\\b${varName}\\s*=\\s*(?:malloc|calloc|realloc)\\s*\\([^)]+\\)`)),
                            severity: 'medium'
                        });
                        stats.warnings++;
                    }
                }
            }
        }
        
        // Check for common logical issues across languages with more accuracy
        // Check for unused imports/includes
        if (language === 'javascript') {
            const importRegex = /import\s+.*\s+from\s+['"]([^'"]+)['"]/g;
            const requireRegex = /(?:const|let|var)\s+(\w+)\s*=\s*require\(['"]([^'"]+)['"]\)/g;
            
            const allImports = [];
            let match;
            
            while ((match = importRegex.exec(code)) !== null) {
                allImports.push({
                    type: 'import',
                    name: match[1],
                    index: match.index
                });
            }
            
            while ((match = requireRegex.exec(code)) !== null) {
                allImports.push({
                    type: 'require',
                    name: match[2],
                    varName: match[1],
                    index: match.index
                });
            }
            
            // Check if each import is used
            for (const imp of allImports) {
                let isUsed = false;
                
                if (imp.type === 'import') {
                    // Extract imported names
                    const importMatch = code.substring(imp.index).match(/import\s+(?:(\w+)(?:\s+as\s+(\w+))?,?\s*)*\s+from/);
                    if (importMatch) {
                        for (let i = 1; i < importMatch.length; i += 2) {
                            if (importMatch[i]) {
                                const varName = importMatch[i + 1] || importMatch[i];
                                const usageRegex = new RegExp(`\\b${varName}\\b`);
                                if (usageRegex.test(code.substring(imp.index + importMatch[0].length))) {
                                    isUsed = true;
                                    break;
                                }
                            }
                        }
                    }
                } else if (imp.type === 'require' && imp.varName) {
                    const usageRegex = new RegExp(`\\b${imp.varName}\\b`);
                    isUsed = usageRegex.test(code.substring(imp.index + imp.varName.length));
                }
                
                if (!isUsed) {
                    issues.push({
                        type: 'warning',
                        message: `Unused ${imp.type === 'import' ? 'import' : 'require'}: '${imp.name}'.`,
                        fix: `Remove the unused ${imp.type === 'import' ? 'import' : 'require'} statement.`,
                        line: findLineNumber(code, new RegExp(imp.type === 'import' ? 
                            `import\\s+.*\\s+from\\s+['"]${imp.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]` : 
                            `(?:const|let|var)\\s+${imp.varName}\\s*=\\s*require\\(['"]${imp.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]\\)`)),
                        severity: 'low'
                    });
                    stats.warnings++;
                }
            }
        } else if (language === 'python') {
            const importRegex = /^(?:from\s+(\S+)\s+)?import\s+([^\n#]+)/gm;
            const allImports = [];
            let match;
            
            while ((match = importRegex.exec(code)) !== null) {
                const module = match[1] || '';
                const imports = match[2].split(',').map(imp => imp.trim());
                
                for (const imp of imports) {
                    allImports.push({
                        module: module,
                        name: imp,
                        index: match.index
                    });
                }
            }
            
            
            // Check if each import is used
            for (const imp of allImports) {
                let isUsed = false;
                
                // Check for direct usage
                const usageRegex = new RegExp(`\\b${imp.name}\\b`);
                if (usageRegex.test(code.substring(imp.index + imp.name.length))) {
                    isUsed = true;
                }
                
                // Check for module usage if it's a module import
                if (!isUsed && imp.module && imp.name === '*') {
                    // Check for any usage of the module
                    const moduleUsageRegex = new RegExp(`\\b${imp.module}\\.\\w+`);
                    isUsed = moduleUsageRegex.test(code.substring(imp.index));
                }
                
                if (!isUsed) {
                    issues.push({
                        type: 'warning',
                        message: `Unused import: '${imp.module ? imp.module + '.' + imp.name : imp.name}'.`,
                        fix: `Remove the unused import statement.`,
                        line: findLineNumber(code, new RegExp(imp.module ? 
                            `from\\s+${imp.module.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s+import\\s+${imp.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}` : 
                            `import\\s+${imp.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`)),
                        severity: 'low'
                    });
                    stats.warnings++;
                }
            }
        } else if (language === 'java' || language === 'cpp' || language === 'c') {
            const includeRegex = /^#include\s+[<"]([^>"]+)[>"]/gm;
            const allIncludes = [];
            let match;
            
            while ((match = includeRegex.exec(code)) !== null) {
                allIncludes.push({
                    name: match[1],
                    index: match.index
                });
            }
            
            // Check if each include is used
            for (const inc of allIncludes) {
                let isUsed = false;
                
                // Check for common library usage patterns
                if (inc.name === 'iostream' && /cout|cin|endl/.test(code)) {
                    isUsed = true;
                } else if (inc.name === 'vector' && /\bvector\b/.test(code)) {
                    isUsed = true;
                } else if (inc.name === 'string' && /\bstring\b/.test(code)) {
                    isUsed = true;
                } else if (inc.name === 'algorithm' && /\bsort\b|\bfind\b|\bcopy\b/.test(code)) {
                    isUsed = true;
                }
                
                if (!isUsed) {
                    issues.push({
                        type: 'warning',
                        message: `Unused include: '${inc.name}'.`,
                        fix: `Remove the unused #include directive.`,
                        line: findLineNumber(code, new RegExp(`#include\\s+[<"]${inc.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[">]`)),
                        severity: 'low'
                    });
                    stats.warnings++;
                }
            }
        }
        
        // Check for possible infinite loops with more accuracy
        const loopRegex = /\b(for|while)\s*\([^)]+\)\s*\{/g;
        while ((match = loopRegex.exec(code)) !== null) {
            const loopBody = code.substring(match.index);
            const loopBodyEnd = findMatchingBrace(loopBody);
            const bodyContent = loopBody.substring(loopBody.indexOf('{') + 1, loopBodyEnd);
            
            // Check if the loop has a condition that might always be true
            if (match[1] === 'while') {
                const conditionMatch = loopBody.match(/while\s*\(([^)]+)\)/);
                if (conditionMatch) {
                    const condition = conditionMatch[1].trim();
                    
                    // Check for common infinite loop patterns
                    if (condition === 'true' || condition === '1' || condition === '!0') {
                        // Check if there's a break statement
                        if (!bodyContent.includes('break')) {
                            issues.push({
                                type: 'warning',
                                message: 'Possible infinite loop detected. The while loop condition is always true.',
                                fix: 'Add a condition to exit the loop or include a break statement.',
                                line: findLineNumber(code, new RegExp(`\\b${match[1]}\\s*\\([^)]+\\)`)),
                                severity: 'medium'
                            });
                            stats.warnings++;
                        }
                    }
                }
            } else if (match[1] === 'for') {
                const conditionMatch = loopBody.match(/for\s*\(([^;]+);\s*([^;]+);\s*([^)]+)\)/);
                if (conditionMatch) {
                    const init = conditionMatch[1].trim();
                    const condition = conditionMatch[2].trim();
                    const increment = conditionMatch[3].trim();
                    
                    // Check for empty condition (infinite loop)
                    if (condition === '') {
                        // Check if there's a break statement
                        if (!bodyContent.includes('break')) {
                            issues.push({
                                type: 'warning',
                                message: 'Possible infinite loop detected. The for loop has no condition.',
                                fix: 'Add a condition to exit the loop or include a break statement.',
                                line: findLineNumber(code, new RegExp(`\\b${match[1]}\\s*\\([^)]+\\)`)),
                                severity: 'medium'
                            });
                            stats.warnings++;
                        }
                    }
                }
            }
        }
        
        // Check for possible null pointer exceptions with more accuracy
        if (language === 'java' || language === 'javascript') {
            const nullPointerRegex = /\b(\w+)\s*\.\s*(\w+)\s*(?!\s*[\?\[])/g;
            while ((match = nullPointerRegex.exec(code)) !== null) {
                // Check if the variable might be null
                const varName = match[1];
                
                // Look for variable declaration
                const varDeclaration = new RegExp(`\\b(?:var|let|const|\\w+)\\s+${varName}\\s*[=;]`);
                
                // Look for null check
                const nullCheckRegex = new RegExp(`if\\s*\\(\\s*${varName}\\s*(?:==|!=)\\s*(?:null|undefined)\\s*\\)|if\\s*\\(\\s*!(?:${varName})\\s*\\)`);
                
                if (!varDeclaration.test(code) && !nullCheckRegex.test(code)) {
                    issues.push({
                        type: 'warning',
                        message: `Possible null pointer exception when accessing '${varName}.${match[2]}'.`,
                        fix: 'Add a null check before accessing the property: if (' + varName + ' !== null) { ... }',
                        line: findLineNumber(code, new RegExp(`\\b${varName}\\s*\\.\\s*${match[2]}`)),
                        severity: 'medium'
                    });
                    stats.warnings++;
                }
            }
        }
        
        // Check for code optimization opportunities
        // Check for string concatenation in loops
        if (language === 'javascript' || language === 'java') {
            const loopConcatRegex = /(?:for|while)\s*\([^)]+\)\s*\{[^}]*\+\s*=\s*[^}]+\}/g;
            while ((match = loopConcatRegex.exec(code)) !== null) {
                issues.push({
                    type: 'info',
                    message: 'String concatenation inside a loop can be inefficient.',
                    fix: language === 'javascript' ? 
                        'Use array.push() and array.join() or template literals for better performance.' :
                        'Use StringBuilder for better performance.',
                    line: findLineNumber(code, new RegExp(`(?:for|while)\\s*\\([^)]+\\)`)),
                    severity: 'low'
                });
                stats.optimizations++;
            }
        }
        
        // Check for redundant conditions
        const redundantConditionRegex = /if\s*\(([^)]+)\)\s*\{\s*return\s+([^;]+);\s*\}\s*return\s+\2\s*;/g;
        while ((match = redundantConditionRegex.exec(code)) !== null) {
            issues.push({
                type: 'info',
                message: 'Redundant condition detected. The function returns the same value in both branches.',
                fix: 'Simplify by returning the value directly without the condition.',
                line: findLineNumber(code, new RegExp(`if\\s*\\(${match[1].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\)`)),
                severity: 'low'
            });
            stats.optimizations++;
        }
        
        // Check for unused function parameters
        const functionRegex = language === 'python' ? 
            /def\s+(\w+)\s*\(([^)]*)\):/g : 
            /(?:function\s+(\w+)\s*\(|(\w+)\s*\([^)]*\)\s*\{)/g;
        
        while ((match = functionRegex.exec(code)) !== null) {
            const functionName = match[1] || match[2];
            let params;
            
            if (language === 'python') {
                params = match[2].split(',').map(p => p.trim().split('=')[0].trim());
            } else {
                const functionStart = code.indexOf('{', match.index);
                const functionEnd = findMatchingBrace(code.substring(functionStart)) + functionStart;
                const functionBody = code.substring(functionStart + 1, functionEnd);
                
                // Extract parameters from function signature
                const signatureMatch = code.substring(match.index).match(/\(([^)]*)\)/);
                if (signatureMatch) {
                    params = signatureMatch[1].split(',').map(p => p.trim());
                }
            }
            
            if (params) {
                for (const param of params) {
                    if (!param) continue;
                    
                    // Skip 'this' parameter in class methods
                    if (param === 'this') continue;
                    
                    // Check if parameter is used
                    const paramUsageRegex = new RegExp(`\\b${param}\\b`);
                    const functionStart = language === 'python' ? 
                        code.indexOf(':', match.index) + 1 : 
                        code.indexOf('{', match.index) + 1;
                    
                    const functionEnd = language === 'python' ? 
                        findFunctionEnd(code, functionStart) : 
                        findMatchingBrace(code.substring(functionStart - 1)) + functionStart;
                    
                    const functionBody = code.substring(functionStart, functionEnd);
                    
                    if (!paramUsageRegex.test(functionBody)) {
                        issues.push({
                            type: 'warning',
                            message: `Unused parameter '${param}' in function '${functionName}'.`,
                            fix: language === 'python' ? 
                                'Remove the unused parameter or prefix it with an underscore to indicate it is intentionally unused.' :
                                'Remove the unused parameter or comment it out.',
                            line: findLineNumber(code, new RegExp(language === 'python' ? 
                                `def\\s+${functionName}\\s*\\([^)]*\\${param}[^)]*\\):` : 
                                `(?:function\\s+${functionName}\\s*\\(|${functionName}\\s*\\([^)]*\\${param}[^)]*\\)\\s*\\{)`)),
                            severity: 'low'
                        });
                        stats.warnings++;
                    }
                }
            }
        }
        
        return {
            issues: issues,
            fixedCode: fixedCode,
            stats: stats
        };
    }

    // Function to optimize code analysis
    function optimizeCodeAnalysis(code, language) {
        // This is a more advanced code optimization analysis for demonstration purposes
        // In a real implementation, this would use proper parsing and optimization techniques
        
        const issues = [];
        let optimizedCode = code;
        let stats = {
            errors: 0,
            warnings: 0,
            optimizations: 0
        };
        
        // Language-specific optimizations
        if (language === 'javascript') {
            // Optimize variable declarations
            const varRegex = /\bvar\s+(\w+)\s*=/g;
            let match;
            
            while ((match = varRegex.exec(code)) !== null) {
                const varName = match[1];
                
                // Check if we can convert var to let or const
                const reassignmentRegex = new RegExp(`\\b${varName}\\s*=`);
                const assignments = (code.match(reassignmentRegex) || []).length;
                
                if (assignments === 1) {
                    issues.push({
                        type: 'info',
                        message: `Variable '${varName}' is only assigned once and can be declared with 'const'.`,
                        fix: `Replace 'var ${varName}' with 'const ${varName}' for better performance and to prevent reassignment.`,
                        line: findLineNumber(code, new RegExp(`\\bvar\\s+${varName}\\s*=`)),
                        severity: 'low'
                    });
                    stats.optimizations++;
                    
                    optimizedCode = optimizedCode.replace(new RegExp(`\\bvar\\s+${varName}\\s*=`), `const ${varName} =`);
                } else if (assignments > 1) {
                    issues.push({
                        type: 'info',
                        message: `Variable '${varName}' is reassigned and should be declared with 'let' instead of 'var'.`,
                        fix: `Replace 'var ${varName}' with 'let ${varName}' for block-scoping and to avoid hoisting issues.`,
                        line: findLineNumber(code, new RegExp(`\\bvar\\s+${varName}\\s*=`)),
                        severity: 'low'
                    });
                    stats.optimizations++;
                    
                    optimizedCode = optimizedCode.replace(new RegExp(`\\bvar\\s+${varName}\\s*=`), `let ${varName} =`);
                }
            }
            
            // Optimize array operations
            const forLoopRegex = /for\s*\(\s*(?:let|var)\s+(\w+)\s*=\s*0\s*;\s*\1\s*<\s*(\w+)\.length\s*;\s*\1\s*\+\+\s*\)\s*\{[^}]*\1\]/g;
            while ((match = forLoopRegex.exec(code)) !== null) {
                issues.push({
                    type: 'info',
                    message: 'Traditional for loop used for array iteration. Consider using array methods for cleaner code.',
                    fix: `Replace the for loop with array methods like forEach, map, filter, or reduce depending on the use case.`,
                    line: findLineNumber(code, new RegExp(`for\\s*\\(\\s*(?:let|var)\\s+${match[1]}\\s*=\\s*0\\s*;\\s*${match[1]}\\s*<\\s*${match[2]}\\.length\\s*;\\s*${match[1]}\\s*\\+\\+\\s*\\)`)),
                    severity: 'low'
                });
                stats.optimizations++;
            }
            
            // Optimize string concatenation
            const stringConcatRegex = /(\w+\s*\+\s*\w+\s*\+\s*\w+)/g;
            while ((match = stringConcatRegex.exec(code)) !== null) {
                issues.push({
                    type: 'info',
                    message: 'Multiple string concatenations detected. Consider using template literals for better readability and performance.',
                    fix: `Replace string concatenations with template literals: \`${match[1].replace(/\s*\+\s*/g, ' ')}\``,
                    line: findLineNumber(code, new RegExp(match[1].replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))),
                    severity: 'low'
                });
                stats.optimizations++;
            }
        } else if (language === 'python') {
            // Optimize list comprehensions
            const forLoopAppendRegex = /for\s+(\w+)\s+in\s+(\w+):\s*\n\s*(\w+)\.append\(\1\)/g;
            while ((match = forLoopAppendRegex.exec(code)) !== null) {
                issues.push({
                    type: 'info',
                    message: 'For loop with append can be replaced with a list comprehension for better performance.',
                    fix: `Replace the for loop with: ${match[3]} = [${match[1]} for ${match[1]} in ${match[2]}]`,
                    line: findLineNumber(code, new RegExp(`for\\s+${match[1]}\\s+in\\s+${match[2]}:`)),
                    severity: 'low'
                });
                stats.optimizations++;
            }
            
            // Optimize string formatting
            const percentFormatRegex = /(["'])[^"']*\1\s*%\s*\([^)]+\)/g;
            while ((match = percentFormatRegex.exec(code)) !== null) {
                issues.push({
                    type: 'info',
                    message: 'Old-style string formatting detected. Consider using f-strings for better readability.',
                    fix: `Replace the old-style formatting with an f-string: f"..."`,
                    line: findLineNumber(code, new RegExp(match[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))),
                    severity: 'low'
                });
                stats.optimizations++;
            }
        } else if (language === 'java' || language === 'cpp') {
            // Optimize string concatenation
            const stringConcatRegex = /(\w+\s*\+\s*\w+\s*\+\s*\w+)/g;
            while ((match = stringConcatRegex.exec(code)) !== null) {
                issues.push({
                    type: 'info',
                    message: 'Multiple string concatenations detected. Consider using StringBuilder for better performance.',
                    fix: `Replace string concatenations with StringBuilder: StringBuilder sb = new StringBuilder(); sb.append(...); sb.toString();`,
                    line: findLineNumber(code, new RegExp(match[1].replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))),
                    severity: 'low'
                });
                stats.optimizations++;
            }
            
            // Optimize loops
            const forLoopRegex = /for\s*\(\s*int\s+(\w+)\s*=\s*0\s*;\s*\1\s*<\s*(\w+)\.length\s*\(\)\s*;\s*\1\s*\+\+\s*\)/g;
            while ((match = forLoopRegex.exec(code)) !== null) {
                issues.push({
                    type: 'info',
                    message: 'For loop calls .length() in each iteration. Consider storing the length in a variable.',
                    fix: `Store the length in a variable: int len = ${match[2]}.length(); for (int ${match[1]} = 0; ${match[1]} < len; ${match[1]}++)`,
                    line: findLineNumber(code, new RegExp(`for\\s*\\(\\s*int\\s+${match[1]}\\s*=\\s*0\\s*;\\s*${match[1]}\\s*<\\s*${match[2]}\\.length\\s*\\(\\)\\s*;\\s*${match[1]}\\s*\\+\\+\\s*\\)`)),
                    severity: 'low'
                });
                stats.optimizations++;
            }
        }
        
        // General optimizations across languages
        // Optimize magic numbers
        const magicNumberRegex = /\b(?:if|while|for)\s*\([^)]*\b(\d{3,})\b[^)]*\)/g;
        while ((match = magicNumberRegex.exec(code)) !== null) {
            issues.push({
                type: 'info',
                message: 'Magic number detected. Consider using a named constant for better readability.',
                fix: `Define a constant: const MAX_VALUE = ${match[1]}; and use it instead of the magic number.`,
                line: findLineNumber(code, new RegExp(`\\b(?:if|while|for)\\s*\\([^)]*\\b${match[1]}\\b[^)]*\\)`)),
                severity: 'low'
            });
            stats.optimizations++;
        }
        
        // Optimize redundant conditions
        const redundantConditionRegex = /if\s*\(([^)]+)\)\s*\{\s*return\s+([^;]+);\s*\}\s*else\s*\{\s*return\s+\2\s*;\s*\}/g;
        while ((match = redundantConditionRegex.exec(code)) !== null) {
            issues.push({
                type: 'info',
                message: 'Redundant if-else statement detected. Both branches return the same value.',
                fix: 'Simplify by returning the value directly without the condition: return ' + match[2] + ';',
                line: findLineNumber(code, new RegExp(`if\\s*\\(${match[1].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\)`)),
                severity: 'low'
            });
            stats.optimizations++;
        }
        
        return {
            issues: issues,
            optimizedCode: optimizedCode,
            stats: stats
        };
    }

    // Helper function to find line number of a regex match
    function findLineNumber(code, regex) {
        const lines = code.split('\n');
        let match;
        
        // Reset regex state
        regex.lastIndex = 0;
        
        while ((match = regex.exec(code)) !== null) {
            const textBeforeMatch = code.substring(0, match.index);
            return textBeforeMatch.split('\n').length;
        }
        
        return 1; // Default to first line if not found
    }

    // Helper function to find matching closing brace
    function findMatchingBrace(code) {
        let depth = 0;
        for (let i = 0; i < code.length; i++) {
            if (code[i] === '{') {
                depth++;
            } else if (code[i] === '}') {
                depth--;
                if (depth === 0) {
                    return i;
                }
            }
        }
        return -1; // No matching brace found
    }

    // Helper function to find function end in Python
    function findFunctionEnd(code, startIndex) {
        let indentLevel = 0;
        const lines = code.substring(startIndex).split('\n');
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (line.trim() === '') continue;
            
            const indent = line.search(/\S/);
            
            if (indent === 0) {
                // Found a line at the top level, which means the function has ended
                return startIndex + lines.slice(0, i).join('\n').length;
            }
        }
        
        return code.length; // Reached the end of the code
    }

    // Function to display results
    function displayResults(results) {
        const resultsContainer = document.getElementById('results-container');
        
        if (results.issues.length === 0) {
            resultsContainer.innerHTML = `
                <div class="result-card">
                    <div class="result-header">
                        <span class="result-type success">Success</span>
                    </div>
                    <div class="result-body">
                        <div class="result-message">
                            No issues found in your code! It looks good.
                        </div>
                    </div>
                </div>
            `;
            return;
        }
        
        let html = '';
        
        results.issues.forEach(issue => {
            html += `
                <div class="result-card" data-type="${issue.type}">
                    <div class="result-header">
                        <span class="result-type ${issue.type}">${issue.type}</span>
                        <span class="panel-title">Line ${issue.line || 'N/A'}</span>
                    </div>
                    <div class="result-body">
                        <div class="result-message">
                            ${issue.message}
                        </div>
                        <div class="code-fix">
                            <button class="copy-button" data-fix="${issue.fix.replace(/"/g, '&quot;')}">Copy</button>
                            <pre>${escapeHtml(issue.fix)}</pre>
                        </div>
                    </div>
                </div>
            `;
        });
        
        resultsContainer.innerHTML = html;
        
        // Add event listeners to copy buttons
        document.querySelectorAll('.copy-button').forEach(button => {
            button.addEventListener('click', function() {
                const fix = this.getAttribute('data-fix');
                navigator.clipboard.writeText(fix).then(() => {
                    this.textContent = 'Copied!';
                    setTimeout(() => {
                        this.textContent = 'Copy';
                    }, 2000);
                });
            });
        });
    }

    // Function to filter results
    function filterResults(filter) {
        const resultCards = document.querySelectorAll('.result-card');
        
        resultCards.forEach(card => {
            if (filter === 'all') {
                card.style.display = 'block';
            } else {
                const type = card.getAttribute('data-type');
                if (type === filter) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            }
        });
    }

    // Function to load example code
    function loadExample(example) {
        let code = '';
        let language = 'javascript';
        
        switch (example) {
            case 'javascript-basics':
                language = 'javascript';
                code = `function calculateSum(a, b) {
    // This function calculates the sum of two numbers
    return a + b
}

// Call the function
const result = calculateSum(5, 10)
console.log(result)

// Unused variable
const unusedVar = "This is never used"

// Potential infinite loop
let i = 0
while (i < 10) {
    console.log(i)
    // Missing increment
}`;
                break;
            case 'python-loops':
                language = 'python';
                code = `# Calculate the sum of numbers from 1 to 10
def calculate_sum():
    total = 0
    for i in range(1, 11)
        total += i
    return total

# Call the function
result = calculate_sum()
print(result)

# Unused parameter
def greet(name, unused_param):
    return "Hello, " + name

# Potential memory leak with mutable default argument
def add_item(item, items=[]):
    items.append(item)
    return items

list1 = add_item("apple")
list2 = add_item("banana")
print(list1)  # Unexpectedly contains both "apple" and "banana"`;
                break;
            case 'java-classes':
                language = 'java';
                code = `public class Person {
    private String name;
    private int age;
    
    // Constructor with missing initialization
    public Person(String name) {
        this.name = name;
        // Missing age initialization
    }
    
    // Method with potential null pointer exception
    public void printDetails() {
        System.out.println("Name: " + name);
        System.out.println("Age: " + age.toString());  // Potential NPE if age is null
    }
    
    // Unused parameter
    public void updateAge(int newAge, String unusedParam) {
        this.age = newAge;
    }
    
    // Inefficient string concatenation in loop
    public String generateSequence(int count) {
        String result = "";
        for (int i = 0; i < count; i++) {
            result = result + "-" + i;  // Inefficient concatenation
        }
        return result;
    }
}`;
                break;
        }
        
        // Set the language
        languageSelector.value = language;
        languageSelector.dispatchEvent(new Event('change'));
        
        // Set the code
        inputEditor.setValue(code);
        
        // Auto-debug if enabled
        if (autoDebugToggle.classList.contains('active')) {
            debugCode(code, language);
        }
    }
    
    // Function to load example code
    function loadExample(example) {
        let code = '';
        let language = 'javascript';
        
        switch (example) {
            case 'javascript-basics':
                language = 'javascript';
                code = `function calculateSum(a, b) {
    // This function calculates the sum of two numbers
    return a + b
}

// Call the function
const result = calculateSum(5, 10)
console.log(result)

// Unused variable
const unusedVar = "This is never used"

// Potential infinite loop
let i = 0
while (i < 10) {
    console.log(i)
    // Missing increment
}`;
                break;
            case 'python-loops':
                language = 'python';
                code = `# Calculate the sum of numbers from 1 to 10
def calculate_sum():
    total = 0
    for i in range(1, 11)
        total += i
    return total

# Call the function
result = calculate_sum()
print(result)

# Unused parameter
def greet(name, unused_param):
    return "Hello, " + name

# Potential memory leak with mutable default argument
def add_item(item, items=[]):
    items.append(item)
    return items

list1 = add_item("apple")
list2 = add_item("banana")
print(list1)  # Unexpectedly contains both "apple" and "banana"`;
                break;
            case 'java-classes':
                language = 'java';
                code = `public class Person {
    private String name;
    private int age;
    
    // Constructor with missing initialization
    public Person(String name) {
        this.name = name;
        // Missing age initialization
    }
    
    // Method with potential null pointer exception
    public void printDetails() {
        System.out.println("Name: " + name);
        System.out.println("Age: " + age.toString());  // Potential NPE if age is null
    }
    
    // Unused parameter
    public void updateAge(int newAge, String unusedParam) {
        this.age = newAge;
    }
    
    // Inefficient string concatenation in loop
    public String generateSequence(int count) {
        String result = "";
        for (int i = 0; i < count; i++) {
            result = result + "-" + i;  // Inefficient concatenation
        }
        return result;
    }
}`;
                break;
        }
        
        // Set the language
        languageSelector.value = language;
        languageSelector.dispatchEvent(new Event('change'));
        
        // Set the code
        inputEditor.setValue(code);
        
        // Auto-debug if enabled
        if (autoDebugToggle.classList.contains('active')) {
            debugCode(code, language);
        }
    }

    // Helper function to escape HTML
    function escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        
        return text.replace(/[&<>"']/g, m => map[m]);
    }

    // Function to show notification
    function showNotification(message, type) {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => {
            notification.remove();
        });
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

    // Set initial code example
    inputEditor.setValue(`function calculateSum(a, b) {
    // This function calculates the sum of two numbers
    return a + b
}

// Call the function
const result = calculateSum(5, 10)
console.log(result)

// Unused variable
const unusedVar = "This is never used"

// Potential infinite loop
let i = 0
while (i < 10) {
    console.log(i)
    // Missing increment
}`);
});