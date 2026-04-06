
# Arquitectura de Dominio: Asignación y Optimización de Rutas

Este documento detalla la estructura y los componentes de la capa de Dominio para el Bounded Context de "Asignación y Optimización de Rutas", siguiendo los principios de Domain-Driven Design (DDD) y una Arquitectura Limpia/Hexagonal.

## 1. Descripción General del Dominio

El dominio se centra en la lógica de negocio para planificar, asignar, optimizar y seguir rutas de entrega. Gestiona entidades clave como `Paquete`, `Vehiculo` y el agregado `Ruta`, asegurando que se cumplan todas las restricciones y reglas de negocio (invariantes).

## 2. Componentes del Dominio

### 2.1. Bloques Fundamentales (Shared/Domain)

Estos son los componentes base reutilizables que sustentan nuestro modelo de dominio.

-   **`AggregateRoot<ID>`**: Clase base para las raíces de agregados (`Ruta`). Gestiona la identidad y una lista de eventos de dominio.
-   **`Entity<ID>`**: Clase base para entidades con identidad propia (`Paquete`, `Vehiculo`).
-   **`ValueObject<T>`**: Clase base para objetos de valor, garantizando inmutabilidad y comparación estructural.
-   **`UniqueEntityID`**: Representa un identificador único (UUID) para las entidades y agregados.
-   **`DomainEvent`**: Interfaz base para los eventos que ocurren dentro del dominio.
-   **`DomainException`**: Clase base para todas las excepciones personalizadas del dominio, permitiendo un manejo de errores de negocio específico.

### 2.2. Agregados (Aggregates)

Un agregado es un clúster de objetos de dominio (entidades y VOs) que se pueden tratar como una única unidad.

-   **`Ruta` (Aggregate Root)**:
    -   **Descripción**: Es el corazón del dominio. Representa un itinerario completo para un vehículo, compuesto por una secuencia de paradas para recoger o entregar paquetes.
    -   **Responsabilidades**:
        -   Garantizar la consistencia de todo el agregado.
        -   Validar que la capacidad (peso y volumen) del vehículo no sea excedida por los paquetes asignados.
        -   Asegurar que las ventanas de tiempo de entrega de los paquetes se respeten en la planificación.
        -   Gestionar el ciclo de vida de la ruta (`PLANIFICADA`, `ACTIVA`, `COMPLETADA`, etc.) mediante una máquina de estados estricta.
        -   Orquestar la adición, eliminación y reordenamiento de paradas.
        -   Recalcular estimaciones (distancia, duración) en función de factores como el tráfico.

### 2.3. Entidades (Entities)

Objetos con una identidad única que persiste a lo largo del tiempo.

-   **`Paquete`**:
    -   **Descripción**: Representa un artículo que debe ser transportado de un origen a un destino.
    -   **Ciclo de Vida**: Su estado (`PENDIENTE`, `ASIGNADO`, `EN_TRANSITO`, `ENTREGADO`) es gestionado por sus propios métodos, asegurando transiciones válidas.
-   **`Vehiculo`**:
    -   **Descripción**: Representa un vehículo de la flota utilizado para realizar las entregas.
    -   **Ciclo de Vida**: Gestiona su estado (`DISPONIBLE`, `EN_RUTA`, `FUERA_DE_SERVICIO`) y su ubicación actual.

### 2.4. Objetos de Valor (Value Objects)

Atributos del modelo que no tienen identidad conceptual, definidos por sus características. Son inmutables.

-   **IDs**: `RutaId`, `PaqueteId`, `VehiculoId`.
-   **Geográficos**: `Ubicacion`, `SegmentoRuta`.
-   **Temporales**: `VentanaTiempo`, `Duracion`.
-   **Físicos**: `Distancia`.
-   **Ruta**: `Parada`, `CondicionTrafico`.

### 2.5. Enums

Tipos enumerados para representar estados fijos y legibles en el dominio.

-   `EstadoPaquete`
-   `EstadoVehiculo`
-   `EstadoRuta`

### 2.6. Puertos (Interfaces de Dominio)

Definen los contratos que la capa de dominio necesita del mundo exterior (capa de infraestructura), siguiendo el principio de inversión de dependencias.

-   **Repositorios**: `RepositorioPaquetes`, `RepositorioVehiculos`, `RepositorioRutas`. Definen cómo se persiste y recupera el estado de los agregados y entidades.
-   **Servicios de Dominio**:
    -   `ServicioInformacionTrafico`: Abstrae la obtención de datos de tráfico en tiempo real.
    -   `ServicioOptimizacionRutas`: Abstrae la lógica compleja (posiblemente algorítmica) para calcular la secuencia de paradas más eficiente.
    -   `ServicioGeocodificacion`: Abstrae la conversión de direcciones a coordenadas geográficas.

### 2.7. Excepciones de Dominio

Representan errores de negocio específicos que pueden ocurrir. Permiten que la capa de aplicación tome decisiones informadas basadas en fallos de las reglas de negocio.

-   `CapacidadVehiculoExcedidaException`
-   `EstadoInvalidoPaqueteException`
-   `EstadoInvalidoRutaException`
-   `PaqueteYaAsignadoException`
-   `VentanaEntregaInvalidaException`
-   `ViolacionRestriccionRutaException`
-   ... y otras.

## 3. Reglas de Negocio Clave (Invariantes)

-   **Consistencia de la Ruta**: La `Ruta` siempre debe estar en un estado válido. No se puede agregar una parada si excede la capacidad del vehículo o si viola la ventana de entrega de un paquete.
-   **Transiciones de Estado**: Las entidades `Paquete`, `Vehiculo` y el agregado `Ruta` tienen máquinas de estado estrictas. Por ejemplo, una ruta no puede pasar de `PLANIFICADA` a `COMPLETADA` sin pasar por `ACTIVA`.
-   **Inmutabilidad de VOs**: Los objetos de valor como `Ubicacion` o `VentanaTiempo` no pueden ser modificados después de su creación, lo que previene efectos secundarios inesperados.
-   **Unicidad de Identidad**: Cada entidad y agregado tiene un `UniqueEntityID` que lo distingue de forma única.
