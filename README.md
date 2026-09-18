# Medi 💊

Organiza los medicamentos y recetas de tus hijos, en familia.

Medi es una app (PWA con React + Material UI) para que dos papás/mamás lleven
juntos el control de los medicamentos de sus hijos: un **botiquín** propio de
productos que tienes en casa, **recetas** por hijo y un **historial** de dosis.

## Características

- **App en blanco**: arranca completamente vacía. No hay datos de ejemplo ni
  catálogos precargados; todo lo ingresa el usuario. Empty states estilo Google.
- **Primer uso** en 3 pasos: crear familia, agregar hijo, invitar al otro
  papá/mamá (este paso se puede saltar).
- **Mi Botiquín**: registra cada producto una vez (marca, laboratorio,
  presentación, componentes con cantidades, tamaño del frasco, vencimiento,
  foto y nota) y reutilízalo en cualquier receta y para cualquier hijo.
  - Aviso de productos **por vencer / vencidos**. Un producto vencido no se
    puede seleccionar para dar dosis.
- **Ingreso manual** paso a paso (un tema por pantalla, barra de progreso):
  nombre → presentación → componentes → frasco y vencimiento → foto → resumen.
  - Vista previa en vivo del componente: `Diclofenaco ácido libre · 9 mg por cada 5 ml`.
  - Campos numéricos con teclado numérico y normalización (`5.0 → 5`, `.5 → 0.5`).
- **Agregar medicamento a un hijo** desde una receta, con **conversión
  calculada** (ej: `6 ml = 10.8 mg de Diclofenaco`).
- **Llenar desde foto** (opcional): marca los campos prellenados en amarillo
  hasta que el usuario los confirme uno por uno.
- Navegación inferior: **Hoy · Hijos · Botiquín · Historial · Ajustes**.

## Desarrollo

```bash
npm install
npm run dev      # servidor de desarrollo (Vite)
npm run build    # build de producción
npm run preview  # sirve el build
```

## Notas técnicas

- Stack: React 18, Vite, Material UI 6, MUI X Date Pickers, dayjs.
- Persistencia local en `localStorage` (clave `medi.state.v1`). No hay backend;
  los datos viven en el dispositivo. La invitación a otros miembros es una
  maqueta de UI (no envía correos todavía).
- El botón "Llenar desde foto" implementa el flujo de revisión/confirmación en
  amarillo; el reconocimiento óptico (OCR) todavía no está conectado.
