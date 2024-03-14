import { useState } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import { List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';

// assets
import { UnorderedListOutlined } from '@ant-design/icons';

// ==============================|| HEADER PROFILE - SETTING TAB ||============================== //

const SettingTab = () => {
    const theme = useTheme();

    const [selectedIndex, setSelectedIndex] = useState(0);
    const handleListItemClick = (event, index) => {
        setSelectedIndex(index);
        if (4 === index) {
            window.location.href = "/units_log"
        }
    };

    return (
        <List component="nav" sx={{ p: 0, '& .MuiListItemIcon-root': { minWidth: 32, color: theme.palette.grey[500] } }}>

            <ListItemButton selected={selectedIndex === 4} onClick={(event) => handleListItemClick(event, 4)}>
                <ListItemIcon>
                    <UnorderedListOutlined />
                </ListItemIcon>
                <ListItemText primary="登录日志" />
            </ListItemButton>
        </List>
    );
};

export default SettingTab;
