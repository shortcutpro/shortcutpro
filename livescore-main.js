/* ═══════════════════════════════════════════════════════════
   LIVE SCORE — LINETOGEL  (versi GitHub statis, no server)
   Sumber : https://sportscore.com/football/
   Proxy  : r.jina.ai  (satu-satunya yang tembus dari browser)
            -> mengembalikan MARKDOWN, diparse baris-per-baris.
   Pola inject sama seperti hokbentoto-main.js (#livescore-root)
   BUILD  : livescore-jina-2026-09-09
═══════════════════════════════════════════════════════════ */
console.log("[livescore] build jina-2026-09-09 aktif");
(function () {

/* ─────────── KONFIGURASI ─────────── */
var SOURCE_URL   = 'https://sportscore.com/football/';
var SITE_NAME    = 'LINETOGEL';
var CTA_TEXT     = 'KUNJUNGI LINETOGEL →';
var CTA_LINK     = '#';
var COLOR_MAIN   = '#FFD700';
var COLOR_TEXT   = '#fff8d8';
var AUTO_REFRESH = 60 * 1000;   // refresh tiap 60 dtk bila sudah ada data
var RETRY_EMPTY  = 12 * 1000;   // coba lagi 12 dtk bila masih kosong

/* r.jina.ai — beberapa varian endpoint sbg cadangan */
var JINA = [
  function(u){ return 'https://r.jina.ai/' + u; },
  function(u){ return 'https://r.jina.ai/' + encodeURIComponent(u); }
];

/* ─────────── STATE ─────────── */
var ALL = [];
var FILTER = 'all';
var QUERY = '';
var loading = false;

/* ─────────── ROOT ─────────── */
var root = document.getElementById('livescore-root');
if (!root) {
  root = document.createElement('div');
  root.id = 'livescore-root';
  document.body.appendChild(root);
}

/* ─────────── CSS ─────────── */
(function injectCSS(){
  var css = ''
  + '#livescore-root{--g:'+COLOR_MAIN+';--txt:'+COLOR_TEXT+';--bg:#0b0f14;--panel:#121824;--panel2:#0e1420;--line:#1e2836;--muted:#8a97a8;--live:#ff3b57;'
  +   'font-family:"Poppins",system-ui,-apple-system,sans-serif;color:#e7edf5;background:radial-gradient(1200px 600px at 50% -10%,#152033 0%,#0b0f14 60%);padding:14px;box-sizing:border-box;}'
  + '#livescore-root *{box-sizing:border-box;margin:0;padding:0;}'
  + '#livescore-root .ls-wrap{max-width:920px;margin:0 auto;}'
  + '#livescore-root .ls-hero{text-align:center;padding:24px 16px 18px;background:linear-gradient(180deg,#16233a 0%,var(--panel) 100%);border:1px solid var(--line);border-radius:14px;margin-bottom:14px;position:relative;overflow:hidden;}'
  + '#livescore-root .ls-kicker{letter-spacing:3px;font-size:11px;color:var(--g);font-weight:700;text-transform:uppercase;margin-bottom:8px;}'
  + '#livescore-root .ls-hero h1{font-size:32px;font-weight:900;letter-spacing:1px;background:linear-gradient(90deg,#fff,var(--g));-webkit-background-clip:text;background-clip:text;color:transparent;}'
  + '#livescore-root .ls-hero p{color:var(--muted);font-size:12px;margin-top:9px;line-height:1.6;}'
  + '#livescore-root .ls-cta{display:inline-block;margin-top:13px;padding:10px 22px;background:var(--g);color:#111;font-weight:800;border-radius:999px;text-decoration:none;font-size:12px;transition:.2s;}'
  + '#livescore-root .ls-cta:hover{transform:translateY(-2px);box-shadow:0 8px 22px rgba(255,215,0,.35);}'
  + '#livescore-root .ls-datebar{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:11px 15px;margin-bottom:12px;}'
  + '#livescore-root .ls-datebar b{font-size:14px;}'
  + '#livescore-root .ls-snap{font-size:10px;letter-spacing:1px;color:var(--g);border:1px solid var(--g);padding:4px 10px;border-radius:999px;text-transform:uppercase;font-weight:700;}'
  + '#livescore-root .ls-controls{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:12px;}'
  + '#livescore-root .ls-search{flex:1;min-width:170px;display:flex;align-items:center;gap:8px;background:var(--panel);border:1px solid var(--line);border-radius:999px;padding:9px 14px;}'
  + '#livescore-root .ls-search input{background:none;border:none;color:#e7edf5;flex:1;font-size:13px;outline:none;font-family:inherit;}'
  + '#livescore-root .ls-filters{display:flex;gap:6px;flex-wrap:wrap;}'
  + '#livescore-root .ls-filters button{background:var(--panel);border:1px solid var(--line);color:var(--muted);padding:8px 13px;border-radius:999px;cursor:pointer;font-size:12px;font-weight:600;transition:.15s;font-family:inherit;}'
  + '#livescore-root .ls-filters button.active{background:var(--g);color:#111;border-color:var(--g);}'
  + '#livescore-root .ls-panel{background:var(--panel);border:1px solid var(--line);border-radius:14px;overflow:hidden;}'
  + '#livescore-root .ls-phead{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:13px 15px;border-bottom:1px solid var(--line);background:var(--panel2);}'
  + '#livescore-root .ls-phead h2{font-size:13px;letter-spacing:1px;text-transform:uppercase;}'
  + '#livescore-root .ls-phead .ls-status{font-size:10px;color:var(--muted);flex:1;text-align:right;margin-right:6px;}'
  + '#livescore-root .ls-livecount{background:var(--live);color:#fff;font-size:11px;font-weight:800;padding:3px 9px;border-radius:999px;white-space:nowrap;}'
  + '#livescore-root .ls-match{display:grid;grid-template-columns:60px 1fr auto 1fr;align-items:center;gap:10px;padding:13px 15px;border-bottom:1px solid var(--line);transition:.15s;}'
  + '#livescore-root .ls-match:last-child{border-bottom:none;}'
  + '#livescore-root .ls-match:hover{background:rgba(255,255,255,.02);}'
  + '#livescore-root .ls-comp{grid-column:1/-1;font-size:11px;color:var(--muted);margin-bottom:2px;}'
  + '#livescore-root .ls-time{text-align:center;}'
  + '#livescore-root .ls-time .t{font-size:12px;color:var(--muted);font-weight:600;}'
  + '#livescore-root .ls-st{display:inline-block;margin-top:5px;font-size:10px;font-weight:800;padding:2px 8px;border-radius:999px;letter-spacing:.5px;}'
  + '#livescore-root .ls-st.live{background:var(--live);color:#fff;animation:lsPulse 1.4s infinite;}'
  + '#livescore-root .ls-st.ht{background:#e67e22;color:#fff;}'
  + '#livescore-root .ls-st.fin{background:#334;color:#aab;}'
  + '#livescore-root .ls-st.sched{background:#22304a;color:#8fb0e0;}'
  + '@keyframes lsPulse{0%,100%{opacity:1}50%{opacity:.5}}'
  + '#livescore-root .ls-team{display:flex;align-items:center;gap:8px;min-width:0;}'
  + '#livescore-root .ls-team.away{flex-direction:row-reverse;text-align:right;}'
  + '#livescore-root .ls-team .nm{font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}'
  + '#livescore-root .ls-score{font-size:20px;font-weight:900;text-align:center;min-width:56px;letter-spacing:1px;}'
  + '#livescore-root .ls-score.livesc{color:var(--g);}'
  + '#livescore-root .ls-score .vs{font-size:12px;color:var(--muted);font-weight:600;}'
  + '#livescore-root .ls-empty{padding:40px 16px;text-align:center;color:var(--muted);font-size:13px;}'
  + '#livescore-root .ls-spin{width:26px;height:26px;border:3px solid var(--line);border-top-color:var(--g);border-radius:50%;animation:lsSpin .8s linear infinite;margin:0 auto 12px;}'
  + '@keyframes lsSpin{to{transform:rotate(360deg)}}'
  + '#livescore-root .ls-foot{text-align:center;color:var(--muted);font-size:11px;padding:14px;margin-top:10px;}'
  + '#livescore-root .ls-foot a{color:var(--g);text-decoration:none;}'
  + '@media(max-width:560px){#livescore-root .ls-hero h1{font-size:25px}#livescore-root .ls-match{grid-template-columns:50px 1fr auto 1fr;gap:6px;padding:11px 9px}#livescore-root .ls-team .nm{font-size:11px}#livescore-root .ls-score{font-size:17px;min-width:46px}}';
  var st=document.createElement('style'); st.textContent=css; document.head.appendChild(st);
})();

/* ─────────── SHELL ─────────── */
var todayStr = new Date().toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'});
root.innerHTML = ''
+ '<div class="ls-wrap">'
+   '<div class="ls-hero"><div class="ls-kicker">Real Matches • Real Moments</div>'
+     '<h1>LIVE SCORE</h1>'
+     '<p>Semua pertandingan sepak bola dalam satu halaman.<br>Pantau skor terbaru secara real-time.</p>'
+     '<a class="ls-cta" href="'+CTA_LINK+'">'+CTA_TEXT+'</a></div>'
+   '<div class="ls-datebar"><b>Live Score Hari Ini · '+todayStr+'</b><span class="ls-snap">High Traffic Snapshot</span></div>'
+   '<div class="ls-controls">'
+     '<div class="ls-search"><span>⌕</span><input id="ls-q" type="text" placeholder="Cari tim..."></div>'
+     '<div class="ls-filters">'
+       '<button data-f="all" class="active">Semua</button>'
+       '<button data-f="live">LIVE</button>'
+       '<button data-f="finished">Selesai</button>'
+       '<button data-f="upcoming">Jadwal</button>'
+     '</div></div>'
+   '<div class="ls-panel"><div class="ls-phead"><h2>⚽ Football</h2>'
+     '<span class="ls-status" id="ls-status">Memuat...</span>'
+     '<span class="ls-livecount" id="ls-livecount">0 LIVE</span></div>'
+     '<div id="ls-list"><div class="ls-empty"><div class="ls-spin"></div>Memuat live score...</div></div></div>'
+   '<div class="ls-foot">Data snapshot · Powered by <a href="https://sportscore.com/" target="_blank" rel="noopener">SportScore</a></div>'
+ '</div>';

var $list   = root.querySelector('#ls-list');
var $status = root.querySelector('#ls-status');
var $count  = root.querySelector('#ls-livecount');

/* ─────────── FETCH via r.jina.ai ─────────── */
function fetchMarkdown(cb){
  var i=0;
  function tryNext(){
    if(i>=JINA.length){ cb(null); return; }
    var url=JINA[i++](SOURCE_URL);
    $status.textContent='Mengambil data...';
    fetch(url,{cache:'no-store'})
      .then(function(r){ return r.ok ? r.text() : Promise.reject('HTTP '+r.status); })
      .then(function(txt){ if(txt && txt.length>1000){ cb(txt); } else tryNext(); })
      .catch(function(){ tryNext(); });
  }
  tryNext();
}

/* ─────────── PARSER markdown SportScore/jina ───────────
   Pola baris-per-baris:
     LIVE / HT / FT     (status opsional)
     13'                (menit live) atau 11:00 PM (jam upcoming)
     Fluminense - RJ    (tim home; boleh mengandung " - ")
     0-0                (skor; tidak ada utk upcoming)
     CA Platense        (tim away)
   Skor jadi jangkar: tim = baris sebelum & sesudah.
─────────────────────────────────────────────────────────── */
function parseMarkdown(md){
  md = md.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1');   // [teks](url) -> teks
  md = md.replace(/!\[[^\]]*\]\([^)]*\)/g, '');       // buang gambar
  var lines = md.split('\n').map(function(s){return s.trim();}).filter(function(s){return s.length>0;});

  var out=[];
  var STATUS=/^(LIVE|HT|FT|Half\s*Time|Full\s*Time|Finished|Postponed|Post|Canceled|Cancelled|Abandoned|AET|Pen)$/i;
  var MIN=/^\d{1,3}'(\+?\d*'?)?$/;              // 13'  90'+2'
  var CLOCK=/^\d{1,2}:\d{2}\s?(AM|PM)?$/i;      // 11:00 PM
  var SCORE=/^(\d{1,2})\s*[-–]\s*(\d{1,2})$/;   // 0-0  1 - 0
  var NOISE=/^(Skip to|Watch live|Who will win|Search|Popular|Top|All|View all|Odds|Asian|Goals|Corners|1X2|Home|Draw|Away|Live|Scheduled|Finished|EN|Connect|Favourites|Settings|Football|Basketball|Cricket|Tennis|vs|VS)$/i;

  function looksTeam(s){
    if(!s) return false;
    if(s.length<2 || s.length>42) return false;
    if(/^\d/.test(s)) return false;
    if(SCORE.test(s)||MIN.test(s)||CLOCK.test(s)||STATUS.test(s)) return false;
    if(NOISE.test(s)) return false;
    if(/https?:|www\.|@|\.com|\.svg|\.png|%$/i.test(s)) return false;
    if(!/[A-Za-z]/.test(s)) return false;
    return true;
  }

  // 1) pertandingan dgn skor (live / selesai)
  for(var idx=0; idx<lines.length; idx++){
    var sc=lines[idx].match(SCORE);
    if(!sc) continue;
    var home=lines[idx-1], away=lines[idx+1];
    if(!(looksTeam(home) && looksTeam(away))) continue;

    var status='live', label='', time='';
    for(var k=idx-2; k>=Math.max(0,idx-4); k--){
      var p=lines[k]; if(!p) continue;
      if(STATUS.test(p)){
        if(/HT|Half/i.test(p)){status='ht';label='HT';}
        else if(/FT|Full|Finished|AET|Pen/i.test(p)){status='fin';label='FT';}
        else if(/Post|Cancel|Abandon/i.test(p)){status='fin';label=p.toUpperCase();}
        else {status='live';label='LIVE';}
        break;
      }
      if(MIN.test(p)){ status='live'; label=p; break; }
      if(CLOCK.test(p)){ time=p; status='fin'; label='FT'; break; }
    }
    if(!label && status==='live') label='LIVE';
    out.push({home:home,away:away,hs:sc[1],as:sc[2],scored:true,status:status,label:label,time:time,comp:''});
    idx++; // lompati baris away
  }

  // 2) upcoming: [jam] [home] [away] tanpa skor
  for(var j=0; j<lines.length; j++){
    if(!CLOCK.test(lines[j])) continue;
    var h=lines[j+1], a=lines[j+2];
    if(!(looksTeam(h) && looksTeam(a))) continue;
    if(SCORE.test(lines[j+1]||'') || SCORE.test(lines[j+2]||'')) continue;
    var dup=false;
    for(var q=0;q<out.length;q++){ if(out[q].home===h && out[q].away===a){dup=true;break;} }
    if(dup) continue;
    out.push({home:h,away:a,hs:'',as:'',scored:false,status:'sched',label:'JADWAL',time:lines[j],comp:''});
  }

  return dedupe(out);
}

