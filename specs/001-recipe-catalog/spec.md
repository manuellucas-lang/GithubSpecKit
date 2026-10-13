# Feature Specification: Catálogo Profesional de Recetas con Alérgenos e Imágenes Dinámicas

**Feature Branch**: `001-recipe-catalog`

**Created**: 2026-10-13

**Status**: Draft

**Input**: User description: "Crea una lista de recetas que permita visualizar ingredientes, receta con tiempos de cocion, alegenos e ingredientes. Debe ser una aplicacion web con React 19 y todos los plugins necesarios para ello. Debe ser visualmente profesional cargando una imagen por receta desde una API que permita la carga de imagenes por keyword. GEnera solo documentacion no codigo"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Exploración y Consulta Detallada de Recetas (Priority: P1)

Como aficionado a la cocina o comensal con requerimientos dietéticos, quiero explorar una lista organizada de recetas y consultar sus detalles (ingredientes, pasos de preparación, tiempos de cocción y alérgenos destacados), para planificar mi menú y cocinar de forma informada y segura.

**Why this priority**: Es el valor nuclear de la aplicación. Sin la capacidad de visualizar las recetas con sus ingredientes, tiempos y advertencias de alérgenos, el sistema no cumple su función principal.

**Independent Test**: Puede probarse de forma autónoma presentando un conjunto de recetas y verificando que el usuario puede abrir cada una, observar la lista completa de ingredientes, los tiempos desglosados (preparación y cocción) y la presencia de alérgenos.

**Acceptance Scenarios**:

1. **Given** que el usuario accede a la aplicación web, **When** visualiza la página principal, **Then** debe ver una cuadrícula o lista de recetas disponibles con su título, tiempo estimado y resumen visual de alérgenos.
2. **Given** una receta seleccionada en el catálogo, **When** el usuario interactúa para ver su detalle, **Then** el sistema presenta la lista desglosada de ingredientes con cantidades, las instrucciones paso a paso, los tiempos de cocción claramente diferenciados y las alertas visibles de alérgenos.
3. **Given** una receta sin alérgenos conocidos, **When** el usuario visualiza los detalles, **Then** el sistema indica explícitamente "Libre de alérgenos comunes declarados" para evitar ambigüedades de seguridad alimentaria.

---

### User Story 2 - Experiencia Visual Profesional con Imágenes Dinámicas por Palabra Clave (Priority: P2)

Como usuario visual que busca inspiración gastronómica, quiero que cada receta incluya una fotografía atractiva y de alta calidad cargada dinámicamente mediante una palabra clave asociada, para disfrutar de una interfaz profesional, atractiva y apetitosa.

**Why this priority**: La presentación visual profesional y la carga de imágenes por palabra clave enriquecen la experiencia del usuario y diferencian la solución de una simple lista de texto plano.

**Independent Test**: Puede probarse configurando recetas con diversas palabras clave (ej. "paella", "sushi", "chocolate cake") y confirmando que la interfaz solicita y renderiza una imagen nítida para cada una, mostrando indicadores de carga y una imagen de reserva (*placeholder* temático) si la API externa falla.

**Acceptance Scenarios**:

1. **Given** una receta con una palabra clave gastronómica configurada, **When** se renderiza la tarjeta o detalle de la receta, **Then** el sistema solicita y exhibe una imagen de alta resolución representativa de dicha palabra clave proveniente del servicio de imágenes.
2. **Given** una latencia en el servicio de imágenes o red lenta, **When** la imagen aún se encuentra en proceso de descarga, **Then** el sistema muestra un indicador de carga esquelético (*skeleton loader*) elegante acorde al diseño profesional.
3. **Given** un error de conectividad o ausencia de resultados en la API de imágenes para una palabra clave, **When** la imagen no pueda descargarse, **Then** el sistema muestra de forma transparente una ilustración gastronómica por defecto (*fallback*) sin romper el diseño ni generar errores visibles al usuario.

---

### User Story 3 - Filtrado y Búsqueda por Alérgenos e Ingredientes (Priority: P3)

Como persona con alergias alimentarias o preferencias dietéticas específicas, quiero filtrar el catálogo de recetas excluyendo alérgenos específicos o buscando por ingredientes clave, para identificar rápidamente los platos seguros y relevantes para mi consumo.

