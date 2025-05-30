from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from generate_infoviewmodel import generate_code_from_image

app = Flask(__name__)
CORS(app)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/generate', methods=['POST'])
def generate():
    if 'image' not in request.files:
        return jsonify({'error': 'No image uploaded'}), 400
    image_file = request.files['image']
    image_bytes = image_file.read()
    try:
        code = generate_code_from_image(image_bytes)
        return jsonify({'code': code})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True) 