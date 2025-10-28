
export const diggingGameSketch = (p) => {

// Graphics buffers for the different layers
let dirtLayer, stoneLayer, bedrockLayer, fossilLayer, rockLayer;

// Arrays to hold rock objects for each layer
let dirtRocks = [], stoneRocks = [], bedrockRocks = [];

// The size of our digging brush
const brushSize = 60;

// Game state variables
const NUM_FOSSILS = 3;
let fossilLocations = [];
let totalFossilPixels = 0, winThreshold = 0.85;
let gameWon = false, gameStarted = false;
let brushPowerLevel = 0;
let progress = 0;

// -- Variables for cursor and interaction state --
let isBrushing = false;
let mouseDownTime = 0;
const BRUSH_ACTIVATION_DELAY = 150;
let pickaxeSwing = 0;
let brushShapeVertices = [];

// -- Variables for screen shake and particles --
let particles = [];
let shakeAmount = 0;
let shakeDuration = 0;

// Popover variables
let popovers = [];
let lastPopoverTime = 0;
const popoverCooldown = 2500;
const encouragementPhrases = [
  "Keep going!", "You've got this!", "Almost there!", "Nice work!", "That's it!",
  "I see something!", "Careful now...", "Deeper!", "Solid rock..."
];

// Rock breaking variables
let lastClickTime = 0, quickClickCounter = 0, lastClickedRock = null;
const quickClickThreshold = 300;
const clicksToBreak = 3;

// Define colors for each layer's hard rocks
let dirtRockColor, stoneRockColor, bedrockRockColor;
let dirtBaseColor, stoneBaseColor, bedrockBaseColor;

p.setup = () => {
  p.createCanvas(p.windowWidth, p.windowHeight);
  p.pixelDensity(1);
  p.noCursor();
  
  p.disableFriendlyErrors = true; 
  
  initializeLayers();
  p.textAlign(p.CENTER, p.CENTER);
  p.textFont('Georgia');
}

p.draw = () => {
  if (!gameStarted) {
    p.background(102, 69, 44);
    p.fill(255);
    p.textSize(24);
    p.text("Fossils are buried deep within the earth.", p.width / 2, p.height / 2 - 40);
    p.textSize(16);
    p.text("Click to smack, hold and drag to brush.", p.width / 2, p.height / 2 - 10);
    p.text("Uncover large rocks, then tap them quickly to break them.", p.width / 2, p.height / 2 + 10);
    p.textSize(20);
    p.text("Click anywhere to begin digging.", p.width / 2, p.height / 2 + 50);

    drawPickaxeCursor(p.mouseX, p.mouseY);
    return;
  }

  p.background(61, 40, 26);

  p.push();
  if (shakeDuration > 0) {
    p.translate(p.random() * (shakeAmount * 2) - shakeAmount, p.random() * (shakeAmount * 2) - shakeAmount);
    shakeAmount *= 0.9;
    shakeDuration--;
  }

  p.image(fossilLayer, 0, 0);
  p.image(rockLayer, 0, 0);
  p.image(bedrockLayer, 0, 0);
  p.image(stoneLayer, 0, 0);
  p.image(dirtLayer, 0, 0);
  
  manageParticles();
  p.pop();
  
  managePopovers();

  if (gameWon) {
    p.cursor(p.ARROW);
    p.fill(255, 223, 100, 200);
    p.rect(0, 0, p.width, p.height);
    p.fill(0);
    p.textSize(64);
    p.text("You discovered the fossils!", p.width / 2, p.height / 2);
    p.textSize(24);
    p.text("Click anywhere to dig again.", p.width / 2, p.height / 2 + 60);
  } else {
    p.noCursor();
    pickaxeSwing = p.max(0, pickaxeSwing * 0.92);

    if (!p.mouseIsPressed) {
      isBrushing = false;
    }

    if (isBrushing) {
      drawBrushCursor(p.mouseX, p.mouseY);
    } else {
      drawPickaxeCursor(p.mouseX, p.mouseY);
    }
  }
}

p.mousePressed = () => {
  if (gameWon) {
    resetGame();
    return;
  }
  
  if (!gameStarted) {
    gameStarted = true;
    return;
  }

  mouseDownTime = p.millis();
  isBrushing = false;

  let dirtAlpha = dirtLayer.get(p.mouseX, p.mouseY)[3];
  if (dirtAlpha > 10) {
    smackLayer(dirtLayer, 1.2);
    pickaxeSwing = 1.0;
    triggerPopover();
    return;
  }

  let stoneAlpha = stoneLayer.get(p.mouseX, p.mouseY)[3];
  if (stoneAlpha > 10) {
    smackLayer(stoneLayer, 0.7);
    pickaxeSwing = 1.0;
    triggerPopover();
    return;
  }

  let bedrockAlpha = bedrockLayer.get(p.mouseX, p.mouseY)[3];
  if (bedrockAlpha > 10) {
    smackLayer(bedrockLayer, 0.4);
    pickaxeSwing = 1.0;
    triggerPopover();
    return;
  }

  let rock = getRockAt(p.mouseX, p.mouseY);
  if (rock && !rock.isBroken) {
    let timeSinceLastClick = p.millis() - lastClickTime;
    if (timeSinceLastClick < quickClickThreshold && rock === lastClickedRock) {
      quickClickCounter++;
    } else {
      quickClickCounter = 1;
    }
    lastClickTime = p.millis();
    lastClickedRock = rock;

    if (quickClickCounter >= clicksToBreak) {
      breakRock(rock);
    } else {
      smackLayer(bedrockLayer, 0.2);
    }
    pickaxeSwing = 1.0;
  } else {
    lastClickedRock = null;
  }
}

p.mouseDragged = () => {
  if (gameWon || !gameStarted) return;

  if (!isBrushing && p.millis() - mouseDownTime > BRUSH_ACTIVATION_DELAY) {
    isBrushing = true;
    brushShapeVertices = createBrushShape(brushSize * 0.35, 12);
  }

  if (isBrushing) {
    let power = 1;
    if (brushPowerLevel === 1) power = 2.5;
    else if (brushPowerLevel === 2) power = 4.0;

    let dirtAlpha = dirtLayer.get(p.mouseX, p.mouseY)[3];
    if (dirtAlpha > 10) {
      brushLayer(dirtLayer, 10 * power, 30 * power);
    } else {
      let stoneAlpha = stoneLayer.get(p.mouseX, p.mouseY)[3];
      if (stoneAlpha > 10) {
        brushLayer(stoneLayer, 5 * power, 15 * power);
      } else {
        let bedrockAlpha = bedrockLayer.get(p.mouseX, p.mouseY)[3];
        if (bedrockAlpha > 10) {
          brushLayer(bedrockLayer, 3 * power, 8 * power);
        }
      }
    }
    triggerPopover();
  }
  return false;
}

p.mouseReleased = () => {
  isBrushing = false;
  if (gameStarted && !gameWon) {
    cleanupLooseMaterial(dirtLayer, dirtBaseColor);
    cleanupLooseMaterial(stoneLayer, stoneBaseColor);
    cleanupLooseMaterial(bedrockLayer, bedrockBaseColor);
    checkProgress();
    checkRockProgress();
  }
}

p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    resetGame();
}

