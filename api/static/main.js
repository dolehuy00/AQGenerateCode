// main.js (rút gọn, chỉ khởi tạo và import các module)
// Dark/Light mode toggle
const toggleBtn = document.getElementById("toggleModeBtn");
const toggleIcon = document.getElementById("toggleModeIcon");
const mainHeader = document.getElementById("mainHeader");
function setMode(dark) {
  if (dark) {
    document.body.classList.add("dark-mode");
    toggleIcon.classList.remove("bi-moon");
    toggleIcon.classList.add("bi-sun");
    localStorage.setItem("aq_dark_mode", "1");
    mainHeader.classList.add("border-dark");
    mainHeader.classList.remove("bg-white", "border-bottom");
    mainHeader.style.background = "var(--card-bg)";
    mainHeader.style.color = "var(--text-main)";
  } else {
    document.body.classList.remove("dark-mode");
    toggleIcon.classList.remove("bi-sun");
    toggleIcon.classList.add("bi-moon");
    localStorage.setItem("aq_dark_mode", "0");
    mainHeader.classList.remove("border-dark");
    mainHeader.classList.add("bg-white", "border-bottom");
    mainHeader.style.background = "var(--card-bg)";
    mainHeader.style.color = "var(--text-main)";
  }
}
setMode(localStorage.getItem("aq_dark_mode") === "1");
toggleBtn.addEventListener("click", () => {
  const isDark = document.body.classList.contains("dark-mode");
  setMode(!isDark);
});
// Import các module logic cho từng tab
// Đảm bảo đã thêm các <script src="..."></script> vào index.html theo thứ tự:
// image_to_interface.js, interface_to_columns.js, interface_to_export.js, snippet_library.js, grid_generator.js, prompt_library.js
