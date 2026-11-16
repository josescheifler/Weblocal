import { useSyncExternalStore } from "react";

const sinSuscripcion = () => () => {};

/** true solo en el navegador (después de hidratar); false durante el render del servidor. */
export function useMontado(): boolean {
  return useSyncExternalStore(sinSuscripcion, () => true, () => false);
}
