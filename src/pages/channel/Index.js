import React, { Component } from 'react';
import { Breadcrumb, Pivot, PivotItem } from '@fluentui/react';
import { Label, Button, ControlGroup, SwitchCard, FormGroup, InputGroup, MenuItem, Dialog, DialogBody, DialogFooter, Drawer, Classes, SegmentedControl, HTMLSelect, Checkbox } from "@blueprintjs/core";
import { Select } from "@blueprintjs/select";
import Ajax from 'components/Ajax';
import { Modal,message } from 'antd';
import { TextField, PrimaryButton } from '@fluentui/react';

const category_map = ["-", "一类", "二类", "三类"]
const drawer_segmented_size = { 'W': '96%', 'M': '64%', 'S': '32%' }
const segmented_size = [{ label: "宽", value: "W", }, { label: "中", value: "M", }, { label: "窄", value: "S", },];

class Index extends Component {
    state = {
        filter: {
            name: "",
            category: { key: 0, text: "" },
            country: { key: "", text: "" },
        },
        countries: [],
        channels: [],
        create_dialog: { isOpen: false },
        detail_drawer: { isOpen: false },
        selected_channel: {
            name: "",
            slug: "",
            request_token: "",
        },
        form: {
            request_token: "",
            name: "",
            slug: "",
            category: { key: 0, text: "" },
            country: { key: "", text: "" },
            _category: '',
            _country: '',
            pi_active: true,
            po_active: true,
        },
        drawer_segmented: 'M',
        pager: {
            page: 1,
            per: 15,
        },
        column_dialog: {
            is_open: false,
            bundle: '',
            id: 0,
            cid: 0,
            pcolumn: '',
            ccolumn: '',
            name: '',
            is_require: true,
            is_show: true,
            summary: '',
        },
        columns: [],
        status_dialog: {
            is_open: false,
            bundle: '',
            id: 0,
            const_status: "",
            channel_code: "",
            summary: '',
        },
        status: [],
        bank_row: { id: 0, bank_name: '', channel_code: '', clean_code: '' },
        bank_rows: [],
        pay_methods: [],
        pay_method_dialog: {
            is_open: false,
            id: 0,
            name: "",
            method: "",
            is_active: true,
            target_channel: { id: 0, name: '' }
        },
        //全部通道
        channel_rows: [],
        rich_bank_code: '',
        bank_count: 0,
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
                that.load_channel()
            }
            else {
                message.error(json.msg);
            }
        })
    }

    //加载通道
    load_channel = () => {
        let that = this
        Ajax("channel", {
            action: "pager",
            filter_name: that.state.filter.name,
            filter_category: that.state.filter.category.key,
            filter_country: that.state.filter.country.key,
            page: that.state.pager.page,
            per: that.state.pager.per,
        }, function (json) {
            if (0 === json.code) {
                that.setState({
                    channels: json.data.channels,
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
        if (page >= that.state.channels.pager.pages) {
            page = that.state.channels.pager.pages;
        }
        that.setState({ pager: Object.assign({}, this.state.pager, { page: page }) }, function () { that.load_channel() })
    }

    //筛选
    filter = () => {
        let that = this
        that.load_channel()
    }

    //重置筛选
    clear_filter = () => {
        let that = this
        that.setState({
            filter: {
                name: "",
                category: { key: 0, text: "" },
                country: { key: "", text: "" },
            }
        }, function () {
            that.load_channel()
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
        Ajax("channel", { action: "detail", request_token: request_token }, function (json) {
            if (0 === json.code) {
                that.setState({
                    selected_channel: json.data,
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

    //打开新建弹窗
    open_create_dialog = () => {
        let that = this
        that.setState({
            create_dialog: { isOpen: true },
            form: {
                request_token: '',
                name: "",
                slug: "",
                category: { key: 0, text: "" },
                country: { key: "", text: "" },
                _category: '',
                _country: '',
                pi_active: true,
                po_active: true,
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
        } else if ('' === this.state.form.slug) {
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
            Ajax("channel", postData, function (json) {
                if (0 === json.code) {
                    that.close_create_dialog();
                    that.hide_detail();
                    that.load_channel();
                    message.success(json.msg);
                } else {
                    message.error(json.msg);
                }
            })
        }
    }

    render() {
        return (<div>
            <div className="PageBreadcrumb" style={{ display: 'inline-block' }}>
                <Breadcrumb items={[{ text: '管理面板', key: 'adminPannel' }, { text: '通道管理', key: 'channel' }, { text: '通道列表', key: 'channel-index' }]} onReduceData={() => undefined} maxDisplayedItems={5} />
            </div>
            <div className='mg15 filter'>
                <ControlGroup {...this.state}>
                    <Label className="mr5">类别:</Label>
                    {
                        this._render_category("_filter", (category) => { this.setState({ filter: Object.assign({}, this.state.filter, { category: category }) }) }, this.state.filter.category)
                    }

                    <Label className="mr5">国家:</Label>
                    {
                        this._render_counties("_filter", (country) => { this.setState({ filter: Object.assign({}, this.state.filter, { country: country }) }) }, this.state.filter.country)
                    }

                    <Label className="mr5">名称:</Label>
                    <InputGroup placeholder="名称" className="mr10" value={this.state.filter.name} onChange={(e) => { this.setState({ filter: Object.assign({}, this.state.filter, { name: e.target.value }) }) }} />
                    <Button intent="primary" icon="filter" className="mr10" onClick={this.filter}>筛选</Button>
                    <Button icon="filter-remove" onClick={this.clear_filter}>重置</Button>
                </ControlGroup>
            </div>

            <div className='flex mg15'>
                <div className='channel-tree card topColor' style={{ width: "100%" }}>
                    <div className="flex mb10">
                        <span>通道列表 {'undefined' !== typeof (this.state.channels.pager) ? '(' + this.state.channels.pager.total + "条记录)" : ''}</span>
                        <div className="flex">
                            <Button intent="success" onClick={this.open_create_dialog}>添加通道</Button>
                        </div>
                    </div>
                    <div className="card_content">
                        <table className='model'>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>类别</th>
                                    <th>名称</th>
                                    <th>国家</th>
                                    <th>代收</th>
                                    <th>代付</th>
                                    <th>余额</th>
                                    <th>创建时间</th>
                                    <th>代收</th>
                                    <th>代付</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    'undefined' !== typeof (this.state.channels.rows) && this.state.channels.rows.map((channel) => {
                                        return <tr key={"channel-" + channel.id} className={''}>
                                            <td className='cp'>{channel.id}</td>
                                            <td className='cp'>{category_map[channel.category]}</td>
                                            <td className='cp'>
                                                {
                                                    1 === parseInt(channel.has_method) ?
                                                        <Button intent="Primary" onClick={() => { this.show_detail(channel.request_token) }}>{channel.name}</Button> :
                                                        <Button onClick={() => { this.show_detail(channel.request_token) }}>{channel.name}</Button>
                                                }
                                            </td>
                                            <td className='cp'>{channel.country}</td>

                                            <td className='cp'>
                                                <p>手续费:{channel.payin_pct}% + 单笔:{channel.payin_sf}</p>
                                                <p>最少:{channel.payin_min} , 最多:{channel.payin_max}</p>
                                            </td>
                                            <td className='cp'>
                                                <p>手续费:{channel.payout_pct}% + 单笔:{channel.payout_sf}</p>
                                                <p>最少:{channel.payout_min} , 最多:{channel.payout_max}</p>
                                            </td>
                                            <td className='cp'>
                                                <table style={{ margin: '0 auto' }}>
                                                    <tbody>
                                                        {
                                                            ('' !== channel.amount && '0' !== channel.amount && 'undefined' !== typeof (channel.amount)) && channel.amount.map((amount) => {
                                                                return <tr key={channel.id + '_amount_' + amount.text}>
                                                                    <td>{amount.text}</td>
                                                                    <td>{amount.amount}</td>
                                                                </tr>
                                                            })
                                                        }
                                                    </tbody>
                                                </table>
                                            </td>

                                            <td className='cp'>
                                                <p className='ubuntu fs12'>{channel.created_at.substr(0, 10)}</p>
                                                <p className='ubuntu fs12'>{channel.created_at.substr(11)}</p>
                                            </td>
                                            <td>
                                                {1 === parseInt(channel.pi_active) ? <Button icon="small-tick" intent={"success"} onClick={() => { this.set_switch('PI',channel) }} /> : <Button icon="small-cross" intent={"danger"} onClick={() => { this.set_switch('PI',channel) }} />}
                                            </td>
                                            <td>
                                                {1 === parseInt(channel.po_active) ? <Button icon="small-tick" intent={"success"} onClick={() => { this.set_switch('PO',channel) }} /> : <Button icon="small-cross" intent={"danger"} onClick={() => { this.set_switch('PO',channel) }} />}
                                            </td>
                                        </tr>
                                    })
                                }
                            </tbody>
                        </table>
                    </div>

                    <div className="Page flex mt15">
                        {
                            'undefined' !== typeof (this.state.channels.pager) && <nav className="pagination-outer" aria-label="Page navigation">
                                <ul className="pagination">
                                    <li className="page-item"><Button onClick={() => { this.goto_pagination(1) }}>首页</Button></li>
                                    <li className="page-item"><Button onClick={() => { this.goto_pagination(parseInt(this.state.channels.pager.page) - 1) }}>上一页</Button></li>
                                    {
                                        this.state.channels.pager.range.map((p) => {
                                            return <li className="page-item" key={"_pagination_p_" + p}>
                                                <Button
                                                    intent={parseInt(p) === parseInt(this.state.channels.pager.page) ? 'primary' : 'None'}
                                                    onClick={() => { this.goto_pagination(parseInt(p)) }}
                                                >{p}</Button>
                                            </li>
                                        })
                                    }
                                    <li className="page-item"><Button onClick={() => { this.goto_pagination(parseInt(this.state.channels.pager.page) + 1) }}>下一页</Button></li>
                                    <li className="page-item"><Button onClick={() => { this.goto_pagination(parseInt(this.state.channels.pager.pages)) }}>尾页</Button></li>
                                </ul>
                            </nav>
                        }
                        <HTMLSelect
                            value={this.state.pager.per}
                            onChange={(e) => {
                                this.setState({ pager: Object.assign({}, this.state.pager, { per: e.currentTarget.value }) }, function () { this.load_channel() })
                            }}
                            options={[1, 5, 10, 15, 20, 30, 50, 100, 500, 1000]} />
                    </div>
                </div>
            </div>

            <Dialog
                title="添加通道"
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
                                placeholder="请输入通道名称" />
                        </FormGroup>
                    </div>

                    <div className='row flex mb10'>
                        <FormGroup
                            fill={true}
                            helperText=""
                            label="别名"
                            labelFor="text-input"
                            labelInfo="(英文字符串，无空格和特殊字符)"
                        >
                            <InputGroup
                                onChange={(e) => { this.setState({ form: Object.assign({}, this.state.form, { slug: e.target.value }) }) }}
                                value={this.state.form.slug}
                                placeholder="请输入通道英文别名" />
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
                        <SwitchCard checked={this.state.form.pi_active} onChange={(e) => { this.setState({ form: Object.assign({}, this.state.form, { pi_active: e.target.checked }) }) }}>代收</SwitchCard>
                        <SwitchCard checked={this.state.form.po_active} onChange={(e) => { this.setState({ form: Object.assign({}, this.state.form, { po_active: e.target.checked }) }) }}>代付</SwitchCard>
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
                title={"通道详情 - " + this.state.selected_channel.name}
                isOpen={this.state.detail_drawer.isOpen}
                style={{ width: drawer_segmented_size[this.state.drawer_segmented] }}
            >
                <div className={Classes.DRAWER_BODY}>
                    <Pivot aria-label="通道信息" defaultSelectedKey="statistics" onLinkClick={(pivot_item) => {
                        if (".$column_map" === pivot_item.key) {
                            this.load_columns()
                        }
                        else if (".$const_status" === pivot_item.key) {
                            this.load_status()
                        }
                        else if (".$bank_code" === pivot_item.key) {
                            this.load_bank_rows()
                        }
                        else if (".$pay_method" === pivot_item.key) {
                            this.load_pay_method()
                        }
                        else {
                            console.info(pivot_item.key)
                        }
                    }}>
                        <PivotItem headerText="基本信息" key="basic">
                            {
                                '' !== this.state.form.request_token ? <div className={Classes.DIALOG_BODY} style={{ 'background': '#aecff12b' }}>
                                    <div className='row flex mb10'>
                                        <FormGroup
                                            fill={true}
                                            label="名称"
                                            labelFor="text-input"
                                        >
                                            <InputGroup
                                                onChange={(e) => { this.setState({ form: Object.assign({}, this.state.form, { name: e.target.value }) }) }}
                                                value={this.state.form.name}
                                                placeholder="请输入通道名称" />
                                        </FormGroup>
                                    </div>

                                    <div className='row flex mb10'>
                                        <FormGroup
                                            fill={true}
                                            helperText=""
                                            label="别名"
                                            labelFor="text-input"
                                            labelInfo="(英文字符串，无空格和特殊字符)"
                                        >
                                            <InputGroup
                                                onChange={(e) => { this.setState({ form: Object.assign({}, this.state.form, { slug: e.target.value }) }) }}
                                                value={this.state.form.slug}
                                                placeholder="请输入通道英文别名" />
                                        </FormGroup>
                                    </div>

                                    <div className='row flex mb10'>
                                        <FormGroup
                                            fill={true}
                                            helperText=""
                                            label="通道电报群组ID"
                                            labelFor="text-input"
                                            labelInfo="(机器人获取)"
                                        >
                                            <InputGroup
                                                onChange={(e) => { this.setState({ form: Object.assign({}, this.state.form, { telegram_group_id: e.target.value }) }) }}
                                                value={this.state.form.telegram_group_id}
                                                placeholder="请输入通道电报群组ID" />
                                        </FormGroup>
                                    </div>

                                    <div className='row mb10'>
                                        <table className='model'>
                                            <thead><tr><th>代收手续费%</th><th>代收单笔费用</th><th>代收下限</th><th>代收上限</th></tr></thead>
                                            <tbody>
                                                <tr>
                                                    <td>
                                                        <InputGroup
                                                            onChange={(e) => { this.setState({ form: Object.assign({}, this.state.form, { payin_pct: e.target.value }) }) }}
                                                            value={this.state.form.payin_pct}
                                                            placeholder="代收手续费" />
                                                    </td>
                                                    <td>
                                                        <InputGroup
                                                            onChange={(e) => { this.setState({ form: Object.assign({}, this.state.form, { payin_sf: e.target.value }) }) }}
                                                            value={this.state.form.payin_sf}
                                                            placeholder="代收单笔费用" />
                                                    </td>
                                                    <td>
                                                        <InputGroup
                                                            onChange={(e) => { this.setState({ form: Object.assign({}, this.state.form, { payin_min: e.target.value }) }) }}
                                                            value={this.state.form.payin_min}
                                                            placeholder="代收下限" />
                                                    </td>
                                                    <td>
                                                        <InputGroup
                                                            onChange={(e) => { this.setState({ form: Object.assign({}, this.state.form, { payin_max: e.target.value }) }) }}
                                                            value={this.state.form.payin_max}
                                                            placeholder="代收上限" />
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className='row mb10'>
                                        <table className='model'>
                                            <thead><tr><th>代付手续费%</th><th>代付单笔费用</th><th>代付下限</th><th>代付上限</th></tr></thead>
                                            <tbody>
                                                <tr>
                                                    <td>
                                                        <InputGroup
                                                            onChange={(e) => { this.setState({ form: Object.assign({}, this.state.form, { payout_pct: e.target.value }) }) }}
                                                            value={this.state.form.payout_pct}
                                                            placeholder="代付手续费" />
                                                    </td>
                                                    <td>
                                                        <InputGroup
                                                            onChange={(e) => { this.setState({ form: Object.assign({}, this.state.form, { payout_sf: e.target.value }) }) }}
                                                            value={this.state.form.payout_sf}
                                                            placeholder="代付单笔费用" />
                                                    </td>
                                                    <td>
                                                        <InputGroup
                                                            onChange={(e) => { this.setState({ form: Object.assign({}, this.state.form, { payout_min: e.target.value }) }) }}
                                                            value={this.state.form.payout_min}
                                                            placeholder="代付下限" />
                                                    </td>
                                                    <td>
                                                        <InputGroup
                                                            onChange={(e) => { this.setState({ form: Object.assign({}, this.state.form, { payout_max: e.target.value }) }) }}
                                                            value={this.state.form.payout_max}
                                                            placeholder="代付上限" />
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
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

                                    <div className='row flex'>
                                        <SwitchCard checked={this.state.form.pi_active} onChange={(e) => { this.setState({ form: Object.assign({}, this.state.form, { pi_active: e.target.checked }) }) }}>代收</SwitchCard>
                                        <SwitchCard checked={this.state.form.po_active} onChange={(e) => { this.setState({ form: Object.assign({}, this.state.form, { po_active: e.target.checked }) }) }}>代付</SwitchCard>
                                    </div>


                                </div> : ''
                            }
                        </PivotItem>
                        <PivotItem headerText="扩展字段" key="column_map">
                            <div className={Classes.DIALOG_BODY} style={{ 'background': '#aecff12b' }}>
                                <div className='flex'>
                                    <div></div>
                                    <div><Button onClick={() => { this.open_column_dialog(0) }}>添加</Button></div>
                                </div>
                                <table className='model mt10'>
                                    <tbody>
                                        <tr><td width="60">编号</td><td>类型</td><td>名称</td><td>平台字段</td><td>通道字段</td><td>必填</td><td>显示</td><td>描述</td><td>管理</td></tr>
                                        {
                                            this.state.columns.length > 0 ? this.state.columns.map((_column) => {
                                                return <tr key={"_column_" + _column.id}>
                                                    <td width="60">{_column.id}</td>
                                                    <td>{_column.bundle}</td>
                                                    <td>{_column.name}</td>
                                                    <td><Button onClick={() => { this.open_column_dialog(_column.id) }}>{_column.pcolumn}</Button></td>
                                                    <td>{_column.ccolumn}</td>
                                                    <td>{1 === parseInt(_column.is_require) ? <Button icon="small-tick" intent={"success"} /> : <Button icon="small-cross" intent={"danger"} />}</td>
                                                    <td>{1 === parseInt(_column.is_show) ? <Button icon="small-tick" intent={"success"} /> : <Button icon="small-cross" intent={"danger"} />}</td>
                                                    <td>{_column.summary}</td>
                                                    <td>
                                                        <Button icon="small-cross" intent={"Danger"} minimal={false} onClick={() => { this.remove_column(_column.id) }}></Button>
                                                    </td>
                                                </tr>
                                            }) : ''
                                        }
                                    </tbody>
                                </table>
                            </div>
                        </PivotItem>
                        <PivotItem headerText="状态码" key="const_status">
                            <div className={Classes.DIALOG_BODY} style={{ 'background': '#aecff12b' }}>
                                <div className='flex'>
                                    <div></div>
                                    <div><Button onClick={() => { this.open_status_dialog(0) }}>添加</Button></div>
                                </div>
                                <table className='model mt10'>
                                    <tbody>
                                        <tr><td width="60">编号</td><td>类型</td><td>const字段</td><td>通道值</td><td>summary</td><td>管理</td></tr>
                                        {
                                            this.state.status.length > 0 ? this.state.status.map((_status) => {
                                                return <tr key={"_status_" + _status.id}>
                                                    <td width="60"><Button onClick={() => { this.open_status_dialog(_status.id) }}>{_status.id}</Button></td>
                                                    <td>{_status.bundle}</td>
                                                    <td>{_status.const_status}</td>
                                                    <td>{_status.channel_code}</td>
                                                    <td>{_status.summary}</td>
                                                    <td>
                                                        <Button icon="small-cross" intent={"Danger"} minimal={false} onClick={() => { this.remove_status(_status.id) }}></Button>
                                                    </td>
                                                </tr>
                                            }) : ''
                                        }
                                    </tbody>
                                </table>
                            </div>
                        </PivotItem>

                        <PivotItem headerText="支付方式" key="pay_method">
                            <div className={Classes.DIALOG_BODY} style={{ 'background': '#aecff12b' }}>
                                <div className='flex'>
                                    <Checkbox checked={this.state.selected_channel.has_method} label="是否启用支付方式" onChange={this.handleChangePayMethod} />
                                    <div><Button onClick={() => { this.open_pay_method_dialog(0) }}>添加</Button></div>
                                </div>
                                <table className='model mt10'>
                                    <tbody>
                                        <tr><td width="60">编号</td><td>名称</td><td>支付类型</td><td>关联通道</td><td>是否激活</td><td>管理</td></tr>
                                        {
                                            this.state.pay_methods.length > 0 ? this.state.pay_methods.map((pay_method) => {
                                                return <tr key={"_pay_method_" + pay_method.id}>
                                                    <td width="60"><Button onClick={() => { this.open_pay_method_dialog(pay_method.id) }}>{pay_method.id}</Button></td>
                                                    <td>{pay_method.name}</td>
                                                    <td>{pay_method.method}</td>

                                                    {
                                                        0 === parseInt(pay_method.target_channel.id) ? <td></td> : <td>{pay_method.target_channel.id} - {pay_method.target_channel.name}</td>
                                                    }

                                                    <td>
                                                        {
                                                            1 === parseInt(pay_method.is_active)
                                                                ? <Button icon="small-tick" intent={"Success"} minimal={false} onClick={() => { this.active_pay_menthd(pay_method.id, 0) }}></Button>
                                                                : <Button icon="small-cross" intent={"Danger"} minimal={false} onClick={() => { this.active_pay_menthd(pay_method.id, 1) }}></Button>
                                                        }
                                                    </td>
                                                    <td>
                                                        <Button icon="small-cross" intent={"Danger"} minimal={false} onClick={() => { this.remove_pay_method(pay_method.id) }}></Button>
                                                    </td>
                                                </tr>
                                            }) : ''
                                        }
                                    </tbody>
                                </table>
                            </div>
                        </PivotItem>

                        <PivotItem headerText="银行代码" key="bank_code">
                            <div className={Classes.DIALOG_BODY} style={{ 'background': '#aecff12b' }}>
                                <table className='model'>
                                    <thead>
                                        <tr><th>通道银行名称</th><th>通道银行代码</th><th>平台代码</th><th width="80"></th></tr>
                                    </thead>
                                    <tfoot>
                                        <tr>
                                            <td>
                                                <TextField value={this.state.bank_row.bank_name} onChange={(e, text) => {
                                                    console.info(e)
                                                    this.setState({ bank_row: Object.assign({}, this.state.bank_row, { bank_name: text }) })
                                                }} />
                                            </td>
                                            <td>
                                                <TextField value={this.state.bank_row.channel_code} onChange={(e, text) => {
                                                    console.info(e)
                                                    this.setState({ bank_row: Object.assign({}, this.state.bank_row, { channel_code: text }) })
                                                }} />
                                            </td>
                                            <td>
                                                <TextField value={this.state.bank_row.clean_code} onChange={(e, text) => {
                                                    console.info(e)
                                                    this.setState({ bank_row: Object.assign({}, this.state.bank_row, { clean_code: text }) })
                                                }} />
                                            </td>
                                            <td><PrimaryButton text="添加" onClick={this.submit_bank_row} /></td>
                                        </tr>
                                    </tfoot>
                                </table>

                                <table className='model'>
                                    <thead>
                                        <tr><th>批量添加银行代码，格式为：平台代码|通道银行代码|银行名称</th></tr>
                                    </thead>
                                    <tfoot>
                                        <tr>
                                            <td>
                                                <TextField
                                                    multiline={true}
                                                    style={{ height: '120px' }}
                                                    value={this.state.rich_bank_code} onChange={(e, text) => {
                                                        console.info(e)
                                                        this.setState({ rich_bank_code: text })
                                                    }} />
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className='flex'>
                                                <span>共{this.state.bank_count}个银行</span>
                                                <PrimaryButton text="批量添加" onClick={this.multi_add_bank} />
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>

                                <table className='model mt10'>
                                    <tbody>
                                        <tr><td>ID</td><td>通道银行名称</td><td>通道银行代码</td><td>平台代码</td><td>管理</td></tr>
                                        {
                                            this.state.bank_rows.length > 0 ? this.state.bank_rows.map((bank_row) => {
                                                return <tr key={"_bank_row_" + bank_row.id}>
                                                    <td width="60"><Button onClick={() => { this.open_bank_row_dialog(_status.id) }}>{bank_row.id}</Button></td>
                                                    <td>{bank_row.bank_name}</td>
                                                    <td>{bank_row.channel_code}</td>
                                                    <td>{bank_row.clean_code}</td>
                                                    <td>
                                                        <Button icon="small-cross" intent={"Danger"} minimal={false} onClick={() => { this.remove_bank_row(bank_row.id) }}></Button>
                                                    </td>
                                                </tr>
                                            }) : ''
                                        }
                                    </tbody>
                                </table>
                            </div>
                        </PivotItem>
                    </Pivot>
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
                title="添加通道字段映射"
                style={{ width: '420px' }}
                isOpen={this.state.column_dialog.is_open}
                onClose={() => { this.setState({ column_dialog: Object.assign({}, this.state.column_dialog, { is_open: false }) }) }}>
                <DialogBody>
                    <div className='row flex mb10'>
                        <FormGroup
                            fill={true}
                            helperText=""
                            label="类型"
                            labelFor="text-input"
                            labelInfo="只能是：PAYIN或者PAYOUT"
                            onReduceData={(text) => { console.info(text) }}
                        >
                            <InputGroup
                                onChange={(e) => { this.setState({ column_dialog: Object.assign({}, this.state.column_dialog, { bundle: e.target.value }) }) }}
                                value={this.state.column_dialog.bundle}
                                placeholder="请输入字段类型" />
                        </FormGroup>
                    </div>

                    <div className='row flex mb10'>
                        <FormGroup
                            fill={true}
                            helperText=""
                            label="字段名称"
                            labelFor="text-input"
                            labelInfo="比如:支付人姓名"
                            onReduceData={(text) => { console.info(text) }}
                        >
                            <InputGroup
                                onChange={(e) => { this.setState({ column_dialog: Object.assign({}, this.state.column_dialog, { name: e.target.value }) }) }}
                                value={this.state.column_dialog.name}
                                placeholder="请输入字段名称" />
                        </FormGroup>
                    </div>

                    <div className='row flex mb10'>
                        <FormGroup
                            fill={true}
                            helperText=""
                            label="平台字段"
                            labelFor="text-input"
                            labelInfo="比如:account_no"
                        >
                            <InputGroup
                                onChange={(e) => { this.setState({ column_dialog: Object.assign({}, this.state.column_dialog, { pcolumn: e.target.value }) }) }}
                                value={this.state.column_dialog.pcolumn}
                                placeholder="请输入平台字段" />
                        </FormGroup>
                    </div>

                    <div className='row flex mb10'>
                        <FormGroup
                            fill={true}
                            helperText=""
                            label="通道字段"
                            labelFor="text-input"
                            labelInfo="比如:AccountNo"
                        >
                            <InputGroup
                                onChange={(e) => { this.setState({ column_dialog: Object.assign({}, this.state.column_dialog, { ccolumn: e.target.value }) }) }}
                                value={this.state.column_dialog.ccolumn}
                                placeholder="请输入通道字段" />
                        </FormGroup>
                    </div>

                    <div className='row flex mb10'>
                        <FormGroup
                            fill={true}
                            helperText=""
                            label="描述"
                            labelFor="text-input"
                            labelInfo="比如:长度为10"
                        >
                            <InputGroup
                                onChange={(e) => { this.setState({ column_dialog: Object.assign({}, this.state.column_dialog, { summary: e.target.value }) }) }}
                                value={this.state.column_dialog.summary}
                                placeholder="请输入描述" />
                        </FormGroup>
                    </div>

                    <div className='row flex'>
                        <SwitchCard checked={this.state.column_dialog.is_require} onChange={(e) => { this.setState({ column_dialog: Object.assign({}, this.state.column_dialog, { is_require: e.target.checked }) }) }}>是否必填</SwitchCard>
                        <SwitchCard checked={this.state.column_dialog.is_show} onChange={(e) => { this.setState({ column_dialog: Object.assign({}, this.state.column_dialog, { is_show: e.target.checked }) }) }}>是否显示</SwitchCard>
                    </div>
                </DialogBody>

                <DialogFooter minimal={false} actions={<>
                    <Button onClick={() => { this.setState({ column_dialog: Object.assign({}, this.state.column_dialog, { is_open: false }) }) }}>关闭</Button>
                    <Button intent="primary" onClick={this.create_column} >确定</Button>
                </>} />
            </Dialog>

            <Dialog
                title="添加通道状态码"
                style={{ width: '420px' }}
                isOpen={this.state.status_dialog.is_open}
                onClose={() => { this.setState({ status_dialog: Object.assign({}, this.state.status_dialog, { is_open: false }) }) }}>
                <DialogBody>
                    <div className='row flex mb10'>
                        <FormGroup
                            fill={true}
                            helperText=""
                            label="类型"
                            labelFor="text-input"
                            labelInfo="只能是：PAYIN或者PAYOUT"
                            onReduceData={(text) => { console.info(text) }}
                        >
                            <InputGroup
                                onChange={(e) => { this.setState({ status_dialog: Object.assign({}, this.state.status_dialog, { bundle: e.target.value }) }) }}
                                value={this.state.status_dialog.bundle}
                                placeholder="请输入字段类型" />
                        </FormGroup>
                    </div>

                    <div className='row flex mb10'>
                        <FormGroup
                            fill={true}
                            helperText=""
                            label="const字段"
                            labelFor="text-input"
                            labelInfo="比如:SUCCESS"
                            onReduceData={(text) => { console.info(text) }}
                        >
                            <InputGroup
                                onChange={(e) => { this.setState({ status_dialog: Object.assign({}, this.state.status_dialog, { const_status: e.target.value }) }) }}
                                value={this.state.status_dialog.const_status}
                                placeholder="请输入const字段" />
                        </FormGroup>
                    </div>

                    <div className='row flex mb10'>
                        <FormGroup
                            fill={true}
                            helperText=""
                            label="通道状态值"
                            labelFor="text-input"
                            labelInfo="比如:2或者success"
                        >
                            <InputGroup
                                onChange={(e) => { this.setState({ status_dialog: Object.assign({}, this.state.status_dialog, { channel_code: e.target.value }) }) }}
                                value={this.state.status_dialog.channel_code}
                                placeholder="请输入通道状态值" />
                        </FormGroup>
                    </div>

                    <div className='row flex mb10'>
                        <FormGroup
                            fill={true}
                            helperText=""
                            label="描述"
                            labelFor="text-input"
                            labelInfo="比如:成功、失败、退款中"
                        >
                            <InputGroup
                                onChange={(e) => { this.setState({ status_dialog: Object.assign({}, this.state.status_dialog, { summary: e.target.value }) }) }}
                                value={this.state.status_dialog.summary}
                                placeholder="请输入描述" />
                        </FormGroup>
                    </div>
                </DialogBody>

                <DialogFooter minimal={false} actions={<>
                    <Button onClick={() => { this.setState({ status_dialog: Object.assign({}, this.state.status_dialog, { is_open: false }) }) }}>关闭</Button>
                    <Button intent="primary" onClick={this.create_status} >确定</Button>
                </>} />
            </Dialog>

            <Dialog
                title="添加通道支付方式"
                style={{ width: '420px' }}
                isOpen={this.state.pay_method_dialog.is_open}
                onClose={() => { this.setState({ pay_method_dialog: Object.assign({}, this.state.pay_method_dialog, { is_open: false }) }) }}>
                <DialogBody>

                    <div className='row flex mb10'>
                        <FormGroup
                            fill={true}
                            helperText=""
                            label="名称"
                            labelFor="text-input"
                            labelInfo="汉字，比如：二维码支付、钱包、虚拟账号"
                            onReduceData={(text) => { console.info(text) }}
                        >
                            <InputGroup
                                onChange={(e) => { this.setState({ pay_method_dialog: Object.assign({}, this.state.pay_method_dialog, { name: e.target.value }) }) }}
                                value={this.state.pay_method_dialog.name}
                                placeholder="请输入支付方式名称" />
                        </FormGroup>
                    </div>

                    <div className='row flex mb10'>
                        <FormGroup
                            fill={true}
                            helperText=""
                            label="method"
                            labelFor="text-input"
                            labelInfo="英文，比如：qris、ewallet、virtual_account"
                        >
                            <InputGroup
                                onChange={(e) => { this.setState({ pay_method_dialog: Object.assign({}, this.state.pay_method_dialog, { method: e.target.value }) }) }}
                                value={this.state.pay_method_dialog.method}
                                placeholder="请输入通道状态值" />
                        </FormGroup>
                    </div>

                    <div className='row mb10'>
                        <Label>选择关联通道，选择此支付方式时，数据发送到此关联通道</Label>
                        <Select
                            fill={true}
                            className="mr10"
                            items={this.state.channel_rows}
                            itemPredicate={(query, channel) => {
                                if ('' === query) {
                                    return true
                                }
                                return ((channel.id + "," + channel.name).indexOf(query.toLowerCase()) >= 0);
                            }}
                            itemRenderer={(channel) => {
                                return (
                                    <MenuItem
                                        active={channel.id === this.state.pay_method_dialog.target_channel.id}
                                        disabled={false}
                                        key={"target_channel_" + channel.id}
                                        label={channel.id}
                                        onClick={() => {
                                            this.setState({ pay_method_dialog: Object.assign({}, this.state.pay_method_dialog, { target_channel: channel }) })
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
                            <Button text={this.state.pay_method_dialog.target_channel.id !== 0 ? this.state.pay_method_dialog.target_channel.name : '全部通道'} rightIcon="double-caret-vertical" placeholder="筛选通道" />
                        </Select>
                    </div>

                    <div className='row flex'>
                        <span></span>
                        <SwitchCard checked={this.state.pay_method_dialog.is_active} onChange={(e) => { this.setState({ pay_method_dialog: Object.assign({}, this.state.pay_method_dialog, { is_active: e.target.checked }) }) }}>是否激活</SwitchCard>
                    </div>
                </DialogBody>

                <DialogFooter minimal={false} actions={<>
                    <Button onClick={() => { this.setState({ pay_method_dialog: Object.assign({}, this.state.pay_method_dialog, { is_open: false }) }) }}>关闭</Button>
                    <Button intent="primary" onClick={this.create_pay_method} >确定</Button>
                </>} />
            </Dialog>
        </div >);
    }

    handleChangePayMethod = (e) => {
        let that = this
        that.setState({ selected_channel: Object.assign({}, that.state.selected_channel, { has_method: e.target.checked }) })
        Ajax("channel", {
            action: "change_pay_method_state",
            request_token: that.state.selected_channel.request_token,
            checked: e.target.checked ? 1 : 0
        }, function (json) {
            if (0 === parseInt(json.code)) {
                message.success(json.msg)
                that.load_channel()
            } else {
                message.error(json.msg)
            }
        })
    }

    //开启或者停止通达的代收和代付
    set_switch = (PIO,channel) => {
        let that = this

        let tip = ''
        if('PI' === PIO)
        {
            tip = 1 === parseInt(channel.pi_active) ? '停止代收' : '开启代收'
        }
        else if('PO' === PIO)
        {
            tip = 1 === parseInt(channel.pi_active) ? '停止代付' : '开启代付'
        }
        else
        {
            alert("Exception:set_switch"+PIO)
        }

        Modal.confirm({
            title: '二次确认',
            content: "确定执行: " + tip + " 操作吗?",
            okText: '确认' + tip,
            cancelText: '取消',
            onOk() {
                Ajax("channel", { action: "set_switch",pio: PIO, request_token: channel.request_token }, function (json) {
                    if (0 === json.code) {
                        that.load_channel()
                    }
                    else {
                        message.error(json.msg);
                    }
                })
            },
        })
    }

    //添加银行
    submit_bank_row = () => {
        let that = this
        if ("" === that.state.bank_row.bank_name) {
            message.error("通道银行名称不能为空")
        }
        else if ("" === that.state.bank_row.channel_code) {
            message.error("通道银行代码不能为空")
        }
        else if ("" === that.state.bank_row.clean_code) {
            message.error("平台代码不能为空")
        }
        else {
            let data = that.state.bank_row
            data.action = "save_bank_row"
            data.channel = that.state.selected_channel.request_token
            Ajax("channel", data, function (json) {
                if (0 === json.code) {
                    message.success(json.msg)
                    that.load_bank_rows()
                    that.setState({
                        bank_row: { id: 0, bank_name: '', channel_code: '', clean_code: '' },
                    })
                }
                else {
                    message.error(json.msg)
                }
            })
        }
    }

    //批量添加银行
    multi_add_bank = () => {
        let that = this
        if ("" === that.state.rich_bank_code) {
            message.error("内容不能为空")
        }
        else {
            let data = {}
            data.action = "multi_add_bank"
            data.rich_bank_code = that.state.rich_bank_code
            data.channel = that.state.selected_channel.request_token
            Ajax("channel", data, function (json) {
                if (0 === json.code) {
                    message.success(json.msg)
                    that.load_bank_rows()
                    that.setState({
                        rich_bank_code: '',
                        bank_row: { id: 0, bank_name: '', channel_code: '', clean_code: '' },
                    })
                }
                else {
                    message.error(json.msg)
                }
            })
        }
    }

    create_column = () => {
        let that = this
        let column_dialog = that.state.column_dialog
        column_dialog.action = "create_column"
        column_dialog.request_token = that.state.selected_channel.request_token

        Ajax("channel", column_dialog, function (json) {
            if (0 === parseInt(json.code)) {
                message.success(json.msg)
                that.setState({ column_dialog: Object.assign({}, that.state.column_dialog, { is_open: false }) })
                that.load_columns()
            } else {
                Modal.error({
                    title: "出错了",
                    content: json.msg
                })
            }
        })
    }

    remove_column = (id) => {
        let that = this
        Ajax("channel", {
            action: "remove_column",
            id: id
        }, function (json) {
            message.success(json.msg)
            that.load_columns()
        })
    }

    load_columns = () => {
        let that = this
        Ajax("channel", {
            action: "load_columns",
            request_token: that.state.selected_channel.request_token,
        }, function (json) {
            that.setState({
                columns: json.data
            })
        })
    }

    create_status = () => {
        let that = this
        let status_dialog = that.state.status_dialog
        status_dialog.action = "create_status"
        status_dialog.request_token = that.state.selected_channel.request_token

        Ajax("channel", status_dialog, function (json) {
            if (0 === parseInt(json.code)) {
                message.success(json.msg)
                that.setState({ status_dialog: Object.assign({}, that.state.status_dialog, { is_open: false }) })
                that.load_status()
            } else {
                Modal.error({
                    title: "出错了",
                    content: json.msg
                })
            }
        })
    }

    create_pay_method = () => {
        let that = this
        let pay_method_dialog = that.state.pay_method_dialog
        pay_method_dialog.action = "create_pay_method"
        pay_method_dialog.request_token = that.state.selected_channel.request_token
        pay_method_dialog.target_cid = pay_method_dialog.target_channel.id

        Ajax("channel", pay_method_dialog, function (json) {
            if (0 === parseInt(json.code)) {
                message.success(json.msg)
                that.setState({ pay_method_dialog: Object.assign({}, that.state.pay_method_dialog, { is_open: false }) })
                that.load_pay_method()
            } else {
                message.error(json.msg)
            }
        })
    }

    remove_status = (id) => {
        let that = this
        Ajax("channel", {
            action: "remove_status",
            id: id
        }, function (json) {
            message.success(json.msg)
            that.load_status()
        })
    }

    remove_pay_method = (id) => {
        let that = this
        Ajax("channel", {
            action: "remove_pay_method",
            id: id
        }, function (json) {
            message.success(json.msg)
            that.load_pay_method()
        })
    }

    active_pay_menthd = (id, active) => {
        let that = this
        Ajax("channel", {
            action: "active_pay_menthd",
            id: id,
            active: active
        }, function (json) {
            message.success(json.msg)
            that.load_pay_method()
        })
    }

    load_status = () => {
        let that = this
        Ajax("channel", {
            action: "load_status",
            request_token: that.state.selected_channel.request_token,
        }, function (json) {
            that.setState({
                status: json.data
            })
        })
    }

    load_bank_rows = () => {
        let that = this
        Ajax("channel", {
            action: "load_bank_rows",
            request_token: that.state.selected_channel.request_token,
        }, function (json) {
            that.setState({
                bank_rows: json.data.bank_codes,
                bank_count: json.data.count,
            })
        })
    }

    load_pay_method = () => {
        let that = this
        Ajax("channel", {
            action: "load_pay_method",
            request_token: that.state.selected_channel.request_token,
        }, function (json) {
            that.setState({
                pay_methods: json.data
            })
        })
    }

    remove_bank_row = (id) => {
        let that = this
        Ajax("channel", {
            action: "remove_bank_row",
            id: id
        }, function (json) {
            message.success(json.msg)
            that.load_bank_rows()
        })
    }

    open_column_dialog = (id) => {
        let that = this

        if (parseInt(id) > 0) {
            Ajax("channel", {
                action: "fetch_columns",
                id: id,
            }, function (json) {
                let column_dialog = json.data
                column_dialog.is_open = true

                that.setState({
                    column_dialog: column_dialog
                })
            })
        } else {
            that.setState({
                column_dialog: {
                    is_open: true,
                    bundle: '',
                    id: id,
                    cid: 0,
                    pcolumn: '',
                    ccolumn: '',
                    name: '',
                    is_require: true,
                    is_show: true,
                    summary: '',
                }
            })
        }
    }

    open_status_dialog = (id) => {
        let that = this

        if (parseInt(id) > 0) {
            Ajax("channel", {
                action: "fetch_status",
                id: id,
            }, function (json) {
                let status_dialog = json.data
                status_dialog.is_open = true

                that.setState({
                    status_dialog: status_dialog
                })
            })
        } else {
            that.setState({
                status_dialog: {
                    is_open: true,
                    bundle: '',
                    id: 0,
                    const_status: "",
                    channel_code: "",
                    summary: '',
                }
            })
        }
    }

    open_pay_method_dialog = (id) => {
        let that = this

        //载入全部通道
        if (that.state.channel_rows.length < 1) {
            Ajax("channel", {
                action: "load_all",
            }, function (json) {
                if (0 === json.code) {
                    that.setState({
                        channel_rows: json.data,
                    })
                    that._fetch_pay_method(id)
                }
                else {
                    message.error(json.msg);
                }
            })
        }
        else {
            that._fetch_pay_method(id)
        }
    }

    _fetch_pay_method(id) {
        let that = this
        if (parseInt(id) > 0) {
            Ajax("channel", {
                action: "fetch_pay_method",
                id: id,
            }, function (json) {
                let pay_method_dialog = json.data
                pay_method_dialog.is_open = true

                that.setState({
                    pay_method_dialog: pay_method_dialog
                })
            })
        } else {
            that.setState({
                pay_method_dialog: {
                    is_open: true,
                    id: 0,
                    name: "",
                    method: "",
                    is_active: true,
                    target_channel: { id: 0, name: '' }
                }
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
}

export default Index;