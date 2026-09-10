# Reproductor de Música

Un reproductor de música web rápido y ligero desarrollado con estándares nativos de la web (HTML, CSS y JavaScript). Ofrece una interfaz de usuario inspirada en aplicaciones profesionales de *streaming*, soporte para archivos locales y remotos, modo mini reproductor y un diseño totalmente adaptativo (*responsive*).

---

## Descripción

Este **Reproductor** es una aplicación cliente (*single-page web application*) diseñada para la reproducción de bibliotecas de audio locales a través de carpetas del sistema del usuario o pistas precargadas desde un repositorio. Implementa controles personalizados, ecualizador dinámico por CSS, búsqueda en tiempo real y una arquitectura desacoplada sin dependencias externas ni *frameworks* pesados.

---

## Características Principales

* **Interfaz de Usuario Estilo Dark Mode:** Paleta de colores optimizada basada en variables CSS (`#0b0d0c` y verde `#1ed760`), con transiciones fluidas y microinteracciones visuales.
* **Carga de Carpetas Locales:** Lectura de directorios de música locales mediante la API de acceso a archivos del navegador (`webkitdirectory` / File System Access API).
* **Integración con Fuentes Remotas:** Capacidad para alternar y listar canciones almacenadas en servidores o repositorios remotos.
* **Modo Mini Reproductor:** Vista compacta flotante que conserva los controles esenciales e info de la pista.
* **Visualización Dinámica:**
  * Indicadores de ecualizador animado por CSS para canciones en reproducción.
  * Transición de pulso en controles de reproducción y barras de volumen reactivas.
* **Búsqueda y Filtros en Tiempo Real:** Filtro de pistas por nombre o artista instantáneo.
* **Modos de Reproducción:** Modos de reproducción aleatoria (*shuffle*), ordenamiento alfabético y listas de reproducción dinámicas.
* **Diseño Responsivo:** Adaptación completa para monitores ultrawide, laptops, tablets y dispositivos móviles con barra lateral colapsable.

---

## Tecnologías Utilizadas

| Tecnología | Descripción / Uso |
| :--- | :--- |
| **HTML5** | Estructura semántica de la aplicación y elemento `<audio>` para decodificación nativa. |
| **CSS3** | Layouts con Flexbox y CSS Grid, variables customizadas (`:root`), animaciones `@keyframes`, y diseño responsivo (`@media queries`). |
| **JavaScript (ES6+)** | Manejo de eventos del DOM, gestión del estado del reproductor y lectura de la API de archivos locales. |

---

## Estructura del Proyecto

```text
web-audio-player/
├── index.html              # Estructura principal de la aplicación
├── css/
│   └── styles.css          # Hoja de estilos globales, animaciones y diseño responsivo
├── js/
│   ├── app.js              # Punto de entrada y gestión del DOM
│   └── canciones.json      # Lista de músicas en el repositorio
├── favicon/
│   └── icon.png            # Icono del sitio
├── music/                  # Músicas del repositorio
│
└── README.md               # Documentación del proyecto