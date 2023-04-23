document.addEventListener('DOMContentLoaded', function () {
    document.querySelector('#reset').addEventListener('click', resetList, false);

    function resetList() {
        localStorage.setItem('blockedUsers', '');

        chrome.tabs.query({}, function(tabs) {
            tabs.forEach(function (tab) {
                if (tab.url.match('https:\/\/.*.realmadryt.pl\/.*')) {
                    chrome.tabs.sendMessage(tabs[0].id, {reset: true});
                }
            })
        });

        //send message to the background page and set badge to empty string
        chrome.runtime.sendMessage({blockedAmount: ''});
    }
}, false);
