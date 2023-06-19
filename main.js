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
    const isSpinning = false;

    triangles.push({
      x,
      y,
      directionX,
      directionY,
      color,
      isSpinning,
    });
  }

  // Function to draw a triangle
  const drawTriangle = (context, x, y, color) => {
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

  // Function to handle triangle click event
  const handleTriangleClick = (event) => {
    const { offsetX, offsetY } = event;

    triangles.forEach((triangle) => {
      const { x, y } = triangle;
      const halfSize = triangleSize / 2;

      // Check if the click is inside the triangle
      if (
        offsetX >= x - halfSize &&
        offsetX <= x + halfSize &&
        offsetY >= y - halfSize &&
        offsetY <= y + halfSize
      ) {
        triangle.isSpinning = !triangle.isSpinning; // Toggle spinning state
      }
    });
  };

  // Function to animate the sketch
  const animate = ({ context, width, height }) => {
    // Clear canvas
    context.clearRect(0, 0, width, height);

    // Draw triangles
    triangles.forEach((triangle) => {
      const { x, y, directionX, directionY, color, isSpinning } = triangle;

      // Update x position based on direction
      const speed = .5;
      const deltaX = directionX * speed;
      triangle.x += deltaX;

      // Reverse direction if triangle hits the canvas borders on the x-axis
      if (triangle.x < triangleSize || triangle.x > settings.dimensions[0] - triangleSize) {
        triangle.directionX *= -1;
      }

      // Update y position based on direction
      const deltaY = directionY * speed;
      triangle.y += deltaY;

      // Reverse direction if triangle hits the canvas borders on the y-axis
      if (triangle.y < triangleSize || triangle.y > settings.dimensions[1] - triangleSize) {
        triangle.directionY *= -1;
      }

      // Draw the triangle
      drawTriangle(context, x, y, color);

      // Rotate the triangle if spinning is enabled
      if (isSpinning) {
        context.translate(x, y);
        context.rotate(0.02);
        context.translate(-x, -y);
      }
    });
  };

  // Function to set up event listeners
  const setupEventListeners = ({ canvas }) => {
    canvas.addEventListener('click', handleTriangleClick);
  };

  return {
    render({ context, width, height }) {
      animate({ context, width, height });
    },
    resize() {},
    unload() {},
    setup({ context, width, height, canvas }) {
      setupEventListeners({ canvas });
    },
  };
};

canvasSketch(sketch, settings);
