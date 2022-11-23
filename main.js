const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

const WIDTH = (canvas.width = window.innerWidth);
const HEIGHT = (canvas.height = window.innerHeight);
const MAX_FOOD = 300;
const MASS_RATIO = 10;
const MAX_CELLS = 8;
const INITIAL_RADIUS = 20;
const MAX_SPLIT_TIME = 20;
const mouseCoordinates = {
  x: 0,
  y: 0,
};
let food = [];

const colors = [
  "#FF5733",
  "#FFE333",
  "#83FF33",
  "#33ECFF",
  "#3352FF",
  "#AC33FF",
  "#FF3380",
];

class Player {
  constructor(x, y, name, radius, color) {
    this.x = x;
    this.y = y;
    this.name = name;
    this.radius = radius;
    this.color = color;
    this.velocity = {
      x: 0,
      y: 0,
    };
    this.cells = [];
    this.lastSplit = new Date().getTime();
  }

  update() {
    this.draw();
    this.x += this.velocity.x;
    this.y += this.velocity.y;
    this.checkDistanceToMouse();
    this.manageCellsMovement();
  }

  draw() {
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fill();
  }

  checkDistanceToMouse() {
    const distance = Math.hypot(
      this.y - mouseCoordinates.y,
      this.x - mouseCoordinates.x
    );
    if (distance - this.radius < 10) {
      this.velocity.x *= 0.95;
      this.velocity.y *= 0.95;
    }
  }

  manageCellsMovement() {
    this.cells.forEach((cell) => {
      const dist =
        Math.hypot(this.y - cell.y, this.x - cell.x) -
        cell.radius -
        this.radius;
      const deg = Math.atan2(
        mouseCoordinates.y - cell.y + cell.radius / 2,
        mouseCoordinates.x - cell.x + cell.radius / 2
      );
      const velocity = {
        x: Math.cos(deg),
        y: Math.sin(deg),
      };
      cell.velocity.x = velocity.x * (dist * 0.0112);
      cell.velocity.y = velocity.y * (dist * 0.0112);
    });
    for (let i = 0; i < this.cells.length; i++) {
      if (this.lastSplit < new Date().getTime() - 1000 * MAX_SPLIT_TIME) {
        const dist =
          Math.hypot(this.cells[i].x - this.x, this.cells[i].y - this.y) -
          this.radius -
          this.cells[i].radius;
        if (dist < -10) {
          this.radius += this.cells[i].radius;
          this.cells.splice(i, 1);
          break;
        }
      }
      for (let j = 1; j < this.cells.length; j++) {
        if (this.cells[j] !== undefined) {
          const dist = Math.hypot(
            this.cells[i].y - this.cells[j].y,
            this.cells[i].x - this.cells[j].x
          );
          if (
            dist !== 0 &&
            dist - this.cells[i].radius - this.cells[j].radius < 1
          ) {
            if (this.lastSplit > new Date().getTime() - 1000 * MAX_SPLIT_TIME) {
              if (this.cells[i].x > this.cells[j].x) {
                this.cells[j].x--;
              } else if (this.cells[i].x < this.cells[j].x) {
                this.cells[j].x++;
              }
              if (this.cells[i].y > this.cells[j].y) {
                this.cells[j].y--;
              } else if (this.cells[i].y < this.cells[j].y) {
                this.cells[j].y++;
              }
            } else {
              if (dist - this.cells[i].radius - this.cells[j].radius < -10) {
                this.cells[i].radius += this.cells[j].radius;
                this.cells.splice(j, 1);
              }
            }
          }
        }
      }
    }
  }
}

class Cell {
  constructor(x, y, radius, color) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = {
      x: 0,
      y: 0,
    };
  }
  update() {
    this.draw();
    this.x += this.velocity.x;
    this.y += this.velocity.y;
  }
  draw() {
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fill();
  }
}

