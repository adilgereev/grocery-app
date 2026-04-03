const fs = require('fs');
const path = require('path');

function searchForImportMeta(dir, callback) {
  fs.readdir(dir, { withFileTypes: true }, (err, files) => {
    if (err) return;
    for (const file of files) {
      if (file.name === '.cache' || file.name === '.expo' || file.name === 'node_modules') continue;
      const res = path.resolve(dir, file.name);
      if (file.isDirectory()) {
        searchForImportMeta(res, callback);
      } else if (file.name.endsWith('.js') || file.name.endsWith('.jsx') || file.name.endsWith('.ts') || file.name.endsWith('.tsx')) {
        fs.readFile(res, 'utf8', (err, data) => {
          if (!err && data.includes('import.meta')) {
            console.log('Found in:', res);
          }
        });
      }
    }
  });
}

function searchNodeModulesFast() {
  const nm = path.join(__dirname, '../node_modules');
  const knownOffenders = ['@supabase', 'zustand', 'react-native-reanimated'];
  for (const pkg of knownOffenders) {
    const pkgPath = path.join(nm, pkg);
    if (fs.existsSync(pkgPath)) {
      searchForImportMeta(pkgPath, () => {});
    }
  }
}

searchForImportMeta(path.join(__dirname, '../app'), () => {});
searchForImportMeta(path.join(__dirname, '../components'), () => {});
searchForImportMeta(path.join(__dirname, '../utils'), () => {});
searchNodeModulesFast();
console.log('Searching...');
