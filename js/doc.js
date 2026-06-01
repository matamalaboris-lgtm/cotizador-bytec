/* ============================================================
   Documento Carta para imprimir / PDF — parametrizado
   ============================================================ */
let LOGO_DATA = null;
function toDataURL(img){
  try{
    const cv=document.createElement('canvas');
    cv.width=img.naturalWidth; cv.height=img.naturalHeight;
    cv.getContext('2d').drawImage(img,0,0);
    return cv.toDataURL('image/png');
  }catch(e){ return null; }
}
function ensureLogo(){
  if(LOGO_DATA) return LOGO_DATA;
  const el=document.getElementById('logo-blue');
  if(el && el.complete && el.naturalWidth>0){ LOGO_DATA = toDataURL(el) || el.src; }
  return LOGO_DATA || (el && el.src) || 'assets/bytec-logo.png';
}
window.ensureLogo = ensureLogo;

function buildDocHTML(q){
  const c = DB.company;
  const LOGO = ensureLogo();
  const cl = getClient(q.clientId) || {name:'—', rut:'', address:'', contact:''};
  const t = quoteTotals(q);
  const rows = (q.items||[]).map(it=>`
    <tr>
      <td><div class="it-name">${esc(it.name)}</div>${it.desc?`<div class="it-desc">${esc(it.desc)}</div>`:''}</td>
      <td class="num">${it.qty}</td>
      <td class="num">${CLP(it.price)}</td>
      <td class="num">${it.disc?`<span class="pill">${it.disc}%</span>`:'—'}</td>
      <td class="num">${CLP(lineTotal(it))}</td>
    </tr>`).join('');

  return `<div class="doc-page">
    <div class="accent-top"></div>
    <div class="head">
      <img class="logo" src="${LOGO}" alt="${esc(c.name)}">
      <div class="right">
        <div class="doc-kicker">Cotización</div>
        <div class="doc-no">N° ${esc((q.folio||'').replace(/^\D+/,''))}</div>
        <div class="doc-dates">Emitida<b>${fmtDate(q.date)}</b><br>Válida hasta<b>${fmtDate(q.validUntil)}</b></div>
      </div>
    </div>

    <div class="co">
      <div>
        <div class="co-name">${esc(c.name)}</div>
        <div class="co-giro">${esc(c.giro)} · RUT ${esc(c.rut)}</div>
      </div>
      <div class="co-contact">${esc(c.address)}<br><b>${esc(c.phone)}</b> · ${esc(c.email)}<br>${esc(c.web)}</div>
    </div>

    <div class="doc-body">
      <div class="parties">
        <div class="party pr">
          <div class="lbl">Cliente</div>
          <div class="pname">${esc(cl.name)}</div>
          <div class="pmeta">${cl.rut?`RUT ${esc(cl.rut)}<br>`:''}${esc(cl.address||'')}${cl.contact?`<br>Atención: ${esc(cl.contact)}`:''}</div>
        </div>
        <div class="party pl">
          <div class="lbl">Proyecto</div>
          <div class="pname">${esc(q.project||'Propuesta de servicios')}</div>
          <div class="pmeta">${q.leadTime?`Plazo de ejecución: ${esc(q.leadTime)}<br>`:''}${q.payment?`Forma de pago: ${esc(q.payment)}`:''}</div>
        </div>
      </div>

      <table class="items">
        <thead><tr>
          <th style="width:48%">Descripción</th>
          <th class="r">Cant.</th><th class="r">P. unitario</th><th class="r">Desc.</th><th class="r">Total</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>

      <div class="summary">
        <div class="terms">
          <div class="lbl">Condiciones</div>
          <div class="terms-body">${esc(c.terms)}</div>
          ${q.notes?`<div class="terms-body" style="margin-top:8px;">${esc(q.notes)}</div>`:''}
          <div class="note-chip"><span class="d"></span> Documento generado el ${fmtDate(q.date)} · folio ${esc(q.folio)}</div>
        </div>
        <div class="totals">
          <div class="trow"><span>Subtotal bruto</span><span class="v">${CLP(t.gross)}</span></div>
          <div class="trow"><span>Descuento</span><span class="v">– ${CLP(t.disc)}</span></div>
          <div class="trow"><span>Neto afecto</span><span class="v">${CLP(t.net)}</span></div>
          <div class="trow"><span>IVA ${c.iva||19}%</span><span class="v">${CLP(t.iva)}</span></div>
          <div class="total">
            <div><div class="t-lbl">Total a pagar</div><div class="t-sub">IVA incluido</div></div>
            <div class="t-val">${CLP(t.total)}</div>
          </div>
        </div>
      </div>

      <div class="strip">
        <div class="bank">
          <div class="lbl" style="margin-bottom:8px;">Datos para transferencia</div>
          <div class="brow"><span class="k">Titular</span><span class="v">${esc(c.name)}</span></div>
          <div class="brow"><span class="k">RUT</span><span class="v mono">${esc(c.bankRut)}</span></div>
          <div class="brow"><span class="k">Banco</span><span class="v">${esc(c.bankName)}</span></div>
          <div class="brow"><span class="k">${esc(c.bankType)}</span><span class="v mono">${esc(c.bankAccount)}</span></div>
          <div class="brow"><span class="k">Email comprobantes</span><span class="v">${esc(c.bankEmail)}</span></div>
        </div>
        <div class="sign">
          <div class="ln"></div>
          <div class="who"><b>Aceptación del cliente</b><br><span>Firma y fecha</span></div>
        </div>
      </div>
    </div>

    <div class="foot">
      <img class="logo-sm" src="${LOGO}" alt="Bytec">
      <span>Seguridad electrónica · CCTV · Alarmas · Control de acceso · Redes</span>
      <span class="mono">${esc(c.web)}</span>
    </div>
  </div>`;
}

function esc(s){ return String(s==null?'':s).replace(/[&<>"]/g, m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m])); }

window.buildDocHTML = buildDocHTML;
