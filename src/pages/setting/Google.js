import React, { Component } from 'react';
import { Breadcrumb } from '@fluentui/react';
import { Button } from "@blueprintjs/core";
import { TextField } from '@fluentui/react';
import { message } from 'antd';
import Ajax from 'components/Ajax';
import android_download from 'assets/android_download.png'
import iphone_download from 'assets/iphone_download.png'

class Google extends Component {
    state = {
        binded: 0,
        google_qrcode: '',
        google_code: '',
    }

    componentDidMount() {
        this.load_google()
    }

    load_google = () => {
        let that = this
        Ajax("user", {
            action: "google"
        }, function (json) {
            if (0 === parseInt(json.code)) {
                that.setState({
                    binded: json.binded,
                    google_qrcode: json.google_qrcode
                })
            } else {
                message.error(json.msg)
            }
        })
    }

    bind_google = (bundle) => {
        let that = this
        Ajax("user", {
            action: "bind_google",
            bundle: bundle,
            google_code: that.state.google_code
        }, function (json) {
            if (0 === parseInt(json.code)) {
                message.success(json.msg)
                that.setState({
                    google_code: '',
                    binded: json.binded,
                    google_qrcode: json.google_qrcode
                })
            } else {
                message.error(json.msg)
            }
        })
    }

    render() {
        return (<div>
            <div className="PageBreadcrumb" style={{ display: 'inline-block' }}>
                <Breadcrumb items={[{ text: '管理面板', key: 'adminPannel' }, { text: '设置', key: 'setting' }, { text: '谷歌验证器', key: 'google' }]} onReduceData={() => undefined} maxDisplayedItems={5} />
            </div>

            <div className='flex' style={{ margin:'15px',alignItems: 'top' }}>
                <div className='mg15' style={{ background: '#fff', padding: '15px', width: '246px', margin: '0px auto' }}>
                    {
                        '' !== this.state.google_qrcode ? <img alt="谷歌验证码二维码" src={this.state.google_qrcode} style={{ width: '200px', margin: '0px auto', marginBottom: '20px', boxShadow: '0 1.6px 3.6px 0 rgba(0,0,0,.132), 0 0.3px 0.9px 0 rgba(0,0,0,.108)' }} /> : ''
                    }
                    <TextField prefix='验证码' value={this.state.google_code} maxLength={6} onChange={(e, code) => {
                        console.info(typeof (e))
                        this.setState({
                            google_code: code
                        })
                    }} styles={{ root: { width: '200px', margin: '0px auto' } }} />

                    <div className='mt10'>
                        {
                            0 === parseInt(this.state.binded)
                                ? <Button intent="Success" style={{ width: '200px' }} onClick={() => { this.bind_google('BIND') }}>绑定谷歌验证器</Button>
                                : <Button intent="Danger" style={{ width: '200px' }} onClick={() => { this.bind_google('UNBIND') }}>解除绑定</Button>
                        }

                    </div>
                </div>
                <div id="download" className='flex' style={{ background: '#fff', padding: '15px',width:'100%', marginLeft:'15px', justifyContent: 'flex-start' }}>
                    <div><img src={android_download} alt="安卓下载" /><br /><div style={{textAlign:'center'}}>安卓下载</div></div>
                    <div className='="ml15"'><img src={iphone_download} alt="苹果下载" /><br /><div style={{textAlign:'center'}}>苹果下载</div></div>
                    <div></div>
                </div>
            </div>
        </div>);
    }
}

export default Google;