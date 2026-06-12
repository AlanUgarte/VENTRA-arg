'use client';
import { useState, useRef, useEffect } from 'react';
import {
  ShoppingCart, Package, Users, Truck, BarChart3, RotateCcw,
  Search, Plus, Check, Settings, UserCheck, CreditCard,
  ChevronLeft, ChevronRight,
} from 'lucide-react';

const NAV = [
  { icon: ShoppingCart, label: 'Punto de venta'   },
  { icon: Package,      label: 'Inventario'        },
  { icon: Users,        label: 'Clientes / Fiados' },
  { icon: Truck,        label: 'Proveedores'       },
  { icon: RotateCcw,    label: 'Devoluciones'      },
  { icon: BarChart3,    label: 'Reportes'          },
  { icon: UserCheck,    label: 'Usuarios'          },
  { icon: CreditCard,   label: 'Suscripción'       },
  { icon: Settings,     label: 'Configuración'     },
];

const P = '#0d9f6e';

// ─── Utilities ────────────────────────────────────────────────────────────────
const bdg = (v: 'ok'|'warn'|'err'|'blue'|'violet'|'orange', t: string) => {
  const m: Record<string,[string,string]> = {
    ok:['#dcfce7','#15803d'], warn:['#fef9c3','#92400e'], err:['#fee2e2','#b91c1c'],
    blue:['#dbeafe','#1d4ed8'], violet:['#ede9fe','#6d28d9'], orange:['#ffedd5','#c2410c'],
  };
  return <span style={{ background:m[v][0], color:m[v][1], fontSize:9, fontWeight:800, padding:'2px 7px', borderRadius:6, whiteSpace:'nowrap' }}>{t}</span>;
};

function TH({ c }: { c: string }) {
  return <th style={{ padding:'4px 8px', textAlign:'left', fontSize:8, fontWeight:800, textTransform:'uppercase', letterSpacing:'.05em', color:'#9ca3af', background:'#fff', whiteSpace:'nowrap' }}>{c}</th>;
}
function TD({ children, mono, bold, color, center }: { children: React.ReactNode; mono?: boolean; bold?: boolean; color?: string; center?: boolean }) {
  return <td style={{ padding:'6px 8px', fontFamily:mono?'monospace':undefined, fontWeight:bold?700:undefined, color:color??'#111827', fontSize:10.5, textAlign:center?'center':undefined }}>{children}</td>;
}

function Kpi({ label, value, color, sub }: { label: string; value: string; color: string; sub: string }) {
  return (
    <div style={{ flex:1, minWidth:0, background:'#fff', border:'1px solid #e5e7eb', borderRadius:10, padding:'8px 10px' }}>
      <div style={{ fontSize:8, fontWeight:800, textTransform:'uppercase', letterSpacing:'.05em', color:'#9ca3af', marginBottom:3 }}>{label}</div>
      <div style={{ fontFamily:'monospace', fontWeight:800, fontSize:14, color, lineHeight:1 }}>{value}</div>
      <div style={{ fontSize:9, color:'#9ca3af', marginTop:2 }}>{sub}</div>
    </div>
  );
}

