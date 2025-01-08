import 'dotenv/config'; // load env variables
import app from './app';

try {

    const PORT = Number(process.env.PORT) || 8715;

    app.listen(PORT, () => {
        console.log(
            `🚀  Cachie is ready at: http://localhost:${PORT}`
        );
    });

} catch (err) {
    process.exit();
}

process.on('SIGINT', async () => {
    process.exit(0);
});

process.on('unhandledRejection', async (error) => {
    process.exit(1); //server needs to crash and a process manager will restart it
});

process.on('uncaughtException', async (error) => {
    process.exit(1); //server needs to crash and a process manager will restart it
});