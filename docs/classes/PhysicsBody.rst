.. _PhysicsBody:

***********
PhysicsBody
***********
Inherits from :ref:`Node2d`

Object with collision.


Methods
#######
``addToCollision(...layers)``
--  Adds the object to one or many collision layers.

``removeFromCollision([...layers])``
--  Removes the object from the specified layers.
If no layer is specified it is removed from all layers.

``testCollision(...layers)``
--  Returns and array with all colliding objects in the specified layers.

``moveAndSlide(deltaVector, margin, ...layers)``
-- Moves the object and lets it slide against things.

*deltaVector* is a Vector that describes how much it should try to move.

*margin* tells the engine how much the object can cut a corner kind off.
I don't know why i exposed this as an argument
but it should be a really small number like 0.000001.

``getRect()``
--  returns a rectangle representing the object's hitbox.

``drawHitbox()``
--  Draws the hitbox.

``getNearest(...layers)``
--  returns the nearest object calculated from the middle of the hitbox


Properties
##########
``hitbox`` the hitbox for the object
.. code-block::

       x,y
      +
      |
      |                xOffset
      |
      +------------------+---------------+
      yOffset             |               |
                         |               |
                         |               |
                         |               |
                         |               |
                         |               |
                         |               |
                         |               |
                         +---------------+ width
                         height
