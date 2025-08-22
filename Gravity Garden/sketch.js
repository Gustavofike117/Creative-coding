let stars = [];
let selectedStar = null;
let dragging = false;
let dragOffset;
let lastStarAddTime = 0;
let starfieldLayer;
let flickerStars = [];
let autoExplosionTriggered = false;
let shakeTimer = 0;
let shakeIntensity = 0;
let flashBackground = false;
let blackholeSound;
let blackholeGlow;
let warpedStarfield;
let blackholePos;
let blackholeRadius = 80;
let draggingBlackhole = false;

// 10 gradient colors from cool to warm
let gradientColors = [
  '#1E90FF', // blue
  '#4682B4', // steelblue
  '#6A5ACD', // slateblue
  '#7B68EE', // mediumslateblue
  '#20B2AA', // lightseagreen
  '#00FA9A', // springgreen
  '#FFD700', // gold
  '#FFA500', // orange
  '#FF4500', // orangered
  '#FF0000'  // red
];
function preload() {
  blackholeSound = loadSound("space-hole-test-23665.mp3");
}
function setup() {
  createCanvas(800, 600);
  blackholePos = createVector(width / 2, height / 2);
  userStartAudio();
  blackholeGlow = createGraphics(200, 200);
let centerX = blackholeGlow.width / 2;
let centerY = blackholeGlow.height / 2;

for (let r = 100; r > 0; r -= 1) {
  let alpha = map(r, 100, 0, 0, 255);
  blackholeGlow.noFill();
  blackholeGlow.stroke(100, 150, 255, alpha); //Blue-white halo
  blackholeGlow.ellipse(centerX, centerY, r * 2, r * 2);
}

// The center of the black hole is covered with a black circle
blackholeGlow.fill(0);
blackholeGlow.noStroke();
blackholeGlow.ellipse(centerX, centerY, 60, 60);
  createCanvas(800, 600);
  //frameRate(60); // Reduce CPU pressure and maintain visual smoothness
  for (let i = 0; i < int(random(6, 9)); i++) {
    stars.push(new Star(random(width), random(height)));
  }
  starfieldLayer = createGraphics(width, height);
drawStarfield(starfieldLayer);
  for (let i = 0; i < 100; i++) {
  flickerStars.push({
    anchor: createVector(random(width), random(height)),
    xoff: random(1000),
    yoff: random(1000),
    size: random(1, 2.5),
    brightness: random(150, 255)
  });
}
  // Create a starry sky layer
  warpedStarfield = createGraphics(300, 300);

  // Randomly generate star points
  for (let i = 0; i < 300; i++) {
    let x = random(warpedStarfield.width);
    let y = random(warpedStarfield.height);
    let brightness = random(180, 255);
    warpedStarfield.stroke(brightness);
    warpedStarfield.point(x, y);
  }
}

