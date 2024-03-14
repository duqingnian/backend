import { BorderlessTableOutlined } from '@ant-design/icons';

const units = {
  id: 'units',
  title: 'system units',
  type: 'group',
  children: [
    {
      id: 'units_log',
      title: '系统日志',
      type: 'item',
      url: '/units_log',
      icon: BorderlessTableOutlined,
      breadcrumbs: false
    }
  ]
};

export default units;
