<?php
/**
 * app/generator_ts.php
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

if (! (defined('authorized') && authorized)) {
	return \api\deny(401);
}


require_once __DIR__ . '/' . 'languages.php';


use \api\db_connect;
use \api\db_select;
use \api\db_insert;


function encode_entities($str) {
	return str_replace(['&', '\'', '"'], ['&amp;', '&apos;', '&quot;'], $str);
}




$read_db = isset($generator['read_db']) ? (bool) $generator['read_db'] : true;
$write_db = isset($generator['write_db']) ? (bool) $generator['write_db'] : false;
$read_files = isset($generator['read_files']) ? (bool) $generator['read_files'] : true;
$write_files = isset($generator['write_files']) ? (bool) $generator['write_files'] : false;




if (! $read_files || ! $read_db) {
	return false;
}

try {
	if ($read_db || $write_db)
		$dbh = \api\db_connect();
} catch (Exception $e) {
	return \api\dump($e);
}


$ndpass = isset($request['query']);
$query = isset($request['query']) ? substr($request['query'], 0, 5) : NULL;


$response = [];

foreach ($ts_files as $ts_file):

	$lang = substr($ts_file, strpos($ts_file, '_') + 1, - 3);
	$enum = $languages[$lang];

	if ($ndpass && $lang != $query)
		continue;

	$ts_size = 0;

	try {
		$ts_xml = file_get_contents($ts_path . '/' . $ts_file);
		$ts_size = strlen($ts_xml);
		$ts_xml = explode("\n", $ts_xml);
	} catch (Exception $e) {
		return \api\dump($e);
	} catch (Error $e) {
		return \api\dump($e);
	}

	$dst_file = '';
	$fields = [];

	try {
		$sth = \api\db_select($dbh, 'e2se_tr', ['ts_guid', 'tr_msg_tr'], 'LEFT JOIN e2se_ts ON e2se_ts.ts_id=e2se_tr.ts_id WHERE lang_id=:lang_id', ['lang_id' => $enum]);
		$results = $sth->fetchAll(PDO::FETCH_ASSOC);

		foreach ($results as $arr) {
			$guid = $arr['ts_guid'];
			$msg_tr = encode_entities($arr['tr_msg_tr']);

			$fields[$guid] = $msg_tr;
		}
	} catch (PDOException $e) {
		return \api\dump($e);
	} catch (Error $e) {
		return \api\dump($e);
	}

	$name = '';
	$key = '';
	$guid = '';
	$source = '';
	$source_line = 0;
	$comment = '';
	$translation = '';
	$translation_type = '';
	$tmp_source = '';
	$message_numerous = false;
	$skip_translation_line = false;
	$indent_translation_line = 8;

	foreach ($ts_xml as $i => $tree) {
		if (strpos($tree, '<name>') != 0) {
			$name = substr($tree, strpos($tree, '<name>') + 6, strrpos($tree, '</name>') - 10);
		}

		//FIXME numerus
		if (strpos($tree, '<message numerus="yes">') != 0) {
			$message_numerous = true;
		}

		if (! empty($tmp_source) || strpos($tree, '<source>') != 0) {
			if (empty($tmp_source)) {
				$source_line = $i;

				if (strpos($tree, '</source>') != 0) {
					$source = substr($tree, strpos($tree, '<source>') + 8, strrpos($tree, '</source>') - 16);
					$key = $source;
				} else {
					$tmp_source = substr($tree, strpos($tree, '<source>') + 8) . "\n";
				}
			} else {
				if (strpos($tree, '</source>') != 0) {
					$source .= $tmp_source;
					$source .= substr($tree, 0, strrpos($tree, '</source>') - 16);
					$key = $source;
					$tmp_source = '';
				} else {
					$tmp_source .= $tree . "\n";
				}
			}
		}

		if (strpos($tree, '<comment>') != 0) {
			$comment = substr($tree, strpos($tree, '<comment>') + 9, strrpos($tree, '</comment>') - 17);
		}

		if (strpos($tree, '<translation>') != 0) {
			$skip_translation_line = false;
		} else if (! empty($tmp_translation) || strpos($tree, '<translation') != 0) {
			if (empty($tmp_translation)) {
				if (strpos($tree, '<translation type') != 0) {
					$translation_type = substr($tree, strpos($tree, '<translation type') + 19);
					$translation_type = $tmp_ts_type = substr($translation_type, 0, strpos($translation_type, '>') - 1);
				}
				$pos = strpos($tree, '<translation') + 13;
				$pos = empty($translation_type) ? $pos : $pos + strlen($translation_type) + 8;
				if (strpos($tree, '</translation>') != 0) {
					$translation = substr($tree, $pos);
					$translation = substr($translation, 0, strpos($translation, '</translation>'));
					$skip_translation_line = false;
				} else if (! $message_numerous) {
					$tmp_translation = substr($tree, $pos) . "\n";
					$skip_translation_line = true;
				}
			} else {
				if (strpos($tree, '</translation>') != 0) {
					$translation .= $tmp_translation;
					$translation .= substr($tree, 0, strpos($tree, '</translation>'));
					$tmp_translation = '';
					$tmp_ts_type = '';
					$skip_translation_line = false;
				} else if (! $message_numerous) {
					$tmp_translation .= $tree . "\n";
					$skip_translation_line = true;
				}
			}
		}

		if (strpos($tree, '</translation>') != 0) {
			$key = md5($key);
			$guid = md5("{$name}--{$key}--{$comment}");

			$translate = '';
			$skip = $skip_translation_line;
			// $skip = $skip_translation_line || ! empty($translation);

			if (array_key_exists($guid, $fields))
				$translate = $fields[$guid];

			if (! $skip && empty($translate)) {
				$dst_file .= $tree . "\n";
			} else {
				if ($translate) {
					$dst_file .= str_pad(' ', $indent_translation_line) . "<translation>{$translate}</translation>" . "\n";
				} else {
					$dst_file .= $tree . "\n";
				}
			}
		} else if ($skip_translation_line) {
			continue;
		} else {
			$dst_file .= $tree . "\n";
		}

		if (strpos($tree, '<message') != 0) {
			$key = '';
			$guid = '';
			$source = '';
			$source_line = 0;
			$comment = '';
			$translation = '';
			$translation_type = '';
			$skip_translation_line = false;
		} else if (strpos($tree, '</message>') != 0) {
			$message_numerous = false;
		}
	}

	$response['source'] = [
		'count' => count($ts_xml),
		'sizes' => $ts_size
	];
	$response['translated'] = [
		'count' => count($fields),
		'sizes' => strlen($dst_file)
	];

	if ($write_files)
		file_put_contents($dst_ts_path . '/' . $ts_file, $dst_file);

endforeach;


\api\response(200, $response);