function resetGame() {
    initializeLayers();
    gameWon = false;
    gameStarted = false;
    brushPowerLevel = 0;
    progress = 0;
    popovers = [];
    particles = [];
    lastClickTime = 0;
    quickClickCounter = 0;
    lastClickedRock = null;
    p.noCursor();
}

// --- Layer Initialization & Drawing ---

function initializeLayers() {
  fossilLocations = [];
  const padding = 0.2;
  for (let i = 0; i < NUM_FOSSILS; i++) {
    fossilLocations.push({
      x: p.random() * (p.width * (1 - padding * 2)) + p.width * padding,
      y: p.random() * (p.height * (1 - padding * 2)) + p.height * padding
    });
  }

  dirtRocks = [];
  stoneRocks = [];
  bedrockRocks = [];
  
  fossilLayer = p.createGraphics(p.width, p.height);
  drawFossil(fossilLayer);
  totalFossilPixels = countFossilPixels(fossilLayer);

  dirtRockColor = p.color(87, 57, 28);
  stoneRockColor = p.color(85, 80, 75);
  bedrockRockColor = p.color(40, 42, 45);
  dirtBaseColor = p.color(139, 90, 43);
  stoneBaseColor = p.color(120, 110, 100);
  bedrockBaseColor = p.color(55, 58, 64);

  dirtLayer = p.createGraphics(p.width, p.height);
  drawDirt(dirtLayer);
  stoneLayer = p.createGraphics(p.width, p.height);
  drawStone(stoneLayer);
  bedrockLayer = p.createGraphics(p.width, p.height);
  drawBedrock(bedrockLayer);

  rockLayer = p.createGraphics(p.width, p.height);
  drawHardRocks(rockLayer, dirtRockColor, 10, 0.8, dirtRocks);
  drawHardRocks(rockLayer, stoneRockColor, 12, 1.0, stoneRocks);
  drawHardRocks(rockLayer, bedrockRockColor, 15, 1.2, bedrockRocks);
}

