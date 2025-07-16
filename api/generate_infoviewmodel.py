import google.generativeai as genai
from ocr import get_ocr_text_from_image
import os
import tempfile
import traceback
from jinja2 import Template
import re

def strip_markdown_codeblock(text):
    # Loại bỏ code block markdown nếu có
    pattern = r"^```[a-zA-Z]*\n([\s\S]*?)\n```$"
    match = re.match(pattern, text.strip())
    if match:
        return match.group(1)
    return text

def generate_code_from_image(image_bytes):
    # Save image_bytes to a temp file
    with tempfile.NamedTemporaryFile(delete=False, suffix='.png') as tmp:
        tmp.write(image_bytes)
        tmp_path = tmp.name
    try:
        # Get OCR text
        ocr_text = get_ocr_text_from_image(tmp_path)
        print("OCR text:", ocr_text)
        if ocr_text is None:
            raise Exception("Failed to get OCR text from the image.")
        # Read prompt template from Jinja2 file
        with open(os.path.join(os.path.dirname(__file__), 'prompt.j2'), 'r', encoding='utf-8') as f:
            prompt_template = f.read()
        print("Prompt template loaded")
        # Render prompt using Jinja2
        prompt = Template(prompt_template).render(ocr_text=ocr_text)
        print(prompt)
        print("Prompt ready")
        API_KEY = os.environ.get("GEMINI_API_KEY")
        print("API_KEY:", API_KEY)
        genai.configure(api_key=API_KEY)
        model = genai.GenerativeModel('gemini-2.0-flash-exp')
        try:
            response = model.generate_content(prompt)
            print("Gemini response:", response)
            generated_code = response.text
            # Loại bỏ markdown code block nếu có
            generated_code = strip_markdown_codeblock(generated_code)
            return generated_code
        except Exception as e:
            print("Error when calling Gemini API:", str(e))
            traceback.print_exc()
            raise
    finally:
        try:
            os.remove(tmp_path)
        except Exception:
            pass
