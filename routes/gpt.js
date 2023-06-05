const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

// 设置 OpenAI API 访问密钥
const API_KEY = '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';
const proxyDomain = 'https://ai-cloud1234.chinafang1234.workers.dev'; //自建 cloudflare

// 定义路由，用于处理 POST 请求
router.post('/', async (req, res) => {
  // 获取请求参数
  const { prompt } = req.body;
  // const { prompt } = req.query;
  console.log("prompt=",prompt);

  try {
    // 调用 OpenAI API
    const response = await fetch(`${proxyDomain}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        messages: [{
          role: "system",
          content: `${prompt}`
        }],
        n: 1,
        stop: ['\n'],
        model: 'gpt-3.5-turbo',//'text-davinci-003',
        temperature: 0.5,
        max_tokens: 3500,
        // top_p: 1,
        // frequency_penalty: 0,
        // presence_penalty: 0,
      }),
    });

    // 设置响应头，告诉浏览器返回的是文本流
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // 当接收到 OpenAI API 的响应后，逐行输出文本
    response.body.on('data', (chunk) => {
      console.log("chunk---",chunk);
      const data = JSON.parse(chunk);
      console.log("data==",data)
      const text = data.choices[0].message;
      console.log("text==",text);
      // const data = await response.json();
      // 返回 API 响应
      // res.send(data.choices[0].text);
      res.write(`data: ${text}`);
      res.flush();
      // const lines = text.split('\n');
      // lines.forEach(line => {
      //   res.write(`data: ${line}\n\n`);
      //   res.flush();
      // });
    });

  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
