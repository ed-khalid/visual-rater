### CURRENT 
 # CONTEXT
 - refetch album when song updates to update score / artist score 
 - get rid of breadcrumbs in favor of a context
 - add simple home button to reset context to all loaded artists
 - what to do when items are more than a certain number (collapse into groups) ? infinite pan?  
 # COMPARISON
 - comparison songs click

 


## FEATURE
  # GENRE
  - add genre to artist
  - add compare by genre
## APP
- calculate artist tier

## SEARCH
-- disable already existing albums in search (feature)
- improve search (spotify icon only shown first, then spins to unroll input field when click, clicking it again rolls it back) (ui)
- understand why zoom reset only works in a callback (frontend)
- add zoom back 

### PANEL
- work on default panel behavior (closeable, moveable) (frontend)
- style panels better (ui)
- revamp album details into a panel
- improve album editing
- add custom mouse cursors (ui) 
- add coloring to rater (good, great, bad) 
- add graph of album progress
- add review panel

# ENHANCEMENTS
- drag should not go out of bounds, add resize observer as well  
- drag should be only enabled by the header but affects the entire window    
- prevent text collision (and maybe node collision?) (d3.force?)   
- add albumId/artistId to comparison songs 
- replace height transforms with performant ones  
- understand how to properly do lazyloading hibernate (backend)
- use name comparison instead of image (enhancement) 
- introduce testing (storybook?)
- search results hover slightly increases width due to border appearing on hover (already tried existing transparent border but need to solve for text being bold)  (ui)  
