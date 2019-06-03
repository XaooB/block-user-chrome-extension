(function() {
  const commentsNodes = document.querySelectorAll('#komentarze dl');
  let blockedUsers = localStorage.getItem('blockedUsers');

  function hideComments(comments, users) {
    let deletedComments = 0;

    for (let i = 0; i < comments.length; i++)
      for (let j = 0; j < users.length; j++)
      //user is ALWAYS at [2] index in the array
        if(comments[i].children[0].innerHTML.toLowerCase().split(',')[2].trim() === users[j]) {
          comments[i].children[1].style.color = '#ee234e'
          comments[i].children[1].style.fontStyle = 'italic';
          comments[i].children[1].style.padding = '4px';
          comments[i].children[1].innerText = 'użytkownik zablokowany';
          deletedComments++;
        }
    //send number of deleted comments to the background
    if(deletedComments !== 0)
      return chrome.runtime.sendMessage({data: `${deletedComments}`});
    chrome.runtime.sendMessage({data: ''});
  }

  if(blockedUsers === null)
    localStorage.setItem('blockedUsers', '');

  blockedUsers = localStorage.getItem('blockedUsers');

  if(blockedUsers.length) {
    //function expects an array as 2nd parameter
    hideComments(commentsNodes,  blockedUsers.split(','));
  }

  chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    const commentsNodes = document.querySelectorAll('#komentarze dl');

    if(request === 'reset')
      return localStorage.setItem('blockedUsers', '');
    localStorage.setItem('blockedUsers', request);

    let blockedUsersArray = localStorage.getItem('blockedUsers').split(',');

    //otherwise send list back
    sendResponse({error: false, usersList: blockedUsersArray})

    //if theres no users to block blockedUsersArray[0] becomes an emptying - [""].
    if(blockedUsersArray[0].length > 1)
      return hideComments(commentsNodes, blockedUsersArray);

    //send message to background to hide badge
    chrome.runtime.sendMessage({data: ''});
  });
}());
