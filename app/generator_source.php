<?php
/**
 * app/generator_source.php
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

if (! defined('authorized')) {
	$status = 401;
	return;
}


require_once __DIR__ . '/' . 'languages.php';


use \api\db_connect;
use \api\db_select;
use \api\db_insert;


function decode_entities($str) {
	return str_replace('&apos;', '\'', html_entity_decode($str));
}




$read_db = isset($generator['read_db']) ? (bool) $generator['read_db'] : true;
$write_db = isset($generator['write_db']) ? (bool) $generator['write_db'] : false;
$read_files = isset($generator['read_files']) ? (bool) $generator['read_files'] : true;
$write_files = isset($generator['write_files']) ? (bool) $generator['write_files'] : false;




if (! $read_files) {
	return false;
}

try {
	if ($read_db || $write_db)
		$dbh = \api\db_connect();
} catch (Exception $e) {
	return false;
}


$index = [];
$order = [];
$langs = [];
$strings = [];
$translated = [];
$disambiguation = [];
$notes = [];


if ($read_db) {
	$language = array_flip($languages);

	try {
		$sth = \api\db_select($dbh, 'e2se_ts', ['ts_id', 'ts_guid', 'ts_notes'], 'WHERE ts_notes!=""');
		$results = $sth->fetchAll(PDO::FETCH_ASSOC);

		foreach ($results as $arr) {
			$guid = $arr['ts_guid'];
			$notes['ts'][$guid] = $arr['ts_notes'];
		}
	} catch (PDOException $e) {
		return false;
	} catch (Error $e) {
		return false;
	}

	try {
		$sth = \api\db_select($dbh, 'e2se_tr', ['e2se_tr.ts_id', 'ts_guid', 'lang_id', 'tr_notes'], 'LEFT JOIN e2se_ts ON e2se_ts.ts_id=e2se_tr.ts_id WHERE tr_notes!=""');
		$results = $sth->fetchAll(PDO::FETCH_ASSOC);

		foreach ($results as $arr) {
			$guid = $arr['ts_guid'];
			$lang_id = $arr['lang_id'];
			$lang = $language[$lang_id];

			$notes[$lang][$guid] = $arr['tr_notes'];
		}
	} catch (PDOException $e) {
		return false;
	} catch (Error $e) {
		return false;
	}
}


// sourced lang first in array
$src_ts_lang_i = 0;

foreach ($ts_files as $i => $ts_file) {
	if (strrpos($ts_file, "_{$source_ts_lang}") !== false) {
		$src_ts_lang_i = $i;
		break;
	}
}

array_unshift($ts_files, $ts_files[$src_ts_lang_i]);


$sourced = false;

foreach ($ts_files as $ts_file) {

	try {
		$ts_xml = file_get_contents($ts_path . '/' . $ts_file);
		$ts_xml = explode("\n", $ts_xml);
	} catch (\Exception $e) {
		return false;
	} catch (\Error $e) {
		return false;
	}

	$lang = substr($ts_file, strpos($ts_file, '_') + 1, - 3);
	$enum = $languages[$lang];


	if (! $sourced && $lang != $source_ts_lang) {
		$translated[$lang] = [];
		$order[$lang] = [];
	}

	$lang_id = $enum;
	$id = 0;
	$name = '';
	$key = '';
	$guid = '';
	$source = '';
	$src_line = 0;
	$comment = '';
	$translation = '';
	$ts_type = '';
	$tmp_source = '';
	$tmp_translation = '';
	$tmp_ts_type = '';
	$status = 0;
	$msg_numerous = false;
	$completed = 0;

	$langs[$lang] = [
		'lang_id' => $lang_id,
		'lang_guid' => md5($lang),
		'lang_code' => $lang,
		'lang_locale' => $languages_table[$lang]['locale'],
		'lang_sourced' => 0,
		'lang_dir' => $languages_table[$lang]['dir'],
		'lang_type' => $languages_table[$lang]['type'],
		'lang_numerus' => $languages_table[$lang]['numerus'],
		'lang_name' => $languages_table[$lang]['name'],
		'lang_tr_name' => $languages_table[$lang]['tr_name'],
		'lang_completed' => 0,
		'lang_revised' => 0
	];

	foreach ($ts_xml as $i => $tree) {
		if (strpos($tree, '<name>') !== false) {
			$name = substr($tree, strpos($tree, '<name>') + 6, strrpos($tree, '</name>') - 10);
		}

		if (strpos($tree, '<message numerus="yes">') !== false) {
			$msg_numerous = true;
		}

		if (! empty($tmp_source) || strpos($tree, '<source>') !== false) {
			if (empty($tmp_source)) {
				$src_line = $i;

				if (strpos($tree, '</source>') !== false) {
					$source = substr($tree, strpos($tree, '<source>') + 8, strrpos($tree, '</source>') - 16);
				} else {
					$tmp_source = substr($tree, strpos($tree, '<source>') + 8) . "\n";
				}
			} else {
				if (strpos($tree, '</source>') !== false) {
					$source .= $tmp_source;
					$source .= substr($tree, 0, strrpos($tree, '</source>') - 16);
					$tmp_source = '';
				} else {
					$tmp_source .= $tree . "\n";
				}
			}
		}

		if (strpos($tree, '<comment>') !== false) {
			$comment = substr($tree, strpos($tree, '<comment>') + 9, strrpos($tree, '</comment>') - 17);
		}
		if (strpos($tree, '<extracomment>') !== false) {
			$extracomment = substr($tree, strpos($tree, '<extracomment>') + 14, strrpos($tree, '</extracomment>') - 22);
		}

		if (! empty($tmp_translation) || strpos($tree, '<translation') !== false) {
			if (empty($tmp_translation)) {
				if (strpos($tree, '<translation type') !== false) {
					$ts_type = substr($tree, strpos($tree, '<translation type') + 19);
					$ts_type = $tmp_ts_type = substr($ts_type, 0, strpos($ts_type, '>') - 1);
				}
				$pos = strpos($tree, '<translation') + 13;
				$pos = empty($ts_type) ? $pos : $pos + strlen($ts_type) + 8;
				if (strpos($tree, '</translation>') !== false) {
					$translation = substr($tree, $pos);
					$translation = substr($translation, 0, strpos($translation, '</translation>'));
				} else if (! $msg_numerous) {
					$tmp_translation = substr($tree, $pos) . "\n";
				}
			} else {
				if (strpos($tree, '</translation>') !== false) {
					$translation .= $tmp_translation;
					$translation .= substr($tree, 0, strpos($tree, '</translation>'));
					$tmp_translation = '';
					$tmp_ts_type = '';
				} else if (! $msg_numerous) {
					$tmp_translation .= $tree . "\n";
				}
			}
		}

		if (strpos($tree, '<message') !== false) {
			$key = '';
			$guid = '';
			$source = '';
			$src_line = 0;
			$comment = '';
			$extracomment = '';
			$translation = '';
			$ts_type = '';
			$status = 0;
		} else if (strpos($tree, '</message>') !== false) {
			$id++;

			$key = md5($source);
			$guid = md5("{$name}--{$key}--{$comment}");

			$status = 0;

			if ($ts_type == 'unfinished')
				$status = 0;
			else if ($ts_type == 'vanished')
				$status = 2;
			else
				$status = 1;

			if ($status == 1)
				$completed++;

			if (! $sourced && $lang == $source_ts_lang) {

				$index[$guid] = $ts_id = $id;

				$strings[$id] = [
					'ts_id' => $ts_id,
					'ts_guid' => $guid,
					'ts_ctx_name' => decode_entities($name),
					'ts_msg_src' => decode_entities($source),
					'ts_msg_comment' => decode_entities($comment),
					'ts_msg_extra' => decode_entities($extracomment),
					'ts_msg_numerus' => (int) $msg_numerous,
					'ts_line' => $src_line,
					'ts_notes' => isset($notes['ts'][$guid]) ? $notes['ts'][$guid] : ''
				];

				$disambiguation[$key][] = $id;
			} else {

				// vanished
				$ts_id = isset($index[$guid]) ? $index[$guid] : 0;

				$translated[$lang][$id] = [
					'lang_id' => $lang_id,
					'ts_id' => $ts_id,
					'tr_msg_tr' => decode_entities($translation),
					'tr_line' => $src_line,
					'tr_status' => $status,
					'tr_revised' => 0,
					'tr_notes' => isset($notes[$lang][$guid]) ? $notes[$lang][$guid] : ''
				];

				$order[$lang][$id] = $ts_id;
			}
		}
	}

	if ($sourced) {
		$total = count($strings);

		if ($total) {
			$x = $completed / $total * 100;

			if ($x !== 100.0) {
				if ($x > 99.5)
					$x -= 4;
				else if ($x > 99.0)
					$x -= 6;
				else if ($x > 98.5)
					$x -= 2;
				else if ($x > 98.0)
					$x -= 3;
				else
					$x -= 1;
			}

			$langs[$lang]['lang_completed'] = (int) round($x);
		}
	} else if ($lang == $source_ts_lang) {
		$langs[$lang]['lang_sourced'] = 1;

		$sourced = true;
	}

}

foreach ($order as $lang => &$table) {
	asort($table);
}

$disambigua = [];

foreach ($disambiguation as $arr) {
	if (count($arr) < 2) {
		continue;
	}

	$ts_id = $arr[0];

	foreach ($arr as $i => $id) {
		if ($i == 0) {
			continue;
		}

		$guid = $strings[$id]['ts_guid'];
		$disambigua[$ts_id][$id] = $guid;
	}
}

foreach ($disambigua as $ts_id => $arr) {
	foreach ($arr as $id => $guid) {
		$disambigua[$id][$ts_id] = $strings[$ts_id]['ts_guid'];
		$_arr = $arr;
		unset($_arr[$id]);
		$disambigua[$id] += $_arr;
	}
}


// var_dump($langs);
// var_dump($disambigua);
// var_dump($strings);
// var_dump($translated);
// var_dump($notes);



if ($write_db)
	$dbh->beginTransaction();

$json = [];

foreach ($langs as $code => $lang) {
	$arr = [
		'guid' => $lang['lang_guid'],
		'code' => $lang['lang_code'],
		'locale' => $lang['lang_locale'],
		'name' => $lang['lang_name'],
		'tr_name' => $lang['lang_tr_name'],
		'dir' => $lang['lang_dir'],
		'type' => $lang['lang_type'],
		'numerus' => $lang['lang_numerus'],
		'completed' => $lang['lang_completed'],
		'revised' => $lang['lang_revised']
	];

	$json[$code] = $arr;

	if ($write_db)
		\api\db_insert($dbh, 'e2se_langs', $lang);
}

if ($write_db)
	$dbh->commit();

if ($write_files)
	file_put_contents($sources_path . '/' . 'e2se-ts-langs.json', json_encode($json));

$response['langs'] = [
	'count' => count($langs),
	'sizes' => [
		'e2se-ts-langs.json' => strlen(json_encode($json))
	]
];


if ($write_db)
	$dbh->beginTransaction();

foreach ($disambigua as $ts_id => $arr) {
	foreach ($arr as $id => $guid) {
		$dis = [
			'ts_id' => $ts_id,
			'disambigua' => $id
		];

		if ($write_db)
			\api\db_insert($dbh, 'e2se_disambigua', $dis);
	}
}

if ($write_db)
	$dbh->commit();

$response['disambigua'] = [
	'count' => count($disambigua),
	'sizes' => [
		0 => strlen(json_encode($disambigua))
	]
];


if ($write_db)
	$dbh->beginTransaction();

$json = [];

foreach ($strings as $ts) {
	$arr = [
		'guid' => $ts['ts_guid'],
		'ctx_name' => $ts['ts_ctx_name'],
		'msg_src' => $ts['ts_msg_src'],
		'msg_comment' => $ts['ts_msg_comment'],
		'msg_extra' => $ts['ts_msg_extra'],
		'msg_numerus' => $ts['ts_msg_numerus']
	];

	if (isset($disambigua[$ts['ts_id']])) {
		$arr['disambigua'] = array_values($disambigua[$ts['ts_id']]);
	}
	if (! empty($ts['ts_notes'])) {
		$arr['notes'] = $ts['ts_notes'];
	}

	$json[] = $arr;

	if ($write_db)
		\api\db_insert($dbh, 'e2se_ts', $ts);
}

if ($write_db)
	$dbh->commit();

if ($write_files)
	file_put_contents($sources_path . '/' . 'e2se-ts-src.json', json_encode($json));

$response['strings'] = [
	'count' => count($strings),
	'sizes' => [
		'e2se-ts-src.json' => strlen(json_encode($json))
	]
];


$sizes = [];

foreach ($order as $lang => $table) {
	if ($write_db)
		$dbh->beginTransaction();

	$json = [];

	foreach ($table as $id => $ts_id) {
		$tr = $translated[$lang][$id];

		// vanished
		if ($tr['ts_id'] == 0) {
			if ($write_db)
				\api\db_insert($dbh, 'e2se_tr', $tr);

			continue;
		}

		$ts = $strings[$tr['ts_id']];
		$guid = $ts['ts_guid'];

		$arr = [
			'guid' => $guid,
			'msg_tr' => $tr['tr_msg_tr'],
			'status' => $tr['tr_status'],
			'revised' => $tr['tr_revised']
		];

		if (! empty($tr['tr_notes'])) {
			$arr['notes'] = $tr['tr_notes'];
		}

		$json[] = $arr;

		if ($write_db)
			\api\db_insert($dbh, 'e2se_tr', $tr);
	}

	if ($write_db)
		$dbh->commit();

	if ($write_files)
		file_put_contents($sources_path . '/' . 'e2se-ts-' . $lang . '-tr.json', json_encode($json));

	$sizes['e2se-ts-' . $lang . '-tr.json'] = strlen(json_encode($json));
}

$response['translated'] = [
	'count' => count($translated),
	'sizes' => $sizes
];


$status = 200;
