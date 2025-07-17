from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from generate_infoviewmodel import generate_code_from_image
import json
import os
SNIPPETS_FILE = os.path.join(os.path.dirname(__file__), 'snippets.json')

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
    object_name = request.form.get('objectName', '')
    try:
        code = generate_code_from_image(image_bytes, object_name)
        return jsonify({'code': code})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/generate-columns', methods=['POST'])
def generate_columns():
    data = request.get_json()
    interface_code = data.get('interface')
    if not interface_code:
        return jsonify({'error': 'No interface code provided'}), 400
    try:
        columns_code = generate_columns_from_interface(interface_code)
        return jsonify({'columns': columns_code})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Logic parse interface và sinh columns
import re
import unicodedata

def strip_accents(text):
    return ''.join(c for c in unicodedata.normalize('NFD', text)
                   if unicodedata.category(c) != 'Mn').lower()

def generate_columns_from_interface(code):
    lines = code.split('\n')
    fields = []
    in_interface = False
    interface_name = 'ICRUD'
    for line in lines:
        line = line.strip()
        # Lấy tên interface
        if line.startswith('export interface'):
            in_interface = True
            match = re.match(r'export interface (\w+)', line)
            if match:
                interface_name = match.group(1)
        if in_interface and line.startswith('}'): in_interface = False
        if in_interface and '?:' in line:
            match = re.match(r'(\w+)\?\:\s*([\w\[\]]+)\s*;\s*\/\/\s*(.+)$', line)
            if match:
                name = match.group(1)
                type_ = match.group(2)
                comment = match.group(3)
                fields.append({
                    'name': name,
                    'type': type_,
                    'comment': comment,
                    'comment_norm': strip_accents(comment),
                    'name_norm': strip_accents(name)
                })
    col_code = f'const columns = useMemo<MRT_ColumnDef<{interface_name}>[]>(\n    () => [\n'
    for f in fields:
        col_code += '        {\n'
        col_code += f'            header: "{f["comment"]}",\n'
        col_code += f'            accessorKey: "{f["name"]}",\n'
        # Nhận biết trường ngày
        if (f['type'] == 'string' and (
            'ngay' in f['comment_norm'] or 'ngay' in f['name_norm'])):
            col_code += '            Cell: ({ cell }) => utils_date_dateToDDMMYYYString(new Date(cell.getValue<string>()))\n'
        # Nhận biết checkbox/boolean
        elif f['type'] == 'boolean' or 'checkbox' in f['comment_norm'] or 'bool' in f['comment_norm']:
            col_code += '            Cell: ({ cell }) => <MyCenterFull><Checkbox checked={cell.getValue<boolean>()} readOnly /></MyCenterFull>,\n'
        # Nhận biết tiền
        elif (f['type'] == 'number' and (
            'tien' in f['comment_norm'] or 'gia' in f['comment_norm'] or 'price' in f['name_norm'])):
            col_code += '            Cell: ({ cell }) => <MyNumberFormatter value={cell.getValue<number>()} />\n'
        # Nhận biết số
        elif f['type'] == 'number':
            pass  # chỉ header, accessorKey
        col_code += '        },\n'
    col_code += '    ],\n    []\n);'
    return col_code

