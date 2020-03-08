/*________________________
/ made by Olof Helgesson  \
|                         |
\ licensed under LGPLv3   /
 ------------------------
*/
/**
 * TODO: 
 *  error checking in Node collision 
 *  sections for collision, hard af
 *  multiple hitboxes, meh
 *  tilemap
*/

/*****************************************************************************************************************************
 * World
 * Stores and manages everything about your world.
 * 
 * constructor(canvas, global)
 * 
 * this.canvas  --  canvas
 * this.ctx  --  ctx
 * this.background  --  background color
 * this.global{}  --  variables local to the world
 * this.view  --  the middle of the viewport's position 
 * 
 * this.update() -- updates the world, calls update on everything in update
 * this.draw()  --  draws the world, calls draw on everything in a draw layer,
 *   goes from lowest to highest.
 * 
 * --- Generally none of the below functions should be called by the user ---
 * --- everything is reimplemented in the Node class and its children. ---
 * 
 * addToUpdate(object)  --  adds the object to be updated
 * 
 * addToDraw(Object, layer) -- adds the object to be drawn on a specific layer
 * 
 * addToCollision(Object, ...layers) -- adds the object to one 
 *    or multiple collision layers
 * 
 * removeFromUpdate(Object) -- removes the object from  being updated
 * 
 * removeFromDraw(Object, layer) 
 *    removes the object from being drawn, layer has to be specified
 * 
 * removeFromCollision(Object, ...layers)
 *    removes the object from one or multiple collision layers
 * 
 * testCollision(object, ...layers)
 *    tests if object is colliding with anything in the specified layers
 * 
 * addToObject(object)
 *    add a refernce to the object in the world, this is not mandatory as is not used but still
 * removeFromObject(object)
 *    remove refrence the reference made from the upper function
 ******************************************************************************************************************************/
class World {
  constructor(canvas, global = {}) {
    //public
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.ctx.imageSmoothingEnabled = false; // good for pixelart
    this.background = "white";
    this.global = global
    this.viewPort = new Vector(0, 0);

    this.update = this.update.bind(this);
    this.draw = this.draw.bind(this);

    this.addToUpdate = this.addToUpdate.bind(this);
    this.addToDraw = this.addToDraw.bind(this);
    this.addToCollision = this.addToCollision.bind(this);

    this.removeFromUpdate = this.removeFromUpdate.bind(this);
    this.removeFromDraw = this.removeFromDraw.bind(this);
    this.removeFromCollision = this.removeFromCollision.bind(this);

    //private
    this._objects = {}  //every single object should be placed here
    this._collisionCache = {}  //cache collision to prevent repeat operations
    this._updates = []; //objects w/ update
    this._collisionLayer = [[]]; //matrix with objects w/ collision
    this._drawLayer = [[]]; //matrix with objects w/ draw
    this._oldTime = Date.now(); //for delta
  } //constructor end

  update() {
    let newTime = Date.now();
    let delta = (newTime - this._oldTime) / 1000;
    if (delta > 0.40) {
      delta = 0.40
    };

    this._oldTime = newTime;
    for (let v of this._updates) {
      if (v.update) {
        v.update(delta);
      }
    }
  }

  draw() {
    this.ctx.fillStyle = this.background;
    this.ctx.fillRect(0, 0, canvas.width, canvas.height);
    this._drawLayer.forEach(layer => {
      for (let v of layer) {
        let drawX = v.x - this.viewPort.x;
        let drawY = v.y - this.viewPort.y;
        if (drawX + v.drawInfo.x > this.canvas.width ||
          drawX + v.drawInfo.width + v.drawInfo.x < 0 ||
          drawY + v.drawInfo.y > this.canvas.height ||
          drawY + v.drawInfo.height + v.drawInfo.y < 0) {
          continue;
        }
        v.drawX = drawX;
        v.drawY = drawY;
        v.draw(drawX, drawY);
      }
    });
  }

  addToUpdate(object) {
    this._updates.push(object);
  }

  removeFromUpdate(object) {
    for (let i in this._updates) {
      if (this._updates[i] === object) {
        this._updates.splice(i, 1);
      }
    }
  }

  addToDraw(object, layer) {
    if (this._drawLayer[layer] == null) {
      this._drawLayer[layer] = [];
    }
    this._drawLayer[layer].push(object);
  }

  removeFromDraw(object, layer) {
    for (let i in this._drawLayer[layer]) {
      if (object === this._drawLayer[layer][i]) {
        this._drawLayer[layer].splice(i, 1);
      }
    }
  }

  addToCollision(object, ...layers) {
    layers.forEach(v => {
      if (!this._collisionLayer[v]) {
        this._collisionLayer[v] = [];
      }
      this._collisionLayer[v].push(object);
    });
  }

