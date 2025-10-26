import React, { useState, useRef, useEffect } from 'react';
import { MicrophoneIcon, StopIcon } from '../Icons';

const SplashPage = ({ onEnter }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    audioRef.current = new Audio('/audio/female_narrator.wav');
    audioRef.current.onended = () => {
      setIsPlaying(false);
    };

    return () => {
      audioRef.current.pause();
      audioRef.current = null;
    };
  }, []);

  const toggleAudio = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="splash-screen">
      <div className="splash-content">
        <h2>
          <span className="part-1" style={{ display: 'block' }}>Hey there, Explorer!</span>
          <span className="part-2" style={{ display: 'block' }}> Welcome to the Prehistoric Planet Encyclopedia!</span>
        </h2>
        <p>Have you ever wondered what our planet was like long before we were around?<br />You're about to find out!</p>
        <p>Get ready to travel back in time to uncover the secrets of Earth's most amazing ancient animals.<br />This isn't just a list of dinosaurs. It's a window into lost worlds. You'll discover the first dinosaurs of the Triassic, the titans of the Jurassic, and the last giants of the Cretaceous. You'll meet the winged reptiles that soared through the skies and the First fish to swim the oceans.</p>
        <p>As you explore, you can see exactly when each creature lived on our Interactive Timeline and get a real sense of their massive scale with our Size Comparison tool. Every animal has amazing Fun Facts and our Pronunciation Guide will have you saying Giganotosaurus like a real paleontologist.</p>
        <p>So, what are you curious about today? Happy exploring!</p>
        <div className="splash-buttons">
          <button onClick={onEnter} className="start-button">Enter</button>
          <button onClick={toggleAudio} className="audio-button">
            {isPlaying ? <StopIcon /> : <MicrophoneIcon />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SplashPage;
