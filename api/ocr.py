from mistralai import Mistral
from dotenv import load_dotenv
import os
import mimetypes
import base64

# Load the API key from a .env file
load_dotenv()
mistral_api_key = os.environ.get("MISTRAL_API_KEY")

if not mistral_api_key:
    print("Error: MISTRAL_API_KEY not found in .env file.")
    print("Please create a .env file in the same directory with MISTRAL_API_KEY=<your_api_key>")
    exit()

# Initialize the Mistral client
client = Mistral(api_key=mistral_api_key)

def load_image_base64(image_path):
    mime_type, _ = mimetypes.guess_type(image_path)
    if mime_type is None:
        mime_type = 'application/octet-stream'
    with open(image_path, "rb") as image_file:
        image_data = image_file.read()
    base64_encoded = base64.b64encode(image_data).decode('utf-8')
    base64_url = f"data:{mime_type};base64,{base64_encoded}"
    return base64_url

def get_ocr_text_from_image(image_path):
    """Performs OCR on a local image file using Mistral API and returns the text.

    Args:
        image_path (str): The path to the local image file.

    Returns:
        str: The extracted OCR text, or None if an error occurs.
    """
    try:
        # Load and encode the image
        base64_image_url = load_image_base64(image_path)

        # Call the Mistral OCR API
        print(f"Calling Mistral OCR API for {image_path}...")
        ocr_response = client.ocr.process(
            model="mistral-ocr-latest",
            document={
                "type": 'image_url',
                "image_url": base64_image_url,
            },
        )

        # Extract text from the response
        # Assuming the main text is in markdown of the first page for image OCR
        extracted_text = ""
        if hasattr(ocr_response, 'pages') and isinstance(ocr_response.pages, list) and len(ocr_response.pages) > 0:
            first_page = ocr_response.pages[0]
            if hasattr(first_page, 'markdown'):
                extracted_text = first_page.markdown
            elif hasattr(first_page, 'text'): # Fallback to 'text' attribute if markdown is not present
                 extracted_text = first_page.text
            elif isinstance(first_page, dict) and 'text' in first_page:
                 extracted_text = first_page['text']
        elif hasattr(ocr_response, 'text'): # Handle case where response might have a top-level text field
             extracted_text = ocr_response.text
        else:
            print("Response structure:", ocr_response)
            extracted_text = str(ocr_response.pages[0].markdown) # Fallback to string representation

        print("Mistral OCR API call successful.")
        return extracted_text

    except FileNotFoundError:
        print(f"Error: Image file not found at {image_path}")
        return None
    except Exception as e:
        print(f"Error during Mistral OCR API call: {e}")
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
