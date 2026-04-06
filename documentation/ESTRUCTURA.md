# Estructura del Proyecto

Este documento detalla la estructura de directorios del proyecto, basada en los principios de Domain-Driven Design (DDD) y una arquitectura hexagonal.

## Directorios Principales

-   `config/`: Archivos de configuración para diferentes entornos (development, production, etc.).
-   `documentation/`: Documentación adicional del proyecto, como este archivo.
-   `docs/`: Documentación generada automáticamente (e.g., Compodoc).
-   `scripts/`: Scripts de utilidad para el proyecto (e.g., migraciones, automatización).
-   `src/`: Contiene todo el código fuente de la aplicación.
-   `tests/`: Contiene las pruebas de la aplicación, separadas por tipo.

## Estructura de `src`

El directorio `src` está organizado en tres capas principales: Puntos de Entrada, Contextos y Compartido.

### `src/EntryPoints`

Contiene los adaptadores primarios o los puntos de entrada a la aplicación.

-   `Api/`: Punto de entrada para la API REST (e.g., controladores de NestJS, `main.ts`, `app.module.ts`).
-   `Cli/`: Punto de entrada para la interfaz de línea de comandos (CLI).

### `src/Contexts`

Aquí es donde reside la lógica de negocio principal, organizada por Bounded Contexts de DDD. Cada contexto es un módulo de negocio autocontenido.

-   `ContextoA/`
    -   `Application/`: Casos de uso (servicios de aplicación).
    -   `Domain/`: El corazón del contexto: entidades, agregados, value objects, repositorios (interfaces), eventos de dominio.
    -   `Infrastructure/`: Implementaciones concretas de las interfaces definidas en el dominio (e.g., repositorios de base de datos, clientes HTTP).
-   `ContextoB/`
    -   ... (misma estructura)

### `src/Shared`

Contiene código que es compartido entre múltiples Bounded Contexts. Este código debe ser genérico y no contener lógica de negocio específica de un contexto.

-   `Application/`: Lógica de aplicación compartida (e.g., DTOs base).
-   `Domain/`: Conceptos de dominio compartidos (e.g., `AggregateRoot`, `ValueObject` base, eventos de dominio genéricos).
-   `Infrastructure/`: Infraestructura compartida (e.g., bus de eventos, logger, configuración de base de datos).

## Estructura de `tests`

Las pruebas están organizadas para reflejar la estructura del código fuente y el tipo de prueba.

-   `E2E/`: Pruebas End-to-End que simulan el comportamiento del usuario final a través de la API.
-   `Integration/`: Pruebas de integración que verifican la colaboración entre varias unidades o componentes (e.g., casos de uso con la base de datos).
-   `Unit/`: Pruebas unitarias que prueban componentes individuales de forma aislada (e.g., entidades de dominio, casos de uso con mocks).
