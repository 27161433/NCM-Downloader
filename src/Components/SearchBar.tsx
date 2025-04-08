"use client";
import { AnimatePresence, motion } from 'motion/react'
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react'
import { FiSearch } from 'react-icons/fi';
import { useDownloadContext } from './DownloadContext';
import axios from 'axios';

interface IdHistory {
    id: string;
    select: boolean;
}

export default function SearchBar() {
    const [inputFocused, setInputFocused] = useState(false);
    const [quickListFocused, setQuickListFocused] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [idHistory, setIdHistory] = useState<string[]>([]);
    const [quickList, setQuickList] = useState<IdHistory[]>([]);

    const { updatePlaylistId } = useDownloadContext();
    const inputRef = useRef<HTMLInputElement>(null);


    const pathname = usePathname();
    const router = useRouter();



    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {

        const value = e.target.value
        setInputValue(value);
        console.log('Input value:', value);

        const ids: IdHistory[] = [];
        for (const id of idHistory) {
            if (id.includes(value)) ids.push({ id, select: false });
        }
        setQuickList(ids);

    };

    const searchUI = () => {
        const id = pathname.split("/")[1];
        return !isNaN(+id) && id.length > 0;
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {


        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                console.log("down");
                setQuickList(pre => {
                    if (pre.length === 0) return pre;

                    let index = pre.findIndex(item => item.select);
                    console.log(index);

                    if (index === -1) return pre.map((item, i) => i === 0 ? { ...item, select: true } : item);

                    if (index + 1 >= pre.length) index = 0;
                    else index++;

                    return pre.map((item, i) => i === index ? { ...item, select: true } : { ...item, select: false });
                });

                break;
            case "ArrowUp":
                console.log("UP");
                e.preventDefault();
                setQuickList(pre => {
                    if (pre.length === 0) return pre;

                    let index = pre.findIndex(item => item.select);
                    console.log(index);

                    if (index === -1) return pre.map((item, i) => i === pre.length - 1 ? { ...item, select: true } : item);

                    if (index - 1 < 0) index = pre.length - 1;
                    else index--;

                    return pre.map((item, i) => i === index ? { ...item, select: true } : { ...item, select: false });
                });
                break;
            case "Enter":
                if (pathname === `/${inputValue}`) return;
                const item = quickList.find(ql => ql.select);
                if (!item) return alert("無法獲取quickList");
                router.push(quickListFocused ? `/${item.id}` : `/${inputValue}`);
                setInputFocused(false);
                updatePlaylistId(quickListFocused ? item.id : inputValue);
                setInputValue(item.id);
                break;
        }

    };



    useEffect(() => {
        (async () => {
            const req = await axios("/api/getConfigId");
            console.log(req.data);
            setIdHistory(req.data);
            for (const i of req.data) {

            }
            setQuickList(req.data.map((i: IdHistory) => ({ id: i, select: false })));
        })();

        setInputValue(pathname.split("/")[1]);

        return () => {
            //eventSource.close();
        };
    }, []);


    useEffect(() => {
        console.log('目前路徑：', pathname.split("/"));
    }, [pathname]);

    return (
        <motion.div
            className="relative pointer-events-auto"
            animate={{
                //borderColor: inputFocused || buttonFocused ? "rgb(59 130 246)" : "rgb(209 213 219)",
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
            <motion.div
                className='flex absolute'>
                <AnimatePresence>
                    {inputFocused && quickList.map(i =>
                        <motion.div
                            key={i.id}
                            className={`relative m-1 p-2 rounded-full text-black bg-white/50  shadow-md overflow-hidden backdrop-blur-sm`}
                            layout
                            initial={{ opacity: 0, y: 0 }}
                            animate={{ opacity: 1, y: 60, backgroundColor: i.select ? "rgb(37 99 235 / 0.5)" : "rgb(255 255 255 / 0.5)" }}
                            exit={{ opacity: 0, y: 0 }}
                            whileHover={{
                                backgroundColor: "rgb(148 163 184 / 0.6)",
                                //transition: { duration: 0.3, ease: [0.4, 0.4, 0.4, 1] }
                            }}
                            onClick={() => {
                                console.log({click:"t"});
                                
                                if (pathname === `/${i.id}`) return;
                                router.push(`/${i.id}`);
                                inputRef.current?.blur();
                                updatePlaylistId(i.id);
                                setInputValue(i.id);
                                setInputFocused(false);
                            }}
                            onMouseEnter={() => setQuickListFocused(true)}
                            onMouseLeave={() => setQuickListFocused(false)}
                        >
                            <div className='relative'>{i.id}</div>
                            <div className='absolute inset-0' />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            <div className='relative flex h-14 items-center border-4 overflow-hidden'>
                <div className='absolute flex w-full h-full border-2 rounded-full focus:outline-none shadow-sm  bg-white/50  backdrop-blur-xl' />

                <motion.input
                    ref={inputRef}
                    type="text"
                    placeholder="請輸入歌單ID..."
                    onFocus={() => setInputFocused(true)}
                    onBlur={() => {
                        if (!quickListFocused) setInputFocused(false);
                    }}
                    //animate={{ borderColor: inputFocused || buttonFocused ? "rgb(59 130 246)" : "rgb(209 213 219)" }}
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
                    //onFocus={onHoverStart}
                    //onBlur={onHoverEnd}
                    onClick={() => {
                        if (pathname === `/${inputValue}`) return;
                        router.push(`/${inputValue}`);
                        inputRef.current?.blur();
                        updatePlaylistId(inputValue);
                    }}
                    className=" absolute right-1 bg-blue-500 rounded-full w-9 h-9 flex items-center justify-center"
                >
                    <FiSearch />
                </motion.button>

            </div>

        </motion.div>


    )
}
