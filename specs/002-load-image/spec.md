# Feature Specification: Selección de Imagen Alternativa para Recetas mediante Carrusel

**Feature Branch**: `feature/002-load-image`

**Created**: 2026-10-14

**Status**: Draft

**Input**: User description: "Create a new spec called spec/002-load-image where we configure with Github Spec kit the hability to load a diferent image to the current recipes. Must be a carrousel of options rise from the click on the image from the detail screen which allow the user to select a diferent image to the recipe from the API. Create a custom branch called feature/002-load-image to do this. Go with firts step of github spec kit"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Exploración de Opciones Visuales en Carrusel Interactivo (Priority: P1)

Como usuario que explora el detalle de una receta culinaria, quiero hacer clic sobre la fotografía principal para abrir un carrusel interactivo con múltiples opciones de imágenes gastronómicas obtenidas desde la API mediante las palabras clave de la receta, para evaluar diferentes alternativas visuales que representen mejor el plato a mi gusto.

**Why this priority**: Es el punto de entrada nuclear de la funcionalidad. Sin la capacidad de interactuar con la imagen principal y desplegar el carrusel de alternativas disponibles desde el servicio de imágenes, el usuario no puede descubrir otras opciones visuales.

**Independent Test**: Puede probarse de manera autónoma abriendo la vista en detalle de cualquier receta existente, haciendo clic sobre su imagen principal y comprobando que se despliega un diálogo o carrusel navegable con varias imágenes alternativas cargadas por las palabras clave del plato.

**Acceptance Scenarios**:

1. **Given** que el usuario se encuentra en la pantalla de detalle de una receta, **When** hace clic o toca sobre la imagen principal del plato, **Then** el sistema despliega un carrusel interactivo que muestra una galería de imágenes alternativas recuperadas desde el servicio de imágenes a partir de las palabras clave de la receta.
2. **Given** que el carrusel está en proceso de consultar y descargar las imágenes alternativas, **When** el usuario abre el visor, **Then** el sistema presenta indicadores de carga esqueléticos elegantes acordes a la identidad visual de la aplicación.
3. **Given** el carrusel desplegado con múltiples opciones, **When** el usuario interactúa con los controles de navegación (flechas anterior/siguiente, desplazamiento táctil o teclado), **Then** el carrusel permite examinar de manera fluida todas las imágenes candidatas disponibles.

---

### User Story 2 - Selección y Persistencia de la Nueva Imagen de la Receta (Priority: P1)

Como usuario que ha encontrado una imagen más representativa o apetitosa en el carrusel, quiero seleccionar dicha imagen con un solo clic para que pase a ser la imagen activa de la receta tanto en la vista de detalle como en el catálogo principal y el planificador semanal, manteniéndose guardada entre visitas.

**Why this priority**: Proporciona el valor definitivo de personalización al usuario. Permitir ver alternativas sin poder aplicarlas ni guardarlas no satisfaría el objetivo funcional del requisito.

**Independent Test**: Puede probarse seleccionando una imagen dentro del carrusel, verificando que la imagen de la receta cambia inmediatamente en el detalle, volviendo al catálogo para constatar que la tarjeta muestra la nueva imagen y recargando la página para confirmar la persistencia del cambio.

**Acceptance Scenarios**:

1. **Given** el carrusel de imágenes alternativas abierto, **When** el usuario hace clic en una de las imágenes candidatas, **Then** el sistema establece esa imagen como la imagen activa de la receta y cierra el carrusel o confirma la selección de forma inmediata.
2. **Given** una receta cuya imagen ha sido cambiada por el usuario, **When** el usuario navega al catálogo general o al planificador de comidas semanal, **Then** la tarjeta y las referencias de dicha receta exhiben la nueva imagen seleccionada.
3. **Given** una receta con imagen personalizada, **When** el usuario recarga la página o abre una nueva sesión en el mismo navegador, **Then** el sistema conserva la selección visual realizada por el usuario.

---

### User Story 3 - Cancelación, Restauración y Resiliencia ante Contingencias (Priority: P2)

Como usuario que explora alternativas visuales, quiero poder cerrar el carrusel sin alterar la imagen actual, tener la posibilidad de restaurar la imagen original por defecto y contar con un comportamiento seguro si no hay imágenes adicionales o falla la red, garantizando que la receta nunca quede sin imagen.

**Why this priority**: Asegura la robustez y la ergonomía de la interfaz, previniendo estados inconsistentes o cambios no deseados en la presentación de los platos.

**Independent Test**: Puede validarse abriendo el carrusel y cerrándolo mediante el botón de cierre, la tecla Escape o pulsando fuera del modal para constatar que la imagen previa no cambia; asimismo, probando con recetas sin resultados adicionales o sin conexión a internet y comprobando que se preserva la imagen original con un mensaje informativo.

**Acceptance Scenarios**:

1. **Given** el carrusel de alternativas abierto, **When** el usuario presiona el botón de cierre, la tecla Escape o hace clic en el área exterior del diálogo, **Then** el carrusel se cierra sin modificar la imagen actual de la receta.
2. **Given** una receta con imagen personalizada previa, **When** el usuario abre el carrusel y selecciona la opción "Restablecer imagen original", **Then** la receta vuelve a mostrar la imagen gastronómica asignada por defecto.
3. **Given** una situación de fallo de red, cuota excedida o ausencia de resultados alternativos para las palabras clave, **When** el usuario abre el carrusel, **Then** el sistema muestra un mensaje claro indicando que no se pudieron cargar nuevas alternativas y conserva intacta la imagen previa sin romper la interfaz.

