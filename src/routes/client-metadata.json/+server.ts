import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import metadata from '$lib/client-metadata.json';

export const GET: RequestHandler = async () => {
    return json(metadata, {
        headers: {
            'Cache-Control': 'no-store'
        }
    });
};