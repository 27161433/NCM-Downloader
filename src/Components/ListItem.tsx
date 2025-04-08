import { useEffect, useRef, useState } from 'react'
import Image from 'next/image';
import { Song } from '@/types';

import { animate, AnimatePresence, motion } from 'motion/react';
import { useDownloadContext } from './DownloadContext';

export default function ListItem({ song, ani, delay, show }: { song: Song, ani: boolean, delay: number, show: boolean }) {
    const { dt, name, artist } = song;
    const [isLoading, setIsLoading] = useState(true);
    const [aniFinish, setAniFinish] = useState(false);
    const [isDownloadingAni, setIsDownloadingAni] = useState(false);
    const [oldPercent, setOldPercent] = useState(-100);
    const [newPercent, setNewPercent] = useState(-100);

    //const [isbgLoading, setIsbgLoading] = useState(true);
    const { updatePlaylist, imageState, playlist, isDownloading, setSongDetails } = useDownloadContext();
    const image = imageState[song.albumId];
    const timerRef = useRef<NodeJS.Timeout | null>(null);


    const isSelected = () => playlist.find(p => p.id === song.id && p.selected);
    const s = playlist.find(s => s.id === song.id);

    const isFinish = () => s && s.percent >= 100
    

    useEffect(() =>{
        if (isDownloading) setIsDownloadingAni(show);
    }, [isDownloading])

    useEffect(() =>{
        if (s && isDownloading) setNewPercent(-(100 - Math.floor(s.percent)));
    }, [playlist])



    return (

        show && <motion.div className={`h-20 m-2 text-black rounded-xl bg-white/50`}
            initial={ani && !aniFinish ? { opacity: 0, y: "100%" } : {}}
            animate={ani && !aniFinish ? { opacity: 1, y: 0, transition: { ease: [0.4, 0.4, 0.4, 1], duration: 0.5, delay } } : {}}
            onClick={() => !isDownloading && updatePlaylist(song.id)}
            exit={{ opacity: 0, transition: { ease: [0.4, 0.4, 0.4, 1], duration: 1 } }}
            //whileInView={{ opacity: 1, y: 0, transition: { ease: [0.4, 0.4, 0.4, 1], duration: 0.5 } }}
            onMouseEnter={() => {
                if (isDownloading) return;
                if (!image) return;
                const newDetails = {
                    id: song.id,
                    title: song.name,
                    albumName: song.albumName,
                    coverURL: `/api/${image.fileName}`,
                    artist: song.artist,
                    dt: song.dt,
                    ani: Date.now()
                }
                setSongDetails(newDetails);
            }}

            onAnimationComplete={() => setAniFinish(true)}
        //viewport={{ once: true }}
        >

            <div className='relative h-full rounded-xl overflow-hidden'>

                {/* <motion.div
                    className='absolute inset-0 blur-md'
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isbgLoading && isbgLoading ? 0 : 1 }}
                    transition={{ duration: 0.5, }} >

                    {image && <Image className={`object-center object-cover pointer-events-none`}
                        src={`/api/${image.fileName}`}
                        alt={name}
                        loading={ani ? "eager" : "lazy"}
                        priority={ani}
                        fill
                        sizes='5vw'
                        placeholder="blur"
                        blurDataURL={`/api/${image.fileName}`}
                        onLoad={() => setIsbgLoading(false)} />
                    }


                </motion.div> */}

                <motion.div
                    className='absolute left-20 right-0 h-full overflow-hidden'
                    initial={{
                        x:`${oldPercent}%`,
                    }}
                    animate={{
                        x: `${newPercent}%`,
                        backgroundColor: isFinish() ? "rgb(22 163 74 / 0.5)" : "rgb(59 130 246 / 0.5)"
                    }}
                    transition={{ ease: [0.4, 0.4, 0.4, 1], duration: 0.5 }}
                    onAnimationComplete={() => {
                        if (!s) return;
                        setOldPercent(newPercent);

                        
                        
                    }}
                >
                    <AnimatePresence>
                        {!isFinish() &&
                            <motion.div
                                className='relative w-20 h-full bg-white/70 blur-xl'
                                initial={{ left: "-20%" }}
                                animate={{ left: "120%" }}
                                transition={{ ease: [0.4, 0.4, 0.4, 1], duration: 1.5, repeat: Infinity }}
                            />
                        }
                    </AnimatePresence>


                </motion.div>

                <motion.div className='relative flex items-center h-full w-full bg-white/50 rounded-xl overflow-hidden'
                    animate={{
                        backgroundColor: (() => {
                            if (isDownloading) return "rgb(255 255 255 / 0.5)";
                            if (isSelected()) return "rgb(59 130 246 / 0.5)";
                        })(),
                        transition: { duration: 0.3, ease: [0.4, 0.4, 0.4, 1] }
                    }}
                    whileHover={!isDownloading ? {
                        backgroundColor: (() => isSelected() ? "rgb(92, 142, 223, 0.8)" : "rgb(148 163 184 / 0.6)")(),
                        transition: { duration: 0.3, ease: [0.4, 0.4, 0.4, 1] }
                    } : {}}
                >

                    {<div className='absolute w-20 h-full bg-slate-400' />}
                    {image ?
                        <motion.div className={`relative min-w-20 h-full bg-gray-400`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: isLoading ? 0 : 1 }}
                            transition={{ duration: 0.5, }}
                        >
                            <Image className='object-center object-cover '
                                src={`/api/${image.fileName}`}
                                alt={name}
                                loading={ani ? "eager" : "lazy"}
                                priority={ani}
                                fill
                                sizes='100%'
                                onLoad={() => setIsLoading(false)} />
                        </motion.div> : <div className='min-w-20 h-full' />
                    }



                    <div className='flex flex-auto items-center'>
                        <div className='flex flex-auto mx-1 border-2 border-violet-100'>{`${artist} - ${name}`}</div>
                        <div className='flex justify-end mx-1 min-w-20 border-2 border-violet-100'>
                            {`${(() => {
                                const s = Math.floor(dt / 1000);
                                const ss = s % 60;
                                const m = Math.floor(s / 60);
                                const mm = m % 60;
                                const hh = Math.floor(m / 60);
                                return `${hh ? `${hh.toString().padStart(2, "0")}:` : ""}${mm.toString().padStart(2, "0")}:${ss.toString().padStart(2, "0")}`
                            })()}`}
                        </div>
                    </div>

                    <div className='absolute inset-0'>

                    </div>

                    {isDownloading && !isSelected() && <motion.div
                        className='absolute inset-0 bg-neutral-950/50'
                        initial={isDownloadingAni && { opacity: 0 }}
                        animate={isDownloadingAni && { opacity: 1 }}
                        transition={{ ease: [0.4, 0.4, 0.4, 1], duration: 0.5 }}
                        onAnimationComplete={() => {
                            setIsDownloadingAni(false);
                        }}
                    />}

                </motion.div>
            </div>

        </motion.div>


    )
}