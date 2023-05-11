# Prefetchalyzer
> A tool that helps you identify the impact of applying prefetch strategies on your web app resources by analyzing pages across a simulated user's journey on the site

<img src="https://github.com/google/prefetchalyzer/raw/main/public/img/screenshot.png" height="350px" alt="Demo Screen" />

## Features

- Generates an impact report highlighting:

  - The assets that can be prefetched and on which page to get the best savings
  - Savings in kB for each page navigation when applying prefetch
  - Issues with Cache-Control on frequently used critical assets

- Exporting results

  - Generates HTML code prefetch statements based on selected resources
  - Generates code for [WebPageTest](https://webpagetest.org/) scripts to test prefetch impact

## Getting started

The easiest way to start using Prefetchalyzer is by using the hosted version available [here](https://google.github.io/prefetchalyzer/).

## Project setup
The project was generated with vue-cli.

```
npm install --legacy-peer-deps
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
    }
}
```

### Compiles and hot-reloads for development
```
npm start
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

### TODO Workflow Deployment

```
      - name: "Deploy \U0001F680"
        uses: JamesIves/github-pages-deploy-action@3.7.1
        with:
          GITHUB_TOKEN: '${{ secrets.GITHUB_TOKEN }}'
          BRANCH: gh-pages
          FOLDER: dist
          CLEAN: true 
```

### Authors
- [Stephan Giesau](https://github.com/pianomister/)
- [Ayman Farhat](https://github.com/aymanfarhat)

### Disclaimer

This is not an officially supported Google product.
