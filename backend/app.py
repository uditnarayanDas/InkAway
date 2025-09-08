from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import base64
import io
import os
import logging
from PIL import Image
import tempfile
import uuid
from datetime import datetime, timedelta
import threading
import time
import shutil
from werkzeug.utils import secure_filename
from dotenv import load_dotenv
import gradio as gr
from gradio_client import Client, handle_file


load_dotenv()

# Only import if you have the endpoint set
HF_MODEL_ENDPOINT = os.getenv("HF_MODEL_ENDPOINT")
HF_TOKEN = os.getenv("HF_API_TOKEN")

os.environ["HF_API_TOKEN"] = HF_TOKEN 

HAS_GRADIO = True

if HAS_GRADIO and HF_MODEL_ENDPOINT and HF_TOKEN:
    client = Client(HF_MODEL_ENDPOINT) 
else:
    client = None

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

            if len(image_data) > MAX_FILE_SIZE:
                return False, "File size exceeds 10MB limit", None
            
            try:
                img = Image.open(io.BytesIO(image_data))
                img.verify()
                img = Image.open(io.BytesIO(image_data))
                
                format_type = img.format.lower() if img.format else 'jpeg'
                if format_type not in ['jpeg', 'jpg', 'png', 'gif', 'bmp', 'webp']:
                    return False, "Unsupported file type", None
                    
                return True, "Valid image", format_type
            except:
                return False, "Invalid image format", None
                
        except Exception as e:
            return False, f"Invalid base64 data: {str(e)}", None
    
    @staticmethod
    def optimize_image_for_api(base64_string, max_dimension=1024):
        """Optimize image before sending to API"""
        try:
            if ',' in base64_string:
                base64_string = base64_string.split(',')[1]
            
            image_data = base64.b64decode(base64_string)
            img = Image.open(io.BytesIO(image_data))
            
            # Convert RGBA to RGB if needed
            if img.mode in ('RGBA', 'LA', 'P'):
                background = Image.new('RGB', img.size, (255, 255, 255))
                if img.mode == 'RGBA':
                    background.paste(img, mask=img.split()[3])
                else:
                    background.paste(img)
                img = background
            elif img.mode not in ['RGB', 'L']:
                img = img.convert('RGB')
            
            # Resize if too large
            if img.width > max_dimension or img.height > max_dimension:
                img.thumbnail((max_dimension, max_dimension), Image.Resampling.LANCZOS)
            
            # Save as JPEG
            buffered = io.BytesIO()
            img.save(buffered, format='JPEG', quality=95, optimize=True)
            buffered.seek(0)
            
            return buffered, 'jpeg'
            
        except Exception as e:
            logger.error(f"Image optimization error: {str(e)}")
            raise

class HuggingFaceAPI:
    """Handle Hugging Face API interactions"""
    
    @staticmethod
    def process_image_with_gradio(image_bytes, prompt):
        """Process image using Gradio API"""




        if not HAS_GRADIO or client:
            raise Exception("Gradio client not installed")
            
        if not HF_MODEL_ENDPOINT:
            raise Exception("HF_MODEL_ENDPOINT not configured")
            
        temp_input = None
        temp_output = None
        
        try:
            # Save input image temporarily
            with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as tmp:
                tmp.write(image_bytes)
                temp_input = tmp.name

            # Initialize Gradio client
            client = Client(HF_MODEL_ENDPOINT)
            
            # Call the API
            result = client.predict(
                input_image=handle_file(temp_input),
                prompt=prompt,
                seed=0,
                randomize_seed=True,
                guidance_scale=2.5,
                steps=28,
                api_name="/infer"
            )

            # Handle the result
            if isinstance(result, tuple) and len(result) > 0:
                output_info = result[0]
                if isinstance(output_info, dict) and 'path' in output_info:
                    temp_output = output_info['path']
                elif isinstance(output_info, str):
                    temp_output = output_info
                else:
                    raise Exception(f"Unexpected result format: {type(output_info)}")
            else:
                raise Exception(f"Unexpected result type: {type(result)}")

            # Read the output file
            if temp_output and os.path.exists(temp_output):
                with open(temp_output, "rb") as f:
                    output_bytes = f.read()
                return base64.b64encode(output_bytes).decode("utf-8")
            else:
                raise Exception(f"Output file not found: {temp_output}")

        except Exception as e:
            logger.error(f"Gradio API error: {str(e)}")
            raise
        finally:
            # Cleanup temporary files
            if temp_input and os.path.exists(temp_input):
                try:
                    os.remove(temp_input)
                except:
                    pass
            if temp_output and os.path.exists(temp_output):
                try:
                    os.remove(temp_output)
                except:
                    pass
    
    @staticmethod
    def process_image_fallback(image_bytes):
        """Fallback processing - just returns the original image"""
        logger.warning("Using fallback image processing (no actual processing)")
        return base64.b64encode(image_bytes).decode("utf-8")

