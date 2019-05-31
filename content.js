(function() {
  function hideComments(comments, users) {
    let deletedComments = 0;

    for (let i = 0; i < comments.length; i++)
      for (let j = 0; j < users.length; j++)
        if(comments[i].children[0].innerHTML.toLowerCase().indexOf(users[j].trim()) !== -1) {
          comments[i].style.display = 'none';
          deletedComments++;
        }

    //send number of deleted comments to the background
    chrome.runtime.sendMessage({data: `${deletedComments}`});
  }

  const commentsNodes = document.querySelectorAll('#komentarze dl');
  let blockedUsers = localStorage.getItem('blockedUsers');

  if(blockedUsers === null)
    localStorage.setItem('blockedUsers', '');

  blockedUsers = localStorage.getItem('blockedUsers');

  if(blockedUsers.length) {
    let blockedUsersArray = blockedUsers.split(',');
    hideComments(commentsNodes, blockedUsersArray);
  }

  chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if(request === 'reset')
      return localStorage.setItem('blockedUsers', '');

    localStorage.setItem('blockedUsers', request);

    const commentsNodes = document.querySelectorAll('#komentarze dl');
    let blockedUsersArray = localStorage.getItem('blockedUsers').split(',');

    //otherwise send list back
    sendResponse({error: false, usersList: blockedUsersArray})

    //if theres no users to block blockedUsersArray[0] gonna be "".
    if(blockedUsersArray[0].length > 1)
      return hideComments(commentsNodes, blockedUsersArray);

    //send message to background to hide badge
    chrome.runtime.sendMessage({data: ``});
  });
}());