function drawDirt(pg) {
  pg.background(dirtBaseColor);
  pg.noStroke();
  for (let i = 0; i < 300000; i++) {
    let x = p.random() * pg.width, y = p.random() * pg.height, n = p.noise(x * 0.01, y * 0.01);
    pg.fill(101 + n * 40, 67 + n * 20, 33 + n * 20, 200);
    pg.ellipse(x, y, n * 3, n * 3);
  }
}

function drawStone(pg) {
  pg.background(stoneBaseColor);
  pg.noStroke();
  for (let i = 0; i < 200000; i++) {
    let x = p.random() * pg.width, y = p.random() * pg.height, n = p.noise(x * 0.005, y * 0.005);
    pg.fill(100 + n * 40, 90 + n * 30, 80 + n * 30);
    pg.ellipse(x, y, n * 5, n * 5);
  }
}

function drawBedrock(pg) {
  pg.background(bedrockBaseColor);
}

function drawFossil(pg) {
  pg.clear();
  for (const loc of fossilLocations) {
    pg.push();
    pg.translate(loc.x, loc.y);
    pg.scale(0.7);
    pg.noFill();
    pg.stroke(240, 235, 220);
    pg.strokeWeight(18);
    pg.strokeCap(p.ROUND);
    pg.strokeJoin(p.ROUND);
    pg.bezier(-150, 20, -50, 90, 80, 80, 160, 40);
    pg.bezier(-160, 10, -80, -100, 100, -90, 150, -20);
    pg.fill(0, 0, 0, 0);
    pg.strokeWeight(12);
    pg.circle(80, -25, 35);
    pg.strokeWeight(5);
    pg.line(150, 38, 155, 55);
    pg.line(120, 61, 125, 75);
    pg.line(90, 69, 95, 83);
    pg.pop();
  }
}

