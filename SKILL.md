---
name: mermaid-checker
description: Use this skill when the user asks for a Mermaid diagram or when your response includes a Mermaid code block. It validates and automatically fixes Mermaid syntax errors.
---

# Mermaid Checker

## Overview
This skill ensures that any Mermaid diagram generated is syntactically correct. It uses a Node.js script to validate the Mermaid code against the official `mermaid` parser.

## Workflow
 
 When you need to generate a Mermaid diagram:
 
 1.  **Draft**: Generate the Mermaid code block.
 2.  **Validate**: 
     - Run the validation script directly with the Mermaid code as an argument:
       ```bash
       node <skill_directory>/scripts/validate_mermaid.js "graph TD; A-->B;"
       ```
     - *Important*: 
       - Enclose the Mermaid code in double quotes (`"`).
       - Escape any double quotes inside the code (e.g., `\"`).
       - If the code is complex or multi-line, ensure the shell command is properly formatted.
 3.  **Check Result**:
     - **If Exit Code 0**: The code is valid. Present it to the user.
     - **If Exit Code 1**: The code is invalid.
         - Read the error output from the script.
         - Analyze the error (Line number, Expected tokens).
         - **Fix**: Modify the Mermaid code to resolve the error.
         - **Retry**: Go back to step 2 with the fixed code.
         - **Limit**: Try up to 3 times. If it still fails, explain the difficulty to the user and show the best effort code with a warning.
 
 ## Validation Script
 
 The validation script is located at `scripts/validate_mermaid.js`.
 It requires `mermaid` and `jsdom` (already installed in `scripts/`).
 
 **Usage:**
 ```bash
 # Option 1: Pass code directly (Recommended)
 node <skill_directory>/scripts/validate_mermaid.js "graph TD; A-->B"
 
 # Option 2: Pass file path (Legacy support)
 node <skill_directory>/scripts/validate_mermaid.js <path_to_mermaid_file>
 ```
*Note: Replace `<skill_directory>` with the actual absolute path where this skill is installed.*

**Output:**
- stdout: "Valid Mermaid code." (if success)
- stderr: Error details (if failure)

## Troubleshooting
- **Dependency Installation**: This skill relies on Node.js packages (`mermaid` and `jsdom`). If the validation script fails because modules are missing, you must install them.
- Common Mermaid errors:
  - Missing semicolons (usually optional but good practice).
  - Invalid arrow types.
  - Using reserved keywords as IDs without quotes.
  - Subgraph syntax errors.
