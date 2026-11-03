-- items.colors now holds each cover's raw dominant colour; the app derives the glow from it when drawing.
-- Until now it held already-adjusted glow colours, so clear them; the app works out the raw colours again
-- from the covers the next time each item is shown.
update items set colors = null where colors is not null;
