import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getDatabase, ref, push, onValue, update, remove } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";

const appSettings = {
    databaseURL: "https://riizemessage-default-rtdb.firebaseio.com/"
};

const app = initializeApp(appSettings);
const database = getDatabase(app);
const messageListInDB = ref(database, "messageList");
const userLikesRef = ref(database, "userLikes");

const messageEl = document.getElementById("message-el");
const fromEl = document.getElementById("from-el");
const toEl = document.getElementById("to-el");
const publishBtn = document.getElementById("publish-btn");
const messageListEl = document.getElementById("message-list");

publishBtn.addEventListener("click", function() {
    let messageValue = messageEl.value;
    let fromValue = fromEl.value;
    let toValue = toEl.value;

    if (messageValue && fromValue && toValue) {
        push(messageListInDB, {
            message: messageValue,
            from: fromValue,
            to: toValue,
            likes: 0
        });

        clearInputs();
    } else {
        alert("All fields are required.");
    }
});

onValue(messageListInDB, function(snapshot) {
    if (snapshot.exists()) {
        let messageArray = Object.entries(snapshot.val());

        clearMessageListEl();

        for (let i = 0; i < messageArray.length; i++) {
            let currentMessage = messageArray[i];
            appendMessageToMessageListEl(currentMessage);
        }
    } else {
        messageListEl.innerHTML = "No messages here... yet";
    }
});

function clearMessageListEl() {
    messageListEl.innerHTML = "";
}

function clearInputs() {
    messageEl.value = "";
    fromEl.value = "";
    toEl.value = "";
}

function appendMessageToMessageListEl(messages) {
    let messageID = messages[0];
    let messageData = messages[1];

    let newEl = document.createElement("li");

    let toElement = document.createElement("p");
    toElement.textContent = `To: ${messageData.to}`;
    toElement.style.fontWeight = 'bold';

    let textElement = document.createElement("p");
    textElement.textContent = messageData.message;

    let fromElement = document.createElement("p");
    fromElement.textContent = `From: ${messageData.from}`;
    fromElement.style.fontWeight = 'bold';
    fromElement.style.textAlign = 'right';

    let likeButton = document.createElement("button");
    likeButton.innerHTML = `<img src="assets/heart.png" style="width: 12px;"> ${messageData.likes}`;
    likeButton.addEventListener("click", function() {
        handleLikeClick(messageID, messageData.likes, likeButton);
    });

    newEl.appendChild(toElement);
    newEl.appendChild(textElement);
    newEl.appendChild(fromElement);
    newEl.appendChild(likeButton);

    newEl.addEventListener("dblclick", function() {  // Change to 'dblclick' for deletion
        let exactLocationOfItemInDB = ref(database, `messageList/${messageID}`);
        remove(exactLocationOfItemInDB);
    });

    messageListEl.append(newEl);
}

function handleLikeClick(messageID, currentLikes, likeButton) {
    const messageRef = ref(database, `messageList/${messageID}`);
    const currentUserLikesRef = ref(database, `userLikes/${messageID}/${getUserId()}`);

    onValue(currentUserLikesRef, (userSnapshot) => {
        if (!userSnapshot.exists()) {
            update(messageRef, { likes: currentLikes + 1 }).then(() => {
                likeButton.innerHTML = `<img src="assets/heart (1).png" style="width: 12px;"> ${currentLikes + 1}`;
                push(currentUserLikesRef, true);
            });
        } else {
            update(messageRef, { likes: currentLikes - 1 }).then(() => {
                likeButton.innerHTML = `<img src="assets/heart.png" style="width: 12px;"> ${currentLikes - 1}`;
                remove(currentUserLikesRef);
            });
        }
    }, { onlyOnce: true });
}

function getUserId() {
    // Replace with actual user ID retrieval logic
    return "user123";
}
