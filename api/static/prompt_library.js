// prompt_library.js
// === Prompt Library Tab ===
let promptList = [];
let activePromptId = null;
let editingPromptId = null;

const promptTabList = document.getElementById('promptTabList');
const addPromptBtn = document.getElementById('addPromptBtn');
const promptForm = document.getElementById('promptForm');
const promptNameInput = document.getElementById('promptNameInput');
const promptContentInput = document.getElementById('promptContentInput');
const promptNoteInput = document.getElementById('promptNoteInput');
const cancelPromptBtn = document.getElementById('cancelPromptBtn');
const promptDetailArea = document.getElementById('promptDetailArea');
const promptDetailName = document.getElementById('promptDetailName');
const promptDetailNote = document.getElementById('promptDetailNote');
const promptDetailContent = document.getElementById('promptDetailContent');
const promptUserInput = document.getElementById('promptUserInput');
const sendPromptBtn = document.getElementById('sendPromptBtn');
const editPromptBtn = document.getElementById('editPromptBtn');
const deletePromptBtn = document.getElementById('deletePromptBtn');
const copyPromptResultBtn = document.getElementById('copyPromptResultBtn');

async function loadPrompts() {
  const res = await fetch('/prompts');
  promptList = await res.json();
  renderPromptTabs();
}

function renderPromptTabs() {
  let html = '';
  if (!promptList.length) {
    html = '<li class="nav-item"><span class="nav-link disabled">Chưa có prompt</span></li>';
    promptTabList.innerHTML = html;
    showPromptForm();
    return;
  }
  promptList.forEach(p => {
    html += `<li class="nav-item" role="presentation">
      <button class="nav-link${activePromptId===p.id?' active':''}" data-id="${p.id}">${p.name}</button>
    </li>`;
  });
  promptTabList.innerHTML = html;
  promptTabList.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
      activePromptId = parseInt(btn.dataset.id);
      editingPromptId = null;
      showPromptDetail();
    });
  });
  if (!activePromptId && promptList.length) {
    activePromptId = promptList[0].id;
    showPromptDetail();
  } else if (activePromptId) {
    showPromptDetail();
  }
}

function showPromptForm(editing=false) {
  promptForm.classList.remove('d-none');
  promptDetailArea.classList.add('d-none');
  if (editing && editingPromptId) {
    const p = promptList.find(x=>x.id===editingPromptId);
    promptNameInput.value = p?.name||'';
    promptContentInput.value = p?.content||'';
    promptNoteInput.value = p?.note||'';
  } else {
    promptNameInput.value = '';
    promptContentInput.value = '';
    promptNoteInput.value = '';
  }
}

function showPromptDetail() {
  promptForm.classList.add('d-none');
  promptDetailArea.classList.remove('d-none');
  const p = promptList.find(x=>x.id===activePromptId);
  if (!p) return;
  promptDetailName.textContent = p.name;
  promptDetailNote.textContent = p.note;
  promptDetailContent.value = p.content;
  promptUserInput.value = '';
  document.getElementById('promptResultOutput').value = '';
}

addPromptBtn && addPromptBtn.addEventListener('click', () => {
  editingPromptId = null;
  showPromptForm(false);
});

promptForm && promptForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = promptNameInput.value.trim();
  const content = promptContentInput.value.trim();
  const note = promptNoteInput.value.trim();
  if (!name || !content) return;
  if (editingPromptId) {
    await fetch(`/prompts/${editingPromptId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, content, note })
    });
  } else {
    await fetch('/prompts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, content, note })
    });
  }
  editingPromptId = null;
  await loadPrompts();
  promptForm.classList.add('d-none');
});

cancelPromptBtn && cancelPromptBtn.addEventListener('click', () => {
  editingPromptId = null;
  promptForm.classList.add('d-none');
  if (activePromptId) showPromptDetail();
});

editPromptBtn && editPromptBtn.addEventListener('click', () => {
  editingPromptId = activePromptId;
  showPromptForm(true);
});

deletePromptBtn && deletePromptBtn.addEventListener('click', async () => {
  if (!activePromptId) return;
  if (!confirm('Xóa prompt này?')) return;
  await fetch(`/prompts/${activePromptId}`, { method: 'DELETE' });
  activePromptId = null;
  await loadPrompts();
});

sendPromptBtn && sendPromptBtn.addEventListener('click', async () => {
  const p = promptList.find(x=>x.id===activePromptId);
  if (!p) return;
  const userText = promptUserInput.value.trim();
  const res = await fetch('/send-prompt', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt_text: p.content, user_text: userText })
  });
  const data = await res.json();
  document.getElementById('promptResultOutput').value = data.result || '';
});

document.getElementById('tab6-tab')?.addEventListener('shown.bs.tab', loadPrompts);

copyPromptResultBtn && copyPromptResultBtn.addEventListener('click', () => {
  const ta = document.getElementById('promptResultOutput');
  ta.select();
  document.execCommand('copy');
}); 