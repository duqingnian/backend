import React, { Component } from 'react';
import { Breadcrumb } from '@fluentui/react';
import { Label, Button, ControlGroup, InputGroup, Dialog, DialogBody, DialogFooter,TextArea } from "@blueprintjs/core";
import { HTMLSelect } from "@blueprintjs/core";
import Ajax from 'components/Ajax';
import { message } from 'antd';

class Tixian extends Component {
    state = {
        filter: {
            name: "",
        },
        tixians: [],
        pager: {
            page: 1,
            per: 15,
        },
        selected_tixian: {
            request_token: '',
        },
        confirm_dialog: {
            is_open: false,
            title: '',
            action: '',
            cn_action: '',
        },
        note: '',
    }

    componentDidMount() {
        this.load_tixian();
    }
    //加载提现
    load_tixian = () => {
        let that = this
        Ajax("tixian", {
            action: "pager",
            filter_name: that.state.filter.name,
            page: that.state.pager.page,
            per: that.state.pager.per,
        }, function (json) {
            if (0 === json.code) {
                that.setState({
                    tixians: json.data.tixians,
                })
            }
            else {
                message.error(json.msg);
            }
        })
    }

    //分页
    goto_pagination = (page) => {
        let that = this
        if (page <= 1) {
            page = 1;
        }
        if (page >= that.state.tixians.pager.pages) {
            page = that.state.tixians.pager.pages;
        }
        that.setState({ pager: Object.assign({}, that.state.pager, { page: page }) }, function () { that.load_tixian() })
    }

    //筛选
    filter = () => {
        let that = this
        that.load_tixian()
    }

    //重置筛选
    clear_filter = () => {
        let that = this
        that.setState({
            filter: {
                name: "",
            }
        }, function () {
            that.load_tixian()
        })
    }


