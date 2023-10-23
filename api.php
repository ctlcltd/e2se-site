<?php
/**
 * api.php
 * 
 * @author Leonardo Laureti
 * @license MIT License
 */

namespace api;

use \Exception;
use \Error;
use \PDO;
use \PDOException;

define('API', __NAMESPACE__);


function authentication($user_name, $user_password) {
	if (! defined('backend_username') || ! defined('backend_password'))
		return false;

	return backend_username === $user_name && backend_password === $user_password;
}

function get_remote_addr() {
	if (! empty($_SERVER['HTTP_CLIENT_IP']))
		return $_SERVER['HTTP_CLIENT_IP'];
	else if (! empty($_SERVER['HTTP_X_FORWARDED_FOR']))
		return $_SERVER['HTTP_X_FORWARDED_FOR'];
	return $_SERVER['REMOTE_ADDR'];
}

function sanitize_uri(string $uri, int $limit = 16) {
	$uri = substr($uri, 0, $limit);
	$uri = preg_replace('/[^a-z0-9-]/', '', $uri);
	return $uri;
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
		$cols = array_merge($cols, array_keys($params));
		$arr = array_merge($arr, $params);
		$vars = array_map($_param_transfunc, $cols);
	}

	$params = array_combine($vars, $arr);

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

function check_rate_limit(string $endpoint, bool $authorized) {
	if (empty($endpoint) || $authorized || ! (in_array($endpoint, ['login', 'logout']) || function_exists("\app\\route_{$endpoint}")))
		return;

	$remote_addr = get_remote_addr();
	$current = time();
	$dbh = NULL;

	$config = defined('rate_limit');
	$restricted = $config ? ! in_array($endpoint, rate_limit['public']['routes'] ?? []) : true;
	$zone = $restricted ? 'restrict' : 'public';
	$time = $config && isset(rate_limit[$zone]['time']) ? rate_limit[$zone]['time'] : 10;
	$limit = $config && isset(rate_limit[$zone]['limit']) ? rate_limit[$zone]['limit'] : 5;
	$stop = $config && isset(rate_limit[$zone]['stop']) ? rate_limit[$zone]['stop'] : 30;

	$pass = false;

	try {
		$dbh = \api\db_connect();
		$sth = \api\db_select($dbh, 'e2se_log', ['log_epoch'], sprintf('WHERE log_addr=:remote_addr ORDER BY log_epoch DESC LIMIT %d', $limit), ['remote_addr' => $remote_addr]);
		$log = $sth->fetchAll(PDO::FETCH_COLUMN);

		if (empty($log)) {
			$pass = true;
		} else {
			$count = 0;

			foreach ($log as $epoch) {
				if ((int) ($epoch + $time) < $current)
					$count++;
			}

			if ($count >= $limit && (int) ($log[0] + $stop) < $current)
				$pass = true;
			else if ($count < $limit && (int) ($log[0] + $time) < $current)
				$pass = true;
		}

		if ($pass)
			\api\db_insert($dbh, 'e2se_log', ['log_addr' => $remote_addr, 'log_epoch' => $current]);

		$dbh = NULL;
	} catch (PDOException $e) {
		$dbh = NULL;
		dump($e);
	}

	if (! $pass)
		error(429);
}

function response(int $status, mixed $response = 0) {
	header('Content-Type: application/json');
	http_response_code($status);
	echo json_encode(['status' => $status, 'data' => $response]);

	if (defined('CLI'))
		echo PHP_EOL;

	exit;
}

function error(int $status = 503) {
	http_response_code($status);
	exit;
}

function deny(int $status = 400) {
	response($status);
}

function dump(object $obj) {
	if (defined('debug') && debug) {
		var_dump($obj);
	}

	error();
}


require_once __DIR__ . '/' . 'config.php';
require_once __DIR__ . '/' . 'app/routes.php';


if (defined('date_timezone')) {
	date_default_timezone_set(date_timezone);
}

if (! defined('CONFIG') || ! defined('ROUTES')) {
	return error();
}

if (isset($_COOKIE['PHPSESSID'])) {
	session_start();
}

$authorized = false;

if (isset($_SESSION['authorized'])) {
	$authorized = $_SESSION['authorized'];
} else if (defined('CLI')) {
	$auth = false;

	if (! empty(getenv('CLI_USRIAM')) && ! empty(getenv('CLI_USRPWD')))
		if (authentication(getenv('CLI_USRIAM'), getenv('CLI_USRPWD')) === true)
			$auth = true;

	$authorized = $auth;
}

$method = isset($_SERVER['REQUEST_METHOD']) ? strtolower($_SERVER['REQUEST_METHOD']) : NULL;

if ($method != 'get' && $method != 'post' && ! defined('CLI')) {
	return error(405);
}

$endpoint = '';
$request = [];

if ($authorized) {
	if (! empty($_POST))
		$request = (array) $_POST;
	else if (! empty($_GET))
		$request = (array) $_GET;
	else if (defined('CLI'))
		$request = getopt('', ['body:', 'call::', 'sub::', 'query::']);
} else {
	if (! empty($_POST))
		$request = (array) $_POST;
}

// route
if (isset($request['body'])) {
	$request['body'] = sanitize_uri($request['body']);

	if (! empty($request['body']) && in_array($request['body'], routes))
		$endpoint = $request['body'];
}

// rate limit
if (check_rate_limit($endpoint, $authorized)) {
	exit;
}

// login
if ($endpoint == 'login' && $method == 'post') {
	$auth = false;

	if (! empty($request['user_name']) && ! empty($request['user_password']))
		if (authentication($request['user_name'], $request['user_password']) === true)
			$auth = true;

	if (session_status() !== PHP_SESSION_ACTIVE)
		session_start();

	if ($auth) {
		$_SESSION['authorized'] = true;

		response(200, 1);
	} else {
		unset($_SESSION['authorized']);
		session_destroy();

		response(401);
	}

// logout
} else if ($endpoint == 'logout' && $method == 'post') {
	unset($_SESSION['authorized']);
	session_destroy();

	response(200, 1);

// call
} else if (! empty($endpoint) && function_exists("\app\\route_{$endpoint}")) {
	if (isset($request['call']))
		$request['call'] = sanitize_uri($request['call']);
	if (isset($request['sub']))
		$request['sub'] = sanitize_uri($request['sub']);

	call_user_func("\app\\route_{$endpoint}", $authorized, $request, $method);

}

// 
// forbidden 403

deny(400);

