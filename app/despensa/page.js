'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function PantallaDespensa() {
  const router = useRouter()
  const [ingredientes, setIngredientes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [mostrarAgregar, setMostrarAgregar] = useState(false)
  const [nuevoNombre, setNuevoNombre] = useState('')
  const [nuevaCantidad, setNuevaCantidad] = useState(1)
  const [nuevaCategoria, setNuevaCategoria] = useState('frutas')

  const categorias = [
    { id: 'frutas',      label: 'Frutas',      icono: '🍎' },
    { id: 'verduras',    label: 'Verduras',    icono: '🥦' },
    { id: 'proteinas',   label: 'Proteínas',   icono: '🍗' },
    { id: 'lacteos',     label: 'Lácteos',     icono: '🥛' },
    { id: 'granos',      label: 'Granos',      icono: '🌾' },
    { id: 'suplementos', label: 'Suplementos', icono: '💊' },
    { id: 'otro',        label: 'Otro',        icono: '📦' },
  ]

  const iconoCategoria = (cat) => categorias.find(c => c.id === cat)?.icono || '📦'

  useEffect(() => {
    // 🔌 BACKEND: Reemplazar por:
    // fetch('/api/despensa').then(r => r.json()).then(d => { setIngredientes(d.ingredientes); setCargando(false) })

    setTimeout(() => {
      setIngredientes([
        { id: '1', nombre: 'Banana',        cantidad: 3, unidad: 'unidades', categoria: 'frutas' },
        { id: '2', nombre: 'Avena',         cantidad: 2, unidad: 'tazas',    categoria: 'granos' },
        { id: '3', nombre: 'Yogur griego',  cantidad: 1, unidad: 'envase',   categoria: 'lacteos' },
        { id: '4', nombre: 'Proteína whey', cantidad: 1, unidad: 'bote',     categoria: 'suplementos' },
        { id: '5', nombre: 'Pollo',         cantidad: 500, unidad: 'g',      categoria: 'proteinas' },
        { id: '6', nombre: 'Espinaca',      cantidad: 1, unidad: 'manojo',   categoria: 'verduras' },
      ])
      setCargando(false)
    }, 500)
  }, [])

  const actualizar = (id, accion) => {
    // 🔌 BACKEND: Reemplazar por:
    // fetch('/api/despensa/actualizar', { method: 'PATCH', body: JSON.stringify({ ingrediente_id: id, accion }) })

    setIngredientes(prev =>
      prev
        .map(ing => {
          if (ing.id !== id) return ing
          const nueva = accion === 'sumar' ? ing.cantidad + 1 : ing.cantidad - 1
          return { ...ing, cantidad: nueva }
        })
        .filter(ing => ing.cantidad > 0)
    )
  }

  const agregar = () => {
    if (!nuevoNombre.trim()) return

    // 🔌 BACKEND: Reemplazar por:
    // fetch('/api/despensa/agregar', { method: 'POST', body: JSON.stringify({ nombre, cantidad, unidad, categoria }) })

    setIngredientes(prev => [
      ...prev,
      {
        id: String(Date.now()),
        nombre: nuevoNombre.trim(),
        cantidad: nuevaCantidad,
        unidad: 'unidades',
        categoria: nuevaCategoria,
      },
    ])
    setNuevoNombre('')
    setNuevaCantidad(1)
    setNuevaCategoria('frutas')
    setMostrarAgregar(false)
  }

  return (
    <main className="min-h-screen bg-crema pb-28">
      <div className="px-5 pt-5 pb-3 flex items-center justify-between sticky top-0 z-10"
           style={{ background: 'rgba(250,249,245,0.9)', backdropFilter: 'blur(14px)' }}>
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full bg-white border border-olivoClaro flex items-center justify-center text-olivo active:scale-95 transition-transform"
        >←</button>
        <span className="font-serif text-xl text-olivo">Mi Despensa</span>
        <div className="w-10" />
      </div>

      <div className="px-5">
        <div className="pt-4 pb-5">
          <h1 className="font-serif text-3xl text-olivoOscuro leading-tight mb-2">Tu Refri Virtual 🧊</h1>
          <p className="text-sm text-olivoOscuro opacity-70 leading-relaxed">
            {ingredientes.length > 0
              ? `Tienes ${ingredientes.length} ingredientes. Munchie los usa para tus recetas.`
              : 'Agrega ingredientes para recetas más personalizadas.'}
          </p>
        </div>

        {cargando ? (
          <div className="flex justify-center py-12">
            <div className="flex gap-2">
              {[0,1,2].map(i => (
                <div key={i} className="w-2.5 h-2.5 rounded-full bg-olivo"
                     style={{ animation: 'pulso 1.2s ease-in-out infinite', animationDelay: `${i*0.2}s`, opacity: 0.3 }} />
              ))}
            </div>
          </div>
        ) : ingredientes.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border-2 border-dashed border-olivoClaro mb-5">
            <div className="w-16 h-16 rounded-2xl bg-olivoClaro/40 flex items-center justify-center text-4xl mx-auto mb-3">
              📦
            </div>
            <p className="font-serif text-lg text-olivoOscuro mb-1">Tu despensa está vacía</p>
            <p className="text-sm text-olivoOscuro opacity-60">Toca el botón de abajo para empezar a llenarla.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2 mb-5">
            {ingredientes.map(ing => (
              <div key={ing.id}
                   className="flex items-center gap-3 bg-white rounded-2xl p-3 border border-olivoClaro/30"
                   style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                <div className="w-11 h-11 rounded-xl bg-cremaSuave flex items-center justify-center text-xl flex-shrink-0">
                  {iconoCategoria(ing.categoria)}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-olivoOscuro truncate">{ing.nombre}</p>
                  <p className="text-xs text-olivoOscuro opacity-60">{ing.cantidad} {ing.unidad}</p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => actualizar(ing.id, 'restar')}
                    className="w-8 h-8 rounded-full bg-cremaSuave border border-olivoClaro/40 flex items-center justify-center text-olivo text-lg font-bold active:scale-90 transition-transform"
                  >−</button>
                  <span className="w-6 text-center font-semibold text-sm text-olivoOscuro">{ing.cantidad}</span>
                  <button
                    onClick={() => actualizar(ing.id, 'sumar')}
                    className="w-8 h-8 rounded-full bg-olivo flex items-center justify-center text-white text-lg font-bold active:scale-90 transition-transform"
                  >+</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {mostrarAgregar && (
          <div className="bg-white rounded-2xl p-4 mb-5 border border-olivo/30"
               style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.06)', animation: 'aparecer 0.3s ease-out' }}>
            <p className="text-xs font-bold uppercase tracking-wider text-cafeTierra opacity-70 mb-3">
              Nuevo ingrediente
            </p>

            <input
              type="text"
              value={nuevoNombre}
              onChange={(e) => setNuevoNombre(e.target.value)}
              placeholder="Ej: Aguacate"
              className="w-full px-4 py-3 rounded-xl border border-olivoClaro/50 bg-cremaSuave text-olivoOscuro text-sm mb-3 focus:outline-none focus:border-olivo transition-colors"
            />

            <div className="flex items-center gap-3 mb-3">
              <span className="text-xs text-olivoOscuro opacity-70">Cantidad:</span>
              <button
                onClick={() => setNuevaCantidad(Math.max(1, nuevaCantidad - 1))}
                className="w-8 h-8 rounded-full bg-cremaSuave border border-olivoClaro/40 flex items-center justify-center text-olivo font-bold active:scale-90"
              >−</button>
              <span className="w-6 text-center font-semibold text-sm">{nuevaCantidad}</span>
              <button
                onClick={() => setNuevaCantidad(nuevaCantidad + 1)}
                className="w-8 h-8 rounded-full bg-olivo flex items-center justify-center text-white font-bold active:scale-90"
              >+</button>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {categorias.map(c => (
                <button
                  key={c.id}
                  onClick={() => setNuevaCategoria(c.id)}
                  className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                  style={{
                    background: nuevaCategoria === c.id ? '#2e3a23' : '#f5f4f0',
                    color: nuevaCategoria === c.id ? '#ffffff' : '#19240f',
                  }}
                >
                  {c.icono} {c.label}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setMostrarAgregar(false)}
                className="flex-1 h-11 rounded-xl border border-olivoClaro text-olivoOscuro text-sm font-medium active:scale-95 transition-transform"
              >
                Cancelar
              </button>
              <button
                onClick={agregar}
                disabled={!nuevoNombre.trim()}
                className="flex-1 h-11 rounded-xl bg-olivo text-white text-sm font-semibold active:scale-95 transition-transform"
                style={{ opacity: nuevoNombre.trim() ? 1 : 0.5 }}
              >
                Agregar
              </button>
            </div>
          </div>
        )}
      </div>

      {!mostrarAgregar && (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md px-5 pb-5 pt-3 z-40"
             style={{ background: 'linear-gradient(to top, rgba(250,249,245,1) 70%, rgba(250,249,245,0))' }}>
          <button
            onClick={() => setMostrarAgregar(true)}
            className="w-full h-14 bg-olivo text-white rounded-2xl font-semibold text-sm tracking-wide flex items-center justify-center gap-2 active:scale-95 transition-all"
            style={{ boxShadow: '0 8px 24px rgba(46,58,35,0.25)' }}
          >
            <span className="text-lg">+</span> Agregar ingrediente
          </button>
        </div>
      )}

      <style jsx>{`
        @keyframes pulso {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50%      { opacity: 1;   transform: scale(1.3); }
        }
        @keyframes aparecer {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </main>
  )
}
