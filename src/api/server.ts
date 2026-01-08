/**
 * Servidor API - Tocantins Integrado
 * MVP v1.0
 */

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

import { chatRouter } from './routes/chat';
import { municipalityRouter } from './routes/municipalities';
import { indicatorRouter } from './routes/indicators';
import { whatsappRouter } from './routes/whatsapp';
import { exportRouter } from './routes/export';
import { logger } from './utils/logger';

// Carregar variáveis de ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares de segurança
app.use(helmet());
app.use(cors({
  origin: true,
  credentials: true
}));

// Parser de JSON
app.use(express.json({ limit: '10mb' }));

// Request ID middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  req.id = uuidv4();
  res.setHeader('X-Request-ID', req.id);
  next();
});

// Logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info({
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration_ms: duration,
      request_id: req.id
    });
  });

  next();
});

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API Routes
app.use('/api/chat', chatRouter);
app.use('/api/municipalities', municipalityRouter);
app.use('/api/indicators', indicatorRouter);
app.use('/api/whatsapp', whatsappRouter);
app.use('/api/export', exportRouter);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Rota ${req.method} ${req.url} não encontrada`
  });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error({
    error: err.message,
    stack: err.stack,
    request_id: req.id
  });

  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Ocorreu um erro interno',
    request_id: req.id
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  logger.info(`🚀 Servidor Tocantins Integrado rodando na porta ${PORT}`);
  logger.info(`📍 Health check: http://localhost:${PORT}/health`);
  logger.info(`🔗 API: http://localhost:${PORT}/api`);
});

// Extensão do Request do Express
declare global {
  namespace Express {
    interface Request {
      id?: string;
    }
  }
}

export default app;
