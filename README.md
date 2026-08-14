# Paranormal Social Network 🛸💀

[![Angular](https://img.shields.io/badge/Frontend-Angular%2017+-red?style=for-the-badge&logo=angular)](https://angular.io/)
[![NestJS](https://img.shields.io/badge/Backend-NestJS-E0234E?style=for-the-badge&logo=nestjs)](https://nestjs.com/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![TailwindCSS](https://img.shields.io/badge/Styles-Tailwind%20CSS-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![Jest](https://img.shields.io/badge/Testing-Jest-C21325?style=for-the-badge&logo=jest)](https://jestjs.io/)

> **Logia Status: ONLINE.** Una plataforma Full-Stack de alto rendimiento diseñada para investigadores de lo paranormal. Permite el registro de avistamientos, hilos espectrales, interacción en tiempo real y analíticas avanzadas del plano terrenal.

Desarrollado como proyecto integrador final de desarrollo de software para la **Universidad Tecnológica Nacional (UTN)**.

---

## 👤 Autor

* **Braian Ezequiel Sineriz** - *Desarrollador Full-Stack* - [GitHub](https://github.com/EzequielSineriz)

Proyecto integrador final de desarrollo de software desarrollado para la **Universidad Tecnológica Nacional (UTN)**.

---

## 🌌 Demostración y Deploys

* **Sitio En Vivo (Frontend):** [https://red-social-front-swart.vercel.app/auth/login](https://red-social-front-swart.vercel.app/auth/login)
* **API Endpoint (Backend):** [https://ezequiel-si-eriz-tp2-prog4-2026-c1.onrender.com](https://ezequiel-si-eriz-tp2-prog4-2026-c1.onrender.com)

---

## 🛠️ Arquitectura del Ecosistema

El proyecto se encuentra dividido de manera limpia en dos carpetas independientes (`front` y `back`) cumpliendo estrictos estándares de desarrollo empresarial:

### 🖥️ Frontend (Angular)
* **UI/UX Inmersiva:** Estructura basada en componentes reutilizables con una estética cyberpunk/cyber-goth optimizada con **Tailwind CSS**, efectos de glassmorphism, animaciones de parpadeo neón y atmósfera de audio interactiva.
* **Gestión de Estado y Reactividad:** Implementación avanzada de **Angular Signals** y operadores reactivos con **RxJS** para la fluidez de datos.
* **Seguridad y Sesión:** Sistema de autenticación con Guardianes (`AuthGuard`), almacenamiento local seguro de tokens y un interceptor global que gestiona automáticamente errores HTTP `401 Unauthorized`.
* **Manejo del Ciclo de Vida del Token:** Control interactivo de expiración de sesión a los 10 minutos con modales de advertencia y refresco asincrónico antes de la expiración final del JWT (15 min).
* **Optimización Móvil:** Implementado como **PWA (Progressive Web App)** con soporte offline, instalación nativa y service workers eficientes.

### ⚙️ Backend (NestJS)
* **Estructura Modular:** Organización limpia dividida por dominios de negocio: `AuthModule`, `UsuarioModule`, `PublicacionModule`, `ComentarioModule` y `EstadisticasModule`.
* **Persistencia de Datos:** Arquitectura de modelos y agregaciones complejas utilizando **Mongoose** sobre **MongoDB Atlas**.
* **Criptografía y Seguridad:** Encriptación de credenciales con **Bcrypt** y emisión de firmas asimétricas mediante **JSON Web Tokens (JWT)** inyectando roles jerárquicos (`usuario` / `admin`).
* **Blindaje Global & Protecciones:**
  * **Rate Limiting:** Implementado mediante `@nestjs/throttler` (límite global de 60 peticiones/min por IP) para mitigar ataques de denegación de servicio (DoS) y fuerza bruta.
  * **Sanitización de Payload:** Inyección global de `ValidationPipe` con `whitelist: true` y `forbidNonWhitelisted: true` para prevenir ataques de **NoSQL Injection**.
  * **Control de Acceso Fuerte (Ownership & Roles):** Verificación estricta de propiedad de recursos e identificación de roles (`ForbiddenException` / HTTP 403) previa a mutaciones o bajas en la base de datos.
* **Carga Segura de Archivos:** Interceptor de subidas (`Multer`) con validación de firma y MimeType en memoria, límites de peso estricto (hasta 5MB) y nombrado con sufijos criptográficos únicos para evitar colisiones y *File Upload Spoofing*.
* **Pruebas Unitarias Automatizadas:** Suite de tests integrados con **Jest** para la validación del motor de autorización en reglas críticas del negocio.

---

## ✨ Características Principales por Módulo

### 👤 1. Portal de Acceso e Identidad
* **Login Híbrido:** Autenticación fluida permitiendo ingresar indistintamente por `nombreUsuario` o `email`.
* **Registro Avanzado con Carga de Archivos:** Formulario reactivo de alta complejidad con validaciones nativas estrictas en tiempo real, confirmación de contraseñas complejas, carga asincrónica de imágenes de perfil (`avatarUrl`) y geolocalización o descripción personalizada.
* **Carga Rápida de Credenciales:** Panel exclusivo de bypass en desarrollo para simular ingresos inmediatos de moderadores y administradores autorizados.

### 📝 2. El Portal de Publicaciones (Muro Espectral)
* **Scroll Infinito Nativo:** Reemplazo de la paginación convencional por carga diferida bajo demanda del usuario al deslizarse por la pantalla.
* **Filtros y Ordenamiento Dinámico:** Consultas parametrizadas en base a parámetros `limit` y `offset` modificables en caliente por fecha, cantidad de *Likes*, cantidad de veces guardado o veces compartido.
* **Interacciones & Baja Lógica:** Sistema atómico de dar/quitar *Me gusta* (1 por usuario) y control estricto de borrado (`eliminada: true`) protegido por políticas del creador o rol de Administrador.

### 💬 3. Hilos de Conversación y Portabilidad
* **Auditoría de Edición:** Capacidad de modificar comentarios en caliente, actualizando el estado visual del componente con la etiqueta `(editado)` mediante el atributo dinámico `modificado: true`.
* **Marcadores y Compartir:** Módulo dedicado para guardar posts favoritos en la sección personal y un sistema de mensajería interna para "compartir" expedientes enviando la publicación directamente al feed de otro investigador.

### 📈 4. Dashboard de Administración y Estadísticas (Rol Admin)
* **Panel de Control de Personal:** CRUD completo de habilitación, deshabilitación y creación manual de usuarios con asignación directa de privilegios.
* **Métricas del Sistema:** Consumo de rutas protegidas del `EstadisticasController` para alimentar tableros visuales interactivos (gráficos de barras, tortas y líneas):
  * Fluctuación temporal de comentarios recibidos e interacciones totales de la red.
  * Volumen de publicaciones discriminado por usuario y rangos de tiempo elegibles (*Última Semana*, *Último Mes*, *Histórico Completo*).
  * Métricas de engagement: Accesos al login, visitas únicas de perfiles y conteo diario de me gusta otorgados.

---

## 🎨 Elementos Técnicos Propios (Custom Angular)

Para potenciar la modularidad del código y evitar dependencias de terceros innecesarias, se desarrollaron utilidades nativas a medida:

* **3 Directivas Propias:** Controladores de comportamiento para manipulación del DOM, como animaciones de resplandor cíclico (`NeonGlowDirective`), formateo dinámico de inputs oscuros y renderizado condicional según roles.
* **3 Pipes Propias:** Transformadores de datos personalizados en plantilla para el formateo de strings criptográficos, máscaras de privacidad sobre correos electrónicos en el dashboard público y formateo temporal estilizado para las bitácoras.

---

## 🧪 Pruebas Unitarias (Testing)

El proyecto incluye pruebas unitarias ejecutables mediante **Jest** centradas en la lógica del negocio y seguridad:

```bash
# Ejecución general de pruebas en el backend
npm run test

# Ejecución específica sobre la suite de Publicaciones
npx jest src/publicaciones/publicacion.service.spec.ts
```

## 🚀 Instalación y Configuración Local

### Requisitos Previos

- Node.js (versión 18 o superior)

- Angular CLI instalado globalmente (npm i -g @angular/cli)

- Instancia de MongoDB (Local o Atlas)

### 📦 Configuración del Servidor (Backend)
1. Navegá a la carpeta del servidor:
```bash
cd back/red-social
npm install
```
2. Creá un archivo .env en la raíz de la carpeta back/red-social siguiendo este esquema:
```
Fragmento de código
PORT=3000
MONGO_URI=mongodb+srv://<usuario>:<password>@cluster.mongodb.net/paranormalDB
JWT_SECRET=TuPalabraSecretaDelPlanoAstralUltraSegura
```
3. Inicia el servidor en modo desarrollo:
```bash
npm run start:dev
```

### 💻 Configuración de la Interfaz (Frontend)
1. Navegá a la carpeta del cliente:
```bash
cd ../../front
```
2. Instala las dependencias:
```bash
npm install
```
3. Asegurá los ambientes de configuración en src/environments/environment.ts:
```TypeScript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/'
};
```
4. Desplegá el servidor de desarrollo local:
```bash
ng serve -o
```
Se abrirá automáticamente el navegador con la aplicación en ejecución.

## 🔮 Futuras Mejoras de la Plataforma
1. 📬 Sistema de Notificaciones en Tiempo Real (WebSockets / Socket.IO): Integración de @nestjs/platform-socket.io en el backend y un servicio reactivo en Angular para alertar instantáneamente al usuario cuando reciba un comentario, un Like o cuando se registre un nuevo avistamiento en el feed global.
2. 🔍 Buscador Avanzado con Filtros Combinados y Paginación Cursor-Based: Implementación de consultas complejas multi-campo en MongoDB para buscar expediente por palabras clave, etiquetas de lo paranormal, rango de fechas y ubicación geográfica, optimizando el rendimiento de memoria mediante cursores.
3. 📄 Documentación Interactiva de la API con Swagger/OpenAPI: Configuración de @nestjs/swagger para la generación automática de la especificación técnica en la ruta /api/docs, permitiendo probar los endpoints interactivamente e inspeccionar esquemas DTO.
4. 🧪 Expansión de la Cobertura de Tests (Auth & Comentarios): Incorporación de pruebas unitarias y de integración (E2E con Supertest) sobre la emisión de JSON Web Tokens, renovación de sesiones y la jerarquía de respuestas dentro del ComentarioService.
5. 🐳 Dockerización del Entorno (Dockerfile + docker-compose): Empaquetamiento de la aplicación backend en contenedores Docker y orquestación con un archivo docker-compose.yml que levante de manera coordinada el entorno Node.js y un contenedor oficial de MongoDB para despliegues plug & play.


## Licencia
Este proyecto fue desarrollado bajo fines académicos exclusivamente para la materia Programación IV. Quedan reservados todos los derechos de propiedad intelectual sobre el lore e interfaces de la aplicación.


