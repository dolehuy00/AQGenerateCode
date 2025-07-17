import google.generativeai as genai
from dotenv import load_dotenv
import os
import mimetypes
import base64
import tempfile

# Load the API key from a .env file
load_dotenv()
gemini_api_key = os.environ.get("GEMINI_API_KEY")

if not gemini_api_key:
    print("Error: GEMINI_API_KEY not found in .env file.")
    print("Please create a .env file in the same directory with GEMINI_API_KEY=<your_api_key>")
    exit()

def get_ocr_text_from_image(image_path):
    """Performs OCR on a local image file using Gemini API and returns the text.

    Args:
        image_path (str): The path to the local image file.

    Returns:
        str: The extracted OCR text, or None if an error occurs.
    """
    try:
        # Read image bytes
        with open(image_path, "rb") as f:
            image_bytes = f.read()
        # Configure Gemini
        genai.configure(api_key=gemini_api_key)
        # Luôn dùng model gemini-2.0-flash
        model = genai.GenerativeModel('gemini-2.0-flash')
        # Prompt yêu cầu OCR
        prompt = "Extract all text from this image as accurately as possible. Return only the plain text."
        response = model.generate_content([
            {"text": prompt},
            {"mime_type": "image/png", "data": image_bytes}
        ])
        # Lấy text trả về
        ocr_text = response.text.strip()
        print("Gemini OCR response:", ocr_text)
        return ocr_text
    except FileNotFoundError:
        print(f"Error: Image file not found at {image_path}")
        return None
    except Exception as e:
        print(f"Error during Gemini OCR API call: {e}")
        return None

# Example usage:
if __name__ == "__main__":
    image_file_path = r"C:\Users\BaoBui\Desktop\generate\image1.png" # Replace with your image path
    ocr_result = get_ocr_text_from_image(image_file_path)

    if ocr_result:
        print("\n--- Extracted OCR Text ---")
        print(ocr_result)
        print("------------------------")
    else:
        print("\nFailed to extract OCR text.")
