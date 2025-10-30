import { Router } from 'express';
import os from 'os';

const router = Router();

/**
 * @route GET /api/health
 * @desc Health check endpoint
 * @access Public
 */
router.get('/', (req, res) => {
  const healthData = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100,
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024 * 100) / 100,
      external: Math.round(process.memoryUsage().external / 1024 / 1024 * 100) / 100
    },
    cpu: {
      usage: process.cpuUsage(),
      loadAverage: process.platform !== 'win32' ? os.loadavg() : [0, 0, 0]
    }
  };

  res.json(healthData);
});

/**
 * @route GET /api/health/ready
 * @desc Readiness check (for Kubernetes/Docker)
 * @access Public
 */
router.get('/ready', async (req, res) => {
  try {
    // Check database connection
    // const dbHealthy = await checkDatabaseHealth();
    const dbHealthy = true; // Placeholder for now

    // Check external services
    const servicesHealthy = true; // Placeholder for AI service checks

    if (dbHealthy && servicesHealthy) {
      res.status(200).json({
        status: 'ready',
        timestamp: new Date().toISOString(),
        checks: {
          database: 'healthy',
          services: 'healthy'
        }
      });
    } else {
      res.status(503).json({
        status: 'not-ready',
        timestamp: new Date().toISOString(),
        checks: {
          database: dbHealthy ? 'healthy' : 'unhealthy',
          services: servicesHealthy ? 'healthy' : 'unhealthy'
        }
      });
    }
  } catch (error) {
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route GET /api/health/live
 * @desc Liveness check (for Kubernetes/Docker)
 * @access Public
 */
router.get('/live', (req, res) => {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    pid: process.pid,
    uptime: process.uptime()
  });
});

export default router;