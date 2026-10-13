# Contract: Image Provider API by Keyword

**Feature**: `001-recipe-catalog`  
**Artifact**: `contracts/image-provider.contract.md`  
**Protocol / Pattern**: External HTTP REST API & Adapter Client  

---

## 1. Overview
Define el contrato de integración con el servicio externo de imágenes gastronómicas basado en palabras clave (*keywords*), con soporte para normalización de respuesta, almacenamiento en caché y gestión de contingencias (*fallback*).

---

## 2. Definición del Contrato del Adaptador (`IImageProvider`)

```typescript
export interface ImageQueryOptions {
  keyword: string;
  orientation?: 'landscape' | 'portrait' | 'squarish';
  quality?: 'regular' | 'thumb' | 'high';
}

export interface ImageQueryResult {
  keyword: string;
  url: string;
  thumbUrl: string;
  altDescription: string;
  photographerName: string;
  photographerUrl?: string;
  isFallback: boolean;
}

export interface IImageProvider {
  /**
   * Consulta una imagen culinaria adecuada para la palabra clave dada.
   * Si la API externa falla, tiene cuota excedida o no devuelve resultados,
   * debe retornar un ImageQueryResult con isFallback: true.
   */
  fetchImageByKeyword(options: ImageQueryOptions): Promise<ImageQueryResult>;
}
```

---

## 3. Especificación HTTP de la API Externa (REST Specification)

### 3.1. Solicitud de Búsqueda
- **Método**: `GET`
- **Endpoint**: `/search/photos`
- **Cabeceras**:
  - `Accept: application/json`
  - `Authorization: Client-ID <API_KEY>` (o acceso mediante proxy / endpoint público de catálogo)
- **Parámetros de Query**:
  - `query` (string, obligatorio): Término clave culinario (ej. `seafood paella`, `chocolate cake`).
  - `orientation` (string, opcional, por defecto: `landscape`).
  - `per_page` (number, opcional, por defecto: `1`).

### 3.2. Formato de Respuesta Exitosa (200 OK)
```json
{
  "total": 1420,
  "total_pages": 1420,
  "results": [
    {
      "id": "img-x91kz",
      "description": "Traditional Spanish seafood paella in pan",
      "alt_description": "delicious hot paella with shrimps and mussels",
      "urls": {
        "raw": "https://images.service.com/photo-1?raw=1",
        "full": "https://images.service.com/photo-1?full=1",
        "regular": "https://images.service.com/photo-1?w=1080",
        "thumb": "https://images.service.com/photo-1?w=200"
      },
      "user": {
        "name": "Maria Gonzalez",
        "links": {
          "html": "https://images.service.com/@mariagonzalez"
        }
      }
    }
  ]
}
```

### 3.3. Manejo de Errores y Fallback

| Código HTTP / Situación | Diagnóstico | Acción del Adaptador |
| :--- | :--- | :--- |
| **200 OK con `results: []`** | Ninguna imagen coincide con la palabra clave | Retorna imagen de reserva (*placeholder* SVG profesional) con `isFallback: true`. |
| **403 / 429 Rate Limited** | Límite de cuota superado en la API pública | Activa caché local y retorna `isFallback: true` sin generar alertas al usuario. |
| **500 / Network Error** | Sin conexión a internet o caída del servicio | Retorna `isFallback: true` manteniendo toda la funcionalidad de recetas activa. |

---

## 4. Política de Caché
- **TTL de Caché**: Las respuestas exitosas se almacenan en caché (`sessionStorage` o mapa en memoria) indexadas por `keyword.toLowerCase().trim()`.
- **Pre-calentamiento**: Las palabras clave de las recetas iniciales se pueden pre-consultar de forma asíncrona no bloqueante sin impedir la interacción del usuario.
