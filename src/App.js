import Routes from 'routes';
import ThemeCustomization from 'themes';
import ScrollTop from 'components/ScrollTop';
import { initializeIcons } from '@fluentui/react/lib/Icons';
import './App.css'

initializeIcons();

const App = () => (
    <ThemeCustomization>
        <ScrollTop>
            <Routes />
        </ScrollTop>
    </ThemeCustomization>
);

export default App;
