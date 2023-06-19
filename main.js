const canvasSketch = require('canvas-sketch');
const random = require('canvas-sketch-util/random');
const risoColors = require('riso-colors');
const poissonDiskSampling = require('poisson-disk-sampling');

const settings = {
  dimensions: [800, 800],
  animate: true,
  duration: Infinity,
};

const sketch = () => {
  const shapeCount = 40;
  const shapeMinSides = 3;
  const shapeMaxSides = 9;
  const shapeMinSize = 20;
  const shapeMaxSize = 100;
  const shapeRadius = shapeMaxSize / 2;
  const stopSpinningTime = 10000; // 10 seconds in milliseconds

  const shapes = [];

  // Generate random shapes using Poisson Disk Sampling
  const pds = new poissonDiskSampling({
    shape: [settings.dimensions[0], settings.dimensions[1]],
    minDistance: shapeMaxSize,
    maxDistance: shapeMaxSize * 2,
    tries: 10,
  });

  const points = pds.fill();
  for (let i = 0; i < shapeCount; i++) {
    const point = points.pop();
    if (!point) break;

    const x = point[0];
    const y = point[1];
    const sides = random.range(shapeMinSides, shapeMaxSides + 1);
    const size = random.range(shapeMinSize, shapeMaxSize + 1);
    const direction = random.pick([-1, 1]);
    const fillColor = random.pick(risoColors).hex;
    const strokeColor = random.pick(risoColors).hex;
    const rotationSpeed = random.range(0.1, 0.5);
    const velocity = [random.range(-1, 1), random.range(-1, 1)];
    let timer = stopSpinningTime;
    let isSpinning = false;

    shapes.push({
      position: [x, y],
      sides,
      size,
      direction,
      fillColor,
      strokeColor,
      rotation: 0,
      rotationSpeed,
      velocity,
      timer,
      isSpinning,
    });
  }

  const createShapePath = (shape) => {
    const { sides, size } = shape;

    const path = new Path2D();
    const radius = size / 2;
    const angle = (Math.PI * 2) / sides;

    path.moveTo(radius, 0);

    for (let i = 1; i < sides; i++) {
      const x = radius * Math.cos(angle * i);
      const y = radius * Math.sin(angle * i);
      path.lineTo(x, y);
    }

    path.closePath();

    return path;
  };

  const updateShape = (shape, index) => {
    const { position, size, velocity, rotationSpeed, timer, isSpinning } = shape;

    // Update position based on velocity
    const speed = 0.1;
    position[0] += velocity[0] * speed;
    position[1] += velocity[1] * speed;

    // Reverse direction if shape hits the canvas borders
    const minX = shapeRadius;
    const maxX = settings.dimensions[0] - shapeRadius;
    const minY = shapeRadius;
    const maxY = settings.dimensions[1] - shapeRadius;

    const radius = size / 2;
    const borderMinX = position[0] - radius;
    const borderMaxX = position[0] + radius;
    const borderMinY = position[1] - radius;
    const borderMaxY = position[1] + radius;

    if (borderMinX < minX || borderMaxX > maxX) {
      velocity[0] *= -1;
    }

    if (borderMinY < minY || borderMaxY > maxY) {
      velocity[1] *= -1;
    }

    // Check for collisions with other shapes
    for (let i = index + 1; i < shapes.length; i++) {
      const otherShape = shapes[i];
      const otherRadius = otherShape.size / 2;
      const otherBorderMinX = otherShape.position[0] - otherRadius;
      const otherBorderMaxX = otherShape.position[0] + otherRadius;
      const otherBorderMinY = otherShape.position[1] - otherRadius;
      const otherBorderMaxY = otherShape.position[1] + otherRadius;

      if (
        borderMaxX > otherBorderMinX &&
        borderMinX < otherBorderMaxX &&
        borderMaxY > otherBorderMinY &&
        borderMinY < otherBorderMaxY
      ) {
        // Collision detected, reverse velocities
        velocity[0] *= -1;
        velocity[1] *= -1;
        otherShape.velocity[0] *= -1;
        otherShape.velocity[1] *= -1;
      }
    }

    // Apply spinning rotation if enabled
    if (isSpinning) {
      shape.rotation += rotationSpeed;
    }

    // Update timer only if shape is spinning
    if (isSpinning) {
      shape.timer -= 1000 / 60; // Assuming 60 FPS
      if (shape.timer <= 0) {
        shape.rotationSpeed *= 0.95; // Gradually decrease rotation speed
        if (shape.rotationSpeed < 0.01) {
          shape.rotationSpeed = 0; // Stop spinning when rotation speed is very low
        }
      }
    }
  };

  const drawShape = (context, shape) => {
    const { position, size, fillColor, strokeColor, rotation } = shape;

    // Create shape path
    const shapePath = createShapePath(shape);

    // Draw shape
    context.save();
    context.translate(position[0], position[1]);
    context.rotate(rotation);
    context.fillStyle = fillColor;
    context.strokeStyle = strokeColor;
    context.lineWidth = 2;
    context.fill(shapePath);
    context.stroke(shapePath);
    context.restore();
  };

  const handleShapeClick = (event) => {
    const { offsetX, offsetY } = event;

    shapes.forEach((shape) => {
      const { position, size, timer } = shape;
      const radius = size / 2;
      const borderMinX = position[0] - radius;
      const borderMaxX = position[0] + radius;
      const borderMinY = position[1] - radius;
      const borderMaxY = position[1] + radius;

      // Check if the click is inside the shape's border
      if (
        offsetX >= borderMinX &&
        offsetX <= borderMaxX &&
        offsetY >= borderMinY &&
        offsetY <= borderMaxY
      ) {
        shape.fillColor = random.pick(risoColors).hex; // Change fill color when clicked
        shape.rotationSpeed = random.range(0.1, 0.5); // Randomize rotation speed
        shape.rotation = 0; // Reset rotation
        shape.timer = stopSpinningTime; // Reset timer
        shape.isSpinning = !shape.isSpinning; // Start spinning
      }
    });
  };

  return ({ context, width, height }) => {
    // Clear canvas
    context.clearRect(0, 0, width, height);

    // Add event listener to canvas
    context.canvas.addEventListener('click', handleShapeClick);

    // Update and draw shapes
    shapes.forEach((shape, index) => {
      updateShape(shape, index);
      drawShape(context, shape);
    });
  };
};

canvasSketch(sketch, settings);
