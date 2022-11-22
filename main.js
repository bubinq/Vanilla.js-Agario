const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

const WIDTH = (canvas.width = window.innerWidth);
const HEIGHT = (canvas.height = window.innerHeight);
const MAX_FOOD = 100;
const MASS_RATIO = 50;
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
  }

  update() {
    this.draw();
    this.x += this.velocity.x;
    this.y += this.velocity.y;
    this.checkDistanceToMouse();
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
    if (distance - player.radius < 5) {
      this.isEaten = true;
    }
  }
}

generateFood();
let bestCandidate = getFarthestPos(food, 10);

let player = new Player(
  bestCandidate.x,
  bestCandidate.y,
  "Gosho",
  20,
  colors[Math.floor(Math.random() * colors.length)]
);
window.addEventListener("mousemove", movePlayer);
// ADD EVENTLISTENER FOR KEYPRESS === SPACE
// TAKE PLAYER RADIUS AND DIVIDE IT BY 2 ALSO MAKE ANOTHER COPY OF THE PLAYER WITH THE SAME SIZE

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
  return bestCandidate
}

function animate() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  player.update();
  food.forEach((foodPiece, idx) => {
    foodPiece.update();
    if (foodPiece.isEaten) {
      player.radius += foodPiece.mass;
      food.splice(idx, 1);
    }
  });
  requestAnimationFrame(animate);
}

animate();
