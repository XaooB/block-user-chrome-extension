//Event listener for injected.js
chrome.runtime.onMessageExternal.addListener(function (message, sender) {
    if (message.interception) {
        chrome.tabs.query({}, function(tabs) {
            tabs.forEach(function (tab) {
                if (tab.url.match('https:\/\/.*.realmadryt.pl\/.*')) {
                    chrome.tabs.sendMessage(tab.id, {interception: true});
                }
            });
        });
    }
    if (message.likeUnlike) {
        chrome.tabs.query({}, function(tabs) {
            tabs.forEach(function (tab) {
                if (tab.url.match('https:\/\/.*.realmadryt.pl\/.*')) {
                    chrome.tabs.sendMessage(tab.id, {likeUnlike: message.likeUnlike});
                }
            })
        });
    }
});

//Event listener for content.js
chrome.runtime.onMessage.addListener(function (message, sender) {
    if (message.interception) {
        chrome.tabs.query({}, function(tabs) {
            tabs.forEach(function (tab) {
                if (tab.url.match('https:\/\/.*.realmadryt.pl\/.*')) {
                    chrome.tabs.sendMessage(tab.id, {interception: true});
                }
            });
        });
    }
    if (message.likeUnlike) {
        chrome.tabs.query({}, function(tabs) {
            tabs.forEach(function (tab) {
                if (tab.url.match('https:\/\/.*.realmadryt.pl\/.*')) {
                    chrome.tabs.sendMessage(tab.id, {likeUnlike: message.likeUnlike});
                }
            })
        });
    }

    if ('blockedAmount' in message) {
        chrome.action.setBadgeBackgroundColor({color: [238, 50, 78, 255]});
        chrome.action.setBadgeText({text: message.blockedAmount}); 
    }
});
