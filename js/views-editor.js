/* ============================================================
   Editor de cotización (funcional)
   ============================================================ */
function viewEditor(){
  const q = getQuote(EDIT_QID);
  if(!q) return `<div class="glass pad center faint">Cotización no encontrada. <button class="btn sm" onclick="nav('quotes')">Volver</button></div>`;
  const t = quoteTotals(q);
  const clientOpts = DB.clients.map(c=>`<option value="${c.id}" ${c.id===q.clientId?'selected':''}>${esc(c.name)}</option>`).join('');
  const catOpts = DB.catalog.map(p=>`<option value="${p.id}">${esc(p.name)} · ${CLP(p.price)}</option>`).join('');

  const itemRows = (q.items||[]).map((it,i)=>`
    <tr>
      <td>
        <input class="cell" value="${escAttr(it.name)}" oninput="upItem(${i},'name',this.value)" placeholder="Descripción">
        <input class="cell sub" value="${escAttr(it.desc||'')}" oninput="upItem(${i},'desc',this.value)" placeholder="Detalle (opcional)">
      </td>
      <td><input class="cell num" type="number" min="0" value="${it.qty}" oninput="upItem(${i},'qty',+this.value)"></td>
      <td><input class="cell num" type="number" min="0" value="${it.price}" oninput="upItem(${i},'price',+this.value)"></td>
      <td><input class="cell num" type="number" min="0" max="100" value="${it.disc||0}" oninput="upItem(${i},'disc',+this.value)"></td>
      <td class="num" id="lt-${i}">${CLP(lineTotal(it))}</td>
      <td class="right"><button class="iconbtn" onclick="rmItem(${i})">✕</button></td>
    </tr>`).join('');

  return `
  <div class="screen-head between wrap">
    <div>
      <div class="eyebrow">// Composición · ${esc(q.folio)}</div>
      <div class="screen-title">Editor de cotización</div>
    </div>
    <div class="row gap10">
      <button class="btn ghost" onclick="nav('quotes')">‹ Volver</button>
      <button class="btn" onclick="openDoc('${q.id}')">Vista PDF</button>
      <button class="btn primary" onclick="saveQuote()">Guardar</button>
    </div>
  </div>

  <div class="row gap20 wrap" style="align-items:flex-start;">
    <div class="grow col" style="min-width:320px;">
      <div class="glass glass-2 pad-lg">
        <div class="form-grid">
          <div class="fg"><span class="lbl">Cliente</span>
            <div class="row gap6"><select class="inp" onchange="upQuote('clientId',this.value)">${clientOpts}</select>
            <button class="btn sm ghost" onclick="nav('clients')">＋</button></div></div>
          <div class="fg"><span class="lbl">Proyecto / asunto</span><input class="inp" value="${escAttr(q.project||'')}" oninput="upQuote('project',this.value)" placeholder="Ej. Sistema CCTV 8 cámaras"></div>
          <div class="fg"><span class="lbl">Fecha emisión</span><input class="inp" type="date" value="${q.date}" oninput="upQuote('date',this.value)"></div>
          <div class="fg"><span class="lbl">Válida hasta</span><input class="inp" type="date" value="${q.validUntil}" oninput="upQuote('validUntil',this.value)"></div>
          <div class="fg"><span class="lbl">Forma de pago</span><input class="inp" value="${escAttr(q.payment||'')}" oninput="upQuote('payment',this.value)"></div>
          <div class="fg"><span class="lbl">Plazo de ejecución</span><input class="inp" value="${escAttr(q.leadTime||'')}" oninput="upQuote('leadTime',this.value)"></div>
        </div>
      </div>

      <div class="glass glass-2 pad-lg">
        <div class="between"><div class="h2">Ítems</div>
          <div class="row gap6">
            <select class="inp sm" id="catpick" style="width:230px;"><option value="">＋ Desde catálogo…</option>${catOpts}</select>
            <button class="btn sm" onclick="addFromCatalog()">Agregar</button>
            <button class="btn sm ghost" onclick="addBlankItem()">＋ Línea libre</button>
          </div>
        </div>
        <table class="edit-tbl mt14"><thead><tr><th>Descripción</th><th class="num">Cant</th><th class="num">P. unit</th><th class="num">Desc %</th><th class="num">Total</th><th></th></tr></thead>
        <tbody>${itemRows||'<tr><td colspan="6" class="faint center" style="padding:18px;">Sin ítems — agrega desde el catálogo o una línea libre</td></tr>'}</tbody></table>
      </div>

      <div class="glass glass-2 pad-lg">
        <div class="fg"><span class="lbl">Notas adicionales (opcional)</span><textarea class="inp" oninput="upQuote('notes',this.value)" placeholder="Texto extra que aparece bajo las condiciones">${esc(q.notes||'')}</textarea></div>
      </div>
    </div>

    <div class="col" style="width:280px; flex:none;">
      <div class="glass pad" id="sumbox">${summaryHTML(t)}</div>
      <div class="glass pad">
        <div class="lbl">Estado</div>
        ${statusSelect(q)}
        <button class="btn primary fill mt10" style="justify-content:center;" onclick="openDoc('${q.id}')">Generar PDF</button>
      </div>
    </div>
  </div>`;
}

function summaryHTML(t){
  return `<div class="lbl">Resumen en vivo</div>
    <div class="between mt10"><span class="muted">Subtotal bruto</span><span class="num">${CLP(t.gross)}</span></div>
    <div class="between mt6"><span class="muted">Descuento</span><span class="num">– ${CLP(t.disc)}</span></div>
    <div class="between mt6"><span class="muted">Neto</span><span class="num">${CLP(t.net)}</span></div>
    <div class="between mt6"><span class="muted">IVA ${DB.company.iva||19}%</span><span class="num">${CLP(t.iva)}</span></div>
    <div class="between mt10" style="border-top:1px solid var(--stroke-2);padding-top:10px;"><b>Total</b><b class="big accent" style="font-size:22px;">${CLP(t.total)}</b></div>`;
}

function upQuote(k,v){ const q=getQuote(EDIT_QID); if(q){ q[k]=v; save(); } }
function upItem(i,k,v){ const q=getQuote(EDIT_QID); if(q&&q.items[i]){ q.items[i][k]=v; save();
  const lt=document.getElementById('lt-'+i); if(lt) lt.textContent=CLP(lineTotal(q.items[i]));
  refreshSummary();
} }
function refreshSummary(){ const box=document.getElementById('sumbox'); const q=getQuote(EDIT_QID); if(box&&q) box.innerHTML=summaryHTML(quoteTotals(q)); }
function rmItem(i){ const q=getQuote(EDIT_QID); if(q){ q.items.splice(i,1); save(); render(); } }
function addBlankItem(){ const q=getQuote(EDIT_QID); q.items.push({name:'',desc:'',qty:1,price:0,disc:0}); save(); render(); }
function addFromCatalog(){ const sel=document.getElementById('catpick'); const p=DB.catalog.find(x=>x.id===sel.value); if(!p) return;
  const q=getQuote(EDIT_QID); q.items.push({name:p.name,desc:p.desc||'',qty:1,price:p.price,disc:0}); save(); render(); }
function saveQuote(){ save(); toast('Cotización guardada'); }
window.upQuote=upQuote; window.upItem=upItem; window.rmItem=rmItem; window.refreshSummary=refreshSummary;
window.addBlankItem=addBlankItem; window.addFromCatalog=addFromCatalog; window.saveQuote=saveQuote;

function escAttr(s){ return String(s==null?'':s).replace(/"/g,'&quot;').replace(/</g,'&lt;'); }
window.escAttr=escAttr;
