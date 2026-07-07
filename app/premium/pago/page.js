const onSubmit = (param) => {
    // 👀 El SDK entrega TODO en un solo argumento "param".
    // Imprimimos para ver dónde está el token exactamente.
    console.log('=== DEBUG MP BRICK ===')
    console.log('param completo:', JSON.stringify(param, null, 2))
    console.log('======================')

    return new Promise((resolve, reject) => {
      fetch('/api/pago/crear-suscripcion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...param, correo: correo.trim() }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.ok) {
            setResultado('exito')
            resolve()
          } else {
            setMensajeError(data.mensaje || 'No se pudo procesar el pago.')
            setResultado('error')
            reject()
          }
        })
        .catch(() => {
          setMensajeError('Sin conexión. Intenta de nuevo.')
          setResultado('error')
          reject()
        })
    })
  }
