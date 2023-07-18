<?php
namespace api;

if (! defined('API')) {
	http_response_code(503);
	exit();
}

define('CONFIG', __NAMESPACE__);


define('backend_username', 'admin');
define('backend_password', '0123456789');


define('routes', [
	'' => [ '' => 'main' ],
	'service' => [ '' => 'service' ],
	'inspect' => [ '' => 'list', 'add' => 'edit', 'edit' => 'edit' ],
	'test' => [ '' => 'api_test' ],
	'login' => [ '' => 'signin' ],
	'logout' => [ '' => 'signout' ]
]);


define('db_driver', 'sqlite');
define('db_host', 'localhost');
define('db_dbname', 'database');
define('db_username', 'username');
define('db_password', 'password');
define('db_table_prefix', '');