    render() {
        return (<div>
            <div className="PageBreadcrumb" style={{ display: 'inline-block' }}>
                <Breadcrumb items={[{ text: '管理面板', key: 'adminPannel' }, { text: '提现管理', key: 'tixian' }, { text: '提现列表', key: 'tixian-index' }]} onReduceData={() => undefined} maxDisplayedItems={5} />
            </div>
            <div className='mg15 filter pr' style={{ height: '30px' }}>
                <ControlGroup {...this.state} className="pa" style={{ height: '30px', background: "transparent" }}>
                    <Label className="mr5">名称:</Label>
                    <InputGroup placeholder="名称" className="mr10" value={this.state.filter.name} onChange={(e) => { this.setState({ filter: Object.assign({}, this.state.filter, { name: e.target.value }) }) }} />
                    <Button icon="filter" intent="primary" className="mr10" onClick={this.filter}>筛选</Button>
                    <Button icon="filter-remove" onClick={this.clear_filter}>重置</Button>
                </ControlGroup>
                <div className='cc'></div>
            </div>

            <div className='flex mg15'>
                <div className='tixian-tree card topColor' style={{ width: "100%" }}>
                    {/*
                    <div className="flex mb10">
                        <span>提现列表 {'undefined' !== typeof (this.state.tixians.pager) ? '(' + this.state.tixians.pager.total + "条记录)" : ''}</span>
                        <div className="flex">
                            <Button onClick={this.open_create_dialog}>添加提现</Button>
                        </div>
                    </div>
                    */}
                    <div className="card_content">
                        <table className='model'>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>商户</th>
                                    <th>提现金额</th>
                                    <th>余额快照</th>
                                    <th>钱包地址</th>
                                    <th>状态</th>
                                    <th>IP</th>
                                    <th>备注</th>
                                    <th>时间</th>
                                    <th>操作</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    'undefined' !== typeof (this.state.tixians.rows) && this.state.tixians.rows.map((tixian) => {
                                        return <tr key={"tixian-" + tixian.id} className={''}>
                                            <td className='cp'>{tixian.id}</td>
                                            <td className='cp'>{tixian.merchant}</td>
                                            <td className='cp'>{tixian.amount}</td>
                                            <td className='cp'>
                                                <table>
                                                    <tbody>
                                                        <tr><td>发起快照:</td><td>{tixian.blance_snapshot}</td></tr>
                                                        <tr><td>处理快照:</td><td>{tixian.exec_blance_snapshot}</td></tr>
                                                    </tbody>
                                                </table>
                                            </td>
                                            <td className='cp'>{tixian.wallet}</td>
                                            <td>
                                                {'GENERATED' === tixian.status ? <Button>已创建</Button> : ''}
                                                {'PASS' === tixian.status ? <Button intent="Success">通过</Button> : ''}
                                                {'PROCESSING' === tixian.status ? <Button intent="Warning">处理中</Button> : ''}
                                                {'REJECTED' === tixian.status ? <Button intent="Danger">驳回</Button> : ''}
                                                {'ERROR' === tixian.status ? <Button intent="Danger">错误</Button> : ''}
                                            </td>
                                            <td className='cp'>
                                                <table>
                                                    <tbody>
                                                        <tr><td>发起IP:</td><td>{tixian.created_ip}</td></tr>
                                                        <tr><td>处理IP:</td><td>{tixian.exec_ip}</td></tr>
                                                    </tbody>
                                                </table>
                                            </td>
                                            <td className='cp'>
                                                <table>
                                                    <tbody>
                                                        <tr><td>发起备注:</td><td>{tixian.created_note}</td></tr>
                                                        <tr><td>处理备注:</td><td>{tixian.exec_note}</td></tr>
                                                    </tbody>
                                                </table>
                                            </td>
                                            <td className='cp'>
                                                <table>
                                                    <tbody>
                                                        <tr><td>发起时间:</td><td>{tixian.created_at}</td></tr>
                                                        <tr><td>处理时间:</td><td>{tixian.exec_at}</td></tr>
                                                    </tbody>
                                                </table>
                                            </td>
                                            <td style={{ width: '110px' }}>
                                                {'GENERATED' === tixian.status ? <Button intent="Success" icon="small-tick" onClick={() => { this.do_action('PASS', tixian) }}>通过</Button> : ''}
                                                {'GENERATED' === tixian.status ? <Button className="mt5" intent="Danger" icon="small-cross" onClick={() => { this.do_action('REJECTED', tixian) }}>驳回</Button> : ''}
                                            </td>
                                        </tr>
                                    })
                                }
                            </tbody>
                        </table>
                    </div>

                    <div className="Page flex mt15">
                        {
                            'undefined' !== typeof (this.state.tixians.pager) && <nav className="pagination-outer" aria-label="Page navigation">
                                <ul className="pagination">
                                    <li className="page-item"><Button onClick={() => { this.goto_pagination(1) }}>首页</Button></li>
                                    <li className="page-item"><Button onClick={() => { this.goto_pagination(parseInt(this.state.tixians.pager.page) - 1) }}>上一页</Button></li>
                                    {
                                        this.state.tixians.pager.range.map((p) => {
                                            return <li className="page-item" key={"_pagination_p_" + p}>
                                                <Button
                                                    intent={parseInt(p) === parseInt(this.state.tixians.pager.page) ? 'primary' : 'None'}
                                                    onClick={() => { this.goto_pagination(parseInt(p)) }}
                                                >{p}</Button>
                                            </li>
                                        })
                                    }
                                    <li className="page-item"><Button onClick={() => { this.goto_pagination(parseInt(this.state.tixians.pager.page) + 1) }}>下一页</Button></li>
                                    <li className="page-item"><Button onClick={() => { this.goto_pagination(parseInt(this.state.tixians.pager.pages)) }}>尾页</Button></li>
                                    <li className="page-item"><Button>{'undefined' !== typeof (this.state.tixians.pager) ? '(' + this.state.tixians.pager.total + "条记录)" : ''}</Button></li>
                                </ul>
                            </nav>
                        }
                        <HTMLSelect
                            value={this.state.pager.per}
                            onChange={(e) => {
                                this.setState({ pager: Object.assign({}, this.state.pager, { per: e.currentTarget.value }) }, function () { this.load_tixian() })
                            }}
                            options={[1, 5, 10, 15, 20, 30, 50, 100, 500, 1000]} />
                    </div>
                </div>
            </div>
            <Dialog
                title={this.state.confirm_dialog.title}
                icon="info-sign"
                isOpen={this.state.confirm_dialog.is_open}
                onClose={() => {
                    this.setState({
                        confirm_dialog: {
                            is_open: false,
                            title: "",
                        },
                    })
                }}
            >
                <DialogBody>
                    <table className='model'>
                        <tbody>
                            <tr>
                                <td>商户：</td>
                                <td>{this.state.selected_tixian.merchant}</td>
                            </tr>
                            <tr>
                                <td>金额：</td>
                                <td>{this.state.selected_tixian.amount}</td>
                            </tr>
                            <tr>
                                <td>钱包地址：</td>
                                <td>{this.state.selected_tixian.wallet}</td>
                            </tr>
                            <tr>
                                <td>发起IP：</td>
                                <td>{this.state.selected_tixian.created_ip}</td>
                            </tr>
                            <tr>
                                <td>发起时间：</td>
                                <td>{this.state.selected_tixian.created_at}</td>
                            </tr>
                            <tr>
                                <td>发起备注：</td>
                                <td>{this.state.selected_tixian.created_note}</td>
                            </tr>
                            <tr>
                                <td>操作备注：</td>
                                <td><TextArea style={{ width: '100%', height: '80px' }} placeholder="备注" value={this.state.note} onChange={(e) => { this.setState({ note: e.target.value }) }} /></td>
                            </tr>
                        </tbody>
                    </table>
                </DialogBody>
                <DialogFooter actions={<div>
                    <Button intent={"PASS" == this.state.confirm_dialog.action ? 'Success' : 'Danger'} text={"确定" + this.state.confirm_dialog.cn_action} onClick={this.exec_action} />
                    <Button text="关闭" onClick={() => {
                        this.setState({
                            confirm_dialog: {
                                is_open: false,
                                title: "",
                                action: '',
                                cn_action: '',
                            },
                        })
                    }} />
                </div>} />
            </Dialog>
        </div >);
    }

    //二次确认弹窗
    do_action = (_action, _object) => {
        let that = this
        let cn_action = '';
        if ('PASS' == _action) { cn_action = '通过'; }
        if ('REJECTED' == _action) { cn_action = '驳回'; }

        that.setState({
            confirm_dialog: {
                is_open: true,
                title: "确定执行 " + cn_action + " 操作吗?",
                action: _action,
                cn_action: cn_action,
            },
            selected_tixian: _object
        })
    }

    //确定执行通过或者驳回操作
    exec_action = () => {
        let that = this
        Ajax("tixian", { action: "exec_action", _action: that.state.confirm_dialog.action, note: that.state.note, request_token: that.state.selected_tixian.request_token }, function (json) {
            if (0 === json.code) {
                message.success(json.msg)
                that.setState({
                    confirm_dialog: {
                        is_open: false,
                        title: '',
                        action: '',
                        cn_action: '',
                    },
                    note: '',
                })
                that.load_tixian()
            }
            else {
                message.error(json.msg);
            }
        })
    }
}

export default Tixian;