import { useState } from "react";

// ─── DATOS DE PRUEBA ──────────────────────────────────────────────────────────
const USUARIO_MOCK = {
  nombre: "Maya",
  racha: 5,
  recetasHoy: 3,
  limiteGratis: 3,
  esPremium: false,
};

const DESPENSA_MOCK = [
  { id: 1, nombre: "Yogurt Griego", sub: "Natural, 5% Grasa", qty: 1, unidad: "450g", etiqueta: "Alto en Proteína", img: "🥛", fondo: false },
  { id: 2, nombre: "Granola", sub: "Miel y Almendra", qty: 1, unidad: "200g", img: "🌾", fondo: true },
  { id: 3, nombre: "Miel", sub: "Silvestre", qty: 1, unidad: "0.5L", img: "🍯", fondo: true },
  { id: 4, nombre: "Plátanos", sub: "3 unidades restantes", qty: 3, unidad: "piezas", img: "🍌", fondo: true },
  { id: 5, nombre: "Proteína en Polvo", sub: "Vainilla Whey", qty: 12, unidad: "porciones", img: "💪", fondo: false },
  { id: 6, nombre: "Frutos del Bosque", sub: "Mixtos congelados", qty: 1, unidad: "bolsa", img: "🫐", fondo: true },
];

const RECETA_MOCK = {
  id: 1,
  titulo: "Helado de Proteína Premium",
  etiqueta: "Receta del Día",
  tiempo: "15 min",
  porciones: "2 Porciones",
  macros: { proteina: 32, carbos: 12, grasas: 8 },
  enDespensa: [
    { nombre: "Plátanos Congelados", qty: "2 piezas" },
    { nombre: "Cacao Sin Azúcar", qty: "1 tarro" },
    { nombre: "Sal de Mar", qty: "1 caja" },
  ],
  faltantes: [
    { nombre: "Whey Isolate (Vainilla)", etiqueta: "URGENTE", qty: null },
    { nombre: "Leche de Almendra", etiqueta: null, qty: "500ml" },
  ],
  totalCompra: "$12.45",
};

// ─── TOKENS DE DISEÑO ─────────────────────────────────────────────────────────
const T = {
  bg: "#faf9f5",
  surface: "#ffffff",
  surfaceLow: "#f5f4f0",
  surfaceContainer: "#efeeea",
  surfaceHigh: "#e9e8e4",
  primary: "#19240f",
  primaryContainer: "#2e3a23",
  primaryFixed: "#d9e8c6",
  primaryLight: "#eaf3de",
  secondary: "#8f4c35",
  secondaryContainer: "#ffa98c",
  secondaryFixed: "#ffdbd0",
  secondaryLight: "#fff0e8",
  terciario: "#5c3d6e",
  terciarioLight: "#ede0f7",
  terciarioFixed: "#d4b8e8",
  ambar: "#c47c1a",
  ambarLight: "#fff3d6",
  ambarFixed: "#fde6a0",
  outline: "#75786f",
  outlineVariant: "#c5c8bd",
  onSurface: "#1b1c1a",
  onSurfaceVariant: "#454840",
  salmon: "#E9967A",
  salmonLight: "#fdeee8",
  verde: "#556248",
  verdeVivo: "#3d7a3d",
  verdeMenta: "#d4edda",
};

