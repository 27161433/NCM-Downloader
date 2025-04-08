import { Config, Song } from '@/types';
import axios from 'axios';
import { createWriteStream, existsSync, mkdirSync, readFileSync, renameSync, statSync } from 'fs';
import { playlist_detail, playlist_track_all, song_url_v1, SoundQualityType, song_detail } from 'NeteaseCloudMusicApi';
import { NextResponse } from 'next/server';
import { extname, join } from 'path';
import { WebSocketServer } from 'ws';
import { readFile, rename } from 'fs/promises';
import { spawn } from 'child_process';
import sharp from 'sharp';
import id3 from 'node-id3';

interface Queue {
    id: number;
    url: string;
    ext: string;
    coverFile?: string;
    title?: string;
    albumName?: string;
    artist?: string;
}

interface Message {
    type: string;
    playlistId: number;
    playlist: Song[];
}



const tempPath = join(process.cwd(), "temp");
const imagesPath = join(process.cwd(), "temp", "images");
const songsPath = join(process.cwd(), "temp", "songsPath");
const downloadPath = join(process.cwd(), "download");
const binPath = join(process.cwd(), "bin");

const playlist: Song[] = [];

const calculateSpeed = (startTime: number, downloaded: number) => {
    const currentTime = Date.now();
    const elapsedSeconds = (currentTime - startTime) / 1000;
    const speed = downloaded / elapsedSeconds;
    const kb_speed = speed / 1024
    let text = `${Math.round(kb_speed)} KB/s`

    if (kb_speed > 1024) text = `${(kb_speed / 1024).toFixed(2)} MB/s`

    return text;
};

