const config = {
    messages: {
        userMarkedAsBlocked: 'Użytkownik został dodany do listy.',
        userBlocked: 'Użytkownik zablokowany - ',
    },
    userType: {
        blocked: 'BLOCKED',
        unblocked: 'UNBLOCKED',
    },
    labels: {
        block: 'Zablokuj',
        unblock: 'Odblokuj',
    },
    selectors: {
        userName: '.user-comment__name',
        loggedUserName: '.signed-user-name',
        commentHolder: '.comments-list .user-comment:not(.sponsor-comment)',
        commentHolderLevel2: '.comments-list--level2 article',
        commentText: '.comment-text',
        commentAction: '.comments-action',
        commentsBlocked: `[data-user-type="BLOCKED"]`,
        commentsUnblocked: `article:not(.sponsor-comment) .comment-text:not([data-user-type="BLOCKED"]):not(.comment-notice-message-copy)`,
        commentsMoreButton: '.c-comments__new-link:not(.fn-hidden)',
        commentsArticleMoreButton: '.c-comments__loadMore button',
        commentsAnswerButton: '.comments-action > :first-child',
        commentsLikeButton: '.c-comments__rating-container i',
        commentsRatingButton: '.c-comments__rating-container',
        customBlockButton: '.unblock-user',
    },
    global: {
        initialLoad: true
    }
}

//init app
initApp();

function initApp() {
    var script = document.createElement('script');
    script.src = chrome.runtime.getURL('injected.js');
    script.id = chrome.runtime.id;

    (document.head || document.documentElement).appendChild(script);

    chrome.runtime.onMessage.addListener(function (message, sender) {
        let commentsNodes = document.querySelectorAll(config.selectors.commentHolder),
            blockedUsers = getBlockedUsers();
        
        //Rearrange the list if user liked or unliked the comment
        //We have to do that like this because on each like/unlike AJAX call is executed and reloads the comments
        if (message.likeUnlike) {
            cleanupBlockedComments(document.querySelectorAll(config.selectors.commentsBlocked));
            cleanupUnblockedComments(document.querySelectorAll(config.selectors.commentsUnblocked))
            hideComments(commentsNodes, blockedUsers);
            bindAnswerButton();
        }

        //Means that either edit or post was called
        if (message.interception) {
            cleanupUnblockedComments(document.querySelectorAll(config.selectors.commentsUnblocked))
            cleanupBlockedComments(document.querySelectorAll(config.selectors.commentsBlocked));
            hideComments(commentsNodes, blockedUsers);
            bindArticleMoreButton();
            bindMoreButton();
            bindAnswerButton();
            config.global.initialLoad = false;
        } 

        //Reset the blocked users list
        if (message.reset) {
            localStorage.setItem('blockedUsers', '')
            let blockedComments = document.querySelectorAll(config.selectors.commentsBlocked),
                blockedCommentsHolder = Array.from(blockedComments).map(function (el) {
                    return el.closest(config.selectors.commentHolder)
                }),
                blockedUsers = getBlockedUsers();

            cleanupBlockedComments(blockedComments)
            hideComments(blockedCommentsHolder, blockedUsers);
        }
    });

    bindMoreButton();
}

function bindAnswerButton() {
    let buttons = document.querySelectorAll(config.selectors.commentsAnswerButton),
        isUserLogged = document.querySelector(config.selectors.loggedUserName);

    //If user is not logged in do not even bother to bind event listener
    if (!isUserLogged) {
        return;
    }
    
    if (buttons) {
        buttons.forEach(button => {
            button.addEventListener('click', bindAnswerButtonFunction, true);
        })
    }
}

function bindAnswerButtonFunction() {
    let node = this.closest('.comments-list--level2'),
        nodeParent = this.closest('.expanded'),
        blockedUsers = getBlockedUsers(),
        self = this;
    
    setTimeout(function () {
        if (!node) {
            //We have to do that because if user wanted to answer to the original comment (parent)
            //then node was set to undefined and hideComments wasn't firing. 
            node = self.closest('article');
        }
        
        if (node) {
            bindAnswerButton.bind(self)();
            //We are filtering out parent node to NOT allow adding two or more action buttons
            let comments = node.querySelectorAll('article'),
                filteredComments = Array.from(comments).filter(x => x !== nodeParent); 
            
            if (filteredComments) {
                hideComments(filteredComments, blockedUsers)
            }
        }
    },0)
}

function bindMoreButton() {
    let buttons = document.querySelectorAll(config.selectors.commentsMoreButton)

    if (buttons) {
        buttons.forEach(button => {
            if (!button.classList.contains('fn-hidden') && !button.classList.contains('hide')) {
                button.addEventListener('click', function () {
                    setTimeout(hideCommentsOnExpand.bind(this), 0)
                }, true)
            }
        });
    }
}

