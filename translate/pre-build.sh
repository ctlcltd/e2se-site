#!/bin/bash
# Translations page pre-build script
# 

usage () {
	if [[ -z "$1" ]]; then
		printf "%s\n\n" "Translations page pre-build script"
	fi

	printf "%s\n\n" "bash pre-build.sh [OPTIONS]"
	printf "%s\n"   "-c --lconvert      Set Qt Linguist lconvert executable."
	printf "%s\n"   "-b --bunch         Executes all tasks."
	printf "%s\n"   "   --fetch-git     Fetch source translation source files from the repository."
	printf "%s\n"   "   --copy-ts       Copy Qt translation sources (.ts) from the repository."
	printf "%s\n"   "   --convert-po    Convert Qt translation sources (.ts) to GNU Gettext localization files (.po, .pot)."
    printf "%s\n"   "   --make-json     Make JSON file listing files and hashes."
	printf "%s\n"   "   --delete-temp   Delete temporary files."
	printf "%s\n"   "-h --help          Display this help and exit."
}

init () {
	LANGUAGES=("ar" "bg" "ca" "cs" "da" "de" "en_US" "es" "fa" "fi" "fr" "gd" "gl" "he" "hr" "hu" "it" "ja" "ko" "lt" "lv" "nl" "nn" "pl" "pt_BR" "pt_PT" "ru" "sk" "sl" "sv" "tr" "uk" "zh_CN" "zh_TW")

	if [[ -z "$LCONVERT" ]]; then
		if [[ -n $(type -t lconvert) ]]; then
			LCONVERT="lconvert"
		fi
	fi
    if [[ -z "$OUTFILE" ]]; then
        OUTFILE="sources.json"
    fi

	if [[ -z $(type -t "$LCONVERT") ]]; then
		echo "Qt Linguist lconvert not found."

		exit 1;
	fi
}

fetch_git() {
    printf "%s\n\n" "fetch git repository."

    git clone https://github.com/ctlcltd/e2-sat-editor.git .repository
}

copy_ts() {
    printf "%s\n\n" "copy ts file from repository."

    mkdir -p ts

    local lang="en_EN"
    printf "%s: %s > %s\n" "copying" ".repository/translations/e2se_$lang.ts" "ts/e2se.ts"
    cp ".repository/translations/e2se_$lang.ts" "ts/e2se.ts"

    for lang in "${LANGUAGES[@]}"; do
        printf "%s: %s > %s\n" "copying" ".repository/translations/e2se_$lang.ts" "ts/e2se_$lang.po"
        cp ".repository/translations/e2se_$lang.ts" "ts/e2se_$lang.ts"
    done
}

convert_po() {
	printf "%s\n\n" "convert ts files to po files."

	mkdir -p po

    local lang="en_EN"
    printf "%s: %s > %s\n" "converting" ".repository/translations/e2se_$lang.ts" "po/e2se.pot"
    $LCONVERT -i ".repository/translations/e2se_$lang.ts" -o "po/e2se.pot"

	for lang in "${LANGUAGES[@]}"; do
		printf "%s: %s > %s\n" "converting" ".repository/translations/e2se_$lang.ts" "po/e2se_$lang.po"
		$LCONVERT -i ".repository/translations/e2se_$lang.ts" -o "po/e2se_$lang.po"
	done
}

make_json() {
    printf "%s\n\n" "make json file."

    local filename=""
    local file=""
    local hash=""
    local comma=""
    local len="${#LANGUAGES[@]}"
    local last="${LANGUAGES[$len-1]}"

    printf "" > "$OUTFILE"
    printf "{" >> "$OUTFILE"
    printf "\"ts\":{" >> "$OUTFILE"
    filename="ts/e2se.ts"
    file=$(basename "$filename")
    hash=$(basename $(shasum -a 256 "$filename"))
    comma=","
    printf "\"%s\":{\"file\":\"%s\",\"hash\":\"%s\"}%s" "template" "$file" "$hash" "$comma" >> "$OUTFILE"
	for lang in "${LANGUAGES[@]}"; do
        filename="ts/e2se_$lang.ts"
        file=$(basename "$filename")
        hash=$(basename $(shasum -a 256 "$filename"))
        comma=$([ "$lang" == "$last" ] && echo "" || echo ",")
        printf "\"%s\":{\"file\":\"%s\",\"hash\":\"%s\"}%s" "$lang" "$file" "$hash" "$comma" >> "$OUTFILE"
	done
    printf "}," >> "$OUTFILE"

    printf "\"po\":{" >> "$OUTFILE"
    filename="po/e2se.pot"
    file=$(basename "$filename")
    hash=$(basename $(shasum -a 256 "$filename"))
    comma=","
    printf "\"%s\":{\"file\":\"%s\",\"hash\":\"%s\"}%s" "template" "$file" "$hash" "$comma" >> "$OUTFILE"
	for lang in "${LANGUAGES[@]}"; do
        filename="po/e2se_$lang.po"
        file=$(basename "$filename")
        hash=$(basename $(shasum -a 256 "$filename"))
        comma=$([ "$lang" == "$last" ] && echo "" || echo ",")
        printf "\"%s\":{\"file\":\"%s\",\"hash\":\"%s\"}%s" "$lang" "$file" "$hash" "$comma" >> "$OUTFILE"
	done
    printf "}" >> "$OUTFILE"
    printf "}" >> "$OUTFILE"

    printf "%s: %s\n" $([[ -n "$OUTFILE" ]] && printf "written" || printf "error") $(basename "$OUTFILE")
}

delete_temp() {
    printf "%s\n\n" "delete temporary files."

    rm -rf .repository
}

complete () {
	printf "\n%s\n" "done."
}


if [[ -z "$@" ]]; then
	usage

	exit 0
fi

for SRG in "$@"; do
	case "$SRG" in
		-c*|--lconvert*)
			LCONVERT="$2"
			init
			shift
			shift
			;;
		-b|--bunch)
			init
			fetch_git
            copy_ts
            convert_po
            make_json
            delete_temp
			shift
			;;
		--fetch-git)
			init
			fetch_git
			shift
			;;
		--copy-ts)
			init
			copy_ts
			shift
			;;
		--convert-po)
			init
			convert_po
			shift
			;;
		--make-json)
            OUTFILE="$2"
			init
			make_json
			shift
			;;
		--delete-temp)
			init
			delete_temp
			shift
			;;
		-h|--help)
			usage

			exit 0
			;;
		-*)
			[[ "$1" == "-"* ]] && shift
			printf "%s: %s %s\n\n" "$0" "Illegal option" "$2"

			usage 1

			exit 1
			;;
		*)
			[[ "$1" != -* ]] && usage
			;;
	esac
done

complete

