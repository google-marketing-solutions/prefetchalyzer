# Prefetchalyzer
A tool to analyze sessions from HAR files for speed opportunities by prefetching resources.

## Task list
- [ ] Clarify OSS process (Ayman)
- [ ] Set up options to do code reviews (Ayman)
- [ ] Include HAR file validation from har2csv project (Ayman)
- [x] Split code into separate components for main app, file upload view, table view (Stephan)
- [x] add first material design styles

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