class Food {
  constructor(x, y, radius, color) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.isEaten = false;
    this.mass = this.radius / MASS_RATIO;
  }
  update() {
    this.draw();
    this.checkIsEaten();
  }
  draw() {
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fill();
  }
  checkIsEaten() {
    const distance = Math.hypot(this.y - player.y, this.x - player.x);
    if (distance - player.radius < 1) {
      player.radius += this.mass;
      this.isEaten = true;
    }
    player.cells.forEach((cell) => {
      let cellDist =
        Math.hypot(this.y - cell.y, this.x - cell.x) -
        cell.radius -
        this.radius;
      if (cellDist < 1) {
        cell.radius += this.mass;
        this.isEaten = true;
      }
    });
  }
}

generateFood();
let bestCandidate = getFarthestPos(food, 10);

let player = new Player(
  bestCandidate.x,
  bestCandidate.y,
  "Gosho",
  INITIAL_RADIUS,
  colors[Math.floor(Math.random() * colors.length)]
);
window.addEventListener("mousemove", movePlayer);
window.addEventListener("keydown", splitCell);

function splitCell(ev) {
  const key = ev.code;
  if (key === "Space") {
    if (player.radius > INITIAL_RADIUS * 2 && player.cells.length < MAX_CELLS) {
      const mass = Math.round(player.radius / 2);
      player.radius -= mass;
      player.cells.push(new Cell(player.x, player.y, mass, player.color));
      player.lastSplit = new Date().getTime();
    }
  }
}

function movePlayer(ev) {
  const x = ev.clientX;
  const y = ev.clientY;

  mouseCoordinates.x = x;
  mouseCoordinates.y = y;

  let angleInRadiants = Math.atan2(
    y - player.y + player.radius / 2,
    x - player.x + player.radius / 2
  );

  const velocity = {
    x: Math.cos(angleInRadiants),
    y: Math.sin(angleInRadiants),
  };

  player.velocity.x = velocity.x / (player.radius * 0.05);
  player.velocity.y = velocity.y / (player.radius * 0.05);
}

function generateFood() {
  for (let i = 0; i < MAX_FOOD; i++) {
    let piece_of_food = new Food(
      Math.random() * WIDTH - 5,
      Math.random() * HEIGHT - 5,
      Math.max(3, Math.random() * 10),
      colors[Math.floor(Math.random() * colors.length)]
    );
    food.push(piece_of_food);
  }
}

function respawnFood() {
  let randomSpawn = Math.max(20, Math.round(Math.random() * 40));
  if (food.length + randomSpawn < MAX_FOOD) {
    for (i = 0; i <= randomSpawn; i++) {
      let newFood = new Food(
        Math.random() * WIDTH - 5,
        Math.random() * HEIGHT - 5,
        Math.max(3, Math.random() * 10),
        colors[Math.floor(Math.random() * colors.length)]
      );
      food.push(newFood);
    }
  }
}

setInterval(respawnFood, 5000);

function getFarthestPos(points, radius) {
  let bestCandidate,
    maxDistance = 0;
  let numOfCandidates = 10;

  if (points.length === 0) {
    return {
      x: Math.random() * WIDTH - radius,
      y: Math.random() * HEIGHT - radius,
    };
  }

  for (let ci = 0; ci < numOfCandidates; ci++) {
    let minDistance = Infinity;
    let candidate = {
      x: Math.random() * WIDTH - radius,
      y: Math.random() * HEIGHT - radius,
    };
    candidate.radius = radius;

    for (let pi = 0; pi < points.length; pi++) {
      let distance = Math.hypot(
        points[pi].y - candidate.y,
        points[pi].x - candidate.x
      );
      if (distance < minDistance) {
        minDistance = distance;
      }
    }
    if (minDistance > maxDistance) {
      bestCandidate = candidate;
      maxDistance = minDistance;
    }
  }
  return bestCandidate;
}

function animate() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  player.update();
  food.forEach((foodPiece, idx) => {
    foodPiece.update();
    if (foodPiece.isEaten) {
      food.splice(idx, 1);
    }
  });
  player.cells.forEach((cell) => {
    cell.update();
  });
  requestAnimationFrame(animate);
}

animate();
