/* ============================================================
   Clientes · Catálogo · Mi empresa
   ============================================================ */

/* ---------- CLIENTES ---------- */
function viewClients(){
  const rows = DB.clients.map(c=>{
    const n = DB.quotes.filter(q=>q.clientId===c.id).length;
    return `<tr>
      <td><b>${esc(c.name)}</b><div class="faint mono" style="font-size:11px;">RUT ${esc(c.rut||'—')}</div></td>
      <td class="muted" style="font-size:12.5px;">${esc(c.contact||'')}<div class="faint" style="font-size:11.5px;">${esc(c.email||'')} · ${esc(c.phone||'')}</div></td>
      <td class="muted" style="font-size:12.5px;">${esc(c.address||'')}</td>
      <td class="num">${n}</td>
      <td class="right" style="white-space:nowrap;">
        <button class="btn sm ghost" onclick="editClient('${c.id}')">Editar</button>
        <button class="btn sm ghost danger" onclick="delClient('${c.id}')">✕</button>
      </td></tr>`;
  }).join('');
  return `
  <div class="screen-head between wrap">
    <div><div class="eyebrow">// Cartera</div><div class="screen-title">Clientes</div></div>
    <button class="btn primary" onclick="editClient()">＋ Nuevo cliente</button>
  </div>
  <div class="glass" style="overflow:hidden;">
    <table class="tbl"><thead><tr><th>Cliente</th><th>Contacto</th><th>Dirección</th><th class="num">Cotiz.</th><th></th></tr></thead>
    <tbody>${rows||'<tr><td colspan="5" class="faint center pad">Sin clientes</td></tr>'}</tbody></table>
  </div>`;
}
function editClient(id){
  const c = id? getClient(id) : {id:'',name:'',rut:'',address:'',contact:'',email:'',phone:''};
  modal(`${id?'Editar':'Nuevo'} cliente`, `
    <div class="form-grid">
      <div class="fg" style="grid-column:1/-1;"><span class="lbl">Nombre / razón social</span><input class="inp" id="m_name" value="${escAttr(c.name)}"></div>
      <div class="fg"><span class="lbl">RUT</span><input class="inp" id="m_rut" value="${escAttr(c.rut)}"></div>
      <div class="fg"><span class="lbl">Teléfono</span><input class="inp" id="m_phone" value="${escAttr(c.phone)}"></div>
      <div class="fg" style="grid-column:1/-1;"><span class="lbl">Dirección</span><input class="inp" id="m_address" value="${escAttr(c.address)}"></div>
      <div class="fg"><span class="lbl">Contacto</span><input class="inp" id="m_contact" value="${escAttr(c.contact)}"></div>
      <div class="fg"><span class="lbl">Email</span><input class="inp" id="m_email" value="${escAttr(c.email)}"></div>
    </div>`,
    ()=>{
      const get=k=>document.getElementById('m_'+k).value;
      if(!get('name').trim()){ alert('Nombre requerido'); return false; }
      if(id){ Object.assign(c,{name:get('name'),rut:get('rut'),address:get('address'),contact:get('contact'),email:get('email'),phone:get('phone')}); }
      else { DB.clients.push({id:uid(),name:get('name'),rut:get('rut'),address:get('address'),contact:get('contact'),email:get('email'),phone:get('phone')}); }
      save(); render();
    });
}
function delClient(id){ if(confirm('¿Eliminar cliente?')){ DB.clients=DB.clients.filter(c=>c.id!==id); save(); render(); } }
window.editClient=editClient; window.delClient=delClient;

