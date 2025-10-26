import React from 'react';

const DigSitePage = ({ digSite, allSpecies, showSpeciesPage }) => {
    if (!digSite) {
        return <div>Dig site not found.</div>;
    }

    const foundSpecies = allSpecies.filter(species =>
        species.discovery_locations?.some(loc => loc.dig_site === digSite.name)
    );

    return (
        <div style={{ padding: '20px', color: 'white' }}>
            <h1>{digSite.name}</h1>
            <img src={digSite.imageUrl} alt={digSite.name} />
            <p>{digSite.description}</p>

            <h2>Coordinates</h2>
            <ul>
                <li><strong>Latitude:</strong> {digSite.coords[1]}</li>
                <li><strong>Longitude:</strong> {digSite.coords[0]}</li>
            </ul>

            {foundSpecies.length > 0 && (
                <div>
                    <h2>Species Found</h2>
                    <ul>
                        {foundSpecies.map((s, index) => (
                            <li
                                key={index}
                                onClick={() => showSpeciesPage(s.id)}
                            >
                                {s.id}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default DigSitePage;