// prettier-ignore
module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "google",
  ],
  rules: {
    "quotes": ["error", "double"],
    "comma-dangle": ["error", "only-multiline"]
  },
  parserOptions: {
    ecmaVersion: 8,
  },
};
