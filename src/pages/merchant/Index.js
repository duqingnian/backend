import React, { Component } from 'react';
import { Breadcrumb, Pivot, PivotItem, TextField, DefaultButton, PrimaryButton } from '@fluentui/react';
import { Popover, Label, SwitchCard, Button, FormGroup, InputGroup, MenuItem } from "@blueprintjs/core";
import { Dialog, DialogBody, DialogFooter, Drawer, Classes, Switch, SegmentedControl, HTMLSelect, H5, Intent } from "@blueprintjs/core";
import { Alignment, Navbar, Tabs, Tab } from "@blueprintjs/core";
import { Select } from "@blueprintjs/select";
import Ajax from 'components/Ajax';
import { Modal, Upload, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import commafy from 'components/Util/commafy'
import Statistics from './Statistics';

const category_map = ["-", "一类", "二类", "三类"]
const drawer_segmentedSize = { 'W': '92%', 'M': '760px', 'S': '460px' }
const segmented_size = [{ label: "宽", value: "W", }, { label: "中", value: "M", }, { label: "窄", value: "S", },];
const APP_CONFIG = JSON.parse(localStorage.getItem("APP_CONFIG"))

class Index extends Component {
    state = {
        filter: {
            name: "",
            category: { key: 0, text: "" },
            country: { key: "", text: "" },
            proxy: { key: "", text: "" },
        },
        channels: [],
        countries: [],
        proxys: [],
        merchants: [],
        create_dialog: { isOpen: false },
        detail_drawer: { isOpen: false },
        selected_merchant: {
            name: "",
            account: "",
            request_token: "",
        },
        form: {
            action: '',
            request_token: "",
            name: "",
            account: "",
            password: "",
            category: { key: 0, text: "" },
            country: { key: "", text: "" },
            _category: '',
            _country: '',
            is_test: true,
            is_active: true,
            ip_table: [],
            amount: 0,
            df_pool: 0,
            freeze_pool: 0,
            test_amount: 0,
            test_df_pool: 0,
            dispatch: { add: { pager: {} }, minus: { pager: {} } },
            google_secret: '',
            vip_google_secret: '',
            logo: [{
                file: '',
                src: '',
            }]
        },
        drawer_segmented: 'W',
        pager: {
            page: 1,
            per: 15,
        },
        new_channel: {
            PAYIN: {
                channel: { id: 0, name: '请选择通道', request_token: '' },
                name: "",
                pct: 0.00,
                sf: 0.00,
                min: 0.00,
                max: 0.00,
                pay_limit: 0,
                out_limit: 0,
                is_active: false,
            },
            PAYOUT: {
                channel: { id: 0, name: '请选择通道', request_token: '' },
                name: "",
                pct: 0.00,
                sf: 0.00,
                min: 0.00,
                max: 0.00,
                pay_limit: 0,
                out_limit: 0,
                is_active: false,
            }
        },
        //商户详情 - 通道 popover
        popover: {},
        set_release_popover: undefined,
        set_test_popover: undefined,
        ip: '',
        freeze_blance: '',
        unfreeze_blance: '',

        //下发
        dispatch: {
            curr_tabid: "add",
            amount: 0,
            note: '',
        },
        dispatch_page_filter: {
            page: 1,
            per: 15,
        },
        dispatch_pager: {},

        segment: {
            is_test: '',
            is_active: '',
            runable: '',
            has_proxy: '',
        },
        files: [],

        preview: {
            open: false,
            src: '',
            alt: '',
        },

        pay_methods: [],
        pay_method_dialog: {
            is_open: false,
            bundle: '',
            mcid: '',
        },

        pay_items: [],
        pay_build_dialog: { is_open: false, bundle: '', mcid: '' },
    }

    componentDidMount() {
        this.load_counties();
    }
    //加载国家
    load_counties = () => {
        let that = this
        Ajax("country", {
            action: "load_all",
        }, function (json) {
            if (0 === json.code) {
                that.setState({
                    countries: json.data.countries,
                })
                that.load_proxys()
            }
            else {
                message.error(json.msg);
            }
        })
    }

    //加载代理
    load_proxys = () => {
        let that = this
        Ajax("proxy", {
            action: "load_all",
        }, function (json) {
            if (0 === json.code) {
                that.setState({
                    proxys: json.data.proxys,
                })
                that.load_merchant()
            }
            else {
                message.error(json.msg);
            }
        })
    }

    //加载商户
    load_merchant = () => {
        let that = this
        Ajax("merchant", {
            action: "pager",
            filter: JSON.stringify(that.state.filter),
            page: that.state.pager.page,
            per: that.state.pager.per,
            segment: JSON.stringify(that.state.segment)
        }, function (json) {
            if (0 === json.code) {
                that.setState({
                    merchants: json.data.merchants,
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
        if (page >= that.state.merchants.pager.pages) {
            page = that.state.merchants.pager.pages;
        }
        that.setState({ pager: Object.assign({}, that.state.pager, { page: page }) }, function () { that.load_merchant() })
    }

    //筛选
    filter = () => {
        let that = this
        that.load_merchant()
    }

    //重置筛选
    clear_filter = () => {
        let that = this
        that.setState({
            filter: {
                name: "",
                category: { key: 0, text: "" },
                country: { key: "", text: "" },
                proxy: { key: "", text: "" },
            },
            segment: {
                is_test: '',
                is_active: '',
                runable: '',
                has_proxy: '',
            },
        }, function () {
            that.load_merchant()
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
        Ajax("channel", { action: "all" }, function (json) {
            if (0 === json.code) {
                that.setState({
                    channels: json.data,
                }, that._show_detail(request_token))
            }
            else {
                message.error(json.msg);
            }
        })
    }

    _show_detail(request_token) {
        let that = this
        Ajax("merchant", { action: "detail", request_token: request_token }, function (json) {
            if (0 === json.code) {
                that.setState({
                    selected_merchant: json.data,
                    form: json.data,
                    detail_drawer: { isOpen: true },
                    files: json.data.logo,
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
            set_release_popover: undefined,
        })
    }

    //打开新建弹窗
    open_create_dialog = () => {
        let that = this
        that.setState({
            create_dialog: { isOpen: true },
            form: {
                action: 'create',
                request_token: "",
                name: "",
                account: "",
                password: "123456",
                category: { key: 0, text: "" },
                country: { key: "", text: "" },
                _category: '',
                _country: '',
                is_test: true,
                is_active: true,
            }
        })
    }

    //关闭新建弹窗
    close_create_dialog = () => {
        let that = this
        that.setState({
            create_dialog: { isOpen: false }
        })
    }

    //创建、更新
    post = () => {
        let that = this
        if ('' === this.state.form.name) {
            message.error("名称不能为空")
        } else if ('' === this.state.form.account) {
            message.error("别名不能为空")
        } else if (0 === parseInt(this.state.form.category.key)) {
            message.error("请选择分类")
        } else if ('' === this.state.form.country) {
            message.error("请选择国家")
        } else {
            let postData = that.state.form
            postData.action = "create"
            postData._category = postData.category.key
            postData._country = postData.country.key
            postData._proxy = 0
            if ('' !== postData.request_token) {
                postData._proxy = postData.proxy.key
            }
            Ajax("merchant", postData, function (json) {
                if (0 === json.code) {
                    that.close_create_dialog();
                    that.hide_detail();
                    that.load_merchant();
                    message.success(json.msg);
                } else {
                    message.error(json.msg);
                }
            })
        }
    }

    //添加代收
    add_channel = (bundle) => {
        let that = this

        if ('' === that.state.new_channel[bundle].channel.request_token) {
            message.error("请选择通道")
        }
        else {
            let _channel = {}
            _channel.action = "add_channel"
            _channel.bundle = bundle
            _channel.merchant_id = that.state.selected_merchant.request_token
            _channel.channel_id = that.state.new_channel[bundle].channel.request_token
            _channel.name = that.state.new_channel[bundle].name
            _channel.pct = that.state.new_channel[bundle].pct
            _channel.sf = that.state.new_channel[bundle].sf
            _channel.min = that.state.new_channel[bundle].min
            _channel.max = that.state.new_channel[bundle].max
            _channel.pay_limit = that.state.new_channel[bundle].pay_limit
            _channel.out_limit = that.state.new_channel[bundle].out_limit
            _channel.is_active = that.state.new_channel[bundle].is_active

            Ajax("merchant", _channel, function (json) {
                if (0 === json.code) {
                    message.success(json.msg)
                    that._show_detail(that.state.selected_merchant.request_token)
                    let new_channel = that.state.new_channel
                    new_channel[bundle] = {
                        channel: { id: 0, name: '请选择通道', request_token: '' },
                        name: "",
                        pct: 0.00,
                        sf: 0.00,
                        min: 0.00,
                        max: 0.00,
                        is_active: false,
                    }
                    that.setState({
                        new_channel: new_channel
                    })
                } else {
                    message.error(json.msg);
                }
            })
        }
    }

    //删除商户的通道
    remove_channel = (mcid) => {
        let that = this
        Ajax("merchant", { action: "remove_channel", mcid: mcid }, function (json) {
            if (0 === json.code) {
                message.success(json.msg)
                that._show_detail(that.state.selected_merchant.request_token)
            } else {
                message.error(json.msg);
            }
        })
    }

    //重置限额
    reset_channel_limit = (mcid) => {
        let that = this
        Ajax("merchant", { action: "reset_channel_limit", mid: that.state.selected_merchant.request_token, mcid: mcid }, function (json) {
            if (0 === json.code) {
                message.success(json.msg)
                that._show_detail(that.state.selected_merchant.request_token)
            } else {
                message.error(json.msg);
            }
        })
    }

    //同步商户通道字段
    sync_mc = (bundle, mcid, k, v) => {
        let that = this
        let _select_merchat = that.state.selected_merchant
        for (let i = 0; i < _select_merchat.channels[bundle].length; i++) {
            if (parseInt(_select_merchat.channels[bundle][i].id) === parseInt(mcid)) {
                _select_merchat.channels[bundle][i][k] = v
            }
        }
        that.setState({ selected_merchant: _select_merchat })
    }

    //同步支付方式设置
    sync_pm = (method, pmid, k, v) => {
        let that = this
        let pms = that.state.pay_methods
        for (let i = 0; i < pms.length; i++) {
            if (parseInt(pms[i].id) === parseInt(pmid) && method === pms[i].method) {
                pms[i][k] = v
            }
        }
        that.setState({ pay_methods: pms })
    }

    //修改mc状态
    change_mc_state = (bundle, mcid, state) => {
        let that = this
        Ajax("merchant", { action: "change_mc_state", bundle: bundle, mcid: mcid, state: state }, function (json) {
            if (0 === json.code) {
                message.success(json.msg)
                that._show_detail(that.state.selected_merchant.request_token)
            } else {
                message.error(json.msg);
            }
        })
    }

    //修改支付方式
    change_pm_state = (type, pmid, state) => {
        let that = this
        Ajax("merchant", { action: "change_pm_state", type: type, pmid: pmid, state: state }, function (json) {
            if (0 === json.code) {
                message.success(json.msg)
                that.open_pay_method_dialog(that.state.pay_method_dialog.bundle, that.state.pay_method_dialog.mcid)
            } else {
                message.error(json.msg);
            }
        })
    }

    //转换成正式账号
    set_release(merchant_request_token) {
        let that = this
        Ajax("merchant", { action: "set_release", request_token: merchant_request_token }, function (json) {
            if (0 === json.code) {
                message.success(json.msg)
                that.setState({
                    set_release_popover: undefined,
                })
                that._show_detail(that.state.selected_merchant.request_token)
                that.load_merchant()
            } else {
                message.error(json.msg);
            }
        })
    }

    set_test(merchant_request_token) {
        let that = this
        Ajax("merchant", { action: "set_test", request_token: merchant_request_token }, function (json) {
            if (0 === json.code) {
                message.success(json.msg)
                that.setState({
                    set_test_popover: undefined,
                })
                that._show_detail(that.state.selected_merchant.request_token)
                that.load_merchant()
            } else {
                message.error(json.msg);
            }
        })
    }

    //修改通道参数
    update_mc = (bundle, mcid) => {
        let that = this
        let _select_merchat = that.state.selected_merchant
        for (let i = 0; i < _select_merchat.channels[bundle].length; i++) {
            if (parseInt(_select_merchat.channels[bundle][i].id) === parseInt(mcid)) {
                let mc = _select_merchat.channels[bundle][i]
                mc.action = "update_mc"
                mc.bundle = bundle
                Ajax("merchant", mc, function (json) {
                    if (0 === json.code) {
                        message.success(json.msg)
                        that._show_detail(that.state.selected_merchant.request_token)
                    } else {
                        message.error(json.msg);
                    }
                })
                break;
            }
        }
    }

    //设置商户通道为默认
    set_mc_default = (bundle, mcid) => {
        let that = this
        Ajax("merchant", { action: "set_mc_default", bundle: bundle, mcid: mcid }, function (json) {
            if (0 === json.code) {
                message.success(json.msg)
                that._show_detail(that.state.selected_merchant.request_token)
            } else {
                message.error(json.msg);
            }
        })
    }

    render() {
        return (<div>
            <div className="PageBreadcrumb" style={{ display: 'inline-block' }}>
                <Breadcrumb items={[{ text: '管理面板', key: 'adminPannel' }, { text: '商户管理', key: 'merchant' }, { text: '商户列表', key: 'merchant-index' }]} onReduceData={() => undefined} maxDisplayedItems={5} />
            </div>
            <div className='mg15 flex filter pr' style={{ height: '32px' }}>
                <div className='flex'>
                    {
                        this._render_category("_filter", (category) => { this.setState({ filter: Object.assign({}, this.state.filter, { category: category }) }) }, this.state.filter.category)
                    }
                    {
                        this._render_counties("_filter", (country) => { this.setState({ filter: Object.assign({}, this.state.filter, { country: country }) }) }, this.state.filter.country)
                    }
                    {
                        this._render_proxy("_filter", (proxy) => { this.setState({ filter: Object.assign({}, this.state.filter, { proxy: proxy }) }) }, this.state.filter.proxy)
                    }

                    <Label className="mr5">名称:</Label>
                    <InputGroup placeholder="名称" className="mr10" value={this.state.filter.name} onChange={(e) => { this.setState({ filter: Object.assign({}, this.state.filter, { name: e.target.value }) }) }} />
                </div>
                <div>
                    <Button intent="primary" icon="filter" className="mr10" onClick={this.filter}>筛选</Button>
                    <Button icon="filter-remove" onClick={this.clear_filter}>重置</Button>
                </div>
            </div>

            <div className='flex mg15'>
                <div className='merchant-tree card topColor' style={{ width: "100%" }}>
                    <div className="flex mb10">
                        <div className='flex'>
                            <SegmentedControl
                                options={[
                                    { label: "全部", value: "", },
                                    { label: "今日活跃", value: "A0", },
                                    { label: "7日内活跃", value: "A7", },
                                    { label: "30日内活跃", value: "A30", },
                                    { label: "今日不活跃", value: "B0", },
                                    { label: "7日内不活跃", value: "B7", },
                                    { label: "30日内不活跃", value: "B30", },
                                ]}
                                value={this.state.segment.runable}
                                onValueChange={(_segment) => {
                                    this.setState({ segment: Object.assign({}, this.state.segment, { runable: _segment }) })
                                }}
                            />
                        </div>
                        <div className='flex'>
                            <SegmentedControl
                                className="ml10"
                                options={[
                                    { label: "全部", value: "", },
                                    { label: "测试号", value: "1", },
                                    { label: "正式号", value: "0", },
                                ]}
                                value={this.state.segment.is_test}
                                onValueChange={(_segment) => {
                                    this.setState({ segment: Object.assign({}, this.state.segment, { is_test: _segment }) })
                                }}
                            />

                            <SegmentedControl
                                className="ml10"
                                options={[
                                    { label: "全部", value: "", },
                                    { label: "启用", value: "1", },
                                    { label: "停用", value: "0", },
                                ]}
                                value={this.state.segment.is_active}
                                onValueChange={(_segment) => {
                                    this.setState({ segment: Object.assign({}, this.state.segment, { is_active: _segment }) })
                                }}
                            />
                        </div>
                    </div>

                    <div className='flex'>
                        <span>商户列表 {'undefined' !== typeof (this.state.merchants.pager) ? '(' + this.state.merchants.pager.total + "条记录)" : ''}</span>
                        <Button onClick={this.open_create_dialog}>添加商户</Button>
                    </div>

                    <div className="card_content mt10">
                        <table className='model'>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>类别</th>
                                    <th>账号名称</th>
                                    <th>代理</th>
                                    <th>最后操作</th>
                                    <th>余额</th>
                                    <th>代付池</th>
                                    <th>冻结金额</th>
                                    <th>账号类型</th>
                                    <th>启停</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    'undefined' !== typeof (this.state.merchants.rows) && this.state.merchants.rows.map((merchant) => {
                                        return <tr key={"merchant-" + merchant.id} className={''}>
                                            <td className='cp'>{merchant.id}</td>
                                            <td className='cp'>
                                                <table style={{ margin: '0px auto' }}>
                                                    <tbody>
                                                        <tr><td>{category_map[merchant.category]}</td></tr>
                                                        <tr><td>{merchant.country}</td></tr>
                                                    </tbody>
                                                </table>
                                            </td>
                                            <td className='cp'>
                                                <table style={{ margin: '0px auto' }}>
                                                    <tbody>
                                                        <tr><td>账号:</td><td><Button minimal={true} onClick={() => { this.show_detail(merchant.request_token) }}>{merchant.account}</Button></td></tr>
                                                        <tr><td>名称:</td><td><Button minimal={true} onClick={() => { this.show_detail(merchant.request_token) }}>{merchant.name}</Button></td></tr>
                                                    </tbody>
                                                </table>
                                            </td>
                                            <td className='cp'>{merchant.proxy}</td>
                                            <td className='cp'>
                                                <table style={{ margin: '0px auto' }}>
                                                    <tbody>
                                                        <tr><td>代收</td><td>{merchant.lastinfo.payin}</td><td>代付</td><td>{merchant.lastinfo.payout}</td></tr>
                                                        <tr><td>充值</td><td>{merchant.lastinfo.in}</td><td>下发</td><td>{merchant.lastinfo.out}</td></tr>
                                                    </tbody>
                                                </table>
                                            </td>

                                            <td className='cp'>
                                                <table style={{ margin: '0px auto' }}>
                                                    <tbody>
                                                        <tr><td>测试:</td><td>{merchant.test_amount}</td></tr>
                                                        <tr><td>正式:</td><td>{merchant.amount}</td></tr>
                                                    </tbody>
                                                </table>
                                            </td>
                                            <td className='cp'>
                                                <table style={{ margin: '0px auto' }}>
                                                    <tbody>
                                                        <tr><td>测试:</td><td>{merchant.test_df_pool}</td></tr>
                                                        <tr><td>正式:</td><td>{merchant.df_pool}</td></tr>
                                                    </tbody>
                                                </table>
                                            </td>

                                            <td className='cp'>{merchant.freeze_pool}</td>
                                            <td>{1 === parseInt(merchant.is_test) ? <Button minimal={true} icon="small-cross" intent={"danger"} text="测试" small={true} /> : <Button minimal={true} icon="small-tick" intent={"success"} text="正式" small={true} />}</td>
                                            <td>{1 === parseInt(merchant.is_active) ? <Button minimal={true} icon="small-tick" intent={"success"} text="" small={true} /> : <Button minimal={true} icon="small-cross" intent={"danger"} text="" small={true} />}</td>
                                        </tr>
                                    })
                                }
                            </tbody>
                        </table>
                    </div>

                    <div className="Page flex mt15">
                        {
                            'undefined' !== typeof (this.state.merchants.pager) && <nav className="pagination-outer" aria-label="Page navigation">
                                <ul className="pagination">
                                    <li className="page-item"><Button onClick={() => { this.goto_pagination(1) }}>首页</Button></li>
                                    <li className="page-item"><Button onClick={() => { this.goto_pagination(parseInt(this.state.merchants.pager.page) - 1) }}>上一页</Button></li>
                                    {
                                        this.state.merchants.pager.range.map((p) => {
                                            return <li className="page-item" key={"_pagination_p_" + p}>
                                                <Button
                                                    intent={parseInt(p) === parseInt(this.state.merchants.pager.page) ? 'primary' : 'None'}
                                                    onClick={() => { this.goto_pagination(parseInt(p)) }}
                                                >{p}</Button>
                                            </li>
                                        })
                                    }
                                    <li className="page-item"><Button onClick={() => { this.goto_pagination(parseInt(this.state.merchants.pager.page) + 1) }}>下一页</Button></li>
                                    <li className="page-item"><Button onClick={() => { this.goto_pagination(parseInt(this.state.merchants.pager.pages)) }}>尾页</Button></li>
                                    <li className="page-item"><Button>{this.state.merchants.pager.total + "条记录)"}</Button></li>
                                </ul>
                            </nav>
                        }
                        <HTMLSelect
                            value={this.state.pager.per}
                            onChange={(e) => {
                                this.setState({ pager: Object.assign({}, this.state.pager, { per: e.currentTarget.value }) }, function () { this.load_merchant() })
                            }}
                            options={[1, 5, 10, 15, 20, 30, 50, 100, 500, 1000]} />
                    </div>
                </div>
            </div>

            <Dialog
                title="添加商户"
                style={{ width: '360px' }}
                isOpen={this.state.create_dialog.isOpen}
                onClose={this.close_create_dialog}>
                <DialogBody>
                    <div className='row flex mb10'>
                        <FormGroup
                            fill={true}
                            helperText=""
                            label="名称"
                            labelFor="text-input"
                            labelInfo=""
                            onReduceData={(text) => { console.info(text) }}
                        >
                            <InputGroup
                                onChange={(e) => { this.setState({ form: Object.assign({}, this.state.form, { name: e.target.value }) }) }}
                                value={this.state.form.name}
                                placeholder="请输入商户名称" />
                        </FormGroup>
                    </div>

                    <div className='row flex mb10'>
                        <FormGroup
                            fill={true}
                            label="登录账号"
                            labelFor="text-input"
                        >
                            <InputGroup
                                onChange={(e) => { this.setState({ form: Object.assign({}, this.state.form, { account: e.target.value }) }) }}
                                value={this.state.form.account}
                                placeholder="请输入登录账号" />
                        </FormGroup>
                    </div>

                    <div className='row flex mb10'>
                        <FormGroup
                            fill={true}
                            label="登录密码"
                            labelFor="text-input"
                        >
                            <InputGroup
                                onChange={(e) => { this.setState({ form: Object.assign({}, this.state.form, { password: e.target.value }) }) }}
                                value={this.state.form.password}
                                placeholder="请输入登录密码" />
                        </FormGroup>
                    </div>

                    <div className='row flex mb10'>
                        <Label className="mr5">类别:</Label>
                        {
                            this._render_category("_create", (category) => { this.setState({ form: Object.assign({}, this.state.form, { category: category }) }) }, this.state.form.category)
                        }
                    </div>
                    <div className='row flex mb10'>
                        <Label className="mr5">国家:</Label>
                        {
                            this._render_counties("_create", (country) => { this.setState({ form: Object.assign({}, this.state.form, { country: country }) }) }, this.state.form.country)
                        }
                    </div>

                    <div className='row flex'>
                        <SwitchCard checked={this.state.form.is_test} onChange={(e) => { this.setState({ form: Object.assign({}, this.state.form, { is_test: e.target.checked }) }) }}>测试账号</SwitchCard>
                        <SwitchCard checked={this.state.form.is_active} onChange={(e) => { this.setState({ form: Object.assign({}, this.state.form, { is_active: e.target.checked }) }) }}>是否启用</SwitchCard>
                    </div>
                </DialogBody>

                <DialogFooter minimal={false} actions={<>
                    <Button onClick={this.close_create_dialog}>关闭</Button>
                    <Button
                        intent="primary"
                        onClick={this.post}
                    >
                        确定
                    </Button>
                </>} />
            </Dialog>

            <Drawer
                icon="info-sign"
                onClose={this.hide_detail}
                title={"商户详情 - " + this.state.selected_merchant.name}
                isOpen={this.state.detail_drawer.isOpen}
                style={{ width: drawer_segmentedSize[this.state.drawer_segmented] }}
            >
                <div className={Classes.DRAWER_BODY}>
                    <div className='pd15'>
                        <Pivot aria-label="商户信息" defaultSelectedKey="statistics" onLinkClick={(pivot_item) => { this.change_pivot(pivot_item.key) }}>
                            <PivotItem headerText="统计信息" key="statistics">
                                <div className='pd15' style={{ 'background': 'rgba(233, 233, 234, 0.17)' }}>
                                    <Statistics merchant_request_token={this.state.form.request_token} />
                                </div>
                            </PivotItem>

                            <PivotItem headerText="基本信息" key="basic">
                                {
                                    '' !== this.state.form.request_token ? <div className='pd15' style={{ 'background': 'rgba(233, 233, 234, 0.17)' }}>
                                        <div className='row flex mb10'>
                                            <Upload
                                                multiple={false}
                                                maxCount={1}
                                                listType="picture-card"
                                                action={APP_CONFIG.api_url + "/upload.img?target=merchant_logo&id=" + this.state.form.id}
                                                fileList={this.state.files}
                                                onPreview={this.handlePreview}
                                                onChange={this.handleChange}
                                            >
                                                <div><PlusOutlined /><div style={{ marginTop: 8, }}>选择文件</div></div>
                                            </Upload>
                                        </div>

                                        <div className='row flex mb10'>
                                            <FormGroup
                                                fill={true}
                                                label="名称"
                                                labelFor="text-input"
                                            >
                                                <InputGroup
                                                    onChange={(e) => { this.setState({ form: Object.assign({}, this.state.form, { name: e.target.value }) }) }}
                                                    value={this.state.form.name}
                                                    placeholder="请输入商户名称" />
                                            </FormGroup>
                                        </div>

                                        <div className='row flex mb10'>
                                            <FormGroup
                                                fill={true}
                                                helperText="(英文字符串，无空格和特殊字符)"
                                                label="登录账号"
                                                labelFor="text-input"
                                            >
                                                <InputGroup
                                                    onChange={(e) => { this.setState({ form: Object.assign({}, this.state.form, { account: e.target.value }) }) }}
                                                    value={this.state.form.account}
                                                    placeholder="请输入商户登录账号" />
                                            </FormGroup>
                                        </div>

                                        <div className='row flex mb10'>
                                            <FormGroup
                                                fill={true}
                                                helperText="(不修改请留空)建议6-16位+大小写+特殊字符"
                                                label="登录密码"
                                                labelFor="text-input"
                                            >
                                                <InputGroup
                                                    onChange={(e) => { this.setState({ form: Object.assign({}, this.state.form, { password: e.target.value }) }) }}
                                                    value={this.state.form.password}
                                                    placeholder="请输入商户登录密码" />
                                            </FormGroup>
                                        </div>

                                        <div className='row flex mb10'>
                                            <FormGroup
                                                fill={true}
                                                helperText="(机器人获取此ID)"
                                                label="商户电报群组ID"
                                                labelFor="text-input"
                                            >
                                                <InputGroup
                                                    onChange={(e) => { this.setState({ form: Object.assign({}, this.state.form, { telegram_group_id: e.target.value }) }) }}
                                                    value={this.state.form.telegram_group_id}
                                                    placeholder="请输入商户电报群组ID" />
                                            </FormGroup>
                                        </div>
										
										<div className='row flex mb10'>
                                            <FormGroup
                                                fill={true}
                                                helperText="(机器人获取此ID)"
                                                label="运维电报群组ID"
                                                labelFor="text-input"
                                            >
                                                <InputGroup
                                                    onChange={(e) => { this.setState({ form: Object.assign({}, this.state.form, { yw_telegram_group_id: e.target.value }) }) }}
                                                    value={this.state.form.yw_telegram_group_id}
                                                    placeholder="请输入运维-电报群组ID" />
                                            </FormGroup>
                                        </div>

                                        <div className='row flex mb10'>
                                            <div className='flex' style={{ width: '100%' }}>
                                                <div style={{ width: '48%' }}>
                                                    <FormGroup fill={true} helperText="系统生成,无法修改" label="代收appid" labelFor="text-input">
                                                        <InputGroup
                                                            onChange={(e) => { this.setState({ form: Object.assign({}, this.state.form, { payin_appid: e.target.value }) }) }}
                                                            value={this.state.form.payin_appid} disabled />
                                                    </FormGroup>
                                                </div>
                                                <div style={{ width: '48%' }}>
                                                    <FormGroup fill={true} helperText="系统生成,无法修改" label="代收密钥" labelFor="text-input">
                                                        <InputGroup
                                                            onChange={(e) => { this.setState({ form: Object.assign({}, this.state.form, { payin_secret: e.target.value }) }) }}
                                                            value={this.state.form.payin_secret} disabled />
                                                    </FormGroup>
                                                </div>
                                            </div>
                                        </div>

                                        <div className='row flex mb10'>
                                            <div className='flex' style={{ width: '100%' }}>
                                                <div style={{ width: '48%' }}>
                                                    <FormGroup fill={true} helperText="系统生成,无法修改" label="代付appid" labelFor="text-input">
                                                        <InputGroup
                                                            onChange={(e) => { this.setState({ form: Object.assign({}, this.state.form, { payout_appid: e.target.value }) }) }}
                                                            value={this.state.form.payout_appid} disabled />
                                                    </FormGroup>
                                                </div>
                                                <div style={{ width: '48%' }}>
                                                    <FormGroup fill={true} helperText="系统生成,无法修改" label="代付密钥" labelFor="text-input">
                                                        <InputGroup
                                                            onChange={(e) => { this.setState({ form: Object.assign({}, this.state.form, { payout_secret: e.target.value }) }) }}
                                                            value={this.state.form.payout_secret} disabled />
                                                    </FormGroup>
                                                </div>
                                            </div>
                                        </div>

                                        <div className='row flex mb10'>
                                            <div className='flex' style={{ width: '100%' }}>
                                                <div style={{ width: '48%' }}>
                                                    <FormGroup fill={true} helperText="系统生成,无法修改" label="谷歌验证码" labelFor="text-input">
                                                        <InputGroup
                                                            onChange={() => { }}
                                                            value={this.state.form.google_secret} disabled />
                                                    </FormGroup>
                                                </div>
                                                <div style={{ width: '48%' }}>
                                                    <FormGroup fill={true} helperText="系统生成,无法修改" label="关键谷歌验证码" labelFor="text-input">
                                                        <InputGroup
                                                            onChange={() => { }}
                                                            value={this.state.form.vip_google_secret} disabled />
                                                    </FormGroup>
                                                </div>
                                            </div>
                                        </div>

                                        <div className='row flex mb10'>
                                            <Label className="mr5">类别:</Label>
                                            {
                                                this._render_category("_form", (category) => { this.setState({ form: Object.assign({}, this.state.form, { category: category }) }) }, this.state.form.category)
                                            }
                                        </div>
                                        <div className='row flex mb10'>
                                            <Label className="mr5">国家:</Label>
                                            {
                                                this._render_counties("_form", (country) => { this.setState({ form: Object.assign({}, this.state.form, { country: country }) }) }, this.state.form.country)
                                            }
                                        </div>

                                        <div className='row flex mb10'>
                                            <Label className="mr5">代理:</Label>
                                            {
                                                this._render_proxy("_form", (proxy) => { this.setState({ form: Object.assign({}, this.state.form, { proxy: proxy }) }) }, this.state.form.proxy)
                                            }
                                        </div>

                                        <div className='row flex mb10'>
                                            <Label className="mr5">是否测试:</Label>
                                            {/*<Switch onChange={() => {
                                        //let checked = e.target.checked
                                        //this.setState({ form: Object.assign({}, this.state.form, { is_active: checked }) })
                                    }}
                                        disabled
                                        checked={this.state.form.is_test}
                                    />*/}
                                            {
                                                1 == this.state.form.is_test ? <Popover
                                                    popoverClassName={Classes.POPOVER_CONTENT_SIZING}
                                                    portalClassName="docs-popover-example-portal"
                                                    content={<div key="text">
                                                        <H5>请确定</H5>
                                                        <p>确定将:[{this.state.selected_merchant.name}]从 [测试] 转成 [正式] 吗?</p>
                                                        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 15 }}>
                                                            <Button onClick={() => { this.setState({ set_release_popover: false }) }} style={{ marginRight: 10 }}>取消</Button>
                                                            <Button intent={Intent.DANGER} className={Classes.POPOVER_DISMISS} onClick={() => { this.set_release(this.state.form.request_token) }}>确定</Button>
                                                        </div>
                                                    </div>}
                                                    boundary={"flip"}
                                                    enforceFocus={false}
                                                    isOpen={this.state.set_release_popover}
                                                ><Button intent="Success" onClick={() => { this.setState({ set_release_popover: true }) }}>转正式</Button></Popover> : ''
                                            }

                                            {
                                                0 == this.state.form.is_test ? <Popover
                                                    popoverClassName={Classes.POPOVER_CONTENT_SIZING}
                                                    portalClassName="docs-popover-example-portal"
                                                    content={<div key="text">
                                                        <H5>请确定</H5>
                                                        <p>确定将:[{this.state.selected_merchant.name}]从 [正式] 转成 [测试] 吗?</p>
                                                        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 15 }}>
                                                            <Button onClick={() => { this.setState({ set_test_popover: false }) }} style={{ marginRight: 10 }}>取消</Button>
                                                            <Button intent={Intent.DANGER} className={Classes.POPOVER_DISMISS} onClick={() => { this.set_test(this.state.form.request_token) }}>确定</Button>
                                                        </div>
                                                    </div>}
                                                    boundary={"flip"}
                                                    enforceFocus={false}
                                                    isOpen={this.state.set_test_popover}
                                                ><Button intent="Danger" onClick={() => { this.setState({ set_test_popover: true }) }}>转测试</Button></Popover> : ''
                                            }
                                        </div>

                                        <div className='row flex mb10'>
                                            <Label className="mr5">是否启用:</Label>
                                            <Switch onChange={(e) => {
                                                let checked = e.target.checked
                                                this.setState({ form: Object.assign({}, this.state.form, { is_active: checked }) })
                                            }}
                                                checked={this.state.form.is_active}
                                            />
                                        </div>

                                    </div> : ''
                                }
                            </PivotItem>

                            <PivotItem headerText="通道管理" key="merchant_channels">
                                {
                                    '' !== this.state.form.request_token && ['PAYIN', 'PAYOUT'].map((bundle) => {
                                        return <div key={"merchant_channel_" + bundle} className={"PAYIN" === bundle ? "row mb10 greenBorder" : "row mb10 redBorder"}>
                                            <table className='model12'>
                                                <thead>
                                                    <tr>
                                                        <th style={{ width: "60px", TextAlign: 'center' }}>ID</th>
                                                        <th><span style={{ padding: '3px 5px', borderRadius: '4px' }}>{"PAYIN" === bundle ? "代收" : "代付"}通道</span></th>
                                                        <th>别名</th>
                                                        <th>手续费%</th>
                                                        <th>单笔费用</th>
                                                        <th>下限</th>
                                                        <th>上限</th>
                                                        <th>限额</th>
                                                        <th>启停</th>
                                                        <th><div style={{ width: '110px' }}>管理</div></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {
                                                        this.state.selected_merchant.channels[bundle].map((mc) => {
                                                            return <tr key={"payin_channel_" + mc.id}>
                                                                <td>{mc.channel_id}</td>
                                                                <td>
                                                                    <Button intent={1 === parseInt(mc.is_default) ? ("PAYIN" === bundle ? "success" : "danger") : ''} small={true} onClick={() => { this.set_mc_default(bundle, mc.id) }}>{mc.channel}</Button>
                                                                </td>
                                                                <td>
                                                                    <InputGroup
                                                                        style={{ width: "60px", TextAlign: 'center' }}
                                                                        onChange={(e) => { this.sync_mc(bundle, mc.id, 'name', e.target.value) }}
                                                                        value={mc.name}
                                                                        placeholder="别名" />
                                                                </td>
                                                                <td>
                                                                    <InputGroup
                                                                        style={{ width: "60px", TextAlign: 'center' }}
                                                                        onChange={(e) => { this.sync_mc(bundle, mc.id, 'pct', e.target.value) }}
                                                                        value={mc.pct}
                                                                        placeholder="百分比" />
                                                                </td>
                                                                <td>
                                                                    <InputGroup
                                                                        style={{ width: "60px", TextAlign: 'center' }}
                                                                        onChange={(e) => { this.sync_mc(bundle, mc.id, 'sf', e.target.value) }}
                                                                        value={mc.sf}
                                                                        placeholder="单笔" />
                                                                </td>
                                                                <td>
                                                                    <InputGroup
                                                                        style={{ width: "60px", TextAlign: 'center' }}
                                                                        onChange={(e) => { this.sync_mc(bundle, mc.id, 'min', e.target.value) }}
                                                                        value={mc.min}
                                                                        placeholder="下限" />
                                                                </td>
                                                                <td>
                                                                    <InputGroup
                                                                        style={{ width: "60px", TextAlign: 'center' }}
                                                                        onChange={(e) => { this.sync_mc(bundle, mc.id, 'max', e.target.value) }}
                                                                        value={mc.max}
                                                                        placeholder="上限" />
                                                                </td>
                                                                <td>
                                                                    <div className='flex' style={{ width: '220px', margin: '0 auto' }}>
                                                                        <div className="bp5-control-group">
                                                                            <button className="bp5-button bp5-icon-comparison"></button>
                                                                            <input type="text" className="bp5-input" placeholder="限额" style={{ width: "80px", TextAlign: 'center' }}
                                                                                onChange={(e) => { this.sync_mc(bundle, mc.id, 'pay_limit', e.target.value) }}
                                                                                value={mc.pay_limit} />
                                                                        </div>
                                                                        <div className="bp5-control-group ml5">
                                                                            <button className="bp5-button bp5-icon-arrow-up"></button>
                                                                            <input type="text" className="bp5-input" placeholder="允许超出" style={{ width: "60px", TextAlign: 'center' }}
                                                                                onChange={(e) => { this.sync_mc(bundle, mc.id, 'out_limit', e.target.value) }}
                                                                                value={mc.out_limit} />
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td>
                                                                    {
                                                                        1 === parseInt(mc.is_active) ?
                                                                            <Button onClick={() => { this.change_mc_state(bundle, mc.id, 0) }} icon="small-tick" intent={"success"} text="" small={true} /> :
                                                                            <Button onClick={() => { this.change_mc_state(bundle, mc.id, 1) }} icon="small-cross" intent={"danger"} text="" small={true} />
                                                                    }
                                                                </td>
                                                                <td>

                                                                    {
                                                                        1 === parseInt(mc.has_method) ? <Button
                                                                            icon="build"
                                                                            small={true}
                                                                            intent="danger"
                                                                            className="mr10"
                                                                            onClick={() => { this.open_build(bundle, mc.id) }}
                                                                        ></Button> : ''
                                                                    }

                                                                    {
                                                                        1 === parseInt(mc.has_method) ?
                                                                            <Button
                                                                                icon="box"
                                                                                small={true}
                                                                                intent="primary"
                                                                                className="mr10"
                                                                                onClick={() => { this.open_pay_method_dialog(bundle, mc.id) }}
                                                                            ></Button> : ''
                                                                    }

                                                                    <Button
                                                                        icon="floppy-disk"
                                                                        small={true}
                                                                        intent="success"
                                                                        className="mr10"
                                                                        onClick={() => { this.update_mc(bundle, mc.id) }}
                                                                    ></Button>

                                                                    <Popover
                                                                        popoverClassName={Classes.POPOVER_CONTENT_SIZING}
                                                                        portalClassName="docs-popover-example-portal"
                                                                        content={<div key="text">
                                                                            <H5>请确定</H5>
                                                                            <p>确定重置:[{this.state.selected_merchant.name}]的[{mc.channel}]的限制额度吗?</p>
                                                                            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 15 }}>
                                                                                <Button className={Classes.POPOVER_DISMISS} style={{ marginRight: 10 }}>
                                                                                    取消
                                                                                </Button>
                                                                                <Button
                                                                                    intent={Intent.DANGER}
                                                                                    className={Classes.POPOVER_DISMISS}
                                                                                    onClick={() => { this.reset_channel_limit(mc.id) }}
                                                                                >
                                                                                    确定重置
                                                                                </Button>
                                                                            </div>
                                                                        </div>}
                                                                        boundary={"flip"}
                                                                        enforceFocus={false}
                                                                        isOpen={this.state.popover["mcp_" + mc.id]}
                                                                        className="mr10"
                                                                    >
                                                                        <Button icon="reset" small={true}
                                                                            onChange={() => {
                                                                                let popover = this.state.popover
                                                                                popover["mcp_" + mc.id] = true
                                                                                this.setState({ popover: popover })
                                                                            }}
                                                                        ></Button>
                                                                    </Popover>

                                                                    <Popover
                                                                        popoverClassName={Classes.POPOVER_CONTENT_SIZING}
                                                                        portalClassName="docs-popover-example-portal"
                                                                        content={<div key="text">
                                                                            <H5>请确定</H5>
                                                                            <p>确定删除:[{this.state.selected_merchant.name}]的[{mc.channel}]通道吗?</p>
                                                                            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 15 }}>
                                                                                <Button className={Classes.POPOVER_DISMISS} style={{ marginRight: 10 }}>
                                                                                    取消
                                                                                </Button>
                                                                                <Button
                                                                                    intent={Intent.DANGER}
                                                                                    className={Classes.POPOVER_DISMISS}
                                                                                    onClick={() => { this.remove_channel(mc.id) }}
                                                                                >
                                                                                    删除
                                                                                </Button>
                                                                            </div>
                                                                        </div>}
                                                                        boundary={"flip"}
                                                                        enforceFocus={false}
                                                                        isOpen={this.state.popover["mcp_" + mc.id]}
                                                                    >
                                                                        <Button icon="cross" small={true}
                                                                            onChange={() => {
                                                                                let popover = this.state.popover
                                                                                popover["mcp_" + mc.id] = true
                                                                                this.setState({ popover: popover })
                                                                            }}
                                                                        ></Button>
                                                                    </Popover>

                                                                </td>
                                                            </tr>
                                                        })
                                                    }
                                                </tbody>
                                                <tfoot>
                                                    <tr>
                                                        <td>-</td>
                                                        <td>
                                                            {
                                                                this._render_channels(bundle + "_", (channel) => {
                                                                    let that = this
                                                                    Ajax("channel", { action: "detail", request_token: channel.request_token }, function (json) {
                                                                        if (0 === json.code) {
                                                                            let new_channel = that.state.new_channel
                                                                            new_channel[bundle].name = json.data.slug
                                                                            new_channel[bundle].channel = channel
                                                                            if ('PAYIN' === bundle) {
                                                                                new_channel[bundle].pct = json.data.payin_pct
                                                                                new_channel[bundle].sf = json.data.payin_sf
                                                                                new_channel[bundle].min = json.data.payin_min
                                                                                new_channel[bundle].max = json.data.payin_max
                                                                            }
                                                                            else {
                                                                                new_channel[bundle].pct = json.data.payout_pct
                                                                                new_channel[bundle].sf = json.data.payout_sf
                                                                                new_channel[bundle].min = json.data.payout_min
                                                                                new_channel[bundle].max = json.data.payout_max
                                                                            }
                                                                            that.setState({
                                                                                new_channel: new_channel,
                                                                            })
                                                                        } else {
                                                                            message.error(json.msg);
                                                                        }
                                                                    })
                                                                }, this.state.new_channel[bundle].channel)
                                                            }
                                                        </td>
                                                        <td>
                                                            <InputGroup
                                                                style={{ width: "60px", TextAlign: 'center' }}
                                                                onChange={(e) => {
                                                                    let new_channel = this.state.new_channel
                                                                    new_channel[bundle].name = e.target.value
                                                                    this.setState({
                                                                        new_channel: new_channel
                                                                    })
                                                                }}
                                                                value={this.state.new_channel[bundle].name}
                                                                placeholder="显示名称" />
                                                        </td>
                                                        <td>
                                                            <InputGroup
                                                                style={{ width: "60px", TextAlign: 'center' }}
                                                                onChange={(e) => {
                                                                    let new_channel = this.state.new_channel
                                                                    new_channel[bundle].pct = e.target.value
                                                                    this.setState({
                                                                        new_channel: new_channel
                                                                    })
                                                                }}
                                                                value={this.state.new_channel[bundle].pct}
                                                                placeholder="手续费" />
                                                        </td>
                                                        <td>
                                                            <InputGroup
                                                                style={{ width: "60px", TextAlign: 'center' }}
                                                                onChange={(e) => {
                                                                    let new_channel = this.state.new_channel
                                                                    new_channel[bundle].sf = e.target.value
                                                                    this.setState({
                                                                        new_channel: new_channel
                                                                    })
                                                                }}
                                                                value={this.state.new_channel[bundle].sf}
                                                                placeholder="单笔费用" />
                                                        </td>
                                                        <td>
                                                            <InputGroup
                                                                style={{ width: "60px", TextAlign: 'center' }}
                                                                onChange={(e) => {
                                                                    let new_channel = this.state.new_channel
                                                                    new_channel[bundle].min = e.target.value
                                                                    this.setState({
                                                                        new_channel: new_channel
                                                                    })
                                                                }}
                                                                value={this.state.new_channel[bundle].min}
                                                                placeholder="下限" />
                                                        </td>
                                                        <td>
                                                            <InputGroup
                                                                style={{ width: "60px", TextAlign: 'center' }}
                                                                onChange={(e) => {
                                                                    let new_channel = this.state.new_channel
                                                                    new_channel[bundle].max = e.target.value
                                                                    this.setState({
                                                                        new_channel: new_channel
                                                                    })
                                                                }}
                                                                value={this.state.new_channel[bundle].max}
                                                                placeholder="上限" />
                                                        </td>

                                                        <td>
                                                            <div className='flex' style={{ width: '220px', margin: '0 auto' }}>
                                                                <div className="bp5-control-group">
                                                                    <button className="bp5-button bp5-icon-comparison"></button>
                                                                    <input type="text" className="bp5-input" placeholder="限额" style={{ width: "80px", TextAlign: 'center' }}
                                                                        onChange={(e) => {
                                                                            let new_channel = this.state.new_channel
                                                                            new_channel[bundle].pay_limit = e.target.value
                                                                            this.setState({
                                                                                new_channel: new_channel
                                                                            })
                                                                        }}
                                                                        value={this.state.new_channel[bundle].pay_limit} />
                                                                </div>
                                                                <div className="bp5-control-group ml5">
                                                                    <button className="bp5-button bp5-icon-arrow-up"></button>
                                                                    <input type="text" className="bp5-input" placeholder="允许超出" style={{ width: "60px", TextAlign: 'center' }}
                                                                        onChange={(e) => {
                                                                            let new_channel = this.state.new_channel
                                                                            new_channel[bundle].out_limit = e.target.value
                                                                            this.setState({
                                                                                new_channel: new_channel
                                                                            })
                                                                        }}
                                                                        value={this.state.new_channel[bundle].out_limit} />
                                                                </div>
                                                            </div>
                                                        </td>

                                                        <td>
                                                            <Switch onChange={(e) => {
                                                                let new_channel = this.state.new_channel
                                                                new_channel[bundle].is_active = e.target.checked
                                                                this.setState({
                                                                    new_channel: new_channel
                                                                })
                                                            }}
                                                                checked={this.state.new_channel[bundle].is_active}
                                                            />
                                                        </td>
                                                        <td>
                                                            <Button onClick={() => { this.add_channel(bundle) }}>添加</Button>
                                                        </td>
                                                    </tr>
                                                </tfoot>
                                            </table>
                                        </div>
                                    })
                                }
                            </PivotItem>

                            <PivotItem headerText="IP白名单">
                                <div className='pd15' style={{ 'background': 'rgba(233, 233, 234, 0.17)' }}>
                                    <table className='model'>
                                        <thead>
                                            <tr><th width="60">编号</th><th>ip</th><th width="80"></th></tr>
                                        </thead>
                                        <tbody>
                                            {
                                                'undefined' !== typeof (this.state.form.ip_table) && this.state.form.ip_table.map((ip, idx) => {
                                                    return "" !== ip.ip ? <tr key={"IP_" + ip.request_token}><td style={{ padding: '10px', fontSize: '16px' }}>{idx + 1}</td><td style={{ padding: '10px', fontSize: '16px' }}>{ip.ip}</td><td><Button intent="Danger" onClick={() => { this.remove_ip(ip) }}>删除</Button></td></tr> : ''
                                                })
                                            }
                                        </tbody>
                                        {
                                            'undefined' !== typeof (this.state.form.ip_table) && this.state.form.ip_table.length < 100 ? <tfoot>
                                                <tr>
                                                    <td></td>
                                                    <td>
                                                        <TextField styles={{ field: { textAlign: 'center' } }} value={this.state.ip} onChange={(e, ip) => { this.setState({ ip: ip }) }} />
                                                    </td>
                                                    <td>
                                                        <PrimaryButton text="添加" onClick={this.submit_ip} />
                                                    </td>
                                                </tr>
                                            </tfoot> : ''
                                        }
                                    </table>
                                </div>
                            </PivotItem>

                            <PivotItem headerText="冻结">
                                <div className='pd15' style={{ 'background': 'rgba(233, 233, 234, 0.17)' }}>
                                    <table className='model'>
                                        <tbody>
                                            <tr>
                                                <th style={{ fontWeight: 400 }}>正式余额</th>
                                                <th style={{ fontWeight: 400 }}>正式代付金额</th>
                                                <th style={{ fontWeight: 400 }}>测试余额</th>
                                                <th style={{ fontWeight: 400 }}>测试代付金额</th>
                                                <th style={{ fontWeight: 400 }}>冻结余额</th>
                                            </tr>
                                            <tr>
                                                <td style={{ fontSize: '20px' }}>{commafy(this.state.form.amount)}</td>
                                                <td style={{ fontSize: '20px' }}>{commafy(this.state.form.df_pool)}</td>
                                                <td style={{ fontSize: '20px' }}>{commafy(this.state.form.test_amount)}</td>
                                                <td style={{ fontSize: '20px' }}>{commafy(this.state.form.test_df_pool)}</td>
                                                <td style={{ fontSize: '20px' }}>{commafy(this.state.form.freeze_pool)}</td>
                                            </tr>
                                        </tbody>
                                    </table>

                                    {
                                        1 === parseInt(this.state.form.is_test) ? '' : <div><table className='model mt20'>
                                            <thead>
                                                <tr>
                                                    <th style={{ fontWeight: 400, backgroundColor: '#f9b3b3ab', color: '#333' }}>冻结金额</th>
                                                    <th style={{ fontWeight: 400, backgroundColor: '#f9b3b3ab', color: '#333' }} width="80"></th>
                                                </tr>
                                            </thead>
                                            <tbody>

                                            </tbody>
                                            <tfoot>
                                                <tr>
                                                    <td>
                                                        <div>
                                                            <TextField maxLength={15} value={this.state.freeze_blance} onChange={this.sync_freeze_blance} styles={{ root: { width: '100%' }, field: { textAlign: 'center', border: '1px solid #f8abab45', backgroundColor: '#fcc0c029', color: '#111' } }} />
                                                        </div>
                                                    </td>
                                                    <td className='flex'>
                                                        <PrimaryButton text="冻结" iconProps={{ iconName: 'Lock', styles: { root: { color: '#fff' } } }} onClick={this.start_freeze_blance} styles={{ root: { width: '100px', background: '#d40000 !important', border: '0px' } }} />
                                                        <DefaultButton text="冻结全部" styles={{ root: { width: '100px' } }} className='ml10' onClick={() => {
                                                            this.setState({
                                                                freeze_blance: this.state.form.amount
                                                            }, function () { this.start_freeze_blance() })
                                                        }} />
                                                    </td>
                                                </tr>
                                            </tfoot>
                                        </table>

                                            <table className='model mt20'>
                                                <thead>
                                                    <tr>
                                                        <th style={{ fontWeight: 400, backgroundColor: '#c0f9b3ab', color: '#333' }}>解除金额</th>
                                                        <th style={{ fontWeight: 400, backgroundColor: '#c0f9b3ab', color: '#333' }} width="80"></th>
                                                    </tr>
                                                </thead>
                                                <tbody>

                                                </tbody>
                                                <tfoot>
                                                    <tr>
                                                        <td>
                                                            <div>
                                                                <TextField maxLength={15} value={this.state.unfreeze_blance} onChange={this.sync_unfreeze_blance} styles={{ root: { width: '100%' }, field: { textAlign: 'center', border: '1px solid #c0f9b3ab', backgroundColor: '#c0f9b3ab', color: '#111' } }} />
                                                            </div>
                                                        </td>
                                                        <td className='flex'>
                                                            <PrimaryButton text="解除" iconProps={{ iconName: 'Unlock', styles: { root: { color: '#fff' } } }} onClick={this.start_unfreeze_blance} styles={{ root: { width: '100px', background: '#00d417 !important', border: '0px' } }} />
                                                            <DefaultButton styles={{ root: { width: '100px' } }} className='ml10' text="解除全部" onClick={() => {
                                                                this.setState({
                                                                    unfreeze_blance: this.state.form.freeze_pool
                                                                }, function () { this.start_unfreeze_blance() })
                                                            }} />
                                                        </td>
                                                    </tr>
                                                </tfoot>
                                            </table>
                                        </div>
                                    }

                                </div>
                            </PivotItem>

                            <PivotItem headerText="代收订单" key="order_payin">
                                <div className='pd15' style={{ 'background': 'rgba(233, 233, 234, 0.17)' }}>
                                </div>
                            </PivotItem>

                            <PivotItem headerText="代付订单" key="order_payout">
                                <div className='pd15' style={{ 'background': 'rgba(233, 233, 234, 0.17)' }}>
                                </div>
                            </PivotItem>

                            <PivotItem headerText="下发" key="dispatch">
                                <div className='pd15' style={{ 'background': 'rgba(233, 233, 234, 0.17)' }}>
                                    <table className='model'>
                                        <tbody>
                                            <tr>
                                                <th style={{ fontWeight: 400 }}>正式余额</th>
                                                <th style={{ fontWeight: 400 }}>正式代付金额</th>
                                                <th style={{ fontWeight: 400 }}>测试余额</th>
                                                <th style={{ fontWeight: 400 }}>测试代付金额</th>
                                                <th style={{ fontWeight: 400 }}>冻结余额</th>
                                            </tr>
                                            <tr>
                                                <td style={{ fontSize: '20px' }}>{commafy(this.state.form.amount)}</td>
                                                <td style={{ fontSize: '20px' }}>{commafy(this.state.form.df_pool)}</td>
                                                <td style={{ fontSize: '20px' }}>{commafy(this.state.form.test_amount)}</td>
                                                <td style={{ fontSize: '20px' }}>{commafy(this.state.form.test_df_pool)}</td>
                                                <td style={{ fontSize: '20px' }}>{commafy(this.state.form.freeze_pool)}</td>
                                            </tr>
                                        </tbody>
                                    </table>

                                    <div className='mt15'>
                                        <Navbar>
                                            <Navbar.Group>
                                                <Navbar.Heading>
                                                    当前: <strong>{'add' === this.state.dispatch.curr_tabid ? '充值' : '下发'}</strong>
                                                </Navbar.Heading>
                                            </Navbar.Group>
                                            <Navbar.Group align={Alignment.RIGHT}>
                                                <Tabs
                                                    animate={true}
                                                    fill={true}
                                                    id="navbar"
                                                    large={false}
                                                    onChange={(tabid) => {
                                                        this.setState({ dispatch_page_filter: Object.assign({}, this.state.dispatch_page_filter, { page: 1 }) }, function () { this.setState({ dispatch: Object.assign({}, this.state.dispatch, { curr_tabid: tabid }) }) })
                                                    }}
                                                    selectedTabId={this.state.dispatch.curr_tabid}
                                                >
                                                    <Tab id="add" title="充值" icon={"small-plus"} />
                                                    <Tab id="minus" title="下发" icon={"small-minus"} />
                                                </Tabs>
                                            </Navbar.Group>
                                        </Navbar>
                                        <div style={{ marginTop: '15px', width: '100%' }}>
                                            <div className='flex'>
                                                <div style={{ background: '#fff', padding: '15px', width: '100%' }}>
                                                    <FormGroup
                                                        label={'add' === this.state.dispatch.curr_tabid ? '充值金额:' : '下发金额:'}
                                                        labelFor="text-input"
                                                    >
                                                        <InputGroup placeholder="请输入金额" value={this.state.dispatch.amount} onChange={(e) => {
                                                            let amount = e.target.value
                                                            this.setState({ dispatch: Object.assign({}, this.state.dispatch, { amount: amount }) })
                                                        }} />
                                                    </FormGroup>

                                                    <FormGroup
                                                        label="备注"
                                                        labelFor="text-input"
                                                        style={{ marginTop: '10px' }}
                                                    >
                                                        <InputGroup placeholder="请输入备注" value={this.state.dispatch.note} onChange={(e) => {
                                                            let note = e.target.value
                                                            this.setState({ dispatch: Object.assign({}, this.state.dispatch, { note: note }) })
                                                        }} />
                                                    </FormGroup>

                                                    <div className='flex' style={{ marginTop: '10px' }}>
                                                        <div></div>
                                                        <div className='flex'>
                                                            <Button className="ml5" intent={'add' === this.state.dispatch.curr_tabid ? 'Success' : 'Danger'} onClick={() => { this.send_dispatch('RELEASE') }}>{'add' === this.state.dispatch.curr_tabid ? '提交充值' : '提交下发'}-正式</Button>
                                                            <Button className="ml5" intent={'add' === this.state.dispatch.curr_tabid ? 'Success' : 'Danger'} onClick={() => { this.send_dispatch('TEST') }}>{'add' === this.state.dispatch.curr_tabid ? '提交充值' : '提交下发'}-测试</Button>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div></div>
                                            </div>
                                            <div className='mt15'>
                                                <table className='model'>
                                                    <tbody>
                                                        <tr><td>编号</td><td>模式</td><td>旧</td><td>金额</td><td>新</td><td>备注</td><td>时间</td></tr>
                                                        {
                                                            'undefined' !== typeof (this.state.dispatch_pager[this.state.dispatch.curr_tabid]) && this.state.dispatch_pager[this.state.dispatch.curr_tabid].rows.map((da) => {
                                                                return <tr key={"dispatch_add-" + da.id}>
                                                                    <td className='cp'>{da.id}</td>
                                                                    <td className='cp'>{da.module}</td>
                                                                    <td className='cp'>{da.snapshot}</td>
                                                                    <td className='cp'>{da.amount}</td>
                                                                    <td className='cp'>{da.dispatched}</td>
                                                                    <td className='cp'>{da.note}</td>
                                                                    <td className='cp'>{da.created_at}</td>
                                                                </tr>
                                                            })
                                                        }
                                                    </tbody>
                                                </table>
                                            </div>
                                            <div className='mt15'>
                                                <div className="Page flex mt15">
                                                    {
                                                        'undefined' !== typeof (this.state.dispatch_pager[this.state.dispatch.curr_tabid]) && <nav className="pagination-outer" aria-label="Page navigation">
                                                            <ul className="pagination">
                                                                <li className="page-item"><Button onClick={() => { this.dispatch_pager(1) }}>首页</Button></li>
                                                                <li className="page-item"><Button onClick={() => { this.dispatch_pager(parseInt(this.state.dispatch_pager[this.state.dispatch.curr_tabid].pager.page) - 1) }}>上一页</Button></li>
                                                                {
                                                                    this.state.dispatch_pager[this.state.dispatch.curr_tabid].pager.range.map((p) => {
                                                                        return <li className="page-item" key={"_pagination_p_" + p}>
                                                                            <Button
                                                                                intent={parseInt(p) === parseInt(this.state.dispatch_page_filter.page) ? 'primary' : 'None'}
                                                                                onClick={() => { this.dispatch_pager(parseInt(p)) }}
                                                                            >{p}</Button>
                                                                        </li>
                                                                    })
                                                                }
                                                                <li className="page-item"><Button onClick={() => { this.dispatch_pager(parseInt(this.state.dispatch_pager[this.state.dispatch.curr_tabid].pager.page) + 1) }}>下一页</Button></li>
                                                                <li className="page-item"><Button onClick={() => { this.dispatch_pager(parseInt(this.state.dispatch_pager[this.state.dispatch.curr_tabid].pager.pages)) }}>尾页</Button></li>
                                                            </ul>
                                                        </nav>
                                                    }
                                                    <HTMLSelect
                                                        value={this.state.dispatch_page_filter.per}
                                                        onChange={(e) => {
                                                            this.setState({ dispatch_page_filter: { page: 1, per: e.currentTarget.value } }, function () { this.load_dispatch() })
                                                        }}
                                                        options={[1, 5, 10, 15, 20, 30, 50, 100, 500, 1000]} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </PivotItem>

                        </Pivot>
                    </div>
                </div>
                <div className={Classes.DRAWER_FOOTER}>
                    <div className='flex'>
                        <SegmentedControl
                            options={segmented_size}
                            value={this.state.drawer_segmented}
                            onValueChange={(_size) => { this.setState({ drawer_segmented: _size }) }}
                        />
                        <div>
                            <Button intent="None" onChange={this.close_create_dialog}>取消</Button>
                            <Button className="ml15" intent="Primary" onClick={this.post}>更新</Button>
                        </div>
                    </div>
                </div>
            </Drawer>

            <Dialog
                title="禁止使用"
                style={{ width: '680px' }}
                isOpen={this.state.pay_build_dialog.is_open}
                onClose={() => { this.setState({ pay_build_dialog: Object.assign({}, this.state.pay_build_dialog, { is_open: false }) }) }}>
                <DialogBody>
                    {
                        this.state.pay_items.length > 0 && this.state.pay_items.map((pitem) => {
                            console.info(pitem)
                            return <div key={'forbidden_item_' + pitem.name}>
                                <p></p>
                                <table className="model">
                                    <thead>
                                        <tr>
                                            <th>支付方式</th>
                                            <th style={{ width: '100px' }}>启用/禁止</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            pitem.items.map((pii) => {
                                                return <tr key={"pii_" + pii.key}>
                                                    <td>{pii.key}</td>
                                                    <td><Button onClick={() => { this.update_forbidden(pii.mcid, pii.bundle, pii.key, pii.is_disable) }} minimal={false} icon="small-tick" intent={0 === parseInt(pii.is_disable) ? "success" : 'danger'} text="" small={false} /></td>
                                                </tr>
                                            })
                                        }
                                    </tbody>
                                </table>
                            </div>
                        })
                    }

                </DialogBody>

                <DialogFooter minimal={false} actions={<>
                    <Button intent="Success" className="mr10" onClick={this.update_build}>保存</Button>
                    <Button onClick={() => { this.setState({ pay_build_dialog: Object.assign({}, this.state.pay_build_dialog, { is_open: false }) }) }}>关闭</Button>
                </>} />
            </Dialog>


            <Dialog
                title="通道支付方式设置"
                style={{ width: '680px' }}
                isOpen={this.state.pay_method_dialog.is_open}
                onClose={() => { this.setState({ pay_method_dialog: Object.assign({}, this.state.pay_method_dialog, { is_open: false }) }) }}>
                <DialogBody>
                    <table className="model">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>名称</th>
                                <th>手续费</th>
                                <th>单笔费用</th>
                                <th>下限</th>
                                <th>上限</th>
                                <th>是否默认</th>
                                <th>是否激活</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                this.state.pay_methods.map((pm) => {
                                    return <tr key={pm.method + "mcpm_" + pm.id}>
                                        <td>{pm.id}</td>
                                        <td>{pm.name}</td>
                                        <td>
                                            <InputGroup
                                                style={{ width: "80px", TextAlign: 'center' }}
                                                onChange={(e) => { this.sync_pm(pm.method, pm.id, 'pct', e.target.value) }}
                                                value={pm.pct}
                                                placeholder="百分比" />
                                        </td>
                                        <td>
                                            <InputGroup
                                                style={{ width: "80px", TextAlign: 'center' }}
                                                onChange={(e) => { this.sync_pm(pm.method, pm.id, 'sf', e.target.value) }}
                                                value={pm.sf}
                                                placeholder="单笔" />
                                        </td>
                                        <td>
                                            <InputGroup
                                                style={{ width: "80px", TextAlign: 'center' }}
                                                onChange={(e) => { this.sync_pm(pm.method, pm.id, 'min', e.target.value) }}
                                                value={pm.min}
                                                placeholder="下限" />
                                        </td>
                                        <td>
                                            <InputGroup
                                                style={{ width: "80px", TextAlign: 'center' }}
                                                onChange={(e) => { this.sync_pm(pm.method, pm.id, 'max', e.target.value) }}
                                                value={pm.max}
                                                placeholder="上限" />
                                        </td>
                                        <td>
                                            {
                                                '' !== pm.pct && '' !== pm.sf && '' !== pm.min && '' !== pm.max && parseInt(pm.id) !== 0
                                                    ? <Button onClick={() => { this.change_pm_state('is_default', pm.id, 1 === parseInt(pm.is_default) ? 0 : 1) }} icon="small-tick" intent={1 === parseInt(pm.is_default) ? "success" : "danger"} text="" small={true} />
                                                    : ''
                                            }
                                        </td>
                                        <td>
                                            {
                                                '' !== pm.pct && '' !== pm.sf && '' !== pm.min && '' !== pm.max && parseInt(pm.id) !== 0
                                                    ? <Button onClick={() => { this.change_pm_state('is_active', pm.id, 1 === parseInt(pm.is_active) ? 0 : 1) }} icon="small-tick" intent={1 === parseInt(pm.is_active) ? "success" : 'danger'} text="" small={true} />
                                                    : ''
                                            }
                                        </td>
                                    </tr>
                                })
                            }
                        </tbody>
                    </table>
                </DialogBody>

                <DialogFooter minimal={false} actions={<>
                    <Button intent="Success" className="mr10" onClick={this.update_pm}>保存</Button>
                    <Button onClick={() => { this.setState({ pay_method_dialog: Object.assign({}, this.state.pay_method_dialog, { is_open: false }) }) }}>关闭</Button>
                </>} />
            </Dialog>

            <Dialog
                title="预览LOGO"
                style={{ width: '680px' }}
                isOpen={this.state.preview.open}
                onClose={this.closePreview}>
                <DialogBody>
                    <img style={{ maxWidth: '620px', margin: '0px auto' }} src={this.state.preview.src} alt={this.state.preview.alt} />
                </DialogBody>
                <DialogFooter minimal={false} actions={<>
                    <Button onClick={this.closePreview}>关闭</Button>
                </>} />
            </Dialog>

        </div >);
    }

    update_pm = () => {
        let that = this
        let current_pm = {}
        let pms = that.state.pay_methods

        current_pm.action = "update_pm"
        current_pm.request_token = that.state.selected_merchant.request_token
        current_pm.pms = JSON.stringify(pms)
        Ajax("merchant", current_pm, function (json) {
            if (0 === parseInt(json.code)) {
                message.success(json.msg)
                that.open_pay_method_dialog(that.state.pay_method_dialog.bundle, that.state.pay_method_dialog.mcid)
            }
            else {
                message.error(json.msg)
            }
        })
    }

    handleChange = (data) => {
        let that = this
        const { file, fileList } = data
        that.setState({ files: [...fileList] });

        if ("done" === file.status || "removed" === file.status) {
            let arr = []
            fileList.map((p) => {
                if ("ID" === p.uid.substring(0, 2)) {
                    arr.push(p)
                } else {
                    if ("undefined" !== typeof (p.response)) {
                        p.response.uid = p.uid
                        p.response.status = p.status
                        arr.push(p.response)
                    }
                }
            })
            that.setState({ selected_merchant: Object.assign({}, that.state.selected_merchant, { logo: arr }) })
        }
    }
    closePreview = () => {
        let that = this
        that.setState({
            preview: {
                open: false,
                src: '',
                alt: '',
            }
        })
    }
    handlePreview = () => {
        let that = this
        that.setState({
            preview: {
                open: true,
                src: that.state.selected_merchant.logo[0].url,
                alt: '图片预览',
            }
        })
    }

    //不允许的支付item弹窗
    open_build = (bundle, mcid) => {
        let that = this
        Ajax("merchant", {
            action: "pay_build",
            bundle: bundle,
            mcid: mcid,
            request_token: that.state.form.request_token
        }, function (json) {
            that.setState({
                pay_build_dialog: { is_open: true, bundle: bundle, mcid: mcid },
                pay_items: json.items,
            })
        })
    }

    //启用禁止某个支付
    update_forbidden = (mcid, method_bundle, method_item, is_disable) => {
        let that = this
        Ajax("merchant", {
            action: "update_forbidden",
            method_item: method_item,
            method_bundle: method_bundle,
            mcid: mcid,
            is_disable: is_disable,
            request_token: that.state.form.request_token
        }, function (json) {
            if (0 == json.code) {
                message.success(json.msg)
                that.open_build("PAYIN", mcid)
            }
            else {
                message.error(json.msg)
            }
        })
    }

    //设置通道支付方式弹窗
    open_pay_method_dialog = (bundle, mcid) => {
        let that = this
        Ajax("merchant", {
            action: "pay_method",
            bundle: bundle,
            mcid: mcid,
            request_token: that.state.form.request_token
        }, function (json) {
            that.setState({
                pay_method_dialog: { is_open: true, bundle: bundle, mcid: mcid },
                pay_methods: json.data,
            })
        })
    }

    change_pivot = (pv) => {
        let that = this
        if (".$dispatch" === pv) {
            that.load_dispatch()
        }
    }

    dispatch_pager = (page) => {
        let that = this
        if (page <= 1) {
            page = 1;
        }
        if (page >= that.state.dispatch_pager[that.state.dispatch.curr_tabid].pager.pages) {
            page = that.state.dispatch_pager[that.state.dispatch.curr_tabid].pager.pages;
        }
        that.setState({ dispatch_page_filter: Object.assign({}, that.state.dispatch_page_filter, { page: page }) }, function () { that.load_dispatch() })
    }

    load_dispatch = () => {
        let that = this
        Ajax("dispatch", {
            action: "load",
            page: that.state.dispatch_page_filter.page,
            per: that.state.dispatch_page_filter.per,
            request_token: that.state.form.request_token
        }, function (json) {
            that.setState({
                dispatch_pager: json.data
            })
        })
    }

    //提交下发
    send_dispatch = (module) => {
        let that = this
        let data = that.state.dispatch
        data.action = "dispatch"
        data.module = module
        data.merchant_request_token = that.state.form.request_token

        let action_tip = 'add' === that.state.dispatch.curr_tabid ? '充值' : '下发';
        action_tip += 'TEST' === module ? '测试' : '正式';
        action_tip += that.state.dispatch.amount

        Modal.confirm({
            title: '!请慎重操作!',
            content: '确定: ' + action_tip + " 吗?",
            okText: '确认',
            cancelText: '取消',
            onOk() {
                Ajax("dispatch", data, function (json) {
                    if (0 === parseInt(json.code)) {
                        message.success(json.msg)
                        that.setState({
                            dispatch: {
                                curr_tabid: that.state.dispatch.curr_tabid,
                                amount: '',
                                note: '',
                            }
                        })
                        that._show_detail(that.state.selected_merchant.request_token)
                    }
                    else {
                        message.error(json.msg)
                    }
                })
            },
        })
    }

    //移除ip
    remove_ip = (delete_ip) => {
        console.info(delete_ip)
        let that = this
        Modal.confirm({
            title: '!请慎重操作!',
            content: '确定删除IP: ' + delete_ip.ip + " 吗?",
            okText: '确认删除',
            cancelText: '取消',
            onOk() {
                Ajax("merchant", { action: "remove_ip", ip_request_token: delete_ip.request_token, merchant_request_token: that.state.form.request_token }, function (json) {
                    if (0 === json.code) {
                        message.success(json.msg)
                        that._show_detail(that.state.selected_merchant.request_token)
                    } else {
                        message.error(json.msg);
                    }
                })
            },
        })
    }

    //设置ip白名单
    submit_ip = () => {
        let that = this
        let ip = that.state.ip
        //开始提交
        Ajax("merchant", { action: "add_ip_table", bundle: 'PAYOUT_CREATE', ip: ip, request_token: that.state.form.request_token }, function (json) {
            if (0 === json.code) {
                message.success(json.msg)
                that.setState({ ip: "" })
                that._show_detail(that.state.selected_merchant.request_token)
            } else {
                message.error(json.msg);
            }
        })
    }

    //设置冻结金额
    sync_freeze_blance = (e, freeze_blance) => {
        let that = this
        console.info(typeof (e))
        that.setState({
            freeze_blance: freeze_blance
        })
    }
    sync_unfreeze_blance = (e, unfreeze_blance) => {
        let that = this
        console.info(typeof (e))
        that.setState({
            unfreeze_blance: unfreeze_blance
        })
    }

    //点击了冻结按钮
    start_freeze_blance = () => {
        let that = this

        let freeze_blance = that.state.freeze_blance
        if ('' === freeze_blance || parseInt(freeze_blance) < 0) {
            message.error("金额错误")
        }
        else {
            Modal.confirm({
                title: '!请慎重操作!',
                content: '确定冻结: “' + that.state.form.name + "” 的 “" + commafy(freeze_blance) + "” 金额吗?",
                okText: '确认冻结',
                cancelText: '取消',
                onOk() {
                    Ajax("merchant", { action: "freeze", freeze_number: freeze_blance, merchant_request_token: that.state.form.request_token }, function (json) {
                        if (0 === json.code) {
                            Modal.success({
                                title: "结果",
                                content: json.msg
                            })
                            that.setState({
                                freeze_blance: "",
                            })
                            that._show_detail(that.state.selected_merchant.request_token)
                        } else {
                            message.error(json.msg);
                        }
                    })
                },
            })
        }
    }
    start_unfreeze_blance = () => {
        let that = this

        let unfreeze_blance = that.state.unfreeze_blance
        if ('' === unfreeze_blance || parseInt(unfreeze_blance) < 0) {
            message.error("金额错误")
        }
        else {
            Modal.confirm({
                title: '!请慎重操作!',
                content: '确定冻结: “' + that.state.form.name + "” 的 “" + commafy(unfreeze_blance) + "” 金额吗?",
                okText: '确认冻结',
                cancelText: '取消',
                onOk() {
                    Ajax("merchant", { action: "unfreeze", unfreeze_number: unfreeze_blance, merchant_request_token: that.state.form.request_token }, function (json) {
                        if (0 === json.code) {
                            Modal.success({
                                title: "结果",
                                content: json.msg
                            })
                            that.setState({
                                unfreeze_blance: "",
                            })
                            that._show_detail(that.state.selected_merchant.request_token)
                        } else {
                            message.error(json.msg);
                        }
                    })
                },
            })
        }
    }

    _render_category(_name, _handle, _selected) {
        return <Select
            className="mr10"
            items={[{ text: "一类", key: "1" }, { text: "二类", key: "2" }, { text: "三类", key: "3" }]}
            itemPredicate={(query, category) => {
                if ('' === query) {
                    return true
                }
                return (category.text.toLowerCase().indexOf(query.toLowerCase()) >= 0 || parseInt(category.key) === parseInt(query));
            }}
            itemRenderer={(category) => {
                return (
                    <MenuItem
                        active={category.key === _selected.key}
                        disabled={false}
                        key={_name + "_category_" + category.key}
                        label={category.text}
                        onClick={() => {
                            _handle(category)
                        }}
                        onFocus={() => { }}
                        roleStructure="listoption"
                        text={`${category.text}`}
                    />
                );
            }}
            noResults={<MenuItem disabled={true} text="暂无数据" roleStructure="listoption" />}
            onItemSelect={() => { }}
        >
            <Button text={parseInt(_selected.key) > 0 ? _selected.text : '全部类别'} rightIcon="double-caret-vertical" placeholder="筛选分类" />
        </Select>
    }

    _render_counties(_name, _handle, _selected) {
        return <Select
            className="mr10"
            items={this.state.countries}
            itemPredicate={(query, country) => {
                if ('' === query) {
                    return true
                }
                return ((country.key + "," + country.text).indexOf(query.toLowerCase()) >= 0);
            }}
            itemRenderer={(country) => {
                return (
                    <MenuItem
                        active={country.key === _selected.key}
                        disabled={false}
                        key={_name + "_country_" + country.key}
                        label={country.text}
                        onClick={() => {
                            _handle(country)
                        }}
                        onFocus={() => { }}
                        roleStructure="listoption"
                        text={`${country.text}`}
                    />
                );
            }}
            noResults={<MenuItem disabled={true} text="暂无数据" roleStructure="listoption" />}
            onItemSelect={() => { }}
        >
            <Button text={_selected.key !== '' ? _selected.text : '全部国家'} rightIcon="double-caret-vertical" placeholder="筛选国家" />
        </Select>
    }

    _render_proxy(_name, _handle, _selected) {
        console.info(_selected.key)
        return <Select
            className="mr10"
            items={this.state.proxys}
            itemPredicate={(query, proxy) => {
                if ('' === query) {
                    return true
                }
                return ((proxy.key + "," + proxy.text).indexOf(query.toLowerCase()) >= 0);
            }}
            itemRenderer={(proxy) => {
                return (
                    <MenuItem
                        active={proxy.key === _selected.key}
                        disabled={false}
                        key={_name + "_proxy_" + proxy.key}
                        label={proxy.key}
                        onClick={() => {
                            _handle(proxy)
                        }}
                        onFocus={() => { }}
                        roleStructure="listoption"
                        text={`${proxy.text}`}
                    />
                );
            }}
            noResults={<MenuItem disabled={true} text="暂无数据" roleStructure="listoption" />}
            onItemSelect={() => { }}
        >
            <Button text={_selected.key !== '' ? _selected.text : '全部代理'} rightIcon="double-caret-vertical" placeholder="筛选代理" />
        </Select>
    }

    //渲染通道下拉菜单
    _render_channels(_name, _handle, _selected) {
        return <Select
            className="mr10"
            items={this.state.channels}
            itemPredicate={(query, channel) => {
                if ('' === query) {
                    return true
                }
                return ((channel.id + "," + channel.name).indexOf(query) >= 0);
            }}
            itemRenderer={(channel) => {
                return (
                    <MenuItem
                        active={channel.id === _selected.id}
                        disabled={false}
                        key={_name + "_channel_" + channel.id}
                        label={channel.name}
                        onClick={() => {
                            _handle(channel)
                        }}
                        onFocus={() => { }}
                        roleStructure="listoption"
                        text={`${channel.id}-${channel.name}`}
                    />
                );
            }}
            noResults={<MenuItem disabled={true} text="暂无数据" roleStructure="listoption" />}
            onItemSelect={() => { }}
        >
            <Button text={parseInt(_selected.id) !== 0 ? _selected.id + '-' + _selected.name : '全部通道'} rightIcon="double-caret-vertical" placeholder="筛选通道" />
        </Select>
    }
}

export default Index;