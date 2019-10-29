import "./styles.css";

const debug = (() => {
  const _d = document.getElementById("debug");
  return info => {
    _d.innerText = info;
  };
})();

const canvas = document.getElementById("app");
const ctx = canvas.getContext("2d");

// --Stuff to edit--
let squareSize = 50;
let pathWidth = 4;
let timeDelta = 1;
let canvasHeight = 600;
let canvasWidth = 600;
canvas.height = canvasHeight + squareSize;
canvas.width = canvasWidth + squareSize;
const colors = ["green", "blue", "orange", "red"];
const choice = arr => arr[Math.floor(Math.random() * arr.length)];
// --End Stuff to edit--

function* colorGenerator() {
  function RGB2Color(r, g, b) {
    return `rgb(${Math.round(r)}, ${Math.round(g)},${Math.round(b)})`;
  }
  var i = 0;
  var frequency = 0.1;
  while (true) {
    const red = Math.sin(frequency * i + 0) * 127 + 128;
    const green = Math.sin(frequency * i + 2) * 127 + 128;
    const blue = Math.sin(frequency * i + 4) * 127 + 128;
    i += 1;
    yield RGB2Color(red, green, blue);
  }
}
const color = colorGenerator();

const squaresWide = canvasWidth / squareSize;
const squaresHigh = canvasHeight / squareSize;
function* drawStepGenerator() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
  ctx.strokeRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < squaresHigh; i++) {
    const y = getP(i);
    for (let j = 0; j < squaresWide; j++) {
      const x = getP(j);
      const outcome = Math.random();
      if (outcome < 0.5) {
        drawForwardSlash(x, y);
      } else {
        drawBackwardSlash(x, y);
      }
      if (!immediate) {
        yield;
      }
    }
  }
  /**
   * A 1-d coord within the canvas
   * @param {*} i
   */
  function getP(i) {
    return i * squareSize + squareSize / 2;
  }

  function drawForwardSlash(x, y) {
    ctx.beginPath();
    ctx.strokeStyle = choice(colors);
    ctx.lineWidth = pathWidth;
    ctx.moveTo(x, y);
    ctx.lineTo(x + squareSize, y + squareSize);
    ctx.stroke();
  }

  function drawBackwardSlash(x, y) {
    ctx.beginPath();
    ctx.strokeStyle = choice(colors);
    ctx.lineWidth = pathWidth;
    ctx.moveTo(x + squareSize, y);
    ctx.lineTo(x, y + squareSize);
    ctx.stroke();
  }
}

function drawGrid() {
  ctx.beginPath();
  ctx.strokeStyle = "green";
  ctx.lineWidth = 1;
  for (var i = squareSize; i < squaresWide * squareSize; i += squareSize) {
    for (var j = squareSize; j < squaresHigh * squareSize; j += squareSize) {
      ctx.strokeRect(i, j, squareSize, squareSize);
    }
  }
}

function* drawMazeGenerator(immediate = false) {
  const unvisited = new Set();
  const stack = [];
  for (var i = 0; i < squaresHigh; i++) {
    for (var j = 0; j < squaresWide; j++) {
      unvisited.add(`${j} ${i}`);
    }
  }
  let currCell = `${Math.floor(Math.random() * squaresWide)} ${Math.floor(
    Math.random() * squaresHigh
  )}`;
  unvisited.delete(currCell);
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawGrid();
  while (unvisited.size !== 0) {
    const unvisitedNeighbors = getUnvisitedNeighbors(currCell);
    if (unvisitedNeighbors.length !== 0) {
      if (unvisitedNeighbors.length > 1) {
        stack.push(currCell);
      }
      const toVisit = choice(unvisitedNeighbors);
      unvisited.delete(toVisit);
      draw(currCell, toVisit);
      currCell = toVisit;
      if (!immediate) yield;
    } else if (stack.length !== 0) {
      while (stack.length && getUnvisitedNeighbors(currCell).length === 0) {
        currCell = stack.pop();
      }
    }
  }
  function draw(from, to) {
    ctx.beginPath();
    ctx.strokeStyle = color.next().value;
    ctx.lineWidth = pathWidth;
    ctx.lineTo(...scaled(toInt(from)));
    ctx.lineTo(...scaled(toInt(to)));
    ctx.stroke();
  }
  function scaled(arr) {
    return arr.map(v => v * squareSize + squareSize);
  }
  function toInt(cell) {
    return cell.split(" ").map(v => parseInt(v, 10));
  }
  function getUnvisitedNeighbors(currCell) {
    const [x, y] = toInt(currCell);
    const neighbors = [];
    if (x !== 0 && unvisited.has(`${x - 1} ${y}`))
      neighbors.push(`${x - 1} ${y}`);
    if (y !== 0 && unvisited.has(`${x} ${y - 1}`))
      neighbors.push(`${x} ${y - 1}`);
    if (x !== squaresWide - 1 && unvisited.has(`${x + 1} ${y}`))
      neighbors.push(`${x + 1} ${y}`);
    if (y !== squaresHigh - 1 && unvisited.has(`${x} ${y + 1}`))
      neighbors.push(`${x} ${y + 1}`);
    return neighbors;
  }
}

let running;
let immediate = false;
let generator = drawMazeGenerator;
function drawMaze() {
  // let iter = drawStepGenerator();
  let iter = generator(immediate);
  running = setInterval(() => {
    const { done } = iter.next();
    if (done) {
      running = clearInterval(running);
      debug("Done!");
    }
  }, timeDelta);
}
const restartButton = document.getElementById("restart");
const toggleImmediate = document.getElementById("toggle");
const selector = document.getElementById("selector");
restartButton.onclick = () => {
  if (running) {
    running = clearInterval(running);
  }
  drawMaze();
};
toggleImmediate.onclick = () => {
  immediate = !immediate;
  toggleImmediate.innerHTML = immediate ? "Immediate" : "Generative";
};
selector.onclick = () => {
  generator =
    generator === drawMazeGenerator ? drawStepGenerator : drawMazeGenerator;
  selector.innerHTML = generator === drawMazeGenerator ? "Maze" : "Step-BASIC";
};
drawMaze();
