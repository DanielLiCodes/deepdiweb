import { UPLOAD_DIR } from './config';
import cors from 'cors';
import express from 'express';
import fileUpload from 'express-fileupload';
import path from 'path';
import router from './routes';
import mongoose from 'mongoose';
const server = express();
// import uri from './login'

server.use((req, res, next) => {
    console.log(`[${(new Date()).toISOString()}] ${req.method} ${req.url} (${res.statusCode})`);
    next();
});

// (async()=>{
//     await mongoose.connect('mongodb+srv://John:hahaha123@userdb.m4f2whj.mongodb.net/userdb?retryWrites=true&w=majority');
// })().catch(err=>console.log(err));

(async()=>{
// <<<<<<< Updated upstream
//     await mongoose.connect(uri);
// =======
    await mongoose.connect('mongodb://localhost:27017/myapp');
})().catch(err=>console.log(err));

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