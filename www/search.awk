BEGIN {
    # constants
    FS=","
}

function compare_rad(column, value) {
    if(value + 0 > 0) {
	return (column !~ /^</) && ((column + 0) >= (value + 0))
    } else {
	return 1
    }
}

$5 ~ AREA && # area
$9 ~ CATEGORY && # category
$10 ~ NAME && # name
compare_rad($16, I131) &&
compare_rad($19, CS) {
    if(R_OFFSET <= 0 && (R_LIMIT == -1 || R_LIMIT > 0)) {
	print
	if(R_LIMIT != -1) R_LIMIT--
    }
    if(R_LIMIT == 0) {
        exit 0
    }
    R_OFFSET--
}
