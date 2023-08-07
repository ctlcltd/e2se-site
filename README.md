## e2se-site

Website for [e2-sat-editor](https://github.com/ctlcltd/e2-sat-editor).

Contains all the website parts: translation app, landing page, backend.

:construction: *work in progress* :construction:

&nbsp;

### Requirements

* PHP 8
* PHP PDO
* webserver
* database

### Brief

Setup with the script `setup.sh` to install needed translation files from **e2-sat-editor** repository.
```
chmod +x setup.sh
./setup.sh
```

Then rename `config-example.php` or use with your custom settings.

Sample configuration files are `config.phps` and `app/routes.phps`.

Needs a database started from `sample.sql` source file.

Serve from `public` root.

### License

Source code licensed under the terms of the [MIT License](https://github.com/ctlcltd/e2se-site/blob/main/LICENSE).

