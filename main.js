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

  const triangles = [];

  // Generate random triangles
  for (let i = 0; i < triangleCount; i++) {
    const x = random.range(triangleSize, settings.dimensions[0] - triangleSize); // Randomize x position within canvas bounds
    const y = random.range(triangleSize, settings.dimensions[1] - triangleSize); // Randomize y position within canvas bounds
    const directionX = random.pick([-1, 1]); // Randomly determine the initial direction on the x-axis
    const directionY = random.pick([-1, 1]); // Randomly determine the initial direction on the y-axis
    const color = random.pick(risoColors).hex;

    triangles.push({
      x,
      y,
      directionX,
      directionY,
      color,
    });
  }

  const drawTriangle = (context, triangle) => {
    const { x, y, directionX, directionY, color } = triangle;

    // Update x position based on direction
    const speed = 100; // Adjust the speed of the animation
    const deltaX = directionX * speed / settings.dimensions[0];
    triangle.x += deltaX;

    // Reverse direction if triangle hits the canvas borders on the x-axis
    if (triangle.x < triangleSize || triangle.x > settings.dimensions[0] - triangleSize) {
      triangle.directionX *= -1;
    }

    // Update y position based on direction
    const deltaY = directionY * speed / settings.dimensions[1];
    triangle.y += deltaY;

    // Reverse direction if triangle hits the canvas borders on the y-axis
    if (triangle.y < triangleSize || triangle.y > settings.dimensions[1] - triangleSize) {
      triangle.directionY *= -1;
    }

    // Draw triangle
    const halfSize = triangleSize / 2;
    context.beginPath();
    context.moveTo(x, y - halfSize);
    context.lineTo(x + halfSize, y + halfSize);
    context.lineTo(x - halfSize, y + halfSize);
    context.closePath();

    // Set triangle fill style
    context.fillStyle = color;
    context.fill();
  };

  return ({ context, width, height }) => {
    // Clear canvas
    context.clearRect(0, 0, width, height);

    // Draw triangles
    triangles.forEach((triangle) => {
      drawTriangle(context, triangle);
    });
  };
};

canvasSketch(sketch, settings);
