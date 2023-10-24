<?php
/**
 * app/languages.php
 * 
 * @author Leonardo Laureti
 * @license MIT License
 */

namespace app;

if (! defined('API')) {
	http_response_code(403);
	exit;
}

// 
// enum
$languages = [
	'ar' => 14,
	'bg' => 45,
	'ca' => 48,
	'cs' => 67,
	'da' => 68,
	'de' => 94,
	'es' => 270,
	'fa' => 228,
	'fi' => 84,
	'fr' => 85,
	'gd' => 88,
	'gl' => 90,
	'he' => 12,
	'hr' => 103,
	'hu' => 107,
	'it' => 119,
	'ja' => 120,
	'ko' => 142,
	'lt' => 160,
	'lv' => 155,
	'nl' => 72,
	'nn' => 210,
	'pl' => 230,
	'pt_BR' => (int) 1e3 + 231 + 1,
	'pt_PT' => 231,
	'ru' => 239,
	'sk' => 262,
	'sl' => 263,
	'sv' => 275,
	'tr' => 298,
	'uk' => 303,
	'zh_CN' => 58,
	'zh_TW' => (int) 1e3 + 58 + 1,
];

$languages_table = [
	'ar' => ['locale' => 'ar_EG', 'name' => 'Arabic', 'tr_name' => 'لعربية', 'dir' => 'rtl', 'type' => 2, 'numerus' => 6],
	'bg' => ['locale' => 'bg_BG', 'name' => 'Bulgarian', 'tr_name' => 'български', 'dir' => 'ltr', 'type' => 2, 'numerus' => 2],
	'ca' => ['locale' => 'ca_ES', 'name' => 'Catalan', 'tr_name' => 'Català', 'dir' => 'ltr', 'type' => 1, 'numerus' => 2],
	'cs' => ['locale' => 'cs_CZ', 'name' => 'Czech', 'tr_name' => 'Čeština', 'dir' => 'ltr', 'type' => 1, 'numerus' => 3],
	'da' => ['locale' => 'da_DK', 'name' => 'Danish', 'tr_name' => 'Dansk', 'dir' => 'ltr', 'type' => 1, 'numerus' => 2],
	'de' => ['locale' => 'de_DE', 'name' => 'German', 'tr_name' => 'Deutsch', 'dir' => 'ltr', 'type' => 1, 'numerus' => 2],
	'es' => ['locale' => 'es_ES', 'name' => 'Spanish', 'tr_name' => 'Español', 'dir' => 'ltr', 'type' => 1, 'numerus' => 2],
	'fa' => ['locale' => 'fa_IR', 'name' => 'Persian', 'tr_name' => 'فارسی', 'dir' => 'rtl', 'type' => 2, 'numerus' => 1],
	'fi' => ['locale' => 'fi_FI', 'name' => 'Finnish', 'tr_name' => 'Suomen', 'dir' => 'ltr', 'type' => 1, 'numerus' => 2],
	'fr' => ['locale' => 'fr_FR', 'name' => 'French', 'tr_name' => 'Français', 'dir' => 'ltr', 'type' => 1, 'numerus' => 2],
	'gd' => ['locale' => 'gd_GB', 'name' => 'Gaelic', 'tr_name' => 'Gàidhlig', 'dir' => 'ltr', 'type' => 1, 'numerus' => 4],
	'gl' => ['locale' => 'gl_ES', 'name' => 'Galician', 'tr_name' => 'Galego', 'dir' => 'ltr', 'type' => 1, 'numerus' => 2],
	'he' => ['locale' => 'he_IL', 'name' => 'Hebrew', 'tr_name' => 'עברית', 'dir' => 'rtl', 'type' => 2, 'numerus' => 2],
	'hr' => ['locale' => 'hr_HR', 'name' => 'Croatian', 'tr_name' => 'Ḫrvatski', 'dir' => 'ltr', 'type' => 1, 'numerus' => 3],
	'hu' => ['locale' => 'hu_HU', 'name' => 'Hungarian', 'tr_name' => 'Magyar', 'dir' => 'ltr', 'type' => 1, 'numerus' => 1],
	'it' => ['locale' => 'it_IT', 'name' => 'Italian', 'tr_name' => 'Italiano', 'dir' => 'ltr', 'type' => 1, 'numerus' => 2],
	'ja' => ['locale' => 'ja_JP', 'name' => 'Japanese', 'tr_name' => '日本語', 'dir' => 'ltr', 'type' => 2, 'numerus' => 1],
	'ko' => ['locale' => 'ko_KR', 'name' => 'Korean', 'tr_name' => '한국어', 'dir' => 'ltr', 'type' => 2, 'numerus' => 1],
	'lt' => ['locale' => 'lt_LT', 'name' => 'Lithuanian', 'tr_name' => 'Lietuvių', 'dir' => 'ltr', 'type' => 1, 'numerus' => 3],
	'lv' => ['locale' => 'lv_LV', 'name' => 'Latvian', 'tr_name' => 'Latviešu', 'dir' => 'ltr', 'type' => 1, 'numerus' => 3],
	'nl' => ['locale' => 'nl_NL', 'name' => 'Dutch', 'tr_name' => 'Nederlands', 'dir' => 'ltr', 'type' => 1, 'numerus' => 2],
	'nn' => ['locale' => 'nn_NO', 'name' => 'Norwegian Nynorsk', 'tr_name' => 'Nynorsk', 'dir' => 'ltr', 'type' => 1, 'numerus' => 2],
	'pl' => ['locale' => 'pl_PL', 'name' => 'Polish', 'tr_name' => 'Polski', 'dir' => 'ltr', 'type' => 1, 'numerus' => 3],
	'pt_BR' => ['locale' => 'pt_BR', 'name' => 'Portuguese (Brazil)', 'tr_name' => 'Português (Brasil)', 'dir' => 'ltr', 'type' => 1, 'numerus' => 2],
	'pt_PT' => ['locale' => 'pt_PT', 'name' => 'Portuguese (Portugal)', 'tr_name' => 'Português (Portugal)', 'dir' => 'ltr', 'type' => 1, 'numerus' => 2],
	'ru' => ['locale' => 'ru_RU', 'name' => 'Russian', 'tr_name' => 'Pусский', 'dir' => 'ltr', 'type' => 2, 'numerus' => 3],
	'sk' => ['locale' => 'sk_SK', 'name' => 'Slovak', 'tr_name' => 'Slovenčina', 'dir' => 'ltr', 'type' => 1, 'numerus' => 3],
	'sl' => ['locale' => 'sl_SI', 'name' => 'Slovenian', 'tr_name' => 'Slovenščina', 'dir' => 'ltr', 'type' => 1, 'numerus' => 4],
	'sv' => ['locale' => 'sv_SE', 'name' => 'Swedish', 'tr_name' => 'Svenska', 'dir' => 'ltr', 'type' => 1, 'numerus' => 2],
	'tr' => ['locale' => 'tr_TR', 'name' => 'Turkish', 'tr_name' => 'Türkçe', 'dir' => 'ltr', 'type' => 1, 'numerus' => 1],
	'uk' => ['locale' => 'uk_UA', 'name' => 'Ukrainian', 'tr_name' => 'Українська', 'dir' => 'ltr', 'type' => 2, 'numerus' => 3],
	'zh_CN' => ['locale' => 'zh_CN', 'name' => 'Chinese (China)', 'tr_name' => '中文 (中国)', 'dir' => 'ltr', 'type' => 2, 'numerus' => 1],
	'zh_TW' => ['locale' => 'zh_TW', 'name' => 'Chinese (Taiwan)', 'tr_name' => '中文 (台灣)', 'dir' => 'ltr', 'type' => 2, 'numerus' => 1],
];

