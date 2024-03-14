// assets
import { BarChartOutlined } from '@ant-design/icons';

const dashboard = {
  id: 'group-dashboard',
  title: '工作台',
  type: 'group',
  children: [
    {
      id: 'dashboard',
      title: '平台数据',
      type: 'item',
      url: '/dashboard/default',
      icon: BarChartOutlined,
      breadcrumbs: false
    }
  ]
};

export default dashboard;
