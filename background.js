//Event listener for injected.js
chrome.runtime.onMessageExternal.addListener(function (message, sender) {
    if (message.stopInterception) {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {stopInterception: true});
        });
    }
    if (message.interception) {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {interception: true});
        });
    }
    if (message.likeUnlike) {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {likeUnlike: message.likeUnlike});
        });
    }
});

chrome.runtime.onMessage.addListener(function (message, sender) {
    chrome.action.setBadgeBackgroundColor({color: [238, 50, 78, 255]});
    chrome.action.setBadgeText({text: message.blockedAmount});
});
