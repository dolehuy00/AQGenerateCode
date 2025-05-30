import google.generativeai as genai
from ocr import get_ocr_text_from_image
import os

image_path_for_ocr = r"image2.png"

try:
    # Get OCR text using the function from ocr.py
    print(f"Getting OCR text for {image_path_for_ocr} using ocr.py...")
    ocr_text = get_ocr_text_from_image(image_path_for_ocr)

    if ocr_text is None:
        print("Error: Failed to get OCR text from the image.")
        exit()

    print("OCR text successfully obtained.")

except Exception as e:
    print(f"An error occurred during the OCR step: {e}")
    exit()


# --- Step 2: Prepare the Prompt ---
prompt = f"""You are an advanced AI capable of analyzing images and generating structured data representations. Your task is to process an image containing a table and extract relevant information to generate a TypeScript interface and corresponding mock data.
Analyze the provided image to identify the table's actual column headers and content. Based on the extracted data, generate:
A TypeScript interface named IInfoViewModel that includes all identified attributes with their appropriate data types. Ensure that all attributes are optional (using ?) to account for cases where data might be undefined.
translate Attributes of interface in english
An array named mockData of type IInfoViewModel[], populated with mock entries based on the extracted content. If any data is missing in the table, represent it as undefined in the mock data.
Return in plain text without markdown
Note:
The following is just a sample output format and does not reflect the data in the image. Use it as a structural reference only:

// Example output format:
export interface IInfoViewModel {{
    id?: number;//id
    stringColumn?: string; //Cột chuỗi
    numberColumn?: number; //Cột số
    dateColumn1?: string; //Cột ngày 1 dd/mm/yyyy
    dateColumn2?: string; //Cột ngày 2 dd/mm/yyyy
    booleanColumn?: boolean; //Cột boolean
    priceColumn?: number; //Cột tiền
}}


export const mockDataRead: IInfoViewModel[] = [
    {{
        id: 1,
        stringColumn: "Example String",
        numberColumn: 123,
        dateColumn1: "01/01/2023",
        dateColumn2: "02/01/2023",
        booleanColumn: true,
        priceColumn: 100000,
        
    }},
    {{
        id: 2,
        stringColumn: "Another String",
        numberColumn: 456,
        dateColumn1: "02/02/2023",
        dateColumn2: "03/02/2023",
        booleanColumn: false,
        priceColumn: 200000,
    }},
    {{
        id: 3,
        stringColumn: "More Strings",
        numberColumn: 789,
        dateColumn1: "03/03/2023",
        dateColumn2: "04/03/2023",
        booleanColumn: true,
        priceColumn: 300000,
    }},
    {{
        id: 4,
        stringColumn: "Fourth String",
        numberColumn: 101,
        dateColumn1: "04/04/2023",
        dateColumn2: "05/04/2023",
        booleanColumn: false,
        priceColumn: 400000,
    }},
]

Be sure that the actual structure of the interface and mock data you generate corresponds to the real data found in the image, not the sample above. Only return the TypeScript code block with the interface and mock data. Do not include any explanations, descriptions, or other content.

Here is the OCR text from the image:
---
{ocr_text}
---"""

# Configure your API key
API_KEY = os.environ.get("GEMINI_API_KEY")
genai.configure(api_key=API_KEY)

model = genai.GenerativeModel('gemini-1.5-flash-latest')

# Generate content
try:
    response = model.generate_content(prompt)
    # The response might need parsing to extract the code block
    generated_code = response.text
except Exception as e:
    print(f"Error calling Gemini API: {e}")
    exit()


# --- Step 4: Save to File ---
output_file = "IInfoViewModel.ts"

try:
    with open(output_file, "w", encoding="utf-8") as f:
        f.write(generated_code)
    print(f"Successfully generated and saved {output_file}")
except IOError as e:
    print(f"Error writing to file {output_file}: {e}")

print("Workflow script updated to use ocr.py for OCR.")