function bindArticleMoreButton() {
    let button = document.querySelector(config.selectors.commentsArticleMoreButton),
        oldComments = null;

    if (button) {
        button.addEventListener('click', function () {
            oldComments = Array.from(document.querySelectorAll(config.selectors.commentHolder));

            let interval = setInterval(function () {
                let newComments = Array.from(document.querySelectorAll(config.selectors.commentHolder));

                if (newComments.length > oldComments.length) {
                    let commentsDiff = newComments
                        .filter(x => !oldComments.includes(x))
                        .concat(oldComments.filter(x => !newComments.includes(x)));
                    
                    hideComments(commentsDiff, getBlockedUsers());
                    bindMoreButton();
                    bindAnswerButton();
                    clearInterval(interval);
                }
            }, 300)
        }, true)
    }
}

function hideCommentsOnExpand() {
    let article = this.closest('article'),
        isExpanded = article.classList.contains('expanded');

    if (isExpanded) {
        let comments = article.querySelectorAll(config.selectors.commentHolder),
            parentComment = article.closest('.user-comment--firstCommentsVisible'),
            blockedUsers = getBlockedUsers(),
            unblockedComments = article.querySelectorAll(config.selectors.commentsUnblocked),
            blockedComments = article.querySelectorAll(config.selectors.commentsBlocked);
        
        cleanupBlockedComments(blockedComments)
        cleanupUnblockedComments(unblockedComments)
        hideComments(comments, blockedUsers)
        hideComments([parentComment], blockedUsers)
        bindAnswerButton();
    }
}

function deleteCommentNotice(originalNode) {
    let noticeNode = originalNode.querySelector('.comment-notice-message-copy'),
        comment = originalNode.querySelector(config.selectors.commentText);

    if (noticeNode) {
        comment.parentNode.removeChild(noticeNode);
    }
}

function createCommentNotice(originalNode) {
    let div = document.createElement('div');
    originalNode = originalNode.querySelector(config.selectors.commentText);

    originalNode.style.display = 'none';
    div.classList.add('comment-text', 'comment-notice-message-copy');
    div.setAttribute(
        "style",
        "color; font-size: 12px; padding: 4px 0;"
    );

    div.innerText = config.messages.userBlocked;
    insertAfter(div, originalNode);
}

function insertAfter(newNode, refNode) {
    refNode.parentNode.insertBefore(newNode, refNode.nextSibling);
}

function resetComments(comments, unblockedUserName) {
    for (let i = 0; i < comments.length; i++) {
        let userName = comments[i].querySelector(config.selectors.userName);

        if (!userName) {
            continue;
        }
        
        let commentUserName = userName.textContent.trim(),
            commentContent = comments[i].querySelector(config.selectors.commentText),
            article = comments[i].closest('article')

        if (unblockedUserName === commentUserName) {
            commentContent.style.display = 'block';
            commentContent.dataset.userType = config.userType.unblocked;
            article.querySelector('.user-comment__name').style.display = 'block';
            article.querySelector('.c-comments__avatar').style.display = 'block';
            article.querySelector('time').style.display = 'block';
            article.querySelector(config.selectors.customBlockButton).remove();
            createActionLink(config.labels.block, comments[i]);
        }
    }
}

function cleanupBlockedComments(comments) {
    comments.forEach(comment => {
        comment.parentNode.removeChild(comment.nextSibling)
        comment.dataset.userType = config.userType.unblocked;
        comment.setAttribute('style', '');
        
        comment.closest('.c-comments__box').querySelector('.user-comment__name').style.display = 'block';
        comment.closest('.c-comments__box').querySelector('.c-comments__avatar').style.display = 'block';
        comment.closest('.c-comments__box').querySelector('time').style.display = 'block';
        comment.closest('.c-comments__box').querySelector('time').style.display = 'block';
        comment.closest('.c-comments__box').querySelector(config.selectors.commentsRatingButton).style.display = 'block';
    });
}

function cleanupUnblockedComments(comments) {
    if (!config.global.initialLoad) {
        comments.forEach(comment => {
            let customBtn = comment.nextSibling.querySelector(config.selectors.customBlockButton);
            
            if (customBtn) {
                comment.nextSibling.removeChild(customBtn)
            }
        });
    }
}

