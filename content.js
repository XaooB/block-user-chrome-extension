const config = {
    messages: {
        userMarkedAsBlocked: 'Użytkownik został dodany do listy.',
        userBlocked: 'Użytkownik znajduje się na liście zablokowanych.'
    },
    userType: {
        blocked: 'BLOCKED',
        unblocked: 'UNBLOCKED',
    },
    labels: {
        block: 'Zablokuj',
        unblock: 'Odblokuj',
        showBlockedText: 'Pokaż komentarz'
    },
    selectors: {
        userName: '.user-comment__name',
        commentHolder: '.comments-list .user-comment',
        commentText: '.comment-text',
        commentAction: '.comments-action',
        commentsBlocked: `[data-user-type="BLOCKED"]`
    }
}

//init app
initApp();

function initApp() {
    var script = document.createElement('script');
    script.src = chrome.extension.getURL('injected.js');
    script.onload = function() {
        this.remove();
    };
    
    (document.head || document.documentElement).appendChild(script);
    
    chrome.runtime.onMessage.addListener(function (message, sender) {
        let commentsNodes = document.querySelectorAll(config.selectors.commentHolder);
        let blockedUsers = getBlockedUsers();

        if (message.interception) {
            hideComments(commentsNodes, blockedUsers);
        }

        if(message.reset) {
            localStorage.setItem('blockedUsers', '')
            let blockedComments = document.querySelectorAll(config.selectors.commentsBlocked);
            let blockedCommentsHolder = Array.from(blockedComments).map(function(el) {
               return el.closest(config.selectors.commentHolder) 
            });
            let blockedUsers = getBlockedUsers();
            
            //probably needs to be rewritten to be able to show all comments on reset
            //we need to store reference for old comment to instead of mutating original comment we need to hide it
            //and add custom div with information that particular comment is blocked
            hideComments(blockedCommentsHolder, blockedUsers);
        }
    });
}

function hideComments(comments, users, deletedComments = 0) {
    const _comments_blocked_text = config.messages.userBlocked;
    for (let i = 0; i < comments.length; i++) {
        let commentUser = comments[i].querySelector(config.selectors.userName).textContent.trim();
        if (users.includes(commentUser)) {
            let comment = comments[i].querySelector(config.selectors.commentText),
                oldComment = comment.textContent.trim();

            comment.setAttribute(
                "style",
                "color: #ff0033; font-style: italic; font-size: 13px; padding: 4px 0;"
            );
            comment.textContent = _comments_blocked_text;
            comment.dataset.userType = config.userType.blocked;
            createActionLink(config.labels.unblock, comments[i], oldComment);
            deletedComments++;
        } else {
            createActionLink(config.labels.block, comments[i]);
        }
    }
    //send number of deleted comments to the background
    if (deletedComments !== 0) {
        chrome.runtime.sendMessage({data: `${deletedComments}`});
    } else {
        chrome.runtime.sendMessage({data: ''});
    }
}

function createActionLink(nodeName, holder, oldComment = null) {
    let anchor = document.createElement('a'),
        userName = holder.querySelector(config.selectors.userName).textContent.trim(),
        userType = holder.querySelector(config.selectors.commentText).dataset.userType;

    anchor.classList.add('unblock-user', 'link-naked', 'text-color_appblue', 'box-inline', 'shift-margin_2-right', 'user-actions');
    anchor.setAttribute('style', 'font-weight: bold;');
    anchor.textContent = nodeName;
    anchor.title = nodeName + ' użytkownika ' + userName;
    anchor.dataset.userName = userName;

    switch (userType) {
        case config.userType.blocked:
            anchor.onclick = unblockUser;
            break;

        case config.userType.unblocked:
            anchor.onclick = blockUser;
            break;

        default:
            anchor.onclick = blockUser;
            break;
    }
    
    if (oldComment) {
        anchor.dataset.hiddenContent = oldComment;
    }

    holder.querySelector(config.selectors.commentAction).append(anchor);
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
    comment.dataset.userType = config.userType.unblocked;
    comment.setAttribute('style', '');
    element.querySelector('.unblock-user').remove();
    createActionLink(config.labels.block, element, oldComment);
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
    comment.dataset.userType = config.userType.blocked;
    comment.setAttribute(
        "style",
        "color: #ff0033; font-style: italic; font-size: 13px; padding: 4px 0;"
    );

    element.querySelector('.unblock-user').remove();
    createActionLink(config.labels.unblock, element, oldComment);
}

function getBlockedUsers() {
    let userList = localStorage.getItem('blockedUsers');
    return userList ? userList.split(',') : [];
}

function saveBlockedUsers(users) {
    localStorage.setItem('blockedUsers', users);
}