function drawHardRocks(pg, rockColor, numRocks, sizeMultiplier, rockArray) {
  for (let i = 0; i < numRocks; i++) {
    let rockX = p.random() * p.width, rockY = p.random() * p.height;
    let rockW = (p.random() * (p.width * 0.15) + p.width * 0.1) * sizeMultiplier,
        rockH = (p.random() * (p.height * 0.15) + p.height * 0.1) * sizeMultiplier;
    let vertices = [], detail = 10;
    for (let j = 0; j < detail; j++) {
      let angle = p.map(j, 0, detail, 0, p.TWO_PI);
      let r = (rockW / 2) + (p.random() * (60 * sizeMultiplier) - 30 * sizeMultiplier);
      let x = rockX + p.cos(angle) * r,
          y = rockY + p.sin(angle) * (r * (rockH / rockW));
      vertices.push(p.createVector(x, y));
    }

    rockArray.push({vertices: vertices, color: rockColor, isBroken: false, uncoveredPercent: 0, becameVulnerable: false});

    pg.push();
    let strokeCol = p.color(p.red(rockColor) * 0.5, p.green(rockColor) * 0.5, p.blue(rockColor) * 0.5, 180);
    pg.stroke(strokeCol);
    pg.strokeWeight(3 * sizeMultiplier);
    pg.fill(rockColor);
    pg.beginShape();
    for (const v of vertices) pg.vertex(v.x, v.y);
    pg.endShape(p.CLOSE);
    
    pg.drawingContext.save();
    pg.beginShape();
    for(const v of vertices) pg.vertex(v.x, v.y);
    pg.endShape(p.CLOSE);
    pg.drawingContext.clip();
    pg.noStroke();
    let lightSpeckle = p.color(p.red(rockColor)*1.2, p.green(rockColor)*1.2, p.blue(rockColor)*1.2, 200);
    let darkSpeckle = p.color(p.red(rockColor)*0.8, p.green(rockColor)*0.8, p.blue(rockColor)*0.8, 200);
    let numSpeckles = (rockW*rockH)/60;
    let {minX, maxX, minY, maxY} = getPolygonBounds(vertices);
    for (let j=0; j<numSpeckles; j++) {
      let x = p.random() * (maxX - minX) + minX;
      let y = p.random() * (maxY - minY) + minY;
      pg.fill(p.random()>0.5 ? lightSpeckle : darkSpeckle);
      pg.ellipse(x,y,p.random()*3+1*sizeMultiplier, p.random()*3+1*sizeMultiplier);
    }
    pg.drawingContext.restore();
    
    pg.pop();
  }
}

// --- Digging & Layer Manipulation ---

function createBrushShape(radius, detail) {
  let vertices = [];
  for (let j = 0; j < detail; j++) {
    let angle = p.map(j, 0, detail, 0, p.TWO_PI);
    let r = radius * (1 + (p.random() * 0.8 - 0.4));
    let x = p.cos(angle) * r;
    let y = p.sin(angle) * r;
    vertices.push(p.createVector(x, y));
  }
  return vertices;
}

function smackLayer(targetLayer, radiusMultiplier) {
  let impactShape = createBrushShape(brushSize * radiusMultiplier, 10);
  targetLayer.erase();
  targetLayer.push();
  targetLayer.translate(p.mouseX, p.mouseY);
  targetLayer.beginShape();
  for (const v of impactShape) targetLayer.vertex(v.x, v.y);
  targetLayer.endShape(p.CLOSE);
  targetLayer.pop();
  targetLayer.noErase();
}

function brushLayer(targetLayer, minFringeSize, maxFringeSize) {
  targetLayer.erase();
  targetLayer.push();
  targetLayer.translate(p.mouseX, p.mouseY);
  targetLayer.beginShape();
  for (const v of brushShapeVertices) targetLayer.vertex(v.x, v.y);
  targetLayer.endShape(p.CLOSE);
  targetLayer.pop();
  for (let i = 0; i < 10; i++) {
    let offsetX = p.random() * (brushSize * 1.6) - brushSize * 0.8;
    let offsetY = p.random() * (brushSize * 1.6) - brushSize * 0.8;
    let grainSize = p.random() * (maxFringeSize - minFringeSize) + minFringeSize;
    targetLayer.ellipse(p.mouseX + offsetX, p.mouseY + offsetY, grainSize);
  }
  targetLayer.noErase();
}

function cleanupLooseMaterial(targetLayer, particleColor) {
    const samples = 5000;
    const neighborThreshold = 3;
    let toRemove = [];

    targetLayer.loadPixels();
    const pixels = targetLayer.pixels;
    const w = targetLayer.width;
    const h = targetLayer.height;

    for (let i = 0; i < samples; i++) {
        const x = p.floor(p.random() * w);
        const y = p.floor(p.random() * h);
        const idx = (x + y * w) * 4;

        if (pixels[idx + 3] > 200) {
            let neighborCount = 0;
            for (let nx = -1; nx <= 1; nx++) {
                for (let ny = -1; ny <= 1; ny++) {
                    if (nx === 0 && ny === 0) continue;
                    const checkX = x + nx;
                    const checkY = y + ny;
                    if (checkX >= 0 && checkX < w && checkY >= 0 && checkY < h) {
                        const neighborIdx = (checkX + checkY * w) * 4;
                        if (pixels[neighborIdx + 3] > 200) {
                            neighborCount++;
                        }
                    }
                }
            }
            if (neighborCount < neighborThreshold) {
                toRemove.push({ x, y });
            }
        }
    }

    if (toRemove.length > 0) {
        targetLayer.erase();
        for (const pt of toRemove) {
            targetLayer.ellipse(pt.x, pt.y, 10, 10);
            if (p.random() < 0.5) {
                 particles.push({
                    x: pt.x, y: pt.y,
                    vx: p.random() * 2 - 1, vy: p.random() * -2,
                    lifespan: 150, c: particleColor,
                    size: p.random() * 2 + 2
                });
            }
        }
        targetLayer.noErase();
    }
}

