/* ============================================================
   Bytec Cotizador — capa de datos
   Modo LOCAL (localStorage) por defecto.
   Modo NUBE (Supabase) si js/config.js trae credenciales.
   ============================================================ */
const DB_KEY = 'bytec_cotizador_v1';
const CFG = window.BYTEC_CONFIG || {};
let supa = null;
let CLOUD = false;
let SYNC = 'local';   // local | hydrating | saving | saved | error

const SEED = {
  company: {
    name:'Bytec Security SpA', rut:'77.133.642-6',
    giro:'Servicios de seguridad electrónica e instalación',
    address:'Colono Benito Ampuero, Puerto Montt',
    phone:'+56 9 9294 7511', email:'contacto@bytecsecurity.cl', web:'www.bytecsecurity.cl',
    bankName:'Banco Estado', bankType:'Cuenta Corriente', bankAccount:'82200007839',
    bankRut:'77.133.642-6', bankEmail:'contacto@bytecsecurity.cl',
    validityDays:15, folioPrefix:'COT-',
    terms:'Garantía de 12 meses sobre equipos contra fallas de fábrica. Valores expresados en pesos chilenos (CLP). Esta cotización no constituye reserva de stock hasta la recepción del anticipo. Precios sujetos a cambio una vez vencida la validez.',
    nextFolio:1044, iva:19
  },
  catalog: [
    { id:'p1', name:'Cámara IP domo 4MP exterior', desc:'Visión nocturna 30 m · IP67 · lente 2.8 mm', cat:'CCTV', sku:'CAM-D4M', cost:41000, price:74900 },
    { id:'p2', name:'Cámara bullet 8MP varifocal', desc:'Zoom motorizado · WDR · IP67', cat:'CCTV', sku:'CAM-B8M', cost:78000, price:129000 },
    { id:'p3', name:'NVR 16 canales + disco 4TB', desc:'Grabación continua 24/7 · acceso remoto', cat:'CCTV', sku:'NVR-16-4T', cost:198000, price:329000 },
    { id:'p4', name:'Panel de alarma DSC PowerSeries', desc:'Hasta 16 zonas · app móvil', cat:'Alarmas', sku:'ALM-DSC', cost:72000, price:129000 },
    { id:'p5', name:'Sensor PIR inalámbrico', desc:'Inmune a mascotas · 12 m', cat:'Alarmas', sku:'ALM-PIR', cost:9500, price:18900 },
    { id:'p6', name:'Cerradura magnética 600 lb', desc:'Fail-safe · soporte L/Z incluido', cat:'Control de acceso', sku:'ACC-MAG6', cost:28000, price:54000 },
    { id:'p7', name:'Switch PoE 8 puertos gigabit', desc:'120W · gestionable', cat:'Redes', sku:'NET-PoE8', cost:49000, price:89000 },
    { id:'p8', name:'Instalación y configuración', desc:'Canalización, tendido, configuración y capacitación', cat:'Servicios', sku:'SRV-INST', cost:0, price:35000 },
  ],
  clients: [
    { id:'c1', name:'Condominio Las Encinas', rut:'76.555.111-2', address:'Av. Las Encinas 2200, Las Condes, RM', contact:'Sr. Pérez · Administración', email:'perez@encinas.cl', phone:'+56 2 2345 6789' },
    { id:'c2', name:'Farmacia Vida SpA', rut:'77.222.333-4', address:'Av. Central 145, Puerto Montt', contact:'Sra. Díaz', email:'contacto@farmaciavida.cl', phone:'+56 65 255 1234' },
    { id:'c3', name:'Colegio San Marcos', rut:'70.888.999-1', address:'Los Aromos 90, Puerto Varas', contact:'Dpto. Administración', email:'admin@sanmarcos.cl', phone:'+56 65 233 4455' },
  ],
  quotes: [
    { id:'q1', folio:'COT-1043', clientId:'c1', project:'Sistema CCTV — 8 cámaras + grabador',
      date:'2026-05-31', validUntil:'2026-06-15', status:'sent',
      payment:'50% anticipo, saldo contra entrega', leadTime:'5 días hábiles',
      items:[
        { name:'Cámara IP domo 4MP exterior', desc:'Visión nocturna 30 m · IP67 · lente 2.8 mm', qty:8, price:74900, disc:10 },
        { name:'NVR 16 canales + disco 4TB', desc:'Grabación continua 24/7 · acceso remoto', qty:1, price:329000, disc:0 },
        { name:'Instalación y configuración', desc:'Canalización, tendido, configuración y capacitación', qty:1, price:420000, disc:0 },
      ], notes:'' },
    { id:'q2', folio:'COT-1042', clientId:'c2', project:'Alarma + control de acceso 2 puertas',
      date:'2026-05-28', validUntil:'2026-06-12', status:'viewed', payment:'Contado', leadTime:'3 días hábiles',
      items:[
        { name:'Panel de alarma DSC PowerSeries', desc:'', qty:1, price:129000, disc:0 },
        { name:'Sensor PIR inalámbrico', desc:'', qty:6, price:18900, disc:0 },
        { name:'Cerradura magnética 600 lb', desc:'', qty:2, price:54000, disc:0 },
        { name:'Instalación y configuración', desc:'', qty:1, price:420000, disc:5 },
      ], notes:'' },
    { id:'q3', folio:'COT-1040', clientId:'c3', project:'Red estructurada 24 puntos + WiFi',
      date:'2026-05-20', validUntil:'2026-06-04', status:'accepted', payment:'50% anticipo', leadTime:'8 días hábiles',
      items:[
        { name:'Switch PoE 8 puertos gigabit', desc:'', qty:3, price:89000, disc:0 },
        { name:'Instalación y configuración', desc:'', qty:1, price:1200000, disc:0 },
      ], notes:'' },
  ]
};

