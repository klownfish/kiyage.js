.. _Node2d:

******
Node2d
******
inherits from :ref:`Node`.

Everything that has a position or should be drawn.

Methods
#######
``addToDraw(layer)``
--  Adds the object to be drawn on layer

``removeFromDraw()``
--  Removes the object from being drawn.

Properties
##########
``x, y``
-- The position of the object

``drawInfo``
--  Contains information about how the object is drawn,
this can be ignored but a performance loss may occur.

``drawInfo.x, drawInfo.y``
--  The top left corner of the draw function
relative to the object's position.

``drawInfo.width, drawInfo.height``
--  How much space the draw function uses.
