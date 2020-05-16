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

function drawLine(x1, y1, x2, y2, color) {
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.moveTo(x1 + 0.5, y1 + 0.5);
  ctx.lineTo(x2 + 0.5, y2 + 0.5);
  ctx.closePath();
  ctx.stroke();
}

function clipLine(x1, y1, x2, y2, clip) {
  if (y1 < y2) {
    x1 = [x2, (x2 = x1)][0];
    y1 = [y2, (y2 = y1)][0];
  }

  let dx = x2 - x1;
  let dy = y2 - y1;

  let clipY = clip - y1;

  let newX = (dx / dy) * clipY + x1;
  let newY = (dy / dy) * clipY + y1;

  if (y1 < clip) {
    drawLine(x1, y1, newX, newY, "#ff0000");
    drawLine(newX, newY, x2, y2, "#ffffff");
  } else {
    drawLine(x1, y1, newX, newY, "#ffffff");
    drawLine(newX, newY, x2, y2, "#ff0000");
  }
}

function clipLineVertical(v1, v2, clip) {
  if (v1.y1 > v2.y2) {
    v1 = [v2, (v2 = v1)][0];
  }

  let dx = v2.x - v1.x;
  let dy = v2.y - v1.y;
  let dz = v2.z - v1.z;

  let clipY = clip - v1.y;

  let newX = (dx / dy) * clipY + v1.x;
  let newY = (dy / dy) * clipY + v1.y;
  let newZ = (dz / dy) * clipY + v1.z;

  if (v1.y < clip) {
    drawLine(v1.x, v1.y, newX, newY, "#ff0000");
    drawLine(newX, newY, v2.x, v2.y, "#ffffff");
  } else {
    drawLine(v1.x, v1.y, newX, newY, "#ffffff");
    drawLine(newX, newY, v2.x, v2.y, "#ff0000");
  }
}

function clipLineHorizontal(v1, v2, clip) {
  if (v1.x1 > v2.x2) {
    v1 = [v2, (v2 = v1)][0];
  }

  let dx = v2.x - v1.x;
  let dy = v2.y - v1.y;
  let dz = v2.z - v1.z;

  let clipX = clip - v1.x;

  let newX = (dx / dx) * clipX + v1.x;
  let newY = (dy / dx) * clipX + v1.y;
  let newZ = (dz / dx) * clipX + v1.z;

  if (v1.x < clip) {
    drawLine(v1.x, v1.y, newX, newY, "#ff0000");
    drawLine(newX, newY, v2.x, v2.y, "#ffffff");
  } else {
    drawLine(v1.x, v1.y, newX, newY, "#ffffff");
    drawLine(newX, newY, v2.x, v2.y, "#ff0000");
  }
}

function draw() {
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  drawLine(100, 0, 100, CANVAS_HEIGHT, "#ffffff");
  clipLineHorizontal(new Vec3(50, 50, 0), new Vec3(150, 150, 0), 100);

  drawLine(0, CENTER_Y, CANVAS_WIDTH, CENTER_Y, "#ffffff");

  /*for (i = 0; i < rotated.length; i++) {
    let v1 = rotated[i];
    let v2 = rotated[(i + 1) % 4];

    if (Math.max(v1.y, v2.y) < CENTER_Y) {
    } else if (Math.min(v1.y, v2.y) > CENTER_Y) {
      drawLine(v1.x, v1.y, v2.x, v2.y, "#ffffff");
    } else {
      //clipLine(v1.x, v1.y, v2.x, v2.y, CENTER_Y);
      clipLineVertical(v1, v2, CENTER_Y);
    }
  }*/

  visiblePolys.map(vp => {
    for (i = 0; i < vp.length; i++) {
      let i1 = vp[i];
      let i2 = vp[(i + 1) % 4];

      let v1 = rotated[i1];
      let v2 = rotated[i2];

      if (Math.max(v1.y, v2.y) < CENTER_Y) {
      } else if (Math.min(v1.y, v2.y) > CENTER_Y) {
        drawLine(v1.x, v1.y, v2.x, v2.y, "#ffffff");
      } else {
        clipLine(v1.x, v1.y, v2.x, v2.y, CENTER_Y);
        clipLineVertical(v1, v2, CENTER_Y);
      }
    }
  });
}

