import { defineConfig, globalIgnores } from "eslint/config"; //ตั้งค่าเเละยกเว้น
import nextVitals from "eslint-config-next/core-web-vitals"; //เช็ค
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals, //ความเร็ว  ตวามสเถียร ความลื่นไหล
  ...nextTs, //ตรวจสอบ เเละหา error
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
