#!/bin/bash

echo -e "updating translations from ts files ..."

echo -e "first pass."
php cli.php --body service --call="generator-source" --sub="update" 

echo -e "second pass."

for lang in "ar" "bg" "ca" "cs" "da" "de" "es" "fa" "fi" "fr" "gd" "gl" "he" "hr" "hu" "it" "ja" "ko" "lt" "lv" "nl" "nn" "pl" "pt_BR" "pt_PT" "ru" "sk" "sl" "sv" "tr" "uk" "zh_CN" "zh_TW"; do
	echo -e "language: $lang"
	php cli.php --body service --call="generator-source" --sub="update" --query="$lang"
	sleep 5
done

echo -e "done."
