document.addEventListener('DOMContentLoaded', function() {
  document.querySelector('button').addEventListener('click', addUser, false);
  document.querySelector('#reset').addEventListener('click', resetList, false);
  document.querySelector('form').addEventListener('submit', submitForm, false);
  document.querySelector('.modal_button').addEventListener('click', sendReport, false);
  document.querySelector('li[name="report"]').addEventListener('click', closeModal, false);
  document.querySelector('.modal_exit').addEventListener('click', closeModal, false);

  const aboutContainer = document.querySelector('#modal');
  const blockedUsersContainer = document.querySelector('#blocked_users');
  const blockedUsersFromStorage = localStorage.getItem('blockedUsers');

  if(blockedUsersFromStorage === null || blockedUsersFromStorage.length <= 1) {
    blockedUsersContainer.innerText = '';
  } else {
    displayBlockedUsers(blockedUsersFromStorage);
  }

  function closeModal() {
    aboutContainer.classList.toggle('modal_visibility');
  }

  function sendReport(e) {
    e.preventDefault()
    alert('Obsłuja formularza nie została jeszcze zaimplementowana!');
  }

  function submitForm(e) {
    e.preventDefault();
    e.target.reset();
  }

  function resetList() {
    localStorage.setItem('blockedUsers', '');

    chrome.tabs.query({currentWindow: true, active: true}, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, 'reset');
    });

    displayBlockedUsers('');

    //send message to the background page and set badge to empty string
    chrome.runtime.sendMessage({data: ''});
  }

  function addUser () {
    const users = document.querySelector('form input').value;
    let newUsers = users
      .split(',')
      .map(item => item.replace(/\s+(?=\s)/g, '').trim())
      .filter(item => item.length > 0)
      .join();

    if(newUsers.length > 0) {
      let oldStorage = localStorage.getItem('blockedUsers');
      if(oldStorage !== null) {
        oldStorage += !oldStorage.length ? `${newUsers}` : `,${newUsers}`;

        //make storage unique
        let newStorage = [...new Set(oldStorage.toLowerCase().split(','))].join()

        //save new string to the localStorage
        localStorage.setItem('blockedUsers', newStorage);
      } else {
        localStorage.setItem('blockedUsers', newUsers);
      }

      //get updated list from storage
      const blockedUser = localStorage.getItem('blockedUsers');
      displayBlockedUsers(blockedUser);

      chrome.tabs.query({currentWindow: true, active: true}, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, blockedUser, setResponse);
      });
    } else {
      alert("Pole nie może byc puste!");
    }
  }

  function displayBlockedUsers(usersList) {
    if(typeof usersList === 'string' && usersList.length > 1)
      usersList = usersList.toLowerCase().split(',');

    blockedUsersContainer.innerText = '';

    if(usersList.length >= 1) {
      for (var i = 0; i < usersList.length; i++) {
        let element = document.createElement('li');
        blockedUsersContainer.appendChild(element).innerHTML = `${usersList[i]} - <span title='Usuń z listy' class='delete_user' data-name='${usersList[i]}'>❌</span>`;
      }
      document.querySelectorAll('.delete_user').forEach(item => item.addEventListener('click', deleteUser, false));
    }
  }

  function deleteUser(e) {
    const userName = e.target.dataset.name;
    let blockedUsers = localStorage.getItem('blockedUsers');
    let index = null;

    blockedUsers = blockedUsers.split(',');
    index = blockedUsers.indexOf(userName.replace(/-/g, ' '));

    if(index !== -1)
      blockedUsers.splice(index, 1);

    blockedUsers = blockedUsers.join();
    localStorage.setItem('blockedUsers', blockedUsers);

    chrome.tabs.query({currentWindow: true, active: true}, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, blockedUsers, setResponse);
    });
  }

  function setResponse({error, usersList}) {
    if(error) return alert(error);
    displayBlockedUsers(localStorage.getItem('blockedUsers'));
  }
}, false);