function draw() {
  
   // The screen began to vibrate.
  push();

  if (shakeTimer > 0) {
    let dx = random(-shakeIntensity, shakeIntensity);
    let dy = random(-shakeIntensity, shakeIntensity);
    translate(dx, dy); // shivering whole canvas
    shakeTimer--;
  }
push();
translate(blackholePos.x, blackholePos.y);        // center of blackhole
  for (let r = blackholeRadius; r < blackholeRadius + 80; r += 3) {
  let alpha = map(r, blackholeRadius, blackholeRadius + 80, 60, 0);
  stroke(180, 200, 255, alpha);
  noFill();
  ellipse(0, 0, r * 2);
}
rotate(frameCount * 0.003);               // slowly rotate
imageMode(CENTER);
tint(255, 120);                           // semi- transparent
image(warpedStarfield, 0, 0, 220, 220);   // change the size of twisty area
imageMode(CORNER);                        // restore default
pop();
  // background drawing
  if (flashBackground) {
    background(255); // explode effect
    flashBackground = false;
  } else {
    background(0, 40); // normal background
  // Draw static starfield background
image(starfieldLayer, 0, 0);}
  // Simulated gravitational distortion
push();
translate(blackholePos.x, blackholePos.y);
for (let r = 70; r < 130; r += 2) {
  let alpha = map(r, 70, 130, 100, 0);
  noFill();
  stroke(180, 180, 255, alpha); // Blue and white gradient
  ellipse(0, 0, r * 2);
}
pop();
  
  // Black hole animation

  push();
translate(blackholePos.x, blackholePos.y);
rotate(frameCount * 0.01);  // Control the slow rotation of black holes
imageMode(CENTER);
image(blackholeGlow, 0, 0);
imageMode(CORNER); // restore defaul
pop();
noStroke();
for (let star of flickerStars) {
  // anchor is fixed point; noise used as subtle wobble
  let dx = map(noise(star.xoff), 0, 1, -1.5, 1.5);
  let dy = map(noise(star.yoff), 0, 1, -1.5, 1.5);

  let x = star.anchor.x + dx;
  let y = star.anchor.y + dy;

  // Increment slowly
  star.xoff += 0.001;
  star.yoff += 0.001;

  // Flicker
  let flicker = random(-30, 30);
  let alpha = constrain(star.brightness + flicker, 120, 255);
  fill(255, alpha);
  ellipse(x, y, star.size);
}
// Add dynamic flickering stars
noStroke();
for (let i = 0; i < 25; i++) {
  let x = random(i * 0.2, frameCount * 0.01) * width;
  let y = noise(i * 0.3 + 1000, frameCount * 0.01) * height;
  fill(255, random(100, 220));
  ellipse(x, y, random(1, 2.5));
}
  background(0, 40); // semi-transparent to allow fading trails

  for (let star of stars) {
    if (mouseIsPressed && !dragging) {
      let dir = createVector(mouseX, mouseY).sub(star.pos).normalize().mult(0.05);
      star.vel.add(dir);
    }
// Delete the stars that have been absorbed
stars = stars.filter(s => !(s.absorbing && s.radius <= 1));
    star.updateDynamicColor(stars); // Adjust color based on proximity
    star.move();
    star.display();
    // Draw lines between nearby stars
stroke(255, 50);
strokeWeight(1);
for (let i = 0; i < stars.length; i++) {
  for (let j = i + 1; j < stars.length; j++) {
    let a = stars[i];
    let b = stars[j];
    let d = dist(a.pos.x, a.pos.y, b.pos.x, b.pos.y);
    if (d < 120) {
      line(a.pos.x, a.pos.y, b.pos.x, b.pos.y);

      // Optional: draw distance as label
      let midX = (a.pos.x + b.pos.x) / 2;
      let midY = (a.pos.y + b.pos.y) / 2;
      noStroke();
      fill(255, 100);
      textSize(10);
      text(nf(d, 0, 1), midX, midY);
    }
  }
}
    // Hover label
for (let star of stars) {
  if (dist(mouseX, mouseY, star.pos.x, star.pos.y) < star.radius) {
    fill(255);
    noStroke();
    textSize(12);
    let label = `Size: ${nf(star.radius, 0, 1)} | StarName: ${star.text}`;
    text(label, star.pos.x + 10, star.pos.y - 10);
    break;
  }
}
  }

  checkCollisions();

  if (millis() - lastStarAddTime > 6000 && stars.length < 50) {
    stars.push(new Star(random(width), random(height)));
    lastStarAddTime = millis();
  }
  // Check if 15+ stars are close together and trigger explosion
if (!autoExplosionTriggered) {
  let closeGroups = [];

  for (let i = 0; i < stars.length; i++) {
    let group = [stars[i]];

    for (let j = 0; j < stars.length; j++) {
      if (i !== j) {
        let d = dist(stars[i].pos.x, stars[i].pos.y, stars[j].pos.x, stars[j].pos.y);
        if (d < 100) {
          group.push(stars[j]);
        }
      }
    }

    if (group.length >= 15) {
      closeGroups = group;
      break;
    }
  }

  if (closeGroups.length >= 15) {
    for (let s of closeGroups) {
      let dir = p5.Vector.sub(s.pos, createVector(width / 2, height / 2)).normalize();dir.rotate(random(-PI / 6, PI / 6)); // ±30°disturbance
s.vel.add(dir.mult(random(10, 20)))
      s.vel.add(dir.mult(random(8, 15)));
    }

    // Optional: flash background
    flashBackground = true;
    autoExplosionTriggered = true; // prevent repeated triggering
    shakeTimer = 10;         // shake for 10 frames
  shakeIntensity = 10;     // up to 10px movement
    // Reset after 10 seconds (10000ms) to allow repeat triggering
  setTimeout(() => {
    autoExplosionTriggered = false;
  }, 10000);
  }
}
}

// Static starfield background
function drawStarfield() {
  noStroke();
  function drawStarfield(pg) {
  pg.noStroke();
  for (let i = 0; i < 1500; i++) {
    let x = random(width);
    let y = random(height);
    let alpha = random(100, 255);
    let size = random(0.8, 2.5);

    if (random() < 0.01) {
      alpha = 255;
      size = 3 + random(1, 2);
    }

    pg.fill(255, alpha);
    pg.ellipse(x, y, size);
  }
}
    
}

