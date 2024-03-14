import React, { Component } from 'react';
import { Breadcrumb, Pivot, PivotItem } from '@fluentui/react';
import { Label, MenuItem, Button, ControlGroup, InputGroup, Drawer, Classes, SegmentedControl, HTMLSelect, Dialog, DialogBody, DialogFooter, FormGroup } from "@blueprintjs/core";
import Ajax from 'components/Ajax';
import { message, Modal } from 'antd';
import { Select } from "@blueprintjs/select";
import date from 'components/Util/date'
import { DateRangeInput3 } from "@blueprintjs/datetime2";

const drawer_segmented_size = { 'W': '92%', 'M': '52%', 'S': '460px' }
const segmented_size = [{ label: "宽", value: "W", }, { label: "中", value: "M", }, { label: "窄", value: "S", },];

class Payout extends Component {
    state = {
        filter: {
            order_id: "",
            filter_ext: "",
            channel: { id: 0, name: '' },
            merchant: { id: 0, name: '' },
            filter_status: 'ALL',
            filter_date1: date.today(),
            filter_date2: date.today(),
        },
        orders: [],
        create_dialog: { isOpen: false },
        detail_drawer: { isOpen: false },
        selected_order: {
            request_token: "",
        },
        form: {
            request_token: "",
        },
        drawer_segmented: 'M',
        pager: {
            page: 1,
            per: 15,
        },
        merchant_notify_result: {
            is_open: false,
            merchant: { id: 0, name: '' },
            order: { id: 0, mno: '', pno: '' },
            result: { http_code: '', merchant_notify_url: '', ret: '' },
            time: '',
        },
        channels: [],
        merchants: [],
        total: {
            total_amount: 0,
            total_ramount: 0,
            total_cfee: 0,
            total_mfee: 0,
        },
        excel: '',
    }
    componentDidMount() {
        this.load_channels();
    }
    //加载全部通道
    load_channels = () => {
        let that = this
        Ajax("channel", {
            action: "load_all",
        }, function (json) {
            if (0 === json.code) {
                that.setState({
                    channels: json.data,
                }, function () {
                    that.load_merchants()
                })
            }
            else {
                message.error(json.msg);
            }
        })
    }
    //加载全部商户
    load_merchants = () => {
        let that = this
        Ajax("merchant", {
            action: "load_all",
        }, function (json) {
            if (0 === json.code) {
                that.setState({
                    merchants: json.data,
                }, function () {
                    that.load_orders()
                })
            }
            else {
                message.error(json.msg);
            }
        })
    }
    //加载订单
    load_orders = () => {
        let that = this
        Ajax("order", {
            action: "pager",
            bundle: "PAYOUT",
            excel: that.state.excel,
            page: that.state.pager.page,
            per: that.state.pager.per,
            filter_order_id: that.state.filter.order_id,
            filter_ext: that.state.filter.filter_ext,
            filter_channel: that.state.filter.channel.id,
            filter_merchant: that.state.filter.merchant.id,
            filter_status: that.state.filter.filter_status,
            filter_date1: that.state.filter.filter_date1,
            filter_date2: that.state.filter.filter_date2,
        }, function (json) {
            if (0 === json.code) {
                if ('' !== that.state.excel) {
                    window.open(json.url)
                } else {
                    that.setState({
                        orders: json.data.orders,
                        total: json.data.total,
                    })
                }
            }
            else {
                message.error(json.msg);
            }
        })
    }
    change_filter_date = (_date) => {
        let that = this
        let filter = that.state.filter
        filter.filter_date1 = date.dateFormat(_date[0])
        filter.filter_date2 = date.dateFormat(_date[1])
        that.setState({
            filter: filter
        })
    }
    //分页
    goto_pagination = (page) => {
        let that = this
        if (page <= 1) {
            page = 1;
        }
        if (page >= that.state.orders.pager.pages) {
            page = that.state.orders.pager.pages;
        }
        that.setState({ pager: Object.assign({}, this.state.pager, { page: page }) }, function () { that.load_orders() })
    }

    //筛选
    filter = (excel) => {
        let that = this
        that.setState({ excel: excel, pager: Object.assign({}, this.state.pager, { page: 1 }) }, function () { that.load_orders() })
    }

    //重置筛选
    clear_filter = () => {
        let that = this
        that.setState({
            filter: {
                order_id: "",
                filter_ext: "",
                channel: { id: 0, name: '' },
                merchant: { id: 0, name: '' },
                filter_status: 'ALL',
                filter_date1: date.today(),
                filter_date2: date.today(),
            }
        }, function () {
            that.load_orders()
        })
    }

