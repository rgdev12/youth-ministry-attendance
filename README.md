# Youth Ministry Attendance

Aplicación para gestionar la asistencia de miembros de un grupo de ministerio juvenil, capaz de realizar registros, reportes y análisis estadísticos.

## Características

- **Gestión de Miembros**: Crear, leer, actualizar y eliminar miembros.
- **Registro de Asistencia**: Fácilmente marcar asistencia para reuniones semanales o eventos especiales.
- **Reportes**: Generar reportes de asistencia detallados y exportarlos a Excel.
- **Tablero**: Visualizar tendencias de asistencia y métricas clave.
- **Autenticación**: Acceso seguro para administradores mediante Supabase Auth.
- **Diseño Responsivo**: Enfoque mobile-first con mejoras para escritorio.

## Stack Tecnológico

- **Frontend**: Angular 21
- **Estilos**: TailwindCSS 4, PrimeNG 21
- **Iconos**: Lucide Angular, PrimeIcons
- **Backend / Base de Datos**: Supabase
- **Visualización de Datos**: Chart.js
- **Exportación a Excel**: ExcelJS

## Comenzando

### Prerrequisitos

- Node.js (v18 o superior recomendado)
- pnpm

### Instalación

1. **Clonar el repositorio:**
   ```bash
   git clone <repository-url>
   cd youth-ministry-attendance
   ```

2. **Instalar dependencias:**
   ```bash
   pnpm install
   ```

3. **Configurar Entorno:**
   Crea un proyecto en Supabase y agrega tus credenciales en `src/environments/environment.ts`:
   ```typescript
   export const environment = {
     production: false,
     supabase: {
       url: 'TU_URL_DE_SUPABASE',
       anonKey: 'TU_ANON_KEY_DE_SUPABASE'
     }
   };
   ```

### Servidor de Desarrollo

Ejecuta `pnpm start` para un servidor de desarrollo. Navega a `http://localhost:4200/`. La aplicación se recargará automáticamente si cambias alguno de los archivos fuente.

### Build (Construcción)

Ejecuta `pnpm run build` para construir el proyecto. Los artefactos de construcción se almacenarán en el directorio `dist/`.

## Ejecutando Tests

Ejecuta `pnpm run test` para ejecutar las pruebas unitarias a través de [Vitest](https://vitest.dev/).
