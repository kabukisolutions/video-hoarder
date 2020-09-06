module.exports = {
  parser: "babel-eslint",
  parserOptions: {
    sourceType: "module",
    ecmaVersion: '2020',
    ecmaFeatures: {
      jsx: true,
    }
  },
  plugins: [
    "node",
    "react",
    "jsx-control-statements",
    "jest",
    "import",
    "simple-import-sort",
    "sort-destructure-keys",
  ],
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:jsx-control-statements/recommended",
    "plugin:import/errors",
    "plugin:react-hooks/recommended",
  ],
  env: {
    node: true,
    es6: true,
    mocha: true,
    browser: true,
    "jest/globals": true,
  },
  settings: {
    react: { version: "detect" },
    "import/resolver": {
      node: {
        extensions: [".js", ".ts", ".jsx", ".tsx"]
      }
    },
  },
  rules: {
    quotes: ["error", "double"],  // because it's silly twisting ourselves into knots whenever we need to use an apostrophe (yes fine a single quote).
    "react/jsx-no-undef": [2, { allowGlobals: true }],
    "jest/no-disabled-tests": "warn",
    "jest/no-focused-tests": "error",
    "jest/no-identical-title": "error",
    "jest/prefer-to-have-length": "warn",
    "jest/valid-expect": "error",
    "import/no-default-export": "error",  // default anonymous exports R bad. Disallow default exports for simplicity.
    "import/named": "error",
    "import/default": "error",
    "import/no-absolute-path": "error",
    "simple-import-sort/sort": ["error", { groups: [] }],
    "comma-dangle": ["error", "always-multiline"],
    "react/jsx-first-prop-new-line": ["error", "multiline-multiprop"],
    "react/jsx-indent-props": ["error", 2],
    "react/jsx-max-props-per-line": ["error", { "maximum": 1, "when": "always" }],
    "react/jsx-closing-tag-location": "error",
    "react/jsx-closing-bracket-location": "error",
    "react/jsx-sort-props": "error",
    "react/jsx-wrap-multilines": ["error", { arrow: "parens", declaration: "parens-new-line" }],
    "sort-destructure-keys/sort-destructure-keys": "error"
  },
  overrides: [{
    files: ["*.story.jsx", "*.jsx"],
    "rules": {
      // 1. storybook depends on default exports
      // 2. A common react-redux pattern is to export the unconnected component as a named export (for testing), and
      //    the connected component as the default export. When the component is not connected, then no named export
      //    is provided and the unconnected component is the default export.
      "import/no-default-export": "off",
      "import/prefer-default-export": "error",
    }
  }]
};
