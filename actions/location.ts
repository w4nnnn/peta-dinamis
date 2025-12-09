'use server';

import { db } from '@/lib/db';
import { locations } from '@/lib/schema';
import { revalidatePath } from 'next/cache';
import { desc, eq } from 'drizzle-orm';

export interface LocationData {
    name: string;
    description: string;
    category: string;
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

export async function updateLocation(id: number, data: LocationData) {
    try {
        await db.update(locations)
            .set(data)
            .where(eq(locations.id, id));
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error('Error updating location:', error);
        return { success: false, error: 'Failed to update location' };
    }
}

export async function deleteLocation(id: number) {
    try {
        await db.delete(locations).where(eq(locations.id, id));
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error('Error deleting location:', error);
        return { success: false, error: 'Failed to delete location' };
    }
}
