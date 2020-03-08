.. _Node:

****
Node
****

Everything that resides in a world should inherit from this.

Methods
#######
``constructor(*world*)``
--  Which world the object belongs to

``addToUpdate()``
--  Adds itself to be updated every tick

``removeFromUpdate()``
--  Removes itself from being updated every tick.

``selfDestruct()``
--  Removes every reference to the object in the world

``getMousePos()``
--  Gets the mouse relative to the world.

Properties
##########
``canvas`` The canvas that is used.

``ctx`` The context that should be drawn on.

``world`` The world in which the object resides.
