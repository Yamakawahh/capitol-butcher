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

// À l’intérieur de votre route POST :
app.post('/api/generate-poem', async (req, res) => {
  try {
    const safeName    = escape(String(req.body.name || '').trim().slice(0, 40));
    const safeQuality = escape(String(req.body.quality || '').trim().slice(0, 40));

    if (!safeName || !safeQuality) {
      return res.status(400).json({ error: 'Champs manquants.' });
    }

const prompt = `
Crée un poème simple qui s'adresse à ${safeName},  
écris un poème simple et chaleureux sur sa plus grande qualité qualité : "${safeQuality}".  
Définis-la brièvement et compare-la à une image concrète.  
Trois strophes de quatre vers chacune, rimes plates ou riches, vocabulaire simple.  
Explique en quoi La Boucherie Capitol et sa cuisine permettent de transcender cette qualité.  
Termine par un appel à l'action qui invite à laisser un avis Google à la Boucherie Capitol.
L'appel à l'action concerne ${safeName}, donc répète son nom et tes vers s'adressent à lui. 
Reste simple.
`.trim();


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
