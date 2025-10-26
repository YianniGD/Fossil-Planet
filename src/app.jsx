import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useSwipeable } from 'react-swipeable';
import Globe from './Globe';
import StartScreen from './StartScreen';
import SpeciesPage from './SpeciesPage';
import Timeline from './Timeline';

import FilterControls from './FilterControls';
import About from './About'; // Import the About component
import DigSitePage from './DigSitePage';
import SplashPage from './SplashPage'; // Import the SplashPage component
import { getInitialData } from '../data.js';

const App = () => {
    const [showSplash, setShowSplash] = useState(true);
    const [selectedSpecies, setSelectedSpecies] = useState(null);
    const [selectedDigSite, setSelectedDigSite] = useState(null);
    const [allSpecies, setAllSpecies] = useState([]);
    const [filteredSpecies, setFilteredSpecies] = useState([]);
    const [regions, setRegions] = useState([]);
    const [locationsData, setLocationsData] = useState([]);
    const [geoData, setGeoData] = useState(null);
    const [currentRegionIndex, setCurrentRegionIndex] = useState(null);
    const [eras, setEras] = useState([]);
    const [epochs, setEpochs] = useState([]);
    const [categories, setCategories] = useState([]);
    const [filters, setFilters] = useState({
        name: '',
        era: '',
        epoch: '',
        category: ''
    });

    const navigate = useNavigate();

    useEffect(() => {
        const loadData = async () => {
            try {
                const { speciesData, eras, epochs, categories } = await getInitialData();
                setAllSpecies(speciesData);
                setFilteredSpecies(speciesData);
                setEras(eras);
                setEpochs(epochs);
                setCategories(categories);

                const [regionsRes, mergedGeoRes] = await Promise.all([
                    fetch('/new_prehistoric_data/regions.json'),
                    fetch('/custom.min.simplified.merged.geo.json')
                ]);
                const allRegions = await regionsRes.json();
                const mergedGeoData = await mergedGeoRes.json();

                const locations = mergedGeoData.features.flatMap(feature => feature.properties.dig_sites || []);

                setLocationsData(locations);
                setRegions(allRegions.filter(region => region.Region_Name !== 'Antarctica'));
                setGeoData(mergedGeoData);
            } catch (error) {
                console.error("Failed to load initial data:", error);
            }
        };
        loadData();
    }, []);

    const handleFilterChange = (filterType, value) => {
        setFilters(prevFilters => ({
            ...prevFilters,
            [filterType]: value
        }));
    };

    useEffect(() => {
        let species = allSpecies;

        if (filters.name) {
            species = species.filter(s => s.id.toLowerCase().includes(filters.name.toLowerCase()));
        }

        if (filters.era) {
            species = species.filter(s => s.eras.includes(filters.era));
        }

        if (filters.epoch) {
            species = species.filter(s => s.epoch === filters.epoch);
        }

        if (filters.category) {
            species = species.filter(s => s.categories.some(c => c.primary === filters.category));
        }

        setFilteredSpecies(species);
    }, [filters, allSpecies]);

    const showSpeciesPage = (speciesId) => {
        const species = allSpecies.find(s => s.id === speciesId);
        setSelectedSpecies(species);
        navigate(`/species/${speciesId}`);
    };

    const showDigSitePage = (digSite) => {
        setSelectedDigSite(digSite);
        navigate(`/dig-site/${digSite.Location_Name}`);
    };

    const handleBackClick = () => {
        navigate(-1);
    }

    const backButtonStyle = {
        fontFamily: '"BBH Sans Hegarty", sans-serif',
        textTransform: 'uppercase',
        fontSize: '2rem',
        background: 'none',
        border: 'none',
        color: 'white',
        cursor: 'pointer',
        padding: '1rem',
        position: 'fixed',
        top: '10px',
        left: '10px',
        zIndex: 100
    };

    useEffect(() => {
        const handleWheel = (e) => {
            if (e.ctrlKey) {
                e.preventDefault();
            }
        };

        const handleKeyDown = (e) => {
            if (e.ctrlKey && (e.key === '+' || e.key === '-' || e.key === '0')) {
                e.preventDefault();
            }
        };

        window.addEventListener('wheel', handleWheel, { passive: false });
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('wheel', handleWheel);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    const handleEnter = () => {
        setShowSplash(false);
    };

    return (
        <div>
            {showSplash ? (
                <SplashPage onEnter={handleEnter} />
            ) : (
                <>
                    <button style={backButtonStyle} onClick={handleBackClick}>Back</button>
                    <Routes>
                        <Route path="/" element={<StartScreen setView={(view) => navigate(view)} />} />
                        <Route path="/globe" element={<Globe showSpeciesPage={showSpeciesPage} showDigSitePage={showDigSitePage} locationsData={locationsData} regions={regions} geoData={geoData} currentRegionIndex={currentRegionIndex} onSelectRegion={setCurrentRegionIndex} />} />
                        <Route path="/timeline" element={<><FilterControls eras={eras} epochs={epochs} categories={categories} onFilterChange={handleFilterChange} /><Timeline speciesData={filteredSpecies} showSpeciesPage={showSpeciesPage} /></>} />
                        <Route path="/species/:speciesId" element={<SpeciesPage species={selectedSpecies} allSpecies={allSpecies} showDigSitePage={showDigSitePage} locationsData={locationsData} />} />
                        <Route path="/dig-site/:digSiteName" element={<DigSitePage digSite={selectedDigSite} allSpecies={allSpecies} showSpeciesPage={showSpeciesPage} locationsData={locationsData} />} />
                        <Route path="/about" element={<About />} />
                        
                    </Routes>
                </>
            )}
        </div>
    );
};

export default App;