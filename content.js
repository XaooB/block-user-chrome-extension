(function() {
  const commentsNodes = document.querySelectorAll('#komentarze dl');
  const blockedUsers =  localStorage.getItem('blockedUsers');

  if(blockedUsers === null) return;
  let blockedUsersArray = blockedUsers.split(',');
  if(blockedUsersArray.length) {

  //hide comments
    for (let i = 0; i < commentsNodes.length; i++) {
      for (let j = 0; j < blockedUsersArray.length; j++) {
        if(commentsNodes[i].children[0].innerHTML.toLowerCase().indexOf(blockedUsersArray[j].trim()) !== -1)
          commentsNodes[i].style.display = 'none';
      }
    }
  }

  chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    const commentsNodes = document.querySelectorAll('#komentarze dl');
    localStorage.setItem('blockedUsers', request);

    const blockedUsersArray = localStorage.getItem('blockedUsers').split(',');

    //otherwise send list back
    sendResponse({error: false, usersList: blockedUsersArray})

    if(blockedUsersArray.length) {
    //hide comments
      for (let i = 0; i < commentsNodes.length; i++) {
        for (let j = 0; j < blockedUsersArray.length; j++) {
          if(commentsNodes[i].children[0].innerHTML.toLowerCase().indexOf(blockedUsersArray[j].trim()) !== -1)
            commentsNodes[i].style.display = 'none';
        }
      }
    }
  });
}());
