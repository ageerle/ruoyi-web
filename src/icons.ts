// src/icons.js
function importAll(r:any) {
    r.keys().forEach(r);
  }
  
  // 动态导入 ./assets/icons 文件夹中的所有 .svg 文件
  importAll(require.context('./assets/icons', false, /\.svg$/));
  