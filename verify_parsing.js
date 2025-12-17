const addresses = [
    "R. Curitiba, 2090 - Lourdes, Belo Horizonte - MG, 30170-127",
    "R. Tristão de Castro, 1119 - São Benedito, Uberaba - MG, 38022-200", // The reported case
    "Av. Paulista, 1000 - Bela Vista, São Paulo - SP, 01310-100",
    "Praça da Sé - Sé, São Paulo - SP" // Edge case
];

function parseAddressOld(formatted_address) {
    const parts = formatted_address.split(',').map(p => p.trim());
    const lastPart = parts[parts.length - 1];

    let parsedCity = '';
    let parsedState = '';
    let parsedCountry = lastPart;

    if (parts.length >= 3) {
        parsedCity = parts[parts.length - 3];
        parsedState = parts[parts.length - 2];
    }
    return { city: parsedCity, state: parsedState, country: parsedCountry };
}

function parseAddressNew(formatted_address) {
    const parts = formatted_address.split(',').map(p => p.trim());

    const ufs = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'];

    let parsedCity = '';
    let parsedState = '';
    let parsedCountry = 'Brasil';
    let foundBrazilPattern = false;

    for (const part of parts) {
        // FIX: Handle both hyphen and en-dash if possible, but let's test strict hyphen first as per code
        if (part && part.includes('-')) {
            const subParts = part.split('-').map(sp => sp.trim());
            if (subParts.length >= 2) {
                const potentialUF = subParts[subParts.length - 1].toUpperCase().substring(0, 2);

                if (ufs.includes(potentialUF) && /^[A-Z]{2}$/.test(potentialUF)) {
                    parsedState = potentialUF;
                    subParts.pop();
                    parsedCity = subParts.join('-');
                    foundBrazilPattern = true;
                    parsedCountry = 'Brasil';
                    break;
                }
            }
        }
    }

    if (!foundBrazilPattern) {
        // Fallback logic simulation
        const lastPart = parts[parts.length - 1];
        parsedCountry = lastPart;
        if (parts.length >= 3) {
            parsedCity = parts[parts.length - 3];
            parsedState = parts[parts.length - 2];
        }
    }

    return { city: parsedCity, state: parsedState, country: parsedCountry };
}

console.log("--- DEBUGGER DA IMPORTAÇÃO ---");

addresses.forEach(addr => {
    console.log(`\n📍 Endereço: "${addr}"`);
    console.log("❌ Antigo/Fallback:", JSON.stringify(parseAddressOld(addr)));
    console.log("✅ Novo (Esperado):", JSON.stringify(parseAddressNew(addr)));
});
