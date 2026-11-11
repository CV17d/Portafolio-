import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // La escena 3D (three.js) muta cámara/objetos por diseño dentro de useFrame:
  // las reglas del React Compiler no aplican a ese código imperativo.
  {
    files: ["components/library3d/**"],
    rules: {
      "react-hooks/purity": "off",
      "react-hooks/immutability": "off",
      "react-hooks/use-memo": "off",
      "react-hooks/refs": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Skills instaladas (código de terceros)
    ".agents/**",
    ".claude/**",
  ]),
]);

export default eslintConfig;