**Why this priority**: Incrementa sustancialmente la usabilidad y la seguridad para personas con intolerancias (gluten, lácteos, frutos secos, mariscos, etc.), aprovechando los datos ya estructurados en la especificación.

**Independent Test**: Puede validarse seleccionando filtros de exclusión (ej. "Sin Gluten") o ingresando un ingrediente en la barra de búsqueda y confirmando que solo se muestran recetas coincidentes.

**Acceptance Scenarios**:

1. **Given** el catálogo de recetas cargado, **When** el usuario activa el filtro para excluir "Gluten", **Then** la lista se actualiza inmediatamente mostrando únicamente recetas libres de dicho alérgeno.
2. **Given** el catálogo de recetas, **When** el usuario escribe el nombre de un ingrediente (ej. "tomate") en el buscador, **Then** se muestran aquellas recetas que contienen dicho ingrediente en su fórmula.
3. **Given** una combinación de filtros que no produce coincidencias, **When** la lista queda vacía, **Then** el sistema presenta un mensaje empático orientando al usuario a reajustar sus criterios de búsqueda.

---
---

### User Story 4 - Planificación de Menú Semanal (Priority: P2)

Como usuario que organiza sus comidas semanales, quiero asignar recetas del catálogo a los días de la semana (Lunes a Domingo) distinguiendo entre comida principal y cena, para tener una visión clara de mi menú semanal y facilitar la preparación anticipada.

**Why this priority**: Complementa el catálogo aportando valor de planificación práctica y sirve de base indispensable para la lista de la compra automática.

**Independent Test**: Puede probarse de forma autónoma asignando recetas a días específicos (ej. Lunes comida: Paella, Martes cena: Gazpacho), verificando que se visualizan en el calendario semanal y se persisten entre recargas de página.

**Acceptance Scenarios**:

1. **Given** el catálogo de recetas y la vista del planificador semanal, **When** el usuario selecciona una receta y la asigna a un día (ej. Miércoles) y turno (Comida o Cena), **Then** la ranura del planificador muestra la tarjeta compacta de la receta seleccionada con sus tiempos y alérgenos.
2. **Given** una ranura con una receta ya asignada, **When** el usuario decide quitarla o cambiarla, **Then** la ranura se libera o actualiza inmediatamente.
3. **Given** un menú semanal planificado, **When** el usuario recarga la página, **Then** el sistema recupera el estado exacto de la planificación almacenada localmente.

---

### User Story 5 - Generación y Consolidación de Lista de la Compra (Priority: P2)

Como persona encargada de hacer la compra del hogar, quiero que el sistema genere automáticamente una lista de la compra consolidada a partir de los ingredientes de todas las recetas asignadas en el plan semanal, sumando cantidades de ingredientes comunes y permitiendo tachar los productos adquiridos, para ahorrar tiempo y evitar comprar duplicados.

**Why this priority**: Convierte la planificación en una herramienta de utilidad directa en la vida cotidiana del usuario, reduciendo el desperdicio alimentario y el tiempo de compra.

**Independent Test**: Puede validarse asignando dos recetas que compartan ingredientes (ej. ambas usan aceite de oliva o arroz) y verificando que la lista de la compra suma sus cantidades en una sola línea consolidada con casillas de verificación interactivas.

**Acceptance Scenarios**:

1. **Given** un menú semanal con una o más recetas asignadas, **When** el usuario accede a la sección "Lista de la Compra", **Then** el sistema presenta todos los ingredientes requeridos agrupados y consolidados por nombre y unidad de medida.
2. **Given** múltiples recetas que requieren el mismo ingrediente con unidades coincidentes (ej. Arroz bomba: 400 g y 300 g), **When** se calcula la lista de la compra, **Then** el sistema muestra una única entrada consolidada ("Arroz bomba: 700 g").
3. **Given** la lista de la compra desplegada, **When** el usuario marca un ingrediente como "comprado", **Then** el ítem se muestra tachado y con atenuación visual sin perderse de la lista.
4. **Given** la lista de la compra, **When** el usuario presiona "Copiar lista al portapapeles", **Then** el texto formateado se copia al portapapeles para poder enviarlo por mensajería o notas.

