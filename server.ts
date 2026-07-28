import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', app: 'LifeKit', time: new Date().toISOString() });
  });

  // AI Coach API endpoint
  app.post('/api/coach', async (req, res) => {
    try {
      const { prompt, missionTitle, tasks } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
        return res.json({
          response: `[LifeKit AI Coach]: Great query regarding "${missionTitle || 'your mission'}"! Here are 3 tactical execution steps:\n\n1. 🎯 **Focus Priority**: Complete the highest friction task first in your 90-minute morning window.\n2. ⏱️ **Time Boxing**: Allocate 2 focus blocks today with zero phone notifications.\n3. 📊 **Measure Output**: Log completed task updates right inside your LifeKit dashboard to compound momentum!`,
          source: 'smart_engine'
        });
      }

      const ai = new GoogleGenAI({ apiKey });
      const systemInstruction = `You are LifeKit AI Coach, an elite goal-execution and productivity coach. 
You assist high-performing users in achieving ambitious life goals (career milestones, financial growth, startup building, health).
User's Current Mission: "${missionTitle || 'General Goal'}"
Current Tasks & Progress Context: ${JSON.stringify(tasks || [])}
Provide direct, highly actionable, bulleted advice with maximum punchiness and specific execution tactics. Keep total length around 120-180 words. Use emojis appropriately.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt || 'How can I execute my current mission faster and overcome bottlenecks today?',
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });

      res.json({
        response: response.text || 'Stay focused on your primary execution objective today!',
        source: 'gemini'
      });
    } catch (error: any) {
      console.error('Error in /api/coach:', error);
      res.json({
        response: `[LifeKit AI Coach]: Execution strategy for "${req.body.missionTitle || 'your goal'}": Break down your next task into micro-actions under 10 minutes. Consistency builds momentum!`,
        source: 'smart_fallback'
      });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LifeKit Server running on http://localhost:${PORT}`);
  });
}

startServer();
