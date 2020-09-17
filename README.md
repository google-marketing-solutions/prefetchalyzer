# Prefetchalyzer
A tool to analyze sessions from HAR files for speed opportunities by prefetching resources.

## Project setup
```
npm install
```
For VSCode, Vetur extension is used to format the .vue files.
Following settings are made in settings.json:
```json
{
    "git.ignoreLimitWarning": true,
    "vetur.format.defaultFormatterOptions": {
        "prettier": {
            "stylelintIntegration": true,
            "eslintIntegration": true,
            "semi": false,
            "singleQuote": true,
            "tabWidth": 2,
            "tabs": false,
            "trailingComma": "none",
            "printWidth": 160
        }
    },
    "vetur.format.defaultFormatter.ts": "vscode-typescript"
}
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

### Disclaimer

This is not an officially supported Google product.