---

### Edge Cases

- **Fallo total o cuota agotada de la API de imágenes**: El sistema debe continuar siendo 100% funcional, sustituyendo las imágenes ausentes por un marcador visual gastronómico con gradiente y tipografía pulida, sin bloquear la lectura de ingredientes o recetas.
- **Recetas que no requieren cocción térmica (ej. ensaladas, tartares, gazpachos)**: El sistema debe mostrar tiempo de cocción como "0 min" o "Sin cocción (plato frío)", manteniendo visible el tiempo de preparación sin generar campos vacíos o errores.
- **Múltiples alérgenos críticos en un solo plato**: La interfaz debe apilar o agrupar las insignias de alérgenos de forma legible y con códigos de color estandarizados para evitar sobrecarga visual pero garantizando máxima visibilidad de advertencia.
- **Nombres o descripciones extensas de ingredientes**: El contenedor visual debe adaptarse responsivamente con saltos de línea elegantes evitando cortes de texto o desbordamientos horizontales en dispositivos móviles.
- **Ingredientes con unidades heterogéneas en la lista de la compra**: Si un ingrediente aparece en una receta por "unidades" y en otra por "gramos", el sistema debe listar ambas líneas claramente identificadas sin sumar números incompatibles.
- **Menú semanal vacío**: Cuando no hay comidas asignadas, la vista de la lista de la compra debe mostrar un mensaje orientador para añadir recetas desde el catálogo o planificador.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema DEBE presentar un catálogo visual de recetas estructurado en una cuadrícula responsiva y profesional.
- **FR-002**: Para cada receta, el sistema DEBE mostrar el nombre del plato, una breve descripción y una imagen gastronómica de alta definición.
- **FR-003**: El sistema DEBE obtener dinámicamente la imagen de cada receta consultando un servicio de imágenes mediante una o más palabras clave (*keywords*) asignadas a la receta.
- **FR-004**: El sistema DEBE implementar mecanismos de carga progresiva (*skeleton loaders*) y un respaldo visual predeterminado (*fallback*) ante contingencias de red o fallos de la API de imágenes.
- **FR-005**: El sistema DEBE desglosar de manera estructurada los ingredientes de cada receta, incluyendo cantidad, unidad de medida y nombre del ingrediente.
- **FR-006**: El sistema DEBE especificar los tiempos de preparación, tiempo de cocción y tiempo total estimado para cada receta.
- **FR-007**: El sistema DEBE identificar y destacar visualmente los alérgenos presentes en cada receta mediante distintivos/etiquetas (*badges*) estandarizados (ej. Gluten, Lácteos, Huevos, Frutos de cáscara, Pescado, Crustáceos, Soja).
- **FR-008**: Si una receta no contiene alérgenos declarados, el sistema DEBE reflejar explícitamente su condición de plato libre de alérgenos comunes.
- **FR-009**: El sistema DEBE proporcionar instrucciones de preparación organizadas paso a paso de forma secuencial y numerada.
- **FR-010**: El sistema DEBE permitir a los usuarios alternar entre la vista de catálogo general y la vista en profundidad de una receta seleccionada.
- **FR-011**: El sistema DEBE proporcionar un mecanismo de búsqueda en tiempo real por nombre de receta o ingrediente.
- **FR-012**: El sistema DEBE incluir filtros rápidos para consultar recetas según alérgenos excluidos o tiempos de cocción máximos.
- **FR-013**: El sistema DEBE proveer un planificador semanal con 7 días (Lunes a Domingo) y dos turnos principales por día (Comida y Cena).
- **FR-014**: El sistema DEBE permitir asignar, sustituir y desasignar cualquier receta del catálogo a cualquier ranura del menú semanal.
- **FR-015**: El sistema DEBE persistir las asignaciones del menú semanal en almacenamiento local (`localStorage`) para mantener la planificación entre sesiones del usuario.
- **FR-016**: El sistema DEBE generar dinámicamente una lista de la compra que agregue todos los ingredientes de las recetas actualmente programadas en el plan semanal.
- **FR-017**: El sistema DEBE consolidar ingredientes idénticos sumando sus cantidades aritméticamente cuando compartan la misma unidad de medida.
- **FR-018**: El sistema DEBE permitir marcar y desmarcar ingredientes de la lista como completados/comprados y ofrecer la opción de copiar la lista en texto plano al portapapeles.

