# e2se-site

Website for [e2-sat-editor](https://github.com/ctlcltd/e2-sat-editor).

Contains all the website parts: main site, online help.

## Get Started

First clone this repository.
```
git clone https://github.com/ctlcltd/e2se-site.git
```

Then from `src` path, install all the required packages, using `npm`.
```
npm install
```

The project use these JavaScript modules to generate static files:
- `grunt`
- `liquidjs`
- `sass`
- `clean-css`
- `terser`

## Build the User Manual

To make distributable User Manual (Online Help), use `dist:help` Grunt task.
```
npm run dist:help -- --dest=out/
```

## Build the Website

Copy all the assets to `public` path.

Then build needed files and assets.
```
npm run copy
npm run build:all
```

All files are served statically.

To run the website use a webserver, as the PHP built-in for example:
```
php -S localhost:8000 -t public/
```

Serve from `public` root.

## Build the Translations page

The translations page has static resource files, Qt translation sources (.ts) and GNU Gettext localization files (.po, .pot).

First, you need to install the Qt translation tools, Qt Linguist.

Use the pre-build script from `translate` path, then build the translations page.
```
sh pre-build.sh
npm run build:translate
```

## License

Source code licensed under the terms of the [MIT License](https://github.com/ctlcltd/e2se-site/blob/main/LICENSE).

