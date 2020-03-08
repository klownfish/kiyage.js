.. _World:

*****
World
*****

The world manages everything about the objects which belong to it.

Methods
#######
``constructor(canvas, global = {})``
--  Create the world with the canvas you want it use,
optionally you can pass it a global object to use

``update()``
--  Calls update on every object which should be updated.

``draw()``
--  Calls draw on every object which should be drawn.

**Generally nothing below here should be used.**
**See Node, Node2d, and PhysicsBody documentation for alternatives**

``addToUpdate(*object*)``
--  Adds the *object* to be updated on every game tick.

``removeFromUpdate(*object*)``
--  Removes the *object* from the update list.

``addToDraw(*object*, *layer*)``
--  Adds the *object* to be drawn on *layer* every frame.

``removeFromDraw(*object*, *layer*)``
--  Removes the *object* from being drawn on *layer*.

``addToCollision(*object*, *...layers*)``
--  Adds the *object* to one or multiple collision layers

``removeFromCollision(*object*, *...layers*)``
-- Removes the *object* from one or multiple collision layers

``testCollision(*object*, *...layers*)``
--  Tests if *object* is colliding with anything in the specified layers

Properties
##########
``background``
--  The background's fillStyle

``global``
--  Object that contains user defined variables.

``viewPort``
--  Vector that tells the engine where the top-left corner of camera is.

``canvas``
--  The canvas that the world is using.

``ctx``
--  2D context for the canvas.
