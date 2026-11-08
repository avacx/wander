// Rebuild the single-file app: node src/build.js  -> ../earth-explorer.html
// Inlines regions.js / journeys.js and points Cesium at the vendored cesium/ folder (CDN fallback).
const fs=require('fs'), path=require('path'); const d=__dirname, out=path.join(d,'..','earth-explorer.html');
const inl=(h,f)=>h.replace('<script src="'+f+'"></script>','<script>\n'+fs.readFileSync(path.join(d,f),'utf8')+'\n</script>');
let h=fs.readFileSync(path.join(d,'src.html'),'utf8'); h=inl(h,'regions.js'); h=inl(h,'journeys.js');
const CDN='https://cdn.jsdelivr.net/npm/cesium@1.147.0/Build/Cesium/';
h=h.replace(/href="[^"]*Widgets\/widgets\.css"/,'href="cesium/Widgets/widgets.css"');
h=h.replace(/<script src="[^"]*\/Cesium\.js"><\/script>/,()=>'<script src="cesium/Cesium.js"></script>\n<script>if(!window.Cesium){document.write(\'<link rel="stylesheet" href="'+CDN+'Widgets/widgets.css"><script src="'+CDN+'Cesium.js"><\\/script>\')}</script>');
h=h.replace('__BUILD__','dev');
fs.writeFileSync(out,h); console.log('wrote',out);
