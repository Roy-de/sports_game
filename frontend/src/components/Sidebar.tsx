import React, { useState } from 'react';
import {BarChart2, ChevronLeft, ChevronRight, Home, LineChartIcon, Upload, User, UserCog2Icon} from "lucide-react";

// @ts-ignore
function Sidebar({ setCurrentComponent }) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [activeComponent, setActiveComponent] = useState('Dashboard');

    const handleItemClick = (component: string) => {
        setActiveComponent(component);
        setCurrentComponent(component);
    };

    return (
        <div className={`h-screen flex flex-col justify-start ${isCollapsed ? "w-[68px]" : "w-52"} transition-all duration-300 ease-in-out border-r`}>
            {/* Toggle Button */}
            <div className="flex justify-end p-2">

                {isCollapsed ? (
                    <ChevronRight
                        color="#1e3a8a"
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="cursor-pointer transition-transform duration-300 ease-in-out transform hover:scale-110 hover:text-blue-500 p-1 bg-blue-200 hover:bg-blue-300"
                    />
                ) : (
                    <ChevronLeft
                        color="#1e3a8a"
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="cursor-pointer transition-transform duration-300 ease-in-out transform hover:scale-110 hover:text-blue-500 p-1 bg-blue-200 hover:bg-blue-300"
                    />
                )}
            </div>


            {/* Navigation Links */}
            <div className="flex-grow">
                <nav className="flex flex-col space-y-6 mt-4 px-2">
                   {/* <SidebarItem
                        icon={<Home color={activeComponent === 'Dashboard' ? "white" : "#1e3a8a"} size={20}/>} // Change color based on active state
                        label="Dashboard"
                        isCollapsed={isCollapsed}
                        isActive={activeComponent === 'Dashboard'}
                        onClick={() => handleItemClick('Dashboard')}
                    />*/}
                    <SidebarItem
                        icon={<Upload color={activeComponent === 'UploadData' ? "white" : "#1e3a8a"} size={20}/>} // Change color based on active state
                        label="Upload Data"
                        isCollapsed={isCollapsed}
                        isActive={activeComponent === 'UploadData'}
                        onClick={() => handleItemClick('UploadData')}
                    />
                    <SidebarItem
                        icon={<UserCog2Icon color={activeComponent === 'AddPlayer' ? "white" : "#1e3a8a"} size={20}/>} // Change color based on active state
                        label="Add players"
                        isCollapsed={isCollapsed}
                        isActive={activeComponent === 'AddPlayer'}
                        onClick={() => handleItemClick('AddPlayer')}
                    />
                    <SidebarItem
                        icon={<LineChartIcon color={activeComponent === 'Predictions' ? "white" : "#1e3a8a"} size={20}/>} // Change color based on active state
                        label="Predictions"
                        isCollapsed={isCollapsed}
                        isActive={activeComponent === 'Predictions'}
                        onClick={() => handleItemClick('Predictions')}
                    />
                </nav>
            </div>
        </div>
    );
}

// @ts-ignore
function SidebarItem({ icon, label, isCollapsed, onClick, isActive }) {
    return (
        <div

            onClick={onClick}
            className={`flex items-start flex-row justify-start px-4 py-2 cursor-pointer space-x-2
                ${isActive ? 'bg-gradient-to-r from-[#005dff] via-[#9935b9] to-[#fd185a] text-white' : 'hover:bg-blue-200 text-blue-900 hover:bg-opacity-35'}`}
        ><div>
            {icon}
        </div>
            <span
                className={` ${isCollapsed ? "opacity-0" : "opacity-100"} transition-opacity duration-300 ease-in-out text-sm h-6 font-bold`}>
                {label}
            </span>
        </div>
    );
}

export default Sidebar;
