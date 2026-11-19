const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
let js=fs.readFileSync(__dirname+'/../index.html','utf8').split('<script type="module">')[1].split('</script>')[0].replace(/render\(\);\s*initPWA\(\);/,'');
let writes=0;const ctx={console,document:{querySelector:()=>({addEventListener(){}}),addEventListener(){}},window:{addEventListener(){}},localStorage:{getItem:()=>null,setItem(){writes++}},navigator:{},setTimeout,clearTimeout};vm.createContext(ctx);vm.runInContext(js+';globalThis.api={parseBackup,blankBet,DEFAULT_SETTINGS};',ctx);const a=ctx.api;
const bet={...a.blankBet(),id:'backup-test',home:'A',away:'B',stake:100,odds:2,line:2.5};
const raw={bets:[bet],settings:JSON.parse(JSON.stringify(a.DEFAULT_SETTINGS))};
let count=0;for(const x of [raw,{...raw,app:'matchledger',schemaVersion:1},{...raw,app:'matchledger',schemaVersion:'1'},{'matchledger.v1':JSON.stringify(raw)},{'matchledger.v1':raw}]){const r=a.parseBackup(JSON.stringify(x));assert.equal(r.bets[0].id,bet.id);assert.equal(r.bets.length,1);count++;}
assert.equal(a.parseBackup('\uFEFF'+JSON.stringify(raw)).bets.length,1);count++;
for(const x of ['{', 'null','[]',JSON.stringify({...raw,app:'other'}),JSON.stringify({...raw,schemaVersion:99}),JSON.stringify({bets:[]}),JSON.stringify({...raw,bets:[bet,bet]}),JSON.stringify({...raw,bets:[{...bet,stake:-1}]})]){assert.throws(()=>a.parseBackup(x));count++;}
assert.equal(a.parseBackup(JSON.stringify({...raw,bets:[]})).bets.length,0);count++;
assert.equal(writes,0);count++;
console.log(count+' backup format, validation and no-write checks passed');

const conflict=JSON.parse(JSON.stringify(raw));delete conflict.settings.periodMarketsVersion;
conflict.settings.markets.football=conflict.settings.markets.football.filter(m=>!['f-score','f-hteam','f-hparity'].includes(m.id));
conflict.settings.markets.football.push({id:'custom-score',name:'波膽組合',rule:'manual',timings:['pre']},{id:'custom-half',name:'上半場入球大小（單隊）',rule:'manual',timings:['pre']});
const restored=a.parseBackup(JSON.stringify(conflict));
assert.equal(new Set(restored.settings.markets.football.map(m=>m.name)).size,restored.settings.markets.football.length);
assert.equal(restored.settings.markets.football.find(m=>m.id==='custom-score').rule,'manual');
assert.equal(JSON.stringify(restored.bets),JSON.stringify(conflict.bets));
assert.equal(a.parseBackup(JSON.stringify(restored)).settings.markets.football.length,restored.settings.markets.football.length);
console.log('4 duplicate-name migration and record-preservation checks passed');
