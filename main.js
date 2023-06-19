const canvasSketch = require('canvas-sketch');
const math = require('canvas-sketch-util/math');
const random = require('canvas-sketch-util/random');
const Colors = require('canvas-sketch-util/color');
const risoColors = require("riso-colors");
const settings = {
  dimensions: [ 2048, 2048 ]
};

const sketch = ({ context, width, height }) => {
  // random.setSeed('domestika')
  let x, y, w, h,fill ,stroke , blend ;
  const num = 50 ;
  const degree = -30;
  const rects = [];
  let shadowColor
  const rectColor = [
    random.pick(risoColors),
    random.pick(risoColors),
    random.pick(risoColors)
  ];
  const bgColor = random.pick(risoColors).hex
  const mask = {
    radius: width * 0.4,
    sides: 3,
    x: width * 0.5,
    y: height * 0.58
  }
  for (let i = 0; i < num; i++) {
    x = random.range(0, width);
    y = random.range(0, height);
    w = random.range(200, 600);
    h = random.range(40, 200);

    fill = random.pick(rectColor).hex;
    stroke = random.pick(risoColors).hex;
    blend = (random.value() > 0.5) ? 'overlay' : 'source-over'
  
    rects.push({x, y, w, h, stroke, fill, blend})  
    }
  return ({ context, width, height }) => {
    context.fillStyle = bgColor;
    context.fillRect(0, 0, width, height);
  
    context.save();

    context.translate(mask.x, mask.y);
    drawPolygone({context, radius: mask.radius, sides: mask.sides})
    context.clip();
    


    rects.forEach( rect => {
    const { x, y, w, h, stroke , fill, blend} = rect;
    context.save();
    context.translate(- mask.x, - mask.y);
     
    context.translate(x, y);
    context.lineWidth=10;
    
    context.globalCompositeOperation=blend;
    context.strokeStyle = stroke;
    context.fillStyle= fill;
    

    drawSkewedRect({context, w, h, degree})
      shadowColor = Colors.offsetHSL(fill, 0, 0, -20);
      shadowColor.rgba[3] = 0.5;
    context.shadowColor= Colors.style(shadowColor.rgba);
    context.shadowOffsetX=-10;
    context.shadowOffsetY=20;
    
    context.fill();

    context.shadowColor= null;
    context.stroke();

    context.globalCompositeOperation='source-over';
      context.lineWidth=2;
      context.strokeStyle='black';
      context.stroke();
    context.restore();
    });
    context.restore();
    
    context.save();
    context.translate(mask.x, mask.y);
    context.lineWidth=15;

    drawPolygone({context, radius: mask.radius - context.lineWidth, sides: mask.sides})
    context.globalCompositeOperation='color-burn';
    
    context.strokeStyle=rectColor[0].hex;
    context.stroke();
    context.restore();
    
  };
};

const drawSkewedRect = ({context , w = 600, h = 200, degree = -45}) => {
  const angle = math.degToRad(degree);
  const rx = Math.cos(angle) * w;
  const ry = Math.sin(angle) * w;
  
  context.save();
  context.translate(rx* -0.5, (ry + h) * -0.5);
  
    context.beginPath();
    context.moveTo(0,0);
    context.lineTo(rx,ry);
    context.lineTo(rx ,ry + h);
    context.lineTo(0,h);
    context.closePath();
    context.stroke();
  
  context.restore();

}
const drawPolygone = ({context, radius = 100, sides = 3}) => {
  const slice = Math.PI * 2 / sides;
  context.beginPath();
  context.moveTo(0, -radius);
  for (let i = 0; i < sides; i++) {
    const theta = i * slice - Math.PI * 0.5;
    context.lineTo(Math.cos(theta) * radius, Math.sin(theta) * radius);
  }
  context.closePath();
};
canvasSketch(sketch, settings);
