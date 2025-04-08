import { SoundQualityType } from "NeteaseCloudMusicApi";

export interface Config {
    cookie: string;
    playlistId: string[];
    thread: number;
    biterate: SoundQualityType;
}