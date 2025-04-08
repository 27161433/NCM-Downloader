"use client";
import { Config, Song, SongDetails } from '@/types';
import axios from 'axios';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';


interface Image {
    [itemId: string]: {
        fileName: string;
    };
}

interface Items {
    [id: string]: {
        ready: boolean;
    };
}

interface Data {
    type: string;
    playlist: Song[];
    fileName: string;
    songId: number;
    percent: number;
    speed: string;
}
// Context 的值類型
interface DownloadContextValue {
    imageState: Image;
    updateItemState: (fileName: string) => void;
    initItemState: () => void;
    playlist: Song[];
    setPlaylist: React.Dispatch<React.SetStateAction<Song[]>>;
    updatePlaylist: (id: number) => void;
    initPlaylist: () => void;
    itemsReady: Items;
    updateItemsReady: (id: number, ready?: boolean) => void;
    playlistId: string;
    updatePlaylistId: (id: string) => void;
    wsSend: (message: any) => void;
    isWsConnected: boolean;
    isDownloading: boolean;
    setIsDownloading: React.Dispatch<React.SetStateAction<boolean>>;
    songDetails: SongDetails | null;
    setSongDetails: (details: SongDetails) => void;
    downloadList: number[]
}

// 創建 Context
const DownloadContext = createContext<DownloadContextValue | undefined>(undefined);

// Provider 負責存儲狀態並提供更新函數
export const DownloadProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [imageState, setImageState] = useState<Image>({});
    const [playlist, setPlaylist] = useState<Song[]>([]);
    const [itemsReady, setItemsReady] = useState<Items>({});
    const [playlistId, setPlaylistId] = useState<string>("");
    const [isWsConnected, setIsWsConnected] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [songDetails, _setSongDetails] = useState<SongDetails | null>(null);
    const [downloadList, setDownloadList] = useState<number[]>([]);


    const timerRef = useRef<NodeJS.Timeout | null>(null);


    const wsRef = useRef<WebSocket | null>(null);
    // const playlistRef = useRef<Song[]>(playlist);

    // useEffect(() => {
    //     playlistRef.current = playlist;
    // }, [playlist]);

    useEffect(() => {
        (async () => {
            await axios("/api/ws").catch(console.error);

            if (!wsRef.current) {
                // 初始化 WebSocket 連線
                wsRef.current = new WebSocket("ws://localhost:3001");

                wsRef.current.onopen = () => {
                    setIsWsConnected(true);
                    console.log("✅ WebSocket 已連接");
                }
                wsRef.current.onclose = () => {
                    console.log("❌ WebSocket 連線已關閉");
                    setIsWsConnected(false);
                };
                wsRef.current.onerror = (err) => console.error("⚠️ WebSocket 錯誤:", err);

                wsRef.current.onmessage = (event) => {
                    //console.log(event.data);

                    const data: Data = JSON.parse(event.data);
                    //setPlaylist(res.data);
                    //console.log("📩 收到 WebSocket 訊息:", data);
                    switch (data.type) {
                        case "getPlaylist":
                            setPlaylist(data.playlist);
                            break;
                        case "downloadImg":
                            updateItemState(data.fileName);
                            console.log(data.fileName);

                            break;
                        case "downloadProgress":
                            setPlaylist((prevPlaylist) =>
                                prevPlaylist.map(song =>
                                    song.id === data.songId
                                        ? { ...song, percent: data.percent, speed: data.speed }
                                        : song
                                )
                            );
                            setDownloadList(pre => {
                                const newlist = pre.map(p => p);
                                const index = pre.indexOf(data.songId);
                                if (index !== -1) return pre;
                                newlist.push(data.songId);
                                return newlist;
                            });
                            break;
                        case "downloadSong":
                            setPlaylist((prevPlaylist) =>
                                prevPlaylist.map(song =>
                                    song.id === data.songId
                                        ? { ...song, percent: 100 }
                                        : song
                                )
                            );
                            setDownloadList(pre => {
                                const newlist = pre.map(p => p);
                                const index = pre.indexOf(data.songId);
                                if (index === -1) return pre;
                                newlist.splice(index, 1);
                                return newlist;
                            });
                            break;
                        default:
                            break;
                    }

                };
            }
        })();

        return () => {
            if (wsRef.current) {
                wsRef.current.close();
                wsRef.current = null;
            }
        };
    }, []);

    const wsSend = (message: any) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify(message));
        } else {
            console.warn("WebSocket 未連接，無法發送訊息");
        }
    };

    const updateItemState = (fileName: string) => setImageState((prev) => ({
        ...prev,
        [fileName.split('.')[0]]: { fileName }
    }));

    const initItemState = () => setImageState({});

    const updatePlaylist = (id: number) => {
        const newPlaylist = playlist.map(song => song.id === id ? { ...song, selected: !song.selected } : song);
        setPlaylist(newPlaylist);
    }

    const initPlaylist = () => setPlaylist([]);

    const updateItemsReady = (id: number, ready: boolean = false) => setItemsReady((prev) => ({
        ...prev,
        [id]: { ready }
    }));

    const updatePlaylistId = async (id: string) => {
        setPlaylistId(id);

        try {
            await axios({
                method: "POST",
                url: "/api/updateConfigId",
                data: id
            });
        } catch (error) {
            console.error(error);
        }
    }

    const setSongDetails = (details: SongDetails) => {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
            _setSongDetails(details);
        }, 300);
    }

    return (
        <DownloadContext.Provider
            value={{
                imageState,
                updateItemState,
                initItemState,
                playlist,
                setPlaylist,
                updatePlaylist,
                initPlaylist,
                itemsReady,
                updateItemsReady,
                playlistId,
                updatePlaylistId,
                wsSend,
                isWsConnected,
                isDownloading,
                setIsDownloading,
                songDetails,
                setSongDetails,
                downloadList
            }}>
            {children}
        </DownloadContext.Provider>
    );
};

// 用來取用 Context
export const useDownloadContext = () => {
    const context = useContext(DownloadContext);
    if (!context) {
        throw new Error('useDownloadContext 必須在 DownloadProvider 內部使用');
    }
    return context;
};
