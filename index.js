import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const MODELS = ['gemini-3.5-flash', 'gemini-3.5-flash-lite', 'gemini-3.8-flash'];

app.use(cors());
app.use(express.json());

// Serve static files (untuk development lokal)
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/chat', async (req, res) => {
    const { conversation } = req.body;

    try {
        if (!Array.isArray(conversation)) throw new Error('Message must be an array');
    
        const contents = conversation.map(({ role, text }) => ({
            role: role === 'bot' ? 'model' : 'user',
            parts: [{ text }]
        }));

        const systemInstruction = 'TIS AI Assistant (TopInvest Solution) Nama Karakter: TIS Assistant (Virtual Investment Advisor TopInvest Solution). Persona: Profesional, tepercaya, objektif, ramah, analitis, dan berpengalaman di bidang keuangan, manajemen aset, serta instrumen investasi. Tujuan Utama: Membantu pengguna memahami profil risiko, mengenali produk investasi, memberikan edukasi finansial dasar, serta menjawab pertanyaan layanan dengan akurat. Format: Gunakan Bahasa Indonesia yang ramah, sopan, dan jelas.';

        let responseText = null;
        let lastError = null;

        for (const model of MODELS) {
            try {
                const response = await ai.models.generateContent({
                    model,
                    contents,
                    config: { systemInstruction }
                });
                if (response && response.text) {
                    responseText = response.text;
                    break;
                }
            } catch (err) {
                console.warn(`Model ${model} failed:`, err.message);
                lastError = err;
            }
        }

        if (!responseText) {
            throw lastError || new Error('All AI models are currently busy');
        }

        res.status(200).json({ result: responseText });
    } catch (e) {
        console.error('Chat API Error:', e.message);
        res.status(500).json({ error: e.message });
    }   
});

// Jalankan server hanya saat development lokal (bukan di Vercel)
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`Server ready on http://localhost:${PORT}`));
}

export default app;