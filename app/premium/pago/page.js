const onSubmit = ({ selectedPaymentMethod, formData }) => {
    // 👀 DEBUG: mira en la consola del navegador qué trae el Brick
    console.log('=== DEBUG MP BRICK ===')
    console.log('formData completo:', JSON.stringify(formData, null, 2))
    console.log('selectedPaymentMethod:', selectedPaymentMethod)
    console.log('token dentro de formData:', formData?.token)
    console.log('======================')

    return new Promise((resolve, reject) => {
      fetch('/api/pago/crear-suscripcion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          token: formData?.token,
          correo: correo.trim(),
        }),
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
