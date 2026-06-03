"use client";

import { useState } from "react";

const DESPENSA_MOCK = [
  { id: 1, nombre: "Yogurt Griego", cantidad: 500, unidad: "g", categoria: "Lácteos" },
  { id: 2, nombre: "Granola Integral", cantidad: 300, unidad: "g", categoria: "Snacks" },
  { id: 3, nombre: "Miel de Abeja", cantidad: 150, unidad: "ml", categoria: "Dulces" },
  { id: 4, nombre: "Proteína en Polvo", cantidad: 0, unidad: "g", categoria: "Suplementos" },
  { id: 5, nombre: "Plátanos", cantidad: 0, unidad: "pzas", categoria: "Frutas" }
];

export default function PantallaDashboard() {
  const [despensa, setDespensa] = useState(DESPENSA_MOCK);
  const [mostrarMascota, setMostrarMascota] = useState(true);
  const [recetasGratis, setRecetasGratis] = useState(3);
  const [mostrarPaywall, setMostrarPaywall] = useState(false);
  const [recetaGenerada, setRecetaGenerada] = useState(null);

  const modificarCantidad = (id, incremento) => {
    setDespensa(despensa.map(item => {
      if (item.id === id) {
        const nuevaCantidad = Math.max(0, item.cantidad + incremento);
        return { ...item, cantidad: nuevaCantidad };
      }
      return item;
    }));
  };

  const manejarGenerarReceta = () => {
    if (recetasGratis <= 0) {
      setMostrarPaywall(true);
      return;
    }
    setRecetasGratis(recetasGratis - 1);
    setRecetaGenerada({
      titulo: "🍦 Helado de Proteína Express",
      categoria: "Postre Saludable",
      tiempo: "5 min",
      macros: "⚡ 25g Proteína | 30g Carbs | 4g Grasas",
      pasos: [
        "Mezcla en la licuadora 200g de Yogurt Griego con un chorrito de Miel.",
        "Agrega tu fruta favorita o granola para darle el toque premium.",
        "Mete al congelador por 15 minutos y ¡listo para disfrutar modo fit!"
      ]
    });
  };

  return (
    <div className="min-h-screen bg-[#F4F3EF] text-[#4A3B32] font-sans antialiased pb-10">
      
      {/* HEADER PRINCIPAL */}
      <header className="max-w-md mx-auto bg-[#2E3A23] text-[#F4F3EF] p-4 rounded-b-2xl shadow-md flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-[#E9967A] flex items-center justify-center font-bold text-sm text-[#4A3B32]">M</div>
          <h1 className="text-xl font-serif font-bold tracking-tight">Munchy</h1>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-xs bg-[#4A3B32] px-2 py-1 rounded-full text-[#E9967A] font-semibold">Gratis: {recetasGratis}</span>
          <div className="bg-[#E9967A] text-[#4A3B32] px-3 py-1 rounded-full font-bold text-sm flex items-center space-x-1 shadow-sm">
            <span>🔥 5 Días</span>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 mt-6 space-y-6">

        {/* MASCOTA MUNCHIE */}
        {mostrarMascota && (
          <div className="bg-[#2E3A23] text-[#F4F3EF] p-5 rounded-2xl border border-[#4A3B32] shadow-lg relative">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-[#F4F3EF] rounded-xl flex items-center justify-center text-2xl border border-[#4A3B32]">🦉</div>
              <div className="flex-1 space-y-1">
                <h4 className="font-serif font-bold text-base text-[#E9967A]">¡Qué onda, soy Munchie!</h4>
                <p className="text-xs text-gray-200 leading-relaxed">Hoy andamos modo fit pero rico. Agrega lo que tengas en tu alacena de abajo y te armo un postre en 2 segundos.</p>
              </div>
            </div>
            <button onClick={() => setMostrarMascota(false)} className="absolute top-2 right-2 text-gray-400 text-sm font-bold p-1">✕</button>
          </div>
        )}

        {/* DESPENSA */}
        <section className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-gray-100 pb-2">
            <h3 className="font-serif font-bold text-lg text-[#2E3A23]">Mi Refri Virtual</h3>
          </div>

          <div className="space-y-3">
            {despensa.map((item) => (
              <div key={item.id} className="flex justify-between items-center p-3 bg-[#F4F3EF] rounded-xl border border-gray-100">
                <div>
                  <p className="font-semibold text-sm text-[#4A3B32]">{item.nombre}</p>
                  <span className="text-[10px] bg-white text-gray-500 px-2 py-0.5 rounded-full border border-gray-200">{item.categoria}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <button onClick={() => modificarQuantity(item.id, item.unidad === "pzas" ? -1 : -50)} className="w-7 h-7 bg-white rounded-full border border-gray-300 flex items-center justify-center font-bold text-gray-600 text-xs">-</button>
                  <span className="text-sm font-bold min-w-[50px] text-center text-[#2E3A23]">{item.cantidad} {item.unidad}</span>
                  <button onClick={() => modificarCantidad(item.id, item.unidad === "pzas" ? 1 : 50)} className="w-7 h-7 bg-[#2E3A23] text-white rounded-full flex items-center justify-center font-bold text-xs">+</button>
                </div>
              </div>
            ))}
          </div>

          <button onClick={manejarGenerarReceta} className="w-full bg-[#2E3A23] text-[#F4F3EF] py-4 rounded-xl font-bold text-sm shadow-md">
            ⚡ GENERAR ANTOJO SALUDABLE
          </button>
        </section>

        {/* RECETA GENERADA */}
        {recetaGenerada && (
          <section className="bg-white p-5 rounded-2xl border-2 border-[#2E3A23] shadow-md space-y-4">
            <div className="bg-[#F4F3EF] p-3 rounded-xl border-l-4 border-[#E9967A] flex justify-between items-center">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#E9967A] font-bold">{recetaGenerada.categoria}</span>
                <h3 className="font-serif font-bold text-lg text-[#2E3A23]">{recetaGenerada.titulo}</h3>
              </div>
              <span className="text-xs font-semibold bg-white px-2 py-1 rounded-md border border-gray-200">⏱️ {recetaGenerada.tiempo}</span>
            </div>
            <p className="text-xs bg-[#2E3A23] text-[#F4F3EF] p-2 rounded-lg text-center font-mono">{recetaGenerada.macros}</p>
            <div className="space-y-3">
              <ol className="space-y-2">
                {recetaGenerada.pasos.map((paso, idx) => (
                  <li key={idx} className="text-xs flex items-start space-x-2 text-gray-600">
                    <span className="font-bold text-[#E9967A] min-w-[15px]">{idx + 1}.</span>
                    <span>{paso}</span>
                  </li>
                ))}
              </ol>
            </div>
            <div className="p-3 bg-orange-50 rounded-xl border border-orange-200 space-y-2">
              <p className="text-xs font-semibold text-orange-800">⚠️ Te hace falta Proteína y Plátanos para que sepa premium.</p>
              <button className="w-full bg-[#E9967A] text-[#4A3B32] py-2 rounded-lg font-bold text-xs">🛒 Surtir despensa barato en Walmart</button>
            </div>
          </section>
        )}

        {/* PAYWALL PREMIUM MERCADO PAGO */}
        {mostrarPaywall && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-[#F4F3EF] max-w-sm w-full p-6 rounded-2xl border-2 border-[#4A3B32] shadow-2xl text-center space-y-5">
              <div className="w-12 h-12 bg-[#2E3A23] rounded-full flex items-center justify-center mx-auto text-xl">🔒</div>
              <div className="space-y-2">
                <h3 className="font-serif font-bold text-xl text-[#2E3A23]">Modo Antojo Premium</h3>
                <p className="text-xs text-gray-600 leading-relaxed">Se te acabaron tus 3 recetas gratis del día. No dejes morir tu racha de fueguitos.</p>
              </div>
              <div className="p-4 bg-white rounded-xl border border-gray-200">
                <span className="text-3xl font-serif font-black text-[#2E3A23]">$3 USD <span className="text-sm font-normal text-gray-500">/ mes</span></span>
              </div>
              <button onClick={() => alert("Redirigiendo a Mercado Pago...")} className="w-full bg-[#009EE3] text-white py-4 rounded-xl font-bold text-sm shadow-md">
                💳 Pagar Seguro con Mercado Pago
              </button>
              <button onClick={() => setMostrarPaywall(false)} className="text-xs text-gray-400 underline block mx-auto">Regresar al modo gratis</button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