  removeFromCollision(object, ...layers) {
    layers.forEach(layer => {
      for (let i in this._collisionLayer[layer]) {
        if (object == this._collisionLayer[layer][i]) {
          this._collisionLayer[layer].splice(i, 1);
        }
      }
    });
  }

  testCollision(object, ...layers) {
    let objToRect = (obj) => {
      return {
        x: obj.x + obj.hitbox.offset.x,
        y: obj.y + obj.hitbox.offset.y,
        width: obj.hitbox.width,
        height: obj.hitbox.height
      };
    }

    let rect1 = object.getRect()
    let collisions = [];
    for (let layer of layers) {
      if (this._collisionLayer[layer] == null) {
        this._collisionLayer[layer] = [];
      }

      for (let v of this._collisionLayer[layer]) {
        let rect2 = objToRect(v);
        if (rect1.x < rect2.x + rect2.width &&
          rect1.x + rect1.width > rect2.x &&
          rect1.y < rect2.y + rect2.height &&
          rect1.y + rect1.height > rect2.y &&
          !collisions.includes(v)) {

          collisions.push(v);
        }
      }
    }
    return collisions;
  }//testCollision end
} //World end


/**************************************************************
 * Node
 * base Node that everything in a world should inherit from.
 * 
 * constructor(world)
 * 
 * world  --  reference to the world in which it resides
 * canvas  -- contains the canvas for the world
 * ctx  --  context for canvas
 * 
 * addToUpdate()
 * yada yada
 * 
 * getMousePos()  --  gets the mouse position on the canvas
 * selfDestruct()  --  delete this from every layer and thing
 * 
 * this
 ****************************************************************/
class Node {
  constructor(world) {
    this.world = world;
    this.canvas = world.canvas;
    this.ctx = world.ctx;

    this.addToUpdate = this.addToUpdate.bind(this);
    this.removeFromUpdate = this.removeFromUpdate.bind(this);

    this.getMousePos = this.getMousePos.bind(this);
    this.selfDestruct = this.selfDestruct.bind(this);

    //bind draw and update for the lazy users
    if (this.update) {
      this.update = this.update.bind(this);
    }
    if (this.draw) {
      this.draw = this.draw.bind(this);
    }

    //store which layers have been used
    this._layers = { collision: [], draw: null, object: false };
  }

  addToUpdate() {
    if (this._layers.update) return;
    this.world.addToUpdate(this);
    this._layers.update = true;
  }

  removeFromUpdate() {
    if (!this._layers.update) return;
    this.world.removeFromUpdate(this);
    this._layers.update = false;
  }

  selfDestruct() {
    if (this._layers.collision.length > 0) {
      this.world.removeFromCollision(this, ...this._layers.collision)
    }
    if (this._layers.draw) {
      this.world.removeFromDraw(this, this._layers.draw);
    }
    if (this._layers.update) {
      this.world.removeFromUpdate(this)
    }
  }

  getMousePos() {
    let rect = this.canvas.getBoundingClientRect();
    let scaleX = this.canvas.width / rect.width;
    let scaleY = this.canvas.height / rect.height;
    let mousePos = new Vector();

    mousePos.x = (util.mouse.x - rect.left) * scaleX + this.world.viewPort.x;
    mousePos.y = (util.mouse.y - rect.top) * scaleY + this.world.viewPort.y;
    return mousePos;
  }
} //Node end



/*******************************
 * Node2d
 * base for everything 2D.
 * 
 * has x and y so far
 * 
 * drawInfo  --  specify how much area the draw function uses
 ******************************/
class Node2d extends Node {
  constructor(world) {
    super(world);
    this.x = 0;
    this.y = 0;
    this.drawInfo = {
      x: -Infinity,
      y: -Infinity,
      width: Infinity,
      height: Infinity
    }

    this.addToDraw = this.addToDraw.bind(this);
    this.removeFromDraw = this.removeFromDraw.bind(this);
  }

  addToDraw(layer) {
    if (this._layer) return;
    if (!this._layers.draw) {
      this.world.addToDraw(this, layer);
    }
    this._layers.draw = layer
  }

  removeFromDraw() {
    if (!this._layer) return;
    this.world.removeFromDraw(this, this.layers.draw);
    this._layers.draw = null
  }

}


/******************************************************************************************
 * PhysicsBody
 * Base for everything with collision.
 * 
 * isOnFloor  --  moveAndSlide will set this if it is on floor
 * 
 * testCollision(...layers)  --  get everything that the this is colliding with
 * moveAndSlide(Vector, ...layers)  --  Adds the vector to current position
 *    if a object in the specified layers is in the way the object will glide along it.
 *    check Godot's documentation for more.  
 * isOnMouse()  --  checks if mouse in inside the hitbox
 *  
 ******************************************************************************************/
