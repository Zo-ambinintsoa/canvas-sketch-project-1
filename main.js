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
    const x = random.range(triangleSize, settings.dimensions[0] - triangleSize);
    const y = random.range(triangleSize, settings.dimensions[1] - triangleSize);
    const directionX = random.pick([-1, 1]);
    const directionY = random.pick([-1, 1]);
    const color = random.pick(risoColors).hex;
    let rotationSpeed = random.range(0.1, 0.5);

    triangles.push({
      x,
      y,
      directionX,
      directionY,
      color,
      isSpinning: false,
      rotation: 0,
      rotationSpeed,
    });
  }

  const drawTriangle = (context, triangle) => {
    const { x, y, directionX, directionY, color, isSpinning, rotation, rotationSpeed } = triangle;

    // Update x position based on direction
    const speed = 100;
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

    // Apply spinning rotation if enabled
    if (isSpinning) {
      triangle.rotation += rotationSpeed;
    }

    // Draw triangle
    const halfSize = triangleSize / 2;
    context.save();
    context.translate(x, y);
    context.rotate(rotation);
    context.beginPath();
    context.moveTo(0, -halfSize);
    context.lineTo(halfSize, halfSize);
    context.lineTo(-halfSize, halfSize);
    context.closePath();

    // Set triangle fill style
    context.fillStyle = color;
    context.fill();

    context.restore();
  };

  const handleTriangleClick = (event) => {
    const { offsetX, offsetY } = event;

    triangles.forEach((triangle) => {
      const { x, y, isSpinning } = triangle;
      const halfSize = triangleSize / 2;

      // Check if the click is inside the triangle
      if (
        offsetX >= x - halfSize &&
        offsetX <= x + halfSize &&
        offsetY >= y - halfSize &&
        offsetY <= y + halfSize
      ) {
        triangle.color = random.pick(risoColors).hex; // Change color when clicked
        triangle.isSpinning = !isSpinning; // Toggle spinning state
      }
    });
  };

  return ({ context, width, height }) => {
    // Clear canvas
    context.clearRect(0, 0, width, height);

    // Add event listener to canvas
    context.canvas.addEventListener('click', handleTriangleClick);

    // Draw triangles
    triangles.forEach((triangle) => {
      drawTriangle(context, triangle);
    });
  };
};

canvasSketch(sketch, settings);
