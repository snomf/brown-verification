'use client';

import { useState, useEffect } from 'react';
import { getRandomMessage } from '@/lib/bruno';

export default function BrunoBear({ state, customMessage, onMessageClick, children }) {
    const [message, setMessage] = useState('');

    useEffect(() => {
        // Only use internal random message if NO children are provided.
        // If children are provided, the parent controls the text (likely randomized there).
        if (!children) {
            if (customMessage) {
                setMessage(customMessage);
            } else {
                setMessage(getRandomMessage(state || 'greetings'));
            }
        }
    }, [state, customMessage, children]);

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

            {/* Bear Image Wrapper with Cropping */}
            {/* 
         User Requirement: "There are three, its just one and it needs to be big"
         "most of it should be cut out alwayus because you can tell too much that it si a statue with the base"
         
         Solution:
         - One single image div.
         - Increased dimensions (w-64 md:w-80).
         - Overflow hidden + object-top to crop the bottom (base).
      */}
            <div className="relative w-64 md:w-80 h-56 md:h-72 overflow-hidden ml-4 md:ml-8 rounded-b-3xl">
                <img
                    src="/bruno-bear.png"
                    alt="Bruno"
                    className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-500"
                />
            </div>
        </div>
    );
}
