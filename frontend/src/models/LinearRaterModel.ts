
const firstCircleDistance = 125  
const distanceBetweenCircles = 50
const songNameYOffset = 15
const categoryOffset = 2

const LinearRaterMainRectConfig = {
    heightOffset: 50,
    x:25,
    y:20,
    width:20,
}  

const LinearRaterAnimationSettings = {
  songNameDelay: 0.3,
}


const LinearRaterFontSettings = {
  size: 12,
  fill: '#fff'
}

const LinearRaterCircleConfig = {
  circle: {
    x: (i:number) => LinearRaterMainRectConfig.x + firstCircleDistance + (i* distanceBetweenCircles),
    radius: 8,
    stroke: "#fff",
    strokeWidth: 2,
  }, 
  songName: {
    x: (i:number) => LinearRaterMainRectConfig.x + firstCircleDistance + (i* distanceBetweenCircles), 
    y: (position:number) => position - songNameYOffset

  },
} 

const ConnectingLineConfig = {
    start: LinearRaterMainRectConfig.x + LinearRaterMainRectConfig.width,
    end: (itemsLength:number) => LinearRaterMainRectConfig.x + firstCircleDistance + ( distanceBetweenCircles * (itemsLength -1)),       
    strokeWidth: 1,
    stroke: "#999",
    category: {
      x: LinearRaterMainRectConfig.x + LinearRaterMainRectConfig.width,
      y: (position:number) => position - categoryOffset,
      fontSize: 12,
      fill: "white",
      animation: {
        delay: 0.5
      }
    },
    animation: {
        duration: 0.3,
    },
    scoreLabel: {
        x: (largestGroupItemCount:number) => LinearRaterMainRectConfig.x + firstCircleDistance + (distanceBetweenCircles * largestGroupItemCount),
        y: (position:number) => position + 2,  
        animation: {
            delay: 0.6
        }
    }
} 
const UnratedConfig = {
  offset: +15,
  height: 25
} 

export const LinearRaterConfig = {
    rater: LinearRaterMainRectConfig,
    unrated: UnratedConfig,
    connectingLine: ConnectingLineConfig,
    circle: LinearRaterCircleConfig,
    animation: LinearRaterAnimationSettings,
    font: LinearRaterFontSettings,
    groupProximityThreshold: 35
} 