// --- Rocks, Particles & Popovers ---

function manageParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    let pt = particles[i];
    pt.x += pt.vx;
    pt.y += pt.vy;
    pt.vy += 0.1;
    pt.lifespan -= 2;

    if (pt.lifespan <= 0) {
      particles.splice(i, 1);
    } else {
      pt.c.setAlpha(pt.lifespan);
      p.fill(pt.c);
      p.noStroke();
      p.ellipse(pt.x, pt.y, pt.size);
    }
  }
}

function breakRock(rock) {
  if (rock.isBroken) return;
  rock.isBroken = true;
  shakeAmount = 12;
  shakeDuration = 20;

  let { centerX, centerY } = getPolygonBounds(rock.vertices);

  for (let i = 0; i < 50; i++) {
    let angle = p.random() * p.TWO_PI;
    let speed = p.random() * 5 + 1;
    particles.push({
      x: centerX, y: centerY,
      vx: p.cos(angle) * speed, vy: p.sin(angle) * speed,
      lifespan: 255, c: rock.color,
      size: p.random() * 5 + 3
    });
  }

  rockLayer.erase();
  rockLayer.beginShape();
  for (const v of rock.vertices) rockLayer.vertex(v.x, v.y);
  rockLayer.endShape(p.CLOSE);
  rockLayer.noErase();

  quickClickCounter = 0;
  lastClickedRock = null;
  triggerSpecialPopover("Rock shattered!", p.mouseX, p.mouseY);
}

function managePopovers() {
  for (let i = popovers.length - 1; i >= 0; i--) {
    let pt = popovers[i];
    pt.lifespan--;
    pt.y -= 0.5;
    let alpha = p.map(pt.lifespan, 0, pt.initialLife / 2, 0, 255);
    p.textSize(16);
    p.stroke(0, alpha);
    p.strokeWeight(3);
    p.fill(255, 255, 220, alpha);
    p.text(pt.text, pt.x, pt.y);
    p.noStroke();
    if (pt.lifespan <= 0) popovers.splice(i, 1);
  }
}

function getOutskirtPosition() {
    let edge = p.floor(p.random() * 4), paddingX = p.width*0.15, paddingY = p.height*0.15;
    let pos = { x: 0, y: 0 };
    switch (edge) {
      case 0: pos.x=p.random() * (p.width - 2 * paddingX) + paddingX; pos.y=p.random() * (paddingY * 0.5) + paddingY * 0.5; break;
      case 1: pos.x=p.random() * (paddingX * 0.5) + (p.width - paddingX); pos.y=p.random() * (p.height - 2 * paddingY) + paddingY; break;
      case 2: pos.x=p.random() * (p.width - 2 * paddingX) + paddingX; pos.y=p.random() * (paddingY * 0.5) + (p.height - paddingY); break;
      case 3: pos.x=p.random() * (paddingX * 0.5) + paddingX * 0.5; pos.y=p.random() * (p.height - 2 * paddingY) + paddingY; break;
    }
    return pos;
}

function triggerPopover() {
  if (p.millis() - lastPopoverTime > popoverCooldown) {
    let pos = getOutskirtPosition();
    popovers.push({
      text: encouragementPhrases[p.floor(p.random() * encouragementPhrases.length)],
      x: pos.x, y: pos.y, lifespan: 120, initialLife: 120
    });
    lastPopoverTime = p.millis();
  }
}

