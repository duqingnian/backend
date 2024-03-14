import React, { Component } from 'react';
import { Breadcrumb } from '@fluentui/react';
import { FormGroup, Button } from "@blueprintjs/core";
import { TextField } from '@fluentui/react';
import { message } from 'antd';
import Ajax from 'components/Ajax';

class Password extends Component {
    state = {
        password: {
            password1: '',
            password2: '',
            password3: '',
        },
    }
    syncPassword = (e, _text) => {
        let that = this

        let pass = that.state.password
        let name = e.target.dataset.name
        pass[name] = _text
        that.setState({ password: pass })
    }
    update_password = () => {
        let that = this
        let err = false
        if (!err && '' === that.state.password.password1) {
            err = true
            message.error("请输入原密码")
        }
        if (!err && '' === that.state.password.password2) {
            err = true
            message.error("请输入新密码")
        }
        if (!err && that.state.password.password2 !== that.state.password.password3) {
            err = true
            message.error("两次密码不一致")
        }

        if (!err) {
            Ajax("user", {
                action: 'password',
                password: JSON.stringify(that.state.password)
            }, function (json) {
                if (0 === parseInt(json.code)) {
                    window.location.href = "/logout"
                } else {
                    message.error(json.msg)
                }
            })
        }
    }

    render() {
        return (<div>
            <div className="PageBreadcrumb" style={{ display: 'inline-block' }}>
                <Breadcrumb items={[{ text: '管理面板', key: 'adminPannel' }, { text: '设置', key: 'setting' }, { text: '修改密码', key: 'password' }]} onReduceData={() => undefined} maxDisplayedItems={5} />
            </div>

            <div className='mg15' style={{ background: '#fff', padding: '15px' }}>
                <div>
                    <FormGroup
                        helperText="6-16位原密码"
                        label="原密码"
                        labelFor="text-input"
                        labelInfo="(必填)"
                    >
                        <TextField type="password" onChange={this.syncPassword} data-name='password1' />
                    </FormGroup>
                </div>

                <div className='mt10'>
                    <FormGroup
                        helperText="6-16位新密码"
                        label="新密码"
                        labelFor="text-input"
                        labelInfo="(必填)"
                    >
                        <TextField type="password" onChange={this.syncPassword} data-name='password2' />
                    </FormGroup>
                </div>

                <div className='mt10'>
                    <FormGroup
                        helperText="重复新密码"
                        label="新密码"
                        labelFor="text-input"
                        labelInfo="(必填)"
                    >
                        <TextField type="password" onChange={this.syncPassword} data-name='password3' />
                    </FormGroup>
                </div>

                <div className='mt10'>
                    <Button intent="Primary" onClick={this.update_password}>修改密码</Button>
                </div>
            </div>
        </div>);
    }
}

export default Password;