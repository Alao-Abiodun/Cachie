import 'dotenv/config'; // load env variables
import app from './app';
import logger from './services/logger.service';

try {

    const PORT = Number(process.env.PORT) || 8715;
    const BASE_URL = `http://localhost:${PORT}`;
    const SWAGGER_DOCS_URL = `${BASE_URL}/cachie/v1/docs`

    app.listen(PORT, () => {
        console.log(
            `🚀  Cachie is ready at: http://localhost:${PORT}`
        );
        console.log(`📄 API Documentation available at: ${SWAGGER_DOCS_URL}`);
        logger.info(
            `🚀  Patient service is ready at: http://localhost:${PORT}`
        );
        logger.info(`📄 API Documentation available at: ${SWAGGER_DOCS_URL}`);
    });

} catch (err) {
    process.exit();
}

process.on('SIGINT', async () => {
    process.exit(0);
});

process.on('unhandledRejection', async (error) => {
    logger.fatal(error);
    process.exit(1); //server needs to crash and a process manager will restart it
});

process.on('uncaughtException', async (error) => {
    logger.fatal(error);
    process.exit(1); //server needs to crash and a process manager will restart it
});