chrome.runtime.onInstalled.addListener(function() {
  chrome.runtime.onMessage.addListener(function (message) {
    chrome.browserAction.setBadgeBackgroundColor({ color: [255, 0, 0, 255] });
    if(message.data !== '0')
      return chrome.browserAction.setBadgeText({text: message.data});
    chrome.browserAction.setBadgeText({text: ' '});
  });
 });
