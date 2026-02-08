import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Polyfills must be set before importing mermaid? No, usually fine if before usage.
// But mermaid might access globals on import.
// Let's set globals first.
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
  url: "http://localhost/",
});
global.window = dom.window;
global.document = dom.window.document;
global.Element = dom.window.Element;
// Some mermaid versions need SVGElement
global.SVGElement = dom.window.SVGElement || class SVGElement extends global.Element {};

// Now import mermaid
import mermaid from 'mermaid';

mermaid.initialize({
  startOnLoad: false,
  suppressErrorRendering: true, // We don't want error diagrams, just the error object
  securityLevel: 'loose',
});

async function validate() {
  let code;
  const input = process.argv[2];

  if (input) {
    // Check if input is a file path
    try {
      // Check if file exists
      await fs.access(input);
      const stat = await fs.stat(input);
      if (stat.isFile()) {
        code = await fs.readFile(input, 'utf8');
      } else {
        // It's a directory or something else, treat as code (unlikely but safe fallback)
        code = input;
      }
    } catch (err) {
      // File does not exist or invalid path chars (like newlines), treat as direct code
      code = input;
    }
  } else {
    // Try reading from stdin
    if (!process.stdin.isTTY) {
      try {
        const chunks = [];
        for await (const chunk of process.stdin) {
            chunks.push(chunk);
        }
        code = Buffer.concat(chunks).toString('utf8');
      } catch (err) {
         console.error("Error reading from stdin:", err);
      }
    }
  }

  if (!code || !code.trim()) {
    console.error("Error: No Mermaid code provided via argument or stdin.");
    process.exit(1);
  }

  try {
    // mermaid.parse returns a promise that resolves if valid, rejects if invalid
    await mermaid.parse(code);
    console.log("Valid Mermaid code.");
  } catch (error) {
    console.error("Invalid Mermaid code:");
    // Mermaid error messages can be unstructured, try to print as much as possible
    console.error(error.message || error);
    if (error.hash) {
        // syntax error details often in 'hash'
        console.error("Line:", error.hash.line);
        console.error("Expected:", error.hash.expected);
        console.error("Token:", error.hash.token);
    }
    process.exit(1);
  }
}

validate();
