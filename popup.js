document.addEventListener('DOMContentLoaded', function() {
  const aboutContainer = document.querySelector('#modal');
  document.querySelector('button').addEventListener('click', addUser, false);
  document.querySelector('#reset').addEventListener('click', resetList, false);
  document.querySelector('form').addEventListener('submit', e => e.preventDefault(), false);
  document.querySelector('.modal_button').addEventListener('click', sendReport, false);
  document.querySelector('li[name="report"]').addEventListener('click', closeModal, false);
  document.querySelector('.modal_exit').addEventListener('click', closeModal, false);

  const blockedUsersContainer = document.querySelector('#blocked_users');
  let blockedUsersFromStorage = localStorage.getItem('blockedUsers');

  if(blockedUsersFromStorage === null || blockedUsersFromStorage.length <= 1) {
    let p = document.createElement('p');
    blockedUsersContainer.appendChild(p).innerText = '';
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

  function resetList() {
    localStorage.setItem('blockedUsers', '');

    chrome.tabs.query({currentWindow: true, active: true}, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, 'reset');
    });

    displayBlockedUsers('');
  }

  function addUser () {
    const users = document.querySelector('form input').value.trim();
    newUsers = users.split(',').map(item => item.trim()).filter(item => item.length > 0).join();

    if(newUsers.length > 0) {
      if(localStorage.getItem('blockedUsers') !== null) {
        let oldStorage = localStorage.getItem('blockedUsers');
        let newStorage = '';

        //make storage unique
        if(!oldStorage.length) {
          oldStorage += `${newUsers}`;
        } else {
          oldStorage += `,${newUsers}`;
        }

        oldStorage = oldStorage.toLowerCase().split(',');
        oldStorage = new Set(oldStorage);
        newStorage = [...oldStorage];
        newStorage = newStorage.join();

        //save new string to the localStorage
        localStorage.setItem('blockedUsers', newStorage);
      } else {
        localStorage.setItem('blockedUsers', newUsers);
      }

      let blockedUser = localStorage.getItem('blockedUsers');
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

    if(!usersList.length) {
      let p = document.createElement('p');

      blockedUsersContainer.innerText = '';
      return blockedUsersContainer.appendChild(p).innerText = '';
    }

    blockedUsersContainer.innerText = '';

    if(usersList.length >= 1) {
      for (var i = 0; i < usersList.length; i++) {
        let element = document.createElement('li');
        blockedUsersContainer.appendChild(element).innerHTML = `${usersList[i]} - <span title='Usuń z listy' class='delete_user' data-name='${usersList[i]}'>❌</span>`;
        // blockedUsersContainer.appendChild(element).innerHTML = `${usersList[i]} - <span title='Usuń z listy' class='delete_user' data-name=${usersList[i].replace(/\s/g, '-')}>❌</span>`;
      }
      document.querySelectorAll('.delete_user').forEach(item => item.addEventListener('click', deleteUser, false));
    }
  }

  function deleteUser(e) {
    let userName = e.target.dataset.name,
        blockedUsers = localStorage.getItem('blockedUsers'),
        index = null;

    blockedUsers = blockedUsers.split(',');
    index = blockedUsers.indexOf(userName.replace(/-/g, ' '));

    //delete index
    //problem jest taki, że dataset ucina sentencje jezeli zawierają puste znaki, np.
    //ala ma kota = ala
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
    let blockedUsers = localStorage.getItem('blockedUsers');

    displayBlockedUsers(blockedUsers);
  }
}, false);
