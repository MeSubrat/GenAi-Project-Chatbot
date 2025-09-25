const chatBox = document.getElementById('chat-box');
const chatInput = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');
const msg = document.querySelector('.message');
const chatContainer = document.querySelector('.chat-container');

const threadId = Date.now().toString(36) + Math.random().toString(36);

const loading = document.createElement('p');
loading.textContent = 'Thinking...'
loading.classList.add('pulse-text');


sendBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    const text = chatInput.value;
    if (!text) return;
    await generate(text);
    chatBox.scrollTop = chatBox.scrollHeight;
});

async function generate(text) {
    const p = document.createElement('p');
    p.classList.add('message', 'user');
    p.innerText = text;

    chatBox.appendChild(p);
    chatInput.value = '';

    chatBox.appendChild(loading);

    const assistantMessage = await callServer(text);
    // console.log('Assistant call: ',assistantMessage.message);
    loading.remove();

    const assistantMessageElement = document.createElement('p');
    assistantMessageElement.classList.add('message', 'assistant');
    assistantMessageElement.innerText = assistantMessage.message;
    chatBox.appendChild(assistantMessageElement);
}
async function callServer(inputText) {
    const response = await fetch(`https://genai-project-chatbot.onrender.com/chat`, {
        method: 'POST',
        headers: {
            'content-type': 'application/json'
        },
        body: JSON.stringify({ threadId, message: inputText })
    });

    if (!response.ok) {
        throw new Error('Error while generating the response')
    }
    return await response.json();
}
chatInput.addEventListener('keyup', handleEnter);
async function handleEnter(e) {
    if (e.key === 'Enter') {
        const text = chatInput.value;
        if (!text) return;
        await generate(text);
        chatBox.scrollTop = chatBox.scrollHeight;
    }
}


