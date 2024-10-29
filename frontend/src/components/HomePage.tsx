import React, { useState } from 'react';
import Sidebar from "./Sidebar";
import Dashboard from './Dashboard';
import UploadData from './UploadData';
import Predictions from "./Predictions";
import Players from "./Players";


function HomePage() {
    const [currentComponent, setCurrentComponent] = useState('UploadData');

    const renderComponent = () => {
        switch (currentComponent) {
            case 'Dashboard':
                return <Dashboard />;
            case 'UploadData':
                return <UploadData />;
            case 'AddPlayer':
                return <Players />;
            case 'Predictions':
                return <Predictions />;
            default:
                return <Dashboard />;
        }
    };

    return (
        <div className="w-screen h-screen flex">
            <aside className="flex-none">
                <Sidebar setCurrentComponent={setCurrentComponent} />
            </aside>
            <div className="grow h-screen">
                {renderComponent()}
            </div>
        </div>
    );
}

export default HomePage;
