import { PartitionOutlined } from '@ant-design/icons';

const channel = {
  id: 'channel',
  title: '通道管理',
  type: 'group',
  children: [
    {
      id: 'channel_index',
      title: '通道列表',
      type: 'item',
      url: '/channel_index',
      icon: PartitionOutlined,
      breadcrumbs: false
    }
  ]
};

export default channel;
