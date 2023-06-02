const express = require('express');

const router = express.Router();

const fetch = require('node-fetch');

// 设置 OpenAI API 访问密钥
const API_KEY = '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'; //常用-测试用

// const gcDomain = 'https://api.openai.com';//官方

const proxyDomain = 'https://noisy-mouse-82.deno.dev'; //自建
// 定义路由，用于处理 GET 请求
router.get('/', async (req, res) => {
    // 获取请求参数
    const {
        prompt
    } = req.query;

    try {
        // 调用 OpenAI API
        const response = await fetch(`${proxyDomain}/v1/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${API_KEY}`,
            },
            body: JSON.stringify({
                // prompt,
                // max_tokens: 1024,
                messages: [{
                    role: "system",
                    content: prompt
                }],
                n: 1,
                stop: ['\n'],
                model: 'gpt-3.5-turbo',//'text-davinci-003',
                temperature: 0.5,
                max_tokens: 3500,
                top_p: 1,
                frequency_penalty: 0,
                presence_penalty: 0,
            }),
        });

        const data = await response.json();

        // 返回 API 响应
        res.send(data.choices[0].text);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;