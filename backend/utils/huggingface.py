import requests
from config import HF_API_KEY

def remove_ink(image_file):
    headers = {"Authorization": f"Bearer {HF_API_KEY}"}
    response = requests.post(
        "https://api-inference.huggingface.co/models/runwayml/stable-diffusion-inpainting",
        headers=headers,
        files={"file": image_file}
    )
    if response.status_code != 200:
        raise Exception("Hugging Face API error: " + response.text)
    return response.content
