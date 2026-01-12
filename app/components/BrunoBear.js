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
         User Requirement: "can't ALWAYS see the entire image like most of it should be cut out... tell too much that it is a statue with the base"
         Solution: overflow-hidden container height, image positioned to push base down.
      */}
            <div className="relative w-48 md:w-64 h-48 md:h-64 overflow-hidden ml-4 md:ml-8 rounded-b-3xl">
                <img
                    src="/bruno-bear.png"
                    alt="Bruno the Bear"
                    className="absolute w-full h-auto top-0 left-0 drop-shadow-2xl hover:rotate-1 transition-transform duration-300"
                    style={{
                        // Push the image down slightly if needed, or if the image has a lot of empty space at top, pull it up.
                        // Assuming the image is the full statue, we want to crop the bottom.
                        // If we just limit height (h-64) and let it flow, the bottom gets cut off if aspect ratio pushes it.
                        // Let's rely on the container cropping.
                        objectFit: 'cover',
                        objectPosition: 'top center',
                        height: '130%' // Force image to be taller than container so bottom is cropped? 
                        // better yet:
                    }}
                />
                {/* Alternative simple approach: Standard img, negative margin-bottom to pull it "down" into overflow:hidden? 
            Actually, if I want to HIDE the base, and the base is at the bottom, I just need a container that is SHORTER than the image.
         */}
                <div className="absolute inset-0 pointer-events-none">
                    {/* We simply render the image with a scale or translation to hide the feet. */}
                    <img
                        src="/bruno-bear.png"
                        alt=""
                        className="w-full h-auto transform translate-y-[10%]" // Push it down 10%? No that reveals top.
                    // Wait, if it's a statue, feet are at bottom. To hide feet, we need the container to stop before the feet.
                    />
                </div>
            </div>

            {/* Let's try a cleaner approach for the image div */}
            <div className="relative w-48 md:w-64 h-40 md:h-56 overflow-hidden ml-4 md:ml-8 z-10">
                <img
                    src="/bruno-bear.png"
                    alt="Bruno"
                    className="w-full h-auto object-cover object-top"
                />
            </div>
        </div>
    );
}
