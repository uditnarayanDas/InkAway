from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import base64
import io
import os
import requests
import logging
from PIL import Image
import tempfile
import uuid
from datetime import datetime, timedelta
import threading
import time
from functools import wraps
import hashlib
import json
from werkzeug.utils import secure_filename
import mimetypes

# Initialize Flask app
app = Flask(__name__)

# Configure CORS for frontend communication
CORS(app, origins=['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:3000', 'http://127.0.0.1:5173'])

# Configure Rate Limiting
limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"],
    storage_uri="memory://"
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuration
MAX_FILE_SIZE = 10 * 1024 * 1024  
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp'}
TEMP_STORAGE_DURATION = 3600  

# Hugging Face Configuration - Use environment variables
HF_API_TOKEN = os.getenv("HF_API_TOKEN", "")  
HF_MODEL_ENDPOINT = os.getenv("HF_MODEL_ENDPOINT", "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-Fill-dev")

# In-memory temporary storage for processed images
temp_storage = {}
storage_lock = threading.Lock()

# Fix: correct main worker detection
is_main_worker = os.environ.get('WERKZEUG_RUN_MAIN') == 'true'

class ImageProcessor:
    """Handle image processing operations"""
    
    @staticmethod
    def validate_image_base64(base64_string):
        """Validate base64 image string"""
        try:
            if ',' in base64_string:
                _, base64_string = base64_string.split(',', 1)
            
            image_data = base64.b64decode(base64_string)

            # Fix: size check for base64 uploads
            if len(image_data) > MAX_FILE_SIZE:
                return False, "File size exceeds 10MB limit", None
            
            try:
                img = Image.open(io.BytesIO(image_data))
                img.verify()
                img = Image.open(io.BytesIO(image_data))

                # Fix: ensure it's an image MIME type
                mime_type = Image.open(io.BytesIO(image_data)).get_format_mimetype()
                if not mime_type or not mime_type.startswith("image/"):
                    return False, "Unsupported file type", None

                format_type = img.format.lower() if img.format else 'jpeg'
                return True, "Valid image", format_type
            except:
                return False, "Invalid image format", None
                
        except Exception as e:
            return False, f"Invalid base64 data: {str(e)}", None
    
    @staticmethod
    def optimize_image_for_api(base64_string, preserve_transparency=True):
        """Optimize image before sending to API"""
        try:
            if ',' in base64_string:
                base64_string = base64_string.split(',')[1]
            
            image_data = base64.b64decode(base64_string)
            img = Image.open(io.BytesIO(image_data))
            
            original_format = img.format if img.format else 'JPEG'
            has_transparency = img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info)
            
            if preserve_transparency and has_transparency:
                output_format = 'PNG'
                save_kwargs = {'format': 'PNG', 'optimize': True}
            else:
                output_format = 'JPEG'
                if img.mode == 'RGBA':
                    background = Image.new('RGB', img.size, (255, 255, 255))
                    background.paste(img, mask=img.split()[3])
                    img = background
                elif img.mode not in ['RGB', 'L']:
                    img = img.convert('RGB')
                save_kwargs = {'format': 'JPEG', 'quality': 95, 'optimize': True}
            
            max_dimension = 2048
            if img.width > max_dimension or img.height > max_dimension:
                img.thumbnail((max_dimension, max_dimension), Image.Resampling.LANCZOS)
            
            buffered = io.BytesIO()
            img.save(buffered, **save_kwargs)
            buffered.seek(0)
            
            return buffered, output_format.lower(), original_format
            
        except Exception as e:
            logger.error(f"Image optimization error: {str(e)}")
            raise