function mousePressed() {
  let d = dist(mouseX, mouseY, blackholePos.x, blackholePos.y);
  if (d < blackholeRadius) {
    draggingBlackhole = true;
    dragOffset = createVector(blackholePos.x - mouseX, blackholePos.y - mouseY);}
  for (let star of stars) {
    if (star.isClicked(mouseX, mouseY)) {
      selectedStar = star;
      dragOffset = p5.Vector.sub(star.pos, createVector(mouseX, mouseY));
      dragging = true;
      return;
    }
  }
}

function mouseReleased() {
  dragging = false;
  selectedStar = null;
  draggingBlackhole = false;
}

function mouseDragged() {
   if (draggingBlackhole) {
    blackholePos.x = mouseX + dragOffset.x;
    blackholePos.y = mouseY + dragOffset.y;}
  if (dragging && selectedStar) {
    selectedStar.pos = createVector(mouseX, mouseY).add(dragOffset);
  }
}

function keyPressed() {
  if (keyCode === UP_ARROW) {
    blackholeRadius = min(200, blackholeRadius + 10);
  } else if (keyCode === DOWN_ARROW) {
    blackholeRadius = max(30, blackholeRadius - 10);}
  if (selectedStar) {
    if (key === ' ') {
      selectedStar.switchColor();
    } else if (key.length === 1) {
      selectedStar.textBuffer += key;
 selectedStar.setText(selectedStar.textBuffer);
    } else if (keyCode === BACKSPACE) {
      inputText = inputText.slice(0, -1);
      selectedStar.setText(selectedStar.textBuffer);
    }
  }
}

function checkCollisions() {
  for (let i = 0; i < stars.length; i++) {
    for (let j = i + 1; j < stars.length; j++) {
      let a = stars[i];
      let b = stars[j];
      let d = p5.Vector.dist(a.pos, b.pos);
      if (d < a.radius * 2) {
        let force = p5.Vector.sub(a.pos, b.pos).normalize().mult(0.5);
        a.vel.add(force);
        b.vel.sub(force);
      }
    }
  }
}

class Star {
  constructor(x, y) {
    this.trail = []; //star trail
    this.playedAbsorb = false;
    this.absorbing = false;  // absorbed by blackhole
    this.pos = createVector(x, y);
    this.vel = p5.Vector.random2D().mult(0.5);
    this.radius = random(15, 30);
    this.textBuffer = ''; // Independent input for each star
    this.colorIndex = int(random(gradientColors.length));//random size
    this.color = color(random(100, 255), random(100, 255), random(100, 255));
    this.text = '';
    this.noiseOffset = random(1000);
    this.ringAngle = random(TWO_PI); // Initial angle for rotating text ring
  }

