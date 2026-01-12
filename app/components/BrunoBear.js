'use client';

import { useState, useEffect } from 'react';
import { getRandomMessage } from '@/lib/bruno';

export default function BrunoBear({ state, customMessage, onMessageClick, children }) {
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (customMessage) {
            setMessage(customMessage);
        } else {
            setMessage(getRandomMessage(state || 'greetings'));
        }
    }, [state, customMessage]);

    return (
        <div className="relative flex flex-col items-center md:items-start animate-in fade-in slide-in-from-bottom-8 duration-700 w-full max-w-2xl mx-auto md:mx-0">
            {/* Chat BubbleContainer */}
            <div
                className="relative bg-white text-black p-6 md:p-8 rounded-[2rem] rounded-bl-none shadow-xl mb-4 w-full transform transition-all border-2 border-[#591C0B]/5"
                onClick={onMessageClick}
            >
                {children ? (
                    <div className="w-full">
                        {children}
                    </div>
                ) : (
                    <p className="text-lg md:text-2xl font-bold font-handwritten text-[#591C0B]">{message}</p>
                )}

                {/* Triangle Pointer */}
                <div className="absolute bottom-[-18px] left-10 md:left-16 w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[20px] border-t-white drop-shadow-sm"></div>
            </div>

            {/* Bear Image */}
            <div className="w-48 md:w-64 relative z-10 ml-4 md:ml-8">
                <img
                    src="/bruno-bear.png"
                    alt="Bruno the Bear"
                    className="w-full h-auto drop-shadow-2xl hover:rotate-1 transition-transform duration-300"
                />
            </div>
        </div>
    );
}
