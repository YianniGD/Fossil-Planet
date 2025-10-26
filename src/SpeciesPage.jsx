import React, { useState, useRef, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import './SpeciesPage.css';

const SpeciesPage = ({ species, allSpecies, showDigSitePage, locationsData }) => {
    const { speciesId } = useParams();
    const [localSpecies, setLocalSpecies] = useState(species);

    useEffect(() => {
        if (!localSpecies && allSpecies && allSpecies.length > 0) {
            const foundSpecies = allSpecies.find(s => s.id === speciesId);
            setLocalSpecies(foundSpecies);
        }
    }, [localSpecies, allSpecies, speciesId]);

    const [isXRayOpen, setIsXRayOpen] = useState(false);

    const containerRef = useRef(null);
    const skeletonRef = useRef(null);
    const lensRef = useRef(null);
    const blurRef = useRef(null);
    const lensTimeoutRef = useRef(null);
        const audioRef = useRef(null);
        const isHoveringRef = useRef(false);

        // Initialize audio
        useEffect(() => {
            audioRef.current = new Audio('/audio/AFX_SCANNINGRAY_DFMG.wav');
            audioRef.current.loop = true;
            return () => {
                if (audioRef.current) {
                    audioRef.current.pause();
                    audioRef.current = null;
                }
            };
        }, []);

        useEffect(() => {
            if (!isXRayOpen) return;
            const container = containerRef.current;
            const skeletonEl = skeletonRef.current;
    if (!container || !skeletonEl) return;
    const lensEl = lensRef.current;

    // When the user releases the pointer anywhere, animate the lens away then close X-Ray
    const handleGlobalPointerUp = (ev) => {
        const EXIT_DURATION = 220;
        const lensElLocal = lensRef.current;
        if (lensElLocal) {
            lensElLocal.classList.add('edge-exit');
            // schedule closing X-Ray after animation
            if (lensTimeoutRef.current) clearTimeout(lensTimeoutRef.current);
            lensTimeoutRef.current = setTimeout(() => {
                setIsXRayOpen(false);
                if (lensRef.current) {
                    lensRef.current.style.opacity = '0';
                    lensRef.current.classList.remove('edge-exit');
                }
                lensTimeoutRef.current = null;
            }, EXIT_DURATION + 40);
        } else {
            setIsXRayOpen(false);
        }
    };
    window.addEventListener('pointerup', handleGlobalPointerUp);

        let rafId = null;
        let lastX = 0;
        let lastY = 0;

        const handlePointerMove = (e) => {
            if (rafId) return;

            rafId = requestAnimationFrame(() => {
                const rect = container.getBoundingClientRect();
                const x = (e.clientX || (e.touches && e.touches[0] && e.touches[0].clientX)) - rect.left;
                const y = (e.clientY || (e.touches && e.touches[0] && e.touches[0].clientY)) - rect.top;

                // read radius from CSS variable if present (falls back to 100px)
                const cs = getComputedStyle(container);
                let radius = cs.getPropertyValue('--xray-radius') || '100px';
                radius = radius.trim();
                // If CSS var is given as --xray-radius: 100px; it's safe to use directly

                // Update only the skeleton's clip-path for X-Ray effect
                skeletonEl.style.clipPath = `circle(${radius} at ${x}px ${y}px)`;
                skeletonEl.style.opacity = '1';

                // Reveal the blurred rim layer and give it a slightly larger radius so the rim shows
                if (blurRef.current) {
                    // compute numeric px from radius string
                    const rPx = parseInt(radius, 10) || 100;
                    const blurRadius = Math.round(rPx * 1.25);
                    blurRef.current.style.clipPath = `circle(${blurRadius}px at ${x}px ${y}px)`;
                    blurRef.current.style.opacity = '1';
                }

                // Position and size the glass 'lens' overlay (if present)
                if (lensEl) {
                    // parse radius like '100px' -> 100
                    const rPx = parseInt(radius, 10) || 100;
                    const size = Math.round(rPx * 2 * 1.15); // slight padding around the reveal
                    lensEl.style.width = `${size}px`;
                    lensEl.style.height = `${size}px`;
                    // position lens relative to the xray container
                    // clear any pending hide timeout (user re-entered)
                    if (lensTimeoutRef.current) {
                        clearTimeout(lensTimeoutRef.current);
                        lensTimeoutRef.current = null;
                    }

                    lensEl.style.left = `${x}px`;
                    lensEl.style.top = `${y}px`;
                    lensEl.style.opacity = '1';

                    // detect proximity to container edges and animate away if near
                    try {
                        const cW = rect.width;
                        const cH = rect.height;
                        const lensR = size / 2;
                        const threshold = 12; // px before edge to trigger animation (tweakable)
                        const nearLeft = (x - lensR) < (0 + threshold);
                        const nearTop = (y - lensR) < (0 + threshold);
                        const nearRight = (x + lensR) > (cW - threshold);
                        const nearBottom = (y + lensR) > (cH - threshold);
                        if (nearLeft || nearTop || nearRight || nearBottom) {
                            lensEl.classList.add('edge-exit');
                        }
                        else {
                            lensEl.classList.remove('edge-exit');
                        }
                    } catch (err) {
                        // silent fail — do not block pointer handling
                    }
                }
                
                    // Start audio if not already playing
                    if (!isHoveringRef.current && audioRef.current) {
                        audioRef.current.currentTime = 0;
                        audioRef.current.play();
                        isHoveringRef.current = true;
                    }

                lastX = x;
                lastY = y;
                rafId = null;
            });
        };

        container.addEventListener('pointermove', handlePointerMove);
        container.addEventListener('mousemove', handlePointerMove);
        container.addEventListener('touchmove', handlePointerMove);
        
            const handlePointerLeave = () => {
                if (audioRef.current) {
                    audioRef.current.pause();
                    isHoveringRef.current = false;
                }
                skeletonEl.style.opacity = '0';
                // collapse clip-path back to 0% so enabling X-Ray later doesn't show a centered reveal
                skeletonEl.style.clipPath = 'circle(0% at 50% 50%)';
                if (lensEl) {
                    // animate lens away smoothly when pointer leaves
                    lensEl.classList.add('edge-exit');
                    // after the CSS transition finishes, hide and reset
                    const EXIT_DURATION = 220; // ms, keep in sync with CSS transition
                    if (lensTimeoutRef.current) clearTimeout(lensTimeoutRef.current);
                    lensTimeoutRef.current = setTimeout(() => {
                        try {
                            lensEl.style.opacity = '0';
                            lensEl.classList.remove('edge-exit');
                        } catch (e) {}
                        lensTimeoutRef.current = null;
                    }, EXIT_DURATION + 40);
                }
                if (blurRef.current) {
                    blurRef.current.style.opacity = '0';
                }
            };

            container.addEventListener('mouseleave', handlePointerLeave);
            container.addEventListener('pointerleave', handlePointerLeave);

        return () => {
            if (rafId) {
                cancelAnimationFrame(rafId);
            }
            container.removeEventListener('pointermove', handlePointerMove);
            container.removeEventListener('mousemove', handlePointerMove);
            container.removeEventListener('touchmove', handlePointerMove);
                container.removeEventListener('mouseleave', handlePointerLeave);
                container.removeEventListener('pointerleave', handlePointerLeave);
                window.removeEventListener('pointerup', handleGlobalPointerUp);
                if (skeletonEl) {
                    skeletonEl.style.clipPath = 'circle(0% at 50% 50%)';
                    skeletonEl.style.opacity = '0';
                }
                if (audioRef.current) {
                    audioRef.current.pause();
                    isHoveringRef.current = false;
                }
                if (lensEl) {
                    lensEl.classList.remove('edge-exit');
                }
                if (lensTimeoutRef.current) {
                    clearTimeout(lensTimeoutRef.current);
                    lensTimeoutRef.current = null;
                }
        };
    }, [isXRayOpen]);

    if (!localSpecies) {
        return <div>Species not found.</div>;
    }

    return (
        <div style={{ padding: '28px', color: 'white', height: '100vh', boxSizing: 'border-box', overflow: 'hidden', fontSize: '18px', lineHeight: 1.4 }}>
            <h1 style={{ textAlign: 'right' }}>{localSpecies.id}</h1>

            <div className="species-two-column" style={{ marginTop: 12, marginBottom: 18 }}>
                <div className="species-text-col">
                    <div>
                        <p>
                            {localSpecies.id} lived during the {localSpecies.epoch} epoch of the {localSpecies.eras.join(', ')} era.
                            A member of the {localSpecies.categories[0].primary}s as one of the {localSpecies.categories[0].subcategory},
                            it was {localSpecies.description}, known for being about {localSpecies.size.feet} feet ({localSpecies.size.meters} meters) long!
                            The first fossils of this dinosaur were discovered in the {localSpecies.discovery_locations[0].dig_site} in {localSpecies.discovery_locations[0].region}.
                        </p>
                        
                        {localSpecies.discovery_locations && (
                            <div>
                                <h2>Discovery Locations</h2>
                                <ul>
                                    {localSpecies.discovery_locations.map((loc, index) => {
                                        const digSite = locationsData.find(ds => ds.Location_Name === loc.dig_site);
                                        if (!digSite) {
                                            return (
                                                <li key={index}>
                                                    <strong>{loc.region}:</strong> {loc.dig_site}
                                                </li>
                                            );
                                        }
                                        return (
                                            <li key={index}>
                                                <Link to={`/dig-site/${digSite.Location_Name}`} onClick={() => showDigSitePage(digSite)}>
                                                    <strong>{loc.region}:</strong> {loc.dig_site}
                                                    <img src={digSite.imageUrl} alt={digSite.Location_Name} style={{ width: '50px', height: '50px' }} />
                                                </Link>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>

                <div className="species-image-col">
                    <div className="image-container">
                        {/* X-Ray button intentionally removed — press-and-hold is enabled on the image area */}

                        <div
                            className={isXRayOpen ? 'xray-images xray-active' : 'xray-images'}
                            ref={containerRef}
                            onPointerDown={(e) => { e.preventDefault(); setIsXRayOpen(true); }}
                            onPointerUp={() => {
                                // when pointer is released inside the container, close X-Ray
                                // but animate the lens away smoothly first
                                const lensEl = lensRef.current;
                                const EXIT_DURATION = 220;
                                if (lensEl) {
                                    lensEl.classList.add('edge-exit');
                                    setTimeout(() => setIsXRayOpen(false), EXIT_DURATION + 40);
                                } else {
                                    setIsXRayOpen(false);
                                }
                            }}
                            onPointerCancel={() => setIsXRayOpen(false)}
                        >
                            {/* SVG filter for subtle distortion applied to the blurred rim layer */}
                            <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
                                <defs>
                                    <filter id="xray-distort-filter" x="-20%" y="-20%" width="140%" height="140%">
                                        <feTurbulence type="fractalNoise" baseFrequency="0.006" numOctaves="2" seed="23" result="noise" />
                                        <feGaussianBlur in="noise" stdDeviation="2" result="blurredNoise" />
                                        <feDisplacementMap in="SourceGraphic" in2="blurredNoise" scale="18" xChannelSelector="R" yChannelSelector="G" />
                                    </filter>
                                </defs>
                            </svg>

                            <img
                                src="/images/background.png"
                                alt="Background"
                                className="species-background"
                            />

                            {localSpecies.image && (
                                <img
                                    src={`/images/Dinosaurs/${localSpecies.image}`}
                                    alt={localSpecies.name || localSpecies.id}
                                    className="xray-specimen-image"
                                />
                            )}

                            {isXRayOpen && localSpecies.xray_image && (
                                <>
                                    <img
                                        ref={blurRef}
                                        src={`/images/Dinosaurs/${localSpecies.xray_image}`}
                                        alt={`${localSpecies.name || localSpecies.id} Skeleton (blur)`}
                                        className="xray-specimen-blur"
                                    />
                                    <img
                                        ref={skeletonRef}
                                        src={`/images/Dinosaurs/${localSpecies.xray_image}`}
                                        alt={`${localSpecies.name || localSpecies.id} Skeleton`}
                                        className="xray-specimen-skeleton"
                                    />
                                </>
                            )}

                            {isXRayOpen && (
                                <div
                                    ref={lensRef}
                                    className="xray-lens"
                                    aria-hidden="true"
                                />
                            )}

                            <img
                                src="/images/foreground.png"
                                alt="Foreground"
                                className="species-foreground"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SpeciesPage;