  move() {
    
    this.trail.push(this.pos.copy());
if (this.trail.length > 30) {
  this.trail.shift(); // limit startrail length
}
  this.vel.mult(0.97); // Smooth slowdown

  // Use two independent noise channels for x and y direction
  let nx = noise(this.pos.x * 0.002, this.pos.y * 0.002, this.noiseOffset + frameCount * 0.002);
  let ny = noise(this.pos.y * 0.002, this.pos.x * 0.002, this.noiseOffset + 1000 + frameCount * 0.002);

  let fx = map(nx, 0, 1, -1, 1);
  let fy = map(ny, 0, 1, -1, 1);

  let dir = createVector(fx, fy).mult(0.1); // adjust strength
  this.vel.add(dir);
  this.pos.add(this.vel);
    this.ringAngle += 0.0005
   let dToCenter = p5.Vector.dist(this.pos, blackholePos);

// If it enters the absorption range of a black hole
if (dToCenter < blackholeRadius) {
  this.absorbing = true;
  this.radius = max(0, this.radius - 0.5);

  // play absorbing sound
  if (!this.playedAbsorbSound && blackholeSound && blackholeSound.isLoaded()) {
    blackholeSound.play();
    this.playedAbsorbSound = true;
     // （sound fade out after 5 seconds）
    setTimeout(() => {
      if (blackholeSound.isPlaying()) {
        blackholeSound.setVolume(0, 1);
        setTimeout(() => {
          blackholeSound.stop()
          blackholeSound.setVolume(1);
        },1000)
  }
},4000);
  }
}
let center = createVector(width / 2, height / 2);
let toCenter = p5.Vector.sub(this.pos, center);
let angle = 0.002;
let rotated = createVector(
  cos(angle) * toCenter.x - sin(angle) * toCenter.y,
  sin(angle) * toCenter.x + cos(angle) * toCenter.y
);
this.pos = p5.Vector.add(center, rotated);
  //this.pos.x = constrain(this.pos.x, this.radius, width - this.radius);
  //this.pos.y = constrain(this.pos.y, this.radius, height - this.radius);
  //this.pos.y = constrain(this.pos.y, this.radius, height - this.radius);
    // Wrap around canvas edges
if (this.pos.x < -this.radius) this.pos.x = width + this.radius;
if (this.pos.x > width + this.radius) this.pos.x = -this.radius;
if (this.pos.y < -this.radius) this.pos.y = height + this.radius;
if (this.pos.y > height + this.radius) this.pos.y = -this.radius;
}
display() {// Draw star trail as fading dots
noStroke();
for (let i = 0; i < this.trail.length; i++) {
  let p = this.trail[i];
  if (!p || isNaN(p.x) || isNaN(p.y)) continue;
  let alpha = map(i, 0, this.trail.length - 1, 20, 150);
  let size = map(i, 0, this.trail.length - 1, 1, 3);

  fill(this.color.levels[0], this.color.levels[1], this.color.levels[2], alpha);
  ellipse(p.x, p.y, size, size);
}
  // draw trail
noFill();
stroke(255, 50);
beginShape();
//for (let p of this.trail) {
  //vertex(p.x, p.y);
//}
//endShape();
  push();
  translate(this.pos.x, this.pos.y);
  // Draw the movement trajectories of the stars
noStroke();
for (let i = 0; i < this.trail.length; i++) {
  let p = this.trail[i];
  let alpha = map(i, 0, this.trail.length - 1, 20, 150); // The further forward, the more transparent
  let size = map(i, 0, this.trail.length - 1, 1, 3);     // The trajectory gradually thickens
  fill(this.color.levels[0], this.color.levels[1], this.color.levels[2], alpha);
  ellipse(p.x, p.y, size);
}
  

  // 1. background circle
  noStroke();
  fill(this.color);
  ellipse(0, 0, this.radius * 2.2);

  // 2. Simulate the illumination and shadow of a sphere
  for (let i = 0; i < 5; i++) {
    fill(0, map(i, 0, 4, 10, 80));
    ellipse(5, 5, this.radius * 2.2 - i * 2);
  }

  // 3. Simulate the rotation of the equatorial line
  stroke(255, 100);
  noFill();
  let ringW = this.radius * 2.2;
  let ringH = this.radius * 0.4;
  rotate(radians(frameCount % 360)); // slowly rotating
  ellipse(0, 0, ringW, ringH); // simulate orbit/rotation band

  pop();

  
  // Text forming a "tilted Jupiter ring"
// Tilted rotating text ring (with individual star rotation)
if (this.text.length > 0) {
  push();
  translate(this.pos.x, this.pos.y);
  rotate(this.ringAngle); // Each star has its own rotation angle

  let a = this.radius * 2.5;
  let b = this.radius * 1.0;
  textAlign(CENTER, CENTER);
  fill(255);
  noStroke();
  textSize(12);

  for (let i = 0; i < this.text.length; i++) {
    let angle = map(i, 0, this.text.length, 0, TWO_PI);
    let x = a * cos(angle);
    let y = b * sin(angle);
    push();
    translate(x, y);
    rotate(angle + HALF_PI); // Text aligns to ellipse tangent
    text(this.text.charAt(i), 0, 0);
    pop();
  }

  pop();
}
}

  isClicked(mx, my) {
    return dist(mx, my, this.pos.x, this.pos.y) < this.radius;
  }

  setText(t) {
    this.text = t;
  }

  switchColor() {
    this.colorIndex = (this.colorIndex + 1) % gradientColors.length;
    this.color = color(gradientColors[this.colorIndex]);
  }

  // Adjust color based on proximity to nearest neighbor
  updateDynamicColor(others) {
    let minDist = Infinity;
    for (let other of others) {
      if (other !== this) {
        let d = dist(this.pos.x, this.pos.y, other.pos.x, other.pos.y);
        if (d < minDist) minDist = d;
      }
    }

    let t = constrain(map(minDist, 30, 200, 1, 0), 0, 1); // close → warm, far → cool
    let targetColorIndex = int(t * (gradientColors.length - 1));
    this.color = lerpColor(this.color, color(gradientColors[targetColorIndex]), 0.05);
  }
}