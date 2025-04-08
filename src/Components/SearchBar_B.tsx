"use client";
import { AnimatePresence, motion } from 'framer-motion'
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react'
import { FiSearch } from 'react-icons/fi';
import { useDownloadContext } from './DownloadContext';
import axios from 'axios';

export default function SearchBar() {
    const [inputFocused, setInputFocused] = useState(false);
    const [buttonFocused, setButtonFocused] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [idHistory, setIdHistory] = useState<string[]>([]);

    const [quickIdHistory, setQuickIdHistory] = useState<string[]>([]);

    const { updatePlaylistId } = useDownloadContext();
    const inputRef = useRef<HTMLInputElement>(null);


    const pathname = usePathname();
    const router = useRouter();

    const onFocus = () => setInputFocused(true);
    const onBlur = () => setInputFocused(false);
    const onHoverStart = () => setButtonFocused(true);
    const onHoverEnd = () => setButtonFocused(false);


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {

        const value = e.target.value
        setInputValue(value);
        console.log('Input value:', value);

        const ids: string[] = [];
        if (value.length === 0) return setQuickIdHistory(ids);
        for (const id of idHistory) {
            console.log(id);

            if (id.includes(value)) ids.push(id);
        }
        setQuickIdHistory(ids);
    };

    const searchUI = () => {
        const id = pathname.split("/")[1];
        return !isNaN(+id) && id.length > 0;
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key !== "Enter") return;
        if (pathname === `/${inputValue}`) return;
        router.push(`/${inputValue}`);
        setInputFocused(false);
        setButtonFocused(false);
        updatePlaylistId(inputValue);
    };

    useEffect(() => {
        (async () => {
            const req = await axios("/api/getConfigId");
            console.log(req.data);
            setIdHistory(req.data);
        })()

        return () => {
            //eventSource.close();
        };
    }, [])


    useEffect(() => {
        console.log('目前路徑：', pathname);
    }, [pathname]);

    return (
        <motion.div
            className="relative"
            animate={{
                scale: inputFocused || buttonFocused ? 1.1 : 1,
                borderColor: inputFocused || buttonFocused ? "rgb(59 130 246)" : "rgb(209 213 219)",
                y: searchUI() ? "0%" : "-50%",
                top: searchUI() ? "1rem" : "50%",
                width: searchUI() ? "80%" : "40%",
            }}
            transition={{
                duration: 0.4,
                ease: "easeInOut",
                y: { duration: 0.8, ease: [0.4, 0.4, 0.4, 1] },
                top: { duration: 0.8, ease: [0.4, 0.4, 0.4, 1] },
                width: { duration: 0.8, ease: [0.4, 0.4, 0.4, 1] }
            }}
        >
            <div className='relative flex h-14 items-center border-4 overflow-hidden'>
                <div className='absolute flex w-full h-full border-2 rounded-full focus:outline-none shadow-sm  bg-white/50  backdrop-blur-xl' />

                <motion.input
                    ref={inputRef}
                    type="text"
                    placeholder="請輸入歌單ID..."
                    onFocus={onFocus}
                    onBlur={onBlur}
                    animate={{ borderColor: inputFocused || buttonFocused ? "rgb(59 130 246)" : "rgb(209 213 219)" }}
                    className="relative pl-4  w-[90%] mr-1 text-black placeholder-gray-500 focus:outline-none bg-transparent"
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                />

                {/* 搜尋按鈕（圓形） */}

                <motion.button
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    transition={{ type: "spring", }}
                    onFocus={onHoverStart}
                    onBlur={onHoverEnd}
                    onClick={() => {
                        if (pathname === `/${inputValue}`) return;
                        router.push(`/${inputValue}`);
                        inputRef.current?.blur();
                        setInputFocused(false);
                        setButtonFocused(false);
                        updatePlaylistId(inputValue);
                    }}
                    className=" absolute right-1 bg-blue-500 rounded-full w-9 h-9 flex items-center justify-center"
                >
                    <FiSearch />
                </motion.button>

            </div>
            <motion.div
                className='flex'>
                {quickIdHistory.map(i =>
                    <AnimatePresence>
                        <motion.div
                            key={i}
                            className='relative m-1 p-2 rounded-full text-black shadow-md overflow-hidden'
                            layout
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            //exit={{ opacity: 0, x: 50 }}
                        >
                            <div className='absolute inset-0 bg-white/50 backdrop-blur-sm' />
                            <div className='relative'>{i}</div>
                            <div className='absolute inset-0' />
                        </motion.div>
                    </AnimatePresence>

                )}
            </motion.div>
        </motion.div>


    )
}
