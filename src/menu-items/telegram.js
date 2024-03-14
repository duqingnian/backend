import { ApiOutlined, MessageOutlined } from '@ant-design/icons';

const telegram = {
    id: 'telegram',
    title: '电报设置',
    type: 'group',
    children: [
        {
            id: 'telegram_bot',
            title: '电报机器人',
            type: 'item',
            url: '/telegram_bot',
            icon: ApiOutlined,
            breadcrumbs: false
        },
        {
            id: 'telegram_bot_group_msg',
            title: '机器人群发消息',
            type: 'item',
            url: '/telegram_bot_group_msg',
            icon: MessageOutlined,
            breadcrumbs: false
        },
    ]
};

export default telegram;
