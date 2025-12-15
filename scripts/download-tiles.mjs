/**
 * Script untuk mendownload tile OpenStreetMap untuk penggunaan offline
 * Bounding Box:
 * - Min Lat: -7.469666314397088
 * - Max Lat: -7.449283835216734
 * - Min Lon: 112.71131515502931
 * - Max Lon: 112.73800849914552
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Bounding box dari koordinat yang diberikan
const BOUNDS = {
    minLat: -7.469666314397088,
    maxLat: -7.449283835216734,
    minLon: 112.71131515502931,
    maxLon: 112.73800849914552
};

// Zoom levels yang akan didownload
const MIN_ZOOM = 14;
const MAX_ZOOM = 19;

// Output directory
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'tiles');

// Delay antar request (ms) untuk menghindari rate limit
const REQUEST_DELAY = 100;

// Konversi lat/lon ke tile coordinates
function latLonToTile(lat, lon, zoom) {
    const x = Math.floor(((lon + 180) / 360) * Math.pow(2, zoom));
    const y = Math.floor(
        ((1 - Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) / Math.PI) / 2) *
        Math.pow(2, zoom)
    );
    return { x, y };
}

// Fungsi untuk mendownload satu tile
async function downloadTile(z, x, y) {
    const url = `https://tile.openstreetmap.org/${z}/${x}/${y}.png`;
    const outputPath = path.join(OUTPUT_DIR, z.toString(), x.toString());
    const filePath = path.join(outputPath, `${y}.png`);

    // Skip jika file sudah ada
    if (fs.existsSync(filePath)) {
        return { status: 'skipped', z, x, y };
    }

    // Buat directory jika belum ada
    fs.mkdirSync(outputPath, { recursive: true });

    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'OfflineMapDownloader/1.0 (https://github.com/example)'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const buffer = await response.arrayBuffer();
        fs.writeFileSync(filePath, Buffer.from(buffer));

        return { status: 'downloaded', z, x, y };
    } catch (error) {
        return { status: 'error', z, x, y, error: error.message };
    }
}

// Fungsi sleep
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Main function
async function main() {
    console.log('='.repeat(50));
    console.log('🗺️  OpenStreetMap Tile Downloader');
    console.log('='.repeat(50));
    console.log(`\nBounding Box:`);
    console.log(`  Lat: ${BOUNDS.minLat} to ${BOUNDS.maxLat}`);
    console.log(`  Lon: ${BOUNDS.minLon} to ${BOUNDS.maxLon}`);
    console.log(`\nZoom levels: ${MIN_ZOOM} - ${MAX_ZOOM}`);
    console.log(`Output: ${OUTPUT_DIR}\n`);

    // Hitung total tiles
    let totalTiles = 0;
    for (let z = MIN_ZOOM; z <= MAX_ZOOM; z++) {
        const topLeft = latLonToTile(BOUNDS.maxLat, BOUNDS.minLon, z);
        const bottomRight = latLonToTile(BOUNDS.minLat, BOUNDS.maxLon, z);
        const tilesInZoom = (bottomRight.x - topLeft.x + 1) * (bottomRight.y - topLeft.y + 1);
        totalTiles += tilesInZoom;
        console.log(`  Zoom ${z}: ${tilesInZoom} tiles`);
    }
    console.log(`\nTotal tiles to download: ${totalTiles}\n`);

    let downloaded = 0;
    let skipped = 0;
    let errors = 0;

    for (let z = MIN_ZOOM; z <= MAX_ZOOM; z++) {
        const topLeft = latLonToTile(BOUNDS.maxLat, BOUNDS.minLon, z);
        const bottomRight = latLonToTile(BOUNDS.minLat, BOUNDS.maxLon, z);

        console.log(`\n📥 Downloading zoom level ${z}...`);

        for (let x = topLeft.x; x <= bottomRight.x; x++) {
            for (let y = topLeft.y; y <= bottomRight.y; y++) {
                const result = await downloadTile(z, x, y);

                if (result.status === 'downloaded') {
                    downloaded++;
                    process.stdout.write(`\r  Progress: ${downloaded + skipped}/${totalTiles} (${Math.round(((downloaded + skipped) / totalTiles) * 100)}%)`);
                } else if (result.status === 'skipped') {
                    skipped++;
                    process.stdout.write(`\r  Progress: ${downloaded + skipped}/${totalTiles} (${Math.round(((downloaded + skipped) / totalTiles) * 100)}%)`);
                } else {
                    errors++;
                    console.log(`\n  ❌ Error downloading ${z}/${x}/${y}: ${result.error}`);
                }

                // Delay untuk menghindari rate limit
                if (result.status === 'downloaded') {
                    await sleep(REQUEST_DELAY);
                }
            }
        }
    }

    console.log('\n\n' + '='.repeat(50));
    console.log('✅ Download Complete!');
    console.log('='.repeat(50));
    console.log(`  Downloaded: ${downloaded}`);
    console.log(`  Skipped (already exists): ${skipped}`);
    console.log(`  Errors: ${errors}`);
    console.log(`\nTiles saved to: ${OUTPUT_DIR}`);
}

main().catch(console.error);
