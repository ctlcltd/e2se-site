<?php
namespace app;

use \Exception;

if (! defined('API')) {
	http_response_code(503);
	exit;
}

define('ROUTES', __NAMESPACE__);

use \api\error;
use \api\deny;
use \api\db_connect;


/*function route_example($authorized, $request, $method) {
	return [
		'status' => 200,
		'response' => [
			'test' => 1
		]
	];
}*/