function triggerSpecialPopover(message, x = null, y = null) {
   let pos = (x !== null && y !== null) ? { x, y } : getOutskirtPosition();
   popovers.push({text: message, x: pos.x, y: pos.y, lifespan: 180, initialLife: 180});
}

// --- UI & Cursors ---

function drawPickaxeCursor(x, y) {
  p.push();
  const maxSwing = -p.PI / 8;
  let currentRotation = p.sin(pickaxeSwing * p.PI) * maxSwing;
  let pivotX = 28, pivotY = 20;
  
  p.translate(x, y);
  p.scale(0.8);
  p.translate(0, -5);
  p.translate(pivotX, pivotY);
  p.rotate(currentRotation);
  p.translate(-pivotX, -pivotY);
  
  p.noStroke();
  p.fill(180, 123, 65);
  p.beginShape(); p.vertex(35.44, 17.99); p.vertex(12.32, 83.53); p.vertex(2.72, 78.62); p.vertex(26.50, 13.96); p.endShape(p.CLOSE);
  p.fill(238, 238, 238);
  p.beginShape(); p.vertex(29.22, 1.74); p.vertex(25.51, 10.25); p.vertex(1.30, 9.81); p.vertex(0, 5.02); p.endShape(p.CLOSE);
  p.beginShape(); p.vertex(42.96, 7.09); p.vertex(66.73, 25.08); p.vertex(62.70, 29.22); p.vertex(38.82, 17.01); p.endShape(p.CLOSE);
  p.fill(247, 247, 247);
  p.beginShape(); p.vertex(29.22, 1.74); p.vertex(29.87, 0); p.vertex(43.94, 4.69); p.vertex(43.07, 6.98); p.vertex(38.82, 16.79); p.vertex(37.95, 18.97); p.vertex(35.55, 17.88); p.vertex(26.61, 13.85); p.vertex(24.43, 12.87); p.vertex(25.63, 10.14); p.endShape(p.CLOSE);
  p.pop();
}

function drawBrushCursor(x, y) {
  p.push();
  const swaySpeed = 0.005;
  const swayAmount = p.PI / 24;
  let currentRotation = p.sin(p.millis() * swaySpeed) * swayAmount;
  let pivotX = 15, pivotY = 45;

  p.translate(x, y);
  p.scale(0.9);
  p.translate(-15, -55);
  p.translate(pivotX, pivotY);
  p.rotate(currentRotation);
  p.translate(-pivotX, -pivotY);
  
  p.noStroke();
  p.fill(236, 220, 182);
  p.beginShape(); p.vertex(28.65, 45.46); p.vertex(25.27, 62.03); p.vertex(5.10, 57.57); p.vertex(9.50, 42.50); p.endShape(p.CLOSE);
  p.beginShape(); p.vertex(3.49, 57.17); p.vertex(0.0, 55.41); p.vertex(4.97, 41.79); p.vertex(9.52, 42.60); p.endShape(p.CLOSE);
  p.fill(238, 238, 238);
  p.beginShape(); p.vertex(28.65, 45.46); p.vertex(9.52, 42.60); p.vertex(4.97, 41.79); p.vertex(8.00, 34.56); p.vertex(30.41, 37.88); p.endShape(p.CLOSE);
  p.fill(255, 204, 0);
  p.beginShape(); p.vertex(8.10, 34.55); p.vertex(11.26, 27.51); p.vertex(17.44, 24.74); p.vertex(25.57, 0); p.vertex(32.23, 1.57); p.vertex(27.76, 27.04); p.vertex(32.33, 31.38); p.vertex(30.42, 37.99); p.endShape(p.CLOSE);
  p.pop();
}

// --- Game Logic & Utility ---

function countFossilPixels(pg) {
  pg.loadPixels();
  let count = 0;
  for (let i = 0; i < pg.pixels.length; i += 4) {
    if (pg.pixels[i + 3] > 0) count++;
  }
  return count;
}