function AppTopbar({ title, sub }: { title: string; sub: string }) {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'9px 14px 8px', borderBottom:'1px solid #e5e7eb', background:'#fff', flexShrink:0 }}>
      <div>
        <div style={{ fontSize:13, fontWeight:800, color:'#111827', lineHeight:1 }}>{title}</div>
        <div style={{ fontSize:9.5, color:'#9ca3af', marginTop:2 }}>{sub}</div>
      </div>
      <div style={{ display:'flex', gap:5 }}>
        {[['FACTURADO','$184.300','#dcfce7','#15803d'],['GANANCIA','$55.100','#dcfce7','#15803d'],['POR COBRAR','$9.050','#fee2e2','#b91c1c']].map(([l,v,bg,c])=>(
          <div key={String(l)} style={{ background:String(bg), borderRadius:7, padding:'3px 7px', textAlign:'center' }}>
            <div style={{ fontSize:7, fontWeight:800, textTransform:'uppercase', color:'#6b7280', letterSpacing:'.04em' }}>{l}</div>
            <div style={{ fontFamily:'monospace', fontSize:10, fontWeight:900, color:String(c) }}>{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Screen 1 — POS ──────────────────────────────────────────────────────────
function ScreenPOS() {
  const prods = [
    { name:'Gaseosa 1.5L',   rub:'Bebidas',   rc:'#2563eb', pr:1125, st:18 },
    { name:'Leche entera',   rub:'Alimentos', rc:'#059669', pr:990,  st:6  },
    { name:'Alfajor triple', rub:'Chocolates',rc:'#dc2626', pr:585,  st:24 },
    { name:'Chips 100g',     rub:'Snacks',    rc:'#7c3aed', pr:495,  st:3  },
    { name:'Agua 500ml',     rub:'Bebidas',   rc:'#2563eb', pr:405,  st:30 },
    { name:'Fernet 750ml',   rub:'Bebidas',   rc:'#2563eb', pr:5400, st:8  },
    { name:'Galletitas x6',  rub:'Alimentos', rc:'#059669', pr:432,  st:12 },
    { name:'Vino Malbec',    rub:'Bebidas',   rc:'#2563eb', pr:2610, st:5  },
  ];
  const cart = [
    { name:'Gaseosa 1.5L',   qty:2, pr:1125 },
    { name:'Alfajor triple', qty:3, pr:585  },
    { name:'Fernet 750ml',   qty:1, pr:5400 },
    { name:'Agua 500ml',     qty:2, pr:405  },
  ];
  const sub = cart.reduce((s,i)=>s+i.pr*i.qty,0);
  const disc = Math.round(sub*.10);
  const total = sub - disc;
  return (
    <div style={{ display:'flex', height:'100%', flexDirection:'column', background:'#f9fafb' }}>
      <AppTopbar title="Punto de venta" sub="Armá el ticket y generá la venta" />
      <div style={{ flex:1, display:'flex', overflow:'hidden' }}>
        {/* Products */}
        <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
          <div style={{ padding:'7px 10px', background:'#fff', borderBottom:'1px solid #e5e7eb', display:'flex', gap:6 }}>
            <div style={{ flex:1, display:'flex', alignItems:'center', gap:6, border:'1px solid #e5e7eb', borderRadius:8, padding:'4px 9px', background:'#f9fafb' }}>
              <Search size={12} style={{ stroke:'#9ca3af', flexShrink:0 }} />
              <span style={{ fontSize:10, color:'#9ca3af' }}>Buscar artículo o código…</span>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:5, border:'1px solid #fed7aa', borderRadius:8, padding:'4px 8px', background:'#fff7ed' }}>
              <span style={{ fontSize:10, color:'#9ca3af' }}>%</span>
              {[0,5,10,15].map(d=>(
                <span key={d} style={{ fontSize:9.5, fontWeight:800, padding:'2px 6px', borderRadius:5, background:d===10?'#ea580c':'#f3f4f6', color:d===10?'#fff':'#6b7280' }}>{d}</span>
              ))}
            </div>
          </div>
          <div style={{ display:'flex', gap:5, padding:'5px 10px', borderBottom:'1px solid #e5e7eb', background:'#fff', overflowX:'auto' }}>
            {['Todos','Alimentos','Bebidas','Chocolates','Snacks','Galletitas','Perfumería'].map((r,i)=>(
              <span key={r} style={{ fontSize:9.5, fontWeight:700, padding:'3px 9px', borderRadius:20, flexShrink:0, background:i===0?'#111827':'#f3f4f6', color:i===0?'#fff':'#374151' }}>{r}</span>
            ))}
          </div>
          <div style={{ flex:1, padding:7, display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:6, overflowY:'auto', alignContent:'start' }}>
            {prods.map(p=>(
              <div key={p.name} style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:10, padding:'7px 7px 6px', display:'flex', flexDirection:'column', opacity:p.st===0?0.5:1, position:'relative' }}>
                <span style={{ fontSize:8.5, fontWeight:700, color:p.rc, background:p.rc+'18', padding:'1px 5px', borderRadius:8, alignSelf:'flex-start', marginBottom:3 }}>{p.rub}</span>
                <span style={{ fontSize:10.5, fontWeight:700, lineHeight:1.2, marginBottom:3 }}>{p.name}</span>
                <div style={{ marginTop:'auto', display:'flex', justifyContent:'space-between', alignItems:'flex-end' }}>
                  <span style={{ fontFamily:'monospace', fontSize:12, fontWeight:800, color:p.st<=3?'#ea580c':'#111827' }}>${p.pr.toLocaleString('es-AR')}</span>
                  <span style={{ fontSize:8.5, fontWeight:700, padding:'1px 4px', borderRadius:4, background:p.st===0?'#fee2e2':p.st<=3?'#fef9c3':'#dcfce7', color:p.st===0?'#b91c1c':p.st<=3?'#92400e':'#15803d' }}>{p.st===0?'0':p.st}</span>
                </div>
                <div style={{ background:p.st===0?'#f3f4f6':P, color:'#fff', borderRadius:7, padding:'5px 0', fontSize:9.5, fontWeight:800, textAlign:'center', marginTop:5 }}>
                  {p.st===0?'Agotado':'+ Agregar'}
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Cart */}
        <div style={{ width:185, display:'flex', flexDirection:'column', background:'#fff', borderLeft:'1px solid #e5e7eb', flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'7px 10px', borderBottom:'1px solid #e5e7eb' }}>
            <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:11.5, fontWeight:800 }}>
              <ShoppingCart size={12} style={{ stroke:'#374151' }} /> Ticket
              <span style={{ fontSize:9, color:'#9ca3af', fontWeight:400 }}>· {cart.reduce((s,i)=>s+i.qty,0)} u.</span>
            </div>
            <span style={{ fontSize:9, color:'#ea580c', fontWeight:700 }}>Vaciar</span>
          </div>
          <div style={{ flex:1, overflowY:'auto' }}>
            {cart.map(item=>(
              <div key={item.name} style={{ display:'flex', alignItems:'center', gap:5, padding:'6px 9px', borderBottom:'1px solid #f3f4f6' }}>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:10.5, fontWeight:700, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.name}</div>
                  <div style={{ fontSize:9, color:'#9ca3af', fontFamily:'monospace' }}>${item.pr.toLocaleString('es-AR')} c/u</div>
                </div>
                <div style={{ display:'flex', alignItems:'center', border:'1px solid #e5e7eb', borderRadius:6, overflow:'hidden' }}>
                  <div style={{ padding:'2px 5px', background:'#f9fafb', fontSize:11, fontWeight:800 }}>−</div>
                  <span style={{ fontSize:10, fontWeight:800, minWidth:14, textAlign:'center', fontFamily:'monospace' }}>{item.qty}</span>
                  <div style={{ padding:'2px 5px', background:'#f9fafb', fontSize:11, fontWeight:800 }}>+</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ padding:'8px 10px', borderTop:'1px solid #e5e7eb' }}>
            {[['Subtotal',`$${sub.toLocaleString('es-AR')}`,'#6b7280'],['Descuento 10%',`−$${disc.toLocaleString('es-AR')}`,'#ea580c']].map(([l,v,c])=>(
              <div key={String(l)} style={{ display:'flex', justifyContent:'space-between', fontSize:9.5, color:String(c), marginBottom:3 }}>
                <span>{l}</span><span style={{ fontFamily:'monospace', fontWeight:600 }}>{v}</span>
              </div>
            ))}
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, fontWeight:900, borderTop:'1px dashed #e5e7eb', paddingTop:5, marginBottom:7 }}>
              <span>TOTAL</span><span style={{ fontFamily:'monospace' }}>${total.toLocaleString('es-AR')}</span>
            </div>
            <div style={{ background:P, color:'#fff', borderRadius:8, padding:'8px 0', fontSize:10.5, fontWeight:800, textAlign:'center', marginBottom:4, boxShadow:'0 2px 10px rgba(13,159,110,.35)' }}>
              ✓ Cobrar y generar venta
            </div>
            <div style={{ border:'1px solid #ddd6fe', color:'#7c3aed', borderRadius:8, padding:'6px 0', fontSize:10, fontWeight:700, textAlign:'center' }}>
              Fiar a un cliente →
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Screen 2 — Inventario ───────────────────────────────────────────────────
function ScreenInventory() {
  const rows = [
    { n:'Gaseosa 1.5L',   rb:'Bebidas',    rc:'#2563eb', co:800,  pr:1250, ga:450, st:18, low:false },
    { n:'Leche entera',   rb:'Alimentos',  rc:'#059669', co:750,  pr:1100, ga:350, st:6,  low:true  },
    { n:'Alfajor triple', rb:'Chocolates', rc:'#dc2626', co:420,  pr:650,  ga:230, st:24, low:false },
    { n:'Chips 100g',     rb:'Snacks',     rc:'#7c3aed', co:375,  pr:550,  ga:175, st:3,  low:true  },
    { n:'Fernet 750ml',   rb:'Bebidas',    rc:'#2563eb', co:4200, pr:5400, ga:1200,st:8,  low:false },
    { n:'Vino Malbec',    rb:'Bebidas',    rc:'#2563eb', co:1950, pr:2610, ga:660, st:5,  low:true  },
    { n:'Galletitas x6',  rb:'Alimentos',  rc:'#059669', co:320,  pr:480,  ga:160, st:0,  low:false },
  ];
  return (
    <div style={{ display:'flex', height:'100%', flexDirection:'column' }}>
      <AppTopbar title="Inventario" sub="Artículos, precios y stock" />
      <div style={{ flex:1, display:'flex', overflow:'hidden' }}>
        <div style={{ width:200, background:'#fff', borderRight:'1px solid #e5e7eb', padding:'10px', overflowY:'auto', flexShrink:0 }}>
          <div style={{ fontSize:11.5, fontWeight:800, marginBottom:10, display:'flex', alignItems:'center', gap:5 }}>
            <Plus size={12} style={{ stroke:P }} /> Nuevo artículo
          </div>
          {[['NOMBRE','Gaseosa 1.5L'],['RUBRO','Bebidas']].map(([l,p])=>(
            <div key={l} style={{ marginBottom:7 }}>
              <div style={{ fontSize:8.5, fontWeight:800, color:'#6b7280', letterSpacing:'.06em', marginBottom:2 }}>{l}</div>
              <div style={{ border:'1px solid #e5e7eb', borderRadius:7, padding:'5px 8px', fontSize:10.5, fontWeight:600, background:'#f9fafb' }}>{p}</div>
            </div>
          ))}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:5, marginBottom:7 }}>
            {[['COSTO LISTA $','800'],['DESC. COMPRA','0'],['% GANANCIA','40']].map(([l,v])=>(
              <div key={l}>
                <div style={{ fontSize:7.5, fontWeight:800, color:'#6b7280', letterSpacing:'.04em', marginBottom:2 }}>{l}</div>
                <div style={{ border:'1px solid #e5e7eb', borderRadius:6, padding:'4px 5px', fontSize:11, fontFamily:'monospace', fontWeight:700, background:'#f9fafb' }}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{ marginBottom:7 }}>
            <div style={{ fontSize:8.5, fontWeight:800, color:'#6b7280', letterSpacing:'.06em', marginBottom:2 }}>STOCK INICIAL</div>
            <div style={{ border:'1px solid #e5e7eb', borderRadius:7, padding:'5px 8px', fontSize:10.5, fontWeight:600, background:'#f9fafb' }}>24</div>
          </div>
          <div style={{ marginBottom:10 }}>
            <div style={{ fontSize:8.5, fontWeight:800, color:'#6b7280', letterSpacing:'.06em', marginBottom:2 }}>CÓDIGO DE BARRAS (OPCIONAL)</div>
            <div style={{ border:'1px solid #e5e7eb', borderRadius:7, padding:'5px 8px', fontSize:10, background:'#f9fafb', color:'#9ca3af' }}>Ej: 7790001234567</div>
            <div style={{ fontSize:8, color:'#9ca3af', marginTop:3 }}>EAN-13, EAN-8, Code128 — para escanear desde el celular en el POS</div>
          </div>
          <div style={{ border:'1px solid #e5e7eb', borderRadius:9, padding:'9px 10px', background:'#f9fafb', marginBottom:8 }}>
            {[['Costo real','$800','#374151'],['Ganancia u.',`$${320}`,'#0d9f6e'],['Precio venta','$1.120','#111827']].map(([l,v,c],i)=>(
              <div key={String(l)} style={{ display:'flex', justifyContent:'space-between', marginBottom:i===2?0:4, borderTop:i===2?'1px solid #e5e7eb':undefined, paddingTop:i===2?5:undefined }}>
                <span style={{ fontSize:10, color:'#6b7280' }}>{l}</span>
                <span style={{ fontFamily:'monospace', fontSize:i===2?13:11, fontWeight:i===2?900:700, color:String(c) }}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{ background:P, color:'#fff', borderRadius:8, padding:'7px 0', fontSize:10.5, fontWeight:800, textAlign:'center' }}>Agregar al inventario</div>
        </div>
        <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'7px 10px', borderBottom:'1px solid #e5e7eb', background:'#fff' }}>
            <span style={{ fontSize:11.5, fontWeight:800 }}>Inventario actual</span>
            <span style={{ fontSize:9, color:'#9ca3af' }}>7 artículos · 3 con stock bajo</span>
          </div>
          <div style={{ flex:1, overflowY:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead><tr style={{ borderBottom:'1px solid #e5e7eb' }}>
                {['Artículo','Rubro','Costo','P. venta','Ganancia','Stock',''].map(h=><TH key={h} c={h} />)}
              </tr></thead>
              <tbody>
                {rows.map(r=>(
                  <tr key={r.n} style={{ borderBottom:'1px solid #f3f4f6', background:r.st===0?'#fefce8':'#fff' }}>
                    <TD bold>{r.n}</TD>
                    <TD><span style={{ fontSize:9, fontWeight:700, padding:'1px 6px', borderRadius:8, color:r.rc, background:r.rc+'18' }}>{r.rb}</span></TD>
                    <TD mono color="#6b7280">${r.co.toLocaleString('es-AR')}</TD>
                    <TD mono bold>${r.pr.toLocaleString('es-AR')}</TD>
                    <TD mono color={P}>${r.ga.toLocaleString('es-AR')}</TD>
                    <TD>{bdg(r.st===0?'err':r.low?'warn':'ok', r.st===0?'Sin stock':String(r.st))}</TD>
                    <td style={{ padding:'6px 7px' }}>
                      <div style={{ display:'flex', gap:4 }}>
                        <div style={{ width:22, height:22, borderRadius:6, background:'#eff6ff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11 }}>✏</div>
                        <div style={{ width:22, height:22, borderRadius:6, background:'#fef2f2', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10 }}>✕</div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Screen 3 — Clientes / Fiados ────────────────────────────────────────────
function ScreenCustomers() {
  const cs = [
    { n:'María González',  ph:'11 5555-1234', fi:5, pa:3200,  ba:4750 },
    { n:'Roberto Sánchez', ph:'11 4444-5678', fi:3, pa:1500,  ba:1200 },
    { n:'Carlos Ruiz',     ph:'—',            fi:2, pa:2100,  ba:0    },
    { n:'Ana López',       ph:'11 6666-9012', fi:4, pa:900,   ba:3100 },
    { n:'Jorge Martínez',  ph:'11 7777-3456', fi:1, pa:550,   ba:0    },
    { n:'Laura Fernández', ph:'11 8888-1234', fi:6, pa:4100,  ba:6200 },
  ];
  const total = cs.reduce((s,c)=>s+c.ba,0);
  const withD = cs.filter(c=>c.ba>0).length;
  return (
    <div style={{ display:'flex', height:'100%', flexDirection:'column' }}>
      <AppTopbar title="Clientes / Fiados" sub="Cuentas corrientes revaluadas al precio actual" />
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
        <div style={{ display:'flex', gap:6, padding:'7px 10px', borderBottom:'1px solid #e5e7eb', background:'#f9fafb' }}>
          <Kpi label="Total por cobrar"   value={`$${total.toLocaleString('es-AR')}`}   color="#7c3aed" sub="Cuentas corrientes" />
          <Kpi label="Clientes con deuda" value={String(withD)}                          color="#ea580c" sub={`${cs.length} clientes totales`} />
          <Kpi label="Clientes activos"   value={String(cs.length)}                      color="#111827" sub="Registrados" />
        </div>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'7px 10px', borderBottom:'1px solid #e5e7eb', background:'#fff' }}>
          <span style={{ fontSize:12, fontWeight:800 }}>Cuentas de clientes</span>
          <div style={{ display:'flex', gap:6 }}>
            <div style={{ display:'flex', alignItems:'center', gap:5, border:'1px solid #e5e7eb', borderRadius:8, padding:'4px 8px', background:'#f9fafb' }}>
              <Search size={11} style={{ stroke:'#9ca3af' }} />
              <span style={{ fontSize:9.5, color:'#9ca3af' }}>Buscar…</span>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:4, background:P, color:'#fff', borderRadius:8, padding:'4px 9px', fontSize:10, fontWeight:700 }}>
              <Plus size={11} style={{ stroke:'#fff' }} /> Nuevo cliente
            </div>
          </div>
        </div>
        <div style={{ flex:1, overflowY:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead><tr style={{ borderBottom:'1px solid #e5e7eb' }}>
              {['Cliente','Teléfono','Fiados','Pagado','Deuda actual',''].map(h=><TH key={h} c={h} />)}
            </tr></thead>
            <tbody>
              {[...cs].sort((a,b)=>b.ba-a.ba).map(c=>(
                <tr key={c.n} style={{ borderBottom:'1px solid #f3f4f6' }}>
                  <TD bold>{c.n}</TD>
                  <TD mono color="#9ca3af">{c.ph}</TD>
                  <TD center>{c.fi}</TD>
                  <TD mono>${c.pa.toLocaleString('es-AR')}</TD>
                  <td style={{ padding:'6px 8px', fontFamily:'monospace', fontSize:13, fontWeight:800, color:c.ba>0?'#7c3aed':'#059669' }}>
                    ${c.ba.toLocaleString('es-AR')}
                  </td>
                  <td style={{ padding:'6px 8px' }}>
                    <div style={{ display:'flex', gap:4 }}>
                      <span style={{ fontSize:9, fontWeight:700, color:'#2563eb', background:'#eff6ff', padding:'2px 6px', borderRadius:5 }}>Ver</span>
                      {c.ba>0 && <span style={{ fontSize:9, fontWeight:700, color:'#7c3aed', background:'#ede9fe', padding:'2px 6px', borderRadius:5 }}>Cobrar</span>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Screen 4 — Proveedores ──────────────────────────────────────────────────
function ScreenSuppliers() {
  const provs = ['Distribuidora Norte','Bebidas del Sur','Golosinas SA'];
  const inv = [
    { sup:'Distribuidora Norte', num:'FAC-001', cond:'30 días', amt:12400, sal:12400, st:'PENDING' as const },
    { sup:'Bebidas del Sur',     num:'FAC-024', cond:'Contado', amt:8200,  sal:8200,  st:'OVERDUE' as const },
    { sup:'Distribuidora Norte', num:'FAC-003', cond:'15 días', amt:5600,  sal:2800,  st:'PARTIAL' as const },
    { sup:'Golosinas SA',        num:'FAC-011', cond:'30 días', amt:9300,  sal:9300,  st:'PENDING' as const },
    { sup:'Bebidas del Sur',     num:'FAC-019', cond:'Contado', amt:3100,  sal:0,     st:'PAID'    as const },
  ];
  const totalD = inv.reduce((s,i)=>s+i.sal,0);
  const ov = inv.filter(i=>i.st==='OVERDUE').reduce((s,i)=>s+i.sal,0);
  const stV = { PAID:'ok', PARTIAL:'blue', PENDING:'warn', OVERDUE:'err' } as const;
  const stL = { PAID:'Pagada', PARTIAL:'Parcial', PENDING:'Pendiente', OVERDUE:'Vencida' };
  return (
    <div style={{ display:'flex', height:'100%', flexDirection:'column' }}>
      <AppTopbar title="Proveedores" sub="Facturas recibidas, condiciones y pagos" />
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
        <div style={{ display:'flex', gap:5, padding:'7px 10px', borderBottom:'1px solid #e5e7eb', background:'#f9fafb' }}>
          <Kpi label="Total adeudado"       value={`$${totalD.toLocaleString('es-AR')}`} color="#111827" sub="0 facturas pendientes" />
          <Kpi label="Vencido"              value={`$${ov.toLocaleString('es-AR')}`}      color="#dc2626" sub="Requiere atención" />
          <Kpi label="Proveedores"          value="3"                                     color="#111827" sub="Registrados" />
          <Kpi label="Facturas"             value={String(inv.length)}                    color="#111827" sub="Total registradas" />
        </div>
        <div style={{ flex:1, display:'flex', overflow:'hidden' }}>
          {/* Sidebar providers */}
          <div style={{ width:160, background:'#fff', borderRight:'1px solid #e5e7eb', display:'flex', flexDirection:'column', flexShrink:0 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 10px', borderBottom:'1px solid #e5e7eb' }}>
              <span style={{ fontSize:11, fontWeight:800 }}>Proveedores</span>
              <div style={{ width:20, height:20, borderRadius:6, background:'#dcfce7', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Plus size={11} style={{ stroke:P }} />
              </div>
            </div>
            <div style={{ flex:1, overflowY:'auto' }}>
              {provs.map((p,i)=>(
                <div key={p} style={{ padding:'7px 10px', borderBottom:'1px solid #f3f4f6', background:i===0?'#f0fdf4':'transparent', cursor:'pointer' }}>
                  <div style={{ fontSize:10.5, fontWeight:i===0?700:500, color:i===0?P:'#374151' }}>{p}</div>
                </div>
              ))}
            </div>
          </div>
          {/* Invoices */}
          <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'7px 10px', borderBottom:'1px solid #e5e7eb', background:'#fff' }}>
              <span style={{ fontSize:11.5, fontWeight:800 }}>Facturas y pagos</span>
              <span style={{ fontSize:9.5, fontWeight:700, color:P, background:'#dcfce7', padding:'3px 8px', borderRadius:7 }}>+ Factura</span>
            </div>
            <div style={{ flex:1, overflowY:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead><tr style={{ borderBottom:'1px solid #e5e7eb' }}>
                  {['Proveedor','Nro.','Condición','Importe','Saldo','Estado',''].map(h=><TH key={h} c={h} />)}
                </tr></thead>
                <tbody>
                  {inv.map((r,i)=>(
                    <tr key={i} style={{ borderBottom:'1px solid #f3f4f6', background:r.st==='OVERDUE'?'#fff5f5':'#fff' }}>
                      <TD bold>{r.sup.split(' ')[0]}</TD>
                      <TD mono color="#6b7280">{r.num}</TD>
                      <TD>{r.cond}</TD>
                      <TD mono>${r.amt.toLocaleString('es-AR')}</TD>
                      <td style={{ padding:'6px 8px', fontFamily:'monospace', fontSize:12, fontWeight:800, color:r.sal>0?(r.st==='OVERDUE'?'#dc2626':'#111827'):'#059669' }}>
                        ${r.sal.toLocaleString('es-AR')}
                      </td>
                      <td style={{ padding:'6px 8px' }}>{bdg(stV[r.st], stL[r.st])}</td>
                      <td style={{ padding:'6px 8px' }}>
                        {r.sal>0 && <span style={{ fontSize:9, fontWeight:700, color:P, background:'#dcfce7', padding:'2px 6px', borderRadius:5 }}>Pagar</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Screen 5 — Devoluciones ─────────────────────────────────────────────────
function ScreenReturns() {
  const devs = [
    { art:'Gaseosa 1.5L',   sup:'Bebidas del Sur',     mot:'Rotura de envase',     qty:3,  amt:3375, st:'CREDITED'  as const },
    { art:'Alfajor triple', sup:'Golosinas SA',         mot:'Fecha próxima vcto.',  qty:12, amt:7020, st:'PENDING'   as const },
    { art:'Leche entera',   sup:'Distribuidora Norte',  mot:'Producto en mal estado',qty:6, amt:4500, st:'PENDING'   as const },
    { art:'Chips 100g',     sup:'Golosinas SA',         mot:'Embalaje roto',        qty:8,  amt:4400, st:'CREDITED'  as const },
    { art:'Fernet 750ml',   sup:'Bebidas del Sur',      mot:'Producto defectuoso',  qty:2,  amt:8400, st:'PENDING'   as const },
  ];
  const totalD = devs.reduce((s,d)=>s+d.amt,0);
  const pend = devs.filter(d=>d.st==='PENDING').length;
  const cred = devs.filter(d=>d.st==='CREDITED');
  const credAmt = cred.reduce((s,d)=>s+d.amt,0);
  return (
    <div style={{ display:'flex', height:'100%', flexDirection:'column' }}>
      <AppTopbar title="Devoluciones a Proveedores" sub="Trazabilidad de artículos devueltos por roturas u otros motivos" />
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
        <div style={{ display:'flex', gap:5, padding:'7px 10px', borderBottom:'1px solid #e5e7eb', background:'#f9fafb' }}>
          <Kpi label="Total devuelto"  value={`$${totalD.toLocaleString('es-AR')}`}  color="#111827"  sub={`${devs.length} unidades`} />
          <Kpi label="Pendientes"      value={String(pend)}                           color="#d97706"  sub="Esperando resolución" />
          <Kpi label="Acreditados"     value={String(cred.length)}                    color={P}        sub="Proveedor acreditó" />
          <Kpi label="Monto acreditado" value={`$${credAmt.toLocaleString('es-AR')}`} color={P}        sub="Total recuperado" />
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:7, padding:'7px 10px', borderBottom:'1px solid #e5e7eb', background:'#fff' }}>
          <div style={{ display:'flex', alignItems:'center', gap:5, background:P, color:'#fff', borderRadius:8, padding:'5px 10px', fontSize:10.5, fontWeight:700 }}>
            <Plus size={11} style={{ stroke:'#fff' }} /> Registrar devolución
          </div>
          {['Todos los estados','Todos los proveedores'].map(f=>(
            <div key={f} style={{ display:'flex', alignItems:'center', gap:4, border:'1px solid #e5e7eb', borderRadius:8, padding:'4px 9px', background:'#f9fafb', fontSize:9.5, fontWeight:600, color:'#374151' }}>
              {f} ▼
            </div>
          ))}
        </div>
        <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
          <div style={{ padding:'7px 10px', borderBottom:'1px solid #e5e7eb', background:'#fff' }}>
            <span style={{ fontSize:12, fontWeight:800 }}>Historial de devoluciones</span>
          </div>
          <div style={{ flex:1, overflowY:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead><tr style={{ borderBottom:'1px solid #e5e7eb' }}>
                {['Artículo','Proveedor','Motivo','Cant.','Monto','Estado',''].map(h=><TH key={h} c={h} />)}
              </tr></thead>
              <tbody>
                {devs.map((d,i)=>(
                  <tr key={i} style={{ borderBottom:'1px solid #f3f4f6', background:d.st==='PENDING'?'#fffbeb':'#fff' }}>
                    <TD bold>{d.art}</TD>
                    <TD color="#6b7280">{d.sup.split(' ')[0]}</TD>
                    <TD color="#6b7280">{d.mot}</TD>
                    <TD center>{d.qty}</TD>
                    <TD mono bold color={d.st==='CREDITED'?P:'#111827'}>${d.amt.toLocaleString('es-AR')}</TD>
                    <td style={{ padding:'6px 8px' }}>{bdg(d.st==='CREDITED'?'ok':'warn', d.st==='CREDITED'?'Acreditado':'Pendiente')}</td>
                    <td style={{ padding:'6px 8px' }}>
                      <span style={{ fontSize:9, fontWeight:700, color:'#2563eb', background:'#eff6ff', padding:'2px 6px', borderRadius:5 }}>Ver</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Screen 6 — Reportes ─────────────────────────────────────────────────────
function ScreenReports() {
  const bars = [55,72,61,88,70,95,58,82,68,90,63,97,76,85,62,93,74,88,59,96,71,90,64,97,76,88,62,94,71,87];
  const rubros = [
    { n:'Bebidas',   c:'#2563eb', pct:32, rev:58816 },
    { n:'Alimentos', c:'#059669', pct:24, rev:44112 },
    { n:'Chocolates',c:'#dc2626', pct:18, rev:33084 },
    { n:'Snacks',    c:'#7c3aed', pct:14, rev:25742 },
    { n:'Otros',     c:'#d97706', pct:12, rev:22064 },
  ];
  const top5 = [
    ['Gaseosa 1.5L',124,'$139.500'],['Alfajor triple',98,'$63.700'],
    ['Fernet 750ml',62,'$334.800'],['Leche entera',87,'$95.700'],['Chips 100g',75,'$41.250'],
  ];
  // SVG donut data
  const total = rubros.reduce((s,r)=>s+r.pct,0);
  let cum = 0;
  const slices = rubros.map(r => {
    const start = cum / total;
    cum += r.pct;
    const end = cum / total;
    const startAngle = start * 2 * Math.PI - Math.PI / 2;
    const endAngle = end * 2 * Math.PI - Math.PI / 2;
    const r1 = 48, r2 = 28;
    const x1o = 56 + r1 * Math.cos(startAngle), y1o = 56 + r1 * Math.sin(startAngle);
    const x1i = 56 + r2 * Math.cos(startAngle), y1i = 56 + r2 * Math.sin(startAngle);
    const x2o = 56 + r1 * Math.cos(endAngle),   y2o = 56 + r1 * Math.sin(endAngle);
    const x2i = 56 + r2 * Math.cos(endAngle),   y2i = 56 + r2 * Math.sin(endAngle);
    const large = r.pct / total > 0.5 ? 1 : 0;
    return { ...r, d: `M${x1o},${y1o} A${r1},${r1},0,${large},1,${x2o},${y2o} L${x2i},${y2i} A${r2},${r2},0,${large},0,${x1i},${y1i} Z` };
  });
  return (
    <div style={{ display:'flex', height:'100%', flexDirection:'column' }}>
      <AppTopbar title="Reportes" sub="Facturación, ganancia y rotación" />
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
        <div style={{ display:'flex', alignItems:'center', gap:5, padding:'6px 10px', borderBottom:'1px solid #e5e7eb', background:'#fff', flexWrap:'wrap' }}>
          <span style={{ fontSize:9.5, fontWeight:600, color:'#9ca3af' }}>Período:</span>
          {['Hoy','Esta semana','Este mes','Todo'].map((p,i)=>(
            <span key={p} style={{ fontSize:9.5, fontWeight:700, padding:'3px 9px', borderRadius:7, background:i===2?P:'#f3f4f6', color:i===2?'#fff':'#6b7280' }}>{p}</span>
          ))}
        </div>
        {/* 6 KPI chips */}
        <div style={{ display:'flex', gap:4, padding:'6px 9px', borderBottom:'1px solid #e5e7eb', background:'#f9fafb' }}>
          {[['Facturación','$184.300','0 unidades','#111827'],['Ganancia neta','$55.100','Margen 29.9%',P],['Costo','$129.200','Mercadería vendida','#6b7280'],['Ticket prom.','$1.245','148 ventas','#2563eb'],['Por cobrar','$9.050','Fiados','#7c3aed'],['Margen %','29.9%','Sobre facturación','#d97706']].map(([l,v,s,c])=>(
            <div key={String(l)} style={{ flex:1, minWidth:0, background:'#fff', border:'1px solid #e5e7eb', borderRadius:9, padding:'6px 8px' }}>
              <div style={{ fontSize:7.5, fontWeight:800, textTransform:'uppercase', letterSpacing:'.05em', color:'#9ca3af', marginBottom:2 }}>{l}</div>
              <div style={{ fontFamily:'monospace', fontWeight:800, fontSize:12, color:String(c), lineHeight:1 }}>{v}</div>
              <div style={{ fontSize:8, color:'#9ca3af', marginTop:2 }}>{s}</div>
            </div>
          ))}
        </div>
        {/* Charts */}
        <div style={{ flex:1, display:'flex', overflow:'hidden' }}>
          {/* Bar chart */}
          <div style={{ flex:1, display:'flex', flexDirection:'column', padding:'9px 11px', borderRight:'1px solid #e5e7eb' }}>
            <div style={{ fontSize:10.5, fontWeight:800, marginBottom:6, color:'#374151' }}>Facturación diaria — Junio 2026</div>
            <div style={{ flex:1, display:'flex', alignItems:'flex-end', gap:2 }}>
              {bars.map((h,i)=>(
                <div key={i} style={{ flex:1, background:i===bars.length-3?P:i%7===6?'#93c5fd':'#bfdbfe', borderRadius:'3px 3px 0 0', height:`${h}%` }} />
              ))}
            </div>
            <div style={{ height:1, background:'#e5e7eb', marginTop:3 }} />
            <div style={{ display:'flex', justifyContent:'space-between', marginTop:3, fontSize:8, color:'#9ca3af' }}>
              {['1','5','10','15','20','25','30'].map(d=><span key={d}>{d}</span>)}
            </div>
          </div>
          {/* Right: Donut + top5 */}
          <div style={{ width:220, display:'flex', flexDirection:'column', overflowY:'auto' }}>
            {/* Donut */}
            <div style={{ padding:'9px 11px', borderBottom:'1px solid #e5e7eb' }}>
              <div style={{ fontSize:10.5, fontWeight:800, marginBottom:7, color:'#374151' }}>Revenue por rubro</div>
              <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                <svg width="112" height="112" viewBox="0 0 112 112" style={{ flexShrink:0 }}>
                  {slices.map(s=><path key={s.n} d={s.d} fill={s.c} />)}
                  <text x="56" y="54" textAnchor="middle" fontSize="11" fontWeight="800" fill="#111827">Rubros</text>
                  <text x="56" y="67" textAnchor="middle" fontSize="9" fill="#9ca3af">este mes</text>
                </svg>
                <div style={{ flex:1 }}>
                  {rubros.map(r=>(
                    <div key={r.n} style={{ display:'flex', alignItems:'center', gap:5, marginBottom:5 }}>
                      <div style={{ width:8, height:8, borderRadius:2, background:r.c, flexShrink:0 }} />
                      <span style={{ fontSize:9.5, fontWeight:600, flex:1 }}>{r.n}</span>
                      <span style={{ fontSize:9.5, fontWeight:800, color:'#6b7280' }}>{r.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Top 5 */}
            <div style={{ padding:'9px 11px' }}>
              <div style={{ fontSize:10.5, fontWeight:800, marginBottom:6, color:'#374151' }}>Más vendidos (unidades)</div>
              {top5.map(([n,qty,rev],i)=>(
                <div key={String(n)} style={{ display:'flex', alignItems:'center', gap:6, marginBottom:5 }}>
                  <span style={{ fontSize:9, fontWeight:800, color:'#9ca3af', minWidth:14 }}>#{i+1}</span>
                  <span style={{ fontSize:9.5, fontWeight:700, flex:1 }}>{n}</span>
                  <span style={{ fontSize:9.5, fontFamily:'monospace', color:'#6b7280' }}>{qty}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Screen 7 — Usuarios ─────────────────────────────────────────────────────
function ScreenUsers() {
  const us = [
    { ini:'U', n:'UGARTE ALAN',   email:'ugartemultiproductos@gmail.com', role:'OWNER',   date:'09/06/2026', active:true  },
    { ini:'S', n:'SANDRA GOMEZ',  email:'cajera1@kiosco.com',              role:'CASHIER', date:'10/06/2026', active:true  },
    { ini:'M', n:'MIGUEL TORRES', email:'cajero2@kiosco.com',              role:'CASHIER', date:'Invitado',   active:false },
  ];
  return (
    <div style={{ display:'flex', height:'100%', flexDirection:'column' }}>
      <AppTopbar title="Usuarios" sub="Gestión de empleados y accesos" />
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', padding:'10px' }}>
        {/* Plan card */}
        <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:12, padding:'12px 14px', marginBottom:10 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
            <div>
              <div style={{ fontSize:12, fontWeight:800 }}>Usuarios del plan COMPLETO</div>
              <div style={{ fontSize:10, color:'#6b7280', marginTop:2 }}>2 de 3 usuarios activos</div>
            </div>
            {bdg('ok','Plan activo')}
          </div>
          {/* Progress */}
          <div style={{ height:8, background:'#f3f4f6', borderRadius:4, overflow:'hidden', marginBottom:5 }}>
            <div style={{ height:'100%', width:'66%', background:`linear-gradient(90deg,${P},#12c98a)`, borderRadius:4 }} />
          </div>
          <div style={{ fontSize:9.5, color:'#6b7280' }}>En plan completo: hasta 3 usuarios (1 dueño + 2 cajeros).</div>
        </div>
        {/* Users list */}
        <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:12, overflow:'hidden' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'9px 12px', borderBottom:'1px solid #e5e7eb' }}>
            <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:11.5, fontWeight:800 }}>
              <Users size={13} style={{ stroke:'#374151' }} /> Usuarios activos
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:4, background:'#ede9fe', color:'#6d28d9', borderRadius:7, padding:'4px 9px', fontSize:10, fontWeight:700 }}>
              <Plus size={11} style={{ stroke:'#6d28d9' }} /> Invitar cajero
            </div>
          </div>
          {us.map((u,i)=>(
            <div key={u.n} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderBottom:i<us.length-1?'1px solid #f3f4f6':undefined, background:u.active?'#fff':'#fafafa' }}>
              <div style={{ width:36, height:36, borderRadius:'50%', background:u.role==='OWNER'?`${P}20`:'#ede9fe', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:900, color:u.role==='OWNER'?P:'#6d28d9', flexShrink:0 }}>
                {u.ini}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:11.5, fontWeight:800, color:u.active?'#111827':'#9ca3af' }}>{u.n}</div>
                <div style={{ fontSize:9.5, color:'#9ca3af', marginTop:1 }}>{u.email}</div>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                {bdg(u.role==='OWNER'?'ok':'violet', u.role==='OWNER'?'Dueño':'Cajero')}
                <span style={{ fontSize:9.5, color:'#9ca3af' }}>{u.date}</span>
                {!u.active && bdg('warn','Invitación pendiente')}
              </div>
            </div>
          ))}
        </div>
        {/* Role info */}
        <div style={{ display:'flex', gap:8, marginTop:10 }}>
          {[
            { role:'Dueño', c:'#059669', bg:'#dcfce7', perms:['Acceso total al sistema','Configura precios y rubros','Ve reportes y ganancias','Gestiona empleados'] },
            { role:'Cajero', c:'#6d28d9', bg:'#ede9fe', perms:['Punto de venta y tickets','Registra clientes y fiados','Sin acceso a reportes','Sin acceso a configuración'] },
          ].map(r=>(
            <div key={r.role} style={{ flex:1, background:'#fff', border:'1px solid #e5e7eb', borderRadius:10, padding:'9px 10px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:7 }}>
                <div style={{ width:8, height:8, borderRadius:'50%', background:r.c }} />
                <span style={{ fontSize:10.5, fontWeight:800 }}>Rol: {r.role}</span>
              </div>
              {r.perms.map(p=>(
                <div key={p} style={{ display:'flex', alignItems:'center', gap:5, marginBottom:4, fontSize:9.5, color:'#6b7280' }}>
                  <Check size={9} style={{ stroke:r.c, flexShrink:0 }} /> {p}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Steps config ─────────────────────────────────────────────────────────────
const STEPS = [
  { navIdx:0, icon:ShoppingCart, color:'#0d9f6e', num:'01', label:'Punto de venta',
    title:'Cobrás en segundos,\nsin impresora',
    desc:'Buscás el producto o lo escaneás con la cámara. Sumás el ticket, aplicás descuento y generás el comprobante digital para compartir por WhatsApp.',
    points:['Escáner de código de barras con la cámara','Descuentos rápidos: 0%, 5%, 10%, 15%','Comprobante digital — sin impresora','Fiar una venta a un cliente con un clic'],
    Screen:ScreenPOS },
  { navIdx:1, icon:Package, color:'#ea580c', num:'02', label:'Inventario inteligente',
    title:'Ponés el costo,\nel sistema calcula el precio',
    desc:'Ingresás el costo de lista, el descuento del proveedor y el margen. El precio de venta sale solo. Con cada venta, el stock se descuenta automáticamente.',
    points:['Precio de venta calculado en tiempo real','Ganancia por unidad antes de guardar','Código de barras EAN para el POS','Alerta cuando el stock llega al mínimo'],
    Screen:ScreenInventory },
  { navIdx:2, icon:Users, color:'#7c3aed', num:'03', label:'Clientes y fiados',
    title:'Nunca más perdés\nun peso de fiado',
    desc:'Llevás la cuenta corriente de cada cliente. Fiás desde el POS con un clic. Si cambiás el precio de un producto, los fiados se recalculan al valor actual.',
    points:['Fiado directo desde el punto de venta','Saldo recalculado si cambiás precios','Historial de pagos por cliente','Cobro en efectivo, transferencia o MP'],
    Screen:ScreenCustomers },
  { navIdx:3, icon:Truck, color:'#2563eb', num:'04', label:'Proveedores',
    title:'Sabés exactamente\ncuánto debés y cuándo vence',
    desc:'Cargás cada factura con su condición de pago y registrás los abonos. El sistema muestra el saldo y avisa cuando una factura está por vencer.',
    points:['Condiciones: contado, 15, 30, 60, 90 días','Alerta de facturas vencidas en rojo','Pagos parciales con múltiples medios','Saldo por proveedor siempre actualizado'],
    Screen:ScreenSuppliers },
  { navIdx:4, icon:RotateCcw, color:'#0891b2', num:'05', label:'Devoluciones',
    title:'Registrás la rotura,\nel proveedor acredita',
    desc:'Cuando el proveedor entrega mercadería dañada o vencida, registrás la devolución. El sistema la vincula con la factura y lleva el estado hasta el crédito.',
    points:['Vinculada a la factura original','Estado: Pendiente → Acreditado','Historial por proveedor y producto','Monto acreditado resta de la deuda'],
    Screen:ScreenReturns },
  { navIdx:5, icon:BarChart3, color:'#d97706', num:'06', label:'Reportes',
    title:'Tus números,\nactualizados al momento',
    desc:'Cuánto facturaste, cuánto fue ganancia neta y qué productos rotan más. Filtrás por hoy, semana, mes o cualquier rango de fechas.',
    points:['Facturación y ganancia neta por período','Revenue por rubro con gráfico visual','Ranking de más vendidos del período','Historial de cada venta con detalle'],
    Screen:ScreenReports },
  { navIdx:6, icon:UserCheck, color:'#6d28d9', num:'07', label:'Usuarios y roles',
    title:'El dueño controla,\nlos cajeros cobran',
    desc:'Invitás a tus cajeros por email. Ellos acceden solo al POS, clientes y fiados. Vos sos el único que ve los reportes, precios y configuración.',
    points:['1 dueño con acceso total','Hasta 2 cajeros con acceso restringido','Invitación por correo electrónico','Permisos que no se pueden saltar'],
    Screen:ScreenUsers },
] as const;

// ─── Main component ──────────────────────────────────────────────────────────
export function ScrollDemo() {
  const [active, setActive] = useState(0);
  const triggers  = useRef<(HTMLDivElement | null)[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  useEffect(() => {
    const obs: IntersectionObserver[] = [];
    triggers.current.forEach((el, i) => {
      if (!el) return;
      const o = new IntersectionObserver(
        ([e]) => { if (e.isIntersecting) setActive(i); },
        { threshold: 0.5 },
      );
      o.observe(el);
      obs.push(o);
    });
    return () => obs.forEach(o => o.disconnect());
  }, []);

  const goTo = (i: number) => {
    const idx = Math.max(0, Math.min(STEPS.length - 1, i));
    if (!wrapperRef.current) return;
    const top = wrapperRef.current.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top + idx * window.innerHeight, behavior: 'smooth' });
  };

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const dx = touchStartX.current - e.changedTouches[0].clientX;
    const dy = touchStartY.current - e.changedTouches[0].clientY;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 44) {
      goTo(dx > 0 ? active + 1 : active - 1);
    } else if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 44) {
      goTo(dy > 0 ? active + 1 : active - 1);
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  const s = STEPS[active];
  const Icon = s.icon;

  return (
    <>
      <style>{`
        @keyframes appFloat {
          0%,100% { transform: rotateY(-7deg) rotateX(2deg) translateY(0px); }
          50%      { transform: rotateY(-7deg) rotateX(2deg) translateY(-10px); }
        }
        .ventra-window-3d { animation: appFloat 8s ease-in-out infinite; }
        .ventra-window-3d:hover {
          animation: none !important;
          transform: rotateY(-1deg) rotateX(0.5deg) translateY(-4px) !important;
          transition: transform .5s cubic-bezier(.4,0,.2,1) !important;
        }
      `}</style>

      {/* ── Desktop ────────────────────────────────────────────────────────── */}
      <div className="hidden md:block" style={{
        background: '#080e1a',
        backgroundImage: 'radial-gradient(rgba(255,255,255,.035) 1px, transparent 1px)',
        backgroundSize: '44px 44px',
        position: 'relative',
      }}>
        <div ref={wrapperRef} style={{ position: 'relative', height: `${STEPS.length * 100}vh` }}>

          {/* Sticky frame */}
          <div
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            style={{ position:'sticky', top:0, height:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'0 40px 0 60px', gap:60, overflow:'hidden' }}
          >

            {/* Ambient orbs */}
            <div style={{ position:'absolute', inset:0, pointerEvents:'none', overflow:'hidden' }}>
              <div style={{ position:'absolute', top:'10%', right:'5%', width:500, height:500, background:`radial-gradient(circle, ${s.color}15 0%, transparent 65%)`, borderRadius:'50%', filter:'blur(50px)', transition:'background 1s' }} />
              <div style={{ position:'absolute', bottom:'5%', left:'20%', width:320, height:320, background:'radial-gradient(circle, #3b82f618 0%, transparent 70%)', borderRadius:'50%', filter:'blur(40px)' }} />
            </div>

            {/* LEFT: text */}
            <div style={{ width:340, flexShrink:0, position:'relative', zIndex:2, height:'60vh', display:'flex', flexDirection:'column', justifyContent:'center' }}>
              {STEPS.map((st, i) => {
                const StIcon = st.icon;
                const isAct = active === i;
                return (
                  <div key={i} style={{
                    position:'absolute', width:'100%',
                    opacity: isAct ? 1 : 0,
                    transform: isAct ? 'translateY(0) translateX(0)' : active > i ? 'translateY(-24px) translateX(-10px)' : 'translateY(24px) translateX(10px)',
                    transition: 'opacity .55s cubic-bezier(.4,0,.2,1), transform .55s cubic-bezier(.4,0,.2,1)',
                    pointerEvents: isAct ? 'auto' : 'none',
                  }}>
                    {/* Module tag */}
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
                      <span style={{ fontFamily:'monospace', fontSize:12, fontWeight:800, color:st.color, letterSpacing:'.1em' }}>{st.num}</span>
                      <span style={{ width:28, height:1, background:`${st.color}50` }} />
                      <div style={{ display:'flex', alignItems:'center', gap:6, background:`${st.color}15`, border:`1px solid ${st.color}30`, borderRadius:20, padding:'3px 10px 3px 8px' }}>
                        <StIcon size={11} style={{ stroke:st.color }} />
                        <span style={{ fontSize:10.5, fontWeight:700, color:st.color }}>{st.label}</span>
                      </div>
                    </div>
                    {/* Title */}
                    <h2 style={{ fontFamily:'var(--font-fraunces)', fontSize:38, fontWeight:800, lineHeight:1.12, letterSpacing:'-.03em', color:'#f1f5f9', marginBottom:18, whiteSpace:'pre-line' }}>
                      {st.title}
                    </h2>
                    {/* Desc */}
                    <p style={{ fontSize:15, lineHeight:1.75, color:'#94a3b8', marginBottom:24 }}>
                      {st.desc}
                    </p>
                    {/* Bullets */}
                    <ul style={{ listStyle:'none', padding:0, margin:0 }}>
                      {st.points.map((pt,j) => (
                        <li key={j} style={{ display:'flex', alignItems:'flex-start', gap:10, marginBottom:10, fontSize:14, color:'#cbd5e1', lineHeight:1.5 }}>
                          <span style={{ marginTop:3, width:18, height:18, borderRadius:6, background:`${st.color}20`, border:`1px solid ${st.color}35`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                            <Check size={9} style={{ stroke:st.color }} />
                          </span>
                          {pt}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}

              {/* Nav: arrows + dots */}
              <div style={{ position:'absolute', bottom:-70, left:0, right:0, display:'flex', alignItems:'center', gap:8 }}>
                {/* Prev */}
                <button
                  onClick={() => goTo(active - 1)}
                  disabled={active === 0}
                  style={{ width:34, height:34, borderRadius:10, border:'1px solid rgba(255,255,255,.12)', background:'rgba(255,255,255,.07)', display:'flex', alignItems:'center', justifyContent:'center', cursor:active===0?'not-allowed':'pointer', opacity:active===0?0.28:1, transition:'opacity .2s, background .2s', flexShrink:0, outline:'none' }}
                  aria-label="Anterior"
                >
                  <ChevronLeft size={16} style={{ stroke:'#94a3b8' }} />
                </button>

                {/* Dots */}
                {STEPS.map((st, i) => (
                  <div
                    key={i}
                    onClick={() => goTo(i)}
                    title={st.label}
                    style={{ height:6, width:active===i?26:6, borderRadius:3, background:active===i?st.color:'#1e293b', border:`1px solid ${active===i?st.color:'#334155'}`, transition:'all .4s cubic-bezier(.4,0,.2,1)', cursor:'pointer', flexShrink:0 }}
                  />
                ))}

                <span style={{ fontSize:11, color:'#475569', fontWeight:600, marginLeft:2 }}>{active+1}/{STEPS.length}</span>

                {/* Next */}
                <button
                  onClick={() => goTo(active + 1)}
                  disabled={active === STEPS.length - 1}
                  style={{ width:34, height:34, borderRadius:10, border:'1px solid rgba(255,255,255,.12)', background:'rgba(255,255,255,.07)', display:'flex', alignItems:'center', justifyContent:'center', cursor:active===STEPS.length-1?'not-allowed':'pointer', opacity:active===STEPS.length-1?0.28:1, transition:'opacity .2s, background .2s', flexShrink:0, outline:'none' }}
                  aria-label="Siguiente"
                >
                  <ChevronRight size={16} style={{ stroke:'#94a3b8' }} />
                </button>
              </div>
            </div>

            {/* RIGHT: 3D app window */}
            <div style={{ flex:1, display:'flex', justifyContent:'center', alignItems:'center', position:'relative', perspective:'1600px', perspectiveOrigin:'60% 50%' }}>
              {/* Glow under window */}
              <div style={{ position:'absolute', bottom:'8%', left:'50%', transform:'translateX(-50%)', width:'60%', height:40, background:`${s.color}30`, filter:'blur(24px)', borderRadius:'50%', transition:'background .8s' }} />

              <div
                className="ventra-window-3d"
                style={{
                  width:'100%', maxWidth:780,
                  borderRadius:14, overflow:'hidden',
                  boxShadow:`0 0 0 1px ${s.color}25, 0 50px 120px rgba(0,0,0,.75), 20px 20px 60px rgba(0,0,0,.4)`,
                  position:'relative', zIndex:1,
                  transition:'box-shadow .8s',
                  transformStyle:'preserve-3d',
                }}
              >
                {/* Browser chrome */}
                <div style={{ height:36, background:'#1a2535', display:'flex', alignItems:'center', gap:6, padding:'0 14px', flexShrink:0 }}>
                  {['#ff5f57','#febc2e','#28c840'].map(c=>(
                    <i key={c} style={{ width:11, height:11, borderRadius:'50%', background:c, display:'block', flexShrink:0 }} />
                  ))}
                  <div style={{ flex:1, margin:'0 10px', height:23, borderRadius:7, background:'#243040', display:'flex', alignItems:'center', padding:'0 10px', gap:6 }}>
                    <div style={{ width:6, height:6, borderRadius:'50%', background:'#3d5166', flexShrink:0 }} />
                    <span style={{ fontSize:10.5, color:'#64748b', fontFamily:'monospace' }}>ventra-arg.vercel.app</span>
                    <div style={{ marginLeft:'auto', width:12, height:12, borderRadius:3, background:'#3d5166' }} />
                  </div>
                </div>

                {/* App shell */}
                <div style={{ display:'flex', height:462 }}>
                  {/* Sidebar */}
                  <div style={{ width:175, background:'#0f172a', display:'flex', flexDirection:'column', flexShrink:0, borderRight:'1px solid rgba(255,255,255,.05)' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 12px', borderBottom:'1px solid rgba(255,255,255,.06)' }}>
                      <div style={{ width:28, height:28, borderRadius:8, background:'linear-gradient(135deg,#0d9f6e,#12c98a)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:900, color:'#064e3b', flexShrink:0 }}>A</div>
                      <div>
                        <div style={{ fontSize:10.5, fontWeight:800, color:'#f1f5f9', lineHeight:1 }}>VENTRA ARG</div>
                        <div style={{ fontSize:8.5, color:'rgba(255,255,255,.35)', marginTop:2, lineHeight:1 }}>UGARTE</div>
                      </div>
                    </div>
                    <nav style={{ flex:1, padding:'6px 5px', display:'flex', flexDirection:'column', gap:1, overflowY:'auto' }}>
                      {NAV.map((item, i) => {
                        const NI = item.icon;
                        const isAct = s.navIdx === i;
                        return (
                          <div key={item.label} style={{ display:'flex', alignItems:'center', gap:7, padding:'6px 9px', borderRadius:9, background:isAct?s.color:'transparent', transition:'background .35s' }}>
                            <NI size={13} style={{ stroke:isAct?'#fff':'rgba(255,255,255,.35)', flexShrink:0, transition:'stroke .35s' }} />
                            <span style={{ fontSize:10.5, fontWeight:isAct?700:500, color:isAct?'#fff':'rgba(255,255,255,.4)', transition:'color .35s', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.label}</span>
                          </div>
                        );
                      })}
                    </nav>
                    <div style={{ padding:'6px 5px', borderTop:'1px solid rgba(255,255,255,.06)' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:7, padding:'5px 9px', borderRadius:8, background:'rgba(255,255,255,.04)' }}>
                        <div style={{ width:24, height:24, borderRadius:'50%', background:`${s.color}30`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:800, color:s.color, flexShrink:0 }}>U</div>
                        <div style={{ overflow:'hidden' }}>
                          <div style={{ fontSize:9.5, fontWeight:700, color:'#f1f5f9', lineHeight:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>UGARTE ALAN</div>
                          <div style={{ fontSize:8, color:'rgba(255,255,255,.3)', marginTop:1 }}>OWNER</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Screen area */}
                  <div style={{ flex:1, position:'relative', overflow:'hidden', background:'#f9fafb' }}>
                    {STEPS.map(({ Screen }, i) => (
                      <div key={i} style={{
                        position:'absolute', inset:0,
                        opacity: active===i ? 1 : 0,
                        transform: active===i ? 'translateX(0)' : active>i ? 'translateX(-16px)' : 'translateX(16px)',
                        transition: 'opacity .5s cubic-bezier(.4,0,.2,1), transform .5s cubic-bezier(.4,0,.2,1)',
                        pointerEvents: active===i ? 'auto' : 'none',
                      }}>
                        <Screen />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Scroll triggers */}
          {STEPS.map((_, i) => (
            <div key={i} ref={el => { triggers.current[i] = el; }} style={{ position:'absolute', top:`${i*100}vh`, height:'100vh', width:1, opacity:0, pointerEvents:'none' }} />
          ))}
        </div>
      </div>

      {/* ── Mobile ─────────────────────────────────────────────────────────── */}
      <div className="md:hidden" style={{ background:'#080e1a', padding:'60px 20px' }}>
        <div style={{ textAlign:'center', marginBottom:48 }}>
          <span style={{ fontSize:11, fontWeight:800, textTransform:'uppercase', letterSpacing:'.1em', color:'#ea580c' }}>Todo incluido</span>
          <h2 style={{ fontFamily:'var(--font-fraunces)', fontSize:28, fontWeight:800, color:'#f8fafc', marginTop:8, lineHeight:1.2, letterSpacing:'-.02em' }}>Así se ve por adentro</h2>
        </div>
        {STEPS.map((st) => {
          const StIcon = st.icon;
          const Screen = st.Screen;
          return (
            <div key={st.num} style={{ marginBottom:60 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
                <span style={{ fontFamily:'monospace', fontSize:11, fontWeight:800, color:st.color }}>{st.num}</span>
                <span style={{ width:20, height:1, background:`${st.color}50` }} />
                <div style={{ display:'flex', alignItems:'center', gap:5, background:`${st.color}15`, border:`1px solid ${st.color}25`, borderRadius:20, padding:'3px 9px' }}>
                  <StIcon size={11} style={{ stroke:st.color }} />
                  <span style={{ fontSize:10, fontWeight:700, color:st.color }}>{st.label}</span>
                </div>
              </div>
              <h3 style={{ fontFamily:'var(--font-fraunces)', fontSize:22, fontWeight:800, color:'#f8fafc', lineHeight:1.2, letterSpacing:'-.02em', marginBottom:10, whiteSpace:'pre-line' }}>{st.title}</h3>
              <p style={{ fontSize:14, color:'#94a3b8', lineHeight:1.7, marginBottom:16 }}>{st.desc}</p>
              {/* Mini window */}
              <div style={{ borderRadius:12, overflow:'hidden', boxShadow:`0 0 0 1px ${st.color}25, 0 24px 60px rgba(0,0,0,.5)`, marginBottom:16, height:280, background:'#0f172a' }}>
                <div style={{ height:28, background:'#1a2535', display:'flex', alignItems:'center', gap:5, padding:'0 12px' }}>
                  {['#ff5f57','#febc2e','#28c840'].map(c=><i key={c} style={{ width:9, height:9, borderRadius:'50%', background:c, display:'block' }} />)}
                  <span style={{ marginLeft:6, fontSize:9, color:'#475569', fontFamily:'monospace' }}>ventra-arg.vercel.app</span>
                </div>
                <div style={{ display:'flex', height:252, overflow:'hidden' }}>
                  <div style={{ width:30, background:'#0f172a', display:'flex', flexDirection:'column', padding:'6px 0', gap:2, flexShrink:0, borderRight:'1px solid rgba(255,255,255,.04)' }}>
                    {NAV.map((item, j) => {
                      const NI = item.icon;
                      return (
                        <div key={j} style={{ width:22, height:22, borderRadius:5, margin:'0 auto', background:st.navIdx===j?st.color:'transparent', display:'flex', alignItems:'center', justifyContent:'center' }}>
                          <NI size={11} style={{ stroke:st.navIdx===j?'#fff':'rgba(255,255,255,.2)' }} />
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ flex:1, overflow:'hidden', transformOrigin:'top left', transform:'scale(0.82)', width:'calc(100% / 0.82)', height:'calc(100% / 0.82)' }}>
                    <Screen />
                  </div>
                </div>
              </div>
              <ul style={{ listStyle:'none', padding:0, margin:0 }}>
                {st.points.map((pt,j) => (
                  <li key={j} style={{ display:'flex', alignItems:'flex-start', gap:9, marginBottom:9, fontSize:13, color:'#94a3b8', lineHeight:1.5 }}>
                    <span style={{ marginTop:3, width:16, height:16, borderRadius:5, background:`${st.color}18`, border:`1px solid ${st.color}30`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <Check size={8} style={{ stroke:st.color }} />
                    </span>
                    {pt}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </>
  );
}
