'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function PantallaDespensa() {
  const router = useRouter()
  const [ingredientes, setIngredientes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [mostrarAgregar, setMostrarAgregar] = useState(false)
  const [nuevoNombre, setNuevoNombre] = useState('')
  const [nuevaCantidad, setNuevaCantidad] = useState(1)
  const [nuevaCategoria, setNuevaCategoria] = useState('frutas')
  const [guardando, setGuardando] = useState(false)

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

  const cargarDespensa = async () => {
    try {
      // 🔌 BACKEND: lee la despensa real del usuario
      const res = await fetch('/api/despensa', { cache: 'no-store' })
      const data = await res.json()

      if (data.ok) {
        setIngredientes(data.ingredientes || [])
      } else {
        if (data.error === 'sin_sesion' || data.error === 'sesion_no_encontrada') {
          router.push('/bienvenida')
          return
        }
        setError('No pudimos cargar tu despensa.')
      }
    } catch (e) {
      setError('Sin conexión. Revisa tu internet.')
    }
    setCargando(false)
  }

  useEffect(() => {
    cargarDespensa()
  }, [])

  const actualizar = async (id, accion) => {
    // Optimista: actualizo en pantalla primero
    setIngredientes(prev =>
      prev
        .map(ing => {
          if (ing.id !== id) return ing
          const nueva = accion === 'sumar' ? ing.cantidad + 1 : ing.cantidad - 1
          return { ...ing, cantidad: nueva }
        })
        .filter(ing => ing.cantidad > 0)
    )

    try {
      // 🔌 BACKEND: actualiza la cantidad en Supabase
      await fetch('/api/despensa/actualizar', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingrediente_id: id, accion }),
      })
    } catch (e) {
      // Si falla, recargo para sincronizar con el backend
      cargarDespensa()
    }
  }

  const agregar = async () => {
    if (!nuevoNombre.trim()) return
    setGuardando(true)

    try {
      // 🔌 BACKEND: agrega nuevo ingrediente
      const res = await fetch('/api/despensa/agregar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: nuevoNombre.trim(),
          cantidad: nuevaCantidad,
          unidad: 'unidades',
          categoria: nuevaCategoria,
        }),
      })

      const data = await res.json()

      if (data.ok) {
        setNuevoNombre('')
        setNuevaCantidad(1)
        setNuevaCategoria('frutas')
        setMostrarAgregar(false)
        cargarDespensa()
      }
    } catch (e) {
      // silencioso
    }
    setGuardando(false)
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
              ? `Tienes ${ingredientes.length} ${ingredientes.length === 1 ? 'ingrediente' : 'ingredientes'}. Munchie los usa para tus recetas.`
              : 'Agrega ingredientes para recetas más personalizadas.'}
          </p>
        </div>

        {error && (
          <div className="bg-white rounded-2xl p-4 mb-4 border border-salmon/50 text-center">
            <p className="text-sm text-salmon font-medium mb-3">{error}</p>
            <button onClick={() => { setError(''); setCargando(true); cargarDespensa() }} className="h-10 px-5 bg-olivo text-white rounded-xl text-sm font-semibold">
              Reintentar
            </button>
          </div>
        )}

        {cargando ? (
          <div className="flex justify-center py-12">
            <div className="flex gap-2">
              {[0,1,2].map(i => (
                <div key={i} className="w-2.5 h-2.5 rounded-full bg-olivo"
                     style={{ animation: 'pulso 1.2s ease-in-out infinite', animationDelay: `${i*0.2}s`, opacity: 0.3 }} />
              ))}
            </div>
          </div>
        ) : ingredientes.length === 0 && !error ? (
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
                    className="w-8 h-8 rounded-full bg-olivo flex items-center
