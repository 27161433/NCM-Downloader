// app/api/temp/[filename]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { join } from 'path';
import { Config } from '@/types';
import { readFile, writeFile } from 'fs/promises';

export async function POST(req: NextRequest) {

    const data: number = await req.json();
    const id = data.toString();

    try {
        const configPath = join(process.cwd(), 'config.json');
        const configFile = await readFile(configPath, 'utf-8');
        const config: Config = JSON.parse(configFile);
        const index = config.playlistId.indexOf(id);

        if (index !== -1) config.playlistId.splice(index, 1);

        config.playlistId.unshift(id);
        if (config.playlistId.length >= 10) config.playlistId.length = 10;

        await writeFile(configPath, JSON.stringify(config, null, 4), 'utf-8');

        return new NextResponse("write config succes!", { status: 200 });
    } catch (error) {
        console.error("config寫入失敗", error);
        return new NextResponse("write config error!", { status: 500 });
    }
}
