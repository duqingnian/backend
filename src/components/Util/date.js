function date() {

}

function dateFormat(_date) {
    var date = _date;
    var seperator1 = "-";
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var strDate = date.getDate();
    if (month >= 1 && month <= 9) {
        month = "0" + month;
    }
    if (strDate >= 0 && strDate <= 9) {
        strDate = "0" + strDate;
    }

    return year + seperator1 + month + seperator1 + strDate;
}

function today() {
    return dateFormat(new Date())
}

date["dateFormat"] = dateFormat;
date["today"] = today;

export default date;