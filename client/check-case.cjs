const fs = require('fs');
const path = require('path');

function checkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      checkDir(fullPath);
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const importRegex = /import\s+.*?\s+from\s+['"](.*?)['"]/g;
      let match;
      while ((match = importRegex.exec(content)) !== null) {
        const importPath = match[1];
        if (importPath.startsWith('.')) {
          // Resolve path
          const resolvedPath = path.resolve(dir, importPath);
          const dirName = path.dirname(resolvedPath);
          const baseName = path.basename(resolvedPath);
          try {
            const actualFiles = fs.readdirSync(dirName);
            let found = false;
            for (const ext of ['', '.js', '.jsx', '/index.js', '/index.jsx']) {
               const checkName = baseName + ext;
               if (ext.startsWith('/')) {
                  try {
                    const subFiles = fs.readdirSync(resolvedPath);
                    if (subFiles.includes(ext.substring(1))) found = true;
                  } catch (e) {}
               } else {
                  if (actualFiles.includes(checkName)) found = true;
               }
            }
            if (!found) {
               console.log('Case mismatch in', fullPath, '->', importPath);
            }
          } catch (e) {
            console.log('Not found (or directory issues):', fullPath, '->', importPath);
          }
        }
      }
    }
  }
}
checkDir('./src');