$ts_files = [
	'e2se_ar.ts',
	'e2se_bg.ts',
	'e2se_ca.ts',
	'e2se_cs.ts',
	'e2se_da.ts',
	'e2se_de.ts',
	'e2se_es.ts',
	'e2se_fa.ts',
	'e2se_fi.ts',
	'e2se_fr.ts',
	'e2se_gd.ts',
	'e2se_gl.ts',
	'e2se_he.ts',
	'e2se_hr.ts',
	'e2se_hu.ts',
	'e2se_it.ts',
	'e2se_ja.ts',
	'e2se_ko.ts',
	'e2se_lt.ts',
	'e2se_lv.ts',
	'e2se_nl.ts',
	'e2se_nn.ts',
	'e2se_pl.ts',
	'e2se_pt_BR.ts',
	'e2se_pt_PT.ts',
	'e2se_ru.ts',
	'e2se_sk.ts',
	'e2se_sl.ts',
	'e2se_sv.ts',
	'e2se_tr.ts',
	'e2se_uk.ts',
	'e2se_zh_CN.ts',
	'e2se_zh_TW.ts',
];


$generator = [];

if (defined('generator_ts')) {
	$generator = (array) constant('generator_ts');
}

$ts_path = isset($generator['ts_path']) && file_exists($generator['ts_path']) ? $generator['ts_path'] : __DIR__ . '/../translations';
$dst_ts_path = isset($generator['dst_ts_path']) && file_exists($generator['dst_ts_path']) ? $generator['dst_ts_path'] : __DIR__ . '/../translations/out';
$sources_path = isset($generator['sources_path']) && file_exists($generator['sources_path']) ? $generator['sources_path'] : __DIR__ . '/../public/sources';


$source_ts_lang = isset($generator['source_ts_lang']) && array_key_exists($generator['source_ts_lang'], $languages) ? $generator['source_ts_lang'] : array_key_first($languages);

