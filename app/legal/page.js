'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function PantallaLegal() {
  const router = useRouter()
  const [tab, setTab] = useState('privacidad')

  const privacidad = [
    { t: 'Última actualización', p: ['28 de agosto de 2026'] },
    { t: '1. Responsable', p: [
      'Jesús Sánchez Pioquinto (el "Responsable"), con domicilio en [PENDIENTE: domicilio fiscal completo], es responsable del tratamiento de tus datos personales recabados a través de Munchy (munchy-xi.vercel.app).',
    ]},
    { t: '2. Datos que se recaban', p: [
      'a) Identificación y contacto: correo electrónico, contraseña (cifrada, no visible para el Responsable) y apodo elegido libremente.',
      'b) Hábitos y preferencias: ocupación declarada, nivel de actividad física, ingredientes disponibles, historial de recetas generadas y preparadas.',
      'c) Datos sensibles: alergias e intolerancias alimentarias declaradas.',
      'No se recaban ni almacenan números de tarjeta, claves de seguridad ni credenciales de pago. Esos datos los trata directamente Stripe, Inc.',
    ]},
    { t: '3. Consentimiento para datos sensibles', p: [
      'Tratamos tus alergias e intolerancias con el único fin de evitar que las recetas incluyan ingredientes que puedan poner en riesgo tu salud.',
      'Al marcar la casilla durante el registro otorgas tu consentimiento expreso, en términos del artículo 9 de la Ley Federal de Protección de Datos Personales en Posesión de los Particulares.',
      'Puedes optar por no dar esta información: podrás usar la app, pero las recetas no considerarán restricciones alimentarias.',
    ]},
    { t: '4. Finalidades', p: [
      'Primarias: crear y administrar tu cuenta, generar recetas personalizadas, llevar el registro de recetas preparadas y tu racha, administrar la suscripción Munchy Pro, y atender soporte y derechos ARCO.',
      'Secundarias: comunicaciones sobre nuevas funciones o promociones, y estadísticas agregadas y anónimas.',
      'Puedes negarte a las finalidades secundarias escribiendo a toscanoneitan@gmail.com. Esa negativa no afecta el servicio contratado.',
    ]},
    { t: '5. Transferencias y encargados', p: [
      'No vendemos, comercializamos ni cedemos datos personales a terceros con fines publicitarios.',
      'Proveedores que actúan como encargados: Supabase (base de datos y autenticación), Vercel (hospedaje), Stripe (pagos y suscripciones) y Anthropic (generación de recetas con IA).',
      'Estos proveedores pueden procesar información en servidores fuera del territorio nacional. Al usar la Plataforma reconoces esta circunstancia.',
    ]},
    { t: '6. Derechos ARCO', p: [
      'Tienes derecho a acceder a tus datos, rectificarlos, cancelarlos y oponerte a su tratamiento.',
      'Para ejercerlos escribe a toscanoneitan@gmail.com indicando tu nombre, el correo con el que te registraste, la descripción de los datos y el derecho que deseas ejercer.',
      'Se dará respuesta en un plazo máximo de veinte días hábiles.',
    ]},
    { t: '7. Revocación del consentimiento', p: [
      'Puedes revocar tu consentimiento en cualquier momento. La revocación implica la cancelación de la cuenta y la eliminación de la información asociada, salvo lo que deba conservarse por obligaciones fiscales o contables.',
    ]},
    { t: '8. Conservación de datos', p: [
      'Los datos se conservan mientras la cuenta esté activa. Al solicitar la eliminación, se suprimen dentro de los treinta días naturales siguientes, salvo los registros de pago que se conservan según la legislación fiscal aplicable.',
    ]},
    { t: '9. Almacenamiento local y cookies', p: [
      'La Plataforma usa mecanismos de almacenamiento en tu navegador para mantener tu sesión iniciada y permitir el funcionamiento sin conexión.',
      'No se emplean cookies de terceros con fines publicitarios ni de rastreo entre sitios.',
    ]},
    { t: '10. Modificaciones', p: [
      'Este aviso puede modificarse. Los cambios se publicarán en munchy-xi.vercel.app y, cuando impliquen cambios sustanciales, se notificarán al correo registrado.',
    ]},
  ]

  const terminos = [
    { t: 'Última actualización', p: ['28 de agosto de 2026'] },
    { t: '1. Aceptación', p: [
      'Al crear una cuenta en Munchy aceptas quedar obligado por estos Términos y Condiciones. Si no estás de acuerdo, abstente de usar la Plataforma.',
    ]},
    { t: '2. Descripción del servicio', p: [
      'Munchy genera sugerencias de recetas mediante inteligencia artificial, con base en los ingredientes y preferencias que tú declaras. La Plataforma no vende alimentos, ingredientes ni productos físicos.',
    ]},
    { t: '3. No es asesoría médica', p: [
      'Las recetas, valores nutrimentales y sugerencias son generados automáticamente por sistemas de inteligencia artificial. Son meramente informativos y orientativos.',
      'El contenido no constituye asesoría médica, nutricional ni dietética, y no sustituye la consulta con un profesional de la salud acreditado.',
      'La información nutrimental es aproximada y puede contener errores. No debes basarte en ella para el control de padecimientos médicos ni regímenes prescritos.',
      'Eres el único responsable de verificar que los ingredientes sean aptos para tu consumo, sobre todo si tienes alergias, intolerancias o alguna condición de salud. No garantizamos que las recetas estén libres de alérgenos, aun habiéndolos declarado en tu perfil.',
    ]},
    { t: '4. Registro y cuenta', p: [
      'Debes proporcionar un correo válido y una contraseña de entre ocho y veinticinco caracteres.',
      'Eres responsable de mantener la confidencialidad de tus credenciales.',
      'No está permitido compartir la cuenta ni ceder la suscripción.',
      'Podemos suspender cuentas que incurran en uso indebido, abuso del servicio o intento de vulnerar la Plataforma.',
    ]},
    { t: '5. Planes y límites', p: [
      'Plan gratuito: hasta 2 recetas generadas por día.',
      'Munchy Pro: hasta 20 recetas generadas por día.',
      'Los límites se reinician diariamente conforme al huso horario del centro de México. Podemos modificar estos límites, notificando previamente a los usuarios con suscripción vigente.',
    ]},
    { t: '6. Precio y renovación', p: [
      'El precio de Munchy Pro es de $120.00 MXN mensuales.',
      'El cobro se realiza a través de Stripe y se renueva automáticamente cada mes. Al contratar, autorizas expresamente el cargo recurrente.',
      'Podemos modificar el precio notificando con al menos treinta días naturales de anticipación. Puedes cancelar antes de que el nuevo precio surta efectos.',
    ]},
    { t: '7. Cancelación', p: [
      'Puedes cancelar tu suscripción en cualquier momento desde la app. La cancelación surte efectos al término del periodo ya pagado: conservas el acceso Pro hasta esa fecha y no se generan cobros posteriores.',
    ]},
    { t: '8. Reembolsos', p: [
      'Puedes solicitar reembolso dentro de los tres días naturales siguientes al cobro, escribiendo a toscanoneitan@gmail.com.',
      'Transcurrido ese plazo no proceden reembolsos por periodos ya iniciados, salvo que la ley disponga lo contrario. Al procesarse el reembolso, el acceso Pro se cancela.',
    ]},
    { t: '9. Propiedad intelectual', p: [
      'El nombre Munchy, su identidad visual, el código fuente y el diseño son propiedad del Responsable. Recibes una licencia limitada, personal, revocable e intransferible.',
      'Puedes usar libremente las recetas generadas para consumo personal, incluida su publicación en redes sociales. No está permitida su explotación comercial sistemática ni la extracción masiva de contenido.',
    ]},
    { t: '10. Conducta del usuario', p: [
      'Te obligas a no usar medios automatizados para generar recetas de forma masiva, no vulnerar ni descompilar los sistemas, no suplantar identidades y no usar la Plataforma para fines ilícitos.',
    ]},
    { t: '11. Disponibilidad', p: [
      'Procuramos mantener la Plataforma disponible de forma continua, pero no garantizamos su funcionamiento ininterrumpido. Puede suspenderse por mantenimiento, fallas de proveedores externos o fuerza mayor.',
      'En interrupciones prolongadas atribuibles al Responsable, puedes solicitar la compensación proporcional del periodo afectado.',
    ]},
    { t: '12. Limitación de responsabilidad', p: [
      'En la máxima medida permitida por la ley, nuestra responsabilidad se limita al monto efectivamente pagado por ti durante los tres meses anteriores al hecho que motive la reclamación.',
      'No somos responsables por daños derivados del uso que hagas de las recetas, ni por reacciones alérgicas, intolerancias o afectaciones a la salud resultantes de la preparación o consumo de los alimentos sugeridos.',
    ]},
    { t: '13. Modificaciones', p: [
      'Podemos modificar estos Términos. Los cambios sustanciales se notificarán al correo registrado con al menos quince días naturales de anticipación. El uso continuado después de esa fecha implica su aceptación.',
    ]},
    { t: '14. Legislación y jurisdicción', p: [
      'Estos Términos se rigen por la legislación de los Estados Unidos Mexicanos. Las partes se someten a la jurisdicción de los tribunales competentes de [PENDIENTE: ciudad y estado].',
      'Lo anterior sin perjuicio del derecho del consumidor de acudir ante la Procuraduría Federal del Consumidor.',
    ]},
    { t: '15. Contacto', p: [
      'Para cualquier duda, aclaración o solicitud: toscanoneitan@gmail.com',
    ]},
  ]

  const secciones = tab === 'privacidad' ? privacidad : terminos

  return (
    <main className="relative min-h-screen bg-black pb-16 overflow-hidden">

      {/* 🎨 Blobs neutros (decorativos, no bloquean toques) */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-20 -left-16 w-64 h-64 rounded-full" style={{ background: '#8a8f99', filter: 'blur(110px)', opacity: 0.16 }} />
        <div className="absolute top-1/2 -right-24 w-72 h-72 rounded-full" style={{ background: '#c9cbd1', filter: 'blur(120px)', opacity: 0.14 }} />
        <div className="absolute bottom-10 -left-20 w-64 h-64 rounded-full" style={{ background: '#b0a99f', filter: 'blur(110px)', opacity: 0.14 }} />
      </div>

      <div className="relative z-20 px-5 pt-5 pb-3 flex items-center justify-between sticky top-0"
           style={{ background: 'rgba(10,10,10,0.85)', backdropFilter: 'blur(14px)' }}>
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full bg-white border border-olivoClaro flex items-center justify-center text-olivo active:scale-95 transition-transform"
        >←</button>
        <span className="font-serif text-xl text-crema">Legal</span>
        <div className="w-10" />
      </div>

      <div className="relative z-10 px-5">
        <div className="pt-4 pb-5">
          <h1 className="font-serif text-3xl text-crema leading-tight mb-2">Tus datos y tus derechos</h1>
          <p className="text-sm text-crema opacity-60 leading-relaxed">
            Responsable: Jesús Sánchez Pioquinto · toscanoneitan@gmail.com
          </p>
        </div>

        <div className="flex gap-2 mb-5">
          {[
            { id: 'privacidad', label: 'Privacidad' },
            { id: 'terminos', label: 'Términos' },
          ].map(x => {
            const activo = tab === x.id
            return (
              <button
                key={x.id}
                onClick={() => setTab(x.id)}
                className="flex-1 h-11 rounded-2xl text-sm font-semibold active:scale-95 transition-all"
                style={{
                  background: activo ? 'rgba(74,222,128,0.16)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${activo ? 'rgba(74,222,128,0.5)' : 'rgba(255,255,255,0.14)'}`,
                  color: activo ? '#4ade80' : '#FAF9F5',
                  boxShadow: activo ? '0 0 18px rgba(74,222,128,0.2)' : 'none',
                  opacity: activo ? 1 : 0.65,
                }}
              >
                {x.label}
              </button>
            )
          })}
        </div>

        <div className="flex flex-col gap-3">
          {secciones.map((s, i) => (
            <div key={i} className="rounded-2xl p-4"
                 style={{
                   background: 'linear-gradient(160deg, #39415a 0%, #262c3d 55%, #171a24 100%)',
                   border: '1px solid rgba(120,140,190,0.28)',
                 }}>
              <p className="text-xs font-bold uppercase tracking-wider text-salmon mb-2">{s.t}</p>
              {s.p.map((parrafo, j) => (
                <p key={j} className="text-sm text-crema opacity-80 leading-relaxed mb-2 last:mb-0">
                  {parrafo}
                </p>
              ))}
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-crema opacity-35 mt-6 leading-relaxed">
          Documento en revisión legal. Última actualización: 28 de agosto de 2026.
        </p>
      </div>
    </main>
  )
}
