document.addEventListener('DOMContentLoaded', main);

function main() {
  const SCREEN_WIDTH = 40;
  const SCREEN_HEIGHT = 20;

  const MAP_WIDTH = 16;
  const MAP_HEIGHT = 16;

  const DEPTH = 16;

  const FOV = Math.PI / 4;

  let map = `
  ################
  #..............#
  #..............#
  #..............#
  #...##.........#
  #..............#
  #..............#
  #.........######
  #..............#
  #..............#
  #..............#
  #..............#
  #..............#
  #..............#
  #..............#
  ################
  `;

  let screen = new Array(SCREEN_WIDTH * SCREEN_HEIGHT).fill('.');

  let player = {
    x: 8,
    y: 2,
    a: Math.PI / 5
  };

  function createScreen() {
    const screenEl = document.getElementById('screen');

    screen.forEach((char, i) => {
      if (i % SCREEN_WIDTH === 0) {
        const row = createRow(screen.slice(i, i + SCREEN_WIDTH), i);
        screenEl.appendChild(row);
      }
    });
  }

  function drawAt(id, text) {
    document.getElementById(id).innerHTML = text;
  }

  function createRow(rowArray, i) {
    const row = document.createElement('div');
    row.className = 'row';

    rowArray.forEach((e, j) => {
      const letter = document.createElement('div');
      letter.className = 'letter';
      letter.id = i + j;
      letter.appendChild(document.createTextNode(e));
      // debug
      // letter.appendChild(document.createTextNode(i + j));
      row.appendChild(letter);
    });

    return row;
  }

  function clear() {
    const parent = document.getElementById('screen');
    while (parent.firstChild) {
      parent.firstChild.remove();
    }
  }

  function draw() {
    for (let y = 0; y < SCREEN_HEIGHT; y++) {
      document.getElementById('screen').appendChild(createRow(screen.slice(y, y + SCREEN_HEIGHT)));
    }
  }

  function handleControls() {
    document.addEventListener('keypress', e => {
      if (e.key == 'a') {
        player.a -= 0.01;
      }

      if (e.key == 'd') {
        player.a += 0.01;
      }

      if (e.key == 'w') {
        player.x += 0.1;
      }

      if (e.key == 's') {
        player.x -= 0.1;
      }
    });
  }

  handleControls();
  createScreen();

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
          if (map[testY * MAP_WIDTH + testX] === '#') {
            hitWall = true;
          }
        }
      }

      const ceiling = SCREEN_HEIGHT / 2 - SCREEN_HEIGHT / distanceToWall;
      const floor = SCREEN_HEIGHT - ceiling;

      for (let y = 0; y < SCREEN_HEIGHT; y++) {
        if (y < ceiling) {
          screen[y * SCREEN_WIDTH + x] = ' ';
          drawAt(y * SCREEN_WIDTH + x, ' ');
        } else if (y > ceiling && y <= floor) {
          screen[y * SCREEN_WIDTH + x] = '#';
          drawAt(y * SCREEN_WIDTH + x, '#');
        } else {
          screen[y * SCREEN_WIDTH + x] = ' ';
          drawAt(y * SCREEN_WIDTH + x, ' ');
        }
      }

      // draw();
      // document.getElementById('screen').appendChild(createRow(screen.slice(x, x + SCREEN_WIDTH)));
    }
  }

  setInterval(loop, 40);
  // createScreen();
  // loop();
}
