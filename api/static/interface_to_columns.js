// interface_to_columns.js
const interfaceTextarea = document.getElementById("interfaceTextarea");
const columnsTextarea = document.getElementById("columnsTextarea");
const copyColumnsBtn = document.getElementById("copyColumnsBtn");
interfaceTextarea &&
  interfaceTextarea.addEventListener("input", () => {
    const code = interfaceTextarea.value;
    fetch("/generate-columns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ interface: code }),
    })
      .then((res) => res.json())
      .then((data) => {
        columnsTextarea.value = data.columns || data.error || "";
      });
  });
copyColumnsBtn &&
  copyColumnsBtn.addEventListener("click", () => {
    columnsTextarea.select();
    document.execCommand("copy");
  }); 