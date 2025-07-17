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
        // Lấy objectName từ input
        const objectName = document.getElementById('objectNameInput')?.value?.trim() || '';
        formData.append('objectName', objectName);
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
// --- Code Snippet Library with Group logic (Tab 4) ---
let editingSnippetId = null;
let editingGroup = null;
const snippetGroupForm = document.getElementById('snippetGroupForm');
const snippetGroupName = document.getElementById('snippetGroupName');
const snippetGroupTabs = document.getElementById('snippetGroupTabs');
const snippetGroupTabContent = document.getElementById('snippetGroupTabContent');

let snippetGroups = [];
let activeGroup = null;

async function loadSnippetGroups() {
    const res = await fetch('/snippet-groups');
    snippetGroups = await res.json();
    renderSnippetGroupTabs();
}

function renderSnippetGroupTabs() {
    if (!snippetGroups.length) {
        snippetGroupTabs.innerHTML = '<li class="nav-item"><span class="nav-link disabled">No group</span></li>';
        snippetGroupTabContent.innerHTML = '';
        return;
    }
    let tabHtml = '';
    let contentHtml = '';
    if (!activeGroup || !snippetGroups.some(g => g.group === activeGroup)) {
        activeGroup = snippetGroups[0].group;
    }
    snippetGroups.forEach((g, idx) => {
        const active = g.group === activeGroup ? 'active' : '';
        tabHtml += `<li class="nav-item" role="presentation">
            <button class="nav-link ${active}" id="group-tab-${idx}" data-bs-toggle="tab" data-bs-target="#group-tabpanel-${idx}" type="button" role="tab" aria-controls="group-tabpanel-${idx}" aria-selected="${active ? 'true' : 'false'}">${g.group}
                <span class="ms-2 text-danger" style="cursor:pointer;" onclick="deleteSnippetGroup('${g.group}')">&times;</span>
            </button>
        </li>`;
        contentHtml += `<div class="tab-pane fade ${active ? 'show active' : ''}" id="group-tabpanel-${idx}" role="tabpanel" aria-labelledby="group-tab-${idx}">
            <form class="mb-3 snippet-form" onsubmit="return addOrEditSnippet(event, '${g.group}')">
                <div class="row g-2 align-items-center">
                    <div class="col-md-3">
                        <input type="text" class="form-control snippet-input" id="snippetName-${g.group}" placeholder="Snippet name" required />
                    </div>
                    <div class="col-md-7">
                        <textarea class="form-control snippet-ta" id="snippetContent-${g.group}" rows="2" placeholder="Snippet content" required></textarea>
                    </div>
                    <div class="col-md-2 d-flex gap-2">
                        <button type="submit" class="btn btn-success btn-sm snippet-btn">Save</button>
                        <button type="button" class="btn btn-secondary btn-sm d-none snippet-btn" id="cancelEditSnippet-${g.group}" onclick="cancelEditSnippet('${g.group}')">Cancel</button>
                    </div>
                </div>
            </form>
            <div id="snippetsList-${g.group}"></div>
        </div>`;
    });
    snippetGroupTabs.innerHTML = tabHtml;
    snippetGroupTabContent.innerHTML = contentHtml;
    // Render snippets for active group
    renderSnippetsForGroup(activeGroup);
    // Tab switching
    snippetGroups.forEach((g, idx) => {
        document.getElementById(`group-tab-${idx}`).addEventListener('click', () => {
            activeGroup = g.group;
            renderSnippetGroupTabs();
        });
    });
}

function renderSnippetsForGroup(group) {
    const g = snippetGroups.find(x => x.group === group);
    const listDiv = document.getElementById(`snippetsList-${group}`);
    if (!g) return;
    let html = '';
    if (!g.snippets.length) {
        html = '<div class="text-muted">No snippets yet.</div>';
    } else {
        html = '<div class="list-group">';
        for (const s of g.snippets) {
            html += `<div class="list-group-item d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2 py-2">
                <div class="fw-semibold text-primary">${s.name}</div>
                <textarea class="form-control form-control-sm snippet-ta" style="font-family:monospace;min-width:200px;max-width:100%;" rows="2" readonly id="snippet-content-${group}-${s.id}">${s.content}</textarea>
                <div class="d-flex gap-2">
                    <button class="btn btn-outline-secondary btn-sm snippet-btn" onclick="copySnippet('${group}',${s.id})"><i class="bi bi-clipboard"></i></button>
                    <button class="btn btn-outline-info btn-sm snippet-btn" onclick="editSnippet('${group}',${s.id})"><i class="bi bi-pencil"></i></button>
                    <button class="btn btn-outline-danger btn-sm snippet-btn" onclick="deleteSnippet('${group}',${s.id})"><i class="bi bi-trash"></i></button>
                </div>
            </div>`;
        }
        html += '</div>';
    }
    listDiv.innerHTML = html;
}

window.copySnippet = function(group, id) {
    const ta = document.getElementById(`snippet-content-${group}-${id}`);
    ta.select();
    document.execCommand('copy');
}
window.editSnippet = function(group, id) {
    const g = snippetGroups.find(x => x.group === group);
    if (!g) return;
    const s = g.snippets.find(x => x.id === id);
    if (!s) return;
    document.getElementById(`snippetName-${group}`).value = s.name;
    document.getElementById(`snippetContent-${group}`).value = s.content;
    editingSnippetId = id;
    editingGroup = group;
    document.getElementById(`cancelEditSnippet-${group}`).classList.remove('d-none');
}
window.deleteSnippet = async function(group, id) {
    if (!confirm('Delete this snippet?')) return;
    await fetch(`/snippet-groups/${group}/snippets/${id}`, { method: 'DELETE' });
    await loadSnippetGroups();
}
window.cancelEditSnippet = function(group) {
    editingSnippetId = null;
    editingGroup = null;
    document.getElementById(`snippetName-${group}`).value = '';
    document.getElementById(`snippetContent-${group}`).value = '';
    document.getElementById(`cancelEditSnippet-${group}`).classList.add('d-none');
}
window.addOrEditSnippet = async function(e, group) {
    e.preventDefault();
    const name = document.getElementById(`snippetName-${group}`).value.trim();
    const content = document.getElementById(`snippetContent-${group}`).value.trim();
    if (!name || !content) return false;
    if (editingSnippetId && editingGroup === group) {
        await fetch(`/snippet-groups/${group}/snippets/${editingSnippetId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, content })
        });
    } else {
        await fetch(`/snippet-groups/${group}/snippets`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, content })
        });
    }
    editingSnippetId = null;
    editingGroup = null;
    document.getElementById(`snippetName-${group}`).value = '';
    document.getElementById(`snippetContent-${group}`).value = '';
    document.getElementById(`cancelEditSnippet-${group}`).classList.add('d-none');
    await loadSnippetGroups();
    return false;
}
window.deleteSnippetGroup = async function(group) {
    if (!confirm('Delete this group and all its snippets?')) return;
    await fetch(`/snippet-groups/${group}`, { method: 'DELETE' });
    activeGroup = null;
    await loadSnippetGroups();
}
snippetGroupForm && snippetGroupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const group = snippetGroupName.value.trim();
    if (!group) return;
    await fetch('/snippet-groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ group })
    });
    snippetGroupName.value = '';
    await loadSnippetGroups();
});
document.getElementById('tab4-tab')?.addEventListener('shown.bs.tab', loadSnippetGroups); 