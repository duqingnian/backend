const APP_CONFIG = JSON.parse(localStorage.getItem("APP_CONFIG"))
const Logo = () => {
    return (
        <>
            <span style={{ color: '#000', fontSize: '20px', fontWeight: 'bold' }}>{APP_CONFIG.project}</span>
        </>
    );
};

export default Logo;