class HuggingFaceAPI:
    """Handle Hugging Face API interactions"""
    
    @staticmethod
    def process_image_with_editing_model(image_bytes, prompt):
        try:
            if not HF_API_TOKEN:
                raise Exception("HF_API_TOKEN not configured. Please set your Hugging Face API token.")
            
            headers = {
                "Authorization": f"Bearer {HF_API_TOKEN}"
            }
            
            if "instruct-pix2pix" in HF_MODEL_ENDPOINT.lower():
                files = {
                    'file': ('image.jpg', image_bytes, 'image/jpeg')
                }
                data = {'inputs': prompt}
                response = requests.post(HF_MODEL_ENDPOINT, headers=headers, files=files, data=data, timeout=60)
                
            elif "flux" in HF_MODEL_ENDPOINT.lower() or "fill" in HF_MODEL_ENDPOINT.lower():
                files = {
                    'inputs': ('image.jpg', image_bytes, 'image/jpeg')
                }
                data = {
                    'parameters': json.dumps({
                        'prompt': prompt,
                        'guidance_scale': 7.5,
                        'num_inference_steps': 30,
                        'negative_prompt': 'blurry, low quality, distorted, watermark'
                    })
                }
                response = requests.post(HF_MODEL_ENDPOINT, headers=headers, files=files, data=data, timeout=60)
                
            else:
                files = {
                    'file': ('image.jpg', image_bytes, 'image/jpeg')
                }
                data = {
                    'inputs': prompt,
                    'parameters': json.dumps({'guidance_scale': 7.5, 'num_inference_steps': 50})
                }
                response = requests.post(HF_MODEL_ENDPOINT, headers=headers, files=files, data=data, timeout=60)
            
            if response.status_code == 200:
                content_type = response.headers.get('content-type', '')
                if 'image' in content_type:
                    return base64.b64encode(response.content).decode('utf-8')
                elif 'json' in content_type:
                    result = response.json()
                    if isinstance(result, list) and len(result) > 0:
                        if 'image' in result[0]:
                            return result[0]['image']
                        elif 'base64' in result[0]:
                            return result[0]['base64']
                    elif isinstance(result, dict):
                        if 'image' in result:
                            return result['image']
                        elif 'output' in result:
                            return result['output']
                    logger.error(f"Unexpected JSON response: {json.dumps(result)[:500]}")
                    raise Exception("Could not extract image from API response")
                else:
                    return base64.b64encode(response.content).decode('utf-8')
            elif response.status_code == 503:
                raise Exception("Model is loading. Please try again later.")
            else:
                error_msg = f"API error: {response.status_code}"
                try:
                    error_detail = response.json()
                    error_msg += f" - {error_detail.get('error', response.text[:200])}"
                except:
                    error_msg += f" - {response.text[:200]}"
                raise Exception(error_msg)
                
        except requests.exceptions.Timeout:
            raise Exception("API request timed out. Please try again.")
        except requests.exceptions.RequestException as e:
            raise Exception(f"API request failed: {str(e)}")
        except Exception as e:
            logger.error(f"Hugging Face API error: {str(e)}")
            raise

class TempStorage:
    """Manage temporary storage of processed images"""
    
    @staticmethod
    def store_image(image_base64, format_type='webp'):
        """Store image temporarily, default to webp (HF output)"""
        image_id = str(uuid.uuid4())
        timestamp = datetime.now()
        with storage_lock:
            temp_storage[image_id] = {
                'data': image_base64,
                'format': format_type,
                'timestamp': timestamp,
                'expires': timestamp + timedelta(seconds=TEMP_STORAGE_DURATION)
            }
        return image_id
    
    @staticmethod
    def retrieve_image(image_id):
        with storage_lock:
            if image_id in temp_storage:
                image_data = temp_storage[image_id]
                if datetime.now() < image_data['expires']:
                    return image_data['data'], image_data.get('format', 'webp')
                else:
                    del temp_storage[image_id]
        return None, None
    
    @staticmethod
    def cleanup_expired():
        current_time = datetime.now()
        with storage_lock:
            expired_ids = [img_id for img_id, data in temp_storage.items() if current_time > data['expires']]
            for img_id in expired_ids:
                del temp_storage[img_id]
        if expired_ids:
            logger.info(f"Cleaned up {len(expired_ids)} expired images")

def periodic_cleanup():
    while True:
        time.sleep(300)
        try:
            TempStorage.cleanup_expired()
        except Exception as e:
            logger.error(f"Cleanup error: {str(e)}")

if is_main_worker or app.debug:
    cleanup_thread = threading.Thread(target=periodic_cleanup, daemon=True)
    cleanup_thread.start()
    logger.info("Started cleanup thread")