def load_snippets():
    if not os.path.exists(SNIPPETS_FILE):
        return []
    with open(SNIPPETS_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_snippets(snippets):
    with open(SNIPPETS_FILE, 'w', encoding='utf-8') as f:
        json.dump(snippets, f, ensure_ascii=False, indent=2)

@app.route('/snippets', methods=['GET'])
def get_snippets():
    return jsonify(load_snippets())

@app.route('/snippets', methods=['POST'])
def add_snippet():
    data = request.get_json()
    name = data.get('name')
    content = data.get('content')
    if not name or not content:
        return jsonify({'error': 'Missing name or content'}), 400
    snippets = load_snippets()
    new_id = max([s['id'] for s in snippets], default=0) + 1
    snippet = {'id': new_id, 'name': name, 'content': content}
    snippets.append(snippet)
    save_snippets(snippets)
    return jsonify(snippet)

@app.route('/snippets/<int:snippet_id>', methods=['PUT'])
def update_snippet(snippet_id):
    data = request.get_json()
    name = data.get('name')
    content = data.get('content')
    snippets = load_snippets()
    for s in snippets:
        if s['id'] == snippet_id:
            if name: s['name'] = name
            if content: s['content'] = content
            save_snippets(snippets)
            return jsonify(s)
    return jsonify({'error': 'Snippet not found'}), 404

@app.route('/snippets/<int:snippet_id>', methods=['DELETE'])
def delete_snippet(snippet_id):
    snippets = load_snippets()
    new_snippets = [s for s in snippets if s['id'] != snippet_id]
    if len(new_snippets) == len(snippets):
        return jsonify({'error': 'Snippet not found'}), 404
    save_snippets(new_snippets)
    return jsonify({'success': True})

def load_snippet_groups():
    if not os.path.exists(SNIPPETS_FILE):
        return []
    with open(SNIPPETS_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_snippet_groups(groups):
    with open(SNIPPETS_FILE, 'w', encoding='utf-8') as f:
        json.dump(groups, f, ensure_ascii=False, indent=2)

@app.route('/snippet-groups', methods=['GET'])
def get_snippet_groups():
    return jsonify(load_snippet_groups())

@app.route('/snippet-groups', methods=['POST'])
def add_snippet_group():
    data = request.get_json()
    group_name = data.get('group')
    if not group_name:
        return jsonify({'error': 'Missing group name'}), 400
    groups = load_snippet_groups()
    if any(g['group'] == group_name for g in groups):
        return jsonify({'error': 'Group already exists'}), 400
    groups.append({'group': group_name, 'snippets': []})
    save_snippet_groups(groups)
    return jsonify({'group': group_name, 'snippets': []})

@app.route('/snippet-groups/<group>', methods=['DELETE'])
def delete_snippet_group(group):
    groups = load_snippet_groups()
    new_groups = [g for g in groups if g['group'] != group]
    if len(new_groups) == len(groups):
        return jsonify({'error': 'Group not found'}), 404
    save_snippet_groups(new_groups)
    return jsonify({'success': True})

@app.route('/snippet-groups/<group>/snippets', methods=['POST'])
def add_snippet_to_group(group):
    data = request.get_json()
    name = data.get('name')
    content = data.get('content')
    if not name or not content:
        return jsonify({'error': 'Missing name or content'}), 400
    groups = load_snippet_groups()
    for g in groups:
        if g['group'] == group:
            new_id = max([s['id'] for s in g['snippets']], default=0) + 1
            snippet = {'id': new_id, 'name': name, 'content': content}
            g['snippets'].append(snippet)
            save_snippet_groups(groups)
            return jsonify(snippet)
    return jsonify({'error': 'Group not found'}), 404

@app.route('/snippet-groups/<group>/snippets/<int:snippet_id>', methods=['PUT'])
def update_snippet_in_group(group, snippet_id):
    data = request.get_json()
    name = data.get('name')
    content = data.get('content')
    groups = load_snippet_groups()
    for g in groups:
        if g['group'] == group:
            for s in g['snippets']:
                if s['id'] == snippet_id:
                    if name: s['name'] = name
                    if content: s['content'] = content
                    save_snippet_groups(groups)
                    return jsonify(s)
            return jsonify({'error': 'Snippet not found'}), 404
    return jsonify({'error': 'Group not found'}), 404

@app.route('/snippet-groups/<group>/snippets/<int:snippet_id>', methods=['DELETE'])
def delete_snippet_in_group(group, snippet_id):
    groups = load_snippet_groups()
    for g in groups:
        if g['group'] == group:
            new_snippets = [s for s in g['snippets'] if s['id'] != snippet_id]
            if len(new_snippets) == len(g['snippets']):
                return jsonify({'error': 'Snippet not found'}), 404
            g['snippets'] = new_snippets
            save_snippet_groups(groups)
            return jsonify({'success': True})
    return jsonify({'error': 'Group not found'}), 404

if __name__ == '__main__':
    app.run(host='127.0.0.1',port=5173,debug=True)