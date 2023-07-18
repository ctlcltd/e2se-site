<?php
/**
 * app/generator_source.php
 * 
 * @author Leonardo Laureti
 * @license MIT License
 */

namespace app;

if (! defined('API')) {
	http_response_code(503);
	exit();
}

if (! defined('authorized')) {
	return;
}

require_once __DIR__ . '/' . 'languages.php';


// first lang in array
$src_ts_lang = 'ar';


function decode_entities($str) {
	return str_replace('&apos;', '\'', html_entity_decode($str));
}

function db_insert($dbh, $table_name, $arr) {
	$_var_transfunc = function($key) {
		return ":{$key}";
	};

	$cols = array_keys($arr);
	$vars = array_map($_var_transfunc, $cols);

	$sql = "INSERT INTO %s (%s) VALUES(%s)";
	$sql = sprintf($sql, $table_name, implode(',', $cols), implode(',', $vars));

	$sth = $dbh->prepare($sql);
	return $sth->execute(array_combine($vars, $arr));
}


$index = [];
$order = [];
$langs = [];
$strings = [];
$translated = [];
$disambigua = [];


foreach ($ts_files as $ts_file) {

	$ts_xml = file_get_contents($ts_path . '/' . $ts_file);
	$ts_xml = explode("\n", $ts_xml);

	$lang = substr($ts_file, strpos($ts_file, '_') + 1, - 3);
	$enum = $languages[$lang];


	$translated[$lang] = [];
	$order[$lang] = [];
	$id = 0;

	$lang_id = $enum;
	$lang_iso = '';
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
		'lang_iso' => $languages_table[$lang]['iso'],
		'lang_sourced' => 0,
		'lang_dir' => $languages_table[$lang]['dir'],
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

			if ($lang == $src_ts_lang) {
				$langs[$lang]['lang_sourced'] = 1;

				$index[$guid] = $ts_id = $id;

				$strings[$id] = [
					'ts_id' => $ts_id,
					'ts_guid' => $guid,
					'ts_ctx_name' => decode_entities($name),
					'ts_msg_src' => decode_entities($source),
					'ts_msg_comment' => decode_entities($comment),
					'ts_msg_extra' => decode_entities($extracomment),
					'ts_msg_numerus' => (int) $msg_numerous,
					'ts_line' => $src_line
				];

				$disambigua[$key][] = $id;
			}

			// vanished
			$ts_id = isset($index[$guid]) ? $index[$guid] : 0;

			$translated[$lang][$id] = [
				'lang_id' => $lang_id,
				'ts_id' => $ts_id,
				'ts_msg_tr' => decode_entities($translation),
				'ts_line' => $src_line,
				'ts_status' => $status,
				'ts_notes' => '',
				'ts_revised' => 0
			];
			$order[$lang][$id] = $ts_id;
		}
	}

	$total = count($strings);

	if ($total) {
		$langs[$lang]['lang_completed'] = (int) round($completed / $total * 100);
	}

}


$status = 502;
$response = [];

try {
	$dbh = \api\db_connect();
} catch (Exception $e) {
	return false;
}


// var_dump($langs);
// var_dump($disambigua);
// var_dump($strings);
// var_dump($translated);


foreach ($order as $lang => &$table) {
	asort($table);
}


$dbh->beginTransaction();

$json = [];

foreach ($langs as $code => $lang) {
	$json[$code] = [
		'guid' => $lang['lang_guid'],
		'code' => $lang['lang_code'],
		'iso' => $lang['lang_iso'],
		'name' => $lang['lang_name'],
		'tr_name' => $lang['lang_tr_name'],
		'dir' => $lang['lang_dir'],
		'numerus' => $lang['lang_numerus'],
		'completed' => $lang['lang_completed'],
		'revised' => $lang['lang_revised']
	];

	db_insert($dbh, 'e2se_langs', $lang);
}

$dbh->commit();

file_put_contents($tr_path . '/' . 'e2se-ts-langs.json', json_encode($json));

$response['langs'] = [
	'count' => count($langs),
	'size' => [
		'e2se-ts-langs.json' => strlen(json_encode($json))
	],
	'status' => ! (empty($langs) || empty($json))
];


$dbh->beginTransaction();

foreach ($disambigua as $ts_id) {
	if (count($ts_id) < 2) {
		continue;
	}

	foreach ($ts_id as $i => $id) {
		if ($i == 0) {
			continue;
		}

		$d = [
			'ts_id' => $ts_id[0],
			'disambigua' => $id
		];

		db_insert($dbh, 'e2se_disambigua', $d);
	}
}

$dbh->commit();

$response['disambigua'] = [
	'count' => count($disambigua),
	'size' => [
		0 => strlen(json_encode($disambigua))
	],
	'status' => ! empty($disambigua)
];


$dbh->beginTransaction();

$json = [];

foreach ($strings as $ts) {
	$json[] = [
		'guid' => $ts['ts_guid'],
		'ctx_name' => $ts['ts_ctx_name'],
		'msg_src' => $ts['ts_msg_src'],
		'msg_comment' => $ts['ts_msg_comment'],
		'msg_extra' => $ts['ts_msg_extra']
	];

	db_insert($dbh, 'e2se_ts', $ts);
}

$dbh->commit();

file_put_contents($tr_path . '/' . 'e2se-ts-src.json', json_encode($json));

$response['strings'] = [
	'count' => count($strings),
	'size' => [
		'e2se-ts-src.json' => strlen(json_encode($json))
	],
	'status' => ! (empty($strings) || empty($json))
];


$sizes = [];

foreach ($order as $lang => $table) {
	$dbh->beginTransaction();

	$json = [];

	foreach ($table as $id) {
		$tr = $translated[$lang][$id];

		// vanished
		if ($tr['ts_id'] == 0) {
			db_insert($dbh, 'e2se_tr', $tr);

			continue;
		}

		$ts = $strings[$tr['ts_id']];
		$guid = $ts['ts_guid'];

		$json[] = [
			'guid' => $guid,
			'msg_tr' => $tr['ts_msg_tr'],
			'status' => $tr['ts_status'],
			'notes' => $tr['ts_notes'],
			'revised' => $tr['ts_revised']
		];

		db_insert($dbh, 'e2se_tr', $tr);
	}

	$dbh->commit();

	file_put_contents($tr_path . '/' . 'e2se-ts-' . $lang . '-tr.json', json_encode($json));

	$sizes['e2se-ts-' . $lang . '-tr.json'] = strlen(json_encode($json));
}

$response['translated'] = [
	'count' => count($translated),
	'size' => $sizes,
	'status' => ! empty($translated)
];


$status = 200;
