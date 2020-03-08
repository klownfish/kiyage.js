//define layers
const PLAYER_DRAW = 5;
const ENEMY_DRAW = 4;
const BULLET_DRAW = 3;

const PLAYER_COLL = 5;
const ENEMY_COLL = 4;

//create a new world on the canvas
let canvas = document.getElementById('canvas');
let world = new World(canvas);
world.background = "black";

//create game loop
function updateGame() {
  world.update();
  world.draw();
  requestAnimationFrame(updateGame);
}
requestAnimationFrame(updateGame);



//create a player class that extends PhysicsBody
//because we want collision detection
class Player extends PhysicsBody {
  constructor(world) {
    super(world); //  pass world to the parent class

    //hitbox that is a 50x80 rectangle
    this.hitbox = new Hitbox(0, 0, 50, 80);

    this.speed = 300;  //  movement speed
    this.shootCooldown = 0.2;  //  fire rate
    this.shootTimer = 0;  //  timer for fire rate
    this.health = 5;  //  how many bullets the player can take

    //add the Player to update
    this.addToUpdate();

    //add it to be drawn on the PLAYER_DRAW layer
    this.addToDraw(PLAYER_DRAW);

    //make it collide on the PLAYER_COLL layer
    this.addToCollision(PLAYER_COLL);
  }

  //create the update function
  //delta is the time that the last frame took to render
  //if you multiply all changes with it the game 
  //will run the same on different frame rates
  update(delta) {
    //handle input, and store it in a Vector
    let movementVector = new Vector(0, 0)
    if (util.keyboard["ArrowUp"]) {
      movementVector.y -= 1;
    }
    if (util.keyboard["ArrowDown"]) {
      movementVector.y += 1;
    }
    if (util.keyboard["ArrowLeft"]) {
      movementVector.x -= 1;
    }
    if (util.keyboard["ArrowRight"]) {
      movementVector.x += 1;
    }

    //normalize the vector so that the player 
    //doesn't move faster diagonally
    movementVector.normalize();

    //multiply with delta so it remaines consistent
    this.x += movementVector.x * this.speed * delta;
    this.y += movementVector.y * this.speed * delta;

    //clamp the position to a valid place on the canvas
    this.x = Math.min(this.canvas.width - 50,
      Math.max(this.x, 0));
    this.y = Math.min(this.canvas.height - 80,
      Math.max(this.y, 0));

    //increase shootTimer with delta
    if (this.shootTimer < this.shootCooldown) {
      this.shootTimer += delta;
    }

    //if all conditions are met, fire
    //the bullet class is impemented further down
    if (util.keyboard["z"] && this.shootTimer >= this.shootCooldown) {
      this.shootTimer = 0;  //  reset the timer
      let bullet = new Bullet(world);  //  create a bullet
      bullet.x = this.x + 22.5;  // set its coordinates
      bullet.y = this.y;
      bullet.speed = -500;  //  set its speed
      bullet.layer = ENEMY_COLL;  //we want it to collide with enemies
      console.log(bullet.layer)
    }
  }


  //the x and y tells the function where to draw
  draw(x, y) {
    this.ctx.fillStyle = "blue";
    this.drawHitbox()  //in this example we will just draw the hitbox
  }


  //create a function so the player can take damage
  takeDamage(amount) {
    this.health -= amount;

    //destroy the player if it dies
    if (this.health <= 0) {
      this.selfDestruct();
    }
  }
}


//now we can add the player to the world
new Player(world);



//let's create the Bullet class
class Bullet extends PhysicsBody {
  constructor(world) {
    super(world)
    this.hitbox = new Hitbox(0, 0, 5, 20);

    this.layer = 0;  //  this is the layer it will be colliding on
    this.speed = 0; // the speed of the bullet

    this.addToUpdate();
    this.addToDraw(BULLET_DRAW);  //  draw on the bullet layer
    //no need to assign it to a collision layer because 
    //its collision is one-directional
  }

  update(delta) {
    this.y += this.speed * delta;  //  apply the speed

    //get all colliding objects
    let collision = this.testCollision(this.layer);

    //if there is a collision and it has the takeDamage method
    //make it  take one damage
    if (collision[0] && collision[0].takeDamage) {
      collision[0].takeDamage(1);
      this.selfDestruct();  //  destroy the object
    }

    //if the bullet is outside the screen destroy it
    if (this.y > this.canvas.height || this.y < 0 - 20) {
      this.selfDestruct();
    }
  }

  draw(x, y) {
    this.ctx.fillStyle = "red"
    this.drawHitbox();
  }
}



//now to the enemy class
class Enemy extends PhysicsBody {
  constructor(world) {
    super(world); //  pass world to the parent class

    // hitbox that is a 50x80 rectangle
    this.hitbox = new Hitbox(0, 0, 50, 80);
    this.speed = 100;  //  movement speed
    this.shootCooldown = 0.8;  //  fire rate
    this.shootTimer = 0;  //  timer for fire rate
    this.health = 5;  //  how many bullets the enemy can take

    this.addToUpdate();  //  add the Enemy to update
    this.addToDraw(ENEMY_DRAW);  //  add it to be drawn
    this.addToCollision(ENEMY_COLL);  // add collision
  }

  update(delta) {
    this.y += this.speed * delta;

    //create a bullet that collides with the player
    this.shootTimer += delta
    if (this.shootTimer >= this.shootCooldown) {
      this.shootTimer = 0;

      let bullet = new Bullet(world);
      bullet.x = this.x + 22.5;
      bullet.y = this.y;
      bullet.layer = PLAYER_COLL;  // make it collide with the player
      bullet.speed = 300;
    }
  }

  draw(x, y) {
    this.ctx.fillStyle = "green";
    this.drawHitbox();
  }

  //so it can take damage
  takeDamage(amount) {
    this.health -= amount;
    if (this.health <= 0) {
      this.selfDestruct();
    }
  }
}



//now finally the only thing we need is a spawner for the enemies
//this doesn't have to collide so Node will be enough
class EnemySpawner extends Node {
  constructor(world) {
    super(world);
    this.cooldown = 3;
    this.timer = 0;

    this.addToUpdate();
  }

  update(delta) {
    this.timer += delta;
    //create a new enemy if the timer has been reached
    if (this.timer >= this.cooldown) {
      this.timer -= this.cooldown;
      let enemy = new Enemy(world);
      enemy.x = Math.random() * this.canvas.width - 80;
      enemy.y = -100;
    }
  }
}

//let's create the spawner
new EnemySpawner(world);