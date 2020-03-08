.. _AnimatedSprite:

***************
Animated Sprite
***************
Animated sprite will display an animation or a single frame.

Methods
#######
.. code::

    constructor(world, fps, ...frames
                [, amount of frames])

*world* is the world that will be drawn on.

*fps* tells the sprite how many frames it should display per second.

*frames* are the frames that the sprite will loop through.
If the frames have the same name but different index i.e.
jump-1.jpg and jump-2.jpg you can specify the name of the first and
the index of the last frame to iterate up to the last index.
"jump-1, 3" would expand to "jump-1, jump-2, jump-3".

``draw(x,y)``
--  Draws the sprite on the specified position

``reset()``
-- Resets and pauses the animation untill the next draw call.

Properties
##########
``runOnce``
--  If this is true the animation will stop at the last
frame untill reset is called

``fps``
--  The speed of the animation in frames per second