// ─── ESTILOS GLOBALES ─────────────────────────────────────────────────────────
const estilosGlobales = `
  @import url('https://fonts.googleapis.com/css2?family=Libre+Caslon+Text:wght@400;700&family=DM+Sans:wght@400;500;600;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #faf9f5; font-family: 'DM Sans', sans-serif; }
  ::-webkit-scrollbar { width: 3px; }
  ::-webkit-scrollbar-thumb { background: #c5c8bd; border-radius: 99px; }
  .serif { font-family: 'Libre Caslon Text', serif; }
  .pantalla { min-height: 100vh; background: #faf9f5; display: flex; flex-direction: column; }
  .aparecer { animation: aparecer 0.4s ease forwards; }
  @keyframes aparecer { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  .tocar:active { transform: scale(0.97); transition: transform 0.1s; }
  .toggle-fondo { width: 44px; height: 24px; border-radius: 99px; background: #c5c8bd; position: relative; cursor: pointer; transition: background 0.2s; }
  .toggle-fondo.activo { background: #2e3a23; }
  .toggle-circulo { width: 20px; height: 20px; border-radius: 50%; background: white; position: absolute; top: 2px; left: 2px; transition: transform 0.2s; }
  .toggle-circulo.activo { transform: translateX(20px); }
  .chip { display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 99px; font-size: 11px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; }
  .btn-principal { width: 100%; height: 56px; background: #2e3a23; color: white; border: none; border-radius: 16px; font-family: 'DM Sans'; font-size: 14px; font-weight: 600; letter-spacing: 0.03em; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.15s; }
  .btn-principal:active { transform: scale(0.97); }
  .barra-nav { display: flex; background: rgba(250,249,245,0.9); backdrop-filter: blur(14px); border-top: 0.5px solid rgba(197,200,189,0.4); padding: 8px 0 16px; }
  .nav-item { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; cursor: pointer; padding: 6px 4px; border: none; background: none; font-family: 'DM Sans'; }
  .nav-icono { width: 40px; height: 40px; border-radius: 20px; display: flex; align-items: center; justify-content: center; font-size: 18px; transition: all 0.2s; }
  .nav-etiqueta { font-size: 10px; font-weight: 500; color: #454840; }
  .nav-item.activo .nav-icono { background: #2e3a23; }
  .nav-item.activo .nav-etiqueta { color: #2e3a23; font-weight: 700; }
  .btn-qty { width: 32px; height: 32px; border-radius: 50%; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 300; transition: all 0.15s; }
  .btn-qty.mas { background: #2e3a23; color: white; }
  .btn-qty.menos { background: #e9e8e4; color: #1b1c1a; }
  .barra-macro { height: 4px; border-radius: 99px; margin-top: 8px; }
  @keyframes pulsarRacha { 0%,100%{transform:scale(1)} 50%{transform:scale(1.12)} }
  .racha-badge { animation: pulsarRacha 2s ease-in-out infinite; }
  @keyframes flotar { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
  .mascota-float { animation: flotar 3s ease-in-out infinite; }
`;

// ─── COMPONENTES COMPARTIDOS ──────────────────────────────────────────────────
function Avatar({ nombre, size = 36 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: T.primaryFixed, display: "flex",
      alignItems: "center", justifyContent: "center",
      fontSize: size * 0.36, fontWeight: 700, color: T.primaryContainer,
      border: `2.5px solid ${T.primaryFixed}`,
      boxShadow: `0 0 0 2px ${T.primaryContainer}30`,
      position: "relative", flexShrink: 0
    }}>
      {nombre ? nombre[0].toUpperCase() : "M"}
      <div style={{
        position: "absolute", top: -4, right: -4,
        width: 18, height: 18, borderRadius: "50%",
        background: T.salmon, display: "flex", alignItems: "center",
        justifyContent: "center", fontSize: 9, fontWeight: 700, color: "white",
        border: `2px solid ${T.bg}`
      }}>5</div>
    </div>
  );
}

function Toggle({ activo, onChange }) {
  return (
    <div className={`toggle-fondo ${activo ? "activo" : ""}`} onClick={() => onChange(!activo)}>
      <div className={`toggle-circulo ${activo ? "activo" : ""}`} />
    </div>
  );
}

function BarraNav({ activa, onChange }) {
  const items = [
    { id: "descubrir", label: "Descubrir" },
    { id: "despensa", label: "Despensa" },
    { id: "guardados", label: "Guardados" },
    { id: "perfil", label: "Perfil" },
  ];
  return (
    <div className="barra-nav" style={{ position: "sticky", bottom: 0, zIndex: 50 }}>
      {items.map(item => (
        <button
          key={item.id}
          className={`nav-item ${activa === item.id ? "activo" : ""}`}
          onClick={() => onChange(item.id)}
        >
          {/* Espacio reservado para icono PNG — /public/icons/icon-nav-{item.id}.png */}
          <div className="nav-icono" style={{ background: activa === item.id ? T.primaryContainer : "transparent" }}>
            <img
              src={`/icons/icon-nav-${item.id}.png`}
              alt={item.label}
              width={22}
              height={22}
              style={{ opacity: activa === item.id ? 1 : 0.45, filter: activa === item.id ? "brightness(10)" : "none" }}
              onError={e => { e.currentTarget.style.display = "none"; }}
            />
          </div>
          <span className="nav-etiqueta">{item.label}</span>
        </button>
      ))}
    </div>
  );
}

