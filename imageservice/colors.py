import requests
import numpy as np
import cv2
from sklearn.cluster import KMeans

def url_to_image(url):
    try: 
      resp = requests.get(url, timeout=5)
      resp.raise_for_status()
      image = np.asarray(bytearray(resp.content), dtype="uint8")
      image = cv2.imdecode(image, cv2.IMREAD_COLOR)
      if image is None:
        raise ValueError("Could not decode image")
      return image
    except Exception as e:
       raise ValueError("failed to load image from {url}: {e}")

def find_histogram(clt):
    """
    create a histogram with k clusters
    :param: clt
    :return:hist
    """
    numLabels = np.arange(0,len(np.unique(clt.labels_)) + 1) 
    (hist, _) = np.histogram(clt.labels_, bins=numLabels) 
    hist = hist.astype("float")
    hist /= hist.sum()
    return hist

def get_top_n_colors_for_image(imageUrl, n_colors=3):
   image = url_to_image(imageUrl)
   image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
   image = image.reshape((image.shape[0] * image.shape[1],3)) 

   clt = KMeans(n_clusters=n_colors, random_state=42) 
   clt.fit(image)
   hist = find_histogram(clt)
   # sort cluster centers by their histogram weights (descending)
   sorted_indices = np.argsort(hist)[::-1]
   top_colors = clt.cluster_centers_[sorted_indices].astype(int)
   return [f"{color[0]},{color[1]},{color[2]}" for color in top_colors]

def get_color_for_image(imageUrl):
    image = url_to_image(imageUrl) 
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    image = image.reshape((image.shape[0] * image.shape[1],3)) 
    clt = KMeans(n_clusters=3) 
    clt.fit(image)
    hist = find_histogram(clt)
    dominant_index = np.argmax(hist)
    dominant_color = clt.cluster_centers_[dominant_index].astype(int) 
    return dominant_color