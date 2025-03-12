module.exports = {
  settings: {
    react: {
      createClass: "createReactClass", // Regex for Component Factory to use,
      // default to "createReactClass"
      pragma: "React", // Pragma to use, default to "React"
      fragment: "Fragment", // Fragment to use (may be a property of <pragma>), default to "Fragment"
      version: "detect", // React version. "detect" automatically picks the version you have installed.
      // You can also use `16.0`, `16.3`, etc, if you want to override the detected value.
      // It will default to "latest" and warn if missing, and to "detect" in the future
      flowVersion: "0.53", // Flow version
    },
    propWrapperFunctions: [
      // The names of any function used to wrap propTypes, e.g. `forbidExtraProps`. If this isn"t set, any propTypes wrapped in a function will be skipped.
      "forbidExtraProps",
      {property: "freeze", object: "Object"},
      {property: "myFavoriteWrapper"},
      // for rules that check exact prop wrappers
      {property: "forbidExtraProps", exact: true},
    ],
    componentWrapperFunctions: [
      // The name of any function used to wrap components, e.g. Mobx `observer` function. If this isn"t set, components wrapped by these functions will be skipped.
      "observer", // `property`
      {property: "styled"}, // `object` is optional
      {property: "observer", object: "Mobx"},
      {property: "observer", object: "<pragma>"}, // sets `object` to whatever value `settings.react.pragma` is set to
    ],
    formComponents: [
      // Components used as alternatives to <form> for forms, eg. <Form endpoint={ url } />
      "CustomForm",
      {name: "Form", formAttribute: "endpoint"},
    ],
    linkComponents: [
      // Components used as alternatives to <a> for linking, eg. <Link to={ url } />
      "Hyperlink",
      {name: "Link", linkAttribute: "to"},
    ],
  },
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:@typescript-eslint/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: "latest",
    sourceType: "module",
  },
  plugins: ["react", "@typescript-eslint", "react-refresh"],
  rules: {
    "react-refresh/only-export-components": "warn",
    "indent": ["error", 2],
    // "typedef": [
    //   "error",
    //   {
    //     arrowParameter: false,
    //     variableDeclaration: false,
    //   },
    // ],
    "linebreak-style": ["error", "unix"],
    quotes: ["error", "double"],
    semi: ["error", "always"],
    "jsx-quotes": 1,
    "react/display-name": 0,
    "react/jsx-closing-bracket-location": 0,
    "react/forbid-prop-types": 0,
    "react/jsx-boolean-value": 1,
    "react/jsx-curly-spacing": 1,
    "react/jsx-handler-names": 0,
    "react/jsx-key": 1,
    "react/jsx-no-duplicate-props": 1,
    "react/jsx-no-literals": 0,
    "react/jsx-no-undef": 1,
    "react/jsx-pascal-case": 1,
    "react/jsx-sort-prop-types": 0,
    "react/jsx-sort-props": 0,
    "react/jsx-uses-react": 1,
    "react/jsx-uses-vars": 1,
    "react/no-danger": 1,
    "react/no-deprecated": 1,
    "react/no-did-mount-set-state": 1,
    "react/no-did-update-set-state": 1,
    "react/no-direct-mutation-state": 1,
    "react/no-is-mounted": 1,
    "react/no-multi-comp": 0,
    "react/no-set-state": 1,
    "react/no-string-refs": 1,
    "react/no-unknown-property": 1,
    "react/prefer-es6-class": 1,
    "react/prop-types": 1,
    "react/react-in-jsx-scope": 1,
    "react/sort-comp": 1,
  },
};
