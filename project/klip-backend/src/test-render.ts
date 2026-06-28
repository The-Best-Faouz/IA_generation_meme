import express from 'express';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.get('/health', (_req, res) => res.json({ status: 'ok', port: PORT, env: process.env.PORT || 'not-set' }));

app.listen(PORT, () => {
  console.log(`TEST SERVER démarré sur le port ${PORT}`);
});
