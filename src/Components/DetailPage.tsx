import { useEffect, useRef, useState } from 'react'
import ListItem from './ListItem';
import axios from 'axios';
import { Song } from '@/types';
import { useDownloadContext } from './DownloadContext';
import { AnimatePresence, motion } from 'motion/react';
import Image from 'next/image';

export default function DetailPage({ className }: { className?: string }) {
    const { songDetails, isDownloading } = useDownloadContext();


    return (
        <AnimatePresence>
            <motion.div className={'relative flex-col flex items-center backdrop-blur-lg bg-white/25 rounded-xl mr-2 w-96 border-4 border-orange-300 pointer-events-none overflow-hidden'}
                initial={{ opacity: 0, x: "-100%" }}
                animate={{ opacity: 1, x: 0, transition: { ease: [0.4, 0.4, 0.4, 1], duration: 1 } }}
            //exit={{ opacity: 0, transition: { ease: [0.4, 0.4, 0.4, 1], duration: 1 } }}
            >
                <div className='relative mt-9 h-[300px] aspect-square border-4'>
                    <AnimatePresence>
                        {songDetails &&
                            <motion.div
                                key={songDetails.ani}
                                className="absolute inset-0 h-full w-full rounded-2xl overflow-hidden shadow-2xl border-4"
                                initial={{ opacity: 0, x: "-100%" }}
                                animate={{ opacity: 1, x: "0%" }}
                                exit={{ opacity: 0, x: "100%" }}
                                transition={{ duration: 0.5, ease: [0.4, 0.4, 0.4, 1] }}
                            >
                                <Image className={`object-center object-cover`}
                                    src={songDetails.coverURL}
                                    alt={songDetails.title}
                                    fill
                                    sizes='100%' />
                            </motion.div>
                        }
                    </AnimatePresence>
                </div>


                <AnimatePresence>
                    {songDetails && (
                        <motion.div
                            key={songDetails.ani}
                            className="absolute inset-x-0 top-[344px] mt-2 flex flex-col justify-center items-center text-wrap text-2xl border-4 text-center"
                            initial={{ opacity: 0, x: "-100%" }}
                            animate={{ opacity: 1, x: "0%" }}
                            exit={{ opacity: 0, x: "100%" }}
                            transition={{ duration: 0.5, ease: [0.4, 0.4, 0.4, 1] }}
                        >
                            <div>
                                {songDetails.title}
                            </div>
                            <div className=' text-lg'>
                                {songDetails.artist}
                            </div>

                        </motion.div>
                    )}
                </AnimatePresence>


            </motion.div>
        </AnimatePresence>
    )
}