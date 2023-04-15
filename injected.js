(function (XMLHttpRequest) {
    var XHR = XMLHttpRequest.prototype;

    var open = XHR.open;
    var send = XHR.send;
    var setRequestHeader = XHR.setRequestHeader;

    XHR.open = function (method, url) {
        this._url = url;
        this._requestHeaders = {};

        return open.apply(this, arguments);
    };

    XHR.setRequestHeader = function (header, value) {
        this._requestHeaders[header] = value;
        return setRequestHeader.apply(this, arguments);
    };

    XHR.send = function (postData) {
        this.addEventListener('load', function () {
            var myUrl = this._url ? this._url.toLowerCase() : this._url;
            if (myUrl) {
                if (this.responseType != 'blob' && this.responseText) {
                    try {
                        var allowedUrls = ['shoutbox.json', 'comments/latest.json'];
                        var likeUnlikeUrls = ['like.json', 'unlike.json'];
                        var notAllowedUrls = ['edit.json', 'post.json']
                        var extensionID = 'dklldfgbabjpenhcnnngppgbcenjmoke';

                        if (new RegExp(notAllowedUrls.join("|")).test(this._url)) {
                            chrome.runtime.sendMessage(extensionID, {stopInterception: true});
                        }

                        if (new RegExp(likeUnlikeUrls.join("|")).test(this._url)) {
                            var response = JSON.parse(this.responseText),
                                commentId = response.data.commentInfo.id;
                            
                            chrome.runtime.sendMessage(extensionID, {likeUnlike: commentId});
                        }

                        if (new RegExp(allowedUrls.join("|")).test(this._url)) {
                            chrome.runtime.sendMessage(extensionID, {interception: true});
                        }
                    } catch (err) {
                    }
                }
            }
        });

        return send.apply(this, arguments);
    };
})(XMLHttpRequest);