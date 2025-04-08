"use client";

import { useDownloadContext } from '@/Components/DownloadContext';
import { useParams } from 'next/navigation';
import { useEffect } from 'react'

export default function page() {

    const { updatePlaylistId } = useDownloadContext();
    const params = useParams()
    useEffect(() => {
        console.log(params.listId);
        updatePlaylistId(params.listId as string);
    }, [])

    return null;
}
