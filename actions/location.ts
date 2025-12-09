'use server';

import { db } from '@/lib/db';
import { locations } from '@/lib/schema';
import { revalidatePath } from 'next/cache';
import { desc } from 'drizzle-orm';

export interface LocationData {
    name: string;
    description: string;
    latitude: number;
    longitude: number;
}

export async function addLocation(data: LocationData) {
    try {
        await db.insert(locations).values(data);
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error('Error adding location:', error);
        return { success: false, error: 'Failed to add location' };
    }
}

export async function getLocations() {
    try {
        const data = await db.select().from(locations).orderBy(desc(locations.createdAt));
        return { success: true, data };
    } catch (error) {
        console.error('Error getting locations:', error);
        return { success: false, data: [] };
    }
}
