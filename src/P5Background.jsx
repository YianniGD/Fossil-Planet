
import React, { useRef, useEffect } from 'react';
import p5 from 'p5';
import { sketch } from './p5-sketch';

const P5Background = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const p5Instance = new p5(sketch, canvasRef.current);

        return () => {
            p5Instance.remove();
        };
    }, []);

    return <div ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, zIndex: -1, width: '100%', height: '100%' }} />;
};

export default P5Background;
