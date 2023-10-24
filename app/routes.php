<?php
/**
 * app/routes.php
 * 
 * @author Leonardo Laureti
 * @license MIT License
 */

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


function route_service($authorized, $request, $method) {
	if (isset($request['call']) && $authorized) {
		if ($request['call'] == 'generator-source') {
			define('authorized', defined('CLI'));
			define('update', isset($request['sub']) && $request['sub'] === 'update');

			require_once __DIR__ . '/' . 'generator_source.php';

			\api\deny(502);
		} else if ($request['call'] == 'generator-ts') {
			define('authorized', defined('CLI'));

			require_once __DIR__ . '/' . 'generator_ts.php';

			\api\deny(502);
		}
	} else {
		\api\deny(401);
	}
}

function route_userland($authorized, $request, $method) {
	if (isset($request['call'])) {
		if ($method == 'post' && in_array($request['call'], ['resume', 'history', 'submit'])) {
			require_once __DIR__ . '/' . 'userland.php';

			\api\deny(502);
		}
	}
}

function route_inspect($authorized, $request, $method) {
	if ($authorized) {
		try {
			$dbh = \api\db_connect();
		} catch (Exception $e) {
			return \api\dump($e);
		}

		\api\response(200);
	} else {
		\api\deny(401);
	}
}

function route_test($authorized, $request, $method) {
	if ($authorized) {
		$response = [
			'' => ['' => 'main'],
			'service' => ['' => 'service'],
			'inspect' => ['' => 'list', 'add' => 'edit', 'edit' => 'edit'],
			'userland' => ['resume' => 'resume', 'history' => 'history', 'submit' => 'submit'],
			'test' => ['' => 'api_test'],
			'login' => ['' => 'signin'],
			'logout' => ['' => 'signout']
		];

		\api\response(200, $response);
	} else {
		\api\deny(401);
	}
}
