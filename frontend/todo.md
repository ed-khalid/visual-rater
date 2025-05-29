# MUSIC NAV
- rethink the buttons [ accordion expand bottom of row, name clicking opens overview, rater controls to the left]
- add exclusive filter button
# LINEAR RATER 
- comparison songs!

- better proximity: (group by category first) 
- think about multiple raters

# ALBUM OVERVIEW
- improve linking 
- shows a line chart of the album and a descriptor of its flow
- tracklist scroll doesnt show the full height of last item
# RATING
6. - scroll to album to which song belongs 
7. - color-code albums on rater (change color on navpanel and color of items )
8. - when updating a score (on block rater atleast) the raterfilters/navfilters reset to show all artist albums if you had them changed to anything else   
9. - update artist/album score when rating (not happening)

# REVIEW (COMMENTS)
- add a review table associated to artist/album/song

# SEARCH
- take AddSection out of Sidebar and make it a floating panel 
- auto-navigate to album when it's added 

# BACKEND PROCEDURES
- total album metadata is not updating
# DB
- add index to (artist.name)
- add index to (song.score)
# BUGS
1. Overview: Title Pencil slightly down 
2. Overview: Trajectory Chart/cant see axis
3. Overview: Metadata Height Needs To Be FIXED so that total artists/songs always hug border 
# SCORECARD REVISITED
- add a view showing greatest albums
- add a view showing greatest songs
# MISC
- change all thumbnails to high qualify (albums are low)   
# AUTH
- employ multi-tenant model with Row Based Security
- roll out auth using auth0  
# DEPLOYMENT
- deploy Kotlin Service (POSTGRES?)  
- have it running and talking to the image-service 
- deploy Frontend
- have it talk to backend
# FRAMER MOTION
use it for everything!!
- Title Page Load Animation 
- Loading the Spotify Search 
- Loading the Add Album Panel
- Loading the Overview Panel (Artist/Album)  
## FEATURE
  # GENRE
  - add compare by genre
