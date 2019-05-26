document.addEventListener('DOMContentLoaded', function() {
  document.querySelector('button').addEventListener('click', onClick, false);
  document.querySelector('form').addEventListener('submit', e => e.preventDefault(), false);

  const blockedUsersContainer = document.querySelector('#blocked_users');
  let blockedUsersFromStorage = localStorage.getItem('blockedUsers');

  if(blockedUsersFromStorage === null) {
    let p = document.createElement('p');
    blockedUsersContainer.appendChild(p).innerText = 'Brak zablokowanych użytkowników.';
  } else {
    //hide comments on launch
    chrome.tabs.query({currentWindow: true, active: true}, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, blockedUsersFromStorage, setResponse);
    });
    displayBlockedUsers(blockedUsersFromStorage);
  }

  function onClick () {
    const newUser = document.querySelector('form input').value.trim();

    if(newUser.length > 0) {
      if(localStorage.getItem('blockedUsers') !== null) {
        let oldStorage = localStorage.getItem('blockedUsers');
        let newStorage = '';

        //make storage unique
        oldStorage += `,${newUser}`;
        oldStorage = oldStorage.toLowerCase().split(',');
        oldStorage = new Set(oldStorage);
        newStorage = [...oldStorage];
        newStorage = newStorage.join();

        //save new string to the localStorage
        localStorage.setItem('blockedUsers', newStorage);
      } else {
        localStorage.setItem('blockedUsers', newUser);
      }
      let blockedUser = localStorage.getItem('blockedUsers');

      chrome.tabs.query({currentWindow: true, active: true}, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, blockedUser, setResponse);
      });
    } else {
      alert("Pole nie może byc puste!");
    }
  }

  function displayBlockedUsers(usersList) {
    if(typeof usersList === 'string')
      usersList = usersList.toLowerCase().split(',');

    blockedUsersContainer.innerText = '';

    if(usersList.length > 1) {
      for (var i = 0; i < usersList.length; i++) {
        let element = document.createElement('li');
        blockedUsersContainer.appendChild(element).innerHTML = `${usersList[i]} - <span title='Usuń z listy' class='delete_user' data-name=${usersList[i]}>❌</span>`;
      }
      document.querySelectorAll('.delete_user').forEach(item => item.addEventListener('click', deleteUser, false));
    }
  }

  function deleteUser(e) {
    let userName = e.target.dataset.name,
        blockedUsers = localStorage.getItem('blockedUsers'),
        index = null;

    blockedUsers = blockedUsers.split(',');
    index = blockedUsers.indexOf(userName);

    //delete index
    if(index !== -1)
      blockedUsers.splice(index, 1);

    blockedUsers = blockedUsers.join();
    localStorage.setItem('blockedUsers', blockedUsers);

    displayBlockedUsers(blockedUsers);
  }

  function setResponse({error, usersList}) {
    if(error) return alert(error);
    let blockedUsers = localStorage.getItem('blockedUsers');

    displayBlockedUsers(blockedUsers);
  }
}, false);
