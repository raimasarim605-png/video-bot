const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const RUNWAY_API_KEY = process.env.RUNWAYML_API_SECRET;
const RUNWAY_BASE_URL = 'https://api.dev.runwayml.com/v1';

app.post('/generate', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: 'prompt darkar hai' });

    const response = await fetch(`${RUNWAY_BASE_URL}/text_to_video`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RUNWAY_API_KEY}`,
        'Content-Type': 'application/json',
        'X-Runway-Version': '2024-11-06'
      },
      body: JSON.stringify({
        promptText: prompt,
        model: 'gen4_turbo',
        ratio: '1280:720',
        duration: 5
      })
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ error: data.error || 'Runway ne darkhwast mustarad ki' });
    }

    res.json({ taskId: data.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/status/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;
    const response = await fetch(`${RUNWAY_BASE_URL}/tasks/${taskId}`, {
      headers: {
        'Authorization': `Bearer ${RUNWAY_API_KEY}`,
        'X-Runway-Version': '2024-11-06'
      }
    });
    const data = await response.json();

    if (data.status === 'SUCCEEDED') {
      return res.json({ status: 'SUCCEEDED', videoUrl: data.output[0] });
    }
    if (data.status === 'FAILED') {
      return res.json({ status: 'FAILED', error: data.failure || 'namaloom wajah' });
    }
    res.json({ status: data.status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server chal raha hai: http://localhost:${PORT}`));
