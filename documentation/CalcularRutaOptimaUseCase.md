
# Caso de Uso: Calcular Ruta Óptima

## Descripción

Este caso de uso es responsable de calcular la secuencia óptima de paradas para un conjunto de paquetes y un vehículo, minimizando la distancia y el tiempo total de la ruta, mientras se respetan las ventanas de tiempo de entrega de los clientes y otras reglas de negocio.

## Flujo del Caso de Uso

1.  El caso de uso recibe un `CrearRutaOptimaInput` con los IDs de los paquetes a incluir y los IDs de los vehículos a considerar.
2.  Valida la existencia de los paquetes y los vehículos.
3.  Verifica que la capacidad de los vehículos no sea excedida por el peso y volumen total de los paquetes.
4.  Consulta las condiciones de tráfico en tiempo real para los segmentos de ruta relevantes.
5.  Delega la lógica de optimización a `ServicioOptimizacionRutas`, que considera:
    *   Ventanas de tiempo de entrega de los paquetes.
    *   Condiciones de tráfico.
    *   **BR-01**: La ruta no puede durar más de 8 horas de tiempo de conducción estimado.
    *   **BR-02**: Los paquetes perecederos deben ubicarse obligatoriamente en el primer 30% de la ruta.
6.  Si la optimización es exitosa, se crea una nueva `Ruta` en estado `PLANIFICADA` con la secuencia de paradas óptima.
7.  Se actualiza el estado de los paquetes asignados a `ASIGNADO` y se vinculan a la nueva ruta.
8.  Se actualiza el estado del vehículo asignado a la ruta.
9.  Retorna un `CrearRutaOptimaOutput` con los detalles de la ruta planificada, incluyendo la secuencia de paradas y cualquier paquete que no pudo ser asignado.

## Entradas (`CrearRutaOptimaInput`)

*   `paqueteIds`: `string[]` - Lista de identificadores únicos de los paquetes a incluir en la ruta.
*   `vehiculoIds`: `string[]` - Lista de identificadores únicos de los vehículos a considerar para la asignación.

## Salidas (`CrearRutaOptimaOutput`)

*   `rutaId`: `string` - ID de la ruta óptima creada.
*   `vehiculoId`: `string` - ID del vehículo asignado a la ruta.
*   `paradas`: `Array<{ paqueteId: string; ubicacion: { latitud: number; longitud: number; direccion?: string }; tipo: "RECOGIDA" | "ENTREGA"; horaLlegadaEstimada: Date; horaSalidaEstimada: Date; }>` - Lista secuenciada de paradas de la ruta, con detalles de ubicación y tiempos.
*   `paquetesAsignados`: `string[]` - IDs de los paquetes que fueron exitosamente asignados a la ruta.
*   `paquetesNoAsignados`: `string[]` - IDs de los paquetes que no pudieron ser asignados a la ruta debido a restricciones (e.g., ventanas de tiempo, capacidad, duración máxima de ruta).
*   `distanciaTotal`: `number` - Distancia total estimada de la ruta.
*   `duracionEstimada`: `number` - Duración total estimada de la ruta.

## Excepciones

*   `PaqueteNoEncontradoException`: Uno o más paquetes de entrada no existen.
*   `VehiculoNoEncontradoException`: Uno o más vehículos de entrada no existen.
*   `CapacidadVehiculoExcedidaException`: El peso o volumen total de los paquetes excede la capacidad de todos los vehículos disponibles.
*   `UnreachableDestinationException`: Una dirección de paquete no pudo ser geocodificada o es inaccesible por tierra.
*   `NoHayRutaFactibleException`: El servicio de optimización no pudo encontrar una ruta que cumpla con todas las restricciones (e.g., BR-01, ventanas de tiempo).
*   `EstadoInvalidoPaqueteException`: Se intenta asignar un paquete que no está en estado `PENDIENTE`.
*   `EstadoInvalidoVehiculoException`: Se intenta cambiar el estado de un vehículo de forma inválida.