function checkProgress() {
  dirtLayer.loadPixels();
  stoneLayer.loadPixels();
  bedrockLayer.loadPixels();
  fossilLayer.loadPixels();
  
  let revealedCount = 0;
  for (let i = 0; i < dirtLayer.pixels.length; i += 4) {
    if (dirtLayer.pixels[i + 3] < 50 && stoneLayer.pixels[i + 3] < 50 && bedrockLayer.pixels[i + 3] < 50 && fossilLayer.pixels[i + 3] > 50) {
      revealedCount++;
    }
  }
  progress = revealedCount / totalFossilPixels;

  if (progress >= 0.25 && brushPowerLevel === 0) {
    brushPowerLevel = 1;
    triggerSpecialPopover("My brush feels more effective now!");
  }
  if (progress >= 0.5 && brushPowerLevel === 1) {
    brushPowerLevel = 2;
    triggerSpecialPopover("Even stronger! Nothing can stop me!");
  }
  if (progress >= winThreshold) {
    gameWon = true;
  }
}

function checkRockProgress() {
  checkRocksOnLayer(dirtRocks, [dirtLayer]);
  checkRocksOnLayer(stoneRocks, [dirtLayer, stoneLayer]);
  checkRocksOnLayer(bedrockRocks, [dirtLayer, stoneLayer, bedrockLayer]);
}

function checkRocksOnLayer(rocks, layersAbove) {
  for(const layer of layersAbove) { layer.loadPixels(); }

  for (const rock of rocks) {
    if (rock.isBroken || rock.becameVulnerable) continue;
        
    let totalRockPixels = 0, uncoveredRockPixels = 0;
    let {minX, maxX, minY, maxY} = getPolygonBounds(rock.vertices);

    for (let y = p.floor(minY); y < p.ceil(maxY); y++) {
      for (let x = p.floor(minX); x < p.ceil(maxX); x++) {
        if (isPointInPolygon(x, y, rock.vertices)) {
          totalRockPixels++;
          let i = (x + y * p.width) * 4;
          let isCovered = false;
          for(const layer of layersAbove) {
            if (layer.pixels[i + 3] > 50) { isCovered = true; break; }
          }
          if (!isCovered) { uncoveredRockPixels++; }
        }
      }
    }
    if (totalRockPixels > 0) rock.uncoveredPercent = uncoveredRockPixels / totalRockPixels;
    if (rock.uncoveredPercent > 0.5 && !rock.becameVulnerable) {
        rock.becameVulnerable = true;
        popovers.push({text: "This rock looks weak!", x: rock.vertices[0].x, y: rock.vertices[0].y, lifespan: 120, initialLife: 120});
    }
  }
}

function getRockAt(x, y) {
  for (const rock of bedrockRocks) if (!rock.isBroken && isPointInPolygon(x, y, rock.vertices)) return rock;
  for (const rock of stoneRocks) if (!rock.isBroken && isPointInPolygon(x, y, rock.vertices)) return rock;
  for (const rock of dirtRocks) if (!rock.isBroken && isPointInPolygon(x, y, rock.vertices)) return rock;
  return null;
}

function isPointInPolygon(px, py, vertices) {
  let collision = false;
  let next = 0;
  for (let current = 0; current < vertices.length; current++) {
    next = current + 1;
    if (next == vertices.length) next = 0;
    let vc = vertices[current];
    let vn = vertices[next];
    if (((vc.y > py && vn.y < py) || (vc.y < py && vn.y > py)) &&
      (px < (vn.x - vc.x) * (py - vc.y) / (vn.y - vc.y) + vc.x)) {
      collision = !collision;
    }
  }
  return collision;
}

function getPolygonBounds(vertices) {
    let minX=p.width, maxX=0, minY=p.height, maxY=0;
    for(const v of vertices) {
         minX=p.min(minX, v.x); maxX=p.max(maxX, v.x);
         minY=p.min(minY, v.y); maxY=p.max(maxY, v.y);
    }
    return { minX, maxX, minY, maxY, centerX: minX + (maxX-minX)/2, centerY: minY + (maxY-minY)/2 };
}
}
