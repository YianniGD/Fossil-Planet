// starfield_background.js

(function() {
  const starfieldContainer = document.querySelector("#starfieldCanvas");
  if (!starfieldContainer) {
    return; // Do nothing if the container is not found
  }

  const space = new Pts.CanvasSpace("#starfieldCanvas").setup({ bgcolor: "#0f1526" });
  const form = space.getForm();
  const pts = [];
  // Track previous globe rotation and an accumulated background offset for smooth panning
  let prevRotation = null;
  // Use a simple plain object for the accumulated offset (avoid calling Pts APIs here)
  let bgOffset = { x: 0, y: 0 };
  // Velocity model for smoother motion: accumulate velocity from rotation deltas
  let bgVelocity = { x: 0, y: 0 };

  space.add({
    start: (bound) => {
      // Safely create distributed points. If the Pts helper doesn't return an array
      // default to an empty array so the spread operator doesn't throw.
      try {
        const created = (Pts && Pts.Create && typeof Pts.Create.distributeRandom === 'function')
          ? Pts.Create.distributeRandom(bound || space.innerBound, 500)
          : [];
        const newPts = Array.isArray(created) ? created : [];
        pts.push(...newPts);
      } catch (e) {
        console.warn('starfield: failed to create distributed points, falling back to empty', e);
      }
    },
    animate: (time, ftime) => {
      // Pan the starfield based on the change in globe rotation (delta), not the absolute rotation.
      // This makes the background feel like it's moving opposite to the drag (parallax).
      if (window.globeRotation && Array.isArray(window.globeRotation)) {
        if (!prevRotation) prevRotation = window.globeRotation.slice();

        // rotation delta (deg)
        const dx = window.globeRotation[0] - prevRotation[0];
        const dy = window.globeRotation[1] - prevRotation[1];

    // Apply a sensitivity factor to convert rotation delta to pixel movement.
    // We'll add to a velocity vector, integrate velocity into offset, and apply
    // friction to velocity. This feels more natural than damping the offset directly.
    const sensitivity = 40.9; // tweak this to taste
    const friction = 0.88; // per-frame friction applied to velocity (0..1)
    const maxVel = 15; // clamp velocity to avoid huge jumps

    // Convert rotation delta into a velocity impulse (opposite horizontally)
    bgVelocity.x += -dx * sensitivity;
    bgVelocity.y += dy * sensitivity;

    // Clamp velocity
    bgVelocity.x = Math.max(Math.min(bgVelocity.x, maxVel), -maxVel);
    bgVelocity.y = Math.max(Math.min(bgVelocity.y, maxVel), -maxVel);

    // Integrate velocity into offset so the background moves
    bgOffset.x += bgVelocity.x;
    bgOffset.y += bgVelocity.y;

    // Apply friction so velocity eases out when input stops
    bgVelocity.x *= friction;
    bgVelocity.y *= friction;
        prevRotation[0] = window.globeRotation[0];
        prevRotation[1] = window.globeRotation[1];
      }

      form.fillOnly("#fff");
      // Wrap coordinates for seamless repetition. Draw each star once (plus small
      // duplicates when a star is within `margin` of an edge) to avoid visual jumps.
      const w = (space && space.center && typeof space.center.x === 'number') ? space.center.x * 2 : (space.size ? space.size.x : 0);
      const h = (space && space.center && typeof space.center.y === 'number') ? space.center.y * 2 : (space.size ? space.size.y : 0);
      const margin = 6; // pixels - duplicate when star is within this distance from an edge

      for (let i = 0, len = pts.length; i < len; i++) {
        const orig = pts[i];
        if (!orig || typeof orig.x !== 'number' || typeof orig.y !== 'number') continue;

        // compute wrapped position (in [0, w) / [0, h))
        let x = ((orig.x + bgOffset.x) % w + w) % w;
        let y = ((orig.y + bgOffset.y) % h + h) % h;

        // draw main star
        form.point(new Pts.Pt(x, y), 0.5);

        // draw duplicates near edges to make crossing smooth
        if (x < margin) form.point(new Pts.Pt(x + w, y), 0.5);
        if (x > w - margin) form.point(new Pts.Pt(x - w, y), 0.5);
        if (y < margin) form.point(new Pts.Pt(x, y + h), 0.5);
        if (y > h - margin) form.point(new Pts.Pt(x, y - h), 0.5);
      }
    }
  });

  space.play();
})();