function rotate() {
  let a = (Math.PI / 180.0) * (angle % 360.0);
  let s1 = Math.sin(a);
  let c1 = Math.cos(a);

  rotated = [];

  verts.map(v => {
    rotated.push(
      new Vec3(
        v.x * c1 - v.y * s1 + CENTER_X,
        v.y * c1 + v.x * s1 + CENTER_Y,
        v.z
      )
    );
  });

  angle++;
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
        rotVec._data[0] + CENTER_X,
        rotVec._data[1] + CENTER_Y,
        rotVec._data[2]
      )
    );
  });

  return rotatedVerts;
}

function backFaceCulling() {
  visiblePolys = [];
  polygons.map(p => {
    let v0 = rotated[p[0]];
    let v1 = rotated[p[1]];
    let v2 = rotated[p[2]];

    let a = (v1.x - v0.x) * (v2.y - v0.y) - (v2.x - v0.x) * (v1.y - v0.y);

    if (a < 0) visiblePolys.push(p);
  });
}

function buildLinesList() {
  linesToDraw = [];

  visiblePolys.map(vp => {
    for (i = 0; i < vp.length; i++) {
      let i1 = vp[i];
      let i2 = vp[(i + 1) % 4];

      if (!linesToDraw.includes([i1, i2])) linesToDraw.push([i1, i2]);
    }
  });
}

function drawLinesList() {
  linesToDraw.map(l => {
    let v1 = rotated[l[0]];
    let v2 = rotated[l[1]];

    if (Math.max(v1.y, v2.y) < CENTER_Y) {
    } else if (Math.min(v1.y, v2.y) > CENTER_Y) {
      drawLine(v1.x, v1.y, v2.x, v2.y, "#ffffff");
    } else {
      clipLine(v1.x, v1.y, v2.x, v2.y, CENTER_Y);
      clipLineVertical(v1, v2, CENTER_Y);
    }
  });
}

function animate() {
  requestAnimFrame(animate);

  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  drawLine(0, CENTER_Y, CANVAS_WIDTH, CENTER_Y, "#ffffff");

  //rotate();
  rotated = rotateMatrix(vertices, xAngle, yAngle, zAngle);
  xAngle += 0.2;
  yAngle += 0.2;
  zAngle += 0.2;

  backFaceCulling();
  buildLinesList();
  drawLinesList();

  //draw();

  ctx.fillStyle = "#00ff00";
  rotated.map(r => {
    ctx.fillRect(r.x - 2, r.y - 2, 4, 4);
  });
}

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const CANVAS_WIDTH = 640;
const CANVAS_HEIGHT = 400;
const CENTER_X = CANVAS_WIDTH / 2;
const CENTER_Y = CANVAS_HEIGHT / 2;

let angle = 0;

let xAngle = 0;
let yAngle = 0;
let zAngle = 0;

let visiblePolys = [];
let linesToDraw = [];

let vertices = [
  new Vec3(-100, -100, -100),
  new Vec3(100, -100, -100),
  new Vec3(100, 100, -100),
  new Vec3(-100, 100, -100),
  new Vec3(-100, -100, 100),
  new Vec3(100, -100, 100),
  new Vec3(100, 100, 100),
  new Vec3(-100, 100, 100)
];

let polygons = [
  [0, 1, 2, 3],
  [1, 5, 6, 2],
  [5, 4, 7, 6],
  [4, 0, 3, 7],
  [0, 4, 5, 1],
  [3, 2, 6, 7]
];

let rotated = [];

rotateMatrix();

animate();
