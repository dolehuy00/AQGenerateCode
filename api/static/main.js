// Dark/Light mode toggle
const toggleBtn = document.getElementById('toggleModeBtn');
const toggleIcon = document.getElementById('toggleModeIcon');
const mainHeader = document.getElementById('mainHeader');
function setMode(dark) {
    if (dark) {
        document.body.classList.add('dark-mode');
        toggleIcon.classList.remove('bi-moon');
        toggleIcon.classList.add('bi-sun');
        localStorage.setItem('aq_dark_mode', '1');
        // Header dark
        mainHeader.classList.add('border-dark');
        mainHeader.classList.remove('bg-white','border-bottom');
        mainHeader.style.background = 'var(--card-bg)';
        mainHeader.style.color = 'var(--text-main)';
    } else {
        document.body.classList.remove('dark-mode');
        toggleIcon.classList.remove('bi-sun');
        toggleIcon.classList.add('bi-moon');
        localStorage.setItem('aq_dark_mode', '0');
        // Header light
        mainHeader.classList.remove('border-dark');
        mainHeader.classList.add('bg-white','border-bottom');
        mainHeader.style.background = 'var(--card-bg)';
        mainHeader.style.color = 'var(--text-main)';
    }
}
setMode(localStorage.getItem('aq_dark_mode') === '1');
toggleBtn.addEventListener('click', () => {
    const isDark = document.body.classList.contains('dark-mode');
    setMode(!isDark);
});

// Tab 1: Image to Interface/MockData
const pasteArea = document.getElementById('imagePasteArea');
const previewImage = document.getElementById('previewImage');
const placeholderText = document.getElementById('placeholderText');
const hiddenFileInput = document.getElementById('hiddenFileInput');
const imgPreviewWrapper = document.getElementById('imgPreviewWrapper');
const generateBtn = document.getElementById('generateBtn');

