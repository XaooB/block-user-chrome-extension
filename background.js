//Event listener for injected.js
// chrome.runtime.onMessageExternal.addListener(function (message, sender) {
//     if (message.stopInterception) {
//         chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
//             chrome.tabs.sendMessage(tabs[0].id, {stopInterception: true});
//         });
//     }
//     if (message.interception) {
//         chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
//             chrome.tabs.sendMessage(tabs[0].id, {interception: true});
//         });
//     }
//     if (message.likeUnlike) {
//         chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
//             chrome.tabs.sendMessage(tabs[0].id, {likeUnlike: message.likeUnlike});
//         });
//     }
// });
// 
chrome.runtime.onMessageExternal.addListener(function (message, sender) {
    if (message.stopInterception) {
        chrome.tabs.query({}, function(tabs) {
            tabs.forEach(function (tab) {
                if (tab.url.match('https:\/\/.*.realmadryt.pl\/.*')) {
                    chrome.tabs.sendMessage(tab.id, {stopInterception: true});
                }
            })
        });
    }
    if (message.interception) {
        chrome.tabs.query({}, function(tabs) {
            tabs.forEach(function (tab) {
                if (tab.url.match('https:\/\/.*.realmadryt.pl\/.*')) {
                    console.log('inters')
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
    if (message.interception) {
        chrome.tabs.query({}, function(tabs) {
            tabs.forEach(function (tab) {
                if (tab.url.match('https:\/\/.*.realmadryt.pl\/.*')) {
                    console.log('inters')
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
    //
    // chrome.action.setBadgeBackgroundColor({color: [238, 50, 78, 255]});
    // chrome.action.setBadgeText({text: message.blockedAmount});
});
