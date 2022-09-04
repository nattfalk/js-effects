class Vec3 {
  constructor(x, y, z) {
    this.x = x != null ? x : 0;
    this.y = y != null ? y : 0;
    this.z = z != null ? z : 0;
  }
}

window.requestAnimFrame = (function() {
  return (
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    function(callback) {
      window.setTimeout(callback, 1000 / 60);
    }
  );
})();

function setDot(x1, y1, radius, color) {
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.arc(x1, y1, radius, 0, Math.PI*2, true);
  ctx.fillStyle = color;
  ctx.fill();
}

function rotateMatrix(verts, pitch, yaw, roll) {
  verts = verts || [];

  let rad = (Math.PI / 180.0) * (pitch % 360.0);
  const xMat = math.matrix([
    [1, 0, 0],
    [0, Math.cos(rad), -Math.sin(rad)],
    [0, Math.sin(rad), Math.cos(rad)]
  ]);

  rad = (Math.PI / 180.0) * (yaw % 360.0);
  const yMat = math.matrix([
    [Math.cos(rad), 0, Math.sin(rad)],
    [0, 1, 0],
    [-Math.sin(rad), 0, Math.cos(rad)]
  ]);

  rad = (Math.PI / 180.0) * (roll % 360.0);
  const zMat = math.matrix([
    [Math.cos(rad), -Math.sin(rad), 0],
    [Math.sin(rad), Math.cos(rad), 0],
    [0, 0, 1]
  ]);

  let rotMat = math.multiply(zMat, yMat, xMat);

  let rotatedVerts = [];

  verts.map(v => {
    let rotVec = math.multiply([v.x, v.y, v.z], rotMat);
    rotatedVerts.push(
      new Vec3(
        (rotVec._data[0] / ((rotVec._data[2] + 350) / 200)) + CENTER_X,
        (rotVec._data[1] / ((rotVec._data[2] + 350) / 200)) + CENTER_Y,
        rotVec._data[2]
      )
    );
  });

  return rotatedVerts;
}

function animate() {
  requestAnimFrame(animate);

  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  
  rotated = rotateMatrix(vertices, xAngle, yAngle, zAngle);
  xAngle += 0.6;
  yAngle += 0.5;
  zAngle += 0.8;
  
  const morphValue = +document.getElementById('morphValue').value;
  rotated.map((v,i) => {
    const x = v.x + ((destCoords[i].x - v.x) / 100.0) * morphValue;
    const y = v.y + ((destCoords[i].y - v.y) / 100.0) * morphValue;

    // setDot(x, y, DOT_RADIUS, "#ffffff");
    // setDot(v.x, v.y, DOT_RADIUS, "#ffffff");
    setDot(x, y, 10-((v.z + 200)/100 + (DOT_RADIUS*0.4)), "#ffffff");
  });
}

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const CANVAS_WIDTH = 640;
const CANVAS_HEIGHT = 400;
const CENTER_X = CANVAS_WIDTH / 2;
const CENTER_Y = CANVAS_HEIGHT / 2;
const DOT_RADIUS = 8;
const DOT_DIAMETER = DOT_RADIUS * 2;

let xAngle = 0;
let yAngle = 0;
let zAngle = 0;

const vertices = [
  new Vec3(-100, -100, -100),
  new Vec3(100, -100, -100),
  new Vec3(100, 100, -100),
  new Vec3(-100, 100, -100),
  new Vec3(-100, -100, 100),
  new Vec3(100, -100, 100),
  new Vec3(100, 100, 100),
  new Vec3(-100, 100, 100)
];
let rotated = [];

const destCoords = [];
for (var i=0; i<8; i++) {
  destCoords.push(new Vec3((CANVAS_WIDTH/2)-(4*DOT_DIAMETER) + (i*DOT_DIAMETER), CANVAS_HEIGHT/2, 0));
}

animate();
