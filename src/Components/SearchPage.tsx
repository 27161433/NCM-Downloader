"use client";
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { FiArrowDown, FiCheckCircle, FiCircle, FiSearch } from "react-icons/fi";

import { usePathname, useRouter } from 'next/navigation';
import List from '@/Components/List';
import { useDownloadContext } from './DownloadContext';
import AniButton from './AniButton';
import DetailPage from './DetailPage';

export default function SearchPage() {
    const [isSelectAll, setIsSelectAll] = useState(false);

    const { playlist, setPlaylist, wsSend, setIsDownloading, isDownloading } = useDownloadContext();

    const router = useRouter();

    const SelectAllButtonOnClick = () => {

    };


    const pathname = usePathname();
    const searchUI = () => {
        const id = pathname.split("/")[1];
        return !isNaN(+id) && id.length > 0;
    }
    return (
        <AnimatePresence>
            {searchUI() && <motion.div className='absolute flex flex-col inset-0 m-10 mt-20 border-4 border-green-400'
                exit={{ opacity: 0, transition: { ease: [0.4, 0.4, 0.4, 1], duration: 1 } }}
            >
                <div className='relative flex flex-1  border-4 border-fuchsia-600 min-h-0'>

                    <DetailPage />
                    <List className=" flex-1 border-4 ml-2 rounded-xl" />


                </div>
                <div
                    className='relative flex min-h-20 border-4 border-green-200 items-center justify-center'
                >
                    <div className="absolute flex right-1 border-4 border-sky-400 items-center justify-center">

                        <AniButton
                            onClick={() => {
                                if (isDownloading) return;
                                const newPlaylist = playlist.map(song => ({ ...song, selected: !isSelectAll }));
                                setPlaylist(newPlaylist);
                                setIsSelectAll(!isSelectAll);
                            }}
                            delay={0.1}>
                            <AnimatePresence>
                                {isSelectAll &&
                                    <motion.div
                                        className='absolute'
                                        initial={{ scale: 0.7, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0.7, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <FiCircle className='w-7 h-7' />
                                    </motion.div>}

                            </AnimatePresence>

                            <AnimatePresence>
                                {!isSelectAll &&
                                    <motion.div
                                        className='absolute'
                                        initial={{ scale: 0.7, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0.7, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <FiCheckCircle className='w-7 h-7' />
                                    </motion.div>}
                            </AnimatePresence>
                        </AniButton>

                        <AniButton
                            onClick={() => {
                                if (isDownloading) return;
                                setIsDownloading(true);
                                wsSend({ type: "downloadSong", playlist });
                            }}
                            delay={0}>
                            <FiArrowDown className='w-7 h-7' />
                        </AniButton>


                    </div>


                </div>
            </motion.div>}
        </AnimatePresence>

    );
}