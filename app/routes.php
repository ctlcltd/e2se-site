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
	exit();
}

define('ROUTES', __NAMESPACE__);

use \api\deny;
use \api\db_connect;
use \api\db_error;


function route_service($authorized, $request, $method) {
	if (isset($request['call']) && $authorized) {
		if ($request['call'] == 'generator') {
			define('authorized', true);

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
			'status' => 200,
			'response' => [
				'generator' => 'Generator source'
			]
		];
	}
}

function route_inspect($authorized, $request, $method) {
	if ($authorized) {
		try {
			$dbh = \api\db_connect();
		} catch (Exception $e) {
			return \api\db_error();
		}
	}

	return [
		'status' => 200,
		'response' => 0
	];
}
