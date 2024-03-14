import { ToolOutlined, RestOutlined } from '@ant-design/icons';

const support = {
  id: 'support',
  title: '对接support',
  type: 'group',
  children: [
    {
      id: 'support_channel',
      title: '通道对接',
      type: 'item',
      url: '/support_channel',
      icon: ToolOutlined,
      breadcrumbs: false
    },
    {
      id: 'support_merchant',
      title: '商户对接',
      type: 'item',
      url: '/support_merchant',
      icon: RestOutlined,
      breadcrumbs: false
    }
  ]
};

export default support;