    //同步字段
    set(obj, K, V) {
        let that = this
        that.setState({ obj: Object.assign({}, that.state[obj], { K: V }) })
    }

    //显示详情
    show_detail(request_token) {
        let that = this
        Ajax("order", { action: "detail", bundle: "PAYOUT", request_token: request_token }, function (json) {
            if (0 === json.code) {
                that.setState({
                    selected_order: json.data,
                    form: json.data,
                    detail_drawer: { isOpen: true },
                })
            }
            else {
                message.error(json.msg);
            }
        })
    }

    //关闭详情
    hide_detail = () => {
        let that = this
        that.setState({
            detail_drawer: { isOpen: false },
        })
    }


    render() {
        return (<div>
            <div className="PageBreadcrumb" style={{ display: 'inline-block' }}>
                <Breadcrumb items={[{ text: '管理面板', key: 'adminPannel' }, { text: '订单', key: 'order' }, { text: '代付', key: 'order-index' }]} onReduceData={() => undefined} maxDisplayedItems={5} />
            </div>

            <div>
                <div className='mg15 filter' style={{ alignItems: 'center' }}>
                    <ControlGroup {...this.state} style={{ justifyContent: 'space-between' }}>
                        <div className='flex'>
                            <Label className="mr5">订单号:</Label>
                            <InputGroup placeholder="订单号" className="mr10" value={this.state.filter.order_id} onChange={(e) => { this.setState({ filter: Object.assign({}, this.state.filter, { order_id: e.target.value }) }) }} />

                            <Label className="mr5">通道:</Label>
                            <Select
                                className="mr10"
                                items={this.state.channels}
                                itemPredicate={(query, channel) => {
                                    if ('' === query) {
                                        return true
                                    }
                                    return ((channel.id + "," + channel.name).indexOf(query.toLowerCase()) >= 0);
                                }}
                                itemRenderer={(channel) => {
                                    return (
                                        <MenuItem
                                            active={channel.id === this.state.filter.channel.id}
                                            disabled={false}
                                            key={"filter_channel_" + channel.id}
                                            label={channel.name}
                                            onClick={() => {
                                                this.setState({ filter: Object.assign({}, this.state.filter, { channel: channel }) })
                                            }}
                                            onFocus={() => { }}
                                            roleStructure="listoption"
                                            text={`${channel.name}`}
                                        />
                                    );
                                }}
                                noResults={<MenuItem disabled={true} text="暂无数据" roleStructure="listoption" />}
                                onItemSelect={() => { }}
                            >
                                <Button text={this.state.filter.channel.id !== 0 ? this.state.filter.channel.name : '全部通道'} rightIcon="double-caret-vertical" placeholder="筛选通道" />
                            </Select>

                            <Label className="mr5">商户:</Label>
                            <Select
                                className="mr10"
                                items={this.state.merchants}
                                itemPredicate={(query, merchant) => {
                                    if ('' === query) {
                                        return true
                                    }
                                    return ((merchant.id + "," + merchant.name).indexOf(query.toLowerCase()) >= 0);
                                }}
                                itemRenderer={(merchant) => {
                                    return (
                                        <MenuItem
                                            active={merchant.id === this.state.filter.merchant.id}
                                            disabled={false}
                                            key={"filter_merchant_" + merchant.id}
                                            label={merchant.name}
                                            onClick={() => {
                                                this.setState({ filter: Object.assign({}, this.state.filter, { merchant: merchant }) })
                                            }}
                                            onFocus={() => { }}
                                            roleStructure="listoption"
                                            text={`${merchant.name}`}
                                        />
                                    );
                                }}
                                noResults={<MenuItem disabled={true} text="暂无数据" roleStructure="listoption" />}
                                onItemSelect={() => { }}
                            >
                                <Button text={this.state.filter.merchant.id !== 0 ? this.state.filter.merchant.name : '全部商户'} rightIcon="double-caret-vertical" placeholder="筛选商户" />
                            </Select>

                            <Label className="ml5 mr5">扩展:</Label>
                            <InputGroup placeholder="扩展信息" className="mr10" value={this.state.filter.filter_ext} onChange={(e) => { this.setState({ filter: Object.assign({}, this.state.filter, { filter_ext: e.target.value }) }) }} />
                        </div>

                        <div className='flex'>
                            <Label className="mr5">时间范围:</Label>
                            <DateRangeInput3
                                locale="zh-CN"
                                allowSingleDayRange={true}
                                onChange={this.change_filter_date}
                                footerElement={undefined}
                                timePickerProps={undefined}
                                value={[new Date(this.state.filter.filter_date1), new Date(this.state.filter.filter_date2)]}
                            />
                        </div>
                    </ControlGroup>
                </div>
            </div>

            <div className='flex' style={{ marginLeft: '15px', marginRight: '15px' }}>
                <SegmentedControl
                    options={[
                        { label: "全部", value: "ALL", },
                        { label: "已创建", value: "GENERATED", },
                        { label: "成功", value: "SUCCESS", },
                        { label: "失败", value: "FAIL", },
                        { label: "其他", value: "OTHER", },
                    ]}
                    value={this.state.filter.filter_status}
                    onValueChange={(status) => {
                        this.setState({ filter: Object.assign({}, this.state.filter, { filter_status: status }) })
                    }}
                />
                <div className='flex'>
                    <Button icon="filter" intent="Primary" onClick={() => { this.filter('') }}>筛选</Button>
                    <Button icon="filter-remove" className="ml10" onClick={this.clear_filter}>重置</Button>
                    <Button icon="panel-table" intent="Success" className="ml10" onClick={() => { this.filter('excel') }}>导出Excel</Button>
                </div>
            </div>

            <div className='flex mg15'>
                <div className='order-tree card topColor' style={{ width: "100%" }}>
                    <div className="flex mb10" style={{ color: '#6c6b6b' }}>
                        <div>订单列表 {'undefined' !== typeof (this.state.orders.pager) ? '(' + this.state.orders.pager.total + "条记录)" : ''}</div>
                        <div>
                            金额: {this.state.total.total_amount},
                            实际金额: {this.state.total.total_ramount},
                            通道手续费: {this.state.total.total_cfee},
                            商户手续费: {this.state.total.total_mfee}
                        </div>
                    </div>
                    <div className="card_content">
                        <table className='model'>
                            <thead>
                                <tr>
                                    <th>编号</th>
                                    <th>通道</th>
                                    <th>商户</th>
                                    <th>金额</th>
                                    <th>手续费</th>
                                    <th>订单号</th>
                                    <th>扩展</th>
                                    <th>状态</th>
                                    <th>回调</th>
                                    <th>创建时间</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    'undefined' !== typeof (this.state.orders.rows) && this.state.orders.rows.map((order) => {
                                        return <tr key={"order-" + order.id} className={''}>
                                            <td className='cp'><Button minimal={true} onClick={() => { this.show_detail(order.request_token) }}>{order.id}</Button></td>
                                            <td className='cp'>{order.channel}</td>
                                            <td className='cp'>{order.merchant}</td>
                                            <td className='cp'>{order.amount}</td>
                                            <td className='cp'>通道:{order.cfee}<br />商户:{order.mfee}</td>
                                            <td className='cp'>
                                                <table style={{ margin: '0 auto' }}>
                                                    <tbody>
                                                        <tr><td>通道:</td><td>{order.cno}</td></tr>
                                                        <tr><td>平台:</td><td>{order.pno}</td></tr>
                                                        <tr><td>商户:</td><td>{order.mno}</td></tr>
                                                    </tbody>
                                                </table>
                                            </td>
                                            <td className='cp'>
                                                <table style={{ margin: '0 auto' }}>
                                                    <tbody>
                                                        {
                                                            order.channel_show_columns.map((col) => {
                                                                return <tr key={order.id + '_csc_' + col.pcolumn}><td>{col.text}:</td><td>{col.value}</td></tr>
                                                            })
                                                        }
                                                    </tbody>
                                                </table>
                                            </td>
                                            <td className='cp tc'>{
                                                'GENERATED' === order.status
                                                    ? <Button minimal={true} onClick={() => { this.sync_channel_status(order) }}>已创建</Button>
                                                    : ('SUCCESS' === order.status
                                                        ? <Button intent="Success" minimal={true} onClick={() => { this.sync_channel_status(order) }}>{order.status}</Button>
                                                        : <Button onClick={() => { this.show_lasterror(order) }} intent="Danger" minimal={false} >{order.status}</Button>)
                                            }</td>
                                            <td className='cp'>
                                                <table style={{ margin: '0 auto' }}>
                                                    <tbody>
                                                    <tr>
                                                            <td>通道:</td>
                                                            <td>
                                                                {
                                                                    1 === parseInt(order.channel_notify)
                                                                        ? <Button intent="Success" icon="small-tick" minimal={true} onClick={()=>{this.sync_channel_status(order)}}></Button>
                                                                        : <Button minimal={true} intent="Danger" onClick={()=>{this.sync_channel_status(order)}}>未通知</Button>
                                                                }
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td>商户:</td>
                                                            <td>
                                                                {
                                                                    -1 === parseInt(order.merchant_notify.http_code)
                                                                        ? <Button minimal={true} onClick={() => { this.send_notify(order,'HAND_RESEND', '重发回调') }}>未通知</Button>
                                                                        : (
                                                                            200 === parseInt(order.merchant_notify.http_code)
                                                                                ? (
                                                                                    "success" === order.merchant_notify.ret
                                                                                        ? <Button intent="Success" icon="small-tick" minimal={true} onClick={() => { this.send_notify(order,'HAND_RESEND', '重发回调') }}></Button>
                                                                                        : <Button intent="Warning" minimal={false} onClick={() => { this.send_notify(order,'HAND_RESEND', '重发回调') }}>200-{order.merchant_notify.ret}</Button>
                                                                                )
                                                                                : <Button intent="Danger" minimal={false} onClick={() => { this.send_notify(order,'HAND_RESEND', '重发回调') }}>{order.merchant_notify.http_code}-{order.merchant_notify.ret}</Button>
                                                                        )
                                                                }
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </td>
                                            <td className='cp'>
                                                <p className='ubuntu fs12'>{order.created_at.substr(0, 10)}</p>
                                                <p className='ubuntu fs12'>{order.created_at.substr(11)}</p>
                                            </td>
                                        </tr>
                                    })
                                }
                            </tbody>
                        </table>
                    </div>

                    <div className="Page flex mt15">
                        {
                            'undefined' !== typeof (this.state.orders.pager) && <nav className="pagination-outer" aria-label="Page navigation">
                                <ul className="pagination">
                                    <li className="page-item"><Button onClick={() => { this.goto_pagination(1) }}>首页</Button></li>
                                    <li className="page-item"><Button onClick={() => { this.goto_pagination(parseInt(this.state.orders.pager.page) - 1) }}>上一页</Button></li>
                                    {
                                        this.state.orders.pager.range.map((p) => {
                                            return <li className="page-item" key={"_pagination_p_" + p}>
                                                <Button
                                                    intent={parseInt(p) === parseInt(this.state.orders.pager.page) ? 'primary' : 'None'}
                                                    onClick={() => { this.goto_pagination(parseInt(p)) }}
                                                >{p}</Button>
                                            </li>
                                        })
                                    }
                                    <li className="page-item"><Button onClick={() => { this.goto_pagination(parseInt(this.state.orders.pager.page) + 1) }}>下一页</Button></li>
                                    <li className="page-item"><Button onClick={() => { this.goto_pagination(parseInt(this.state.orders.pager.pages)) }}>尾页</Button></li>
                                </ul>
                            </nav>
                        }
                        <HTMLSelect
                            value={this.state.pager.per}
                            onChange={(e) => {
                                this.setState({ pager: Object.assign({}, this.state.pager, { per: e.currentTarget.value }) }, function () { this.load_orders() })
                            }}
                            options={[1, 5, 10, 15, 20, 30, 50, 100, 500, 1000]} />
                    </div>
                </div>
            </div>

            <Dialog 
                title={"回调结果 - " + this.state.merchant_notify_result.order.mno} 
                icon="info-sign" 
                isOpen={this.state.merchant_notify_result.is_open}
                onClose={() => {
                    this.setState({
                        merchant_notify_result: {
                            is_open: false,
                            merchant: { id: 0, name: '' },
                            order: { id: 0, mno: '', pno: '' },
                            result: { http_code: '', merchant_notify_url: '', ret: '' },
                            time: ''
                        }
                    })
                }}
                >
                <DialogBody>
                    <div>
                        <FormGroup className="mb10" label="商户" labelFor="text-input">
                            <InputGroup id="text-input" value={this.state.merchant_notify_result.merchant.name} />
                        </FormGroup>

                        <FormGroup className="mb10" label="商户订单号" labelFor="text-input">
                            <InputGroup id="text-input" value={this.state.merchant_notify_result.order.mno} />
                        </FormGroup>

                        <FormGroup className="mb10" label="平台订单号" labelFor="text-input">
                            <InputGroup id="text-input" value={this.state.merchant_notify_result.order.pno} />
                        </FormGroup>

                        <FormGroup className="mb10" label="商户回调地址" labelFor="text-input">
                            <InputGroup id="text-input" value={this.state.merchant_notify_result.result.merchant_notify_url} />
                        </FormGroup>

                        <FormGroup className="mb10" label="回调状态码" labelFor="text-input">
                            <InputGroup id="text-input" value={this.state.merchant_notify_result.result.http_code} />
                        </FormGroup>

                        <FormGroup label="回调返回内容" labelFor="text-input">
                            <InputGroup id="text-input" value={this.state.merchant_notify_result.result.ret} />
                        </FormGroup>

                        <FormGroup label="时间:" labelFor="text-input">
                            <InputGroup id="text-input" value={this.state.merchant_notify_result.time} />
                        </FormGroup>
                    </div>
                </DialogBody>
                <DialogFooter actions={<Button intent="primary" text="Close" onClick={() => {
                    this.setState({
                        merchant_notify_result: {
                            is_open: false,
                            merchant: { id: 0, name: '' },
                            order: { id: 0, mno: '', pno: '' },
                            result: { http_code: '', merchant_notify_url: '', ret: '' },
                            time: ''
                        }
                    })
                }} />} />
            </Dialog>

            <Drawer
                icon="info-sign"
                onClose={this.hide_detail}
                title={"通道详情 - " + this.state.selected_order.id + " - " + (1 == this.state.selected_order.is_test ? '测试单' : '正式单') + ' - ' + this.state.selected_order.status}
                isOpen={this.state.detail_drawer.isOpen}
                style={{ width: drawer_segmented_size[this.state.drawer_segmented] }}
            >
                <div className={Classes.DRAWER_BODY}>
                    {
                        '' !== this.state.form.request_token ? <div className={Classes.DIALOG_BODY}>
                            <Pivot aria-label="订单信息" defaultSelectedKey="basic">
                                <PivotItem headerText="基本信息" key="basic">
                                    <div className='pd15' style={{ 'background': '#aecff12b' }}>
                                        <div className='row mb10'>
                                            <Label>订单状态: </Label>
                                            <InputGroup placeholder="订单状态: " className="mr10" value={this.state.selected_order.status} />
                                        </div>
                                        <div className='row mb10'>
                                            <Label>通道订单号: </Label>
                                            <InputGroup placeholder="通道订单号: " className="mr10" value={this.state.selected_order.cno} />
                                        </div>
                                        <div className='row mb10'>
                                            <Label>平台订单号: </Label>
                                            <InputGroup placeholder="平台订单号: " className="mr10" value={this.state.selected_order.pno} />
                                        </div>
                                        <div className='row mb10'>
                                            <Label>商户订单号: </Label>
                                            <InputGroup placeholder="商户订单号: " className="mr10" value={this.state.selected_order.mno} />
                                        </div>
                                        <div className='row mb10'>
                                            <Label>订单金额: </Label>
                                            <InputGroup placeholder="订单金额: " className="mr10" value={this.state.selected_order.amount} />
                                        </div>
                                        <div className='row mb10'>
                                            <Label>通道手续费: </Label>
                                            <InputGroup placeholder="通道手续费: " className="mr10" value={this.state.selected_order.amount + "×" + this.state.selected_order.cpct + "%+" + this.state.selected_order.csf + "=" + this.state.selected_order.cfee} />
                                        </div>
                                        <div className='row mb10'>
                                            <Label>商户手续费: </Label>
                                            <InputGroup placeholder="商户手续费: " className="mr10" value={this.state.selected_order.amount + "×" + this.state.selected_order.mpct + "%+" + this.state.selected_order.msf + "=" + this.state.selected_order.mfee} />
                                        </div>

                                        <div className='row mb10'>
                                            <Label>国家货币: </Label>
                                            <InputGroup placeholder="国家货币: " className="mr10" value={this.state.selected_order.country + " - " + this.state.selected_order.currency} />
                                        </div>

                                        <div className='row mb10'>
                                            <Label>备注: </Label>
                                            <InputGroup placeholder="备注" className="mr10" value={this.state.selected_order.note} />
                                        </div>
                                    </div>
                                </PivotItem>

                                <PivotItem headerText="流程数据" key="process">
                                    <div className='pd15' style={{ 'background': '#aecff12b' }}>
                                        {
                                            ("undefined" !== typeof (this.state.selected_order.process_list) && this.state.selected_order.process_list.length > 0) && this.state.selected_order.process_list.map((process) => {
                                                return <table className='model mb15' key={"process_" + process.bundle}>
                                                    <tbody>
                                                        <tr><td style={{ textAlign: 'left' }}><div className='flex'><span>{process.title}</span><span>{process.time}</span></div></td></tr>

                                                        <tr>
                                                            <td style={{ textAlign: 'left' }}>{decodeURIComponent(process.data)}</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            })
                                        }
                                    </div>
                                </PivotItem>

                                <PivotItem headerText="商户回调数据" key="merchant_notify_log">
                                    <div className='pd15' style={{ 'background': '#aecff12b' }}>
                                        {
                                            ("undefined" !== typeof (this.state.selected_order.merchant_notify_data) && this.state.selected_order.merchant_notify_data.length > 0) && this.state.selected_order.merchant_notify_data.map((nd) => {
                                                return <table className='model mb15' key={"merchant_notify_data_" + nd.id}>
                                                    <tbody>
                                                        <tr><td style={{ textAlign: 'left' }}><div className='flex'><span>频率:{nd.delay}</span><span>预计发送时间:{nd.target_time}</span></div></td></tr>
                                                        <tr><td style={{ textAlign: 'left' }}>平台发送数据:{nd.data}</td></tr>
                                                        <tr><td style={{ textAlign: 'left' }}><div className='flex'><span>商户回调地址：{nd.merchant_notify_url}</span><span>商户返回http状态：{nd.ret_http_code}</span></div></td></tr>
                                                        <tr><td style={{ textAlign: 'left' }}>商户返回信息:{nd.ret}</td></tr>
                                                    </tbody>
                                                </table>
                                            })
                                        }
                                    </div>
                                </PivotItem>
                            </Pivot>
                        </div> : ''
                    }
                </div>
                <div className={Classes.DRAWER_FOOTER}>
                    <div className='flex'>
                        <SegmentedControl
                            options={segmented_size}
                            value={this.state.drawer_segmented}
                            onValueChange={(_size) => { this.setState({ drawer_segmented: _size }) }}
                        />
                        <div>
                        <Button className="ml15" intent="Warning" icon="refresh" onClick={()=>{this.sync_channel_status(this.state.selected_order)}}>同步通道状态</Button>

                            <Button className="ml15" intent="Primary" onClick={() => { this.send_notify(this.state.selected_order,'HAND_RESEND', '重发回调') }}>重发回调</Button>

                            {
                                1 == this.state.selected_order.is_test ? <Button className="ml15" intent="Success" onClick={() => { this.send_notify(this.state.selected_order,'MONI_SUCC', '模拟成功') }}>模拟成功</Button> : ''
                            }
                            {
                                1 == this.state.selected_order.is_test ? <Button className="ml15" intent="Danger" onClick={() => { this.send_notify(this.state.selected_order,'MONI_FAIL', '模拟失败') }}>模拟失败</Button> : ''
                            }
                        </div>
                    </div>
                </div>
            </Drawer>

        </div>);
    }

    show_lasterror = (order) => {
        Modal.error({
            title: "订单错误详情",
            content: order.last_error,
            okText: '确定',
            cancelText: '取消',
        })
    }

    sync_channel_status = (order) => {
        let that = this
        Modal.confirm({
            title: '二次确认 '+order.pno,
            content: "确定同步通道状态吗?",
            okText: '同步',
            cancelText: '取消',
            onOk() {
                Ajax("order", { action: "sync_channel_status", bundle: "PAYOUT", request_token: order.request_token }, function (json) {
                    if (0 === json.code) {
                        message.success(json.msg)
                        that.load_orders()
                    }
                    else {
                        message.error(json.msg);
                    }
                })
            },
        })
    }

    send_notify = (order,exchange, tip) => {
        let that = this
        Modal.confirm({
            title: '二次确认 '+order.pno,
            content: "确定执行:" + tip + "操作吗?",
            okText: '确认' + tip,
            cancelText: '取消',
            onOk() {
                Ajax("order", { action: "send_notify", bundle: "PAYOUT", exchange: exchange, request_token: order.request_token }, function (json) {
                    if (0 === json.code) {
                        that.setState({
                            merchant_notify_result: json.merchant_notify_result
                        })
                    }
                    else {
                        message.error(json.msg);
                    }
                })
            },
        })
    }
}

export default Payout;