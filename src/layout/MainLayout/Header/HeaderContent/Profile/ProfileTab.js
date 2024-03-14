import PropTypes from 'prop-types';
import { useState } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import { List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';

// assets
import { EditOutlined, ProfileOutlined, LogoutOutlined, UserOutlined } from '@ant-design/icons';

// ==============================|| HEADER PROFILE - PROFILE TAB ||============================== //

const ProfileTab = ({ handleLogout }) => {
    const theme = useTheme();

    const [selectedIndex, setSelectedIndex] = useState(0);
    const handleListItemClick = (event, index) => {
        setSelectedIndex(index);
        if (0 === index) {
            window.location.href = "/password"
        }
        else if (1 === index) {
            window.location.href = "/google"
        }
        else if (3 === index) {
            window.location.href = "/google"
        }
        else {
            console.info(index)
         }
    };

    return (
        <div>
            <List component="nav" sx={{ p: 0, '& .MuiListItemIcon-root': { minWidth: 32, color: theme.palette.grey[500] } }}>
                <ListItemButton selected={selectedIndex === 0} onClick={(event) => handleListItemClick(event, 0)}>
                    <ListItemIcon>
                        <EditOutlined />
                    </ListItemIcon>
                    <ListItemText primary="修改密码" />
                </ListItemButton>

                <ListItemButton selected={selectedIndex === 1} onClick={(event) => handleListItemClick(event, 1)}>
                    <ListItemIcon>
                        <UserOutlined />
                    </ListItemIcon>
                    <ListItemText primary="绑定谷歌验证" />
                </ListItemButton>

                <ListItemButton selected={selectedIndex === 3} onClick={(event) => handleListItemClick(event, 3)}>
                    <ListItemIcon>
                        <ProfileOutlined />
                    </ListItemIcon>
                    <ListItemText primary="下载谷歌验证器" />
                </ListItemButton>

                <ListItemButton selected={selectedIndex === 2} onClick={handleLogout}>
                    <ListItemIcon>
                        <LogoutOutlined />
                    </ListItemIcon>
                    <ListItemText primary="退出系统" />
                </ListItemButton>
            </List>

        </div>
    );
};

ProfileTab.propTypes = {
    handleLogout: PropTypes.func
};

export default ProfileTab;
