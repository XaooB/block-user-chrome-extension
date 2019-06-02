chrome.runtime.onMessage.addListener(function (message, sender) {
  chrome.browserAction.setBadgeBackgroundColor({ color: [238, 50, 78, 255] });
  chrome.browserAction.setBadgeText({text: message.data});
});
