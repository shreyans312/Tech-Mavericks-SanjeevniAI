import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Resolve __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Serve static files from public (so /src/emergency-ai.js also works)
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());
app.use(express.json());

// Start Ollama Mistral (if not already running)
const ollamaPath = 'C:\\Users\\shrey\\AppData\\Local\\Programs\\Ollama\\ollama.exe';
const ollamaProcess = spawn(ollamaPath, ['run', 'mistral'], {
  detached: true,
  stdio: 'ignore'
});
ollamaProcess.unref();
console.log('🚀 Starting Ollama with Mistral...');

// Serve frontend index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Proxy to Ollama model
app.post('/api/openai', async (req, res) => {
  const { prompt, maxTokens } = req.body;

  try {
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'mistral',
        prompt: prompt,
        stream: false
      })
    });

    const data = await response.json();

    if (!data || !data.response) {
      throw new Error('Empty response from Ollama');
    }

    res.json({
      choices: [{ message: { content: data.response.trim() } }]
    });
  } catch (err) {
    console.error('❌ Ollama API error:', err.message);
    res.status(500).json({ error: 'Error contacting local AI model' });
  }
});


app.listen(PORT, () => {
  console.log(`✅ Emergency Response AI server running at http://localhost:${PORT}`);
});
