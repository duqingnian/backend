import { MinusSquareOutlined, PlusSquareOutlined } from '@ant-design/icons';

const dispatch = {
    id: 'dispatch',
    title: '下发管理',
    type: 'group',
    children: [
        {
            id: 'dispatch_tixian',
            title: '提现',
            type: 'item',
            url: '/dispatch_tixian',
            icon: MinusSquareOutlined,
            breadcrumbs: false
        },
        {
            id: 'dispatch_topup',
            title: '充值',
            type: 'item',
            url: '/dispatch_topup',
            icon: PlusSquareOutlined,
            breadcrumbs: false
        },
    ]
};

export default dispatch;
