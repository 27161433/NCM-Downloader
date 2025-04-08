// app/api/temp/[filename]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { join, extname } from 'path';
import { readFileSync, existsSync } from 'fs';

export async function GET(req: NextRequest, { params }: { params: Promise<{ filename: string }> }) {
    const { filename } = await params;

    const filePath = join(process.cwd(), 'temp', 'images', filename);

    if (!existsSync(filePath)) return NextResponse.json({ error: 'File not found' }, { status: 404 });
    
    const ext = extname(filename).toLowerCase();
    let contentType = 'application/octet-stream';

    switch (ext) {
        case '.jpg':
        case '.jpeg':
            contentType = 'image/jpeg';
            break;
        case '.png':
            contentType = 'image/png';
            break;
        default:
            contentType = 'application/octet-stream'
            break;
    }    

    try {
        const imageBuffer = readFileSync(filePath);
        return new NextResponse(imageBuffer, {
            headers: {
                'Content-Type': contentType,
            },
        });
    } catch (error) {
        return NextResponse.json({ error: 'Error reading file' }, { status: 500 });
    }
}
