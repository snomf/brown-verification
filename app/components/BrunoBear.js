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
        <div className="relative flex flex-col items-start animate-in fade-in slide-in-from-bottom-8 duration-700 w-full max-w-2xl mx-auto md:mx-0">
            {/* Chat BubbleContainer */}
            <div
                className="relative bg-white text-black p-6 md:p-10 rounded-[2.5rem] rounded-bl-none shadow-2xl mb-4 w-full transform transition-all border-2 border-[#591C0B]/5 z-20"
                onClick={onMessageClick}
            >
                {children ? (
                    <div className="w-full">
                        {children}
                    </div>
                ) : (
                    <p className="text-xl md:text-3xl font-bold font-handwritten text-[#591C0B] leading-tight">{message}</p>
                )}

                {/* Triangle Pointer - Aligned with the Bear below */}
                <div className="absolute bottom-[-22px] left-12 md:left-20 w-0 h-0 border-l-[25px] border-l-transparent border-r-[25px] border-r-transparent border-t-[25px] border-t-white drop-shadow-md"></div>
            </div>

            {/* Bear Image Wrapper with Cropping */}
            {/* 
                User Requirement: "On mobile make that bear image much larger, add somehing that forces the image to be around the arrow"
                Solution:
                - Removed items-center, using items-start always for consistency with bubble arrow.
                - Increased mobile max-width (max-w-[320px]).
                - Adjusted height to be larger on mobile too (h-72).
                - ml-4 to align head under arrow.
            */}
            <div className="relative w-full max-w-[320px] md:max-w-none md:w-96 h-72 md:h-80 overflow-hidden ml-4 md:ml-12 z-10 rounded-b-[3rem] transform -translate-y-4">
                <img
                    src="/bruno-bear.png"
                    alt="Bruno the Bear"
                    className="w-full h-full object-cover object-top hover:scale-110 transition-transform duration-700"
                />

                {/* Subtle vignette to hide the cut-off edges smoothly */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#FDFBF7]/20 to-transparent pointer-events-none"></div>
            </div>
        </div>
    );
}
