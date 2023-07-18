<?php
/**
 * app/languages.php
 * 
 * @author Leonardo Laureti
 * @license MIT License
 */

namespace app;

if (! defined('API')) {
	http_response_code(503);
	exit();
}

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
	'ar' => [ 'iso' => 'ar_EG', 'name' => 'Arabic', 'tr_name' => '', 'dir' => 'rtl', 'numerus' => 6 ],
	'bg' => [ 'iso' => 'bg_BG', 'name' => 'Bulgarian', 'tr_name' => '', 'dir' => 'ltr', 'numerus' => 2 ],
	'ca' => [ 'iso' => 'ca_ES', 'name' => 'Catalan', 'tr_name' => '', 'dir' => 'ltr', 'numerus' => 2 ],
	'cs' => [ 'iso' => 'cs_CZ', 'name' => 'Czech', 'tr_name' => '', 'dir' => 'ltr', 'numerus' => 3 ],
	'da' => [ 'iso' => 'da_DK', 'name' => 'Danish', 'tr_name' => '', 'dir' => 'ltr', 'numerus' => 2 ],
	'de' => [ 'iso' => 'de_DE', 'name' => 'German', 'tr_name' => '', 'dir' => 'ltr', 'numerus' => 2 ],
	'es' => [ 'iso' => 'es_ES', 'name' => 'Spanish', 'tr_name' => '', 'dir' => 'ltr', 'numerus' => 2 ],
	'fa' => [ 'iso' => 'fa_IR', 'name' => 'Persian', 'tr_name' => '', 'dir' => 'rtl', 'numerus' => 1 ],
	'fi' => [ 'iso' => 'fi_FI', 'name' => 'Finnish', 'tr_name' => '', 'dir' => 'ltr', 'numerus' => 2 ],
	'fr' => [ 'iso' => 'fr_FR', 'name' => 'French', 'tr_name' => '', 'dir' => 'ltr', 'numerus' => 2 ],
	'gd' => [ 'iso' => 'gd_GB', 'name' => 'Gaelic', 'tr_name' => '', 'dir' => 'ltr', 'numerus' => 4 ],
	'gl' => [ 'iso' => 'gl_ES', 'name' => 'Galician', 'tr_name' => '', 'dir' => 'ltr', 'numerus' => 2 ],
	'he' => [ 'iso' => 'he_IL', 'name' => 'Hebrew', 'tr_name' => '', 'dir' => 'rtl', 'numerus' => 2 ],
	'hr' => [ 'iso' => 'hr_HR', 'name' => 'Croatian', 'tr_name' => '', 'dir' => 'ltr', 'numerus' => 3 ],
	'hu' => [ 'iso' => 'hu_HU', 'name' => 'Hungarian', 'tr_name' => '', 'dir' => 'ltr', 'numerus' => 1 ],
	'it' => [ 'iso' => 'it_IT', 'name' => 'Italian', 'tr_name' => 'Italiano', 'dir' => 'ltr', 'numerus' => 2 ],
	'ja' => [ 'iso' => 'ja_JP', 'name' => 'Japanese', 'tr_name' => '', 'dir' => 'ltr', 'numerus' => 1 ],
	'ko' => [ 'iso' => 'ko_KR', 'name' => 'Korean', 'tr_name' => '', 'dir' => 'ltr', 'numerus' => 1 ],
	'lt' => [ 'iso' => 'lt_LT', 'name' => 'Lithuanian', 'tr_name' => '', 'dir' => 'ltr', 'numerus' => 3 ],
	'lv' => [ 'iso' => 'lv_LV', 'name' => 'Latvian', 'tr_name' => '', 'dir' => 'ltr', 'numerus' => 3 ],
	'nl' => [ 'iso' => 'nl_NL', 'name' => 'Dutch', 'tr_name' => '', 'dir' => 'ltr', 'numerus' => 2 ],
	'nn' => [ 'iso' => 'nn_NO', 'name' => 'Norwegian Nynorsk', 'tr_name' => '', 'dir' => 'ltr', 'numerus' => 2 ],
	'pl' => [ 'iso' => 'pl_PL', 'name' => 'Polish', 'tr_name' => '', 'dir' => 'ltr', 'numerus' => 3 ],
	'pt_BR' => [ 'iso' => 'pt_BR', 'name' => 'Portuguese (Brazil)', 'tr_name' => '', 'dir' => 'ltr', 'numerus' => 2 ],
	'pt_PT' => [ 'iso' => 'pt_PT', 'name' => 'Portuguese (Portugal)', 'tr_name' => '', 'dir' => 'ltr', 'numerus' => 2 ],
	'ru' => [ 'iso' => 'ru_RU', 'name' => 'Russian', 'tr_name' => '', 'dir' => 'ltr', 'numerus' => 3 ],
	'sk' => [ 'iso' => 'sk_SK', 'name' => 'Slovak', 'tr_name' => '', 'dir' => 'ltr', 'numerus' => 3 ],
	'sl' => [ 'iso' => 'sl_SI', 'name' => 'Slovenian', 'tr_name' => '', 'dir' => 'ltr', 'numerus' => 4 ],
	'sv' => [ 'iso' => 'sv_SE', 'name' => 'Swedish', 'tr_name' => '', 'dir' => 'ltr', 'numerus' => 2 ],
	'tr' => [ 'iso' => 'tr_TR', 'name' => 'Turkish', 'tr_name' => '', 'dir' => 'ltr', 'numerus' => 1 ],
	'uk' => [ 'iso' => 'uk_UA', 'name' => 'Ukrainian', 'tr_name' => '', 'dir' => 'ltr', 'numerus' => 3 ],
	'zh_CN' => [ 'iso' => 'zh_CN', 'name' => 'Chinese (China)', 'tr_name' => '', 'dir' => 'ltr', 'numerus' => 1 ],
	'zh_TW' => [ 'iso' => 'zh_TW', 'name' => 'Chinese (Taiwan)', 'tr_name' => '', 'dir' => 'ltr', 'numerus' => 1 ],
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

$ts_path = __DIR__ '/../translations';
$tr_path = __DIR__ '/../sources';
