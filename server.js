// -------------------- DEPENDANCES --------------------
import express       from 'express';
import rateLimit     from 'express-rate-limit';
import cors          from 'cors';
import helmet        from 'helmet';
import morgan        from 'morgan';
import { OpenAI }    from 'openai';
import validator     from 'validator';
import 'dotenv/config';           // charge .env

const { escape } = validator;

// -------------------- APP & MIDDLEWARE ---------------
const app = express();

app.use(cors());                      // CORS simple
app.use(express.json());              // body-parser
app.use(morgan('combined'));          // logs Apache-like
app.use(helmet({ contentSecurityPolicy: false })); // sécurité HTTP

// Rate limit: 5 req/min/IP
app.use('/api/generate-poem', rateLimit({
  windowMs: 60_000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false
}));

// -------------------- OPENAI -------------------------
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// -------------------- ROUTE API ----------------------
app.post('/api/generate-poem', async (req, res) => {
  try {
    const safeName    = escape(String(req.body.name || '').trim().slice(0, 40));
    const safeQuality = escape(String(req.body.quality || '').trim().slice(0, 40));

    if (!safeName || !safeQuality) {
      return res.status(400).json({ error: 'Champs manquants.' });
    }

    const prompt = `Compose un poème français doux et chaleureux qui s'adresse directement à \
${safeName} (« vous ») et fait l'éloge de sa ${safeQuality}. Adapte le poème en fonction \
Fais un clin d'œil à la qualité de La Boucherie Capitol et à la cuisine du client. \
Invite poliment à laisser un avis Google pour la boucherie (sans URL). \
Trois strophes, quatre vers chacune, rimes plates ou riches, vocabulaire simple mais non familier.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      temperature: 0.7,
      max_tokens: 250,
      messages: [
        { role: 'system', content: 'Tu es un poète français qui célèbre la gastronomie.' },
        { role: 'user',   content: prompt }
      ]
    });

    return res.json({ poem: completion.choices[0].message.content.trim() });
  } catch (err) {
    console.error(err);
    return res.status(502).json({ error: 'Erreur appel OpenAI' });
  }
});

// -------------------- STATIC & SERVEUR ---------------
app.use(express.static('public'));    // sert index.html, app.js, etc.

app.get('/', (req, res) => {
  res.sendFile('index.html', { root: 'public' });
});
app.get('/mentions-legales.html', (req, res) => {
  res.sendFile('mentions-legales.html', { root: 'public' });
});
app.get('/politique-confidentialite.html', (req, res) => {
  res.sendFile('politique-confidentialite.html', { root: 'public' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur prêt sur http://localhost:${PORT}`);
});