class PhysicsBody extends Node2d {
  constructor(world) {
    super(world);
    this.hitbox;
    this.isOnFloor = false;

    this.addToCollision = this.addToCollision.bind(this);
    this.removeFromCollision = this.removeFromCollision.bind(this);

    this.getRect = this.getRect.bind(this);
    this.isOnMouse = this.isOnMouse.bind(this);
    this.testCollision = this.testCollision.bind(this);
    this.moveAndSlide = this.moveAndSlide.bind(this);
    this.drawHitbox = this.drawHitbox.bind(this);

  }
  ///ZzzzZZzZZz add some error checking
  addToCollision(...layers) {
    this.world.addToCollision(this, ...layers)
    this._layers.collision.push(...layers)
  }

  //pass no layer to remove from all
  removeFromCollision(...layer) {
    if (layer.length > 0) {
      this.world.removeFromCollision(this, ...layer)
      return
    }
    this.world.removeFromCollision(this, ...this._layers.collision);
  }

  testCollision(...layers) {
    return this.world.testCollision(this, ...layers);
  }

  moveAndSlide(deltaVector, margin, ...layers) {
    let objToRect = (obj) => {
      return {
        x: obj.x + obj.hitbox.offset.x,
        y: obj.y + obj.hitbox.offset.y,
        width: obj.hitbox.width,
        height: obj.hitbox.height
      };
    }
    this.isOnFloor = false;
    //apply movement
    this.x += deltaVector.x;
    this.y += deltaVector.y;

    //test for collision in new position
    let collisions = this.testCollision(...layers);
    let rect1 = objToRect(this);

    //add random number because of floating point accuracy
    //do something to get the offset from the collision, add offset
    if (deltaVector.x < 0) {
      let offsetX = 0;
      for (let v of collisions) {
        let rect2 = objToRect(v);
        let temp = Math.max(offsetX, (rect2.x + rect2.width) - rect1.x)
        if (temp <= -deltaVector.x + margin) {
          offsetX = temp
        }
      }
      this.x += offsetX;
    }
    else if (deltaVector.x > 0) {
      let offsetX = 0;
      for (let v of collisions) {
        let rect2 = objToRect(v)
        let temp = Math.max(offsetX, (rect1.x + rect1.width) - rect2.x)
        if (temp <= deltaVector.x + margin) {
          offsetX = temp
        }
      }
      this.x -= offsetX;
    }

    if (deltaVector.y < 0) {
      let offsetY = 0;
      for (let v of collisions) {
        let rect2 = objToRect(v);
        let temp = Math.max(offsetY, (rect2.y + rect2.height) - rect1.y)
        if (temp <= -deltaVector.y + margin) {
          offsetY = temp
        }
      }
      this.y += offsetY;
    }
    else if (deltaVector.y > 0) {
      let offsetY = 0;
      for (let v of collisions) {
        let rect2 = objToRect(v);
        let temp = Math.max(offsetY, (rect1.y + rect1.height) - rect2.y)
        if (temp <= deltaVector.y + margin) {
          offsetY = temp
          this.isOnFloor = true;
        }
      }
      this.y -= offsetY;
    }
    return collisions;
  }

  drawHitbox() {
    this.ctx.fillRect(this.drawX + this.hitbox.offset.x, this.drawY + this.hitbox.offset.y,
      this.hitbox.width, this.hitbox.height);
  }

  getRect() {
    return new Rectangle(this.x + this.hitbox.offset.x,
      this.y + this.hitbox.offset.y, this.hitbox.width, this.hitbox.height)
  }

  isOnMouse() {
    let mousePos = this.getMousePos();
    let rect = this.getRect();
    if (mousePos.x < rect.x + rect.width && mousePos.x > rect.x
      && mousePos.y < rect.y + rect.height && mousePos.y > rect.y) {
      return true;
    } else {
      return false;
    }
  }
}//PhysicsBody end


/*********************************************************
 * Hitbox
 * For storing hitboxes.
 * 
 * constructor(xOffset, yOffset, width, height);
   x,y
  +
  |
  |                xOffset
  |
  +------------------+---------------+
yOffset              |               |
                     |               |
                     |               |
                     |               |
                     |               |
                     |               |
                     |               |
                     |               |
                     +---------------+ width
                     height
 *********************************************************/
class Hitbox {
  constructor(xOffset, yOffset, width, height) {
    this.width = width;
    this.height = height;
    this.offset = { x: xOffset, y: yOffset };
  }
}

/*************************************
 * Rectangle
 * it's a rectangle
 * 
 * constructor(x, y, width, height)
 ************************************/
class Rectangle {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }
}

