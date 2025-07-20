import google.generativeai as genai
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

def generate_code_from_image(image_bytes, object_name=None):
    try:
        # Read prompt template from Jinja2 file
        with open(os.path.join(os.path.dirname(__file__), 'prompt.j2'), 'r', encoding='utf-8') as f:
            prompt_template = f.read()
        print("Prompt template loaded")
        # Render prompt using Jinja2 (ocr_text để trống, sẽ được Gemini OCR)
        prompt = Template(prompt_template).render(ocr_text="", object_name=object_name or "")
        print(prompt)
        print("Prompt ready")
        API_KEY = os.environ.get("GEMINI_API_KEY")
        print("API_KEY:", API_KEY)
        genai.configure(api_key=API_KEY)
        model = genai.GenerativeModel('gemini-2.0-flash-exp')
        try:
            # Gửi prompt + ảnh cho Gemini, để Gemini tự OCR và sinh code
            response = model.generate_content([
                {"text": prompt},
                {"mime_type": "image/png", "data": image_bytes}
            ])
            print("Gemini response:", response)
            generated_code = response.text
            # Loại bỏ markdown code block nếu có
            generated_code = strip_markdown_codeblock(generated_code)
            return generated_code
        except Exception as e:
            print("Error when calling Gemini API:", str(e))
            traceback.print_exc()
            raise
    except Exception as e:
        print("Error in generate_code_from_image:", str(e))
        traceback.print_exc()
        raise
