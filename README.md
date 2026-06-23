# Paranormal Social Network 🛸💀

[![Angular](https://img.shields.io/badge/Frontend-Angular%2017+-red?style=for-the-badge&logo=angular)](https://angular.io/)
[![NestJS](https://img.shields.io/badge/Backend-NestJS-E0234E?style=for-the-badge&logo=nestjs)](https://nestjs.com/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![TailwindCSS](https://img.shields.io/badge/Styles-Tailwind%20CSS-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)

> **Logia Status: ONLINE.** Una plataforma Full-Stack de alto rendimiento diseñada para investigadores de lo paranormal. Permite el registro de avistamientos, hilos espectrales, interacción en tiempo real y analíticas avanzadas del plano terrenal.

Desarrollado como proyecto integrador final de desarrollo de software para la **Universidad Tecnológica Nacional (UTN)**.

---

## 👤 Autor

* **Braian Ezequiel Sineriz** - *Desarrollador Full-Stack* - [Tu GitHub](https://github.com/EzequielSineriz)

Proyecto integrador final de desarrollo de software desarrollado para la **Universidad Tecnológica Nacional (UTN)**.

## 🌌 Demostración y Deploys

* **Sitio En Vivo (Frontend):** [Link a tu deploy en Vercel/Hostinger]
* **API Endpoint (Backend):** [Link a tu API en Render]
* **Video de Recorrido (Opcional):** [Link a Loom o YouTube]

---

## 🛠️ Arquitectura del Ecosistema

El proyecto se encuentra dividido de manera limpia en dos repositorios independientes/carpetas (`frontend` y `backend`) cumpliendo estrictos estándares de desarrollo empresarial:

### 🖥️ Frontend (Angular)
* **UI/UX Inmersiva:** Estructura basada en componentes reutilizables con una estética cyberpunk/cyber-goth optimizada con **Tailwind CSS**, efectos de glassmorphism, animaciones de parpadeo neón y atmósfera de audio interactiva.
* **Gestión de Estado y Reactividad:** Implementación avanzada de **Angular Signals** y operadores reactivos con **RxJS** para la fluidez de datos.
* **Seguridad y Sesión:** Sistema de autenticación con Guardianes (`AuthGuard`), almacenamiento local seguro de tokens y un interceptor global que gestiona automáticamente errores HTTP `401 Unauthorized`.
* **Manejo del Ciclo de Vida del Token:** Control interactivo de expiración de sesión a los 10 minutos con modales de advertencia y refresco asincrónico antes de la expiración final del JWT (15 min).
* **Optimización Móvil:** Implementado como **PWA (Progressive Web App)** con soporte offline, instalación nativa y service workers eficientes.

### ⚙️ Backend (NestJS)
* **Estructura Modular:** Organización limpia dividida por dominios de negocio: `Autenticación`, `Usuarios`, `Publicaciones` y `Estadísticas`.
* **Persistencia de Datos:** Arquitectura de modelos y agregaciones complejas utilizando **Mongoose** sobre **MongoDB Atlas**.
* **Criptografía y Seguridad:** Encriptación de credenciales con **Bcrypt** y emisión de firmas asimétricas mediante **JSON Web Tokens (JWT)** inyectando roles jerárquicos (`usuario` / `administrador`).
* **Semántica HTTP Estricta:** Respuestas del servidor normalizadas y tipadas de acuerdo a los estándares REST (`201 Created`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`).
* **Manejo de Archivos:** Interceptor de carga de archivos multimedia (`Multer`) para el almacenamiento local y procesamiento seguro de imágenes de perfil y avistamientos.

---

## ✨ Características Principales por Módulo

### 👤 1. Portal de Acceso e Identidad
* **Login Híbrido:** Autenticación fluida permitiendo ingresar indistintamente por `nombreUsuario` o `email`.
* **Registro Avanzado con Carga de Archivos:** Formulario reactivo de alta complejidad con validaciones nativas estrictas en tiempo real, confirmación de contraseñas complejas, carga asincrónica de imágenes de perfil (`avatarUrl`) y geolocalización o descripción personalizada.
* **Carga Rápida de Credenciales:** Panel exclusivo de bypass en desarrollo para simular ingresos inmediatos de moderadores y administradores autorizados.

### 📝 2. El Portal de Publicaciones (Muro Espectral)
* **Scroll Infinito Nativo:** Reemplazo de la paginación convencional por carga diferida bajo demanda del usuario al deslizarse por la pantalla.
* **Filtros y Ordenamiento Dinámico:** Consultas parametrizadas en base a parámetros `limit` y `offset` modificables en caliente por fecha, cantidad de *Likes*, cantidad de veces guardado o veces compartido.
* **Interacciones:** Sistema atómico de dar/quitar *Me gusta* (1 por usuario) y control estricto de borrado (Baja Lógica) protegido por políticas del creador o rol de Administrador.

### 💬 3. Hilos de Conversación y Portabilidad
* **Auditoría de Edición:** Capacidad de modificar comentarios en caliente, actualizando el estado visual del componente con la etiqueta `(editado)` mediante el atributo dinámico `modificado: true`.
* **Marcadores y Compartir:** Módulo dedicado para guardar posts favoritos en la sección personal y un sistema de mensajería interna para "compartir" expedientes enviando la publicación directamente al feed de otro investigador.

### 📈 4. Dashboard de Administración y Estadísticas (Rol Admin)
* **Panel de Control de Personal:** CRUD completo de habilitación, deshabilitación y creación manual de usuarios con asignación directa de privilegios.
* **Métricas del Sistema:** Consumo de rutas protegidas del `Estadísticas Controller` para alimentar tableros visuales interactivos (gráficos de barras, tortas y líneas):
    * Fluctuación temporal de comentarios recibidos e interacciones totales de la red.
    * Volumen de publicaciones discriminado por usuario y rangos de tiempo elegibles (*Última Semana*, *Último Mes*, *Histórico Completo*).
    * Métricas de engagement: Accesos al login, visitas únicas de perfiles y conteo diario de me gusta otorgados.

---

## 🎨 Elementos Técnicos Propios (Custom Angular)

Para potenciar la modularidad del código y evitar dependencias de terceros innecesarias, se desarrollaron utilidades nativas a medida:

* **3 Directivas Propias:** Controladores de comportamiento para manipulación del DOM, como animaciones de resplandor cíclico (`NeonGlowDirective`), formateo dinámico de inputs oscuros y renderizado condicional según roles.
* **3 Pipes Propias:** Transformadores de datos personalizados en plantilla para el formateo de strings criptográficos, máscaras de privacidad sobre correos electrónicos en el dashboard público y formateo temporal estilizado para las bitácoras.

---

## 🚀 Instalación y Configuración Local

### Requisitos Previos
* Node.js (versión 18 o superior)
* Angular CLI instalado globalmente (`npm i -g @angular/cli`)
* Instancia de MongoDB (Local o Atlas)

### 📦 Configuración del Servidor (Backend)
1. Navegá a la carpeta del servidor:
   ```bash
   cd backend
   npm install

   '''
2)Creá un archivo .env en la raíz de la carpeta backend siguiendo este esquema:

   ```bash
   PORT=3000
   MONGO_URI=mongodb+srv://<usuario>:<password>@cluster.mongodb.net/paranormalDB
   JWT_SECRET=TuPalabraSecretaDelPlanoAstralUltraSegura
```
3)Inicia el servidor en modo desarrollo
   ```bash
npm run start:dev
```


## 💻 Configuración de la Interfaz (Frontend)

1)Navegá a la carpeta del cliente:
```bash
   cd .. /front
```
2)Instala las dependencias:
```bash
   npm install
```

3)Asegurá los ambientes de configuración en src/environments/environment.ts:
```bash
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/'
};
```
4)Desplegá el servidor de desarrollo local:
```bash
ng serve -o
```

Se va abir el navegador el proyecto


## 📝 Licencia
Este proyecto fue desarrollado bajo fines académicos exclusivamente para la materia Programación IV. Quedan reservados todos los derechos de propiedad intelectual sobre el lore e interfaces de la aplicación.



   
   



