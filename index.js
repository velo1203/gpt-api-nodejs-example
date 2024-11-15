require("dotenv").config();
const express = require("express");
const OpenAI = require("openai");

const app = express();
const port = 3000;

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

app.use(express.json());

app.post("/api/analyze-text", async (req, res) => {
    const { passage } = req.body;

    if (!passage) {
        return res.status(400).json({ error: "Passage is required" });
    }

    try {
        const prompt = `
        다음은 고등학교 수준의 한국어 비문학 지문입니다. 이 지문을 분석하여 아래의 형식에 맞춰 결과를 제공합니다.
        

        `;

        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 300,
            temperature: 0.5,
        });

        const analysis = response.choices[0].message.content.trim();

        res.json({ analysis });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error analyzing text" });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
