import React from 'react';
import Header from './Header';

const Layout = ({ children }) => {
    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header />
            <main style={{ flex: 1 }}>
                {children}
            </main>
        </div>
    );
};

export default Layout;
