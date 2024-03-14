// assets
import { NodeCollapseOutlined, NodeExpandOutlined } from '@ant-design/icons';

const order = {
  id: 'order',
  title: '订单管理',
  type: 'group',
  children: [
    {
      id: 'order_payin',
      title: '代收订单',
      type: 'item',
      url: '/order_payin',
      icon: NodeCollapseOutlined,
      breadcrumbs: false
},
    {
      id: 'order_payout',
      title: '代付订单',
      type: 'item',
      url: '/order_payout',
      icon: NodeExpandOutlined,
      breadcrumbs: false
    }
  ]
};

export default order;
