const canvasSketch = require('canvas-sketch');
const random = require('canvas-sketch-util/random');
const risoColors = require('riso-colors');

const settings = {
  dimensions: [800, 800],
  animate: true,
  duration: Infinity,
};

const sketch = () => {
  const triangleCount = 40;
  const triangleSize = 50;
  const startY = settings.dimensions[1] / 2 - triangleSize / 2; // Y position of the triangles

  const triangles = [];

  // Generate random triangles
  for (let i = 0; i < triangleCount; i++) {
    const x = random.range(0, settings.dimensions[0]);
    const direction = random.sign(); // Randomly determine the initial direction of the triangle
    const color = random.pick(risoColors).hex;

    triangles.push({
      x,
      direction,
      color,
    });
  }

  return ({ context, width, height, time }) => {
    // Clear canvas
    context.clearRect(0, 0, width, height);

    // Draw triangles
    triangles.forEach((triangle) => {
      const { x, direction, color } = triangle;

      // Update x position based on direction and time
      const speed = 100; // Adjust the speed of the animation
      const xOffset = direction * speed * time;

      // Calculate triangle coordinates
      const triangleX = x + xOffset;
      const triangleY = startY;
      const halfSize = triangleSize / 2;

      // Draw triangle
      context.beginPath();
      context.moveTo(triangleX, triangleY - halfSize);
      context.lineTo(triangleX + halfSize, triangleY + halfSize);
      context.lineTo(triangleX - halfSize, triangleY + halfSize);
      context.closePath();

      // Set triangle fill style
      context.fillStyle = color;
      context.fill();
    });
  };
};

canvasSketch(sketch, settings);
