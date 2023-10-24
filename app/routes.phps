<?php
namespace app;

use \Exception;

if (! defined('API')) {
	http_response_code(403);
	exit;
}

define('ROUTES', __NAMESPACE__);

use \api\error;
use \api\deny;
use \api\db_connect;


/*function route_example($authorized, $request, $method) {
	\api\response(200, ['test' => 1]);
}*/
