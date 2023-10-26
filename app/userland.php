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
	http_response_code(403);
	exit;
}


require_once __DIR__ . '/' . 'languages.php';


use \api\db_connect;
use \api\db_select;
use \api\db_insert;




function filter_request($value, $key) {
	if (empty($value) || ! in_array($key, ['token', 'data']))
		return false;

	return $value;
}

function validate_token(string $token) {
	if (strlen($token) != 10 && ! preg_match('/[a-zA-Z0-9$&=@]{10}/', $token))
		return false;

	$m = 0;
	preg_match('/[a-z]{2}/', $token) && $m++;
	preg_match('/[A-Z]{2}/', $token) && $m++;
	preg_match('/[0-9]{2}/', $token) && $m++;
	preg_match('/[$&=@]{2}/', $token) && $m++;

	if ($m > 2)
		return false;

	$m = 0;
	preg_match('/[a-z]/', $token) && $m++;
	preg_match('/[A-Z]/', $token) && $m++;
	preg_match('/[0-9]/', $token) && $m++;
	preg_match('/[$&=@]/', $token) && $m++;

	if ($m != 4)
		return false;

	$o = [];
	for ($i = 0; $i < 10; $i++) {
		$char = $token[$i];

		if (! isset($o[$char]))
			$o[$char] = 0;

		$o[$char]++;
	}

	return ! (max($o) > 2);
}

function validate_language(array $arr) {
	if (empty($arr))
		return false;

	foreach ($arr as $key)
		if (! array_key_exists($key, ['locale', 'code', 'name', 'tr_name', 'dir', 'type', 'numerus']))
			return false;

	if (! (isset($arr['locale']) && preg_match('/[a-z]{2}/', $arr['locale'])))
		return false;
	if (! (isset($arr['code']) && preg_match('/[a-z]{2}_[A-Z]{2}/', $arr['code'])))
		return false;
	if (empty($arr['name']))
		return false;
	if (empty($arr['tr_name']))
		return false;
	if ($arr['dir'] != 'ltr' || $arr['dir'] != 'rtl')
		return false;
	if (! (is_numeric($arr['type']) && (int) $arr['type'] > 0 && (int) $arr['type']) < 3)
		return false;
	if (! (is_numeric($arr['numerus']) && (int) $arr['numerus'] > 0 && (int) $arr['numerus']) < 9)
		return false;

	return true;
}

function validate_translation(PDO $dbh, array $arr) {
	if (empty($arr))
		return false;

	$sth = \api\db_select($dbh, 'e2se_ts', ['ts_guid']);
	$results = $sth->fetchAll(PDO::FETCH_COLUMN);

	//FIXME empty($value)
	foreach ($arr as $key => $value)
		if (! in_array($key, $results) || empty($value))
			return false;

	return true;
}

function validate_user(string $str) {
	if (empty($str) || strlen($str) > 99)
		return false;

	return true;
}

function sanitize_text(mixed $data) {
	if (is_array($data))
		foreach ($data as $key => &$value)
			$value = strip_tags($value);
	else
		$data = strip_tags($data);

	return $data;
}

function get_token() {
	$w = 10;
	$a = [
		[48, 57],         // 0-9
		[97, 122],        // a-z
		[65, 90],         // A-Z
		[36, 38, 61, 64]  // $,&,=,@
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

	for ($i = 0; $i != 5; $i++) {
		if (validate_token($str)
			break;
		else
			$str = get_token();
	}

	return $str;
}

function get_saved_id(PDO $dbh, string $token, bool $check) {
	if (! validate_token($token))
		throw new Exception('Not a valid token');

	$time_value = date('Y-m-d H:i:s', strtotime('+30 seconds'));

	$sth = \api\db_select($dbh, 'e2se_saved', ['saved_id'], 'WHERE saved_token=:saved_token AND DATE(saved_time+30)<=:time_value', ['saved_token' => $token, 'time_value' => $time_value]);
	$saved_id = $sth->fetchColumn();

	if ($check && ! $saved_id)
		throw new Exception('Not a valid token');

	return $saved_id;
}

function get_lang_guid(PDO $dbh, string $guid, bool $check) {
	if (empty($guid))
		throw new Exception('Not a valid language');

	$sth = \api\db_select($dbh, 'e2se_langs', ['lang_id'], 'WHERE lang_guid=:lang_guid', ['lang_guid' => $guid]);
	$lang_id = $sth->fetchColumn();

	if ($check && ! $lang_id)
		throw new Exception('Not a valid language');

	return $lang_id;
}




function ul_resume(PDO $dbh, array $request) {
	extract($request);

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
			'data' => json_decode($results[0]['saved_content'], true)
		];

		\api\response(200, $response);
	} catch (PDOException $e) {
		\api\dump($e);
	} catch (Exception $e) {
		\api\response(502, ['error' => $e->getMessage()]);
	} catch (Error $e) {
		\api\dump($e);
	}

	return $response;
}

