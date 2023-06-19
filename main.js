const canvasSketch = require('canvas-sketch');
const math = require('canvas-sketch-util/math');
const random = require('canvas-sketch-util/random');
const Colors = require('canvas-sketch-util/color');
const risoColors = require("riso-colors");

const settings = {
  dimensions: [2048, 2048]
};

/**
 * Main sketch function that generates the animated sketch
 * @param {Object} context - The canvas rendering context
 * @param {number} width - The width of the canvas
 * @param {number} height - The height of the canvas
 */
const sketch = ({ context, width, height }) => {
  // Set up variables for rectangle properties, colors, and mask
  let rectX, rectY, rectWidth, rectHeight, rectFill, rectStroke, rectBlend;
  const numRectangles = 50;
  const rotationDegree = -30;
  const rectangles = [];
  let shadowColor;
  const rectangleColors = [
    random.pick(risoColors),
    random.pick(risoColors),
    random.pick(risoColors)
  ];
  const backgroundColor = random.pick(risoColors).hex;
  const mask = {
    radius: width * 0.4,
    sides: 3,
    x: width * 0.5,
    y: height * 0.58
  };

  // Create random rectangles and store them in the rectangles array
  for (let i = 0; i < numRectangles; i++) {
    rectX = random.range(0, width);
    rectY = random.range(0, height);
    rectWidth = random.range(200, 600);
    rectHeight = random.range(40, 200);

    rectFill = random.pick(rectangleColors).hex;
    rectStroke = random.pick(risoColors).hex;
    rectBlend = (random.value() > 0.5) ? 'overlay' : 'source-over';

    rectangles.push({ x: rectX, y: rectY, width: rectWidth, height: rectHeight, stroke: rectStroke, fill: rectFill, blend: rectBlend });
  }

  /**
   * Render function that is called for each frame of the animation
   * @param {Object} context - The canvas rendering context
   * @param {number} width - The width of the canvas
   * @param {number} height - The height of the canvas
   */
  return ({ context, width, height }) => {
    // Set the background color
    context.fillStyle = backgroundColor;
    context.fillRect(0, 0, width, height);

    // Save the context state
    context.save();

    // Apply the mask by clipping the drawing area
    context.translate(mask.x, mask.y);
    drawPolygon({ context, radius: mask.radius, sides: mask.sides });
    context.clip();

    // Iterate over the rectangles array and draw each rectangle
    rectangles.forEach(rectangle => {
      const { x, y, width, height, stroke, fill, blend } = rectangle;

      context.save();
      context.translate(-mask.x, -mask.y);
      context.translate(x, y);

      // Set styles for the rectangle
      context.lineWidth = 10;
      context.globalCompositeOperation = blend;
      context.strokeStyle = stroke;
      context.fillStyle = fill;

      drawSkewedRect({ context, width, height, degree: rotationDegree });

      // Set shadow color and offset
      shadowColor = Colors.offsetHSL(fill, 0, 0, -20);
      shadowColor.rgba[3] = 0.5;
      context.shadowColor = Colors.style(shadowColor.rgba);
      context.shadowOffsetX = -10;
      context.shadowOffsetY = 20;

      // Fill the rectangle
      context.fill();

      // Reset shadow settings and stroke the rectangle
      context.shadowColor = null;
      context.stroke();

      // Reset global composite operation and stroke style
      context.globalCompositeOperation = 'source-over';
      context.lineWidth = 2;
      context.strokeStyle = 'black';
      context.stroke();

      context.restore();
    });

    context.restore();

    // Draw another polygon shape with a different blending mode
    context.save();
    context.translate(mask.x, mask.y);
    context.lineWidth = 15;
    drawPolygon({ context, radius: mask.radius - context.lineWidth, sides: mask.sides });
    context.globalCompositeOperation = 'color-burn';
    context.strokeStyle = rectangleColors[0].hex;
    context.stroke();
    context.restore();
  };
};

/**
 * Function to draw a skewed rectangle
 * @param {Object} context - The canvas rendering context
 * @param {number} width - The width of the rectangle
 * @param {number} height - The height of the rectangle
 * @param {number} degree - The angle of rotation in degrees
 */
const drawSkewedRect = ({ context, width = 600, height = 200, degree = -45 }) => {
  const angle = math.degToRad(degree);
  const rx = Math.cos(angle) * width;
  const ry = Math.sin(angle) * width;

  context.save();
  context.translate(rx * -0.5, (ry + height) * -0.5);

  context.beginPath();
  context.moveTo(0, 0);
  context.lineTo(rx, ry);
  context.lineTo(rx, ry + height);
  context.lineTo(0, height);
  context.closePath();
  context.stroke();

  context.restore();
};

/**
 * Function to draw a polygon shape
 * @param {Object} context - The canvas rendering context
 * @param {number} radius - The radius of the polygon
 * @param {number} sides - The number of sides of the polygon
 */
const drawPolygon = ({ context, radius = 100, sides = 3 }) => {
  const slice = Math.PI * 2 / sides;
  context.beginPath();
  context.moveTo(0, -radius);
  for (let i = 0; i < sides; i++) {
    const theta = i * slice - Math.PI * 0.5;
    context.lineTo(Math.cos(theta) * radius, Math.sin(theta) * radius);
  }
  context.closePath();
};

// Start the animation
canvasSketch(sketch, settings);
