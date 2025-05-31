from colors import get_color_for_image, get_top_n_colors_for_image
from app_types import ImageSimilarityRequest, ImageSimilarityResponse
import uvicorn
from similarity import compute_similarity
from fastapi import FastAPI 
from fastapi.responses import JSONResponse
from typing import List

app = FastAPI()


@app.get('/')
def read_root():
    return {"Hello":"World"}

@app.post('/similarity', response_model=List[ImageSimilarityResponse])
def compare_images(imageUrls:List[ImageSimilarityRequest]):   
    result = compute_similarity(imageUrls) 
    return result

@app.get('/top_n_colors')
def get_n_colors(imageUrl:str, n_colors:int):
    try:
      top_n_colors = get_top_n_colors_for_image(imageUrl, n_colors)
      return JSONResponse(content={"colors": top_n_colors})
    except Exception as e:
      return JSONResponse(status_code=400, content={"error": str(e)})

@app.get('/colors')
def get_colors(imageUrl:str):
    dominantColorTuple = get_color_for_image(imageUrl)
    dominantColorStr = f"{dominantColorTuple[0]},{dominantColorTuple[1]},{dominantColorTuple[2]}"
    return JSONResponse(content = { 'colorString' : dominantColorStr }) 

if __name__ == "__main__": 
    uvicorn.run("main:app", host="0.0.0.0", port=7011, reload=True)