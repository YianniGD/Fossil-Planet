import React, { useState } from 'react';
import { useSwipeable } from 'react-swipeable';
import * as Icons from '../Icons';

const AboutProject = () => (
    <div>
        <h2>About This Project</h2>
        <p>This interactive encyclopedia is a personal project designed to bring the prehistoric world to life. It's built with a passion for web development, history, and the incredible creatures that once roamed our planet.</p>
        
        <h2>Technologies Used</h2>
        <ul>
            <li><strong>React:</strong> For building a dynamic and responsive user interface.</li>
            <li><strong>D3.js:</strong> To power the interactive globe visualization.</li>
            <li><strong>Vite:</strong> As a fast and modern build tool for web development.</li>
        </ul>

        <h2>Data Sources</h2>
        <p>The information about the prehistoric creatures is aggregated from various reputable sources, including:</p>
        <ul>
            <li>Wikipedia</li>
            <li>Prehistoric Wildlife</li>
        </ul>
        <p>This project is for educational and demonstrative purposes only. All content and assets are used under fair use principles.</p>
    </div>
);

const StyleGuide = () => {
  const colors = {
    yellow: '#EACB17',
    beige: '#EFE3C2',
    green: '#557A6A',
    purple: '#9C6CB4',
    pink: '#F9AFCB',
    blue: '#3E6D9C',
    cyan: '#85CEC0',
    lightGray: '#F6F6F4',
    orange: '#F4912F',
    darkBlue: '#0F405D',
    brown: '#3E341E',
    lightBlue: '#80B1BC',
    lightGreen: '#AACE48',
    teal: '#31B9C4',
  };

  const ColorBox = ({ color, name }) => (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem', marginRight: '1rem' }}>
      <div style={{ width: '50px', height: '50px', backgroundColor: color, marginRight: '1rem', border: '1px solid #fff' }}></div>
      <span>{name} ({color})</span>
    </div>
  );

  return (
    <div>
      <h2>Style Guide</h2>

      <h3>Colors</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {Object.entries(colors).map(([name, color]) => <ColorBox key={name} color={color} name={name} />)}
      </div>

      <h3>Typography</h3>
      <div>
                <h1>Title (H1) - "BBH Sans Hegarty"</h1>
        <h2 style={{ fontFamily: '"BBH Sans Hegarty", sans-serif', fontWeight: 900, fontSize: '2.5rem', letterSpacing: '2px' }}>Header (H2) - "BBH Sans Hegarty"</h2>
        <h3 style={{ fontFamily: "'Noto Sans Serif', serif", fontSize: '1.5rem' }}>Subheader (H3) - 'Noto Sans Serif'</h3>
        <p style={{ fontFamily: "'Noto Sans Serif', serif", fontSize: '1.2rem' }}>Caption Text - 'Noto Sans Serif'</p>
        <p style={{ fontFamily: "'Noto Sans Serif', serif", fontSize: '1.1rem' }}>Body Text - 'Noto Sans Serif'</p>
      </div>

      <h3>Buttons</h3>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <button className="start-button">Start Button</button>
        <button className="audio-button"><Icons.MicrophoneIcon /></button>
      </div>
    </div>
  );
};

const IconsGuide = () => {
    const iconList = Object.keys(Icons).map(iconName => {
        const IconComponent = Icons[iconName];
        return (
          <div key={iconName} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '1rem' }}>
            <IconComponent />
            <span>{iconName}</span>
          </div>
        );
      });

    return (
        <div>
            <h2>Icons</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                {iconList}
            </div>
        </div>
    );
};

const About = ({ setView }) => {
    const [page, setPage] = useState(1);
    const pageCount = 3;

    const handlers = useSwipeable({
        onSwipedLeft: () => setPage(p => p < pageCount ? p + 1 : 1),
        onSwipedRight: () => setPage(p => p > 1 ? p - 1 : pageCount),
        preventDefaultTouchmoveEvent: true,
        trackMouse: true
    });

    return (
        <div {...handlers} style={{ padding: '2rem', color: '#f4f4f4' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
                <button className="start-button" onClick={() => setPage(1)}>About</button>
                <button className="start-button" onClick={() => setPage(2)}>Style Guide</button>
                <button className="start-button" onClick={() => setPage(3)}>Icons</button>
            </div>

            {page === 1 && <AboutProject />}
            {page === 2 && <StyleGuide />}
            {page === 3 && <IconsGuide />}

            <button className="start-button" onClick={() => setView('start')} style={{marginTop: '2rem'}}>Back to Start</button>
        </div>
    );
};

export default About;
