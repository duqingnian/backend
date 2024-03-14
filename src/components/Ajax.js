import axios from 'axios';
import crypto from 'crypto-js'
import { message } from 'antd';

var chars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
function GET_RAND(n) {
    var res = "";
    for (var i = 0; i < n; i++) {
        var id = Math.ceil(Math.random() * 35);
        res += chars[id];
    }
    return res;
}

const APP_CONFIG = JSON.parse(localStorage.getItem("APP_CONFIG"))

let Ajax = function (_route, data, _callback) {
    let postData = new FormData();
    for (let key in data) {
        postData.append(key, data[key])
    }
    if ('undefined' !== typeof (APP_CONFIG.user)) {
        let access_token = APP_CONFIG.user.access_token

        let rand = GET_RAND(16)
        let csrf = APP_CONFIG.csrf
        let rand_token = crypto.MD5(rand + csrf)
        postData.append("_access_token", access_token)
        postData.append("_rand", rand)
        postData.append("_rand_token", rand_token)
        postData.append("_csrf", csrf)
        let _api = APP_CONFIG.api_url + "/" + _route + ".api";
        let message_key = "id_"+_route+'_'+data.action
        message.open({
            key: message_key,
            type: 'loading',
            content: '数据处理中...',
            duration: 600,
        })
        axios.post(_api, postData).then(function (ret) {
            message.destroy(message_key)
            _callback(ret.data)
        }).catch(error => {
            message.destroy(message_key)
            if ("AxiosError" === error.name) {
                message.error(error.message + "[url]=" + _api)
            } else {
                message.error(error.message)
            }
        })
    } else {
        alert('undefined access token')
    }
};

export default Ajax;