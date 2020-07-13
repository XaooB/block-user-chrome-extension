var id = window.setInterval(function () {
    const _comments_holder = '.comments-list .user-comment';
    const commentsNodes = document.querySelectorAll(_comments_holder);
    let blockedUsers = getBlockedUsers();

    //Due to content being loaded ansynchronously we need to check whenever comments has been loaded or not
    //Then we load the content script to make changes to the loaded page

    if (commentsNodes.length) {
        window.clearInterval(id);

        if (blockedUsers !== null) {
            hideComments(commentsNodes, blockedUsers);
        } else {
            saveBlockedUsers([]);
        }
    }
}, 1000);

function hideComments(comments, users, deletedComments = 0) {
    const _comments_blocked_text = 'Użytkownik zablokowany. Aby zobaczyc zawartosc musisz go odblokowac.';

    for (let i = 0; i < comments.length; i++) {
        let commentUser = comments[i].querySelector('.user-comment__name').textContent.trim();
        if (users.includes(commentUser)) {
            let comment = comments[i].querySelector('.comment-text'),
                oldComment = comment.textContent.trim();

            comment.setAttribute(
                "style",
                "color: #ff0033; font-style: italic; font-size: 13px; padding: 4px 0;"
            );
            comment.textContent = _comments_blocked_text;
            createActionLink('Odblokuj', comments[i], oldComment);
            deletedComments++;
        } else {
            createActionLink('Zablokuj', comments[i]);
        }
    }
    //send number of deleted comments to the background
    if (deletedComments !== 0) {
        return chrome.runtime.sendMessage({data: `${deletedComments}`});
    }

    chrome.runtime.sendMessage({data: ''});
}

function createActionLink(nodeName, holder, oldComment = null) {
    let anchor = document.createElement('a'),
        userName = holder.querySelector('.user-comment__name').textContent.trim();

    anchor.classList.add('unblock-user', 'link-naked', 'text-color_appblue', 'box-inline', 'shift-margin_2-right', 'user-actions');
    anchor.setAttribute('style', 'font-weight: bold;');
    anchor.textContent = nodeName;
    anchor.title = nodeName + ' uzytkownika ' + userName;
    anchor.dataset.userName = userName;

    if (nodeName === 'Zablokuj') {
        anchor.onclick = blockUser;
    } else {
        anchor.onclick = unblockUser;
    }

    if (oldComment) {
        anchor.dataset.hiddenContent = oldComment;
    }

    holder.querySelector('.comments-action').append(anchor);
}

function unblockUser(event) {
    let element = event.target.closest('article'),
        comment = element.querySelector('.comment-text'),
        oldComment = comment.textContent,
        blockedUsers = getBlockedUsers(),
        userName = element.querySelector('.user-comment__name').textContent.trim(),
        indexToDelete = blockedUsers.indexOf(userName);

    blockedUsers.splice(indexToDelete, 1);
    saveBlockedUsers(blockedUsers.join());

    comment.textContent = this.dataset.hiddenContent;
    comment.setAttribute('style', '');
    element.querySelector('.unblock-user').remove();
    createActionLink('Zablokuj', element, oldComment);
}

function blockUser(event) {
    let element = event.target.closest('article'),
        comment = element.querySelector('.comment-text'),
        oldComment = comment.textContent,
        userName = element.querySelector('.user-comment__name').textContent.trim(),
        blockedUsers = getBlockedUsers();

    blockedUsers.push(userName);
    let newList = [...new Set(blockedUsers)].join();
    saveBlockedUsers(newList);

    comment.textContent = 'Użytkownik zablokowany. Aby zobaczyc zawartosc musisz go odblokowac.';
    comment.setAttribute(
        "style",
        "color: #ff0033; font-style: italic; font-size: 13px; padding: 4px 0;"
    );

    element.querySelector('.unblock-user').remove();
    createActionLink('Odblokuj', element, oldComment);
}

function getBlockedUsers() {
    return localStorage.getItem('blockedUsers').split(',') || [];
}

function saveBlockedUsers(users) {
    localStorage.setItem('blockedUsers', users);
}

