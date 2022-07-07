import { promises as fs } from 'fs';
import { get_project } from '../database';
import { Request, Response } from 'express';
import axios, { AxiosError } from 'axios';
import FormData from 'form-data';

const cs = require('@alexaltea/capstone-js/dist/capstone.min.js');
export default async function disassemble(req: Request, res: Response) {
    
    const short_name = req.params.short_name as string;
    if (!short_name) {
        res.status(400).send('Short name not provided');
        return;
    }

    const project = get_project(short_name);
    if (!project) {
        res.status(400).send(`${short_name} not found`);
        return;
    }

    try {
        if(project.raw){
            const bytes = await fs.readFile(project.file_path);

            //parse the data from bytes into a better form
            var byte_string:string = ""
            byte_string = [...bytes].map(x => x.toString(16)).join(' ')
            var new_data:any[] = []
            byte_string.split(" ").forEach((element)=>{
                new_data.push("0x"+parseInt(element, 16).toString(16))
            })
    
            
            var d = new cs.Capstone(cs.ARCH_X86, cs.MODE_32);
            var instructions = d.disasm(new_data, 0);// disassembled instructions
    
            type Data = {
                [key: string]: any;//store values to JSONify
            };
    
            var result:Data = {}; //object of both data(array of instructions) and dictionary of jumps
            var data:any[] = [];
            var transfer:{[key: string]: any[]} = {};
    
            instructions.forEach(function (element:any) {
                //push instruction
                data.push([parseInt(element.address), element.size, element.mnemonic + " " + element.op_str])
                if(element.mnemonic[0] == "j"){
                    //if it is a jump
                    const key =  element.address.toString(10);
                    transfer[key] = [parseInt(element.op_str,16), element.address+element.size]
                }
            });
            result["data"] = data;
            result["transfer"] = transfer;
            res.status(200).type('json').send(result);
        }
        //current set of data used
        // const form = new FormData();
        // const bytes = await fs.readFile(project.file_path);
        //
        // if (project.raw) {
        //     const byte_string = [...bytes].map(x => x.toString(16)).join(' ');
        //
        //     form.append('bytes', byte_string);
        //     form.append('arch', project.arch);
        //     form.append('mode', project.mode);
        // } else {
        //     form.append('file', bytes, 'filename');
        // }
        //
        // const resp = await axios.post(DEEPDI_URL,
        //     form.getBuffer(),
        //     {
        //         headers: form.getHeaders()
        //     }
        // );
        // res.status(200).json(resp.data);


        


    }
    catch (ex) {
        console.log(`An error occured while trying to disassemble.\n${ex}`);
        console.log((ex as AxiosError).response);
        res.status(400).send('Unable to disassemble');
    }
}

export async function disassemble_bytes(req: Request, res: Response) {
   
    try {

        // const { bytes, arch, mode } = req.body;
        // if (!bytes || !arch || !mode) {
        //     res.status(400).send('Bytes|Arch|Mode not provided.');
        //     return;
        // }
        
        // const form = new FormData();
        // form.append('bytes', bytes);
        // form.append('arch', arch);
        // form.append('mode', mode);
        
        // const resp = await axios.post(DEEPDI_URL,
        //     form.getBuffer(),
        //     {
        //         headers: form.getHeaders()
        //     }
        // );
        // res.status(200).json(resp.data);
        const raw = await fs.readFile(__dirname + '/../sample_output/bytes.json');
        res.status(200).type('json').send(raw);
    }
    catch (ex) {
        console.log(`An error occured while trying to disassemble.\n${ex}`);
        console.log((ex as AxiosError).response);
        res.status(400).send('Unable to disassemble');
    }
}