/* ============================================================
   Modal · Toast · Documento/PDF · Bootstrap
   ============================================================ */
function modal(title, bodyHTML, onSave){
  const wrap=document.createElement('div');
  wrap.className='modal-wrap';
  wrap.innerHTML=`<div class="modal glass">
    <div class="between" style="margin-bottom:14px;"><div class="h2">${title}</div><button class="iconbtn" data-x>✕</button></div>
    <div class="modal-body">${bodyHTML}</div>
    <div class="row gap10 mt18" style="justify-content:flex-end;"><button class="btn ghost" data-x>Cancelar</button><button class="btn primary" data-ok>Guardar</button></div>
  </div>`;
  document.body.appendChild(wrap);
  const close=()=>wrap.remove();
  wrap.querySelectorAll('[data-x]').forEach(b=>b.onclick=close);
  wrap.addEventListener('mousedown',e=>{ if(e.target===wrap) close(); });
  wrap.querySelector('[data-ok]').onclick=()=>{ const r=onSave&&onSave(); if(r!==false) close(); };
  const first=wrap.querySelector('input,select,textarea'); if(first) first.focus();
}
window.modal=modal;

function toast(msg){
  let t=document.getElementById('toast');
  if(!t){ t=document.createElement('div'); t.id='toast'; t.className='toast'; document.body.appendChild(t); }
  t.textContent=msg; t.classList.add('show');
  clearTimeout(window.__toast); window.__toast=setTimeout(()=>t.classList.remove('show'),1600);
}
window.toast=toast;

/* ---------- DOCUMENTO / PDF ---------- */
function openDoc(id){
  const q=getQuote(id); if(!q) return;
  const ov=document.createElement('div'); ov.id='docoverlay'; ov.className='doc-overlay';
  ov.innerHTML=`
    <div class="doc-bar">
      <button class="btn ghost" onclick="closeDoc()">‹ Volver al editor</button>
      <div class="row gap10">
        <span class="faint" style="align-self:center;font-size:12px;">${esc(q.folio)} · ${esc((getClient(q.clientId)||{}).name||'')}</span>
        <button class="btn primary" onclick="window.print()">Imprimir / Guardar PDF ↓</button>
      </div>
    </div>
    <div class="doc-scroll"><div class="doc-frame">${buildDocHTML(q)}</div></div>`;
  document.body.appendChild(ov);
  document.body.classList.add('printing-doc');
}
function closeDoc(){ const o=document.getElementById('docoverlay'); if(o)o.remove(); document.body.classList.remove('printing-doc'); }
window.openDoc=openDoc; window.closeDoc=closeDoc;

/* ---------- BOOTSTRAP ---------- */
function updateSyncIndicator(){
  const txt=document.getElementById('synctxt'); const ind=document.getElementById('syncind');
  if(!txt||!ind) return;
  const s=window.getSync?window.getSync():{state:'local',cloud:false};
  const map={ local:'datos locales', hydrating:'sincronizando…', saving:'guardando…', saved:'Supabase conectado', error:'error de conexión' };
  txt.textContent = map[s.state]||'datos locales';
  ind.classList.toggle('cloud', s.cloud && s.state!=='error');
  ind.classList.toggle('err', s.state==='error');
}
window.addEventListener('sync-changed', updateSyncIndicator);
window.addEventListener('db-saved', ()=>{ /* keep indicator fresh */ });

function boot(){
  const items=[
    ['dashboard','Inicio'],['quotes','Cotizaciones'],['catalog','Catálogo'],
    ['clients','Clientes'],['company','Mi empresa']
  ];
  const nv=document.getElementById('appnav-items');
  nv.innerHTML=items.map(([v,l],i)=>`<div class="navitem ${i===0?'on':''}" data-view="${v}" onclick="nav('${v}')"><span class="ic"></span> ${l}</div>`).join('');
  const bl=document.getElementById('logo-blue');
  if(bl){ if(bl.complete && bl.naturalWidth>0) ensureLogo(); else bl.addEventListener('load', ensureLogo); }
  render();
  updateSyncIndicator();
  // conecta a Supabase si hay credenciales; al terminar, re-render con datos de la nube
  if(window.initBackend){ window.initBackend().then(()=>{ render(); updateSyncIndicator(); }).catch(()=>updateSyncIndicator()); }
}
document.addEventListener('DOMContentLoaded', boot);
if(document.readyState!=='loading'){ boot(); }
