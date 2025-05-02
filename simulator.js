// Get DOM elements
const canvas = document.getElementById('simulationCanvas');
const ctx = canvas.getContext('2d');
const velocityInput = document.getElementById('velocity');
const angleInput = document.getElementById('angle');
const heightInput = document.getElementById('height');
const startButton = document.getElementById('startButton');
const maxHeightElement = document.getElementById('maxHeight');
const flightTimeElement = document.getElementById('flightTime');
const distanceElement = document.getElementById('distance');

// Physics constants
const g = 9.81; // gravity (m/s²)
const scale = 50; // pixels per meter

// Tech theme elements
const gridSize = 20;
const gridColor = 'rgba(0, 188, 212, 0.1)';
const dataPoints = [];

// Simulation state
let isSimulating = false;
let projectile = {
  x: 0,
  y: 0,
  vx: 0,
  vy: 0,
  time: 0,
};
let trajectory = [];

// Convert degrees to radians
function degreesToRadians(degrees) {
  return (degrees * Math.PI) / 180;
}

// Update statistics
function updateStats() {
  // Calculate maximum height
  const maxHeight = Math.max(
    ...trajectory.map((point) => canvas.height / scale - point.y)
  );
  maxHeightElement.textContent = `${maxHeight.toFixed(2)} m`;

  // Update flight time
  flightTimeElement.textContent = `${projectile.time.toFixed(2)} s`;

  // Update distance
  const distance = projectile.x;
  distanceElement.textContent = `${distance.toFixed(2)} m`;
}

// Initialize simulation
function initSimulation() {
  const velocity = parseFloat(velocityInput.value);
  const angle = degreesToRadians(parseFloat(angleInput.value));
  const initialHeight = parseFloat(heightInput.value);

  // Reset simulation state
  projectile = {
    x: 0,
    y: canvas.height / scale - initialHeight, // Start from specified height
    vx: velocity * Math.cos(angle),
    vy: -velocity * Math.sin(angle), // Negative because canvas Y is inverted
    time: 0,
  };
  trajectory = [];
  dataPoints.length = 0;
  isSimulating = true;

  // Reset statistics
  maxHeightElement.textContent = '0.00 m';
  flightTimeElement.textContent = '0.00 s';
  distanceElement.textContent = '0.00 m';
}

// Draw tech grid
function drawGrid() {
  ctx.strokeStyle = gridColor;
  ctx.lineWidth = 1;

  // Draw vertical lines
  for (let x = 0; x < canvas.width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }

  // Draw horizontal lines
  for (let y = 0; y < canvas.height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
}

// Draw data visualization
function drawDataPoints() {
  dataPoints.forEach((point) => {
    ctx.beginPath();
    ctx.arc(point.x, point.y, 2, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 188, 212, 0.5)';
    ctx.fill();
  });
}

// Draw projectile with tech style
function drawProjectile(x, y) {
  // Draw energy field
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, 15);
  gradient.addColorStop(0, 'rgba(0, 188, 212, 0.2)');
  gradient.addColorStop(1, 'rgba(0, 188, 212, 0)');
  ctx.beginPath();
  ctx.arc(x, y, 15, 0, Math.PI * 2);
  ctx.fillStyle = gradient;
  ctx.fill();

  // Draw projectile
  ctx.beginPath();
  ctx.arc(x, y, 6, 0, Math.PI * 2);
  ctx.fillStyle = '#00BCD4';
  ctx.fill();

  // Draw tech details
  ctx.beginPath();
  ctx.arc(x, y, 8, 0, Math.PI * 2);
  ctx.strokeStyle = '#2196F3';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Draw crosshair
  ctx.beginPath();
  ctx.moveTo(x - 10, y);
  ctx.lineTo(x + 10, y);
  ctx.moveTo(x, y - 10);
  ctx.lineTo(x, y + 10);
  ctx.strokeStyle = 'rgba(33, 150, 243, 0.5)';
  ctx.lineWidth = 1;
  ctx.stroke();
}

// Draw trajectory with tech style
function drawTrajectory() {
  if (trajectory.length > 1) {
    // Draw main trajectory
    ctx.beginPath();
    ctx.moveTo(trajectory[0].x * scale, trajectory[0].y * scale);
    for (let i = 1; i < trajectory.length; i++) {
      ctx.lineTo(trajectory[i].x * scale, trajectory[i].y * scale);
    }
    ctx.strokeStyle = 'rgba(0, 188, 212, 0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw data points along trajectory
    for (let i = 0; i < trajectory.length; i += 5) {
      const point = trajectory[i];
      ctx.beginPath();
      ctx.arc(point.x * scale, point.y * scale, 1, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(33, 150, 243, 0.5)';
      ctx.fill();
    }
  }
}

// Update physics
function updatePhysics(dt) {
  projectile.vy += g * dt;
  projectile.x += projectile.vx * dt;
  projectile.y += projectile.vy * dt;
  projectile.time += dt;

  // Add data point
  if (Math.random() < 0.1) {
    dataPoints.push({
      x: projectile.x * scale,
      y: projectile.y * scale,
      time: projectile.time,
    });
  }

  // Remove old data points
  while (dataPoints.length > 50) {
    dataPoints.shift();
  }

  trajectory.push({
    x: projectile.x,
    y: projectile.y,
  });

  // Update statistics
  updateStats();
}

// Draw the simulation
function draw() {
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw tech grid
  drawGrid();

  // Draw ground
  ctx.beginPath();
  ctx.moveTo(0, canvas.height);
  ctx.lineTo(canvas.width, canvas.height);
  ctx.strokeStyle = '#424242';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Draw trajectory
  drawTrajectory();

  // Draw data points
  drawDataPoints();

  // Draw projectile
  drawProjectile(projectile.x * scale, projectile.y * scale);
}

// Animation loop
let lastTime = 0;
function animate(currentTime) {
  if (!isSimulating) return;

  // Calculate delta time in seconds
  const dt = (currentTime - lastTime) / 1000;
  lastTime = currentTime;

  // Update physics
  updatePhysics(dt);

  // Draw frame
  draw();

  // Check if projectile has hit the ground
  if (projectile.y * scale >= canvas.height) {
    isSimulating = false;
    return;
  }

  // Continue animation
  requestAnimationFrame(animate);
}

// Event listeners
startButton.addEventListener('click', () => {
  initSimulation();
  lastTime = performance.now();
  requestAnimationFrame(animate);
});
