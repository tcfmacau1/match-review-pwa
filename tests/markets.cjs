const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
let js=fs.readFileSync(__dirname+'/../index.html','utf8').split('<script type="module">')[1].split('</script>')[0].replace(/render\(\);\s*initPWA\(\);/,'');
const node={addEventListener(){}};const ctx={console,document:{querySelector:()=>node,addEventListener(){}},window:{addEventListener(){}},localStorage:{getItem:()=>null},navigator:{},setTimeout,clearTimeout,Date};vm.createContext(ctx);vm.runInContext(js+';globalThis.api={settle,validateBet,stats,blankBet,builtInMarkets,applyMarket,leagueGroups,normalizeSettings,DEFAULT_SETTINGS,sideOptions};',ctx);const a=ctx.api;let count=0;const eq=(x,y)=>{assert.equal(x,y);count++;};
function bet(id,sp='football',changes={}){const b={...a.blankBet(),sport:sp,home:'A',away:'B',stake:100,odds:2,homeScore:3,awayScore:2,halfHome:0,halfAway:1,cornerHome:8,cornerAway:3,halfCornerHome:2,halfCornerAway:3};a.applyMarket(b,a.builtInMarkets(sp).find(m=>m.id===id));return {...b,...changes};}
function result(id,extra,expected,sp='football'){const b=bet(id,sp,extra);a.validateBet(b);eq(a.settle(b).result,expected);}
eq(a.builtInMarkets('football').length,16);eq(a.builtInMarkets('basketball').length,6);
result('f-h',{line:'-0.75'},'halfWin');result('f-t',{line:'4.5'},'win');result('f-m',{},'win');
result('f-hh',{line:'-0.5'},'loss');result('f-ht',{line:'1.5'},'loss');result('f-hm',{side:'away'},'win');
result('f-first',{firstGoalResult:'away',side:'away'},'win');result('f-first',{},'pending');result('f-first',{firstGoalResult:'none',side:'none'},'win');
result('f-next',{nextGoalMarker:'65 分鐘，1:1',nextGoalResult:'home'},'win');result('f-next',{nextGoalMarker:'65 分鐘，1:1',nextGoalResult:'none'},'loss');
result('f-count',{side:'4-6'},'win');result('f-count',{side:'exact',exactGoals:5},'win');result('f-count',{side:'exact',exactGoals:4},'loss');
for(const [n,side] of [[0,'0-1'],[1,'0-1'],[2,'2-3'],[3,'2-3'],[4,'4-6'],[6,'4-6'],[7,'7+']])result('f-count',{homeScore:n,awayScore:0,halfHome:0,halfAway:0,side},'win');
result('f-ct',{line:'10.5'},'win');result('f-ch',{line:'-4.5'},'win');result('f-hct',{line:'5.5'},'loss');result('f-hch',{line:'-0.5'},'loss');
result('f-hf',{side:'away-home'},'win');result('f-advance',{side:'away',isCup:'yes',advanceResult:'away'},'win');result('f-parity',{side:'odd'},'win');result('f-parity',{side:'even',homeScore:0,awayScore:0,halfHome:0,halfAway:0},'win');
result('b-h',{line:'-0.5'},'win','basketball');result('b-hh',{line:'-0.5'},'loss','basketball');result('b-t',{line:'4.5'},'win','basketball');result('b-ht',{line:'1.5'},'loss','basketball');result('b-m',{},'win','basketball');result('b-hf',{side:'away-home'},'win','basketball');
eq(a.sideOptions(bet('f-hf')).length,9);eq(a.sideOptions(bet('b-hf','basketball')).length,6);
for(const line of ['0','1','-2','0.25','-0.75','-0.5/1']){assert.throws(()=>a.validateBet(bet('b-h','basketball',{line})));count++;}
assert.throws(()=>a.validateBet(bet('f-next')));assert.throws(()=>a.validateBet(bet('f-advance')));assert.throws(()=>a.validateBet(bet('f-ct','football',{line:10.5,halfCornerHome:9})));count+=3;
const list=[bet('f-m','football',{league:'英超',stake:500}),bet('f-m','football',{league:'西甲',stake:800}),bet('f-m','football',{league:'意甲',stake:300,side:'away'}),bet('f-m','football',{kind:'forecast',stake:1000})];
eq(a.stats(list).profit,1000);eq(a.leagueGroups(list,'football').reduce((s,l)=>s+l.profit,0),1000);
const parlay={...bet('f-m'),kind:'parlay',system:'2',legs:[bet('f-ht','football',{line:1.5,side:'under'}),bet('f-count','football',{side:'exact',exactGoals:5})]};a.validateBet(parlay);eq(a.settle(parlay).profit,300);
eq(a.leagueGroups([...list,parlay],'football').find(x=>x.name.startsWith('過關')).profit,300);
const settings=JSON.parse(JSON.stringify(a.DEFAULT_SETTINGS));delete settings.marketsVersion;settings.markets.football=settings.markets.football.slice(0,3);settings.markets.basketball=settings.markets.basketball.slice(0,1);settings.markets.football.push({id:'custom',name:'自訂',rule:'manual',timings:['pre']});const migrated=a.normalizeSettings(settings);eq(migrated.markets.football.length,17);eq(migrated.markets.basketball.length,6);eq(a.normalizeSettings(migrated).markets.football.length,17);a.validateBet(JSON.parse(JSON.stringify(parlay)));count++;
console.log(`${count} market, league aggregation and migration checks passed`);
