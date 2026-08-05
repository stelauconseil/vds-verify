const js = require("@eslint/js");
const globals = require("globals");
const reactPlugin = require("eslint-plugin-react");
const reactHooks = require("eslint-plugin-react-hooks");
const prettier = require("eslint-config-prettier");
const tseslint = require("typescript-eslint");

module.exports = tseslint.config(
    {
        ignores: [
            "build/**",
            "coverage/**",
            "docs/_site/**",
            "node_modules/**",
            "android/**",
            "ios/**",
            ".expo/**",
            ".idea/**",
            "eslint.config.js",
            "package-lock.json",
            "yarn.lock",
            "bun.lock",
            "pc-api-7507057973859638017-998-e9dd35e8b4ec.json",
        ],
    },
    {
        files: ["**/*.{js,cjs,mjs,ts,tsx}"],
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
            parser: tseslint.parser,
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
            },
            globals: {
                ...globals.browser,
                ...globals.node,
                ...globals.es2021,
            },
        },
        settings: {
            react: {
                version: "detect",
            },
        },
    },
    js.configs.recommended,
    tseslint.configs.eslintRecommended,
    reactPlugin.configs.flat.recommended,
    reactPlugin.configs.flat["jsx-runtime"],
    reactHooks.configs.flat.recommended,
    prettier,
    {
        files: ["**/*.{ts,tsx}"],
        rules: {
            "no-unused-vars": "off",
            "react/prop-types": "off",
            "react-hooks/config": "off",
            "react-hooks/error-boundaries": "off",
            "react-hooks/gating": "off",
            "react-hooks/globals": "off",
            "react-hooks/immutability": "off",
            "react-hooks/incompatible-library": "off",
            "react-hooks/preserve-manual-memoization": "off",
            "react-hooks/purity": "off",
            "react-hooks/refs": "off",
            "react-hooks/set-state-in-effect": "off",
            "react-hooks/set-state-in-render": "off",
            "react-hooks/static-components": "off",
            "react-hooks/unsupported-syntax": "off",
            "react-hooks/use-memo": "off",
        },
    },
);
