import { motion } from 'motion/react';
import { ReactNode } from 'react';
import { useDownloadContext } from './DownloadContext';

const AniButton = ({ onClick, delay, children }: { onClick: () => void, delay: number, children?: ReactNode }) => {
    const { isDownloading } = useDownloadContext();

    return (
        <motion.div
            className=" relative flex m-1 bg-blue-500 rounded-full w-12 h-12 items-center justify-center overflow-hidden"
            whileHover={isDownloading ? {} : { scale: 1.15 }}
            whileTap={isDownloading ? {} : { scale: 0.9 }}
            onClick={onClick}
            initial={{ x: "-100vw" }}
            animate={{
                x: 0,
                rotate: 360,
            }}
            transition={{
                type: "spring",
                x: { duration: 1, ease: [0.4, 0.4, 0.4, 1], delay },
                rotate: { duration: 1, ease: [0.4, 0.4, 0.4, 1], delay },
            }}
        >
            {children}
            <motion.div
                className=' absolute inset-0'
                animate={{
                    backgroundColor: isDownloading ? "rgb(71 85 105 / 0.7)" : "rgb(59 130 246 / 0)"
                }}
                transition={{
                    backgroundColor: { duration: 0.5, ease: [0.4, 0.4, 0.4, 1] }
                }}>
            </motion.div>
            
        </motion.div>
    );
}

export default AniButton;
