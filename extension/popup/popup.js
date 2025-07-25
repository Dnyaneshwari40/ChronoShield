document.getElementById("saveBtn").addEventListener("click", () => {
  const token = document.getElementById("tokenInput").value;

  if (!token) {
    alert("Please enter a token!");
    return;
  }

  chrome.storage.local.set({ token }, () => {
    alert("✅ Token saved!");
  });
});
