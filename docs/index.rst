.. Kiyage documentation master file, created by
   sphinx-quickstart on Tue Feb 25 22:47:10 2020.
   You can adapt this file completely to your liking, but it should at least
   contain the root `toctree` directive.

Welcome to Kiyage's documentation!
==================================
Kiyage is a free and simple game engine for JavaScript.

Example of intializing code for an object:

.. code-block:: JavaScript

   constructor(world) {
       super(world)
       this.x = 0;
       this.y = 0;
       //create a hitbox
       this.hitbox = new Hitbox(10, 25, 20, 40);

       //  add object's update function
       this.addToUpdate();
       //  add object's draw function to a draw layer
       this.addToDraw(PLAYER_DRAW);
       //  add object's hitbox  to a collision layer
       this.addToCollision(PLAYER_COLL);
   }

Classes
=======
.. toctree::

   classes/World
   classes/Node
   classes/Node2d
   classes/PhysicsBody
   classes/ParallaxBackground
   classes/AnimatedSprite
   classes/Utilities
   classes/Util

Examples and tutorials
======================

.. toctree::

   examples/space/space
