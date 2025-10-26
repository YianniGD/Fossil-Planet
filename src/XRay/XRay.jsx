
import React, { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import './XRay.css';

const XRay = ({ isOpen, onClose, specimen }) => {
  const imageContainerRef = useRef(null);
  const skeletonRef = useRef(null);
  const [resolvedImageSrc, setResolvedImageSrc] = useState(null);
  const [resolvedSkeletonSrc, setResolvedSkeletonSrc] = useState(null);

  useEffect(() => {
    const container = imageContainerRef.current;
    if (!container || !isOpen) return;

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const skeletonEl = skeletonRef.current;
      if (!skeletonEl) return;
      // Apply clip-path directly so it updates even if GSAP can't animate the property
      try {
        skeletonEl.style.clipPath = `circle(100px at ${x}px ${y}px)`;
      } catch (err) {
        // fallback: set via CSS text
        skeletonEl.style.cssText += `;clip-path: circle(100px at ${x}px ${y}px);`;
      }
    };

    container.addEventListener('mousemove', handleMouseMove);

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      const skeletonEl = skeletonRef.current;
      if (skeletonEl) {
        try {
          skeletonEl.style.clipPath = 'circle(0% at 50% 50%)';
        } catch (err) {
          skeletonEl.style.cssText += ';clip-path: circle(0% at 50% 50%);';
        }
      }
    };
  }, [isOpen]);

  // Resolve image paths (try a small list of candidates and use the first that loads)
  useEffect(() => {
    if (!specimen) return;

    const makeCandidates = (filename, isSkeleton) => {
      if (!filename) return [];
      // If filename already looks like a path or URL use it directly
      if (filename.startsWith('/') || filename.startsWith('http')) return [filename];

      const base = '/images/Dinosaurs/';
      const candidates = [];

      // raw filename as provided (prefixed)
      candidates.push(base + filename);

      // underscore spaces
      candidates.push(base + filename.replace(/ /g, '_'));

      // try lower/upper variants
      candidates.push(base + filename.toLowerCase());
      candidates.push(base + filename.replace(/\s+/g, ''));

      // if skeleton, try common skeleton naming
      if (isSkeleton) {
        const nameNoExt = filename.replace(/\.png$/i, '');
        candidates.push(base + nameNoExt + '_Skeleton.png');
        candidates.push(base + nameNoExt + '_skeleton.png');
      }

      // try using specimen id as last resort
      if (specimen.id) {
        candidates.push(base + specimen.id + '.png');
        candidates.push(base + specimen.id.replace(/ /g, '_') + '.png');
      }

      // dedupe
      return Array.from(new Set(candidates));
    };

    const tryLoadFirst = (candidates, setter) => {
      if (!candidates || candidates.length === 0) {
        setter(null);
        return;
      }

      let cancelled = false;

      const tryNext = (i) => {
        if (cancelled || i >= candidates.length) {
          setter(null);
          return;
        }
        const img = new Image();
        img.onload = () => {
          if (!cancelled) setter(candidates[i]);
        };
        img.onerror = () => {
          tryNext(i + 1);
        };
        img.src = candidates[i];
      };

      tryNext(0);

      return () => {
        cancelled = true;
      };
    };

    // determine filenames from specimen fields
    const mainFilename = specimen.overlay_image || specimen.image || specimen.xray_image || '';
    const skeletonFilename = specimen.skeleton_image || specimen.xray_image || '';

    const mainCandidates = makeCandidates(mainFilename, false);
    const skeletonCandidates = makeCandidates(skeletonFilename, true);

    const cleanupMain = tryLoadFirst(mainCandidates, setResolvedImageSrc);
    const cleanupSkeleton = tryLoadFirst(skeletonCandidates, setResolvedSkeletonSrc);

    return () => {
      if (cleanupMain) cleanupMain();
      if (cleanupSkeleton) cleanupSkeleton();
    };
  }, [specimen]);

  if (!isOpen || !specimen) {
    return null;
  }

  return (
    <div className="xray-modal" onClick={onClose}>
      <div className="xray-content" onClick={(e) => e.stopPropagation()}>
        <div className="xray-images" ref={imageContainerRef}>
          {resolvedImageSrc && (
            <img
              src={resolvedImageSrc}
              alt={specimen.name || specimen.id}
              className="xray-specimen-image"
            />
          )}
          {resolvedSkeletonSrc && (
            <img
              ref={skeletonRef}
              src={resolvedSkeletonSrc}
              alt={`${specimen.name || specimen.id} Skeleton`}
              className="xray-specimen-skeleton"
            />
          )}
        </div>
        <button onClick={onClose} className="close-xray-button">Close</button>
      </div>
    </div>
  );
};

export default XRay;
