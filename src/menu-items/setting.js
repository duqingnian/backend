import { UserOutlined, TeamOutlined, ShareAltOutlined } from '@ant-design/icons';

const setting = {
    id: 'setting',
    title: '系统设置',
    type: 'group',
    children: [
        {
            id: 'setting_account',
            title: '账号管理',
            type: 'item',
            url: '/setting_account',
            icon: UserOutlined,
            breadcrumbs: false
        },
        {
            id: 'setting_account_group',
            title: '账号组管理',
            type: 'item',
            url: '/setting_account_group',
            icon: TeamOutlined,
            breadcrumbs: false
        },
        {
            id: 'setting_account_permission',
            title: '权限管理',
            type: 'item',
            url: '/setting_account_permission',
            icon: ShareAltOutlined,
            breadcrumbs: false
        }
    ]
};

export default setting;
