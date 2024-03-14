import React, { Component } from 'react';
import { Button } from "@blueprintjs/core";
import Ajax from 'components/Ajax';
import { DateRangeInput3 } from "@blueprintjs/datetime2";
import { Modal } from 'antd';
import date from 'components/Util/date'

class Statistics extends Component {
    state = {
        merchant_request_token: this.props.merchant_request_token,
        statistics_data: {},
        filter_date1: "",
        filter_date2: "",
    }
    componentDidMount() {
        this.setState({
            filter_date1: date.today(),
            filter_date2: date.today(),
        }, function () {
            this.load_merchant_statistics()
        })
    }

    load_merchant_statistics = () => {
        let that = this
        Ajax("merchant", {
            action: "statistics",
            filter_date1: that.state.filter_date1,
            filter_date2: that.state.filter_date2,
            merchant_request_token: that.state.merchant_request_token
        }, function (json) {
            if (0 === parseInt(json.code)) {
                that.setState({
                    statistics_data: json.statistics_data
                })
            }
            else {
                Modal.error({
                    title: '载入商户统计数据出错',
                    content: json.msg
                });
            }
        });
    }

    change_data = (_date) => {
        let that = this
        that.setState({
            filter_date1: date.dateFormat(_date[0]),
            filter_date2: date.dateFormat(_date[1]),
        })
    }

    render() {
        return (<div>
            <div className='flex'>
                <div className='bp5-menu'>
                    <DateRangeInput3
                        locale="zh-CN"
                        allowSingleDayRange={true}
                        onChange={this.change_data}
                        footerElement={undefined}
                        timePickerProps={undefined}
                        value={[new Date(this.state.filter_date1), new Date(this.state.filter_date2)]}
                    />
                </div>
                <Button icon="filter" className="mr10" onClick={this.load_merchant_statistics}>筛选</Button>
            </div>

            {
                'undefined' !== typeof (this.state.statistics_data.PAYIN) ? <div className='mt20'>
                    <table className='model'>
                        <tbody>
                            <tr><td colSpan={2} style={{ background: '#0fb51d', color: '#fff',fontSize: '16px' }}>代收 {this.state.statistics_data.PAYIN.succ_amount}</td></tr>
                            <tr><td style={{ width: '160px', fontSize: '16px' }}>商户拉单数量：</td><td style={{ fontSize: '20px' }}>{this.state.statistics_data.PAYIN.request_count}</td></tr>
                            <tr><td style={{ width: '160px', fontSize: '16px' }}>拉单总金额：</td><td style={{ fontSize: '20px' }}>{this.state.statistics_data.PAYIN.request_amount}</td></tr>
                            <tr><td style={{ width: '160px', fontSize: '16px' }}>成功数量：</td><td style={{ fontSize: '20px' }}>{this.state.statistics_data.PAYIN.succ_count}</td></tr>
                            <tr><td style={{ width: '160px', fontSize: '16px' }}>成功总金额：</td><td style={{ fontSize: '20px' }}>{this.state.statistics_data.PAYIN.succ_amount}</td></tr>
                            <tr><td style={{ width: '160px', fontSize: '16px' }}>手续费：</td><td style={{ fontSize: '20px' }}>{this.state.statistics_data.PAYIN.succ_fee}</td></tr>
                            <tr><td style={{ width: '160px', fontSize: '16px' }}>未支付的数量：</td><td style={{ fontSize: '20px' }}>{this.state.statistics_data.PAYIN.generated_count}</td></tr>
                            <tr><td style={{ width: '160px', fontSize: '16px' }}>成功率：</td><td style={{ fontSize: '20px' }}>{this.state.statistics_data.PAYIN.succ_pct}</td></tr>
                        </tbody>
                    </table>
                </div> : ''
            }

            {
                'undefined' !== typeof (this.state.statistics_data.PAYOUT) ? <div className='mt20'>
                    <table className='model'>
                        <tbody>
                            <tr><td colSpan={2} style={{ background: '#b50f0f', color: '#fff',fontSize: '16px' }}>代付 {this.state.statistics_data.PAYOUT.succ_amount}</td></tr>
                            <tr><td style={{ width: '160px', fontSize: '16px' }}>商户拉单数量：</td><td style={{ fontSize: '20px' }}>{this.state.statistics_data.PAYOUT.request_count}</td></tr>
                            <tr><td style={{ width: '160px', fontSize: '16px' }}>拉单总金额：</td><td style={{ fontSize: '20px' }}>{this.state.statistics_data.PAYOUT.request_amount}</td></tr>
                            <tr><td style={{ width: '160px', fontSize: '16px' }}>成功数量：</td><td style={{ fontSize: '20px' }}>{this.state.statistics_data.PAYOUT.succ_count}</td></tr>
                            <tr><td style={{ width: '160px', fontSize: '16px' }}>成功总金额：</td><td style={{ fontSize: '20px' }}>{this.state.statistics_data.PAYOUT.succ_amount}</td></tr>
                            <tr><td style={{ width: '160px', fontSize: '16px' }}>手续费：</td><td style={{ fontSize: '20px' }}>{this.state.statistics_data.PAYOUT.succ_fee}</td></tr>
                            <tr><td style={{ width: '160px', fontSize: '16px' }}>处理中的数量：</td><td style={{ fontSize: '20px' }}>{this.state.statistics_data.PAYOUT.generated_count}</td></tr>
                            <tr><td style={{ width: '160px', fontSize: '16px' }}>成功率：</td><td style={{ fontSize: '20px' }}>{this.state.statistics_data.PAYOUT.succ_pct}</td></tr>
                        </tbody>
                    </table>
                </div> : ''
            }


        </div>);
    }
}

export default Statistics;