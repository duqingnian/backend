import { lazy } from 'react';
import Loadable from 'components/Loadable';
import MainLayout from 'layout/MainLayout';

//首页
const DashboardDefault = Loadable(lazy(() => import('pages/dashboard')));

//代收 代付
const OrderPayin = Loadable(lazy(() => import('pages/order/Payin')));
const OrderPayout = Loadable(lazy(() => import('pages/order/Payout')));

//通道
const ChannelIndex = Loadable(lazy(() => import('pages/channel/Index')));

//商户
const MerchantIndex = Loadable(lazy(() => import('pages/merchant/Index')));

//代理
const ProxyIndex = Loadable(lazy(() => import('pages/proxy/Index')));

//下发
const DispatchTixian = Loadable(lazy(() => import('pages/dispatch/Tixian'))); //提现
const DispatchTopup = Loadable(lazy(() => import('pages/dispatch/Topup'))); //充值

//设置
const SettingAccount = Loadable(lazy(() => import('pages/setting/Account')));
const SettingAccountGroup = Loadable(lazy(() => import('pages/setting/AccountGroup')));
const SettingAccountPermission = Loadable(lazy(() => import('pages/setting/AccountPermission')));

//电报
const TelegramBot = Loadable(lazy(() => import('pages/telegram/Bot')));
const TelegramBotGroupMsg = Loadable(lazy(() => import('pages/telegram/BotGroupMsg')));

//技术支持
const SupportChannel = Loadable(lazy(() => import('pages/support/Channel')));
const SupportMerchant = Loadable(lazy(() => import('pages/support/Merchant')));

//units
const UnitsLog = Loadable(lazy(() => import('pages/units/Log')));

//修改密码 谷歌
const Password = Loadable(lazy(() => import('pages/setting/Password')));
const Google = Loadable(lazy(() => import('pages/setting/Google')));

const MainRoutes = {
    path: '/',
    element: <MainLayout />,
    children: [
        { path: '/', element: <DashboardDefault /> },
        {
            path: 'dashboard',
            children: [
                { path: 'default', element: <DashboardDefault /> }
            ]
        },
        { path: 'order_payin', element: <OrderPayin /> },
        { path: 'order_payout', element: <OrderPayout /> },
        { path: 'channel_index', element: <ChannelIndex /> },
        { path: 'merchant_index', element: <MerchantIndex /> },
        { path: 'proxy_index', element: <ProxyIndex /> },
        { path: 'dispatch_tixian', element: <DispatchTixian /> },
        { path: 'dispatch_topup', element: <DispatchTopup /> },
        { path: 'setting_account', element: <SettingAccount /> },
        { path: 'setting_account_group', element: <SettingAccountGroup /> },
        { path: 'setting_account_permission', element: <SettingAccountPermission /> },
        { path: 'telegram_bot', element: <TelegramBot /> },
        { path: 'telegram_bot_group_msg', element: <TelegramBotGroupMsg /> },
        { path: 'support_channel', element: <SupportChannel /> },
        { path: 'support_merchant', element: <SupportMerchant /> },
        { path: 'units_log', element: <UnitsLog /> },
        { path: 'password', element: <Password /> },
        { path: 'google', element: <Google /> },
    ]
};

export default MainRoutes;