---

### Edge Cases

- **Ausencia de imágenes alternativas para una palabra clave**: Si la búsqueda devuelve únicamente una imagen o ninguna adicional, el carrusel debe indicar de forma amigable que no existen alternativas disponibles para ese término gastronómico y permitir cerrar el selector.
- **Latencia elevada de red al cargar el carrusel**: Si las imágenes tardan en descargarse, el sistema debe mantener los contenedores esqueléticos activos sin bloquear la navegación del usuario ni permitir selecciones de recursos vacíos.
- **Fallo al cargar una imagen seleccionada**: Si la URL de una imagen seleccionada falla posteriormente, el sistema debe recurrir automáticamente a la imagen original o al respaldo visual predeterminado sin mostrar iconos de error rotos.
- **Dispositivos móviles y pantallas táctiles**: El carrusel debe responder fluidamente al gesto de deslizamiento horizontal (*swipe*) y los controles interactivos deben respetar dimensiones mínimas táctiles de 44x44 píxeles.
- **Múltiples aperturas y cierres rápidos del carrusel**: La aplicación no debe generar fugas de memoria, peticiones redundantes repetidas ni desincronización de estados en la interfaz.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema DEBE permitir interactuar mediante clic o pulsación sobre la imagen principal de la receta en la pantalla de detalle para activar la selección de imágenes alternativas.
- **FR-002**: El sistema DEBE presentar un indicador visual sutil (como una superposición con texto o icono de cambio de imagen) en la vista de detalle para comunicar al usuario que la imagen es interactiva y modificable.
- **FR-003**: El sistema DEBE desplegar un diálogo modal o panel superpuesto accesible que contenga un carrusel con las imágenes alternativas disponibles.
- **FR-004**: El sistema DEBE solicitar al servicio de imágenes un conjunto de múltiples imágenes candidatas (entre 4 y 10 opciones) utilizando las palabras clave asociadas a la receta.
- **FR-005**: El sistema DEBE proveer controles de navegación en el carrusel que permitan avanzar y retroceder entre las opciones de forma intuitiva, tanto con puntero como por teclado y gestos táctiles.
- **FR-006**: El sistema DEBE permitir al usuario seleccionar cualquiera de las imágenes candidatas del carrusel con una sola acción de confirmación.
- **FR-007**: El sistema DEBE actualizar de inmediato la imagen de la receta en la pantalla de detalle tras la selección de una nueva imagen.
- **FR-008**: El sistema DEBE reflejar la nueva imagen seleccionada en todas las áreas de la aplicación donde aparezca la receta, incluyendo las tarjetas del catálogo general y las ranuras del planificador semanal.
- **FR-009**: El sistema DEBE persistir la elección de imagen del usuario en almacenamiento local para mantenerla disponible en posteriores visitas y recargas.
- **FR-010**: El sistema DEBE ofrecer una acción accesible para cerrar o cancelar el carrusel sin aplicar modificaciones a la imagen actual.
- **FR-011**: El sistema DEBE proporcionar una opción para restablecer la imagen de la receta a su valor inicial por defecto.
- **FR-012**: El sistema DEBE gestionar contingencias de red o cuotas de API de forma resiliente, informando al usuario y manteniendo visible la imagen anterior en caso de error.

### Key Entities

- **Candidato de Imagen de Receta (`RecipeImageCandidate`)**: Recurso gráfico obtenido del servicio externo. Atributos: identificador único, URL de alta definición, URL miniatura para el carrusel, descripción accesible (*alt text*), crédito o atribución fotográfica y estado de selección activa.
- **Preferencia de Imagen de Receta (`RecipeImagePreference`)**: Registro persistente de la elección personalizada del usuario. Atributos: identificador de la receta, URL de la imagen seleccionada, palabras clave asociadas, metadatos de autoría y fecha de modificación.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El carrusel de alternativas se abre en menos de 300 ms tras el clic en la imagen de la receta.
- **SC-002**: El sistema presenta al menos 4 opciones visuales alternativas cuando el servicio de imágenes dispone de resultados para las palabras clave del plato.
- **SC-003**: La actualización visual de la receta tras seleccionar una imagen alternativa ocurre en tiempo real (en menos de 150 ms) y sin recargar la página.
- **SC-004**: El 100% de las imágenes personalizadas por el usuario persisten correctamente tras reiniciar la sesión o recargar la aplicación en el navegador.
- **SC-005**: El 100% de las recetas conserva su imagen original o de respaldo sin rupturas visuales si el servicio de imágenes no devuelve resultados adicionales o experimenta caídas.
- **SC-006**: El carrusel y sus controles son 100% utilizables tanto en resoluciones móviles (desde 360px) como en pantallas de escritorio.

## Assumptions

- **Disponibilidad de Múltiples Imágenes en el Servicio**: El proveedor de imágenes admite solicitudes de listas de imágenes por palabra clave (devolviendo una colección de resultados en lugar de únicamente un recurso aislado).
- **Almacenamiento Local para Preferencias**: Las personalizaciones de imagen se almacenan localmente en el navegador del usuario (`localStorage`), garantizando inmediatez, privacidad y funcionamiento sin requerir autenticación en un servidor remoto.
- **Metadatos de Recetas Preexistentes**: Todas las recetas del catálogo disponen de palabras clave gastronómicas válidas que pueden utilizarse como criterio de búsqueda para el carrusel.
- **Compatibilidad con Normas de Estilo**: El carrusel y los diálogos siguen la misma línea estética gastronómica profesional y la normativa de cero emojis establecida en el repositorio.
