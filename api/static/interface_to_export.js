// interface_to_export.js
const interfaceExportTextarea = document.getElementById(
  "interfaceExportTextarea"
);
const exportConfigTextarea = document.getElementById("exportConfigTextarea");
const copyExportConfigBtn = document.getElementById("copyExportConfigBtn");
interfaceExportTextarea &&
  interfaceExportTextarea.addEventListener("input", () => {
    const code = interfaceExportTextarea.value;
    exportConfigTextarea.value = generateExportConfigFromInterface(code);
  });
copyExportConfigBtn &&
  copyExportConfigBtn.addEventListener("click", () => {
    exportConfigTextarea.select();
    document.execCommand("copy");
  });
function generateExportConfigFromInterface(code) {
  const lines = code.split("\n");
  const fields = [];
  let inInterface = false;
  for (let line of lines) {
    line = line.trim();
    if (line.startsWith("export interface")) inInterface = true;
    if (inInterface && line.startsWith("}")) inInterface = false;
    if (inInterface && line.includes("?:")) {
      const match = line.match(/(\w+)\?\:\s*([\w\[\]]+)\s*;\s*\/\/\s*(.+)$/);
      if (match) {
        fields.push({
          name: match[1],
          comment: match[3],
        });
      }
    }
  }
  let config = "const exportConfig = {\n    fields: [\n";
  for (const f of fields) {
    config += `        { fieldName: "${f.name}", header: "${f.comment}" },\n`;
  }
  config += "    ]\n};";
  return config;
} 