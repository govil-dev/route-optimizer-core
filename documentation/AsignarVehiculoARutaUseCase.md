# Prompt de Implementación: Caso de Uso "Asignar Vehículo a Ruta"

Este documento detalla los requerimientos para la implementación del caso de uso `AsignarVehiculoARutaUseCase`. El objetivo es generar el código TypeScript necesario siguiendo la arquitectura y patrones del proyecto.

## 1. Resumen del Requerimiento

Se debe implementar la funcionalidad que permita asignar un vehículo disponible a una ruta planificada. Esta acción es un paso previo a la activación de la ruta para el despacho de paquetes.

**Actor**: Operador Logístico
**Acción**: Asignar un vehículo específico a una ruta ya creada.

## 2. Contexto del Proyecto

- **Workspace**: `./workspaces/gonzalo`
- **Arquitectura**: Domain-Driven Design (DDD) y CQRS con NestJS.
- **Lenguaje**: TypeScript
- **Estructura de Directorios**: La implementación debe respetar la estructura existente, principalmente dentro de `src/Contexts/Rutas/` y `src/EntryPoints/Api/modules/rutas/`.

### Repository Map (Símbolos Relevantes)

Para la implementación, se deben considerar los siguientes agregados y repositorios existentes:

- **Agregados**:
    - `Ruta` (`src/Contexts/Rutas/Domain/Aggregates/Ruta.ts`): Contiene la lógica de negocio principal de la ruta, como su estado, paradas y vehículo asignado. Se deberá añadir un método para asignar el vehículo.
    - `Vehiculo` (`src/Contexts/Rutas/Domain/Entities/Vehiculo.ts`): Representa un vehículo con su capacidad y estado.
- **Repositorios (Ports)**:
    - `RepositorioRutas` (`src/Contexts/Rutas/Domain/Ports/RepositorioRutas.ts`): Interfaz para la persistencia de las rutas.
    - `RepositorioVehiculos` (`src/Contexts/Rutas/Domain/Ports/RepositorioVehiculos.ts`): Interfaz para acceder a los datos de los vehículos.
- **Excepciones de Dominio**:
    - `RutaNoEncontradaException`
    - `VehiculoNoEncontradoException`
    - `EstadoInvalidoRutaException`
    - `EstadoInvalidoVehiculoException`

## 3. Archivos a Crear

Se deben generar los siguientes archivos nuevos, completos y listos para producción.

1.  **Caso de Uso (Interfaz)**: `src/Contexts/Rutas/Application/UseCases/AsignarVehiculoARutaUseCase.ts`
2.  **Caso de Uso (Implementación)**: `src/Contexts/Rutas/Application/UseCases/AsignarVehiculoARutaUseCaseImpl.ts`
3.  **DTO de Entrada**: `src/EntryPoints/Api/modules/rutas/application/dtos/asignar-vehiculo-a-ruta.input.ts`
4.  **DTO de Salida**: `src/EntryPoints/Api/modules/rutas/application/dtos/asignar-vehiculo-a-ruta.output.ts`
5.  **Prueba Unitaria**: `tests/Unit/Contexts/Rutas/Application/UseCases/AsignarVehiculoARutaUseCaseImpl.spec.ts`

## 4. Archivos a Modificar

1.  **Controlador de Rutas**: `src/EntryPoints/Api/modules/rutas/infrastructure/controllers/rutas.controller.ts`
    - Añadir un nuevo método para el endpoint `POST /:rutaId/vehiculo`.
2.  **Módulo de Rutas**: `src/EntryPoints/Api/modules/rutas/rutas.module.ts`
    - Registrar el nuevo caso de uso (`AsignarVehiculoARutaUseCaseImpl`) en los `providers`.
3.  **Agregado Ruta**: `src/Contexts/Rutas/Domain/Aggregates/Ruta.ts`
    - Añadir el método `asignarVehiculo(vehiculo: Vehiculo)` que contendrá la lógica de negocio.

## 5. Lógica de Negocio y Reglas

El `AsignarVehiculoARutaUseCaseImpl` debe seguir los siguientes pasos:

1.  Recibir un `rutaId` y un `vehiculoId` a través del DTO de entrada.
2.  Utilizar `RepositorioRutas` para encontrar el agregado `Ruta` correspondiente al `rutaId`. Si no se encuentra, lanzar `RutaNoEncontradaException`.
3.  Utilizar `RepositorioVehiculos` para encontrar la entidad `Vehiculo` correspondiente al `vehiculoId`. Si no se encuentra, lanzar `VehiculoNoEncontradoException`.
4.  Invocar un nuevo método en el agregado `Ruta`, por ejemplo `ruta.asignarVehiculo(vehiculo)`.
5.  Dentro de `Ruta.asignarVehiculo(vehiculo)`, se deben aplicar las siguientes reglas:
    - La ruta debe estar en estado `PLANIFICADA`. Si no, lanzar `EstadoInvalidoRutaException`.
    - El vehículo debe estar en estado `DISPONIBLE`. Si no, lanzar `EstadoInvalidoVehiculoException`.
    - La capacidad del vehículo debe ser mayor o igual al peso/volumen total de los paquetes de la ruta. Si no, lanzar `CapacidadVehiculoExcedidaException`.
    - Si todas las reglas pasan, la ruta actualiza su `vehiculoId` y cambia su estado a `ASIGNADA`. El vehículo cambia su estado a `ASIGNADO`.
6.  Persistir los cambios en el agregado `Ruta` usando `RepositorioRutas.save(ruta)`.
7.  Retornar un `AsignarVehiculoARutaOutput` con el `rutaId` y el nuevo estado de la ruta.

## 6. Contratos (DTOs)

### AsignarVehiculoARutaInput
```typescript
// src/EntryPoints/Api/modules/rutas/application/dtos/asignar-vehiculo-a-ruta.input.ts
export class AsignarVehiculoARutaInput {
  rutaId: string;
  vehiculoId: string;
}
```

### AsignarVehiculoARutaOutput
```typescript
// src/EntryPoints/Api/modules/rutas/application/dtos/asignar-vehiculo-a-ruta.output.ts
export class AsignarVehiculoARutaOutput {
  rutaId: string;
  estado: string; // e.g., "ASIGNADA"
}
```

## 7. Endpoint de API

- **URL**: `/rutas/:rutaId/vehiculo`
- **Método**: `POST`
- **Body**:
  ```json
  {
    "vehiculoId": "uuid-del-vehiculo"
  }
  ```
- **Respuesta Exitosa (200 OK)**:
  ```json
  {
    "rutaId": "uuid-de-la-ruta",
    "estado": "ASIGNADA"
  }
  ```

## 8. Criterios de Aceptación y Pruebas

Las pruebas unitarias para `AsignarVehiculoARutaUseCaseImpl.spec.ts` deben cubrir los siguientes escenarios:

- **Éxito**: Asignación correcta de un vehículo disponible a una ruta planificada.
- **Fallo**: La ruta no existe.
- **Fallo**: El vehículo no existe.
- **Fallo**: La ruta no está en estado `PLANIFICADA`.
- **Fallo**: El vehículo no está en estado `DISPONIBLE`.
- **Fallo**: La capacidad del vehículo es insuficiente para los paquetes de la ruta.
