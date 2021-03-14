document.addEventListener('DOMContentLoaded', function () {
    document.querySelector('#reset').addEventListener('click', resetList, false);

    function resetList() {
        localStorage.setItem('blockedUsers', '');

        chrome.tabs.query({currentWindow: true, active: true}, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {reset: true});
        });

        //send message to the background page and set badge to empty string
        chrome.runtime.sendMessage({data: ''});
    }
}, false);
