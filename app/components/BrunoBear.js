'use client';

import { useState, useEffect } from 'react';
import { getRandomMessage } from '@/lib/bruno';

export default function BrunoBear({ state, customMessage, onMessageClick }) {
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (customMessage) {
            setMessage(customMessage);
        } else {
            setMessage(getRandomMessage(state || 'greetings'));
        }
    }, [state, customMessage]);

    return (
        <div className="relative flex flex-col items-center md:items-start animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Chat Bubble */}
            <div
                className="relative bg-white text-black p-6 rounded-3xl rounded-bl-none shadow-xl mb-4 max-w-xs md:max-w-md transform transition-all hover:scale-105 cursor-pointer"
                onClick={onMessageClick}
            >
                <p className="text-lg md:text-xl font-bold font-handwritten">{message}</p>

                {/* Triangle Pointer */}
                <div className="absolute bottom-[-10px] left-10 w-0 h-0 border-l-[10px] border-l-transparent border-r-[20px] border-r-transparent border-t-[20px] border-t-white"></div>
            </div>

            {/* Bear Image */}
            <div className="w-64 md:w-80 relative z-10">
                <img
                    src="/bruno-bear.png"
                    alt="Bruno the Bear"
                    className="w-full h-auto drop-shadow-2xl hover:rotate-1 transition-transform duration-300"
                />
            </div>
        </div>
    );
}