class TempStorage:
    """Manage temporary storage of processed images"""
    
    @staticmethod
    def store_image(image_base64, format_type='jpeg'):
        """Store image temporarily"""
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
                    return image_data['data'], image_data.get('format', 'jpeg')
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
    """Periodic cleanup thread"""
    while True:
        time.sleep(300)
        try:
            TempStorage.cleanup_expired()
        except Exception as e:
            logger.error(f"Cleanup error: {str(e)}")

# Start cleanup thread
if is_main_worker or app.debug:
    cleanup_thread = threading.Thread(target=periodic_cleanup, daemon=True)
    cleanup_thread.start()
    logger.info("Started cleanup thread")

@app.route("/api/process-image", methods=["POST"])
def process_image():
    """Main endpoint for processing images"""
    try:
        image_bytes = None
        
        # Check if file is in request.files
        if 'file' in request.files:
            file = request.files['file']
            if file.filename == '':
                return jsonify({"error": "Empty filename"}), 400
            
            # Validate file extension
            filename = secure_filename(file.filename)
            if '.' in filename:
                ext = filename.rsplit('.', 1)[1].lower()
                if ext not in ALLOWED_EXTENSIONS:
                    return jsonify({"error": f"File type .{ext} not supported"}), 400
            
            image_bytes = file.read()
            if len(image_bytes) > MAX_FILE_SIZE:
                return jsonify({"error": "File size exceeds 10MB limit"}), 400
                
            base64_image = base64.b64encode(image_bytes).decode('utf-8')

        # Check if JSON contains base64 image
        elif request.is_json and 'image' in request.json:
            base64_image = request.json['image']
            if ',' in base64_image:
                base64_image = base64_image.split(',')[1]
            
            # Validate base64 image
            is_valid, message, format_type = ImageProcessor.validate_image_base64(base64_image)
            if not is_valid:
                return jsonify({"error": message}), 400
                
            image_bytes = base64.b64decode(base64_image)

        else:
            return jsonify({"error": "No image provided"}), 400

        # Optimize image for API
        buffered, output_format = ImageProcessor.optimize_image_for_api(
            base64.b64encode(image_bytes).decode('utf-8')
        )

        # Process image
        try:
            if HAS_GRADIO and HF_MODEL_ENDPOINT:
                # Use Gradio API
                result_base64 = HuggingFaceAPI.process_image_with_gradio(
                    buffered.getvalue(),
                    prompt="Remove all the InkMarks/penmark/handwritten text and enhance texture naturally"
                )
            else:
                # Use fallback (returns original)
                logger.warning("No Gradio API configured, returning original image")
                result_base64 = HuggingFaceAPI.process_image_fallback(buffered.getvalue())
        except Exception as e:
            logger.error(f"Processing error: {str(e)}")
            # Return original image on error
            result_base64 = base64.b64encode(buffered.getvalue()).decode('utf-8')

        # Store temporarily
        image_id = TempStorage.store_image(result_base64, format_type=output_format)

        # Return with proper base64 format for frontend
        return jsonify({
            "image_id": image_id, 
            "image": f"data:image/{output_format};base64,{result_base64}"
        })

    except Exception as e:
        logger.error(f"Error in /api/process-image: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route("/api/download/<image_id>", methods=["GET"])
def download_image(image_id):
    """Download processed image"""
    image_base64, format_type = TempStorage.retrieve_image(image_id)
    if not image_base64:
        return jsonify({"error": "Image not found or expired"}), 404

    try:
        image_bytes = base64.b64decode(image_base64)
        return send_file(
            io.BytesIO(image_bytes), 
            mimetype=f"image/{format_type}", 
            download_name=f"cleaned_image.{format_type}"
        )
    except Exception as e:
        logger.error(f"Download error: {str(e)}")
        return jsonify({"error": "Failed to download image"}), 500

@app.route("/api/health", methods=["GET"])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "gradio_available": HAS_GRADIO,
        "endpoint_configured": bool(HF_MODEL_ENDPOINT)
    })

if __name__ == "__main__":
    print(f"Gradio Client Available: {HAS_GRADIO}")
    print(f"HF Endpoint Configured: {bool(HF_MODEL_ENDPOINT)}")
    if not HAS_GRADIO:
        print("Warning: Install gradio_client for full functionality: pip install gradio_client")
    if not HF_MODEL_ENDPOINT:
        print("Warning: Set HF_MODEL_ENDPOINT environment variable for Gradio API")
    
    app.run(host="0.0.0.0", port=5000, debug=True)