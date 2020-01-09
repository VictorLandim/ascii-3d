const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// canvas.width = 2000;
// canvas.height = 1000;

ctx.mozImageSmoothingEnabled = false;
ctx.webkitImageSmoothingEnabled = false;
ctx.msImageSmoothingEnabled = false;
ctx.imageSmoothingEnabled = false;

// 50X25
const SCREEN_WIDTH = 120;
const SCREEN_HEIGHT = SCREEN_WIDTH / 2;
const GRID_SIZE = canvas.width / SCREEN_WIDTH;

const MAP_WIDTH = 16;
const MAP_HEIGHT = 16;

const DEPTH = 16;

const FOV = Math.PI / 4;

let map = "";
map += "################";
map += "#..............#";
map += "#..............#";
map += "#..............#";
map += "#..............#";
map += "#..............#";
map += "#..............#";
map += "#.........#....#";
map += "#..............#";
map += "#..............#";
map += "#..............#";
map += "#..............#";
map += "#..............#";
map += "#..............#";
map += "#..............#";
map += "################";

let screen = new Array(SCREEN_WIDTH, SCREEN_HEIGHT).fill(".");

let player = {
  x: 8,
  y: 8,
  a: Math.PI
};

drawGrid(canvas, ctx);
// fillGrid(canvas, ctx);

function drawGrid(canvas, ctx) {
  ctx.strokeStyle = "white";

  for (let x = 0; x < canvas.width; x += GRID_SIZE) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }

  for (let y = 0; y < canvas.height; y += GRID_SIZE) {
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
}

function fillGrid(canvas, ctx) {
  ctx.fillStyle = "white";
  ctx.strokeStyle = "white";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "33px monospace";

  for (let x = 1; x <= canvas.width; x += 2) {
    for (let y = 1; y <= canvas.height; y += 2) {
      ctx.fillText(`#`, (x / 2) * GRID_SIZE, (y / 2) * GRID_SIZE);
    }
  }
}
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "white";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `${SCREEN_WIDTH / 9}px monospace`;

  for (let i = 0; i < screen.length; i++) {
    const x = parseInt(i % SCREEN_WIDTH);
    const y = parseInt(i / SCREEN_WIDTH);

    ctx.fillText(
      screen[i],
      x * GRID_SIZE + GRID_SIZE / 2,
      y * GRID_SIZE + GRID_SIZE / 2
    );
  }
}

function handleControls() {
  document.addEventListener("keypress", e => {
    const ROTATION_SPEED = 0.05;
    const WALKING_SPEED = 0.3;

    if (e.key == "a") {
      player.a -= ROTATION_SPEED;
    }

    if (e.key == "d") {
      player.a += ROTATION_SPEED;
    }

    if (e.key == "w") {
      player.x += Math.sin(player.a) * WALKING_SPEED;
      player.y += Math.cos(player.a) * WALKING_SPEED;

      if (map[player.y * MAP_WIDTH + player.x] === "#") {
        player.x -= Math.sin(player.a) * WALKING_SPEED;
        player.y -= Math.cos(player.a) * WALKING_SPEED;
      }
    }

    if (e.key == "s") {
      player.x -= Math.sin(player.a) * WALKING_SPEED;
      player.y -= Math.cos(player.a) * WALKING_SPEED;

      if (map[player.y * MAP_WIDTH + player.x] === "#") {
        player.x += Math.sin(player.a) * WALKING_SPEED;
        player.y += Math.cos(player.a) * WALKING_SPEED;
      }
    }
  });
}

function loop() {
  for (let x = 0; x < SCREEN_WIDTH; x++) {
    const rayAngle = player.a - FOV / 2 + (x / SCREEN_WIDTH) * FOV;
    let distanceToWall = 0;
    let hitWall = false;

    const eyeX = Math.sin(rayAngle);
    const eyeY = Math.cos(rayAngle);

    while (!hitWall && distanceToWall < DEPTH) {
      distanceToWall += 0.1;

      const testX = parseInt(player.x + eyeX * distanceToWall);
      const testY = parseInt(player.y + eyeY * distanceToWall);

      if (testX < 0 || testX >= MAP_WIDTH || testY < 0 || testY >= MAP_HEIGHT) {
        hitWall = true;
        distanceToWall = DEPTH;
      } else {
        if (map[testY * MAP_WIDTH + testX] === "#") {
          hitWall = true;
        }
      }
    }

    const ceiling = SCREEN_HEIGHT / 2 - SCREEN_HEIGHT / distanceToWall;
    const floor = SCREEN_HEIGHT - ceiling;

    let shade = " ";

    // for reference
    const grayRamp =
      "$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/|()1{}[]?-_+~<>i!lI;:,\"^`'. ";

    if (distanceToWall <= DEPTH / 4) shade = "█";
    else if (distanceToWall < DEPTH / 3) shade = "▓";
    else if (distanceToWall < DEPTH / 2) shade = "▒";
    else if (distanceToWall < DEPTH) shade = "░";
    // if (distanceToWall <= DEPTH / 4) shade = "@";
    // else if (distanceToWall < DEPTH / 3) shade = "@";
    // else if (distanceToWall < DEPTH / 2) shade = "U";
    // else if (distanceToWall < DEPTH) shade = "t";
    else shade = " ";

    for (let y = 0; y < SCREEN_HEIGHT; y++) {
      if (y < ceiling) {
        screen[y * SCREEN_WIDTH + x] = " ";
      } else if (y > ceiling && y <= floor) {
        screen[y * SCREEN_WIDTH + x] = shade;
      } else {
        const b = 1 - (y - SCREEN_HEIGHT / 2) / (SCREEN_HEIGHT / 2);

        if (b < 0.25) shade = "#";
        else if (b < 0.5) shade = "x";
        else if (b < 0.75) shade = ".";
        else if (b < 0.9) shade = "-";
        else shade = " ";
        screen[y * SCREEN_WIDTH + x] = shade;
      }
    }
  }

  draw();
  requestAnimationFrame(loop);
}

handleControls();
loop();
