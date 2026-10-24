import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import dotenv from 'dotenv';
import { analyzeLiveTelemetry, generateRoadmapForSkill } from './src/server/geminiService.ts';

dotenv.config();

import express from 'express';

const apiApp = express();
apiApp.use(express.json());

apiApp.post('/api/adapt', async (req, res) => {
  try {
    const result = await analyzeLiveTelemetry(req.body);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Telemetry parsing error' });
  }
});

apiApp.post('/api/generate-roadmap', async (req, res) => {
  try {
    const result = await generateRoadmapForSkill(req.body.skillGoal || 'Programming');
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Roadmap generation error' });
  }
});

apiApp.post('/api/grounded-search', async (req, res) => {
  try {
    const { fetchGroundedKnowledge } = await import('./src/server/geminiService.ts');
    const result = await fetchGroundedKnowledge(req.body.topic || 'Web Development');
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Grounded search error' });
  }
});

apiApp.post('/api/orchestrate-insight', async (req, res) => {
  try {
    const { orchestrateLearnerInsight } = await import('./src/server/geminiService.ts');
    const result = await orchestrateLearnerInsight(req.body);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Orchestration error' });
  }
});

apiApp.post('/api/evaluate-momentum', async (req, res) => {
  try {
    const { evaluateStudentMomentumAndStreak } = await import('./src/server/geminiService.ts');
    const result = await evaluateStudentMomentumAndStreak(req.body);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Momentum evaluation error' });
  }
});

apiApp.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

function adaptiveApiPlugin(): Plugin {
  return {
    name: 'adaptive-api-plugin',
    configureServer(server) {
      server.middlewares.use(apiApp);
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), adaptiveApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

