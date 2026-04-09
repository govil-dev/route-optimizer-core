# Caso de Uso: Marcar Estado de Entrega de Paquete

## Descripción
Este caso de uso permite a un agente (como un repartidor) actualizar el estado de un paquete a "ENTREGADO" o "FALLIDO". Realiza validaciones críticas para asegurar la integridad del proceso de entrega, como la verificación de la ubicación (geocerca) y la existencia de pruebas de entrega o razones de fallo.

## Flujo del Caso de Uso
1.  **Recepción de Datos:** El sistema recibe una solicitud para actualizar el estado de un paquete, que incluye el ID del paquete, el nuevo estado (`ENTREGADO` o `FALLIDO`), la ubicación actual del repartidor y datos adicionales según el estado.
2.  **Recuperación del Paquete:** El sistema busca el paquete en el repositorio utilizando su ID. Si no se encuentra, se lanza una `PaqueteNoEncontradoException`.
3.  **Validación de Estado Actual:** Se verifica que el estado actual del paquete sea `ASIGNADO` o `EN_TRANSITO`. Si el estado es diferente (ej. `PENDIENTE`, `ENTREGADO`), se lanza una `EstadoInvalidoPaqueteException`.
4.  **Lógica para "ENTREGADO":**
    *   **Validación de Geocerca (BR-03):** Se calcula la distancia entre la ubicación actual del repartidor y la dirección de destino del paquete. Si la distancia es mayor a 50 metros, se lanza una `GeofenceViolationException`.
    *   **Validación de Prueba de Entrega:** Se verifica que la solicitud incluya una prueba de entrega (foto o firma). Si no se proporciona, se lanza una `MissingProofOfDeliveryException`.
    *   **Actualización de Estado:** Se actualiza el estado del paquete a `ENTREGADO`.
5.  **Lógica para "FALLIDO":**
    *   **Validación de Código de Razón (BR-04):** Se verifica que la solicitud incluya un código de razón para el fallo en la entrega. Si no se proporciona, se lanza una `MissingReasonCodeException`.
    *   **Actualización de Estado:** Se actualiza el estado del paquete a `FALLIDO` y se almacena el código de razón.
6.  **Persistencia:** El estado actualizado del paquete se guarda en el repositorio.
7.  **Publicación de Evento:** Se publica un evento de dominio `PackageStatusChangedEvent` para notificar a otros sistemas o contextos sobre el cambio de estado.
8.  **Respuesta:** El sistema retorna una confirmación con el ID del paquete, el nuevo estado y la fecha/hora de la actualización.

## Entradas (`MarcarEstadoEntregaPaqueteInput`)
| Campo             | Tipo                                    | Descripción                                                              |
| ----------------- | --------------------------------------- | ------------------------------------------------------------------------ |
| `paqueteId`       | `string`                                | Identificador único del paquete.                                         |
| `estadoEntrega`   | `"ENTREGADO"` \| `"FALLIDO"`            | El nuevo estado que se desea asignar al paquete.                         |
| `ubicacionActual` | `{ latitud: number; longitud: number; }` | Coordenadas GPS actuales del repartidor.                                 |
| `pruebaDeEntrega` | `{ tipo: "FOTO" \| "FIRMA"; url: string; }` (Opcional) | Requerido si `estadoEntrega` es `ENTREGADO`. Contiene el tipo y URL de la prueba. |
| `codigoRazonFallo`| `string` (Opcional)                     | Requerido si `estadoEntrega` es `FALLIDO`. Código que describe la razón del fallo. |

## Salidas (`MarcarEstadoEntregaPaqueteOutput`)
| Campo         | Tipo                         | Descripción                                      |
| ------------- | ---------------------------- | ------------------------------------------------ |
| `paqueteId`   | `string`                     | Identificador único del paquete actualizado.     |
| `nuevoEstado` | `"ENTREGADO"` \| `"FALLIDO"` | El nuevo estado asignado al paquete.             |
| `timestamp`   | `Date`                       | La fecha y hora en que se realizó la actualización. |

## Reglas de Negocio Aplicadas
*   **BR-03 (Validación de Geocerca):** La entrega solo puede marcarse como completada si el repartidor se encuentra a menos de 50 metros del destino.
*   **BR-04 (Código de Razón):** Una entrega fallida debe ir acompañada de un código que justifique el motivo.

## Excepciones
*   **`PaqueteNoEncontradoException`**: Se lanza si no se encuentra un paquete con el ID proporcionado.
*   **`EstadoInvalidoPaqueteException`**: Se lanza si se intenta actualizar un paquete que no está en estado `ASIGNADO` o `EN_TRANSITO`.
*   **`GeofenceViolationException`**: Se lanza si la actualización a `ENTREGADO` se intenta realizar fuera de la geocerca de 50 metros del destino.
*   **`MissingProofOfDeliveryException`**: Se lanza si no se proporciona una prueba de entrega al marcar un paquete como `ENTREGADO`.
*   **`MissingReasonCodeException`**: Se lanza si no se proporciona un código de razón al marcar un paquete como `FALLIDO`.
