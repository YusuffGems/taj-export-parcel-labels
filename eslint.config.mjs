import { FlatCompat } from "@eslint/eslintrc";
import { dirname } from "path";
import { fileURLToPath } from "url";

const compat = new FlatCompat({ baseDirectory: dirname(fileURLToPath(import.meta.url)) });

const config = [
  { ignores: ["next-env.d.ts", "out/**", ".next/**", "node_modules/**", "public/sw.js"] },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
];

export default config;
