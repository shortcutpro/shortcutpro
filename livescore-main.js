/* ═══════════════════════════════════════════════════════════
   LIVE SCORE — LINETOGEL
   Pola sama seperti hokbentoto-main.js:
   - Cari <div id="livescore-root"> di halaman/embed
   - Suntik CSS + HTML sendiri
   - Ambil data dari sportscore.com/football lewat proxy
   - Auto-refresh
   Sumber data: https://sportscore.com/football/
   BUILD: livescore-2026-09-09
═══════════════════════════════════════════════════════════ */
console.log("[livescore] build 2026-09-09 aktif");
(function () {

/* ─────────── KONFIGURASI ─────────── */
var SOURCE_URL   = 'https://sportscore.com/football/';
var SITE_NAME    = 'LINETOGEL';
var CTA_TEXT     = 'KUNJUNGI LINETOGEL →';
var CTA_LINK     = '#';
var COLOR_MAIN   = '#FFD700';
var COLOR_TEXT   = '#fff8d8';
var AUTO_REFRESH = 60 * 1000;   // refresh tiap 60 detik saat sudah ada data
var RETRY_EMPTY  = 10 * 1000;   // coba lagi tiap 10 detik selama masih kosong

/* proxy: sama gaya dgn hokbentoto (text = respons langsung HTML,
   json = respons {contents:"..."}) */
var PROXIES = [
  { name:'AllOrigins', url:function(u){return 'https://api.allorigins.win/raw?url='+encodeURIComponent(u);}, mode:'html' },
  { name:'CodeTabs',   url:function(u){return 'https://api.codetabs.com/v1/proxy/?quest='+encodeURIComponent(u);}, mode:'html' },
  { name:'corsproxy',  url:function(u){return 'https://corsproxy.io/?url='+encodeURIComponent(u);}, mode:'html' },
  { name:'jina',       url:function(u){return 'https://r.jina.ai/'+u;}, mode:'text' }
];

/* ─────────── STATE ─────────── */
var ALL = [];
var FILTER = 'all';
var QUERY = '';
var loading = false;

/* ─────────── ROOT ─────────── */
var root = document.getElementById('livescore-root');
if (!root) {
  // kalau embed belum sediakan root, buat sendiri
  root = document.createElement('div');
  root.id = 'livescore-root';
  document.body.appendChild(root);
}

/* ─────────── CSS ─────────── */
(function injectCSS(){
  var css = ''
  + '#livescore-root{--g:'+COLOR_MAIN+';--txt:'+COLOR_TEXT+';--bg:#0b0f14;--panel:#121824;--panel2:#0e1420;--line:#1e2836;--muted:#8a97a8;--live:#ff3b57;'
  +   'font-family:"Poppins",system-ui,-apple-system,sans-serif;color:#e7edf5;background:radial-gradient(1200px 600px at 50% -10%,#152033 0%,#0b0f14 60%);padding:14px;border-radius:0;box-sizing:border-box;}'
  + '#livescore-root *{box-sizing:border-box;margin:0;padding:0;}'
  + '#livescore-root .ls-wrap{max-width:920px;margin:0 auto;}'
  /* hero */
  + '#livescore-root .ls-hero{text-align:center;padding:24px 16px 18px;background:linear-gradient(180deg,#16233a 0%,var(--panel) 100%);border:1px solid var(--line);border-radius:14px;margin-bottom:14px;position:relative;overflow:hidden;}'
  + '#livescore-root .ls-kicker{letter-spacing:3px;font-size:11px;color:var(--g);font-weight:700;text-transform:uppercase;margin-bottom:8px;}'
  + '#livescore-root .ls-hero h1{font-size:32px;font-weight:900;letter-spacing:1px;background:linear-gradient(90deg,#fff,var(--g));-webkit-background-clip:text;background-clip:text;color:transparent;}'
  + '#livescore-root .ls-hero p{color:var(--muted);font-size:12px;margin-top:9px;line-height:1.6;}'
  + '#livescore-root .ls-cta{display:inline-block;margin-top:13px;padding:10px 22px;background:var(--g);color:#111;font-weight:800;border-radius:999px;text-decoration:none;font-size:12px;transition:.2s;}'
  + '#livescore-root .ls-cta:hover{transform:translateY(-2px);box-shadow:0 8px 22px rgba(255,215,0,.35);}'
  /* date bar */
  + '#livescore-root .ls-datebar{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:11px 15px;margin-bottom:12px;}'
  + '#livescore-root .ls-datebar b{font-size:14px;}'
  + '#livescore-root .ls-snap{font-size:10px;letter-spacing:1px;color:var(--g);border:1px solid var(--g);padding:4px 10px;border-radius:999px;text-transform:uppercase;font-weight:700;}'
  /* controls */
  + '#livescore-root .ls-controls{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:12px;}'
  + '#livescore-root .ls-search{flex:1;min-width:170px;display:flex;align-items:center;gap:8px;background:var(--panel);border:1px solid var(--line);border-radius:999px;padding:9px 14px;}'
  + '#livescore-root .ls-search input{background:none;border:none;color:#e7edf5;flex:1;font-size:13px;outline:none;font-family:inherit;}'
  + '#livescore-root .ls-filters{display:flex;gap:6px;flex-wrap:wrap;}'
  + '#livescore-root .ls-filters button{background:var(--panel);border:1px solid var(--line);color:var(--muted);padding:8px 13px;border-radius:999px;cursor:pointer;font-size:12px;font-weight:600;transition:.15s;font-family:inherit;}'
  + '#livescore-root .ls-filters button.active{background:var(--g);color:#111;border-color:var(--g);}'
  /* panel */
  + '#livescore-root .ls-panel{background:var(--panel);border:1px solid var(--line);border-radius:14px;overflow:hidden;}'
  + '#livescore-root .ls-phead{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:13px 15px;border-bottom:1px solid var(--line);background:var(--panel2);}'
  + '#livescore-root .ls-phead h2{font-size:13px;letter-spacing:1px;text-transform:uppercase;}'
  + '#livescore-root .ls-phead .ls-status{font-size:10px;color:var(--muted);flex:1;text-align:right;margin-right:6px;}'
  + '#livescore-root .ls-livecount{background:var(--live);color:#fff;font-size:11px;font-weight:800;padding:3px 9px;border-radius:999px;white-space:nowrap;}'
  /* match */
  + '#livescore-root .ls-match{display:grid;grid-template-columns:64px 1fr auto 1fr;align-items:center;gap:10px;padding:13px 15px;border-bottom:1px solid var(--line);transition:.15s;}'
  + '#livescore-root .ls-match:last-child{border-bottom:none;}'
  + '#livescore-root .ls-match:hover{background:rgba(255,255,255,.02);}'
  + '#livescore-root .ls-comp{grid-column:1/-1;font-size:11px;color:var(--muted);display:flex;align-items:center;gap:6px;margin-bottom:2px;}'
  + '#livescore-root .ls-comp img{width:15px;height:15px;object-fit:contain;}'
  + '#livescore-root .ls-time{text-align:center;}'
  + '#livescore-root .ls-time .t{font-size:12px;color:var(--muted);font-weight:600;}'
  + '#livescore-root .ls-st{display:inline-block;margin-top:5px;font-size:10px;font-weight:800;padding:2px 8px;border-radius:999px;letter-spacing:.5px;}'
  + '#livescore-root .ls-st.live{background:var(--live);color:#fff;animation:lsPulse 1.4s infinite;}'
  + '#livescore-root .ls-st.ht{background:#e67e22;color:#fff;}'
  + '#livescore-root .ls-st.fin{background:#334;color:#aab;}'
  + '#livescore-root .ls-st.sched{background:#22304a;color:#8fb0e0;}'
  + '@keyframes lsPulse{0%,100%{opacity:1}50%{opacity:.5}}'
  + '#livescore-root .ls-team{display:flex;align-items:center;gap:9px;min-width:0;}'
  + '#livescore-root .ls-team.away{flex-direction:row-reverse;text-align:right;}'
  + '#livescore-root .ls-team img{width:26px;height:26px;object-fit:contain;flex-shrink:0;}'
  + '#livescore-root .ls-team .nm{font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}'
  + '#livescore-root .ls-score{font-size:20px;font-weight:900;text-align:center;min-width:56px;letter-spacing:1px;}'
  + '#livescore-root .ls-score.livesc{color:var(--g);}'
  + '#livescore-root .ls-score .vs{font-size:12px;color:var(--muted);font-weight:600;}'
  /* misc */
  + '#livescore-root .ls-empty{padding:40px 16px;text-align:center;color:var(--muted);font-size:13px;}'
  + '#livescore-root .ls-spin{width:26px;height:26px;border:3px solid var(--line);border-top-color:var(--g);border-radius:50%;animation:lsSpin .8s linear infinite;margin:0 auto 12px;}'
  + '@keyframes lsSpin{to{transform:rotate(360deg)}}'
  + '#livescore-root .ls-foot{text-align:center;color:var(--muted);font-size:11px;padding:14px;margin-top:10px;}'
  + '#livescore-root .ls-foot a{color:var(--g);text-decoration:none;}'
  + '@media(max-width:560px){#livescore-root .ls-hero h1{font-size:25px}#livescore-root .ls-match{grid-template-columns:54px 1fr auto 1fr;gap:6px;padding:11px 9px}#livescore-root .ls-team .nm{font-size:11px}#livescore-root .ls-team img{width:22px;height:22px}#livescore-root .ls-score{font-size:17px;min-width:46px}}';
  var st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);
})();

/* ─────────── SHELL HTML ─────────── */
var todayStr = new Date().toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'});
root.innerHTML = ''
+ '<div class="ls-wrap">'
+   '<div class="ls-hero">'
+     '<div class="ls-kicker">Real Matches • Real Moments</div>'
+     '<h1>LIVE SCORE</h1>'
+     '<p>Semua pertandingan sepak bola dalam satu halaman.<br>Pantau jadwal dan skor terbaru secara real-time.</p>'
+     '<a class="ls-cta" href="'+CTA_LINK+'">'+CTA_TEXT+'</a>'
+   '</div>'
+   '<div class="ls-datebar">'
+     '<b>Live Score Hari Ini · '+todayStr+'</b>'
+     '<span class="ls-snap">High Traffic Snapshot</span>'
+   '</div>'
+   '<div class="ls-controls">'
+     '<div class="ls-search"><span>⌕</span><input id="ls-q" type="text" placeholder="Cari tim atau liga..."></div>'
+     '<div class="ls-filters">'
+       '<button data-f="all" class="active">Semua</button>'
+       '<button data-f="live">LIVE</button>'
+       '<button data-f="finished">Selesai</button>'
+       '<button data-f="upcoming">Jadwal</button>'
+     '</div>'
+   '</div>'
+   '<div class="ls-panel">'
+     '<div class="ls-phead">'
+       '<h2>⚽ Football</h2>'
+       '<span class="ls-status" id="ls-status">Memuat...</span>'
+       '<span class="ls-livecount" id="ls-livecount">0 LIVE</span>'
+     '</div>'
+     '<div id="ls-list"><div class="ls-empty"><div class="ls-spin"></div>Memuat live score...</div></div>'
+   '</div>'
+   '<div class="ls-foot">Data snapshot · Powered by <a href="https://sportscore.com/" target="_blank" rel="noopener">SportScore</a></div>'
+ '</div>';

var $list   = root.querySelector('#ls-list');
var $status = root.querySelector('#ls-status');
var $count  = root.querySelector('#ls-livecount');

/* ─────────── FETCH (coba semua proxy) ─────────── */
function fetchMatches(cb){
  var i = 0;
  function trynext(){
    if(i >= PROXIES.length){ cb([]); return; }
    var p = PROXIES[i++];
    $status.textContent = 'Mencoba sumber ('+p.name+')...';
    fetch(p.url(SOURCE_URL), {cache:'no-store'})
      .then(function(r){ return r.ok ? r.text() : Promise.reject(); })
      .then(function(body){
        if(!body || body.length < 1500){ trynext(); return; }
        var m = (p.mode === 'text') ? parseFromText(body) : parseFromHtml(body);
        if(m.length){ cb(m); } else { trynext(); }
      })
      .catch(function(){ trynext(); });
  }
  trynext();
}

/* ─────────── PARSER HTML (DOM) ─────────── */
function parseFromHtml(html){
  var doc = new DOMParser().parseFromString(html,'text/html');
  var out = [], seen = {};
  var links = doc.querySelectorAll('a[href*="/football/match/"]');
  for(var i=0;i<links.length;i++){
    var a = links[i], href = a.getAttribute('href')||'';
    if(seen[href]) continue;
    var card = a;
    for(var k=0;k<7 && card;k++){
      if(card.querySelectorAll && card.querySelectorAll('a[href*="/football/team/"]').length>=2) break;
      card = card.parentElement;
    }
    if(!card) continue;
    var tls = card.querySelectorAll('a[href*="/football/team/"]');
    var names=[];
    for(var t=0;t<tls.length;t++){
      var n=(tls[t].textContent||'').trim();
      if(n && names.indexOf(n)<0) names.push(n);
    }
    if(names.length<2) continue;
    seen[href]=1;
    var logos=[]; var imgs=card.querySelectorAll('img');
    for(var g=0;g<imgs.length;g++){
      var s=imgs[g].getAttribute('src')||'';
      if(s.indexOf('/team/')>=0 && logos.indexOf(s)<0) logos.push(s);
    }
    var raw=(card.textContent||'').replace(/\s+/g,' ').trim();
    var liveImg=!!card.querySelector('img[src*="live"]');
    out.push(buildFromHtml(names[0],names[1],logos[0],logos[1],raw,liveImg,card));
  }
  return dedupe(out);
}

function buildFromHtml(home,away,hLogo,aLogo,raw,liveImg,card){
  var hs='',as='',scored=false;
  var sc=raw.match(/(\d{1,2})\s*[-–]\s*(\d{1,2})/);
  if(sc){hs=sc[1];as=sc[2];scored=true;}
  var status='sched',label='';
  if(/\bHT\b/.test(raw)){status='ht';label='HT';}
  else if(/\bFT\b|Finished|Selesai/.test(raw)){status='fin';label='FT';}
  else if(liveImg || /\bLive\b/i.test(raw)){
    status='live';
    var mn=raw.match(/\b(\d{1,3})'/);
    label=mn?mn[1]+"'":'LIVE';
  }
  var time=''; var tm=raw.match(/\b\d{1,2}:\d{2}\s?(AM|PM)?\b/); if(tm) time=tm[0];
  var comp='',compImg=''; var scan=card;
  for(var i=0;i<10 && scan;i++){
    var cl=scan.querySelector && scan.querySelector('a[href*="/competition/"]');
    if(cl){ comp=cl.textContent.trim();
      var ci=scan.querySelector('img[src*="/competition/"],img[src*="/country/"]');
      if(ci) compImg=ci.getAttribute('src')||''; break; }
    scan=scan.previousElementSibling||scan.parentElement;
  }
  return {home:home,away:away,homeLogo:hLogo||'',awayLogo:aLogo||'',hs:hs,as:as,scored:scored,status:status,label:label,time:time,comp:comp,compImg:compImg};
}

/* ─────────── PARSER TEKS (r.jina.ai markdown) ─────────── */
function parseFromText(txt){
  var out=[], lines=txt.split('\n');
  var teamRe=/\[([^\]]+)\]\((https?:\/\/sportscore\.com\/football\/team\/[^)]+)\)/;
  var buf=[], curComp='';
  function flush(){
    var teams=[],score='',live=false,statusTxt='',time='';
    for(var j=0;j<buf.length;j++){
      var l=buf[j], m=l.match(teamRe);
      if(m && teams.length<2) teams.push(m[1].trim());
      var s=l.match(/\**(\d{1,2})\**\s*[-–]\s*\**(\d{1,2})\**/);
      if(s && !score) score=s[1]+' - '+s[2];
      if(/live\.svg|\bLive\b/i.test(l)) live=true;
      if(/\bHT\b/.test(l)) statusTxt='HT';
      if(/\bFT\b|Finished/.test(l)) statusTxt='FT';
      var tm=l.match(/\b\d{1,2}:\d{2}\s?(AM|PM)?\b/);
      if(tm && !time) time=tm[0];
    }
    if(teams.length===2){
      var raw=buf.join(' ').replace(/\s+/g,' ');
      var hs='',as='',scored=false;
      if(score){var p=score.split('-');hs=p[0].trim();as=p[1].trim();scored=true;}
      var status='sched',label='';
      if(statusTxt==='HT'){status='ht';label='HT';}
      else if(statusTxt==='FT'){status='fin';label='FT';}
      else if(live){status='live';var mn=raw.match(/\b(\d{1,3})'/);label=mn?mn[1]+"'":'LIVE';}
      out.push({home:teams[0],away:teams[1],homeLogo:'',awayLogo:'',hs:hs,as:as,scored:scored,status:status,label:label,time:time,comp:curComp,compImg:''});
    }
    buf=[];
  }
  for(var i=0;i<lines.length;i++){
    var l=lines[i].trim(); if(!l) continue;
    var comp=l.match(/\[([^\]]+)\]\(https?:\/\/sportscore\.com\/football\/competition\/[^)]+\)/);
    if(comp) curComp=comp[1].trim();
    buf.push(l);
    if(/\/football\/match\//.test(l)) flush();
  }
  flush();
  return dedupe(out);
}

function dedupe(arr){
  var seen={},out=[];
  for(var i=0;i<arr.length;i++){
    var k=(arr[i].home+'|'+arr[i].away).toLowerCase();
    if(seen[k]) continue; seen[k]=1; out.push(arr[i]);
  }
  return out;
}

/* ─────────── RENDER ─────────── */
function render(){
  var q=QUERY.toLowerCase();
  var rows=[];
  for(var i=0;i<ALL.length;i++){
    var m=ALL[i];
    if(FILTER==='live' && m.status!=='live' && m.status!=='ht') continue;
    if(FILTER==='finished' && m.status!=='fin') continue;
    if(FILTER==='upcoming' && m.status!=='sched') continue;
    if(q){ var hay=(m.home+' '+m.away+' '+m.comp).toLowerCase(); if(hay.indexOf(q)<0) continue; }
    rows.push(m);
  }
  var order={live:0,ht:1,sched:2,fin:3};
  rows.sort(function(a,b){return order[a.status]-order[b.status];});

  var liveN=0; for(var n=0;n<ALL.length;n++){ if(ALL[n].status==='live'||ALL[n].status==='ht') liveN++; }
  $count.textContent=liveN+' LIVE';

  if(!rows.length){ $list.innerHTML='<div class="ls-empty">Tidak ada pertandingan untuk filter ini.</div>'; return; }

  var ph="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='26' height='26'%3E%3Ccircle cx='13' cy='13' r='11' fill='%231e2836'/%3E%3C/svg%3E";
  var html='';
  for(var r=0;r<rows.length;r++){
    var m2=rows[r];
    var stCls=m2.status==='live'?'live':m2.status==='ht'?'ht':m2.status==='fin'?'fin':'sched';
    var stTxt=m2.label||(m2.status==='sched'?'JADWAL':'');
    var score=m2.scored
      ? '<div class="ls-score '+((m2.status==='live'||m2.status==='ht')?'livesc':'')+'">'+m2.hs+' - '+m2.as+'</div>'
      : '<div class="ls-score"><span class="vs">VS</span></div>';
    html+=''
      +'<div class="ls-match">'
      + (m2.comp?'<div class="ls-comp">'+(m2.compImg?'<img src="'+m2.compImg+'" onerror="this.style.display=\'none\'">':'')+m2.comp+'</div>':'')
      +'<div class="ls-time"><div class="t">'+(m2.time||'--:--')+'</div>'+(stTxt?'<div class="ls-st '+stCls+'">'+stTxt+'</div>':'')+'</div>'
      +'<div class="ls-team home"><img src="'+(m2.homeLogo||ph)+'" onerror="this.src=\''+ph+'\'"><span class="nm">'+m2.home+'</span></div>'
      +score
      +'<div class="ls-team away"><img src="'+(m2.awayLogo||ph)+'" onerror="this.src=\''+ph+'\'"><span class="nm">'+m2.away+'</span></div>'
      +'</div>';
  }
  $list.innerHTML=html;
}

/* ─────────── LOAD LOOP ─────────── */
function load(){
  if(loading) return;
  loading=true;
  $status.textContent='Mengambil data...';
  fetchMatches(function(matches){
    if(matches.length){
      ALL=matches;
      $status.textContent='Terupdate '+new Date().toLocaleTimeString('id-ID');
      render();
    }else if(ALL.length){
      $status.textContent='Sumber sibuk · data terakhir dipertahankan';
    }else{
      $list.innerHTML='<div class="ls-empty"><div class="ls-spin"></div>Sumber sibuk. Mencoba lagi otomatis...</div>';
      $status.textContent='Menunggu sumber';
    }
    loading=false;
    setTimeout(load, ALL.length ? AUTO_REFRESH : RETRY_EMPTY);
  });
}

/* ─────────── EVENTS ─────────── */
root.querySelector('#ls-q').addEventListener('input',function(e){ QUERY=e.target.value; render(); });
var fbtns=root.querySelectorAll('.ls-filters button');
for(var b=0;b<fbtns.length;b++){
  fbtns[b].addEventListener('click',function(){
    for(var x=0;x<fbtns.length;x++) fbtns[x].classList.remove('active');
    this.classList.add('active');
    FILTER=this.getAttribute('data-f');
    render();
  });
}

/* ─────────── GO ─────────── */
load();

})();
