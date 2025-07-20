// snippet_library.js
// --- Code Snippet Library with Group logic (Tab 4) ---
let editingSnippetId = null;
let editingGroup = null;
const snippetGroupForm = document.getElementById("snippetGroupForm");
const snippetGroupName = document.getElementById("snippetGroupName");
const snippetGroupTabs = document.getElementById("snippetGroupTabs");
const snippetGroupTabContent = document.getElementById(
  "snippetGroupTabContent"
);

let snippetGroups = [];
let activeGroup = null;

async function loadSnippetGroups() {
  const res = await fetch("/snippet-groups");
  snippetGroups = await res.json();
  renderSnippetGroupTabs();
}

function renderSnippetGroupTabs() {
  if (!snippetGroups.length) {
    snippetGroupTabs.innerHTML =
      '<li class="nav-item"><span class="nav-link disabled">No group</span></li>';
    snippetGroupTabContent.innerHTML = "";
    return;
  }
  let tabHtml = "";
  let contentHtml = "";
  if (!activeGroup || !snippetGroups.some((g) => g.group === activeGroup)) {
    activeGroup = snippetGroups[0].group;
  }
  snippetGroups.forEach((g, idx) => {
    const active = g.group === activeGroup ? "active" : "";
    tabHtml += `<li class="nav-item" role="presentation">
            <button class="nav-link ${active}" id="group-tab-${idx}" data-bs-toggle="tab" data-bs-target="#group-tabpanel-${idx}" type="button" role="tab" aria-controls="group-tabpanel-${idx}" aria-selected="$${active ? "true" : "false"}">${g.group}
                <span class="ms-2 text-danger" style="cursor:pointer;" onclick="deleteSnippetGroup('${g.group}')">&times;</span>
            </button>
        </li>`;
    contentHtml += `<div class="tab-pane fade ${
      active ? "show active" : ""
    }" id="group-tabpanel-${idx}" role="tabpanel" aria-labelledby="group-tab-${idx}">
            <form class="mb-3 snippet-form" onsubmit="return addOrEditSnippet(event, '${
      g.group
    }')">
                <div class="row g-2 align-items-center">
                    <div class="col-md-3">
                        <input type="text" class="form-control snippet-input" id="snippetName-${
      g.group
    }" placeholder="Snippet name" required />
                    </div>
                    <div class="col-md-7">
                        <textarea class="form-control snippet-ta" id="snippetContent-${
      g.group
    }" rows="2" placeholder="Snippet content" required></textarea>
                    </div>
                    <div class="col-md-2 d-flex gap-2">
                        <button type="submit" class="btn btn-success btn-sm snippet-btn">Save</button>
                        <button type="button" class="btn btn-secondary btn-sm d-none snippet-btn" id="cancelEditSnippet-${
      g.group
    }" onclick="cancelEditSnippet('${
      g.group
    }')">Cancel</button>
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
    document
      .getElementById(`group-tab-${idx}`)
      .addEventListener("click", () => {
        activeGroup = g.group;
        renderSnippetGroupTabs();
      });
  });
}

function renderSnippetsForGroup(group) {
  const g = snippetGroups.find((x) => x.group === group);
  const listDiv = document.getElementById(`snippetsList-${group}`);
  if (!g) return;
  let html = "";
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

window.copySnippet = function (group, id) {
  const ta = document.getElementById(`snippet-content-${group}-${id}`);
  ta.select();
  document.execCommand("copy");
};
window.editSnippet = function (group, id) {
  const g = snippetGroups.find((x) => x.group === group);
  if (!g) return;
  const s = g.snippets.find((x) => x.id === id);
  if (!s) return;
  document.getElementById(`snippetName-${group}`).value = s.name;
  document.getElementById(`snippetContent-${group}`).value = s.content;
  editingSnippetId = id;
  editingGroup = group;
  document
    .getElementById(`cancelEditSnippet-${group}`)
    .classList.remove("d-none");
};
window.deleteSnippet = async function (group, id) {
  if (!confirm("Delete this snippet?")) return;
  await fetch(`/snippet-groups/${group}/snippets/${id}`, { method: "DELETE" });
  await loadSnippetGroups();
};
window.cancelEditSnippet = function (group) {
  editingSnippetId = null;
  editingGroup = null;
  document.getElementById(`snippetName-${group}`).value = "";
  document.getElementById(`snippetContent-${group}`).value = "";
  document.getElementById(`cancelEditSnippet-${group}`).classList.add("d-none");
};
window.addOrEditSnippet = async function (e, group) {
  e.preventDefault();
  const name = document.getElementById(`snippetName-${group}`).value.trim();
  const content = document.getElementById(`snippetContent-${group}`).value.trim();
  if (!name || !content) return false;
  if (editingSnippetId && editingGroup === group) {
    await fetch(`/snippet-groups/${group}/snippets/${editingSnippetId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, content }),
    });
  } else {
    await fetch(`/snippet-groups/${group}/snippets`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, content }),
    });
  }
  editingSnippetId = null;
  editingGroup = null;
  document.getElementById(`snippetName-${group}`).value = "";
  document.getElementById(`snippetContent-${group}`).value = "";
  document.getElementById(`cancelEditSnippet-${group}`).classList.add("d-none");
  await loadSnippetGroups();
  return false;
};
window.deleteSnippetGroup = async function (group) {
  if (!confirm("Delete this group and all its snippets?")) return;
  await fetch(`/snippet-groups/${group}`, { method: "DELETE" });
  activeGroup = null;
  await loadSnippetGroups();
};
snippetGroupForm &&
  snippetGroupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const group = snippetGroupName.value.trim();
    if (!group) return;
    await fetch("/snippet-groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ group }),
    });
    snippetGroupName.value = "";
    await loadSnippetGroups();
  });
document
  .getElementById("tab4-tab")
  ?.addEventListener("shown.bs.tab", loadSnippetGroups); 