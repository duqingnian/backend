import React, { Component } from 'react';
import { Breadcrumb, Pivot, PivotItem } from '@fluentui/react';
import { Label, SwitchCard, Button, ControlGroup, FormGroup, InputGroup } from "@blueprintjs/core";
import { Dialog, DialogBody, DialogFooter, Drawer, Classes, Switch, SegmentedControl, HTMLSelect, Checkbox } from "@blueprintjs/core";
import Ajax from 'components/Ajax';
import { message } from 'antd';

const drawer_segmentedSize = { 'W': '92%', 'M': '760px', 'S': '460px' }
const segmented_size = [{ label: "宽", value: "W", }, { label: "中", value: "M", }, { label: "窄", value: "S", },];

class Index extends Component {
    state = {
        filter: {
            name: "",
        },
        proxys: [],
        create_dialog: { isOpen: false },
        detail_drawer: { isOpen: false },
        selected_proxy: {
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
            google_secret: '',
            vip_google_secret: '',
        },
        drawer_segmented: 'M',
        pager: {
            page: 1,
            per: 15,
        },
        //代理详情 - 通道 popover
        popover: {},

        countries: [],
    }

    componentDidMount() {
        this.load_proxy();
    }
    //加载代理
    load_proxy = () => {
        let that = this
        Ajax("proxy", {
            action: "pager",
            filter_name: that.state.filter.name,
            page: that.state.pager.page,
            per: that.state.pager.per,
        }, function (json) {
            if (0 === json.code) {
                that.setState({
                    proxys: json.data.proxys,
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
        if (page >= that.state.proxys.pager.pages) {
            page = that.state.proxys.pager.pages;
        }
        that.setState({ pager: Object.assign({}, that.state.pager, { page: page }) }, function () { that.load_proxy() })
    }

    //筛选
    filter = () => {
        let that = this
        that.load_proxy()
    }

    //重置筛选
    clear_filter = () => {
        let that = this
        that.setState({
            filter: {
                name: "",
            }
        }, function () {
            that.load_proxy()
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
        Ajax("proxy", { action: "detail", request_token: request_token }, function (json) {
            if (0 === json.code) {
                that.setState({
                    selected_proxy: json.data.proxy,
                    countries: json.data.countries,
                    form: json.data.proxy,
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
                is_active: false,
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
        } else {
            let postData = that.state.form
            postData.action = "create"

            Ajax("proxy", postData, function (json) {
                if (0 === json.code) {
                    that.close_create_dialog();
                    that.hide_detail();
                    that.load_proxy();
                    message.success(json.msg);
                } else {
                    message.error(json.msg);
                }
            })
        }
    }

    change_merchant = (merchant_id, box) => {
        let that = this
        Ajax("proxy", {
            action: "change_merchant",
            request_token: that.state.selected_proxy.request_token,
            merchant_id: merchant_id,
            state: box.target.checked
        }, function (json) {
            if (0 === json.code) {
                that.load_proxy()
                that.show_detail(that.state.selected_proxy.request_token)
                message.success(json.msg);
            } else {
                message.error(json.msg);
            }
        })
    }

    render() {
        return (<div>
            <div className="PageBreadcrumb" style={{ display: 'inline-block' }}>
                <Breadcrumb items={[{ text: '管理面板', key: 'adminPannel' }, { text: '代理管理', key: 'proxy' }, { text: '代理列表', key: 'proxy-index' }]} onReduceData={() => undefined} maxDisplayedItems={5} />
            </div>
            <div className='mg15 filter pr' style={{ height: '30px' }}>
                <ControlGroup {...this.state} className="pa" style={{ height: '30px', background: "transparent" }}>
                    <Label className="mr5">名称:</Label>
                    <InputGroup placeholder="名称" className="mr10" value={this.state.filter.name} onChange={(e) => { this.setState({ filter: Object.assign({}, this.state.filter, { name: e.target.value }) }) }} />
                    <Button intent="primary" icon="filter" className="mr10" onClick={this.filter}>筛选</Button>
                    <Button icon="filter-remove" onClick={this.clear_filter}>重置</Button>
                </ControlGroup>
                <div className='cc'></div>
            </div>

            <div className='flex mg15'>
                <div className='proxy-tree card topColor' style={{ width: "100%" }}>
                    <div className="flex mb10">
                        <span>代理列表 {'undefined' !== typeof (this.state.proxys.pager) ? '(' + this.state.proxys.pager.total + "条记录)" : ''}</span>
                        <div className="flex">
                            <Button onClick={this.open_create_dialog} intent="success">添加代理</Button>
                        </div>
                    </div>
                    <div className="card_content">
                        <table className='model'>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>名称</th>
                                    <th>账号</th>
                                    <th>余额</th>
                                    <th>商户数量</th>
                                    <th>今日数据</th>
                                    <th>总数据</th>
                                    <th>启停</th>
                                    <th>创建时间</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    'undefined' !== typeof (this.state.proxys.rows) && this.state.proxys.rows.map((proxy) => {
                                        return <tr key={"proxy-" + proxy.id} className={''}>
                                            <td className='cp'>
                                                <Button minimal={true} onClick={() => { this.show_detail(proxy.request_token) }}>{proxy.id}</Button>
                                            </td>
                                            <td className='cp'>
                                                <Button minimal={true} onClick={() => { this.show_detail(proxy.request_token) }}>{proxy.name}</Button>
                                            </td>

                                            <td className='cp'>{proxy.account}</td>
                                            <td className='cp'>-</td>
                                            <td className='cp'>-</td>
                                            <td className='cp'>-</td>
                                            <td className='cp'>-</td>
                                            <td>{1 === parseInt(proxy.is_active) ? <Button minimal={true} icon="small-tick" intent={"success"} text="" small={true} /> : <Button minimal={true} icon="small-cross" intent={"danger"} text="" small={true} />}</td>
                                            <td className='cp'>
                                                <p className='ubuntu fs12'>{proxy.created_at.substr(0, 10)}</p>
                                                <p className='ubuntu fs12'>{proxy.created_at.substr(11)}</p>
                                            </td>
                                        </tr>
                                    })
                                }
                            </tbody>
                        </table>
                    </div>

                    <div className="Page flex mt15">
                        {
                            'undefined' !== typeof (this.state.proxys.pager) && <nav className="pagination-outer" aria-label="Page navigation">
                                <ul className="pagination">
                                    <li className="page-item"><Button onClick={() => { this.goto_pagination(1) }}>首页</Button></li>
                                    <li className="page-item"><Button onClick={() => { this.goto_pagination(parseInt(this.state.proxys.pager.page) - 1) }}>上一页</Button></li>
                                    {
                                        this.state.proxys.pager.range.map((p) => {
                                            return <li className="page-item" key={"_pagination_p_" + p}>
                                                <Button
                                                    intent={parseInt(p) === parseInt(this.state.proxys.pager.page) ? 'primary' : 'None'}
                                                    onClick={() => { this.goto_pagination(parseInt(p)) }}
                                                >{p}</Button>
                                            </li>
                                        })
                                    }
                                    <li className="page-item"><Button onClick={() => { this.goto_pagination(parseInt(this.state.proxys.pager.page) + 1) }}>下一页</Button></li>
                                    <li className="page-item"><Button onClick={() => { this.goto_pagination(parseInt(this.state.proxys.pager.pages)) }}>尾页</Button></li>
                                </ul>
                            </nav>
                        }
                        <HTMLSelect
                            value={this.state.pager.per}
                            onChange={(e) => {
                                this.setState({ pager: Object.assign({}, this.state.pager, { per: e.currentTarget.value }) }, function () { this.load_proxy() })
                            }}
                            options={[1, 5, 10, 15, 20, 30, 50, 100, 500, 1000]} />
                    </div>
                </div>
            </div>

            <Dialog
                title="添加代理"
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
                                placeholder="请输入代理名称" />
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

                    <div className='row flex'>
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
                title={"代理详情 - " + this.state.selected_proxy.name}
                isOpen={this.state.detail_drawer.isOpen}
                style={{ width: drawer_segmentedSize[this.state.drawer_segmented] }}
            >
                <div className={Classes.DRAWER_BODY}>
                    <div className='pd15'>
                        <Pivot aria-label="代理信息" defaultSelectedKey="basic" onLinkClick={(pivot_item) => { this.change_pivot(pivot_item.key) }}>
                            <PivotItem headerText="基本信息" key="basic">
                                {
                                    '' !== this.state.form.request_token ? <div className='pd15' style={{ 'background': 'rgba(233, 233, 234, 0.17)' }}>
                                        <div className='row flex mb10'>
                                            <FormGroup
                                                fill={true}
                                                label="名称"
                                                labelFor="text-input"
                                            >
                                                <InputGroup
                                                    onChange={(e) => { this.setState({ form: Object.assign({}, this.state.form, { name: e.target.value }) }) }}
                                                    value={this.state.form.name}
                                                    placeholder="请输入代理名称" />
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
                                                    placeholder="请输入代理登录账号" />
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
                                                    placeholder="请输入代理登录密码" />
                                            </FormGroup>
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
                                            </div>
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

                            <PivotItem headerText="所属商户" key="countries">
                                {
                                    this.state.countries.map((country) => {
                                        return <div key={"item_" + country.slug}>
                                            <div className='country_name' style={{ background: '#e8f4ff', fontSize: '14px', padding: '6px' }}>{country.name}</div>
                                            <div className='mb15' style={{ paddingTop: '0px', background: '#ebf4fb4f', padding: '10px' }}>
                                                {
                                                    country.merchants.map((merchant_item) => {
                                                        return <Checkbox disabled={
                                                            parseInt(merchant_item.proxy_id) > 0 && merchant_item.proxy_id !== this.state.selected_proxy.id
                                                        } onChange={(e) => { this.change_merchant(merchant_item.id, e) }} checked={merchant_item.proxy_id === this.state.selected_proxy.id} className='fl mr15 mt10 mb10' style={{ width: '100px' }} key={"MN_" + merchant_item.id} label={merchant_item.name} />
                                                    })
                                                }
                                                <div className='cc'></div>
                                            </div>
                                        </div>
                                    })
                                }
                            </PivotItem>

                            <PivotItem headerText="余额" key="blance">
                                <div className='flex mt5 mb10'>
                                    <span>上次结算时间:0000-00-00 00:00:00</span>
                                    <Button icon="refresh" text="刷新" />
                                </div>
                                <table className='model'>
                                    <tr><th>国家</th><th>余额</th><th>上次结算时间</th></tr>
                                </table>
                            </PivotItem>

                            <PivotItem headerText="下发" key="dispatch">下发</PivotItem>
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
        </div >);
    }

    change_pivot = (pv) => {
        //let that = this
        if (".$dispatch" === pv) {
            //that.load_dispatch()
        }
    }
}

export default Index;