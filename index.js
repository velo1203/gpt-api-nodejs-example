require("dotenv").config();
const express = require("express");
const OpenAI = require("openai");

const app = express();
const port = 3000;

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

app.use(express.json());

app.post("/api/paragraphs", async (req, res) => {
    const { paragraphs } = req.body;

    if (!Array.isArray(paragraphs) || paragraphs.length === 0) {
        return res.status(400).json({ error: "Paragraphs array is required" });
    }

    try {
        const prompt = `
        아래는 여러 문단으로 구성된 한국어 지문입니다. 각 문단을 개별적으로 분석하여 요약하고 난이도를 평가하세요. 반환 형식은 아래와 같은 JSON이어야 합니다:
        {
            "difficulty_level": "0~100",
            "difficulty_reason": "난이도를 평가한 이유를 설명합니다.",
            "paragraphs": [
                {
                    "paragraph_number": 1,
                    "summary": "문단 요약",
                    "analysis": "문단 분석"
                },
                ...
            ]
        }

        문단 데이터:
        ${paragraphs
            .map((para, index) => `문단 ${index + 1}: """${para}"""`)
            .join("\n\n")}

        결과는 반드시 위 JSON 형식을 정확히 따라야 합니다. 추가 텍스트 없이 JSON만 반환하세요. 코드블럭은 절대로 없어야합니다.
        `;

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 10000,
            temperature: 0.1,
        });

        const analysis = response.choices[0]?.message?.content.trim();
        try {
            const jsonAnalysis = JSON.parse(analysis);
            return res.json({ analysis: jsonAnalysis });
        } catch (parseError) {
            console.error("Error parsing AI response:", parseError);
            return res
                .status(500)
                .json({ error: "Failed to parse AI response into JSON" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error analyzing paragraphs" });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
