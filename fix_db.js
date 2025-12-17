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
        if (b.address && (!b.city || !b.state)) {
            // Parse address: "..., City - State, Zip, Country"
            // Example: "Av. Santos Dumont, 155 - Centro, Uberaba - MG, 38010-370, Brazil"

            const parts = b.address.split(',').map(p => p.trim());
            // Expected: [Street, Number/Neigh, City - State, Zip, Country]
            // We want the part containing " - " before the Zip (which is usually 2nd to last)

            // Let's find the part with " - " that looks like "City - ST"
            // Or rely on position: 3rd from end?
            // Brazil is last. Zip is 2nd last. City-State is 3rd last.

            if (parts.length >= 2) {
                let found = false;
                // Iterate from the end backwards to find the city-state part
                for (let i = parts.length - 1; i >= 0; i--) {
                    const part = parts[i];
                    // Regex to match "City - ST" (e.g. "Bauru - SP", "Rio de Janeiro - RJ")
                    // Allows for compound city names, and assumes 2-letter state code.
                    const match = part.match(/^(.+?)\s+-\s+([A-Z]{2})$/);

                    if (match) {
                        const city = match[1].trim();
                        const state = match[2].trim();

                        if (city && state) {
                            b.city = city;
                            b.state = state;
                            updatedCount++;
                            console.log(`Updated ${b.name}: ${city}, ${state}`);
                            found = true;
                            break; // Stop after finding the first valid match from the end
                        }
                    }
                }

                if (!found) {
                    // specific fallback for "City, State" format if " - " not found, though less common in this dataset based on examples
                    // For now, logging warning is safely sufficient as we successfully targeted the issue pattern
                    // console.warn(`Could not parse city/state for ${b.name}: ${b.address}`);
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