/******************************************************************************
 * Vector
 * For storing two-dimensional positions.
 * 
 * x -- the x coordinate
 * y -- the y coordinate
 * 
 * normalize() -- returns the unit vector i.e. a vector with the length of 1
 *  but with the same proportions between x and y 
 *    (e.g. move diagonally with the same speed as moving straight)
 ******************************************************************************/
class Vector {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;

    this.normalize = this.normalize.bind(this);
  }

  normalize() {
    if (!this.x && !this.y) {
      return;
    }

    let length = Math.sqrt(this.x ** 2 + this.y ** 2);
    this.x /= length;
    this.y /= length;
  }
}

/*************************
 * AnimatedSprite
 * draws and manages an animation.
 * 
 * constructor(world, fps, ...frames);
 * if the last argument is a number it will take all 
 * files with an incrementing number up to the argument
 * i.e. constructor(world, fps, "player-run-1", 5) is equal to 
 * constructor(world, fps, "player-run-1", "player-run-2", "player-run-3")
 * 
 * draw(x, y, flipV)  -- draws the current frame
 ************************/
class AnimatedSprite {
  constructor(world, fps, ...frames) {
    this.world = world;
    this.fps = fps;
    this.frames = []
    this.loaded = 0  //store how many frames have been loaded
    this.startTime = Date.now();
    this.started = false
    this.runOnce = false;
    this.reachedEnd = false;

    this.draw = this.draw.bind(this);
    this.reset = this.reset.bind(this);

    //shorthand form
    if (typeof frames[frames.length - 1] == "number") {
      let start = +frames[0].match(/\d/);
      for (let i = start; i <= frames[frames.length - 1]; i++) {
        this.frames[i - start] = new Image();
        this.frames[i - start].src = frames[0].replace(start, i);
        let $this = this;
        this.frames[i - start].onload = () => { $this.loaded++ };
      }
      return;
    }

    for (let i in frames) {
      this.frames[i] = new Image();
      this.frames[i].src = frames[i];
      let $this = this;
      this.frames[i].onload = () => { $this.loaded++ };
    }
  }

  draw(x, y, flipV, offset = 0) {
    if (!this.started) {
      this.started = true;
      this.startTime = Date.now();
    }

    //generate index
    if (this.loaded !== this.frames.length) return;
    let time = Date.now() - this.startTime;
    let index = Math.floor(time / (1000 / this.fps)) % this.frames.length;

    if (index == this.frames.length - 1 && this.runOnce) {
      this.reachedEnd = true;
    }
    if (this.reachedEnd) {
      index = this.frames.length - 1;
    }
    let img = this.frames[index]

    //draw part
    if (flipV) {
      this.world.ctx.save();
      this.world.ctx.scale(-1, 1);
      this.world.ctx.drawImage(img, -x, y, img.width * -1 + offset, img.height);
      this.world.ctx.restore();
      return;
    }
    this.world.ctx.drawImage(img, x, y);
  }

  reset() {
    this.started = false
    this.reachedEnd = false
  }
}

/**********************************************************
 * ParallaxBackground
 * it's a parallax background;
 * constructor(world, factorX, factorY, image, drawLayer);
 *********************************************************/
class ParallaxBackground extends Node2d {
  constructor(world, factorX, factorY, image, drawLayer) {
    super(world);
    this.loaded = false
    this.factorX = factorX;
    this.factorY = factorY;

    this.image = new Image();
    this.image.src = image;
    let $this = this
    this.image.onload = () => { $this.loaded = true; }

    this.draw = this.draw.bind(this);

    this.addToDraw(drawLayer);
  }
  draw(x, y) {
    if (!this.loaded) return;
    let startX = x * this.factorX - this.x;
    let startY = y * this.factorY - this.y;
    while (startX > 0) startX -= this.image.width;
    while (startY > 0) startY -= this.image.height;

    while (startX < this.world.canvas.width) {
      let tempY = startY;
      while (tempY < this.world.canvas.height) {
        this.ctx.drawImage(this.image, startX, tempY);
        tempY += this.image.height;
      }
      startX += this.image.width;
    }
  }
}

let util = {};
util.keyboard = {}; //for keyboard input
util.mouse = {}; //for mouse input, though it is raw and should not be used
//use Node.getMousePos instead

document.addEventListener('keydown', (e) => {
  util.keyboard[e.key] = 1;
})

document.addEventListener('keyup', (e) => {
  util.keyboard[e.key] = 0;
})

document.addEventListener("mousemove", (e) => {
  util.mouse.x = e.clientX;
  util.mouse.y = e.clientY;
});

document.addEventListener("mousedown", (e) => {
  util.mouse.click = 1
})

document.addEventListener("mouseup", (e) => {
  util.mouse.click = 0
})

//returns a random argument
util.random = function (...args) {
  return args[Math.floor(Math.random() * args.length)];
}