function ul_history(PDO $dbh, array $request) {
	extract($request);

	if (empty($token))
		return false;

	try {
		$saved_id = get_saved_id($dbh, $token, true);

		$sth = \api\db_select($dbh, 'e2se_saved', ['e2se_saved.saved_id', 'saved_token', 'saved_time'], 'LEFT JOIN e2se_history ON e2se_history.saved_id=e2se_saved.saved_id WHERE e2se_saved.saved_id=:saved_id', ['saved_id' => $saved_id]);
		$results = $sth->fetchAll(PDO::FETCH_ASSOC|PDO::FETCH_GROUP);

		$response = [];
		foreach ($results as $saved_id => $arr) {
			$response[] = [
				'token' => $arr[0]['saved_token'],
				'time' => $arr[0]['saved_time']
			];
		}

		\api\response(200, $response);
	} catch (PDOException $e) {
		\api\dump($e);
	} catch (Exception $e) {
		\api\response(502, ['error' => $e->getMessage()]);
	} catch (Error $e) {
		\api\dump($e);
	}

	return false;
}

function ul_submit(PDO $dbh, array $request) {
	extract($request);

	if (empty($token) || empty($data))
		return false;

	try {
		if (get_saved_id($dbh, $token, false)) {
			$token = get_token();

			if (get_saved_id($dbh, $token, false))
				throw new Exception('An error occurred');
		}

		$data = json_decode($data, true);

		if (! isset($data['translation']) && ! (isset($data['lang']) || isset($data['language'])))
			throw new Exception('Malformed data');

		$lang_id = NULL;

		if (isset($data['language']) && ! validate_language($data['language']))
			throw new Exception('Not a valid language submit');
		else if (isset($data['lang']))
			$lang_id = get_lang_guid($dbh, $data['lang'], true);

		if (! validate_translation($dbh, $data['translation']))
			throw new Exception('Not a valid translation submit');

		if (isset($data['user']) && ! validate_user($data['user']))
			throw new Exception('Not a valid user submit');

		$content = [];

		if (isset($data['language']))
			$content['ulang'] = sanitize_text($data['language']);

		$content['utr'] = sanitize_text($data['translation']);

		$user = isset($data['user']) ? sanitize_text($data['user']) : '';

		$saved = [
			'saved_token' => $token,
			'lang_id' => $lang_id,
			'saved_user' => $user,
			'saved_time' => date('Y-m-d H:i:s'),
			'saved_content' => json_encode($content)
		];

		$sth = \api\db_insert($dbh, 'e2se_saved', $saved);
		// $sth->debugDumpParams();

		// 
		// history

		$response = ['token' => $token];

		\api\response(200, $response);
	} catch (PDOException $e) {
		\api\dump($e);
	} catch (Exception $e) {
		\api\response(502, ['error' => $e->getMessage()]);
	} catch (Error $e) {
		\api\dump($e);
	}

	return false;
}


if ($method == 'post' && isset($request['call'])) {
	if (! in_array($request['call'], ['resume', 'history', 'submit']))
		return false;

	$call = $request['call'];

	if (function_exists("\app\\ul_{$call}")) {
		try {
			$dbh = \api\db_connect();
		} catch (Exception $e) {
			return \api\dump($e);
		}

		$filtereq = array_filter($request, '\app\\filter_request', ARRAY_FILTER_USE_BOTH);
		return call_user_func("\app\\ul_{$call}", $dbh, $filtereq);
	}
} else {
	return false;
}
