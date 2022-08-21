import { Router } from 'express';
import { UPLOAD_DIR } from './config';
import { add_project, updateFunction, get_projects_from_email } from './database';
import { promises as fs } from 'fs';
import { generate_id } from './util';
import load from './routes/load';
import path from 'path';
import upload from './routes/upload';
import { EXAMPLES, EXAMPLE_NAMES } from './examples/examples';
import disassemble, { disassemble_bytes, disassemble_retdec, disassemble_retdec_func } from './routes/disassemble';
import { createDocument } from './database';
import { registerUser, loginUser, validateToken} from './user';
// import { createDocument2, registerNewUser } from './user';
var timeout = require('connect-timeout')

const router = Router();

router.get('/:short_name', async (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/index.html'));
});



router.get('/api/masters/:short_name/can_edit', (req, res) => {
    // since we don't support auth, just return whether or not it is an example
    const { short_name } = req.params;
    res.send(EXAMPLE_NAMES.indexOf(short_name) === -1);
});

router.get('/api/masters/:short_name/clone', async (req, res) => {
    const short_name = req.params.short_name as string;
    const new_short_name = generate_id();
    try {
        const example = EXAMPLES.find(e => e.name === short_name);
        if (example) {
            const file_path = `${UPLOAD_DIR}${new_short_name}`;
            await fs.writeFile(file_path, example.bytes);

            add_project(new_short_name, {
                project_name: new_short_name,
                file_path,

                raw: example.raw,
                arch: example.arch,
                mode: example.mode
            });
            res.status(200).send({ short_name: new_short_name, binary_bytes: [...example.bytes] });
        } else {
            res.status(400).send(`Unable to copy clone ${short_name} (does that example exist?)`);
        }
    }
    catch (ex) {
        console.error(`An error occured while trying to clone ${short_name}: ${ex}`);
        res.status(400).send(`Unable to copy clone ${short_name} (does that example exist?)`);
    }
});

router.post('/api/disassembleretdecranges' , disassemble_retdec_func)
// router.post('/api/register', registerNewUser)
// router.post('/api/register2', createDocument2)
router.post('/api/validateToken', validateToken)
router.post('/api/login', loginUser)
router.post('/api/register', registerUser)
router.post('/api/disassembleretdec' , disassemble_retdec);
router.post('/api/upload', upload);
router.get('/api/load', load);
router.post('/api/disassemble_bytes', disassemble_bytes);
router.post('/api/:short_name/disassemble', disassemble);
router.post('/api/createdocument', createDocument);
router.patch('/api/functions/0/', updateFunction)
router.post('/api/getprojects', get_projects_from_email)
// router.post('/odaweb/api/displayunits/1/makeFunction/')
export default router;