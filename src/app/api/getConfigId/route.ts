// app/api/temp/[filename]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { join, extname } from 'path';
import { Config } from '@/types';
import { readFile, writeFile } from 'fs/promises';

export async function GET(req: NextRequest) {
    
    
    try {
        const configPath = join(process.cwd(), 'config.json');
        const configFile = await readFile(configPath, 'utf-8');
        const config: Config = JSON.parse(configFile);
        return NextResponse.json(config.playlistId, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Error reading file' }, { status: 500 });
    }
    
}
