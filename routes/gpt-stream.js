const express = require('express');
const router = express.Router();
const { fetchStreamedChatContent } = require('streamed-chatgpt-api');

// 设置 OpenAI API 访问密钥
const API_KEY = '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';
const proxyDomain = 'https://ai-cloud1234.chinafang1234.workers.dev'; //自建 cloudflare

// Create an object to store chat history
const chatHistory = {};
const historyLength = 5; // Change this value to set the desired chat history length

// 定义路由，用于处理 POST 请求
router.post('/', async (req, res) => {
    // 获取请求参数
    const apiKey = API_KEY;//process.env.OPENAI_API_KEY;
    const { message, username } = req.body;

    // Check if username is provided
    if (!username) {
        return res.status(400).send('A username is required.');
    }

    // Initialize chat history for the user if it doesn't exist
    if (!chatHistory[username]) {
        chatHistory[username] = [];
    }

    // Update chat history with the user's message
    chatHistory[username].push({ role: 'user', content: message });

    // Prepare the message input with the user's chat history
    // just giving an empty string as system role to keep chat ouput short
    const messageInput = [
        {
            role: 'system',
            content: '',
        },
    ];

    const recentHistory = chatHistory[username].slice(-historyLength);
    recentHistory.forEach(msg => {
        messageInput.push(msg);
    });

    res.setHeader('Content-Type', 'text/html; charset=UTF-8');
    res.setHeader('Transfer-Encoding', 'chunked');

    let completeResponse = '';

    try {
        console.log("messageInput==>",messageInput)
        fetchStreamedChatContent({
            apiKey,
            messageInput,
            maxTokens: 1000,
            temperature: 0.1,
        }, (content) => {
            res.write(content);
            completeResponse += content;
        }, () => {
            res.end();
            chatHistory[username].push({ role: 'assistant', content: completeResponse });
        },
            () => {
                res.write("I'm sorry, there was an error processing your request.");
                res.end();
            });

    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
})

module.exports = router;