/* ---- local cache (always kept, also offline fallback) ---- */
function localLoad(){
  try{ const raw=localStorage.getItem(DB_KEY); if(raw) return JSON.parse(raw); }catch(e){}
  const fresh=JSON.parse(JSON.stringify(SEED)); localStorage.setItem(DB_KEY, JSON.stringify(fresh)); return fresh;
}
function localSave(){ try{ localStorage.setItem(DB_KEY, JSON.stringify(DB)); }catch(e){} }

let DB = localLoad();

/* ---- public save: cache + (cloud push) ---- */
function save(){
  localSave();
  if(CLOUD) cloudPush();
  window.dispatchEvent(new CustomEvent('db-saved'));
}
function resetDB(){
  localStorage.removeItem(DB_KEY); DB = localLoad();
  if(CLOUD) cloudPush();
  window.dispatchEvent(new CustomEvent('db-saved')); location.reload();
}
function exportDB(){
  const blob=new Blob([JSON.stringify(DB,null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob); const a=document.createElement('a');
  a.href=url; a.download='bytec-cotizador-respaldo.json'; a.click(); URL.revokeObjectURL(url);
}
function importDB(file){
  const r=new FileReader();
  r.onload=()=>{ try{ DB=JSON.parse(r.result); save(); location.reload(); }catch(e){ alert('Archivo inválido'); } };
  r.readAsText(file);
}

/* ============================================================
   Supabase
   ============================================================ */
function setSync(s){ SYNC=s; window.dispatchEvent(new CustomEvent('sync-changed',{detail:s})); }
window.getSync = ()=> ({ state:SYNC, cloud:CLOUD });

async function initBackend(){
  if(!(CFG.supabaseUrl && CFG.supabaseKey)) { setSync('local'); return; }
  if(!window.supabase){ console.warn('supabase-js no cargó'); setSync('error'); return; }
  try{
    supa = window.supabase.createClient(CFG.supabaseUrl, CFG.supabaseKey);
    CLOUD = true; setSync('hydrating');
    await cloudHydrate();
    setSync('saved');
  }catch(e){ console.warn('Supabase init falló:', e); CLOUD=false; setSync('error'); }
}

async function cloudHydrate(){
  const [co,cat,cl,qs] = await Promise.all([
    supa.from('company').select('data').eq('id',1).maybeSingle(),
    supa.from('catalog').select('data'),
    supa.from('clients').select('data'),
    supa.from('quotes').select('data'),
  ]);
  const empty = !(cat.data&&cat.data.length) && !(cl.data&&cl.data.length) && !(qs.data&&qs.data.length) && !(co.data);
  if(empty){ await doPush(); return; }            // primera vez: sube la semilla local
  if(co.data && co.data.data) DB.company = co.data.data;
  if(cat.data) DB.catalog = cat.data.map(r=>r.data);
  if(cl.data)  DB.clients = cl.data.map(r=>r.data);
  if(qs.data)  DB.quotes  = qs.data.map(r=>r.data);
  localSave();
}

let pushTimer=null;
function cloudPush(){ clearTimeout(pushTimer); pushTimer=setTimeout(doPush, 450); }

async function doPush(){
  if(!CLOUD) return;
  try{
    setSync('saving');
    await supa.from('company').upsert({ id:1, data:DB.company });
    await syncCollection('catalog', DB.catalog);
    await syncCollection('clients', DB.clients);
    await syncCollection('quotes',  DB.quotes);
    setSync('saved');
  }catch(e){ console.warn('Push falló:', e); setSync('error'); }
}
async function syncCollection(table, rows){
  const payload = rows.map(r=>({ id:r.id, data:r }));
  if(payload.length){
    const { error } = await supa.from(table).upsert(payload);
    if(error) throw error;
    const ids = rows.map(r=>r.id);
    const list = ids.map(i=>`"${String(i).replace(/"/g,'')}"`).join(',');
    await supa.from(table).delete().not('id','in','('+list+')');
  }else{
    await supa.from(table).delete().neq('id','');
  }
}

/* ---- helpers ---- */
const uid = ()=> 'x'+Math.random().toString(36).slice(2,9);
const CLP = n => '$'+Math.round(n||0).toLocaleString('es-CL');
const todayISO = ()=> new Date().toISOString().slice(0,10);
function addDaysISO(iso,d){ const dt=new Date(iso); dt.setDate(dt.getDate()+d); return dt.toISOString().slice(0,10); }
function fmtDate(iso){ if(!iso) return '—'; const [y,m,d]=iso.split('-'); return `${d}-${m}-${y}`; }

const STATUS = {
  draft:{label:'Borrador',cls:'draft'}, sent:{label:'Enviada',cls:'sent'},
  viewed:{label:'Vista',cls:'viewed'}, accepted:{label:'Aceptada',cls:'accepted'},
  rejected:{label:'Rechazada',cls:'rejected'}, invoiced:{label:'Facturada',cls:'invoiced'},
};

function lineTotal(it){ return (it.qty||0)*(it.price||0)*(1-(it.disc||0)/100); }
function quoteTotals(q){
  let gross=0,disc=0;
  (q.items||[]).forEach(it=>{ const g=(it.qty||0)*(it.price||0); gross+=g; disc+=g*((it.disc||0)/100); });
  const net=gross-disc; const iva=net*((DB.company.iva||19)/100);
  return { gross, disc, net, iva, total:net+iva };
}
function getClient(id){ return DB.clients.find(c=>c.id===id); }
function getQuote(id){ return DB.quotes.find(q=>q.id===id); }
function newFolio(){ const c=DB.company; const f=(c.folioPrefix||'COT-')+(c.nextFolio||1044); c.nextFolio=(c.nextFolio||1044)+1; return f; }

Object.assign(window, { DB, save, resetDB, exportDB, importDB, initBackend,
  uid, CLP, todayISO, addDaysISO, fmtDate, STATUS, lineTotal, quoteTotals,
  getClient, getQuote, newFolio });
