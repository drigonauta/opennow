import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'server/db.json');

try {
    const data = fs.readFileSync(dbPath, 'utf8');
    const db = JSON.parse(data);

    let updatedCount = 0;

    db.business = db.business.map(b => {
        if (b.owner_id === 'google_import' && (!b.city || !b.state)) {
            // Parse address: "..., City - State, Zip, Country"
            // Example: "Av. Santos Dumont, 155 - Centro, Uberaba - MG, 38010-370, Brazil"

            const parts = b.address.split(',').map(p => p.trim());
            // Expected: [Street, Number/Neigh, City - State, Zip, Country]
            // We want the part containing " - " before the Zip (which is usually 2nd to last)

            // Let's find the part with " - " that looks like "City - ST"
            // Or rely on position: 3rd from end?
            // Brazil is last. Zip is 2nd last. City-State is 3rd last.

            if (parts.length >= 3) {
                const cityStatePart = parts[parts.length - 3];
                const [city, state] = cityStatePart.split('-').map(s => s.trim());

                if (city && state && state.length === 2) {
                    b.city = city;
                    b.state = state;
                    updatedCount++;
                    console.log(`Updated ${b.name}: ${city}, ${state}`);
                } else {
                    console.warn(`Could not parse city/state for ${b.name}: ${cityStatePart}`);
                }
            }
        }
        return b;
    });

    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
    console.log(`Successfully updated ${updatedCount} businesses.`);

} catch (error) {
    console.error('Error updating DB:', error);
}
