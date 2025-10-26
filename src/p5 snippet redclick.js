// Array to hold all the SpeedStreak objects
let streaks = [];
// Number of initial streaks on the canvas
let numStreaks = 50;
// Color palette derived from the original image
let colors = [];
// Range for the base speed of streaks
let baseSpeedRange = [3, 10]; 

// A class to define each individual speed streak
class SpeedStreak {
  constructor(x, y, initialSpeed, colorPalette) {
    this.x = x; // X position of the streak's origin
    this.y = y; // Y position of the streak's origin
    this.len = random(200, 800); // Length of the streak
    this.width = random(20, 150); // Width of the streak
    // Fixed diagonal angle for all streaks, creating a bottom-left to top-right flow
    this.angle = -PI / 5; // Approximately -36 degrees
    this.baseSpeed = initialSpeed; // The streak's inherent speed
    this.currentSpeed = initialSpeed; // The actual speed, influenced by interaction
    this.color = color(random(colorPalette)); // Assign a random color from the palette
    this.alpha = random(100, 255); // Transparency, some streaks are more subtle
    this.hueShift = random(-5, 5); // Subtle hue variation for visual interest
    this.saturationBoost = random(0, 10); // How much saturation increases on interaction
  }

  // Updates the streak's position
  update() {
    // Move the streak along its angle based on its current speed
    this.x += cos(this.angle) * this.currentSpeed;
    this.y += sin(this.angle) * this.currentSpeed;

    // If the streak moves off-screen, reset its position to the opposite side
    // This creates a continuous, looping flow effect
    if (this.x < -this.len * 1.5 || this.y > height + this.len * 1.5) {
      this.x = random(width, width * 1.5); // Reset X to the right, slightly off-screen
      this.y = random(-height / 2, 0); // Reset Y to the top, slightly off-screen
      this.len = random(200, 800); // Randomize length again
      this.width = random(20, 150); // Randomize width again
      this.color = color(random(colors)); // Assign a new random color
      this.currentSpeed = this.baseSpeed; // Reset speed
      this.alpha = random(100, 255); // Reset transparency
      this.hueShift = random(-5, 5);
      this.saturationBoost = random(0, 10);
    }
  }

  // Draws the streak on the canvas
  display() {
    noStroke(); // Streaks have no outline

    let c = this.color; // Get the base color
    let displayAlpha = this.alpha; // Current transparency
    let displaySaturation = saturation(c); // Current saturation

    // Interaction effect: If mouse is moving or pressed, boost alpha and saturation
    if (mouseIsPressed || (abs(mouseX - pmouseX) > 0 || abs(mouseY - pmouseY) > 0) ) {
      displayAlpha = constrain(this.alpha * 1.5, 0, 255); // Make it brighter
      displaySaturation = constrain(saturation(c) + this.saturationBoost, 0, 100); // Make it more vibrant
    }
    
    // Apply hue shift and set the fill color
    let h = hue(c) + this.hueShift;
    let b = brightness(c);
    fill(h, displaySaturation, b, displayAlpha);

    push(); // Save current drawing state
    translate(this.x, this.y); // Move origin to streak's position
    rotate(this.angle); // Rotate to the streak's angle

    // Draw the streak as a parallelogram to simulate its tapered, skewed shape
    // Points define a shape that slants, like the lines in the image
    let halfWidth = this.width / 2;
    let skewAmount = this.width / 4; // Controls the degree of the slant

    quad(
      0, -halfWidth,               // P1 (top-left of virtual bounding box)
      this.len, -halfWidth - skewAmount, // P2 (top-right, skewed up)
      this.len, halfWidth - skewAmount,  // P3 (bottom-right, skewed up)
      0, halfWidth                 // P4 (bottom-left)
    );

    pop(); // Restore drawing state
  }
}

function setup() {
  createCanvas(800, 450); // Canvas size, preserving 16:9 aspect ratio
  colorMode(HSB, 360, 100, 100, 255); // Use HSB color mode for easier manipulation

  // Populate the color palette
  // Dark Grey colors for background-like streaks
  colors.push(color(0, 0, 10, 200)); 
  colors.push(color(0, 0, 20, 220));
  // Vibrant Orange colors
  colors.push(color(25, 100, 100, 255));
  colors.push(color(25, 90, 80, 255));
  // Fiery Red colors
  colors.push(color(0, 100, 100, 255));
  colors.push(color(0, 90, 80, 255));

  // Initialize all the speed streaks with random positions and properties
  for (let i = 0; i < numStreaks; i++) {
    // Initial positions are randomized across and slightly off-screen for full coverage
    let x = random(-width, width * 1.5);
    let y = random(-height, height * 1.5);
    let initialSpeed = random(baseSpeedRange[0], baseSpeedRange[1]);
    streaks.push(new SpeedStreak(x, y, initialSpeed, colors));
  }
}

function draw() {
  background(0, 0, 8); // Very dark, almost black background to enhance contrast

  // Loop through all streaks, update their state, and display them
  for (let i = 0; i < streaks.length; i++) {
    let streak = streaks[i];

    // Calculate mouse velocity (how much the mouse has moved between frames)
    let mouseVelocity = dist(mouseX, mouseY, pmouseX, pmouseY);

    // Interaction: Mouse movement influences streak speed
    // Linearly interpolate current speed between base speed and an accelerated speed (up to 2.5x)
    // based on mouse velocity. If the mouse is still, speed reverts to baseSpeed.
    streak.currentSpeed = lerp(streak.baseSpeed, streak.baseSpeed * 2.5, map(mouseVelocity, 0, 50, 0, 1, true));
    
    streak.update(); // Update streak's position
    streak.display(); // Draw the streak
  }
}

// Mouse click creates a temporary burst of new, fast streaks
function mousePressed() {
  // Generate a small burst of new streaks from the click point
  for (let i = 0; i < 7; i++) { 
    let burstSpeed = random(baseSpeedRange[1] * 2, baseSpeedRange[1] * 4); // New streaks are much faster
    // Position new streaks slightly randomly around the mouse click
    let newStreak = new SpeedStreak(mouseX + random(-50, 50), mouseY + random(-50, 50), burstSpeed, [colors[2], colors[3], colors[4], colors[5]]); // Only bright orange/red for bursts
    newStreak.len = random(150, 400); // Shorter, more intense
    newStreak.width = random(15, 70); // Vary width
    newStreak.alpha = 255; // Fully opaque for maximum impact
    streaks.push(newStreak); // Add to the array of streaks
  }
  // Cap the total number of streaks to prevent performance issues
  // Remove the oldest streaks if the total count exceeds initial + burst count
  while (streaks.length > numStreaks + 15) { 
    streaks.shift(); // Remove the oldest streak from the beginning of the array
  }
}