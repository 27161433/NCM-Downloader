import React, { useEffect, useRef, useState } from 'react'
import ListItem from './ListItem';
import axios from 'axios';
import { Song } from '@/types';
import { useDownloadContext } from './DownloadContext';
import { AnimatePresence, motion } from 'motion/react';

export default function List({ className }: { className?: string }) {
    const { isWsConnected, playlist, initPlaylist, wsSend, playlistId, downloadList } = useDownloadContext();
    const [showItems, setShowItems] = useState({ st: 0, ed: 0, items: 0 });
    const [isLoading, setIsLoading] = useState(true);

    const listRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        initPlaylist();

        if (!isWsConnected) return;

        wsSend({ type: "getPlaylist", playlistId });
        setIsLoading(true);
    }, [isWsConnected, playlistId]);

    useEffect(() => {
        if (playlist.length !== 0) setIsLoading(false);
    }, [playlist]);
    useEffect(() => {



        // axios("/api/getPlaylist")
        //     .then((res) => {
        //         setPlaylist(res.data);
        //         // if (!listRef.current) return;
        //         // const { clientHeight } = listRef.current;
        //         // const items = Math.ceil(clientHeight / (itemHeight + margin));
        //         // for (let i = 0; i < items; i++) updateItemsReady(res.data[i].id);
        //         // console.log(555);
        //     })
        //     .catch(console.error);

        const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
        const itemHeight = 5 * rootFontSize;
        const margin = 0.5 * rootFontSize;

        const setShowItemData = () => {
            if (!listRef.current) return;
            const { scrollTop, clientHeight } = listRef.current;
            const items = Math.ceil(clientHeight / (itemHeight + margin));
            const scrollItems = Math.floor((margin + clientHeight + scrollTop) / (itemHeight + margin));
            const st = scrollItems - items;
            const ed = scrollItems;


            setShowItems({ st, ed, items });
        };

        setShowItemData();

        const listEl = listRef.current;
        if (listEl) listEl.addEventListener("scroll", setShowItemData);

        window.addEventListener("resize", setShowItemData);
        return () => {
            if (listEl) listEl.removeEventListener("scroll", setShowItemData);
            window.removeEventListener("resize", setShowItemData);
        }
    }, []);

    useEffect(() => {
        if (!listRef.current) return;

        const song = playlist.find(s => s.id === downloadList[0]);
        if (!song) return;
        const index = playlist.indexOf(song);
        const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
        const itemHeight = 5 * rootFontSize;
        const margin = 0.5 * rootFontSize;

        listRef.current.scrollTo({
            top: (itemHeight + margin) * index,
            behavior: 'smooth'
        });
    }, [downloadList]);

    // useEffect(() => {

    //     const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
    //     const itemHeight = 5 * rootFontSize;
    //     const margin = 0.5 * rootFontSize;

    //     const handleScroll = () => {
    //         if (!listRef.current) return;
    //         const { scrollTop, clientHeight, scrollHeight } = listRef.current;
    //         const items = Math.ceil(clientHeight / (itemHeight + margin));
    //         const st = Math.ceil((margin + clientHeight + scrollTop) / (itemHeight + margin)) - items;
    //         const ed = Math.ceil((margin + clientHeight + scrollTop) / (itemHeight + margin));

    //         setShowItems({ st, ed, items });
    //     };

    //     const listEl = listRef.current;
    //     if (listEl) listEl.addEventListener("scroll", handleScroll);

    //     return () => {
    //         if (listEl) listEl.removeEventListener("scroll", handleScroll);
    //     };
    // }, []);

    // const g = () => {
    //     const itemLength = showItems.st - showItems.items;
    //     const maxh = 88 * (playlist.length - showItems.items - showItems.items )

    //     return itemLength < 0 ? 0 : itemLength * 88 > maxh ? maxh : itemLength * 88
    // }
    return (
        <AnimatePresence>

            <motion.div ref={listRef} className={'flex-col overflow-y-auto overflow-hidden bg-white/25 backdrop-blur-lg ' + className}
                initial={{ opacity: 0, x: "120%" }}
                animate={{
                    opacity: 1,
                    x: 0,
                    transition: { ease: [0.4, 0.4, 0.4, 1], duration: 1 }
                }}
            //exit={{ opacity: 0, transition: { ease: [0.4, 0.4, 0.4, 1], duration: 1 } }}
            >
                <motion.div
                    className=''
                    animate={{
                        x: isLoading ? "120%" : 0,
                        transition: { ease: [0.4, 0.4, 0.4, 1], duration: 1 }
                    }}>
                    <div className={``}
                        style={{
                            height: showItems.st - showItems.items < 0 ? 0 : (showItems.st - showItems.items) * 88
                        }} />

                    <AnimatePresence>
                        {playlist.map((item, index) => (
                            <ListItem
                                key={item.id}
                                song={item}
                                ani={index < showItems.items}
                                delay={index * 0.1}
                                show={index >= showItems.st - showItems.items && index <= showItems.ed + showItems.items} />
                        ))}
                    </AnimatePresence>
                    <div className={``}
                        style={{
                            height: (playlist.length - (showItems.ed + showItems.items)) * 88 < 0 ? 0 : (playlist.length - (showItems.ed + showItems.items)) * 88
                        }} />
                </motion.div>

                {/* <AnimatePresence>
                {isLoading && <motion.div className={' absolute bg-white/50 border-4 ' + className}
                    initial={{ opacity: 0 }}
                    animate={{
                        opacity: 1,
                        transition: { ease: [0.4, 0.4, 0.4, 1], duration: 1, repeat: Infinity }
                    }} />}
            </AnimatePresence> */}





            </motion.div>

        </AnimatePresence>
    )
}