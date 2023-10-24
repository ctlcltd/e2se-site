<?php
namespace api;

if (! defined('API')) {
	http_response_code(403);
	exit;
}

define('CONFIG', __NAMESPACE__);


define('backend_username', 'admin');
define('backend_password', '0123456789');


define('routes', ['service', 'inspect', 'userland', 'test', 'login', 'logout']);

define('rate_limit', [
	'public' => ['routes' => ['userland']],
	'restrict' => ['limit' => 3]
]);


define('db_driver', 'sqlite');
define('db_host', 'localhost');
define('db_dbname', 'database');
define('db_username', 'username');
define('db_password', 'password');
define('db_table_prefix', '');

// define('date_timezone', 'UTC');

define('debug', false);


// define('generator_ts', [
// 	'ts_path' => __DIR__ . '/translations',
// 	'read_db' => true,
// 	'write_db' => true,
// 	'read_file' => true,
// 	'write_files' => true
// ]);
