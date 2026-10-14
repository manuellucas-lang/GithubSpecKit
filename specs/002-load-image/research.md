# Research & Architecture Decisions: Selección de Imagen Alternativa para Recetas mediante Carrusel

**Feature**: `002-load-image`  
**Status**: Completed  
**Date**: 2026-10-14  

---

## 1. Diseño del Carrusel Visual Interactivo en React 19

### Decision
Implementar un componente de carrusel accesible utilizando **CSS Scroll Snap** combinado con estado reactivo ligero en React 19, complementado con controles de navegación (flechas previo/siguiente con Lucide React) y soporte táctil nativo (*touch swipe*):
- Contenedor con `scroll-snap-type: x mandatory` y elementos hijos con `scroll-snap-align: center`.
- Controles de navegación previo y siguiente mediante botones accesibles (`aria-label`) que invocan `element.scrollTo({ left, behavior: 'smooth' })`.
- Indicadores visuales de posición (puntos de paginación o tarjetas en miniatura).
- Animaciones fluidas utilizando variables de transición de `theme.css`.

### Rationale
- Cumple estrictamente con el **Principio V de la Constitución (Simplicidad & YAGNI)**: evita incorporar librerías externas voluminosas (como Swiper, Embla Carousel o Slick), ahorrando más de 40 KB en el bundle final.
- **Rendimiento nativo**: CSS Scroll Snap delega la aceleración por hardware al motor del navegador, alcanzando 60 fps constantes en desplazamientos táctiles en móviles y fluidez total en escritorio.
- Totalmente compatible con la arquitectura de React 19 y las reglas de diseño y accesibilidad del proyecto.

### Alternatives Considered
- **Swiper / Embla Carousel**: Librerías robustas, pero introducen dependencias de terceros innecesarias para un carrusel enfocado de 4 a 10 imágenes candidatas.
- **Scroll horizontal sin snap**: Fácil de maquetar pero ofrece una experiencia descuidada y poco profesional al detenerse las imágenes en posiciones intermedias arbitrarias.

---

## 2. Proveedor de Imágenes Candidatas Múltiples y Resiliencia

### Decision
Extender el adaptador `ImageProviderClient` con el método `fetchImageCandidatesByKeyword(options)`:
- Admite el parámetro `count` (por defecto 6 imágenes candidatas).
- Consulta primero la biblioteca curada en memoria para recetas conocidas, ofreciendo un conjunto de al menos 4 a 6 fotografías gastronómicas de alta calidad por plato.
- Para palabras clave no preconfiguradas, consulta la API remota con `per_page=6`.
- En caso de contingencia de red, cuota excedida (HTTP 429) o ausencia de resultados, devuelve una colección de candidatos basados en ilustraciones vectoriales SVG temáticas con gradientes diferenciados para que el usuario siempre pueda interactuar y seleccionar sin errores.
- Cache en memoria y `sessionStorage` indexado por `candidates:${keyword}` para optimizar peticiones y no agotar cuotas.

### Rationale
- Desacoplamiento *Library-First* (**Principio I de la Constitución**): la capa de presentación no interactúa con endpoints HTTP directamente, sino con el contrato `IImageProviderClient`.
- Cumple con los requisitos **FR-004** y **FR-012**, garantizando resiliencia absoluta y experiencia visual sin fisuras ni pantallas rotas.

### Alternatives Considered
- **Reutilizar solo una imagen**: No cumpliría el requisito central de ofrecer alternativas al usuario.
- **Carga de archivos locales por el usuario**: Fuera del alcance solicitado; el requerimiento especifica expresamente seleccionar imágenes alternativas desde la API.

---

## 3. Modelo de Persistencia Reactiva de Preferencias de Imagen

### Decision
Crear el servicio de dominio `RecipeImagePreferenceService` con almacenamiento local (`localStorage`) bajo la clave normalizada `recipe_catalog_image_preferences`:
- Mapeo de tipo diccionario: `{ [recipeId: string]: SelectedImagePreference }`.
- Métodos públicos: `getPreference(recipeId)`, `setPreference(recipeId, image)`, `clearPreference(recipeId)`, `getAllPreferences()`.
- Sincronización reactiva: Despacho de eventos de cambio de almacenamiento (`storage` y `CustomEvent('recipe-image-changed')`) para que cualquier componente montado (`RecipeCard`, `RecipeDetail`, `WeeklyPlanner`) actualice su visualización al instante sin requerir recargar la página.

### Rationale
- Cumple con **FR-008** y **FR-009**: la selección del usuario se propaga inmediatamente al catálogo general y al planificador semanal, y se mantiene intacta entre visitas.
- Permite restablecer fácilmente la imagen original de cualquier receta (**FR-011**) eliminando su entrada correspondiente en el almacén local.

### Alternatives Considered
- **Estado efímero en memoria**: Se perdería al recargar la página o navegar fuera del detalle.
- **Base de datos remota / Backend**: Sobrecarga innecesaria que violaría el principio YAGNI y requeriría autenticación de usuarios.

---

## 4. Experiencia de Usuario y Accesibilidad en Diálogo Modal

### Decision
Encapsular el carrusel en un componente modal accesible `RecipeImageCarouselModal`:
- Activación al hacer clic sobre la imagen principal de la receta en `RecipeDetail.tsx`, con un indicador visual superpuesto (*badge* o botón sutil de cámara "Cambiar imagen").
- Gestión de accesibilidad: soporte para cerrar con la tecla `Escape`, clic en el fondo oscuro (*backdrop click*) y botón explícito de cierre con `aria-label="Cerrar selector de imagen"`.
- Botón "Restablecer por defecto" disponible cuando la receta tenga una imagen personalizada activa.

### Rationale
- Asegura ergonomía superior, evitando cambios accidentales y permitiendo cancelar la exploración sin alterar la receta actual (**FR-010**).
- Cumplimiento de estándares de accesibilidad WCAG y coherencia con los componentes existentes del proyecto.