function hideComments(comments, users, deletedComments = 0, userToBeBlocked = '') {
    let loggedUser = document.querySelector(config.selectors.loggedUserName);
    loggedUser = loggedUser ? loggedUser.textContent.trim() : ''

    for (let i = 0; i < comments.length; i++) {
        let userName = comments[i].querySelector(config.selectors.userName),
            customButtonExist = comments[i].querySelector(config.selectors.customBlockButton);
        
        if (!userName) {
            continue;
        }
        
        let commentUserName = userName.textContent.trim(),
            commentContent = comments[i].querySelector(config.selectors.commentText),
            article = comments[i].closest('article');

        if (commentUserName === loggedUser) {
            continue;
        }

        if (userToBeBlocked && userToBeBlocked === commentUserName) {
            commentContent.style.display = 'none';
            commentContent.dataset.userType = config.userType.blocked;
            article.querySelector('.user-comment__name').style.display = 'none';
            article.querySelector('.c-comments__avatar').style.display = 'none';
            article.querySelector(config.selectors.commentsRatingButton).style.display = 'none';
            article.querySelector('time').style.display = 'none';
            article.querySelector(config.selectors.customBlockButton).remove();
            createActionLink(config.labels.unblock, comments[i], null, customButtonExist);
            continue;
        } else if (userToBeBlocked) {
            continue;
        }

        if (users.includes(commentUserName)) {
            let comment = comments[i].querySelector(config.selectors.commentText),
                oldComment = comment.textContent.trim();

            comment.dataset.userType = config.userType.blocked;
            article.querySelector('.user-comment__name').style.display = 'none';
            article.querySelector('.c-comments__avatar').style.display = 'none';
            article.querySelector('time').style.display = 'none';
            article.querySelector(config.selectors.commentsRatingButton).style.display = 'none';
            createActionLink(config.labels.unblock, comments[i], oldComment, customButtonExist);
            deletedComments++;
        } else {
            createActionLink(config.labels.block, comments[i], null, customButtonExist);
        }
    }
}

function createActionLink(nodeName, holder, oldComment = null, customButtonExist) {
    let anchor = document.createElement('a'),
        userName = holder.querySelector(config.selectors.userName).textContent.trim(),
        userType = holder.querySelector(config.selectors.commentText).dataset.userType,
        originalNode = holder.querySelector('.user-comment__text');

    anchor.classList.add('unblock-user', 'link-naked', 'text-color_appblue', 'box-inline', 'shift-margin_2-right', 'user-actions');
    anchor.setAttribute('style', 'font-weight: bold;');
    anchor.textContent = nodeName;
    anchor.title = nodeName + ' użytkownika ' + userName;
    anchor.dataset.userName = userName;

    switch (userType) {
        case config.userType.blocked:
            anchor.onclick = unblockUser;
            createCommentNotice(originalNode);
            break;

        case config.userType.unblocked:
            anchor.onclick = blockUser;
            deleteCommentNotice(originalNode);
            break;

        default:
            anchor.onclick = blockUser;
            break;
    }

    if (oldComment) {
        anchor.dataset.hiddenContent = oldComment;
    }

    if (userType === config.userType.blocked) {
        holder.querySelector('.comment-notice-message-copy').append(anchor);
        holder.querySelector('.js-Comment-Action-Box').style.display = 'none';
        holder.querySelector('.c-comments__box').style.paddingTop = "5px";
        holder.querySelector('.c-comments__box').style.paddingBottom = "5px";
        holder.querySelector('.c-comments__box').style.fontSize = "15px";
    } else {
        holder.querySelector(config.selectors.commentAction).append(anchor);
        holder.querySelector('.js-Comment-Action-Box').style.display = 'block';
        holder.querySelector('.c-comments__box').style.paddingTop = "";
        holder.querySelector('.c-comments__box').style.paddingBottom = "";
        holder.querySelector('.c-comments__box').style.fontSize = "";
    }
}

function unblockUser(event) {
    let element = event.target.closest('article'),
        comment = element.querySelector(config.selectors.commentText),
        blockedUsers = getBlockedUsers(),
        userName = element.querySelector(config.selectors.userName).textContent.trim(),
        indexToDelete = blockedUsers.indexOf(userName),
        comments = document.querySelectorAll(config.selectors.commentHolder),
        article = comment.closest('article');

    blockedUsers.splice(indexToDelete, 1);
    saveBlockedUsers(blockedUsers.join());

    comment.dataset.userType = config.userType.unblocked;
    comment.setAttribute('style', '');
    article.querySelector('.user-comment__name').style.display = 'block';
    article.querySelector('.c-comments__avatar').style.display = 'block';
    article.querySelector('time').style.display = 'block';
    article.querySelector(config.selectors.commentsRatingButton).style.display = 'block';
    resetComments(comments, userName);
    
    chrome.runtime.sendMessage(chrome.runtime.id, {interception: true});
    chrome.runtime.sendMessage({blockedAmount: getBlockedUsers().length > 0 ? getBlockedUsers().length.toString() : ''});
}

function blockUser(event) {
    let element = event.target.closest('article'),
        userName = element.querySelector(config.selectors.userName).textContent.trim(),
        blockedUsers = getBlockedUsers();
    
    blockedUsers.push(userName);
    let newList = [...new Set(blockedUsers)].join();
    saveBlockedUsers(newList);
    
    chrome.runtime.sendMessage(chrome.runtime.id, {interception: true});
    chrome.runtime.sendMessage({blockedAmount: getBlockedUsers().length > 0 ? getBlockedUsers().length.toString() : ''});
}

function getBlockedUsers() {
    let userList = localStorage.getItem('blockedUsers');
    return userList ? userList.split(',') : [];
}

function saveBlockedUsers(users) {
    localStorage.setItem('blockedUsers', users);
}