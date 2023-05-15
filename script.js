const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const redoButton = document.getElementById("redoButton");

let gameEnded = false;

function endGame() {
  redoButton.style.display = "block";
  redoButton.onclick = () => {
    document.location.reload();
  };
  gameEnded = true;
}

const spaceship = {
  x: canvas.width / 2,
  y: canvas.height - 30,
  width: 30,
  height: 30,
  speed: 5,
  img: new Image(),
  hp: 10,
};

spaceship.img.src = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png";

const keyState = {
  ArrowLeft: false,
  ArrowRight: false,
  ArrowUp: false,
  ArrowDown: false,
  Space: false,
};

const bullets = [];
const obstacles = [];

let score = 0;
let stage = 1;
let obstacleSpeed = 2;

function checkCollision(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function displayHP() {
  ctx.font = "16px Arial";
  ctx.fillStyle = "#FFF";
  ctx.fillText(`HP: ${spaceship.hp}`, canvas.width - 65, 20);
}

async function addObstacle() {
  const pokeID = Math.floor(Math.random() * 151) + 1;
  const response = await fetch(
    `https://pokeapi.co/api/v2/pokemon/${pokeID}`
  );
  const data = await response.json();
  const imgURL = data.sprites.other["official-artwork"].front_default;

  const width = 30;
  const height = 30;
  const x = Math.random() * (canvas.width - width);
  const img = new Image();
  img.src = imgURL;

  obstacles.push({
    x,
    y: 0,
    width,
    height,
    speed: obstacleSpeed,
    img: img
  });

  if (!gameEnded) {
    setTimeout(addObstacle, 2000 / stage);
  }
}

document.addEventListener("keydown", (event) => {
  if (gameEnded) {
    return;
  }

  if (keyState.hasOwnProperty(event.code)) {
    keyState[event.code] = true;
  }

  if (event.code === "Space") {
    bullets.push({
      x: spaceship.x + spaceship.width / 2,
      y: spaceship.y,
      radius: 4,
      speed: 6
    });
  }
});

document.addEventListener("keyup", (event) => {
  if (keyState.hasOwnProperty(event.code)) {
    keyState[event.code] = false;
  }
});

redoButton.onclick = () => {
  document.location.reload();
};

function gameLoop() {
  // 게임이 종료된 경우 게임 루프를 종료합니다.
  if (gameEnded) {
    return;
  }

  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Move spaceship
  if (keyState.ArrowLeft && spaceship.x > 0) {
    spaceship.x -= spaceship.speed;
  }
  if (keyState.ArrowRight && spaceship.x + spaceship.width < canvas.width) {
    spaceship.x += spaceship.speed;
  }
  if (keyState.ArrowUp && spaceship.y > 0) {
    spaceship.y -= spaceship.speed;
  }
  if (keyState.ArrowDown && spaceship.y + spaceship.height < canvas.height) {
    spaceship.y += spaceship.speed;
  }

  // Draw spaceship
  ctx.drawImage(spaceship.img, spaceship.x, spaceship.y, spaceship.width, spaceship.height);

  // Update and draw bullets
  bullets.forEach((bullet, index) => {
    bullet.y -= bullet.speed;
    ctx.beginPath();
    ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
    ctx.fillStyle = "#FFF";
    ctx.fill();
    ctx.closePath();

    // Bullet collision with obstacles
    obstacles.forEach((obstacle, obstacleIndex) => {
      if (checkCollision(bullet, obstacle)) {
        obstacles.splice(obstacleIndex, 1);
        bullets.splice(index, 1);
        score++;
      }
    });

    if (bullet.y < 0) {
      bullets.splice(index, 1);
    }
  });

  // Update and draw obstacles
  obstacles.forEach((obstacle, index) => {
    obstacle.y += obstacle.speed;
    ctx.drawImage(obstacle.img, obstacle.x, obstacle.y, obstacle.width, obstacle.height);

    // Obstacle collision with spaceship
    if (checkCollision(spaceship, obstacle)) {
      spaceship.hp -= 1;
      obstacles.splice(index, 1);

      if (spaceship.hp <= 0) {
        endGame();
      }
    }

    if (obstacle.y + obstacle.height > canvas.height) {
      obstacles.splice(index, 1);
      spaceship.hp -= 1;

      if (spaceship.hp <= 0) {
        endGame();
      }
    }
  });

  // Score and Stage display
  ctx.font = "16px Arial";
  ctx.fillStyle = "#FFF";
  ctx.fillText(`Score: ${score}`, 10, 20);
  ctx.fillText(`Stage: ${stage}`, 10, 40);
  displayHP();

  requestAnimationFrame(gameLoop);
}

addObstacle().then(() => {
  gameLoop();
});
