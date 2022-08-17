import { promises as fs } from 'fs';
import { get_project } from '../database';
import { Request, Response } from 'express';
import { AxiosError } from 'axios';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';
const readline = require('readline');
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
            let byte_string = '';
            byte_string = [...bytes].map(x => x.toString(16)).join(' ');
            const new_data:any[] = [];
            byte_string.split(' ').forEach((element)=>{
                new_data.push('0x'+parseInt(element, 16).toString(16));
            });
    
            
            const d = new cs.Capstone(cs.ARCH_X86, cs.MODE_32);
            const instructions = d.disasm(new_data, 0);// disassembled instructions
    
            type Data = {
                [key: string]: any;//store values to JSONify
            };
    
            const result:Data = {}; //object of both data(array of instructions) and dictionary of jumps
            const data:any[] = [];
            const transfer: any[] = []
    
            instructions.forEach(function (element:any) {
                //push instruction
                data.push([parseInt(element.address), element.size, element.mnemonic + ' ' + element.op_str])
                if(element.mnemonic[0] == 'j'){
                    //if it is a jump
                    transfer.push({start:element.address.toString(10), destination: parseInt(element.op_str,16), return: element.address+element.size})
                }
            });
            result['data'] = data;
            result['transfer'] = transfer;
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
export async function disassemble_retdec(req:Request, res:Response){
    const short_name = req.body.params.short_name as string;
    if (!short_name) {
        res.status(400).send('Short name not provided');
        return;
    }
    const project = get_project(short_name);
    if (!project) {
        // console.log(short_name);
        // console.log(project);
        res.status(400).send(`${short_name} not found`);
        return;
    }
    try {
        spawnSync('python3', ['src/routes/retdec/bin/retdec-decompiler.py', project.file_path, '--stop-after', 'bin2llvmir']);
        // const rawCCode = await fs.readFile(`${project.file_path}.c`, "utf8");
        const parsedBinary = await parseBinary(`${project.file_path}.dsm`);
        const raw = {'binary':parsedBinary.bytes, 'base_add': parsedBinary.base_add};
        res.status(200).send(raw);
    }
    catch (ex) {

        console.log('disasem retdec error route')
        res.status(400).send(`${short_name} not found`);
    }
}

export async function disassemble_retdec_func(req:Request, res:Response){
    const short_name = req.body.params.short_name as string;
    if (!short_name) {
        res.status(400).send('Short name not provided');
        return;
    }
    const project = get_project(short_name);
    if (!project) {
        // console.log(short_name);
        // console.log(project);
        res.status(400).send(`${short_name} not found`);
        return;
    }
    try {
        const func_data =  req.body.params.function_data
        if(func_data.func === undefined){
            
            res.status(200).send(undefined);
        } else{
            spawnSync('python3', ['src/routes/retdec/bin/retdec-decompiler.py', project.file_path, '--select-functions', func_data.func.name]);
            const rawCCode = await fs.readFile(`${project.file_path}.c`, "utf8");
            res.status(200).send(rawCCode);
        }

    }
    catch (ex) {

        console.log('disasem retdec func error route')
        res.status(400).send(`${short_name} not found`);
    }
}

export async function disassemble_bytes(req: Request, res: Response) {
   
    try {
        const { bytes, arch, mode } = req.body;
        //parse the data from bytes into a better form
        let byte_string = '';
        byte_string = [...bytes].map(x => x.toString(16)).join(' ');
        const new_data:any[] = [];
        byte_string.split(' ').forEach((element)=>{
            new_data.push('0x'+parseInt(element, 16).toString(16));
        });

        
        const d = new cs.Capstone(cs.ARCH_X86, cs.MODE_32);
        const instructions = d.disasm(new_data, 0);// disassembled instructions

        type Data = {
            [key: string]: any;//store values to JSONify
        };

        const result:Data = {}; //object of both data(array of instructions) and dictionary of jumps
        const data:any[] = [];
        const transfer:any[] = [];

        instructions.forEach(function (element:any) {
            //push instruction
            data.push([parseInt(element.address), element.size, element.mnemonic + ' ' + element.op_str])
            if(element.mnemonic[0] == 'j'){
                //if it is a jump
                transfer.push({start:element.address.toString(10), destination: parseInt(element.op_str,16), return: element.address+element.size})
            }
        });
        result['data'] = data;
        result['transfer'] = transfer;
        res.status(200).type('json').send(result);
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
type string_keyed_dict = {
    [key: string]: any;//store values to JSONify
};
async function parseBinary(file_path:string){
    const fs = require('fs');
    const fileStream = fs.createReadStream(file_path);
    
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });
    const data_list = [];
    const transfer_list = [];
    const func_list:string_keyed_dict = {};
    let curr_add = 0;
    let starting_add;
    let curr_func_add;
    for await (const line of rl) {
        if(line.split('\t').length<2 && line.substring(0, 10) !== '; function'){
            if(line.indexOf('|')!== -1){
                
                const temp = line.split(':')[1]
                const temp2 = temp.split('|')[0]
                const byte_list = (temp2.split(' ')).filter((item:string)=>{return item !== ''})
                data_list.push([curr_add, byte_list.length, '#'+temp.split('|')[1]])
                func_list[curr_func_add].cmd_vmas.push(curr_add+Number(starting_add))
                curr_add += byte_list.length
                continue
            }
            continue
        }
        if(line.indexOf(';; Dat')!==-1) {
            break;
        }
        
        
        if(line[0] != ';' && line.length>2 && line.indexOf('|')==-1){   //skip comment lines
            const temp = line.split(':')
            const vma = temp[0]
            const rem = temp[1];

            const rhs = rem.split('\t')
            const bytes = rhs[0];
            const string_code = rhs[1]
            if(curr_add == 0){
                starting_add = vma;
            }
            
            const byte_list = (bytes.split(' ')).filter((item:string)=>{return item !== ''})
            data_list.push([curr_add, byte_list.length, string_code])
            func_list[curr_func_add].cmd_vmas.push(curr_add+Number(starting_add))
            if(string_code[0] == 'j'){
                const cmd_list = string_code.split(' ')
                if(cmd_list[1].slice(0,2) == '0x'){
                    transfer_list.push({start:(curr_add).toString(10), destination: Number(cmd_list[1]) - Number(starting_add), return: curr_add + byte_list.length})
                    // transfer_list[(curr_add).toString(10)] = [Number(cmd_list[1]) - Number(starting_add), curr_add + byte_list.length]
                    
                }
            }
            
            curr_add += byte_list.length;
            
        }else if(line.substring(0, 10) == '; function'){
            // line is a comment that looks like ; function: function_401000 at 0x401000 -- 0x401173
            // parse through the line and get the function name, and function boundaries
            const funcName = line.split('function: ')[1].split(' at ')[0];
            const funcStart = line.split('at ')[1].split(' -- ')[0];
            const funcEnd = line.split(' -- ')[1];
            func_list[funcStart] = {'name':funcName, 'vma':Number(funcStart), 'vma_start':funcStart, 'vma_end': funcEnd, 'cmd_vmas': []}
            curr_func_add = funcStart;
            // add to dict with funcName as key, and funcStart and funcEnd as values in an array
        }
    }
    fileStream.close()
    //parse the data from bytes into a better form
    const func_arr = []
    for (const [key, value] of Object.entries(func_list)) {
        func_arr.push(value)
      }
    const result = {'data':data_list, 'transfer':transfer_list, 'functions':func_arr}
    return {'bytes': result, 'base_add':starting_add};

}
