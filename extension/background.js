console.log("🔥 Background service worker started!");

let activeTab = null;
let startTime = Date.now();

chrome.runtime.onStartup.addListener(loadToken);
chrome.runtime.onInstalled.addListener(loadToken);

// Reload token on extension start (optional)
function loadToken() {
  chrome.storage.local.get(['token'], (result) => {
    console.log("✅ Token loaded:", result.token || "❌ Not found");
  });
}

// On tab switch
chrome.tabs.onActivated.addListener(({ tabId }) => {
  trackTime();
  chrome.tabs.get(tabId, (tab) => {
    if (tab && tab.url) {
      activeTab = tab;
      startTime = Date.now();
      checkBlocklist(tab.url);
    }
  });
});

// On URL change
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tab.active && changeInfo.status === "complete" && tab.url) {
    trackTime();
    activeTab = tab;
    startTime = Date.now();
    checkBlocklist(tab.url);
  }
});

// Track time spent on previous tab
function trackTime() {
  if (!activeTab || !activeTab.url) return;

  chrome.storage.local.get(["token"], (result) => {
    const token = result.token;
    if (!token) {
      console.warn("⚠️ No token found, cannot log time.");
      return;
    }

    const timeSpent = Date.now() - startTime;
    const domain = new URL(activeTab.url).hostname.replace(/^www\./, "");

    console.log(`⏱️ Tracking ${domain}: ${Math.floor(timeSpent / 1000)} sec`);

    fetch("http://localhost:5000/api/logs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        domain,
        duration: Math.floor(timeSpent / 1000)
      })
    }).then(res => {
      if (!res.ok) {
        console.error("❌ Failed to log time", res.status);
      } else {
        console.log("✅ Time log sent for:", domain);
      }
    }).catch(console.error);
  });
}

// Check if URL is in blocklist
function checkBlocklist(url) {
  chrome.storage.local.get(["token"], (result) => {
    const token = result.token;
    if (!token) {
      console.warn("⚠️ No token found, cannot check blocklist.");
      return;
    }

    const domain = new URL(url).hostname.replace(/^www\./, "");

    fetch("http://localhost:5000/api/user/blocklist", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("📛 DOMAIN:", domain);
        console.log("📛 BLOCKLIST:", data.blocklist);

        if (Array.isArray(data.blocklist) && data.blocklist.includes(domain)) {
          console.log(`🚫 ${domain} is in blocklist. Redirecting...`);
          chrome.tabs.update({
            url: chrome.runtime.getURL("blocked.html")
          });
        } else {
          console.log(`✅ ${domain} is not blocked.`);
        }
      })
      .catch(console.error);
  });
}
