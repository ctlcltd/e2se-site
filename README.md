## e2se-site

Website for [e2-sat-editor](https://github.com/ctlcltd/e2-sat-editor).

Contains all the website parts: translation app, landing site and backend.

 

### Requirements

* PHP 8
* PHP PDO
* webserver
* database


### Get started

First clone this repository.
```
git clone https://github.com/ctlcltd/e2se-site.git
```

Then install Node.js, npm, and all required packages, from `src` path.
```
npm install
```

Most files are served statically.

The project use these JS libraries to generate static files:
- grunt
- liquidjs
- sass
- clean-css
- terser

Copy all the assets to `public` path.

Then build needed files and assets.
```
npm run build.all
```

Setup with the script `setup.sh` to install needed translation files from **e2-sat-editor** repository.
```
chmod +x setup.sh
sh setup.sh
```

Needs a database started from `sample.sql` source file.

To run the website use a webserver, as the PHP built-in for example:
```
php -S localhost:8000 -t public/
```


### Configuration

Rename `config-example.php` or use with your custom settings.

Sample configuration files are `config.phps` and `app/routes.phps`.

Serve from `public` root.


### License

Source code licensed under the terms of the [MIT License](https://github.com/ctlcltd/e2se-site/blob/main/LICENSE).

