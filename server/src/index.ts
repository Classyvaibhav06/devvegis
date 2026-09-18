// DevVegis — Local Server Runner
import app from './app';
import { config } from './config/env';
import { logger } from './utils/logger';

const PORT = config.PORT || 5000;

app.listen(PORT, () => {
  logger.info(`🚀 DevVegis API running on port ${PORT}`);
  logger.info(`📚 Swagger docs: http://localhost:${PORT}/api-docs`);
  logger.info(`🌱 Environment: ${config.NODE_ENV}`);
});

export default app;
