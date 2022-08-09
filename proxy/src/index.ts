import { UPLOAD_DIR } from './config';
import cors from 'cors';
import express from 'express';
import fileUpload from 'express-fileupload';
import path from 'path';
import router from './routes';
import mongoose from 'mongoose';
const server = express();

server.use((req, res, next) => {
    console.log(`[${(new Date()).toISOString()}] ${req.method} ${req.url} (${res.statusCode})`);
    next();
});
mongoose.connect('mongodb://localhost:27017/test');
server.use(express.json({limit: '5mb'}));
server.use(fileUpload({
    safeFileNames: true,
    useTempFiles: true,
    tempFileDir: UPLOAD_DIR
}));
server.use(express.static(path.join(__dirname, 'frontend')));
server.use(cors());

server.use('/odaweb/', router);

server.listen(8001, () => {
    console.log('Server is ready to accept requests!');
}); 