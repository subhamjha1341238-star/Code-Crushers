import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { analyzeLiveTelemetry, generateRoadmapForSkill } from './src/server/geminiService.ts';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// API Routes
app.post('/api/adapt', async (req, res) => {
  try {
    const telemetry = req.body;
    const response = await analyzeLiveTelemetry(telemetry);
    res.json(response);
  } catch (error: any) {
    console.error('API /api/adapt error:', error);
    res.status(500).json({ error: error.message || 'Failed to analyze live telemetry' });
  }
});

app.post('/api/generate-roadmap', async (req, res) => {
  try {
    const { skillGoal } = req.body;
    const response = await generateRoadmapForSkill(skillGoal || 'Full-Stack Web Development');
    res.json(response);
  } catch (error: any) {
    console.error('API /api/generate-roadmap error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate roadmap' });
  }
});

app.post('/api/grounded-search', async (req, res) => {
  try {
    const { topic } = req.body;
    const { fetchGroundedKnowledge } = await import('./src/server/geminiService.ts');
    const response = await fetchGroundedKnowledge(topic || 'Programming');
    res.json(response);
  } catch (error: any) {
    console.error('API /api/grounded-search error:', error);
    res.status(500).json({ error: error.message || 'Failed to perform grounded search' });
  }
});

app.post('/api/orchestrate-insight', async (req, res) => {
  try {
    const { orchestrateLearnerInsight } = await import('./src/server/geminiService.ts');
    const response = await orchestrateLearnerInsight(req.body);
    res.json(response);
  } catch (error: any) {
    console.error('API /api/orchestrate-insight error:', error);
    res.status(500).json({ error: error.message || 'Failed to orchestrate insight' });
  }
});

app.post('/api/evaluate-momentum', async (req, res) => {
  try {
    const { evaluateStudentMomentumAndStreak } = await import('./src/server/geminiService.ts');
    const response = await evaluateStudentMomentumAndStreak(req.body);
    res.json(response);
  } catch (error: any) {
    console.error('API /api/evaluate-momentum error:', error);
    res.status(500).json({ error: error.message || 'Failed to evaluate momentum' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve static frontend assets in production
const distPath = path.resolve(process.cwd(), 'dist');
app.use(express.static(distPath));
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Adaptive Learning AI Server listening on port ${PORT}`);
});