### Key Entities

- **Receta**: Entidad principal que representa un plato culinario. Atributos: identificador, título, descripción breve, palabras clave para imagen (*keywords*), tiempo de preparación (en minutos), tiempo de cocción (en minutos), porciones, nivel de dificultad, lista de ingredientes, lista de pasos y conjunto de alérgenos.
- **Ingrediente**: Componente individual necesario para la elaboración de la receta. Atributos: nombre, cantidad numérica, unidad de medida (ej. gramos, mililitros, unidades, cucharadas) y notas opcionales.
- **Alérgeno**: Sustancia alimentaria susceptible de causar reacciones adversas. Atributos: código normalizado, nombre descriptivo (ej. "Gluten", "Frutos secos"), nivel de severidad/advertencia e ícono o color identificativo.
- **Paso de Elaboración**: Instrucción secuencial para cocinar el plato. Atributos: número de orden, título o acción clave y descripción detallada del procedimiento.
- **Recurso de Imagen Dinámica**: Referencia multimedia recuperada por palabra clave. Atributos: término de búsqueda (*keyword*), URL de la imagen en alta definición, texto alternativo accesible (*alt text*) y estado de carga (cargando, lista, error/fallback).
- **Plan Semanal (`WeeklyPlan`)**: Estructura organizativa de 7 días. Atributos: mapa de días (lunes a domingo), donde cada día contiene ranuras de comidas (`lunch`, `dinner`) asociadas a recetas.
- **Item Lista de la Compra (`ShoppingListItem`)**: Elemento consolidado derivado de los ingredientes del plan semanal. Atributos: clave de consolidación (nombre + unidad), nombre del ingrediente, cantidad total calculada, unidad de medida, recetas de origen y estado de compra (`checked`).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Los usuarios pueden localizar y visualizar la información completa (ingredientes, alérgenos, tiempos y pasos) de cualquier receta en menos de 3 segundos desde su selección en el catálogo.
- **SC-002**: El 100% de las recetas visualizadas exhibe de manera inequívoca y prioritaria las advertencias de alérgenos o la confirmación de ausencia de alérgenos.
- **SC-003**: El 100% de las recetas cuenta con una imagen culinaria de alta calidad cargada vía palabra clave o resuelta mediante imagen de respaldo profesional en caso de falla externa.
- **SC-004**: El tiempo de respuesta percibido para la carga inicial del catálogo no supera 1.5 segundos bajo condiciones estándar de red.
- **SC-005**: Al menos el 90% de los usuarios evalúa la presentación estética de la interfaz como "profesional y moderna" en pruebas de satisfacción de diseño.
- **SC-006**: La aplicación mantiene una adaptación visual y usabilidad del 100% en resoluciones móviles (desde 360px de ancho) hasta pantallas de escritorio de alta resolución (4K).
- **SC-007**: La generación y actualización de la lista de la compra ocurre en tiempo real (< 200 ms) tras cualquier cambio o asignación de receta en el planificador semanal.
- **SC-008**: El 100% de los ingredientes comunes con unidades compatibles se consolidan en una sola línea sumando sus cantidades exactas.

## Assumptions

- **Público Objetivo y Usabilidad**: Diseñada para usuarios que buscan recetas claras, visualmente inspiradoras y con total transparencia en cuanto a ingredientes y alérgenos para el consumo seguro.
- **Contexto Tecnológico de la Plataforma**: La especificación está concebida para materializarse como una aplicación web moderna implementada sobre el ecosistema React 19, utilizando componentes de diseño profesional y librerías auxiliares para enrutamiento, transiciones y gestión de estado.
- **Proveedor de Imágenes**: Se asume la disponibilidad de un servicio web o API externa que admita peticiones por términos de búsqueda gastronómicos con políticas de uso o claves de desarrollador para la recuperación de imágenes.
- **Persistencia**: La persistencia del plan semanal y el estado de la lista de la compra se gestiona de forma local en el navegador del usuario (`localStorage`), permitiendo funcionamiento offline y privacidad absoluta sin requerir base de datos remota ni autenticación obligatoria.

