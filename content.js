(function() {
  const commentsNodes = document.querySelectorAll('#komentarze dl');
  let blockedUsers = localStorage.getItem('blockedUsers');

  if(blockedUsers === null)
    localStorage.setItem('blockedUsers', '');

    blockedUsers = localStorage.getItem('blockedUsers');

  if(blockedUsers.length) {
    let blockedUsersArray = blockedUsers.split(',');
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

    //wali błędem, bo to jest puste
    const blockedUsersArray = localStorage.getItem('blockedUsers').split(',');

    //otherwise send list back
    sendResponse({error: false, usersList: blockedUsersArray})

    //if theres no users to block blockedUsersArray[0] gonna be "".
    if(blockedUsersArray[0].length > 1) {
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