pasteArea && pasteArea.addEventListener('click', () => hiddenFileInput.click());
hiddenFileInput && hiddenFileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (ev) => showImage(ev.target.result);
            reader.readAsDataURL(file);
        }
    }
});
pasteArea && pasteArea.addEventListener('paste', (e) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
            const file = items[i].getAsFile();
            const reader = new FileReader();
            reader.onload = (ev) => showImage(ev.target.result);
            reader.readAsDataURL(file);
            e.preventDefault();
            break;
        }
    }
});
function showImage(src) {
    previewImage.src = src;
    previewImage.classList.remove('d-none');
    placeholderText.classList.add('d-none');
    imgPreviewWrapper.classList.add('show-img');
    updateGenerateBtnState();
}
const resultTextarea = document.getElementById('resultTextarea');
function autoResizeTextarea() {
    resultTextarea.style.height = 'auto';
    resultTextarea.style.height = resultTextarea.scrollHeight + 'px';
}
resultTextarea && resultTextarea.addEventListener('input', autoResizeTextarea);
autoResizeTextarea();
document.getElementById('copyBtn')?.addEventListener('click', () => {
    resultTextarea.select();
    document.execCommand('copy');
});
document.getElementById('downloadBtn')?.addEventListener('click', () => {
    const blob = new Blob([resultTextarea.value], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'generated-code.ts';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
});
const clearImgBtn = document.getElementById('clearImgBtn');
clearImgBtn && clearImgBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    previewImage.src = '';
    previewImage.classList.add('d-none');
    placeholderText.classList.remove('d-none');
    hiddenFileInput.value = '';
    imgPreviewWrapper.classList.remove('show-img');
    updateGenerateBtnState();
});
function updateGenerateBtnState() {
    if (previewImage.classList.contains('d-none')) {
        generateBtn.setAttribute('disabled', 'disabled');
    } else {
        generateBtn.removeAttribute('disabled');
    }
}
updateGenerateBtnState();
pasteArea && pasteArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    pasteArea.classList.add('dragover');
});
pasteArea && pasteArea.addEventListener('dragleave', (e) => {
    pasteArea.classList.remove('dragover');
});
pasteArea && pasteArea.addEventListener('drop', (e) => {
    e.preventDefault();
    pasteArea.classList.remove('dragover');
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (ev) => showImage(ev.target.result);
            reader.readAsDataURL(file);
        }
    }
});
// Tab 2: Interface to Columns
const interfaceTextarea = document.getElementById('interfaceTextarea');
const columnsTextarea = document.getElementById('columnsTextarea');
const copyColumnsBtn = document.getElementById('copyColumnsBtn');
interfaceTextarea && interfaceTextarea.addEventListener('input', () => {
    const code = interfaceTextarea.value;
    fetch('/generate-columns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interface: code })
    })
    .then(res => res.json())
    .then(data => {
        columnsTextarea.value = data.columns || data.error || '';
    });
});
copyColumnsBtn && copyColumnsBtn.addEventListener('click', () => {
    columnsTextarea.select();
    document.execCommand('copy');
});
// Tab 1: Columns from image
const columnsFromImageTextarea = document.getElementById('columnsFromImageTextarea');
const copyColumnsFromImageBtn = document.getElementById('copyColumnsFromImageBtn');
copyColumnsFromImageBtn && copyColumnsFromImageBtn.addEventListener('click', () => {
    columnsFromImageTextarea.select();
    document.execCommand('copy');
});
generateBtn && generateBtn.addEventListener('click', async () => {
    if (previewImage.classList.contains('d-none') || !previewImage.src) return;
    resultTextarea.value = '';
    columnsFromImageTextarea.value = '';
    autoResizeTextarea();
    generateBtn.disabled = true;
    generateBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Generating...';
    try {
        const blob = await (await fetch(previewImage.src)).blob();
        const formData = new FormData();
        formData.append('image', blob, 'input.png');
        const response = await fetch('/generate', {
            method: 'POST',
            body: formData
        });
        if (!response.ok) throw new Error('API error');
        const data = await response.json();
        if (data.code) {
            resultTextarea.value = data.code;
            fetch('/generate-columns', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ interface: data.code })
            })
            .then(res => res.json())
            .then(colData => {
                columnsFromImageTextarea.value = colData.columns || colData.error || '';
            });
        } else {
            resultTextarea.value = data.error || 'Unknown error';
        }
    } catch (err) {
        resultTextarea.value = 'Error: ' + err.message;
    } finally {
        generateBtn.disabled = false;
        generateBtn.innerHTML = '<i class="bi bi-lightning-charge"></i>Generate';
        autoResizeTextarea();
    }
});
// Tab 3: Interface to Export Config
const interfaceExportTextarea = document.getElementById('interfaceExportTextarea');
const exportConfigTextarea = document.getElementById('exportConfigTextarea');
const copyExportConfigBtn = document.getElementById('copyExportConfigBtn');
interfaceExportTextarea && interfaceExportTextarea.addEventListener('input', () => {
    const code = interfaceExportTextarea.value;
    exportConfigTextarea.value = generateExportConfigFromInterface(code);
});
copyExportConfigBtn && copyExportConfigBtn.addEventListener('click', () => {
    exportConfigTextarea.select();
    document.execCommand('copy');
});
function generateExportConfigFromInterface(code) {
    const lines = code.split('\n');
    const fields = [];
    let inInterface = false;
    for (let line of lines) {
        line = line.trim();
        if (line.startsWith('export interface')) inInterface = true;
        if (inInterface && line.startsWith('}')) inInterface = false;
        if (inInterface && line.includes('?:')) {
            const match = line.match(/(\w+)\?\:\s*([\w\[\]]+)\s*;\s*\/\/\s*(.+)$/);
            if (match) {
                fields.push({
                    name: match[1],
                    comment: match[3]
                });
            }
        }
    }
    let config = 'const exportConfig = {\n    fields: [\n';
    for (const f of fields) {
        config += `        { fieldName: "${f.name}", header: "${f.comment}" },\n`;
    }
    config += '    ]\n};';
    return config;
}
// Tab 4: Code Snippet Library
let editingSnippetId = null;
const snippetForm = document.getElementById('snippetForm');
const snippetName = document.getElementById('snippetName');
const snippetContent = document.getElementById('snippetContent');
const snippetsList = document.getElementById('snippetsList');
const cancelEditSnippet = document.getElementById('cancelEditSnippet');
function renderSnippets(snippets) {
    let html = '';
    if (!snippets.length) {
        html = '<div class="text-muted">No snippets yet.</div>';
    } else {
        html = '<div class="list-group">';
        for (const s of snippets) {
            html += `<div class="list-group-item d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2 py-2">
                <div class="fw-semibold text-primary">${s.name}</div>
                <textarea class="form-control form-control-sm snippet-ta" style="font-family:monospace;min-width:200px;max-width:100%;" rows="2" readonly id="snippet-content-${s.id}">${s.content}</textarea>
                <div class="d-flex gap-2">
                    <button class="btn btn-outline-secondary btn-sm snippet-btn" onclick="copySnippet(${s.id})"><i class="bi bi-clipboard"></i></button>
                    <button class="btn btn-outline-info btn-sm snippet-btn" onclick="editSnippet(${s.id})"><i class="bi bi-pencil"></i></button>
                    <button class="btn btn-outline-danger btn-sm snippet-btn" onclick="deleteSnippet(${s.id})"><i class="bi bi-trash"></i></button>
                </div>
            </div>`;
        }
        html += '</div>';
    }
    snippetsList.innerHTML = html;
}
async function loadSnippets() {
    const res = await fetch('/snippets');
    const data = await res.json();
    renderSnippets(data);
}
window.copySnippet = function(id) {
    const ta = document.getElementById('snippet-content-' + id);
    ta.select();
    document.execCommand('copy');
}
window.editSnippet = async function(id) {
    const res = await fetch('/snippets');
    const data = await res.json();
    const s = data.find(x => x.id === id);
    if (s) {
        snippetName.value = s.name;
        snippetContent.value = s.content;
        editingSnippetId = id;
        cancelEditSnippet.classList.remove('d-none');
    }
}
window.deleteSnippet = async function(id) {
    if (!confirm('Delete this snippet?')) return;
    await fetch('/snippets/' + id, { method: 'DELETE' });
    loadSnippets();
    if (editingSnippetId === id) {
        editingSnippetId = null;
        snippetName.value = '';
        snippetContent.value = '';
        cancelEditSnippet.classList.add('d-none');
    }
}
snippetForm && snippetForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = snippetName.value.trim();
    const content = snippetContent.value.trim();
    if (!name || !content) return;
    if (editingSnippetId) {
        await fetch('/snippets/' + editingSnippetId, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, content })
        });
    } else {
        await fetch('/snippets', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, content })
        });
    }
    snippetName.value = '';
    snippetContent.value = '';
    editingSnippetId = null;
    cancelEditSnippet.classList.add('d-none');
    loadSnippets();
});
cancelEditSnippet && cancelEditSnippet.addEventListener('click', () => {
    editingSnippetId = null;
    snippetName.value = '';
    snippetContent.value = '';
    cancelEditSnippet.classList.add('d-none');
});
document.getElementById('tab4-tab')?.addEventListener('shown.bs.tab', loadSnippets); 