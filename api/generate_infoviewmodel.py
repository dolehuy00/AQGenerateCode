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
        prompt = f"""You are an advanced AI capable of analyzing images and generating structured data representations. Your task is to process an image containing a table and extract relevant information to generate a TypeScript interface and corresponding mock data.\nAnalyze the provided image to identify the table's actual column headers and content. Based on the extracted data, generate:\nA TypeScript interface named IInfoViewModel that includes all identified attributes with their appropriate data types. Ensure that all attributes are optional (using ?) to account for cases where data might be undefined.\ntranslate Attributes of interface in english\nAn array named mockData of type IInfoViewModel[], populated with mock entries based on the extracted content. If any data is missing in the table, represent it as undefined in the mock data.\nReturn in plain text without markdown\nNote:\nThe following is just a sample output format and does not reflect the data in the image. Use it as a structural reference only:\n\n// Example output format:\nexport interface IInfoViewModel {{\n    id?: number;//id\n    stringColumn?: string; //Cột chuỗi\n    numberColumn?: number; //Cột số\n    dateColumn1?: string; //Cột ngày 1 dd/mm/yyyy\n    dateColumn2?: string; //Cột ngày 2 dd/mm/yyyy\n    booleanColumn?: boolean; //Cột boolean\n    priceColumn?: number; //Cột tiền\n}}\n\n\nexport const mockDataRead: IInfoViewModel[] = [\n    {{\n        id: 1,\n        stringColumn: \"Example String\",\n        numberColumn: 123,\n        dateColumn1: \"01/01/2023\",\n        dateColumn2: \"02/01/2023\",\n        booleanColumn: true,\n        priceColumn: 100000,\n        \n    }},\n    {{\n        id: 2,\n        stringColumn: \"Another String\",\n        numberColumn: 456,\n        dateColumn1: \"02/02/2023\",\n        dateColumn2: \"03/02/2023\",\n        booleanColumn: false,\n        priceColumn: 200000,\n    }},\n    {{\n        id: 3,\n        stringColumn: \"More Strings\",\n        numberColumn: 789,\n        dateColumn1: \"03/03/2023\",\n        dateColumn2: \"04/03/2023\",\n        booleanColumn: true,\n        priceColumn: 300000,\n    }},\n    {{\n        id: 4,\n        stringColumn: \"Fourth String\",\n        numberColumn: 101,\n        dateColumn1: \"04/04/2023\",\n        dateColumn2: \"05/04/2023\",\n        booleanColumn: false,\n        priceColumn: 400000,\n    }},\n]\n\nBe sure that the actual structure of the interface and mock data you generate corresponds to the real data found in the image, not the sample above. Only return the TypeScript code block with the interface and mock data. Do not include any explanations, descriptions, or other content.\n\nHere is the OCR text from the image:\n---\n{ocr_text}\n---"""
        # Configure your API key
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

# Nếu chạy trực tiếp file thì giữ nguyên hành vi cũ
if __name__ == "__main__":
    image_path_for_ocr = r"image2.png"
    try:
        print(f"Getting OCR text for {image_path_for_ocr} using ocr.py...")
        ocr_text = get_ocr_text_from_image(image_path_for_ocr)
        if ocr_text is None:
            print("Error: Failed to get OCR text from the image.")
            exit()
        print("OCR text successfully obtained.")
    except Exception as e:
        print(f"An error occurred during the OCR step: {e}")
        exit()
    prompt = f"""You are an advanced AI capable of analyzing images and generating structured data representations. Your task is to process an image containing a table and extract relevant information to generate a TypeScript interface and corresponding mock data.\nAnalyze the provided image to identify the table's actual column headers and content. Based on the extracted data, generate:\nA TypeScript interface named IInfoViewModel that includes all identified attributes with their appropriate data types. Ensure that all attributes are optional (using ?) to account for cases where data might be undefined.\ntranslate Attributes of interface in english\nAn array named mockData of type IInfoViewModel[], populated with mock entries based on the extracted content. If any data is missing in the table, represent it as undefined in the mock data.\nReturn in plain text without markdown\nNote:\nThe following is just a sample output format and does not reflect the data in the image. Use it as a structural reference only:\n\n// Example output format:\nexport interface IInfoViewModel {{\n    id?: number;//id\n    stringColumn?: string; //Cột chuỗi\n    numberColumn?: number; //Cột số\n    dateColumn1?: string; //Cột ngày 1 dd/mm/yyyy\n    dateColumn2?: string; //Cột ngày 2 dd/mm/yyyy\n    booleanColumn?: boolean; //Cột boolean\n    priceColumn?: number; //Cột tiền\n}}\n\n\nexport const mockDataRead: IInfoViewModel[] = [\n    {{\n        id: 1,\n        stringColumn: \"Example String\",\n        numberColumn: 123,\n        dateColumn1: \"01/01/2023\",\n        dateColumn2: \"02/01/2023\",\n        booleanColumn: true,\n        priceColumn: 100000,\n        \n    }},\n    {{\n        id: 2,\n        stringColumn: \"Another String\",\n        numberColumn: 456,\n        dateColumn1: \"02/02/2023\",\n        dateColumn2: \"03/02/2023\",\n        booleanColumn: false,\n        priceColumn: 200000,\n    }},\n    {{\n        id: 3,\n        stringColumn: \"More Strings\",\n        numberColumn: 789,\n        dateColumn1: \"03/03/2023\",\n        dateColumn2: \"04/03/2023\",\n        booleanColumn: true,\n        priceColumn: 300000,\n    }},\n    {{\n        id: 4,\n        stringColumn: \"Fourth String\",\n        numberColumn: 101,\n        dateColumn1: \"04/04/2023\",\n        dateColumn2: \"05/04/2023\",\n        booleanColumn: false,\n        priceColumn: 400000,\n    }},\n]\n\nBe sure that the actual structure of the interface and mock data you generate corresponds to the real data found in the image, not the sample above. Only return the TypeScript code block with the interface and mock data. Do not include any explanations, descriptions, or other content.\n\nHere is the OCR text from the image:\n---\n{ocr_text}\n---"""
    API_KEY = os.environ.get("GEMINI_API_KEY")
    genai.configure(api_key=API_KEY)
    model = genai.GenerativeModel('gemini-1.5-flash-latest')
    try:
        response = model.generate_content(prompt)
        generated_code = response.text
    except Exception as e:
        print(f"Error calling Gemini API: {e}")
        exit()
    output_file = "IInfoViewModel.ts"
    try:
        with open(output_file, "w", encoding="utf-8") as f:
            f.write(generated_code)
        print(f"Successfully generated and saved {output_file}")
    except IOError as e:
        print(f"Error writing to file {output_file}: {e}")
    print("Workflow script updated to use ocr.py for OCR.") 