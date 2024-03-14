import PropTypes from 'prop-types';

// material-ui
import { useTheme } from '@mui/material/styles';
import { Stack } from '@mui/material';

// project import
import DrawerHeaderStyled from './DrawerHeaderStyled';
import Logo from 'components/Logo';

// ==============================|| DRAWER HEADER ||============================== //

const DrawerHeader = ({ open }) => {
    const theme = useTheme();

    return (
        <DrawerHeaderStyled style={{ margin: "0 auto", width: '100%' }} theme={theme} open={open}>
            <Stack style={{margin: '0 auto'}} direction="row" spacing={1} alignItems="center">
                <Logo />
            </Stack>
        </DrawerHeaderStyled>
    );
};

DrawerHeader.propTypes = {
    open: PropTypes.bool
};

export default DrawerHeader;
