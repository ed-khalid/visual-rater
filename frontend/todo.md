### CURRENT 


# RATING
- scroll to album to which song belongs 
- color-code albums on rater (
  change color on navpanel
  and color of items 
)
- when updating a score (on block rater atleast) the raterfilters/navfilters reset to show all artist albums if you had them changed to anything else   
- update artist/album score when rating (not happening)
- hide unrated 0 block (grid-rater)

# REVIEW
- add a review table associated to artist/album/song

# DEPLOYMENT
- deploy Kotlin Service (POSTGRES?)  
- have it running and talking to the image-service 
- add a login to my visual-rater  

# DRAGGING ALBUM
- make the whole row draggable somehow, or introduce an
icon for dragging (dragging a row is challengin
because it disables click-events ont he row) 

# RATER 
- add a RaterWrapper to introduce top/bottom
helper nav panels 

# UNRATED
- fix album tier (top left) 
- fix title wrapping 
- fix general layout (tracklist width/raterwidth)
- fix layout responsiveness
- fix rater styling 
- when dragging from tracklist, make the draggable item have a compact shape
- fix rater hover behavior   
- add comparison songs per score
- add dynamic album score
- submit behavior

# SEARCH
- take AddSection out of Sidebar and make it a floating panel 


# DB
- add index to (artist.name)
- add index to (song.score)

# MISC
- change all thumbnails to high qualify (albums are low)   

# SEARCH
- auto-navigate to unrated when album is added 

# SCORECARD REVISITED
- add a view showing greatest albums
- add a view showing greatest songs

# NAV-FILTER
- standardize the scoring coloring themes (right now they're adhoc) - create a dummy album with all categories accounted for   
# GENERAL RATER
- add a context 


# GRID-RATER
- explore rewrite with svg/canvas
- left-handside column labels: rotate and align to outer left border
- account for small data state update flicker when song score is to be updated    
- layout gridblock better (dynamic size? label moving around when items are added? what to do when too many items...) 

# CARTESIAN-RATER
bring it back!

# ALBUM OVERVIEW
- add some sort of album overview panel
- shows a line chart of the album and a descriptor of its flow
- (exp) album cover ratings?

# FRAMER MOTION
use it for everything!!
- Title Page Load Animation 
- Loading the Spotify Search 
- Loading the Add Album Panel
- Loading the Overview Panel (Artist/Album)  
- 

## FEATURE
  # GENRE
  - add compare by genre