const getPlaylist = async (send: (data: string) => void, id: number) => {
    playlist.length = 0;

    console.log('獲取歌單頁數中...');
    console.log(id);

    const configFile = await readFile(join(process.cwd(), 'config.json'), 'utf-8');
    const { cookie }: Config = JSON.parse(configFile);


    const illegalChars = /[<>:"\/\\|?*\x00-\x1F]/g;

    const get_playlist_detail = await playlist_detail({ id, cookie: cookie })
    const playlistDetail = get_playlist_detail.body.playlist as any
    const trackCount = playlistDetail.trackCount;
    const pageCount = Math.ceil(trackCount / 1000);

    console.log(`完成\n歌單共${pageCount}頁\n開始獲取每頁歌曲...`);


    for (let i = 0; i < pageCount; i++) {
        console.log(`獲取歌單歌曲第${i + 1}頁...`);

        const getPlaylist = await playlist_track_all({
            id,
            limit: 1000,
            offset: i * 1000,
            cookie
        });

        const songs = getPlaylist.body.songs as any[];
        //console.log(songs[1]);

        let a = 0

        const queue: Queue[] = [];
        const ids: number[] = [];

        for (const song of songs) {
            const _song = {
                name: song.name.replace(illegalChars, ''),
                id: song.id,
                albumName: song.al.name,
                albumId: song.al.id,
                albumCoverURL: song.al.picUrl,
                artist: song.ar.map((ar: any) => ar.name).join(' ').replace(illegalChars, ''),
                dt: song.dt,
                maxbr: "null",
                selected: false,
                percent: 0,
                speed: "0 KB/s"
            };

            queue.unshift({
                id: _song.albumId,
                url: _song.albumCoverURL,
                ext: extname(_song.albumCoverURL).split(".")[1]
            });
            playlist.unshift(_song);
            ids.unshift(song.id);
            a++;
            //console.log(song);

            //if (a > 200) break;
            //break
        }

        const songDetail = await song_detail({
            ids: ids.join(","),
            cookie,
            realIP: '211.161.244.70'
        });

        for (let i = 0; i < playlist.length; i++) {
            const song = playlist[i];
            song.maxbr = (songDetail.body.privileges[i] as any).plLevel
        }

        const threads = new Threads(8, send, "downloadImg", queue);
        threads.setDownloadPath(imagesPath);
        threads.start();


        send(JSON.stringify({ type: "getPlaylist", playlist }));

    }
}

const writeFLACMetaData = (songFile: string, coverFile: string, title: string, artist: string, album: string) => {

    const args = [
        `--import-picture-from=${coverFile}`,
        `--set-tag=TITLE=${title}`,
        `--set-tag=ARTIST=${artist}`,
        `--set-tag=ALBUM=${album}`,
        songFile
    ];

    const metaflac = spawn(join(binPath, 'metaflac.exe'), args);

    const onData = (data: Buffer) => console.log(`stdout: ${data}`);
    const onError = (data: Buffer) => console.error(`stderr: ${data}`);
    const onClose = async (code: number) => {
        console.log(`Process exited with code ${code}`);
        metaflac.stdout.off('data', onData);
        metaflac.stderr.off('data', onError);
        metaflac.off('close', onClose);
        await rename(songFile, (join(downloadPath, `${artist} - ${title}.flac`)));
        console.log('File moved successfully!');
    };

    metaflac.stdout.on('data', onData);
    metaflac.stderr.on('data', onError);
    metaflac.on('close', onClose);
}

class Threads {
    private queue: Queue[] = [];
    private activeThreads: number = 0;
    private path: string = tempPath;
    private maxThreads: number;
    private send: (d: string) => void;
    private type: string;


    constructor(maxThreads: number, send: (d: string) => void, type: string, queue?: Queue[]) {
        this.maxThreads = maxThreads;
        this.queue = queue || [];
        this.send = send;
        this.type = type;
    }

    setThreads(newThreads: number) {
        this.maxThreads = newThreads;
        this.update();
    }

    setQueue(queue: Queue[]) {
        this.queue = queue;
    }

    setDownloadPath(path: string) {
        this.path = path;
    }

    start() {
        for (let i = 0; i < this.maxThreads; i++) this.update();
    }

    async compress(inputPath: string, png: boolean, quality: number) {
        // 獲取原始圖像元數據
        const metadata = await sharp(inputPath).metadata();
        if (!metadata.width || !metadata.height) return console.log(`${inputPath} 沒有元數據`);
        const outputPath = inputPath + "cp";

        const compressOptions = {
            quality,
            forceResize: false
        };

        // 僅在符合條件時調整尺寸
        if (metadata.width > 1200 || metadata.height > 1200) compressOptions.forceResize = true;

        // // 執行處理
        const pipeline = sharp(inputPath);

        if (compressOptions.forceResize) {
            pipeline.resize({
                width: 1200,
                height: 1200,
                fit: 'inside',
                withoutEnlargement: true //如果圖片尺寸本來就比設定值小，則不放大圖片。
            });
        }

        if (png) await sharp(inputPath)
            .png({
                compressionLevel: 9,
                adaptiveFiltering: true,
                quality
            })
            .toFile(outputPath);
        else await pipeline
            .jpeg({
                quality,
                mozjpeg: true
            })
            .toFile(outputPath);

        const stats = statSync(outputPath);
        if (stats.size > 1.5e6) await this.compress(outputPath, png, quality - 10);
        else renameSync(outputPath, inputPath);

    }

    async update() {
        while (this.activeThreads < this.maxThreads && this.queue.length > 0) {
            const task = this.queue.shift();
            if (!task) break;
            this.activeThreads++;

            try {
                if (!existsSync(this.path)) mkdirSync(this.path);

                const fileName = `${task.id}.${task.ext}`;

                if (existsSync(join(this.path, fileName))) {
                    this.send(JSON.stringify({ type: this.type, fileName, exist: true }));
                    this.activeThreads--;
                    this.update();
                    return;
                }

                const startTime = Date.now();
                const response = await axios({
                    url: task.url,
                    responseType: "stream",
                });

                const totalSize = Number(response.headers["content-length"]);
                let downloadedSize = 0;
                const fileStream = createWriteStream(join(this.path, fileName));
                let timeout = false;

                if (this.type === "downloadSong")
                    response.data.on("data", (chunk: Buffer) => {
                        downloadedSize += chunk.length;
                        const percent = ((downloadedSize / totalSize) * 100);//.toFixed(2);
                        const speed = calculateSpeed(startTime, downloadedSize);
                        //console.log({ percent, speed });

                        if (!timeout) {
                            timeout = true;
                            this.send(JSON.stringify({ type: "downloadProgress", songId: task.id, percent, speed }));
                            setTimeout(() => timeout = false, 500);
                        }
                    });

                response.data.pipe(fileStream);

                fileStream.once("finish", async () => {
                    this.send(JSON.stringify({ type: this.type, fileName, songId: task.id }));
                    this.activeThreads--;
                    this.update();
                    if (this.type === "downloadSong") {
                        if (!task.coverFile || !task.title || !task.artist || !task.albumName) return;
                        console.log(task.ext.toLowerCase());

                        const stats = statSync(task.coverFile);

                        if (stats.size > 1.5e6) await this.compress(task.coverFile, extname(task.coverFile) === "png", 90);

                        if (task.ext.toLowerCase() === "flac") writeFLACMetaData(join(this.path, fileName), task.coverFile, task.title, task.artist, task.albumName);
                        else if (task.ext.toLowerCase() === "mp3") {

                            const tags = {
                                title: task.title,
                                artist: task.artist,
                                album: task.albumName,
                                image: {
                                    mime: 'image/jpeg',
                                    type: {
                                        id: 3, // Cover (front)
                                        name: 'Cover (front)'
                                    },
                                    description: 'Front Cover',
                                    imageBuffer: readFileSync(task.coverFile)
                                }
                            };

                            const success = id3.write(tags, join(this.path, fileName));
                            if (!success) console.log(join(this.path, fileName) + 'ID3 寫入失敗');

                            await rename((join(songsPath, fileName)), (join(downloadPath, `${task.artist} - ${task.title}.${task.ext}`)));
                            console.log('File moved successfully!');
                        }
                    }
                });


                fileStream.on("error", (error) => {
                    console.error(`錯誤: ${error.message}`);
                });

            } catch (error) {
                console.error(error);
            }
        }
    }
}
export function GET() {
    if (!(global as any).wsServer) {

        const wss = new WebSocketServer({ port: 3001 });

        wss.on("connection", (ws) => {
            console.log('🔗 客戶端已連接');
            const threads = new Threads(8, d => ws.send(d), "downloadSong");


            ws.on('message', async (data) => {
                //console.log(`📩 收到消息: ${JSON.parse(data.toString())}`);
                //console.log(JSON.parse(data.toString()));


                const { type, playlistId, playlist }: Message = JSON.parse(data.toString());

                switch (type) {
                    case "getPlaylist":
                        getPlaylist(d => ws.send(d), playlistId);
                        break;
                    case "downloadSong":
                        const configFile = await readFile(join(process.cwd(), 'config.json'), 'utf-8');
                        const config: Config = JSON.parse(configFile);

                        const queue: Queue[] = [];
                        const ids = [];

                        //const res = await Promise.all(newPromise);
                        for (const song of playlist) {
                            if (!song.selected) continue;
                            ids.push(song.id);
                        }

                        const songData = await song_url_v1({
                            id: ids.join(','),
                            level: config.biterate,
                            cookie: config.cookie,
                            realIP: '211.161.244.70'
                        });

                        for (const song of (songData.body.data as any[])) {
                            const songURL = song.url;
                            if (!songURL) continue;
                            const p = playlist.find(s => s.id === song.id);
                            if (!p) continue;
                            queue.push({
                                id: song.id,
                                url: songURL,
                                ext: song.type,
                                coverFile: join(imagesPath, `${p.albumId}${extname(p.albumCoverURL)}`),
                                title: p.name,
                                albumName: p.albumName,
                                artist: p.artist
                            });
                        }

                        threads.setDownloadPath(songsPath);
                        threads.setQueue(queue);
                        threads.start();
                        break;
                    default:
                        break;
                }
            });

            ws.on('close', () => console.log('❌ 客戶端已斷開'));
        });

        (global as any).wsServer = wss;
        console.log(`🚀 WebSocket 伺服器運行中，port: ${3001}`);
    }

    return new NextResponse(`🚀 WebSocket 伺服器運行中，port: ${3001}`, { status: 200 });

}