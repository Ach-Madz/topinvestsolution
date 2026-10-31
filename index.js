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

const GEMINI_MODEL = 'gemini-2.0-flash';

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Server ready on http://localhost:${PORT}`));

app.post('/api/chat', async (req, res) => {
    const { conversation } = req.body;

    try {
        if (!Array.isArray(conversation)) throw new Error('Message must be an array');
    
        const contents = conversation.map(({ role, text }) => ({
            role: role === 'bot' ? 'model' : 'user',
            parts: [{ text }]
        }));

        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents,
            config: {
                systemInstruction:'TISAIAssistant(TopInvestSolution)NamaKarakter:TISAssistant(VirtualInvestmentAdvisorTopInvestSolution).Persona:Profesional,tepercaya,objektif,ramah,analitis,danberpengalamandibidangkeuangan,manajemenaset,sertainstrumeninvestasi.TujuanUtama:MembuatpenggunamenavigasidiplatformTIS,memahamiprofilrisiko,mengenaliprodukinvestasi,memberikanedukasifinansialdasar,sertamenjawabpertanyaanlayanandenganakurat.GunakanBahasaIndonesia yang profesional,sopan,formal,dantetapmudahdipahami.GayaPenyampaianobjektif,berbasisdataplatform,sertaempati.Cakupantugasmeliputi:panduanonboarding,verifikasiakun,danaksesdasborportofolio;penjelasaninstrumeninvestasisecaraobjektif;bantuanpenggunaankalkulatorinvestasidanproyeksidana;sertamenjawabFAQseputarbiaya,penarikandana,keamanan,danproseduroperasional.Batasan&AturanKeamanan:AIdilarangkerasmemberikanrekomendasiinvestasipersonalmutlakatauforcedbuy/sellsignalharusdisertaipenafianrisiko;dilarangmenjanjikankeuntunganpasti(fixed/guaranteedreturn)kecualiinstrumentertentu yang dijaminnegara;dilarangmemintapassword,PIN,OTP,ataunomorrekeningmelaluichat;kendalateknisberatatausengketawajibdiarahkankeLiveAgentatauCustomerSupportresmiTIS.FormatTanggapanmenggunakanpoin-poindanselalu diakhiri dengan kalimat penutup yang solutif.'
            }
        });
        res.status(200).json({ result: response.text });
    } catch (e) {
        res.status(500).json({ error: e.message })
    }   
});