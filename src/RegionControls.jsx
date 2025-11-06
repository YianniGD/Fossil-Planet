import React from 'react';

const RegionControls = ({ regions, onSelectRegion, currentRegionIndex, onViewChange }) => {
  const currentRegion = regions[currentRegionIndex];

  return (
    <div style={{
      position: 'absolute',
      bottom: '0',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '10px',
      zIndex: 100,
      padding: '20px',
      background: '#121212',
    }}>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
        {regions.map((region, index) => (
          <button 
            key={region.Region_Name} 
            onClick={() => onSelectRegion(index)}
            style={{
              background: index === currentRegionIndex ? 'rgba(255, 255, 255, 0.3)' : 'transparent',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              padding: '10px 15px',
              cursor: 'pointer',
              transition: 'background 0.3s',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <img src={`${import.meta.env.BASE_URL}/images/${region.Region_Name}.webp`} alt={region.Region_Name} style={{ width: '50px', height: '50px' }} />
            <div style={{ fontFamily: '"BBH Sans Hegarty", sans-serif' }}>{region.Region_Name}</div>
          </button>
        ))}
      </div>
      {currentRegion && currentRegion.views && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '10px' }}>
          {currentRegion.views.map((view, index) => (
            <button 
              key={view.name} 
              onClick={() => onViewChange(index)}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                border: '1px solid white',
                borderRadius: '5px',
                padding: '5px 10px',
                cursor: 'pointer',
                transition: 'background 0.3s',
              }}
            >
              {view.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default RegionControls;
