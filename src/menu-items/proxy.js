import { LinkOutlined } from '@ant-design/icons';

const proxy = {
  id: 'proxy',
  title: '代理管理',
  type: 'group',
  children: [
    {
      id: 'proxy_index',
      title: '代理列表',
      type: 'item',
      url: '/proxy_index',
      icon: LinkOutlined,
      breadcrumbs: false
    }
  ]
};

export default proxy;
