import coreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const config = [
  {
    ignores: [".next/**", "out/**", "next-env.d.ts", "public/sw.js"],
  },
  ...coreWebVitals,
  ...nextTypescript,
  {
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [{ name: "next/image", message: "No image optimiser exists in `output: export`. Use a plain <img>." }],
          patterns: [{ group: ["firebase", "firebase/*", "@firebase/*"], message: "Data and sessions come from @krykftn/client." }],
        },
      ],
      "func-style": ["error", "expression"],
      "prefer-arrow-callback": "error",
      "arrow-body-style": ["error", "as-needed"],
      curly: ["error", "multi"],
      "@next/next/no-img-element": "off",
    },
  },
];

export default config;