// ─── PANTALLA 1: BIENVENIDA / ONBOARDING ─────────────────────────────────────
function PantallaOnboarding({ onCompletar }) {
  const [seleccionado, setSeleccionado] = useState(null);
  const [restricciones, setRestricciones] = useState({ lactosa: false, gluten: false, vegano: false });

  const perfiles = [
    { id: "estudiante", icon: "🎓", label: "Estudiante", sub: "Comidas rápidas y económicas.", color: T.primaryLight, borde: T.primaryContainer },
    { id: "atleta", icon: "🏋️", label: "Atleta", sub: "Alta proteína y combustible de alto rendimiento.", color: T.secondaryLight, borde: T.secondary },
    { id: "profesional", icon: "💼", label: "Profesional", sub: "Meal prep y cocina sofisticada.", color: "#f6ded1", borde: "#a0522d" },
    { id: "cocinero", icon: "🍳", label: "Cocinero en Casa", sub: "Cocina creativa y relajada.", color: T.verdeMenta, borde: T.verdeVivo },
  ];

  const listaRestricciones = [
    { key: "lactosa", icon: "🥛", label: "Intolerante a la Lactosa", color: T.ambarLight },
    { key: "gluten", icon: "🌾", label: "Sin Gluten", color: T.salmonLight },
    { key: "vegano", icon: "🌱", label: "Vegano / Base Vegetal", color: T.verdeMenta },
  ];

  return (
    <div className="pantalla aparecer" style={{ padding: "0 20px 40px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 0 8px", position: "sticky", top: 0, background: `${T.bg}cc`, backdropFilter: "blur(8px)", zIndex: 10 }}>
        <span className="serif" style={{ fontSize: 24, fontWeight: 400, color: T.primary }}>Munchy</span>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: T.surfaceContainer, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, cursor: "pointer", color: T.onSurfaceVariant }}>?</div>
      </div>

      {/* Hero */}
      <div style={{ paddingTop: 28, paddingBottom: 36 }}>
        <div style={{ display: "inline-block", background: T.ambarFixed, borderRadius: 99, padding: "4px 14px", marginBottom: 16 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: T.ambar, letterSpacing: "0.06em", textTransform: "uppercase" }}>✨ Tu plan personalizado</span>
        </div>
        <h1 className="serif" style={{ fontSize: 42, lineHeight: 1.1, color: T.primary, fontWeight: 400, marginBottom: 16 }}>
          Nutre tu <br /><em style={{ color: T.secondary }}>mejor versión.</em>
        </h1>
        <p style={{ fontSize: 16, lineHeight: 1.7, color: T.onSurfaceVariant, maxWidth: 300 }}>
          Cuéntanos sobre ti para personalizar tu experiencia culinaria.
        </p>
      </div>

      {/* Paso 1 */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 24, height: 24, borderRadius: "50%", background: T.primaryContainer, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "white" }}>1</span>
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: T.outline, letterSpacing: "0.08em", textTransform: "uppercase" }}>Paso 01 / 02</span>
          </div>
          <span className="serif" style={{ fontSize: 20, color: T.onSurface }}>Tu estilo de vida</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {perfiles.map(p => (
            <button key={p.id} className="tocar" onClick={() => setSeleccionado(p.id)} style={{
              display: "flex", alignItems: "center", padding: "14px 16px",
              background: seleccionado === p.id ? p.color : T.surface,
              borderRadius: 16,
              border: `${seleccionado === p.id ? 2 : 1}px solid ${seleccionado === p.id ? p.borde : T.outlineVariant + "40"}`,
              cursor: "pointer", textAlign: "left", transition: "all 0.2s", gap: 14,
              boxShadow: seleccionado === p.id ? `0 4px 16px ${p.borde}25` : "0 2px 12px rgba(0,0,0,0.04)"
            }}>
              <div style={{ width: 50, height: 50, borderRadius: "50%", background: seleccionado === p.id ? "white" : p.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0, boxShadow: `0 2px 8px ${p.borde}30`, transition: "all 0.2s" }}>{p.icon}</div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 15, fontWeight: 600, color: T.primary, marginBottom: 2 }}>{p.label}</p>
                <p style={{ fontSize: 12, color: T.onSurfaceVariant }}>{p.sub}</p>
              </div>
              <div style={{ width: 22, height: 22, borderRadius: "50%", background: seleccionado === p.id ? p.borde : T.surfaceHigh, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}>
                {seleccionado === p.id && <span style={{ color: "white", fontSize: 12, fontWeight: 700 }}>✓</span>}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Paso 2 */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 24, height: 24, borderRadius: "50%", background: T.salmon, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "white" }}>2</span>
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: T.outline, letterSpacing: "0.08em", textTransform: "uppercase" }}>Paso 02 / 02</span>
          </div>
          <span className="serif" style={{ fontSize: 20, color: T.onSurface }}>Restricciones</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {listaRestricciones.map((item) => (
            <div key={item.key} onClick={() => setRestricciones(r => ({ ...r, [item.key]: !r[item.key] }))} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "14px 16px",
              background: restricciones[item.key] ? item.color : T.surface,
              borderRadius: 14,
              border: `1px solid ${restricciones[item.key] ? T.primaryContainer + "50" : T.outlineVariant + "40"}`,
              cursor: "pointer", transition: "all 0.2s"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 11, background: restricciones[item.key] ? "white" : T.surfaceHigh, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, transition: "all 0.2s" }}>{item.icon}</div>
                <span style={{ fontSize: 14, fontWeight: 500, color: T.onSurface }}>{item.label}</span>
              </div>
              <Toggle activo={restricciones[item.key]} onChange={v => setRestricciones(r => ({ ...r, [item.key]: v }))} />
            </div>
          ))}
        </div>
      </div>

      {/* Imagen decorativa */}
      <div style={{ position: "relative", height: 180, borderRadius: 22, overflow: "hidden", marginBottom: 32 }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, #3d2b1f 0%, #2d4a2d 50%, #4a2060 100%)" }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 90, filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.3))" }}>🥗</div>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(25,36,15,0.75) 0%, transparent 55%)", display: "flex", alignItems: "flex-end", padding: "18px 20px" }}>
          <p style={{ color: "white", fontSize: 13, fontStyle: "italic" }}>"Que la comida sea tu medicina." — Hipócrates</p>
        </div>
        <div style={{ position: "absolute", top: 14, right: 16, width: 44, height: 44, borderRadius: "50%", background: `${T.salmon}60`, backdropFilter: "blur(4px)" }} />
        <div style={{ position: "absolute", top: 30, right: 44, width: 22, height: 22, borderRadius: "50%", background: `${T.ambarFixed}80` }} />
      </div>

      {/* CTA */}
      <button className="btn-principal" onClick={onCompletar} style={{ opacity: seleccionado ? 1 : 0.5 }}>
        ✨ Crear Mi Plan →
      </button>
    </div>
  );
}

