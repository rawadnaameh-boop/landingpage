import io
import os
import requests
import numpy as np
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from groq import Groq
from pydantic import BaseModel, Field
from PIL import Image
from sklearn.cluster import KMeans
from routes.copy_routes import router as copy_router
app = FastAPI(title="ML Color Extraction Service and Copy Generation")

# Allow CORS so your other services can talk to this one without security blocks
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(copy_router)
# Define the expected JSON input structure
class ImageRequest(BaseModel):
    url: str

def rgb_to_hex(rgb_color):
    """Converts [R, G, B] floats to a CSS standard hex string (e.g., '#ffffff')"""
    r, g, b = map(int, np.clip(rgb_color, 0, 255))
    return f"#{r:02x}{g:02x}{b:02x}"

@app.post("/extract-colors")
async def extract_colors(request: ImageRequest):
    try:
        # 1. Download the image into memory
        response = requests.get(request.url, timeout=5)
        response.raise_for_status()
        
        # 2. Open the image using Pillow (PIL) and ensure it's in RGB format
        image_bytes = io.BytesIO(response.content)
        img = Image.open(image_bytes).convert("RGB")
        
        # 3. The Performance Trick: Resize to 100x100.
        # Running K-Means on 10,000 pixels is instantaneous, whereas millions of pixels would lag.
        img = img.resize((30, 30))
        
        # 4. Convert the image pixels into a 3D dataset: (R, G, B) coordinates
        pixel_array = np.array(img)  # Shape is (100, 100, 3)
        pixels = pixel_array.reshape(-1, 3)  # Flatten to (10000, 3)
        
        # 5. Run K-Means Clustering to find the 2 most dominant color groups
        kmeans = KMeans(n_clusters=2, n_init=10, random_state=42)
        kmeans.fit(pixels)
        
        # 6. Extract the coordinates of the 2 cluster centers
        centroids = kmeans.cluster_centers_
        
        # 7. Identify which color is actually more dominant by counting the pixels in each cluster
        labels = kmeans.labels_
        counts = np.bincount(labels)
        
        # Sort so that the most common color is labeled as 'primary'
        dominant_indices = np.argsort(counts)[::-1]
        primary_rgb = centroids[dominant_indices[0]]
        accent_rgb = centroids[dominant_indices[1]]
        
        # 8. Convert to hex strings and return
        return {
            "primary": rgb_to_hex(primary_rgb),
            "accent": rgb_to_hex(accent_rgb)
        }
        
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=400, detail=f"Failed to download image from URL: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)