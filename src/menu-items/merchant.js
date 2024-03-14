import { InteractionOutlined } from '@ant-design/icons';

const merchant = {
  id: 'merchant',
  title: '商户管理',
  type: 'group',
  children: [
    {
      id: 'merchant_index',
      title: '商户列表',
      type: 'item',
      url: '/merchant_index',
      icon: InteractionOutlined,
      breadcrumbs: false
    }
  ]
};

export default merchant;
