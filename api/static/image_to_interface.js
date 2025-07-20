// image_to_interface.js
// Tab 1: Image to Interface/MockData
const pasteArea = document.getElementById("imagePasteArea");
const previewImage = document.getElementById("previewImage");
const placeholderText = document.getElementById("placeholderText");
const hiddenFileInput = document.getElementById("hiddenFileInput");
const imgPreviewWrapper = document.getElementById("imgPreviewWrapper");
const generateBtn = document.getElementById("generateBtn");

pasteArea && pasteArea.addEventListener("click", () => hiddenFileInput.click());
hiddenFileInput &&
  hiddenFileInput.addEventListener("change", (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (ev) => showImage(ev.target.result);
        reader.readAsDataURL(file);
      }
    }
  });
pasteArea &&
  pasteArea.addEventListener("paste", (e) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
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
  previewImage.classList.remove("d-none");
  placeholderText.classList.add("d-none");
  imgPreviewWrapper.classList.add("show-img");
  updateGenerateBtnState();
}
const resultTextarea = document.getElementById("resultTextarea");
function autoResizeTextarea() {
  resultTextarea.style.height = "auto";
  resultTextarea.style.height = resultTextarea.scrollHeight + "px";
}
resultTextarea && resultTextarea.addEventListener("input", autoResizeTextarea);
autoResizeTextarea();
document.getElementById("copyBtn")?.addEventListener("click", () => {
  resultTextarea.select();
  document.execCommand("copy");
});
document.getElementById("downloadBtn")?.addEventListener("click", () => {
  const blob = new Blob([resultTextarea.value], { type: "text/plain" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "generated-code.ts";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(a.href);
});
const clearImgBtn = document.getElementById("clearImgBtn");
clearImgBtn &&
  clearImgBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    previewImage.src = "";
    previewImage.classList.add("d-none");
    placeholderText.classList.remove("d-none");
    hiddenFileInput.value = "";
    imgPreviewWrapper.classList.remove("show-img");
    updateGenerateBtnState();
  });
function updateGenerateBtnState() {
  if (previewImage.classList.contains("d-none")) {
    generateBtn.setAttribute("disabled", "disabled");
  } else {
    generateBtn.removeAttribute("disabled");
  }
}
updateGenerateBtnState();
pasteArea &&
  pasteArea.addEventListener("dragover", (e) => {
    e.preventDefault();
    pasteArea.classList.add("dragover");
  });
pasteArea &&
  pasteArea.addEventListener("dragleave", (e) => {
    pasteArea.classList.remove("dragover");
  });
pasteArea &&
  pasteArea.addEventListener("drop", (e) => {
    e.preventDefault();
    pasteArea.classList.remove("dragover");
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (ev) => showImage(ev.target.result);
        reader.readAsDataURL(file);
      }
    }
  });
// Tab 1: Columns from image
const columnsFromImageTextarea = document.getElementById('columnsFromImageTextarea');
const copyColumnsFromImageBtn = document.getElementById('copyColumnsFromImageBtn');
copyColumnsFromImageBtn && copyColumnsFromImageBtn.addEventListener('click', () => {
    columnsFromImageTextarea.select();
    document.execCommand('copy');
});
generateBtn &&
  generateBtn.addEventListener("click", async () => {
    if (previewImage.classList.contains("d-none") || !previewImage.src) return;
    resultTextarea.value = "";
    columnsFromImageTextarea.value = "";
    autoResizeTextarea();
    generateBtn.disabled = true;
    generateBtn.innerHTML =
      '<span class="spinner-border spinner-border-sm me-2"></span>Generating...';
    try {
      const blob = await (await fetch(previewImage.src)).blob();
      const formData = new FormData();
      formData.append("image", blob, "input.png");
      // Lấy objectName từ input
      const objectName =
        document.getElementById("objectNameInput")?.value?.trim() || "";
      formData.append("objectName", objectName);
      const response = await fetch("/generate", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("API error");
      const data = await response.json();
      if (data.code) {
        resultTextarea.value = data.code;
        fetch("/generate-columns", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ interface: data.code }),
        })
          .then((res) => res.json())
          .then((colData) => {
            columnsFromImageTextarea.value =
              colData.columns || colData.error || "";
          });
      } else {
        resultTextarea.value = data.error || "Unknown error";
      }
    } catch (err) {
      resultTextarea.value = "Error: " + err.message;
    } finally {
      generateBtn.disabled = false;
      generateBtn.innerHTML = '<i class="bi bi-lightning-charge"></i>Generate';
      autoResizeTextarea();
    }
  }); 