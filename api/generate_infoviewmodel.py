import google.generativeai as genai
from ocr import get_ocr_text_from_image
import os
import tempfile

def generate_code_from_image(image_bytes):
    # Save image_bytes to a temp file
    with tempfile.NamedTemporaryFile(delete=False, suffix='.png') as tmp:
        tmp.write(image_bytes)
        tmp_path = tmp.name
    try:
        # Get OCR text
        ocr_text = get_ocr_text_from_image(tmp_path)
        if ocr_text is None:
            raise Exception("Failed to get OCR text from the image.")
        # Prepare prompt
        prompt = f"""You are an advanced AI capable of analyzing images and generating structured data representations. Your task is to process an image containing a table and extract relevant information to generate a TypeScript interface and corresponding mock data.\nAnalyze the provided image to identify the table's actual column headers and content. Based on the extracted data, generate:\nA TypeScript interface named IInfoViewModel that includes all identified attributes with their appropriate data types. Ensure that all attributes are optional (using ?) to account for cases where data might be undefined. Use Vietnamese attribute names in the interface, formatted in camelCase, and include a comment in English to describe each attribute.\nAn array named mockData of type IInfoViewModel[], populated with mock entries based on the extracted content. If any data is missing in the table, represent it as undefined in the mock data. Correct any spelling or typographical errors in the extracted data to ensure accuracy in the mock data.\nReturn in plain text without markdown.\nNote:\nThe following is just a sample output format and does not reflect the data in the image. Use it as a structural reference only:\n\n// Example output format:\nexport interface IInfoViewModel {{\n    id?: number; // ID\n    cotChuoi?: string; // String column\n    cotSo?: number; // Number column\n    cotNgay1?: string; // Date column 1 dd/mm/yyyy\n    cotNgay2?: string; // Date column 2 dd/mm/yyyy\n    cotBoolean?: boolean; // Boolean column\n    cotTien?: number; // Price column\n}}\n\n\nexport const mockData: IInfoViewModel[] = [\n    {{\n        id: 1,\n        cotChuoi: "Example String",\n        cotSo: 123,\n        cotNgay1: "01/01/2023",\n        cotNgay2: "02/01/2023",\n        cotBoolean: true,\n        cotTien: 100000,\n    }},\n    {{\n        id: 2,\n        cotChuoi: "Another String",\n        cotSo: 456,\n        cotNgay1: "02/02/2023",\n        cotNgay2: "03/02/2023",\n        cotBoolean: false,\n        cotTien: 200000,\n    }},\n    {{\n        id: 3,\n        cotChuoi: "More Strings",\n        cotSo: 789,\n        cotNgay1: "03/03/2023",\n        cotNgay2: "04/03/2023",\n        cotBoolean: true,\n        cotTien: 300000,\n    }},\n    {{\n        id: 4,\n        cotChuoi: "Fourth String",\n        cotSo: 101,\n        cotNgay1: "04/04/2023",\n        cotNgay2: "05/04/2023",\n        cotBoolean: false,\n        cotTien: 400000,\n    }},\n]\n\nBe sure that the actual structure of the interface and mock data you generate corresponds to the real data found in the image, not the sample above. Use Vietnamese attribute names in camelCase, correct any spelling or typographical errors in the extracted data, and only return the TypeScript code block with the interface and mock data. Do not include any explanations, descriptions, or other content.\n\nHere is the OCR text from the image:\n---\n{ocr_text}\n---"""# Configure your API key
        API_KEY = os.environ.get("GEMINI_API_KEY")
        genai.configure(api_key=API_KEY)
        model = genai.GenerativeModel('gemini-1.5-flash-latest')
        response = model.generate_content(prompt)
        generated_code = response.text
        return generated_code
    finally:
        try:
            os.remove(tmp_path)
        except Exception:
            pass