// ─── PANTALLA 2: DASHBOARD PRINCIPAL ─────────────────────────────────────────
function PantallaDashboard({ usuario, onNavegar, onVerReceta }) {
  const [despensa, setDespensa] = useState(DESPENSA_MOCK);
  const [categoriaActiva, setCategoriaActiva] = useState("todo");

  const actualizarQty = (id, delta) => {
    setDespensa(items => items.map(it => it.id === id ? { ...it, qty: Math.max(0, it.qty + delta) } : it));
  };

  const categorias = [
    { id: "todo", label: "Todo", icon: "🌿", color: T.primaryLight, borde: T.primaryContainer },
    { id: "proteina", label: "Proteína", icon: "🥩", color: T.secondaryLight, borde: T.secondary },
    { id: "frutas", label: "Frutas", icon: "🍓", color: T.ambarLight, borde: T.ambar },
    { id: "lacteos", label: "Lácteos", icon: "🧀", color: T.terciarioLight, borde: T.terciario },
  ];

  const fondosGrid = [T.primaryLight, T.secondaryLight, T.ambarLight, T.verdeMenta, T.terciarioLight, T.salmonLight];

  return (
    <div className="pantalla aparecer">
      <div style={{ flex: 1, overflowY: "auto", padding: "0 20px 16px" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 0 4px", position: "sticky", top: 0, background: `${T.bg}e8`, backdropFilter: "blur(14px)", zIndex: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Avatar nombre={usuario.nombre} size={40} />
            <span className="serif" style={{ fontSize: 20, color: T.primary }}>Munchy</span>
          </div>
          <div className="racha-badge" style={{ display: "flex", alignItems: "center", gap: 6, background: T.ambarFixed, borderRadius: 99, padding: "7px 14px", border: `1.5px solid ${T.ambar}40` }}>
            <span style={{ fontSize: 16 }}>🔥</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: T.ambar }}>{usuario.racha} días seguidos</span>
          </div>
        </div>

        {/* Saludo */}
        <div style={{ paddingTop: 24, paddingBottom: 28 }}>
          <h2 className="serif" style={{ fontSize: 26, color: T.primary, fontWeight: 400, marginBottom: 6 }}>
            Buenos días, {usuario.nombre}. 👋
          </h2>
          <p style={{ fontSize: 14, color: T.onSurfaceVariant, lineHeight: 1.6 }}>
            Tienes <strong style={{ color: T.primaryContainer }}>{despensa.length} ingredientes</strong> en tu despensa. ¿Qué se te antoja hoy?
          </p>
        </div>

        {/* Mascota / IA */}
        <div style={{ background: T.primaryContainer, borderRadius: 22, padding: "18px 20px", marginBottom: 28, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -20, right: -20, width: 100, height: 100, borderRadius: "50%", background: `${T.primaryFixed}15` }} />
          <div style={{ position: "absolute", bottom: -15, left: -15, width: 70, height: 70, borderRadius: "50%", background: `${T.salmon}20` }} />
          <div style={{ display: "flex", alignItems: "flex-start", gap: 14, position: "relative" }}>
            <div className="mascota-float" style={{ width: 52, height: 52, borderRadius: "50%", background: T.primaryFixed, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, flexShrink: 0 }}>🤖</div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: `${T.primaryFixed}80`, textTransform: "uppercase", marginBottom: 6 }}>Munchie dice</p>
              <p className="serif" style={{ fontSize: 17, color: T.primaryFixed, lineHeight: 1.4, marginBottom: 14 }}>
                "¡Tus plátanos están perfectos para un batido de proteína ahora mismo! 🍌"
              </p>
              <button onClick={onVerReceta} style={{ background: T.primaryFixed, border: "none", borderRadius: 12, padding: "9px 16px", fontSize: 13, fontWeight: 700, color: T.primaryContainer, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                ⚡ Ver la receta →
              </button>
            </div>
          </div>
        </div>

        {/* Filtros de categoría */}
        <div style={{ display: "flex", gap: 8, marginBottom: 22, overflowX: "auto", paddingBottom: 4 }}>
          {categorias.map(cat => (
            <button key={cat.id} onClick={() => setCategoriaActiva(cat.id)} style={{
              display: "flex", alignItems: "center", gap: 6, padding: "8px 14px",
              borderRadius: 99, border: `1.5px solid ${categoriaActiva === cat.id ? cat.borde : T.outlineVariant + "50"}`,
              background: categoriaActiva === cat.id ? cat.color : T.surface,
              cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.2s",
              fontSize: 13, fontWeight: categoriaActiva === cat.id ? 700 : 500,
              color: categoriaActiva === cat.id ? cat.borde : T.onSurfaceVariant
            }}>
              <span>{cat.icon}</span> {cat.label}
            </button>
          ))}
        </div>

        {/* Mi Despensa */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
            <h3 className="serif" style={{ fontSize: 22, color: T.primary, fontWeight: 400 }}>Mi Despensa</h3>
            <button style={{ fontSize: 13, fontWeight: 600, color: T.secondary, background: T.salmonLight, border: "none", borderRadius: 99, padding: "5px 12px", cursor: "pointer" }}>Editar</button>
          </div>

          {/* Tarjeta destacada */}
          {despensa[0] && (
            <div style={{ background: T.surface, borderRadius: 22, padding: "18px", marginBottom: 12, border: `1px solid ${T.primaryFixed}`, boxShadow: `0 4px 20px ${T.primaryContainer}12` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  {despensa[0].etiqueta && (
                    <div className="chip" style={{ background: `${T.salmon}22`, color: T.salmon, marginBottom: 10 }}>{despensa[0].etiqueta}</div>
                  )}
                  <p className="serif" style={{ fontSize: 22, color: T.onSurface, fontWeight: 400, marginBottom: 3 }}>{despensa[0].nombre}</p>
                  <p style={{ fontSize: 13, color: T.onSurfaceVariant }}>{despensa[0].sub}</p>
                </div>
                <div style={{ fontSize: 52, marginLeft: 12, filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.1))" }}>{despensa[0].img}</div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16, paddingTop: 14, borderTop: `1px solid ${T.outlineVariant}30` }}>
                <span style={{ fontSize: 18, fontWeight: 600, color: T.onSurface }}>{despensa[0].unidad}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <button className="btn-qty menos" onClick={() => actualizarQty(1, -1)}>−</button>
                  <span style={{ fontSize: 16, fontWeight: 700, color: T.onSurface, minWidth: 24, textAlign: "center" }}>{despensa[0].qty}</span>
                  <button className="btn-qty mas" onClick={() => actualizarQty(1, 1)}>+</button>
                </div>
              </div>
            </div>
          )}

          {/* Cuadrícula colorida */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {despensa.slice(1).map((item, idx) => (
              <div key={item.id} style={{ background: T.surface, borderRadius: 18, overflow: "hidden", border: `1px solid ${T.outlineVariant}25`, boxShadow: "0 2px 10px rgba(0,0,0,0.04)" }}>
                <div style={{ height: 88, background: fondosGrid[idx % fondosGrid.length], display: "flex", alignItems: "center", justifyContent: "center", fontSize: 44, filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.08))" }}>
                  {item.img}
                </div>
                <div style={{ padding: "12px 13px 13px" }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: T.onSurface, marginBottom: 1 }}>{item.nombre}</p>
                  <p style={{ fontSize: 11, color: T.onSurfaceVariant, marginBottom: 10 }}>{item.sub}</p>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: T.onSurface }}>{item.qty} {item.unidad}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <button className="btn-qty menos" style={{ width: 26, height: 26, fontSize: 15 }} onClick={() => actualizarQty(item.id, -1)}>−</button>
                      <button className="btn-qty mas" style={{ width: 26, height: 26, fontSize: 15 }} onClick={() => actualizarQty(item.id, 1)}>+</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA generar */}
        <button className="btn-principal" onClick={onVerReceta} style={{ borderRadius: 99, letterSpacing: "0.05em", textTransform: "uppercase", boxShadow: `0 8px 24px ${T.primaryContainer}40` }}>
          <span>⚡</span> Generar Antojo Fit <span style={{ opacity: 0.8 }}>✨</span>
        </button>
      </div>

      <BarraNav activa="despensa" onChange={onNavegar} />
    </div>
  );
}

// ─── PANTALLA 3: DETALLE DE RECETA ────────────────────────────────────────────
function PantallaReceta({ receta, onVolver, onNavegar }) {
  const [cocinada, setCocinada] = useState(false);

  const macros = [
    { label: "PROTEÍNA", val: receta.macros.proteina, color: T.primaryContainer, fondo: T.primaryLight },
    { label: "CARBOS", val: receta.macros.carbos, color: T.salmon, fondo: T.salmonLight },
    { label: "GRASAS", val: receta.macros.grasas, color: T.ambar, fondo: T.ambarLight },
  ];

  return (
    <div className="pantalla aparecer">
      <div style={{ flex: 1, overflowY: "auto" }}>

        {/* Hero */}
        <div style={{ position: "relative", height: 290, background: "linear-gradient(145deg, #3d2b1f, #1a2e1a)", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 130, filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.4))" }}>🍦</div>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(25,36,15,0.9) 0%, rgba(25,36,15,0.05) 55%)" }} />
          <div style={{ position: "absolute", top: 20, right: 20, width: 60, height: 60, borderRadius: "50%", background: `${T.salmon}30`, backdropFilter: "blur(4px)" }} />
          <div style={{ position: "absolute", top: 50, right: 55, width: 30, height: 30, borderRadius: "50%", background: `${T.ambarFixed}50` }} />

          <button onClick={onVolver} style={{ position: "absolute", top: 20, left: 20, width: 38, height: 38, borderRadius: "50%", background: "rgba(255,255,255,0.2)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.3)", color: "white", fontSize: 18, cursor: "pointer" }}>←</button>

          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "20px" }}>
            <div className="chip" style={{ background: T.salmon, color: "white", marginBottom: 10 }}>✨ {receta.etiqueta}</div>
            <h2 className="serif" style={{ fontSize: 26, color: "white", fontWeight: 400, lineHeight: 1.2, marginBottom: 10 }}>{receta.titulo}</h2>
            <div style={{ display: "flex", gap: 16 }}>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", display: "flex", alignItems: "center", gap: 5 }}>⏱ {receta.tiempo}</span>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", display: "flex", alignItems: "center", gap: 5 }}>🍽 {receta.porciones}</span>
            </div>
          </div>
        </div>

        <div style={{ padding: "24px 20px 100px" }}>

          {/* Macros con color */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 32 }}>
            {macros.map(m => (
              <div key={m.label} style={{ background: m.fondo, borderRadius: 16, padding: "14px 12px", border: `1px solid ${m.color}25` }}>
                <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", color: m.color, textTransform: "uppercase", marginBottom: 5 }}>{m.label}</p>
                <p style={{ fontSize: 24, fontWeight: 400, color: T.onSurface }}><span className="serif">{m.val}</span><span style={{ fontSize: 12, marginLeft: 2, color: T.onSurfaceVariant }}>g</span></p>
                <div className="barra-macro" style={{ background: `${m.color}30` }}>
                  <div style={{ width: `${Math.min(100, m.val * 2.5)}%`, height: "100%", borderRadius: 99, background: m.color }} />
                </div>
              </div>
            ))}
          </div>

          {/* Inventario Inteligente */}
          <h3 className="serif" style={{ fontSize: 22, color: T.primary, fontWeight: 400, marginBottom: 16 }}>Inventario Inteligente</h3>

          {/* En despensa */}
          <div style={{ background: T.primaryLight, borderRadius: 18, border: `1px solid ${T.primaryContainer}25`, marginBottom: 12, overflow: "hidden" }}>
            <div style={{ padding: "13px 18px", display: "flex", alignItems: "center", gap: 8, borderBottom: `1px solid ${T.primaryContainer}20` }}>
              <div style={{ width: 24, height: 24, borderRadius: "50%", background: T.primaryContainer, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "white", fontSize: 12 }}>✓</span>
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: T.primaryContainer }}>En tu despensa</span>
            </div>
            {receta.enDespensa.map((item, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "12px 18px", borderBottom: i < receta.enDespensa.length - 1 ? `1px solid ${T.primaryContainer}15` : "none" }}>
                <span style={{ fontSize: 14, color: T.onSurface }}>{item.nombre}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: T.primaryContainer }}>{item.qty}</span>
              </div>
            ))}
          </div>

          {/* Faltantes */}
          <div style={{ background: T.salmonLight, borderRadius: 18, border: `1px solid ${T.salmon}30`, marginBottom: 24, overflow: "hidden" }}>
            <div style={{ padding: "13px 18px", display: "flex", alignItems: "center", gap: 8, borderBottom: `1px solid ${T.salmon}20` }}>
              <div style={{ width: 24, height: 24, borderRadius: "50%", background: T.salmon, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "white", fontSize: 12 }}>🛒</span>
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: T.secondary }}>Ingredientes faltantes</span>
            </div>
            {receta.faltantes.map((item, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 18px", borderBottom: i < receta.faltantes.length - 1 ? `1px solid ${T.salmon}15` : "none" }}>
                <span style={{ fontSize: 14, color: T.onSurface }}>{item.nombre}</span>
                {item.etiqueta ? (
                  <div className="chip" style={{ background: T.salmon, color: "white" }}>{item.etiqueta}</div>
                ) : (
                  <span style={{ fontSize: 13, fontWeight: 600, color: T.salmon }}>{item.qty}</span>
                )}
              </div>
            ))}
          </div>

          {/* Botón comprar */}
          <button className="btn-principal" style={{ marginBottom: 10, boxShadow: `0 6px 20px ${T.primaryContainer}35` }}>
            🛒 &nbsp;Comprar barato en Walmart
          </button>
          <p style={{ textAlign: "center", fontSize: 12, color: T.onSurfaceVariant, marginBottom: 18 }}>
            Total estimado: <strong style={{ color: T.primaryContainer }}>{receta.totalCompra}</strong> <span style={{ color: T.outline }}>(Mejor precio encontrado)</span>
          </p>

          {/* Marcar como cocinada */}
          <button onClick={() => setCocinada(!cocinada)} style={{
            width: "100%", height: 54, borderRadius: 16,
            background: cocinada ? T.verdeMenta : "transparent",
            border: `2px solid ${cocinada ? T.verdeVivo : T.outlineVariant}`,
            fontSize: 14, fontWeight: 700,
            color: cocinada ? T.verdeVivo : T.onSurfaceVariant,
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            transition: "all 0.25s"
          }}>
            {cocinada ? "✓ ¡Cocinado! Ingredientes descontados 🔥" : "Marcar como Cocinado y Descontar Despensa"}
          </button>
        </div>
      </div>

      <BarraNav activa="descubrir" onChange={onNavegar} />
    </div>
  );
}

