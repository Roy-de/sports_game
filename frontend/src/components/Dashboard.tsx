import React from 'react';


const Dashboard: React.FC = () => {
    return (
        <div className="p-6">

            {/* Fixtures Count Wrapper */}
            <div className="grid grid-cols-10 gap-2 mb-8 text-center fixtures-count-wrapper p-4"
                 style={{
                     color: 'white',
                     background: 'linear-gradient(90deg, rgb(0, 93, 255) 10%, rgb(181, 46, 172) 50%, rgb(255, 23, 88) 100%)',
                 }}>
                {["27 Oct", "28 Oct", "29 Oct", "30 Oct", "31 Oct", "01 Nov", "02 Nov", "03 Nov", "04 Nov", "05 Nov"].map((date, index) => (
                    <div key={index} className={`flex flex-col w-1/5 p-2 ${index === 1 ? 'active' : ''}`}>
                        <div className="text-base font-bold uppercase">{date}</div>
                        <div className="text-3xl font-bold">{index === 1 ? "240" : index === 0 ? "224" : "-"}</div>
                        <div className="text-sm font-light">FIXTURES</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Dashboard;