/* ---------- CATÁLOGO ---------- */
function viewCatalog(){
  const rows = DB.catalog.map(p=>{
    const margin = p.cost? Math.round((1-p.cost/p.price)*100)+'%' : '—';
    return `<tr>
      <td><b>${esc(p.name)}</b><div class="faint" style="font-size:11.5px;">${esc(p.desc||'')}</div></td>
      <td><span class="chip" style="font-size:10.5px;padding:3px 9px;">${esc(p.cat)}</span></td>
      <td class="mono faint">${esc(p.sku||'')}</td>
      <td class="num muted">${p.cost?CLP(p.cost):'—'}</td>
      <td class="num"><b>${CLP(p.price)}</b></td>
      <td class="num signal">${margin}</td>
      <td class="right" style="white-space:nowrap;">
        <button class="btn sm ghost" onclick="editProduct('${p.id}')">Editar</button>
        <button class="btn sm ghost danger" onclick="delProduct('${p.id}')">✕</button>
      </td></tr>`;
  }).join('');
  return `
  <div class="screen-head between wrap">
    <div><div class="eyebrow">// Biblioteca</div><div class="screen-title">Catálogo</div></div>
    <button class="btn primary" onclick="editProduct()">＋ Nuevo producto</button>
  </div>
  <div class="glass" style="overflow:hidden;">
    <table class="tbl"><thead><tr><th>Producto</th><th>Categoría</th><th>SKU</th><th class="num">Costo</th><th class="num">Precio</th><th class="num">Margen</th><th></th></tr></thead>
    <tbody>${rows||'<tr><td colspan="7" class="faint center pad">Sin productos</td></tr>'}</tbody></table>
  </div>`;
}
function editProduct(id){
  const p = id? DB.catalog.find(x=>x.id===id) : {id:'',name:'',desc:'',cat:'CCTV',sku:'',cost:0,price:0};
  const cats=['CCTV','Alarmas','Control de acceso','Redes','Servicios'];
  modal(`${id?'Editar':'Nuevo'} producto`, `
    <div class="form-grid">
      <div class="fg" style="grid-column:1/-1;"><span class="lbl">Nombre</span><input class="inp" id="m_name" value="${escAttr(p.name)}"></div>
      <div class="fg" style="grid-column:1/-1;"><span class="lbl">Descripción</span><input class="inp" id="m_desc" value="${escAttr(p.desc)}"></div>
      <div class="fg"><span class="lbl">Categoría</span><select class="inp" id="m_cat">${cats.map(c=>`<option ${c===p.cat?'selected':''}>${c}</option>`).join('')}</select></div>
      <div class="fg"><span class="lbl">SKU</span><input class="inp" id="m_sku" value="${escAttr(p.sku)}"></div>
      <div class="fg"><span class="lbl">Costo (CLP)</span><input class="inp" type="number" id="m_cost" value="${p.cost||0}"></div>
      <div class="fg"><span class="lbl">Precio venta (CLP)</span><input class="inp" type="number" id="m_price" value="${p.price||0}"></div>
    </div>`,
    ()=>{
      const get=k=>document.getElementById('m_'+k).value;
      if(!get('name').trim()){ alert('Nombre requerido'); return false; }
      const data={name:get('name'),desc:get('desc'),cat:get('cat'),sku:get('sku'),cost:+get('cost'),price:+get('price')};
      if(id){ Object.assign(p,data); } else { DB.catalog.push({id:uid(),...data}); }
      save(); render();
    });
}
function delProduct(id){ if(confirm('¿Eliminar producto?')){ DB.catalog=DB.catalog.filter(p=>p.id!==id); save(); render(); } }
window.editProduct=editProduct; window.delProduct=delProduct;