// ─── PANTALLA 4: BLOQUEO PREMIUM / PAYWALL ───────────────────────────────────
function PantallaPaywall({ onCerrar }) {
  const beneficios = [
    { slug: "ilimitadas", titulo: "Recetas ilimitadas", desc: "Sin límite diario, cocina lo que se te antoje.", color: T.primaryLight, borde: T.primaryContainer },
    { slug: "ia", titulo: "Modo Antojo IA", desc: "Genera recetas por estado de ánimo con IA avanzada.", color: T.terciarioLight, borde: T.terciario },
    { slug: "compras", titulo: "Lista de compras inteligente", desc: "Optimiza tu gasto y encuentra las mejores ofertas.", color: T.ambarLight, borde: T.ambar },
    { slug: "tracking", titulo: "Tracking nutricional", desc: "Registra macros y progresa hacia tus metas.", color: T.salmonLight, borde: T.salmon },
  ];

  return (
    <div className="pantalla aparecer">
      <div style={{ flex: 1, overflowY: "auto", padding: "0 20px 40px" }}>

        {/* Cerrar */}
        <div style={{ padding: "20px 0 4px", display: "flex", justifyContent: "flex-end" }}>
          <button onClick={onCerrar} style={{ width: 36, height: 36, borderRadius: "50%", background: T.surfaceContainer, border: "none", fontSize: 18, cursor: "pointer", color: T.onSurfaceVariant }}>✕</button>
        </div>

        {/* Candado hero */}
        <div style={{ textAlign: "center", padding: "16px 0 32px" }}>
          <div style={{ position: "relative", display: "inline-block", marginBottom: 24 }}>
            <div style={{ width: 90, height: 90, borderRadius: 28, background: T.primaryFixed, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto", fontSize: 44 }}>🔒</div>
            <div style={{ position: "absolute", inset: -10, borderRadius: 38, border: `2px solid ${T.primaryFixed}`, opacity: 0.4 }} />
            <div style={{ position: "absolute", inset: -20, borderRadius: 48, border: `1.5px solid ${T.primaryFixed}`, opacity: 0.2 }} />
          </div>
          <h2 className="serif" style={{ fontSize: 30, color: T.primary, fontWeight: 400, lineHeight: 1.2, marginBottom: 12 }}>
            Desbloquea el<br /><em style={{ color: T.secondary }}>Modo Antojo</em>
          </h2>
          <p style={{ fontSize: 15, color: T.onSurfaceVariant, lineHeight: 1.7, maxWidth: 270, margin: "0 auto" }}>
            Usaste tus 3 recetas gratis de hoy. Actualiza para cocinar sin límites. 🔥
          </p>
        </div>

        {/* Precio */}
        <div style={{ background: T.primaryContainer, borderRadius: 24, padding: "22px 24px", marginBottom: 28, textAlign: "center", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -20, right: -20, width: 80, height: 80, borderRadius: "50%", background: `${T.salmon}25` }} />
          <div style={{ position: "absolute", bottom: -15, left: -10, width: 55, height: 55, borderRadius: "50%", background: `${T.primaryFixed}20` }} />
          <div className="chip" style={{ background: T.ambarFixed, color: T.ambar, marginBottom: 14 }}>⭐ Modo Antojo Premium</div>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 4, marginBottom: 4 }}>
            <span className="serif" style={{ fontSize: 52, fontWeight: 700, color: T.primaryFixed }}>$3</span>
            <span style={{ fontSize: 20, color: `${T.primaryFixed}aa` }}>USD</span>
            <span style={{ fontSize: 15, color: `${T.primaryFixed}70` }}>/mes</span>
          </div>
          <p style={{ fontSize: 12, color: `${T.primaryFixed}80` }}>Cancela cuando quieras · Sin compromisos</p>
        </div>

        {/* Beneficios coloridos */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
          {beneficios.map((b, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "14px 16px", background: b.color, borderRadius: 16, border: `1px solid ${b.borde}30` }}>
              {/* Espacio reservado para PNG — /public/icons/icon-perk-{b.slug}.png */}
              <div style={{ width: 44, height: 44, borderRadius: 14, background: "white", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: `0 2px 8px ${b.borde}20` }}>
                <img
                  src={`/icons/icon-perk-${b.slug}.png`}
                  alt={b.titulo}
                  width={26}
                  height={26}
                  onError={e => { e.currentTarget.style.display = "none"; }}
                />
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: T.onSurface, marginBottom: 2 }}>{b.titulo}</p>
                <p style={{ fontSize: 12, color: T.onSurfaceVariant, lineHeight: 1.5 }}>{b.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Método de pago — solo Mercado Pago */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button style={{
            width: "100%", height: 60,
            background: "linear-gradient(135deg, #009ee3, #0077c0)",
            color: "white", border: "none", borderRadius: 16,
            fontSize: 15, fontWeight: 700, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
            boxShadow: "0 6px 20px rgba(0,158,227,0.35)"
          }}>
            {/* Logo Mercado Pago — /public/icons/logo-mercadopago.png */}
            <img
              src="/icons/logo-mercadopago.png"
              alt="Mercado Pago"
              height={22}
              onError={e => { e.currentTarget.style.display = "none"; }}
            />
            Pagar con Mercado Pago
          </button>
        </div>

        <p style={{ textAlign: "center", fontSize: 11, color: T.outline, marginTop: 16, lineHeight: 1.7 }}>
          Al suscribirte aceptas nuestros Términos de Servicio.<br />Renovación automática mensual. Cancela en cualquier momento.
        </p>
      </div>
    </div>
  );
}

// ─── APP RAÍZ ─────────────────────────────────────────────────────────────────
export default function MunchyApp() {
  const [pantalla, setPantalla] = useState("onboarding");
  const [pantallaAnterior, setPantallaAnterior] = useState(null);

  const ir = (siguiente) => {
    setPantallaAnterior(pantalla);
    setPantalla(siguiente);
  };

  const manejarReceta = () => {
    if (!USUARIO_MOCK.esPremium && USUARIO_MOCK.recetasHoy >= USUARIO_MOCK.limiteGratis) {
      ir("paywall");
    } else {
      ir("receta");
    }
  };

  return (
    <>
      <style>{estilosGlobales}</style>
      <div style={{ maxWidth: 430, margin: "0 auto", minHeight: "100vh", background: T.bg, position: "relative" }}>
        {pantalla === "onboarding" && (
          <PantallaOnboarding onCompletar={() => ir("dashboard")} />
        )}
        {pantalla === "dashboard" && (
          <PantallaDashboard
            usuario={USUARIO_MOCK}
            onNavegar={() => ir("dashboard")}
            onVerReceta={manejarReceta}
          />
        )}
        {pantalla === "receta" && (
          <PantallaReceta
            receta={RECETA_MOCK}
            onVolver={() => ir("dashboard")}
            onNavegar={() => ir("dashboard")}
          />
        )}
        {pantalla === "paywall" && (
          <PantallaPaywall
            onCerrar={() => ir(pantallaAnterior || "dashboard")}
          />
        )}
      </div>
    </>
  );
}
