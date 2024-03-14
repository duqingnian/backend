let commafy = function(num) 
{
    if ('undefined' === typeof(num) || null === num || '' === num || 'undefined' === num) {
        return;
    }
    var str = num.toString().split('.');
    if (str[0].length >= 4) {
        str[0] = str[0].replace(/(\d)(?=(\d{3})+$)/g, '$1,');
    }
    if ('undefined' === typeof (str[1])) {
        return str[0]
    }
    return str[0] + "." + str[1];
};

export default commafy;