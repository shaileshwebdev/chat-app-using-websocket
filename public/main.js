const socket = io();
const clientTotal = document.getElementById("client-total");
const messageContainer = document.getElementById("message-container");
const nameInput = document.getElementById("name-input");
const messageForm = document.getElementById("message-form");
const messageInput = document.getElementById("message-input");

socket.on("client-total", (data) => {
  clientTotal.innerText = `Client-Total:${data}`;
});

messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  sendMessage();
});

function sendMessage() {
  if (messageInput.value.trim() === "") return;

  const data = {
    name: nameInput.value || "Anonymous",
    message: messageInput.value,
    dateTime: new Date(),
  };

  socket.emit("message", data);
  addMessageToUi(true, data);
  messageInput.value = "";
}

socket.on("chat-message", (data) => {
  addMessageToUi(false, data);
});

function addMessageToUi(isOwnMessage, data) {
  clearFeedback();

  const element = ` 
    <li class="${isOwnMessage ? "message-right" : "message-left"}">
      <p class="message">
        ${data.message}
        <span>${data.name} 🔵 ${new Date(data.dateTime).toLocaleTimeString()}</span>
      </p>
    </li>`;

  messageContainer.innerHTML += element;
  scrollToBottom();
}

function scrollToBottom() {
  messageContainer.scrollTop = messageContainer.scrollHeight;
}

//
// 🔥 FIXED TYPING LOGIC
//

let typingTimeout;

messageInput.addEventListener("input", () => {
  socket.emit("feedback", {
    feedback: nameInput.value || "Someone",
  });

  clearTimeout(typingTimeout);

  typingTimeout = setTimeout(() => {
    socket.emit("feedback", {
      feedback: "",
    });
  }, 1000);
});

//
// 🔥 FIXED FEEDBACK UI
//

socket.on("feedback", (data) => {
  clearFeedback();

  if (!data.feedback) return; // ✅ prevent empty "is typing"

  const element = `
    <li class="message-feedback">
      <p class="feedback">${data.feedback} is typing...</p>
    </li>`;

  messageContainer.innerHTML += element;
});

function clearFeedback() {
  document.querySelectorAll("li.message-feedback").forEach((element) => {
    element.remove();
  });
}
