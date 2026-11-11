"use client";

import { useSyncExternalStore } from "react";

const noop = () => () => {};

// El año se lee en el navegador para que se actualice solo cada año.
export default function Year() {
  const year = useSyncExternalStore(noop, () => new Date().getFullYear(), () => null);
  return <span>{year ?? ""}</span>;
}
