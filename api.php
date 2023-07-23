<?php
/**
 * api.php
 * 
 * @author Leonardo Laureti
 * @license MIT License
 */

namespace api;

use \PDO;
use \PDOException;
use \Exception;
use \Error;

define('API', __NAMESPACE__);

ini_set('expose_php', 0);
ini_set('enable_postdata_reading', 1);
ini_set('post_max_size', '128B');

ini_set('file_uploads', 0);
ini_set('upload_max_filesize', 0);
ini_set('max_file_uploads', 0);

ini_set('variables_order', 'GPS');
ini_set('http.request.datashare.cookie', 0);
ini_set('cgi.fix_pathinfo', 1);

ini_set('session.use_strict_mode', 1);

// session_cache_limiter('nocache');
// session_cache_expire(0);


function authentication($user_name, $user_password) {
	if (! defined('backend_username') || ! defined('backend_password'))
		return false;

	return backend_username === $user_name && backend_password === $user_password;
}

function db_connect() {
	try {
		$dsn = db_driver . ':dbname=' . db_dbname . ';host=' . db_host;
		return new PDO($dsn, db_username, db_password);
	} catch (PDOException $e) {
		throw new Exception('Connection Error');
	} catch (Error $e) {
		throw new Exception('Connection Error');
	}
}

function db_select(PDO $dbh, string $table_name, mixed $select = '*', mixed $clauses = '', mixed $params = NULL) {
	$_param_transfunc = function($key) {
		return ":{$key}";
	};

	if (is_array($select)) {
		$select = implode(',', $select);
	}

	$sql = 'SELECT %s FROM %s %s';
	$sql = sprintf($sql, $select, $table_name, $clauses);

	if (is_array($params)) {
		$cols = array_keys($params);
		$vars = array_map($_param_transfunc, $cols);
		$params = array_combine($vars, $params);
	}

	$sth = $dbh->prepare($sql);
	$sth->execute($params);
	return $sth;
}

function db_insert(PDO $dbh, string $table_name, array $arr) {
	$_param_transfunc = function($key) {
		return ":{$key}";
	};

	$cols = array_keys($arr);
	$vars = array_map($_param_transfunc, $cols);

	$sql = 'INSERT INTO %s (%s) VALUES(%s)';
	$sql = sprintf($sql, $table_name, implode(',', $cols), implode(',', $vars));

	$params = array_combine($vars, $arr);

	$sth = $dbh->prepare($sql);
	$sth->execute($params);
	return $sth;
}

function db_update(PDO $dbh, string $table_name, array $arr, mixed $clauses, mixed $params = NULL) {
	$_param_transfunc = function($key) {
		return ":{$key}";
	};
	$_assign_transfunc = function($key) {
		return "{$key}=:{$key}";
	};

	$cols = array_keys($arr);
	$vars = array_map($_assign_transfunc, $cols);

	$sql = 'UPDATE %s SET %s %s';
	$sql = sprintf($sql, $table_name, implode(',', $vars), $clauses);

	if (is_array($params)) {
		$cols += array_keys($params);
		$arr += array_values($params);
		$vars = array_map($_param_transfunc, $cols);
		$params = array_combine($vars, $arr);
	}

	$sth = $dbh->prepare($sql);
	$sth->execute($params);
	return $sth;
}

function db_delete(PDO $dbh, string $table_name, mixed $clauses, mixed $params = NULL) {
	$_param_transfunc = function($key) {
		return ":{$key}";
	};

	$sql = 'DELETE FROM %s %s';
	$sql = sprintf($sql, $table_name, $clauses);

	if (is_array($params)) {
		$cols = array_keys($params);
		$vars = array_map($_param_transfunc, $cols);
		$params = array_combine($vars, $params);
	}

	$sth = $dbh->prepare($sql);
	$sth->execute($params);
	return $sth;
}

function error() {
	return [
		'status' => 503,
		'response' => 0
	];
}

function deny($status = 400) {
	return [
		'status' => $status,
		'response' => 0
	];
}


require_once __DIR__ . '/' . 'config.php';
require_once __DIR__ . '/' . 'app/routes.php';


if (! defined('CONFIG') || ! defined('ROUTES')) {
	http_response_code(503);
	exit();
}

if (isset($_COOKIE['PHPSESSID'])) {
	session_start();
}

$status = 403;
$response = 0;
$authorized = isset($_SESSION['authorized']) ? $_SESSION['authorized'] : false;

$endpoint = NULL;
$method = strtolower($_SERVER['REQUEST_METHOD']);
$request = [];


if ($method != 'get' && $method != 'post'):

$status = 405;

else:

if ($authorized) {
	if (! empty($_POST)) {
		$request = (array) $_POST;
	} else if (! empty($_GET)) {
		$request = (array) $_GET;
	}
} else {
	if (! empty($_POST)) {
		$request = (array) $_POST;
	}
}

// route
if ($authorized && isset($request['body'])) {
	$body = substr($request['body'], 0, 32);
	$body = trim($body);

	if (! empty($body) && array_key_exists($body, routes)) {
		$endpoint = $body;
	}
}


// login
if (($endpoint == NULL || $endpoint == 'login') && $method == 'post') {
	$auth = false;

	if (! empty($request['user_name']) && ! empty($request['user_password'])) {
		if (authentication($request['user_name'], $request['user_password']) === true) {
			$auth = true;
		}
	}

	if (session_status() !== PHP_SESSION_ACTIVE) {
		session_start();
	}

	if ($auth) {
		$_SESSION['authorized'] = true;

		$status = 200;
		$response = 1;
	} else {
		unset($_SESSION['authorized']);
		session_destroy();

		$status = 401;
	}

// logout
} else if ($endpoint == 'logout' && $method == 'post') {
	unset($_SESSION['authorized']);
	session_destroy();

	$status = 200;
	$response = 1;

// call
} else if (! empty($endpoint) && function_exists('\app\\' . "route_{$endpoint}")) {
	$called = call_user_func('\app\\' . "route_{$endpoint}", $authorized, $request, $method);

	if (isset($called['status']) && isset($called['response'])) {
		$status = $called['status'];
		$response = $called['response'];
	}

// test
} else if ($endpoint == NULL && $method == 'get') {
	if ($authorized) {
		$status = 200;
		$response = routes;
	}

// deny
} else {
	$status = 400;
}

endif;


header('Content-Type: application/json');
http_response_code($status);
$output = [ 'status' => $status, 'data' => $response ];
echo json_encode($output);
