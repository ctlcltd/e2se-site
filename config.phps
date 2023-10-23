<?php
namespace api;

if (! defined('API')) {
	http_response_code(503);
	exit;
}

define('CONFIG', __NAMESPACE__);


define('backend_username', 'admin');
define('backend_password', '0123456789');


define('routes', ['test', 'login', 'logout'/*, 'example'*/]);

// define('rate_limit', [
// 	'public' => ['time' => 1, 'limit' => 5, 'stop' => 360, 'routes' => ['example']],
// 	'restrict' => ['time' => 30, 'limit' => 3, 'stop' => 180]
// ]);

define('db_driver', 'sqlite');
define('db_host', 'localhost');
define('db_dbname', 'database');
define('db_username', 'username');
define('db_password', 'password');
define('db_table_prefix', '');

// define('date_timezone', 'UTC');

define('debug', false);
