// Pequeño bus de eventos para abrir la biblioteca desde cualquier botón.
export const OPEN_LIBRARY = "nigi:open-library";

export function openLibrary() {
  window.dispatchEvent(new Event(OPEN_LIBRARY));
}
