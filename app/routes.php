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
	http_response_code(503);
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

			return [
				'status' => $status,
				'response' => $response
			];
		} else {
			return \api\deny();
		}
	} else {
		return [
			'status' => 401,
			'response' => 0
		];
	}
}

function route_userland($authorized, $request, $method) {
	if (isset($request['call'])) {
		if ($method == 'post' && in_array($request['call'], [ 'resume', 'history', 'submit' ])) {
			require_once __DIR__ . '/' . 'userland.php';

			return [
				'status' => $status,
				'response' => $response
			];
		}
	}

	return \api\deny();
}

function route_inspect($authorized, $request, $method) {
	if ($authorized) {
		try {
			$dbh = \api\db_connect();
		} catch (Exception $e) {
			return \api\error();
		}
	}

	return [
		'status' => 200,
		'response' => 0
	];
}
