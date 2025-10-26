import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './Timeline.css';

const NewTimeline = () => {
    const [timelineData, setTimelineData] = useState(null);
    const timelineRef = useRef(null);

    useEffect(() => {
        const loadTimelineData = async () => {
            try {
                const response = await fetch('/new_prehistoric_data/data/timeline.json');
                const data = await response.json();
                setTimelineData(data);
            } catch (error) {
                console.error("Failed to load timeline data:", error);
            }
        };
        loadTimelineData();
    }, []);

    useEffect(() => {
        if (!timelineData) return;

        gsap.registerPlugin(ScrollTrigger);

        const eras = timelineRef.current.querySelectorAll('.era-container');

        eras.forEach(era => {
            const periods = era.querySelectorAll('.period-container');
            const keyEvents = era.querySelectorAll('.key-event-container');

            gsap.from(era, {
                opacity: 0,
                y: 50,
                scrollTrigger: {
                    trigger: era,
                    start: 'top 80%',
                    end: 'top 50%',
                    scrub: true,
                }
            });

            periods.forEach(period => {
                gsap.from(period, {
                    opacity: 0,
                    x: -50,
                    scrollTrigger: {
                        trigger: period,
                        start: 'top 80%',
                        end: 'top 50%',
                        scrub: true,
                    }
                });
            });

            keyEvents.forEach(keyEvent => {
                gsap.from(keyEvent, {
                    opacity: 0,
                    x: 50,
                    scrollTrigger: {
                        trigger: keyEvent,
                        start: 'top 80%',
                        end: 'top 50%',
                        scrub: true,
                    }
                });
            });
        });

    }, [timelineData]);

    return (
        <div id="wrapper">
            <div id="content">
                <div className="timeline-container" ref={timelineRef}>
                    {timelineData && timelineData.eras.map((era, eraIndex) => (
                        <div key={eraIndex} className="era-container">
                            <h1>{era.name}</h1>
                            <p>{era.details}</p>
                            {era.periods.map((period, periodIndex) => (
                                <div key={periodIndex} className="period-container">
                                    <h2>{period.name}</h2>
                                    <p>{period.details}</p>
                                    <p>{period.summary}</p>
                                    {period.key_events.map((keyEvent, keyEventIndex) => (
                                        <div key={keyEventIndex} className="key-event-container">
                                            <h3>{keyEvent.title}</h3>
                                            <p>{keyEvent.description}</p>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default NewTimeline;
