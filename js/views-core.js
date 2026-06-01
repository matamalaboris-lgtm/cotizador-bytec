/* ============================================================
   Vistas + interacción
   ============================================================ */
const app = ()=> document.getElementById('view');
let CURRENT = 'dashboard';
let EDIT_QID = null; // quote being edited

function nav(view){
  CURRENT = view;
  document.querySelectorAll('.navitem[data-view]').forEach(n=> n.classList.toggle('on', n.dataset.view===view));
  render();
  document.querySelector('.stage').scrollTop = 0;
}
window.nav = nav;

function render(){
  const v = app();
  if(CURRENT==='dashboard') v.innerHTML = viewDashboard();
  else if(CURRENT==='quotes') v.innerHTML = viewQuotes();
  else if(CURRENT==='editor') v.innerHTML = viewEditor();
  else if(CURRENT==='clients') v.innerHTML = viewClients();
  else if(CURRENT==='catalog') v.innerHTML = viewCatalog();
  else if(CURRENT==='company') v.innerHTML = viewCompany();
}
window.render = render;

/* ---------- DASHBOARD ---------- */
function viewDashboard(){
  const qs = DB.quotes;
  const monthTotal = qs.reduce((s,q)=> s+quoteTotals(q).total, 0);
  const accepted = qs.filter(q=>q.status==='accepted').length;
  const pending = qs.filter(q=>['sent','viewed'].includes(q.status));
  const pendTotal = pending.reduce((s,q)=>s+quoteTotals(q).total,0);
  const rate = qs.length? Math.round(accepted/qs.length*100):0;
  const counts = {};
  Object.keys(STATUS).forEach(k=> counts[k]=qs.filter(q=>q.status===k).length);

  const rows = qs.slice().sort((a,b)=> (b.date||'').localeCompare(a.date||'')).slice(0,6).map(q=>{
    const cl = getClient(q.clientId); const st = STATUS[q.status];
    return `<tr onclick="openQuote('${q.id}')" style="cursor:pointer;">
      <td class="mono accent">#${esc((q.folio||'').replace(/^\D+/,''))}</td>
      <td>${esc(cl?cl.name:'—')}<div class="faint" style="font-size:11.5px;">${esc(q.project||'')}</div></td>
      <td><span class="chip ${st.cls}"><span class="dot"></span> ${st.label}</span></td>
      <td class="num">${CLP(quoteTotals(q).total)}</td>
      <td class="right"><span class="faint">›</span></td>
    </tr>`;
  }).join('');

  return `
  <div class="screen-head between wrap">
    <div><div class="eyebrow">// Centro de control</div><div class="screen-title">Panel</div></div>
    <button class="btn primary" onclick="newQuote()">＋ Nueva cotización</button>
  </div>
  <div class="kpis">
    <div class="glass glass-2 kpi pad"><div class="lbl">Cotizado · total</div><div class="big">${CLP(monthTotal)}</div><div class="trend muted">${qs.length} documentos</div></div>
    <div class="glass glass-2 kpi pad"><div class="lbl">Tasa de cierre</div><div class="big signal">${rate}%</div><div class="meter mt14"><i style="width:${rate}%"></i></div></div>
    <div class="glass glass-2 kpi pad"><div class="lbl">Pendientes</div><div class="big">${pending.length}</div><div class="trend muted">${CLP(pendTotal)} en juego</div></div>
    <div class="glass glass-2 kpi pad"><div class="lbl">Aceptadas</div><div class="big">${accepted}</div><div class="trend signal">de ${qs.length} emitidas</div></div>
  </div>

  <div class="row wrap gap6 mt18">
    ${Object.keys(STATUS).map(k=>`<span class="chip ${STATUS[k].cls}"><span class="dot"></span> ${STATUS[k].label} · ${counts[k]}</span>`).join('')}
  </div>

  <div class="glass mt18" style="overflow:hidden;">
    <div class="between pad" style="padding-bottom:6px;"><div class="h2">Actividad reciente</div><button class="btn sm ghost" onclick="nav('quotes')">Ver todas ›</button></div>
    <table class="tbl"><thead><tr><th>Folio</th><th>Cliente</th><th>Estado</th><th class="num">Total</th><th></th></tr></thead>
    <tbody>${rows||'<tr><td colspan="5" class="faint center pad">Sin cotizaciones aún</td></tr>'}</tbody></table>
  </div>`;
}

/* ---------- QUOTES LIST ---------- */
function viewQuotes(){
  const rows = DB.quotes.slice().sort((a,b)=>(b.date||'').localeCompare(a.date||'')).map(q=>{
    const cl = getClient(q.clientId); const st = STATUS[q.status];
    return `<tr>
      <td class="mono accent" onclick="openQuote('${q.id}')" style="cursor:pointer;">#${esc((q.folio||'').replace(/^\D+/,''))}</td>
      <td onclick="openQuote('${q.id}')" style="cursor:pointer;">${esc(cl?cl.name:'—')}<div class="faint" style="font-size:11.5px;">${esc(q.project||'')}</div></td>
      <td>${statusSelect(q)}</td>
      <td class="faint mono" style="font-size:11.5px;">${fmtDate(q.date)}</td>
      <td class="num">${CLP(quoteTotals(q).total)}</td>
      <td class="right" style="white-space:nowrap;">
        <button class="btn sm ghost" onclick="openQuote('${q.id}')">Editar</button>
        <button class="btn sm" onclick="openDoc('${q.id}')">PDF</button>
        <button class="btn sm ghost danger" onclick="delQuote('${q.id}')">✕</button>
      </td>
    </tr>`;
  }).join('');
  return `
  <div class="screen-head between wrap">
    <div><div class="eyebrow">// Documentos</div><div class="screen-title">Cotizaciones</div></div>
    <button class="btn primary" onclick="newQuote()">＋ Nueva cotización</button>
  </div>
  <div class="glass" style="overflow:hidden;">
    <table class="tbl"><thead><tr><th>Folio</th><th>Cliente</th><th>Estado</th><th>Fecha</th><th class="num">Total</th><th></th></tr></thead>
    <tbody>${rows||'<tr><td colspan="6" class="faint center pad">Sin cotizaciones — crea la primera</td></tr>'}</tbody></table>
  </div>`;
}
function statusSelect(q){
  return `<select class="mini-select ${STATUS[q.status].cls}" onchange="setStatus('${q.id}', this.value)">
    ${Object.keys(STATUS).map(k=>`<option value="${k}" ${k===q.status?'selected':''}>${STATUS[k].label}</option>`).join('')}
  </select>`;
}
function setStatus(id, s){ const q=getQuote(id); if(q){ q.status=s; save(); render(); } }
function delQuote(id){ if(confirm('¿Eliminar esta cotización?')){ DB.quotes=DB.quotes.filter(q=>q.id!==id); save(); render(); } }
window.setStatus=setStatus; window.delQuote=delQuote;

function newQuote(){
  const q = { id:uid(), folio:newFolio(), clientId:(DB.clients[0]||{}).id||'', project:'',
    date:todayISO(), validUntil:addDaysISO(todayISO(), DB.company.validityDays||15),
    status:'draft', payment:'50% anticipo, saldo contra entrega', leadTime:'5 días hábiles', items:[], notes:'' };
  DB.quotes.push(q); save(); openQuote(q.id);
}
function openQuote(id){ EDIT_QID=id; nav('editor'); }
window.newQuote=newQuote; window.openQuote=openQuote;
