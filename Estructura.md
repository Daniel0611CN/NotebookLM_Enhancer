# Índice

1. [Introducción y objetivos del proyecto](#1-introducción-y-objetivos-del-proyecto)
2. [Problema que resuelve](#2-problema-que-resuelve)
3. [Funcionalidades principales](#3-funcionalidades-principales-mvp--futuras)
4. [Arquitectura general](#4-arquitectura-general)
5. [Estructura de carpetas y módulos](#5-estructura-de-carpetas-y-módulos)
6. [Flujo de ejecución](#6-flujo-de-ejecución)
7. [Tecnologías elegidas](#7-tecnologías-elegidas)
8. [Gestión de riesgos y fragilidad](#8-gestión-de-riesgos-y-fragilidad)
9. [Roadmap inicial](#9-roadmap-inicial)
10. [Próximos pasos](#10-próximos-pasos)

---

NotebookLM Folders & Enhancer

## 1. Introducción y objetivos del proyecto

**¿De qué va el proyecto?**

NotebookLM es una herramienta excelente de Google para crear y gestionar "notebooks" basados en fuentes y notas generadas por IA. Sin embargo, carece de organización avanzada:  
todos los notebooks aparecen en una lista plana en la sidebar, sin carpetas, subcarpetas ni posibilidad de agruparlos lógicamente.

**Este proyecto consiste en desarrollar una extensión Chrome (Manifest V3) que inyecte una interfaz mejorada en notebooklm.google.com para:**

- Permitir crear carpetas y subcarpetas.
- Mover notas creadas entre carpetas mediante drag & drop.
- Colapsar/expandir carpetas.
- Persistir la estructura entre sesiones y dispositivos.
- _(Opcional fase 2)_ Añadir opciones avanzadas de exportación (PDF, Markdown, etc.) 

El objetivo principal es tener máximo control, mantenibilidad y escalabilidad, evitando el enfoque monolítico 
Queremos código modular, limpio y fácil de extender.

---

## 2. Problema que resuelve

- Lista plana de notas → difícil encontrar notas específicos cuando tienes docenas.
- No hay jerarquía ni agrupación lógica (ej. "Notas 2026", "Investigación IA", "Personal").
- Exportación limitada.
- Experiencia similar a extensiones populares de Gemini/ChatGPT que añaden carpetas.

---

## 3. Funcionalidades principales (MVP + futuras)

### MVP (Minimum Viable Product)

- Árbol de carpetas colapsable en la sidebar (Studio Panel de studio).
- Crear, renombrar, eliminar carpetas.
- Drag & drop de notas entre carpetas.
- Persistencia de la estructura (chrome.storage.sync).
- Sincronización automática con notebooks nativos (nuevos, borrados, renombrados).
- UI que imita el estilo nativo de NotebookLM (con Tailwind).

### Fase 2

- Menú contextual (clic derecho).
- Búsqueda/filtro en el árbol.
- Exportación avanzada de notebooks/carpetas completas.
- Tags o colores por carpeta.
- Modo "vista compacta/expandida".

---

## 4. Arquitectura general

La extensión usa un content script que inyecta una aplicación Angular dentro de un Shadow DOM para aislar estilos y evitar conflictos con el DOM de Google.

```
[NotebookLM Page]
└── Content Script (main.ts)
    └── Shadow DOM (aislado)
        ├── Tailwind CSS (inyectado)
        └── Angular App
            ├── AppComponent (raíz)
            └── FolderTreeComponent + servicios
```

- **Shadow DOM:** aislamiento total → nuestros estilos no afectan a NotebookLM y viceversa.
- **Angular:** gestión de componentes, estado y reactividad.
- **Tailwind CSS v4:** estilos modernos, ligeros y 100% personalizables.

---

## 5. Estructura de carpetas y módulos

```
NotebookLM_Enhancer/
├── manifest.json
├── .postcssrc.json
├── src/
├── content/
│   ├── main.ts                # Entrada: observer + inyección Shadow DOM
│   ├── angular-bootstrap.ts   # Bootstrap Angular
│   └── styles/
│       ├── styles.css ( con @import "tailwindcss"; )
│ 
└── angular-app/
│       ├── app/
│           ├── components/
│               ├── folder-tree/
│               ├── folder-node/
│               ├── notebook-item/
│               ├── context-menu/
│               ├── create-folder-modal/
│               └── export-options/
│           ├── services/
│               ├── storage.service.ts
│               ├── dom-observer.service.ts
│               ├── folder-structure.service.ts
│               ├── drag-drop.service.ts
│               └── export.service.ts
│           ├── models/
│               ├── folder.model.ts
│               └── notebook.model.ts
│           └── app.component.ts
│       └── assets/icons/
├── angular.json
└── package.json
```

---

## 6. Flujo de ejecución

1. Content script detecta la sidebar (Panel de Studio que tenemos dentro del directorio INFO/Notebook_StudioSidebar.html)  de NotebookLM (MutationObserver).
2. Inyecta Shadow DOM en el contenedor adecuado.
3. Inyecta Tailwind CSS.
4. Bootstrap Angular app.
5. DOM Observer lee notebooks nativos → construye árbol inicial.
6. Usuario interactúa → cambios se guardan en storage y se reflejan visualmente.
7. Al crear/borrar notebooks en NotebookLM → observer actualiza nuestro árbol.

---

## 7. Tecnologías elegidas

- **Angular 17+ (standalone):** estructura, componentes, servicios.
- **Tailwind CSS v4:** estilos rápidos, responsive, dark mode fácil.
- **Angular CDK:** Drag & Drop (robusto).
- **chrome.storage.sync:** persistencia entre dispositivos.
- **Exportacion:** html2pdf.js para exportación. markdown etc etc etc

**Ventajas vs monolítico:** archivos pequeños, testing fácil, escalabilidad alta.

---

## 8. Gestión de riesgos y fragilidad

- Fragilidad del DOM de Google: selectores defensivos + fallback UI + actualizaciones rápidas.
- Complejidad técnica: empezamos con MVP simple, componentes aislados.
- Performance: bundle <1.5 MB, observers optimizados.

---

## 9. Roadmap inicial

1. Configurar proyecto Angular + Tailwind (  solo falta el  Manifest V3. ) 
2. Inyección básica Shadow DOM + árbol estático. (falta)
3. Sincronización básica con DOM nativo.  (falta)
4. Drag & drop + persistencia.     (falta)
5. Menús y modales.   (falta) 
6. Exportación (fase 2). (falta)

---

## 10. Próximos pasos

- Enviar HTML/DOM actual de la sidebar de NotebookLM para definir selectores exactos. ( ya tenemos esta dentro del directorio INFO
     INFO
  ├──  Estructura.md ( este no es, este es el que estas leyendo )
   └──  Notebook_StudioSidebar.html (es este de aquí. )
)

- Crear repositorio base. ( ya esta hecho)

- Implementar MVP paso a paso. (falta )