/* ---------- MI EMPRESA ---------- */
function viewCompany(){
  const c=DB.company;
  const f=(k,label,opts={})=>`<div class="fg" ${opts.full?'style="grid-column:1/-1;"':''}><span class="lbl">${label}</span>${opts.area?`<textarea class="inp" oninput="upCo('${k}',this.value)">${esc(c[k]||'')}</textarea>`:`<input class="inp ${opts.mono?'mono':''}" type="${opts.type||'text'}" value="${escAttr(c[k]||'')}" oninput="upCo('${k}',${opts.type==='number'?'+this.value':'this.value'})">`}</div>`;
  return `
  <div class="screen-head between wrap">
    <div><div class="eyebrow">// Configuración</div><div class="screen-title">Mi empresa</div></div>
    <span class="chip accepted" id="savedchip" style="opacity:0;"><span class="dot"></span> Guardado</span>
  </div>
  <div class="row gap20 wrap" style="align-items:flex-start;">
    <div class="col grow" style="min-width:320px;">
      <div class="glass glass-2 pad-lg">
        <div class="h2">Identidad</div>
        <div class="form-grid mt14">
          ${f('name','Razón social',{full:true})}
          ${f('rut','RUT')} ${f('iva','IVA %',{type:'number',mono:true})}
          ${f('giro','Giro',{full:true})}
        </div>
      </div>
      <div class="glass glass-2 pad-lg">
        <div class="h2">Contacto</div>
        <div class="form-grid mt14">
          ${f('address','Dirección',{full:true})}
          ${f('phone','Teléfono / WhatsApp')} ${f('email','Correo')}
          ${f('web','Sitio web',{full:true})}
        </div>
      </div>
      <div class="glass glass-2 pad-lg">
        <div class="h2">Datos bancarios <span class="faint mono" style="font-size:11px;">· pie del PDF</span></div>
        <div class="form-grid mt14">
          ${f('bankName','Banco')} ${f('bankType','Tipo de cuenta')}
          ${f('bankAccount','N° de cuenta',{mono:true})} ${f('bankRut','RUT titular',{mono:true})}
          ${f('bankEmail','Email comprobantes',{full:true})}
        </div>
      </div>
      <div class="glass glass-2 pad-lg">
        <div class="h2">Documento por defecto</div>
        <div class="form-grid mt14">
          ${f('validityDays','Validez (días)',{type:'number',mono:true})} ${f('folioPrefix','Prefijo de folio',{mono:true})}
          ${f('terms','Condiciones / términos',{full:true,area:true})}
        </div>
      </div>
      <div class="glass glass-2 pad-lg">
        <div class="h2">Datos y sincronización</div>
        <div id="connstatus" class="row gap8 center-x" style="margin:8px 0 12px;">${connStatusHTML()}</div>
        <div class="muted" style="font-size:12.5px;margin-bottom:12px;">En modo local, los datos se guardan solo en este navegador. Con Supabase configurado, se sincronizan en la nube para todos los equipos.</div>
        <div class="row gap10 wrap">
          <button class="btn" onclick="exportDB()">↓ Exportar respaldo</button>
          <label class="btn ghost" style="cursor:pointer;">↑ Importar respaldo<input type="file" accept="application/json" style="display:none;" onchange="if(this.files[0])importDB(this.files[0])"></label>
          <button class="btn ghost danger" onclick="if(confirm('Esto borra todos los datos y restaura el ejemplo. ¿Continuar?'))resetDB()">Restablecer</button>
        </div>
      </div>
    </div>

    <div class="col" style="width:300px; flex:none;">
      <div class="lbl" style="padding-left:2px;">Vista previa del encabezado</div>
      <div class="glass" style="overflow:hidden;">
        <div style="background:var(--doc-navy,#1c2233);padding:16px;">
          <img src="assets/bytec-logo-white.png" alt="ByTEC" style="height:40px;display:block;margin-bottom:10px;">
          <div class="disp" style="font-weight:600;font-size:15px;color:#fff;" id="pv_name">${esc(c.name)}</div>
          <div style="font-size:10.5px;color:#aeb3c4;" id="pv_giro">${esc(c.giro)}</div>
          <div class="mono" style="font-size:10px;color:#aeb3c4;margin-top:3px;">RUT <span id="pv_rut">${esc(c.rut)}</span></div>
        </div>
        <div class="pad"><div class="faint mono" style="font-size:10px;">// pie</div>
          <div class="muted mt6" style="font-size:11.5px;line-height:1.7;"><span id="pv_bank">${esc(c.bankName)}</span> · <span id="pv_acc">${esc(c.bankAccount)}</span><br><span id="pv_web">${esc(c.web)}</span></div></div>
      </div>
      <div class="glass glass-2 pad"><div class="row gap8 center-x"><span class="ic-box accent">✓</span><span style="font-size:12.5px;">Cambios guardados automáticamente.</span></div></div>
    </div>
  </div>`;
}
function upCo(k,v){ DB.company[k]=v; save();
  const map={name:'pv_name',giro:'pv_giro',rut:'pv_rut',bankName:'pv_bank',bankAccount:'pv_acc',web:'pv_web'};
  if(map[k]){ const el=document.getElementById(map[k]); if(el) el.textContent=v; }
  const chip=document.getElementById('savedchip'); if(chip){ chip.style.opacity=1; clearTimeout(window.__chip); window.__chip=setTimeout(()=>chip.style.opacity=0,900); }
}
window.upCo=upCo;

function connStatusHTML(){
  const s=window.getSync?window.getSync():{state:'local',cloud:false};
  if(s.state==='error') return `<span class="conn-dot err"></span> <b>Error de conexión a Supabase</b> <span class="faint">— revisa credenciales y el SQL</span>`;
  if(s.cloud) return `<span class="conn-dot on"></span> <b>Supabase conectado</b> <span class="faint">— sincronizando en la nube</span>`;
  return `<span class="conn-dot off"></span> <b>Modo local</b> <span class="faint">— configura js/config.js para usar Supabase</span>`;
}
window.connStatusHTML=connStatusHTML;
window.addEventListener('sync-changed', ()=>{ const el=document.getElementById('connstatus'); if(el) el.innerHTML=connStatusHTML(); });
