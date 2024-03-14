import React, { Component } from 'react';
import { Breadcrumb, DatePicker, Dropdown, DefaultButton } from '@fluentui/react';
import Ajax from 'components/Ajax';
import DayPickerStrings from 'components/Cn'
import { Button, SegmentedControl } from "@blueprintjs/core";
import './Home.css'

const dropdownStyles = { dropdown: { width: 120 } };
const category_options = [
    { key: "", text: "全部" },
    { key: "1", text: "一类" },
    { key: "2", text: "二类" },
    { key: "3", text: "三类" },
]
const category_map = ["-", "一类", "二类", "三类"]
const currency_options = [
    { key: "", text: "默认" },
    { key: "USDT", text: "转成 USDT" },
    { key: "RMB", text: "转成 人民币" },
]

function commafy(num) {
    if (undefined === num || 'undefined' === typeof (num)) {
        return;
    }
    if (null === num || '' === num || 'undefined' === num) {
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
}

class Index extends Component {
    state = {
        date1: '',
        date2: '',
        today: null,      //今天
        monthStart: null, //date格式的开始时间
        category: { key: '', text: '' },
        currency: { key: '', text: '' },
        country_list: [],
        collapse_all: true,
        segment: 'ACTIVE',
    }

    componentDidMount() {
        //初始化 date格式化的开始时间和结束时间
        var now = new Date();
        var monthStart = new Date(now.getFullYear(), now.getMonth(), 1); // 获取本月第一天的日期时间
        var monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59); // 获取本月最后一天的日期时间（时间为23:59:59）
        this.setState({
            today: now,
            monthStart: monthStart,
            monthEnd: monthEnd,
            date1: this.dateFormat("YYYY-mm-dd", now),
            date2: this.dateFormat("YYYY-mm-dd", now),
        }, function () {
            this.load_data()
        })
    }

    load_data = () => {
        let that = this
        Ajax("home", {
            action: "load",
            date1: that.state.date1,
            date2: that.state.date2,
            category: that.state.category.key,
            currency: that.state.currency.key
        }, function (json) {
            that.setState({
                country_list: json.country_list,
            })
        })
    }

    //收起全部
    change_all_collapsible = () => {
        let that = this

        let collapse_all = !that.state.collapse_all

        let country_list = that.state.country_list
        country_list.map((country) => {
            country.collapsible = collapse_all ? 1 : 0
        })
        that.setState({
            collapse_all: collapse_all,
            country_list: country_list
        })
    }

    //收起单个
    change_collapsible = (country_slug) => {
        let that = this
        let country_list = that.state.country_list
        country_list.map((country) => {
            if (country.country_slug === country_slug) {
                country.collapsible = 1 === parseInt(country.collapsible) ? 0 : 1
            }
        })
        that.setState({
            country_list: country_list
        })
    }

    //修改类型
    change_categoy = (e, _category) => {
        let that = this
        that.setState({
            category: _category
        }, function () {
            that.load_data()
        })
    }

    //转换货币
    change_currency = (e, _currency) => {
        let that = this
        that.setState({
            currency: _currency
        }, function () {
            that.load_data()
        })
    }

    render() {
        return (<div>
            <div className="PageBreadcrumb" style={{ display: 'inline-block' }}>
                <Breadcrumb items={[{ text: '管理面板', key: 'adminPannel' }, { text: '工作台', key: 'statistics' }, { text: '平台数据', key: 'DataStatistics' }]} onReduceData={() => undefined} maxDisplayedItems={5} />
            </div>
            <div className='mt10' style={{ padding: '0px 10px' }}>
                <div className='flex' style={{ alignItems: 'center', justifyContent: 'space-between' }}>
                    <div className='menus flex'>
                        <DatePicker
                            firstDayOfWeek={1}
                            showMonthPickerAsOverlay={true}
                            placeholder="日期选择"
                            formatDate={this.formatDate}
                            strings={DayPickerStrings}
                            onSelectDate={this.change_date1}
                            className="DatePicker mr5"
                            componentRef={this.Date1Ref}
                            value={this.state.today}
                            style={{ width: '120px' }}
                        />
                        <span>-</span>
                        <DatePicker
                            firstDayOfWeek={1}
                            showMonthPickerAsOverlay={true}
                            placeholder="日期选择"
                            formatDate={this.formatDate}
                            strings={DayPickerStrings}
                            onSelectDate={this.change_date2}
                            className="DatePicker mr15 ml5"
                            componentRef={this.Date2Ref}
                            value={this.state.today}
                            style={{ width: '120px' }}
                        />
                        <Dropdown
                            className="mr15"
                            placeholder="选择类型"
                            label=""
                            options={category_options}
                            defaultSelectedKey={this.state.category.key}
                            onChange={this.change_categoy}
                            styles={dropdownStyles}
                        />
                        <Dropdown
                            placeholder="货币转换"
                            label=""
                            options={currency_options}
                            defaultSelectedKey={this.state.currency.key}
                            onChange={this.change_currency}
                            styles={dropdownStyles}
                        />
                        <Button onClick={this.load_data} className='ml15'>刷新</Button>
                    </div>
                </div>

                <div className='mt15 flex'>
                    <Button onClick={this.change_all_collapsible}>{this.state.collapse_all ? '全部收起' : '全部展开'}</Button>

                    <SegmentedControl
                        options={[
                            { label: "产生交易商户", value: "ACTIVE", },
                            { label: "全部商户", value: "ALL", },
                        ]}
                        value={this.state.segment}
                        onValueChange={(status) => {
                            this.setState({ segment: status })
                        }}
                    />
                </div>

                <div className='AccordionPanelNoPadding mt15' style={{ padding: '0px', paddingBottom: '20px', marginBottom: '20px' }}>
                    <div id="Accordion">
                        {
                            this.state.country_list.length > 0 && this.state.country_list.map((country) => {
                                country.amount = 0;
                                return <div className='AccordionItem' key={"country_" + country.country_slug}>
                                    <div className='AccordionHead'><DefaultButton onClick={() => { this.change_collapsible(country.country_slug) }} iconProps={{ iconName: country.collapsible ? 'ChevronUp' : 'ChevronDown' }} text={country.country_name} style={{ background: '#FAFAFB', border: '0px' }} />
                                        <span style={{ color: '#757575' }}>  通道数量: {country.channel_count} - 商户数量：{country.merchant_count}</span>
                                    </div>
                                    <table className='model' style={{ marginBottom: '15px', borderTop: '0px', borderLeft: '0px', borderRight: '0px' }}>
                                        <thead>
                                            <tr>
                                                <th style={{ borderTop: '0px', borderLeft: '0px' }}>商户</th>
                                                <th style={{ borderTop: '0px' }}>余额({country.currency})</th>
                                                <th style={{ borderTop: '0px' }}>类型</th>
                                                <th style={{ borderTop: '0px' }}>代收</th>
                                                <th style={{ borderTop: '0px' }}>代收笔数</th>
                                                <th style={{ borderTop: '0px' }}>请求</th>
                                                <th style={{ borderTop: '0px' }}>请求笔数</th>
                                                <th style={{ borderTop: '0px' }}>请求失败</th>
                                                <th style={{ borderTop: '0px' }}>代付</th>
                                                <th style={{ borderTop: '0px' }}>代付笔数</th>
                                                <th style={{ borderTop: '0px' }}>等待代付</th>
                                                <th style={{ borderTop: '0px' }}>冻结</th>
                                                <th style={{ borderTop: '0px' }}>充值</th>
                                                <th style={{ borderTop: '0px' }}>提现</th>
                                                <th style={{ borderTop: '0px' }}>总手续费</th>
                                                <th style={{ borderTop: '0px' }}>三方手续费</th>
                                                <th style={{ borderTop: '0px' }}>代理手续费</th>
                                                <th style={{ borderTop: '0px', borderRight: '0px' }}>成功率(%)</th>
                                            </tr>
                                        </thead>
                                        {
                                            1 === parseInt(country.collapsible) ? <tbody>
                                                {
                                                    country.sh_list.map((sh) => {
                                                        country.amount += ('ACTIVE' === this.state.segment && 0 === parseInt(sh.payin_succ_count) && 0 === parseInt(sh.topop) && 0 === parseInt(sh.withrawal) && 0 === parseInt(sh.payout_succ_count)) ? 0 : sh.amount;
                                                        return ('ACTIVE' === this.state.segment && 0 === parseInt(sh.payin_succ_count) && 0 === parseInt(sh.topop) && 0 === parseInt(sh.withrawal) && 0 === parseInt(sh.payout_succ_count)) ? '' : <tr key={"sh_" + sh.name} data-shid={sh.id}>
                                                            <td style={{ borderLeft: '0px' }}>{sh.name}</td>
                                                            <td style={{ borderLeft: '0px' }}>{sh.amount}</td>
                                                            <td data-name="类型">{category_map[sh.category]}</td>
                                                            <td data-name="代收" style={{ color: 0.00 === parseFloat(sh.payin_succ_amount) ? '#ccc' : '#000' }}>{commafy(sh.payin_succ_amount)}</td>
                                                            <td data-name="代收笔数" style={{ color: 0 === parseInt(sh.payin_succ_count) ? '#ccc' : '#000' }}>{commafy(sh.payin_succ_count)}</td>
                                                            <td data-name="请求" style={{ color: 0.00 === parseFloat(sh.payin_request_amount) ? '#ccc' : '#000' }}>{commafy(sh.payin_request_amount)}</td>
                                                            <td data-name="请求笔数" style={{ color: 0 === parseInt(sh.payin_request_count) ? '#ccc' : '#000' }}>{commafy(sh.payin_request_count)}</td>
                                                            <td data-name="请求失败">{parseInt(sh.payin_request_count) - parseInt(sh.payin_succ_count)}</td>
                                                            <td data-name="代付" style={{ color: 0.00 === parseFloat(sh.payout_succ_amount) ? '#ccc' : '#000' }}>{commafy(sh.payout_succ_amount)}</td>
                                                            <td data-name="代付笔数" style={{ color: 0 === parseInt(sh.payout_succ_count) ? '#ccc' : '#000' }}>{commafy(sh.payout_succ_count)}</td>
                                                            <td data-name="等待代付" style={{ color: 0 === parseInt(sh.payout_queue) ? '#ccc' : '#000' }}>{commafy(sh.payout_queue)}</td>
                                                            <td data-name="冻结" style={{ color: 0 === parseInt(sh.freeze) ? '#ccc' : '#000' }}>{commafy(sh.freeze)}</td>
                                                            <td data-name="充值" style={{ color: 0 === parseInt(sh.topop) ? '#ccc' : '#000' }}>{commafy(sh.topop)}</td>
                                                            <td data-name="提现" style={{ color: 0 === parseInt(sh.withrawal) ? '#ccc' : '#000' }}>{commafy(sh.withrawal)}</td>
                                                            <td data-name="总手续费" style={{ color: 0 === parseInt(sh.sh_fee) ? '#ccc' : '#000' }}>{commafy(sh.sh_fee)}</td>
                                                            <td data-name="三方手续费" style={{ color: 0 === parseInt(sh.channel_fee) ? '#ccc' : '#000' }}>{commafy(sh.channel_fee)}</td>
                                                            <td data-name="代理手续费" style={{ color: 0 === parseInt(sh.proxy_fee) ? '#ccc' : '#000' }}>{commafy(sh.proxy_fee)}</td>
                                                            <td data-name="成功率" style={{ borderRight: '0px' }}>{sh.payin_succ_pct > 0 ? sh.payin_succ_pct.toFixed(2) + "%" : '-'}</td>
                                                        </tr>
                                                    })
                                                }
                                            </tbody> : ''
                                        }
                                        <tfoot>
                                            <tr>
                                                <td className="bold" style={{ borderLeft: '0px' }}>合计</td>
                                                <td className="bold">{commafy(country.amount)}</td>
                                                <td>-</td>
                                                <td className="bold">{commafy(country.payin_succ_amount)}</td>
                                                <td className="bold">{commafy(country.payin_succ_count)}</td>
                                                <td className="bold">{commafy(country.payin_request_amount)}</td>
                                                <td className="bold">{commafy(country.payin_request_count)}</td>
                                                <td className="bold">{country.payin_request_count - country.payin_succ_count}</td>
                                                <td className="bold">{commafy(country.payout_succ_amount)}</td>
                                                <td className="bold">{commafy(country.payout_succ_count)}</td>
                                                <td className="bold" data-name="等待代付">{commafy(country.payout_queue)}</td>
                                                <td className="bold">{commafy(country.freeze)}</td>
                                                <td className="bold">{commafy(country.topop)}</td>
                                                <td className="bold">{commafy(country.withrawal)}</td>
                                                <td className="bold">{commafy(country.sh_fee)}</td>
                                                <td className="bold">{commafy(country.channel_fee)}</td>
                                                <td className="bold">{commafy(country.proxy_fee)}</td>
                                                <td className="bold" style={{ borderRight: '0px' }}>{country.payin_succ_pct.toFixed(2)}%</td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            })
                        }
                    </div>
                </div>
            </div>
        </div>
        );
    }

    Date1Ref = (ref1) => { if (null === this.state.date1_ref) { this.setState({ date1_ref: ref1 }) } }
    Date2Ref = (ref2) => { if (null === this.state.date2_ref) { this.setState({ date2_ref: ref2 }) } }

    change_date1 = (_date) => {
        let that = this
        if ('undefined' != typeof (_date)) {
            that.setState({
                date1: this.dateFormat("YYYY-mm-dd", _date),
            }, function () {
                /*this.load_log()*/
            })
        }
    }
    change_date2 = (_date) => {
        let that = this
        if ('undefined' != typeof (_date)) {
            that.setState({
                date2: this.dateFormat("YYYY-mm-dd", _date),
            }, function () {
                /*this.load_log()*/
            })
        }
    }

    //格式化日期
    dateFormat(fmt, date) {
        if ('undefined' === date || 'undefined' === typeof (date)) {
            return null;
        }
        let ret;
        const opt = {
            "Y+": date.getFullYear().toString(),        // 年
            "m+": (date.getMonth() + 1).toString(),     // 月
            "d+": date.getDate().toString(),            // 日
            "H+": date.getHours().toString(),           // 时
            "M+": date.getMinutes().toString(),         // 分
            "S+": date.getSeconds().toString()          // 秒
        };
        for (let k in opt) {
            ret = new RegExp("(" + k + ")").exec(fmt);
            if (ret) {
                fmt = fmt.replace(ret[1], (ret[1].length === 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, "0")))
            }
        }
        return fmt;
    }

    formatDate = (_date) => {
        return this.dateFormat("YYYY-mm-dd", _date)
    }
}

export default Index;