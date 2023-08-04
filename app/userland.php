<?php
/**
 * app/userland.php
 * 
 * @author Leonardo Laureti
 * @license MIT License
 */

namespace app;

use \Exception;
use \Error;
use \PDO;
use \PDOException;

if (! defined('API')) {
	http_response_code(503);
	exit;
}

$status = 502;
$response = [];


require_once __DIR__ . '/' . 'languages.php';


use \api\db_connect;
use \api\db_select;
use \api\db_insert;




function filter_request($value, $key) {
	if (empty($value) || ! in_array($key, [ 'token', 'data' ]))
		return false;

	return $value;
}

function validate_language(array $content) {
	if (empty($content))
		return false;

	foreach ($content as $key)
		if (! array_key_exists($key, [ 'locale', 'code', 'name', 'tr_name', 'dir', 'type', 'numerus' ] ))
			return false;

	if (! (isset($content['locale']) && preg_match('/[a-z]{2}/', $content['locale'])))
		return false;
	if (! (isset($content['code']) && preg_match('/[a-z]{2}_[A-Z]{2}/', $content['code'])))
		return false;
	if (empty($content['name']))
		return false;
	if (empty($content['tr_name']))
		return false;
	if ($content['dir'] != 'ltr' || $content['dir'] != 'rtl')
		return false;
	if (! (is_numeric($content['type']) && (int) $content['type'] > 0 && (int) $content['type']) < 3)
		return false;
	if (! (is_numeric($content['numerus']) && (int) $content['numerus'] > 0 && (int) $content['numerus']) < 9)
		return false;
}

function validate_translation(PDO $dbh, array $content) {
	if (empty($content))
		return false;

	$sth = \api\db_select($dbh, 'e2se_ts', ['ts_guid']);
	$results = $sth->fetchColumn();

	foreach ($content as $key => $value)
		if (! array_key_exists($key, $results) || empty($value))
			return false;
}

function validate_user(string $content) {
	if (empty($content) || strlen($content) > 99)
		return false;
}

function token_generator() {
	$w = 10;
	$a = [
		[ 48, 57 ],			// 0-9
		[ 97, 122 ],		// a-z
		[ 65, 90 ],			// A-Z
		[ 36, 38, 61, 64 ]	// $,&,=,@
	];
	$str = '';

	while ($w--) {
		$i = rand(0, 3);
		if ($i == 3 && rand(0, 1)) {
		  $i = rand(0, 3);
		}
		if ($i == 3) {
		  $n = rand(0, 3);
		  $n = $a[$i][$n];
		} else {
		  $n = rand($a[$i][1], $a[$i][0]);
		}
		$str .= chr($n);
	}

	return $str;
}

function get_saved_id(PDO $dbh, string $token, bool $check) {
	if (strlen($token) != 10 || ! preg_match('/[a-zA-Z0-9$&=@]{10}/', $token)) {
		throw new Exception('Not a valid token');
	}

	$time_value = date('Y-m-d H:i:s', strtotime('+30 seconds'));

	$sth = \api\db_select($dbh, 'e2se_saved', ['saved_id'], 'WHERE saved_token=:saved_token AND DATE(saved_time+30)<=:time_value', ['saved_token' => $token, 'time_value' => $time_value]);
	$saved_id = $sth->fetchColumn();

	if ($check && ! $saved_id) {
		throw new Exception('Not a valid token');
	}

	return $saved_id;
}




function ul_resume(PDO $dbh, array $request) {
	extract($request);
	$response = [];

	if (empty($token))
		return false;

	try {
		$saved_id = get_saved_id($dbh, $token, true);

		$sth = \api\db_select($dbh, 'e2se_saved', ['saved_id', 'saved_token', 'lang_guid', 'saved_time', 'saved_content'], 'LEFT JOIN e2se_langs ON e2se_langs.lang_id=e2se_saved.lang_id WHERE saved_id=:saved_id', ['saved_id' => $saved_id]);
		$results = $sth->fetchAll(PDO::FETCH_ASSOC);

		$response = [
			'token' => $results[0]['saved_token'],
			'lang' => is_null($results[0]['lang_guid']) ? '' : $results[0]['lang_guid'],
			'time' => $results[0]['saved_time'],
			'data' => $results[0]['saved_content']
		];
	} catch (PDOException $e) {
		var_dump($e);
		return false;
	} catch (Exception $e) {
		return [ 'error' => $e->getMessage() ];
	} catch (Error $e) {
		var_dump($e);
		return false;
	}

	return $response;
}

function ul_history(PDO $dbh, array $request) {
	extract($request);
	$response = [];

	if (empty($token))
		return false;

	try {
		$saved_id = get_saved_id($dbh, $token, true);

		$sth = \api\db_select($dbh, 'e2se_saved', ['e2se_saved.saved_id', 'saved_token', 'saved_time'], 'LEFT JOIN e2se_history ON e2se_history.saved_id=e2se_saved.saved_id WHERE e2se_saved.saved_id=:saved_id', ['saved_id' => $saved_id]);
		$results = $sth->fetchAll(PDO::FETCH_ASSOC|PDO::FETCH_GROUP);

		foreach ($results as $saved_id => $arr) {
			$response[] = [
				'token' => $arr[0]['saved_token'],
				'time' => $arr[0]['saved_time']
			];
		}
	} catch (PDOException $e) {
		var_dump($e);
		return false;
	} catch (Exception $e) {
		return [ 'error' => $e->getMessage() ];
	} catch (Error $e) {
		var_dump($e);
		return false;
	}

	return $response;
}

function ul_submit(PDO $dbh, array $request) {
	extract($request);
	$response = [];

	if (empty($token) || empty($data))
		return false;

	try {
		if (get_saved_id($dbh, $token, false)) {
			$token = token_generator();

			if (get_saved_id($dbh, $token, false)) {
				throw new Exception('An error occurred');
			}
		}

		$data = json_decode($data, true);

		if (! isset($data['language']) || ! isset($data['translation'])) {
			throw new Exception('Malformed data');
		}

		if (! validate_language($data['language'])) {
			throw new Exception('Not a valid language submit');
		}

		if (! validate_translation($dbh, $data['translation'])) {
			throw new Exception('Not a valid translation submit');
		}

		if (! validate_user($data['user'])) {
			throw new Exception('Not a valid user submit');
		}

		// 
		$lang_id = -1;

		$saved = [
			'saved_token' => $token,
			'lang_id' => $lang_id,
			'saved_user' => $data['user'],
			'saved_time' => date('Y-m-d H:i:s'),
			'saved_content' => json_encode([ 'language' => $data['language'], 'translation' => $data['translation'] ])
		];

		$sth = \api\db_insert($dbh, 'e2se_saved', $saved);
		$sth->debugDumpParams();

		// 
		// history

		$response['token'] = $token;
	} catch (PDOException $e) {
		var_dump($e);
		return false;
	} catch (Exception $e) {
		return [ 'error' => $e->getMessage() ];
	} catch (Error $e) {
		var_dump($e);
		return false;
	}

	return $response;
}


if ($method == 'post' && isset($request['call'])) {
	if (! in_array($request['call'], [ 'resume', 'history', 'submit' ])) {
		return false;
	}
	$call = $request['call'];
	if (function_exists("\app\\ul_{$call}")) {
		try {
			$dbh = \api\db_connect();
		} catch (Exception $e) {
			return false;
		}

		$filtereq = array_filter($request, '\app\\filter_request', ARRAY_FILTER_USE_BOTH);
		$response = call_user_func("\app\\ul_{$call}", $dbh, $filtereq);
	}
} else {
	$status = 403;
	return;
}


$status = 200;