function dedupe(arr){
  var seen={},o=[];
  for(var i=0;i<arr.length;i++){
    var k=(arr[i].home+'|'+arr[i].away).toLowerCase();
    if(seen[k]) continue; seen[k]=1; o.push(arr[i]);
  }
  return o;
}

/* ─────────── RENDER ─────────── */
function render(){
  var q=QUERY.toLowerCase(), rows=[];
  for(var i=0;i<ALL.length;i++){
    var m=ALL[i];
    if(FILTER==='live' && m.status!=='live' && m.status!=='ht') continue;
    if(FILTER==='finished' && m.status!=='fin') continue;
    if(FILTER==='upcoming' && m.status!=='sched') continue;
    if(q && (m.home+' '+m.away).toLowerCase().indexOf(q)<0) continue;
    rows.push(m);
  }
  var order={live:0,ht:1,sched:2,fin:3};
  rows.sort(function(a,b){return order[a.status]-order[b.status];});

  var liveN=0; for(var n=0;n<ALL.length;n++){ if(ALL[n].status==='live'||ALL[n].status==='ht') liveN++; }
  $count.textContent=liveN+' LIVE';

  if(!rows.length){ $list.innerHTML='<div class="ls-empty">Tidak ada pertandingan untuk filter ini.</div>'; return; }

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
      +'<div class="ls-time"><div class="t">'+(m2.time||'--:--')+'</div>'+(stTxt?'<div class="ls-st '+stCls+'">'+stTxt+'</div>':'')+'</div>'
      +'<div class="ls-team home"><span class="nm">'+esc(m2.home)+'</span></div>'
      +score
      +'<div class="ls-team away"><span class="nm">'+esc(m2.away)+'</span></div>'
      +'</div>';
  }
  $list.innerHTML=html;
}
function esc(s){ return (s||'').replace(/[&<>]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;'}[c];}); }

/* ─────────── LOAD LOOP ─────────── */
function load(){
  if(loading) return; loading=true;
  fetchMarkdown(function(md){
    var matches = md ? parseMarkdown(md) : [];
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
var fb=root.querySelectorAll('.ls-filters button');
for(var b=0;b<fb.length;b++){
  fb[b].addEventListener('click',function(){
    for(var x=0;x<fb.length;x++) fb[x].classList.remove('active');
    this.classList.add('active'); FILTER=this.getAttribute('data-f'); render();
  });
}

/* ─────────── GO ─────────── */
load();

})();
