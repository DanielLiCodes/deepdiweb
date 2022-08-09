import { MAX_PROJECTS_CACHED } from './config';
import mongoose from 'mongoose';
import { Request, Response } from 'express';
import { AxiosError } from 'axios';
import { abort } from 'process';
const { Schema } = mongoose;
export const Projects: Map<string, ProjectInfo> = new Map();

export function add_project(key: string, info: ProjectInfo) {
    Projects.set(key, info);

    // only keep a maximum of MAX_PROJECTS_CACHED
    const projects_to_remove = Projects.size - MAX_PROJECTS_CACHED;
    if (projects_to_remove > 0) {
        const projects_names_to_remove = Array.from(Projects.keys()).slice(0, projects_to_remove);
        for (const name of projects_names_to_remove) {
            Projects.delete(name);
        }
    }
}

export function get_project(key: string): ProjectInfo | undefined {
    // HERE some mongo code to pull project by shortname
    return Projects.get(key);
}

export function delete_project(key: string): boolean {
    return Projects.delete(key);
}

export function update_project(key: string, data: any) {
    return data.info = key
}



const dbProject = new Schema({
    odbFile_data: {
        project_name: String,
        binary: {
            size: Number,
            md5: String,
            sha1: String,
            desc: [String],
            name: String,
            malware: Boolean, // always false
            benign: Boolean, // always true
            text: String,
            options: {
                architecture: String,
                endian: String,
                selected_opts: [String],
            },
            base_address: Number,
        },
        live_mode: Boolean, // whether or not we are analyzing raw bytes
        isexe:Boolean,
        functions: [{
            retval: String,
            args: String,
            vma: Number,
            name: String
        }],
        labels: [], // parsed client side
        sections: [{ 
            name: String, 
            size: Number, 
            vma: Number, 
            flags:[{ 
                abbrev: String, 
                desc: String, 
                name: String 
            }]
        }],
        comments: [], // TODO
        symbols: [{
            name: String,
            vma: Number,
        
            /*
            Lowercase = local, uppercase = global
            a: Value is absolute
            b: Bss section
            d: Initialized data section
            t: Text section - i.e. a function
            v: weak object
            r: Read only section
            */
            type: String
        }],
        branches: [{ srcAddr: Number, targetAddr: Number }],
        default_permission_level: String,
    
        strings: [{ string: String, addr: Number }],
        // TODO: structTypes
        // TODO: structFieldTypes
    
        displayUnits: { size: Number },
        // TODO: user
        architectures: [String],
        endians: [String],
        // our implementation specific data
        // binary_bytes: number[];
        disassembly_data: {
            data: [[Schema.Types.Mixed]],
            transfer: [{
                start:String,
                destination:Number,
                return:Number
            }],
            base_add:Number,
            binaryBytes: [Number],
            functions: [{
                name:String,
                vma:Number,
                vma_start:Number,
                vma_end:Number,
                cmd_vmas: [Number]
            }]
            // strings: [{
            //     addr:Number, 
            //     string:String
            // }]
        }
    }, 
    short_name: String,

})
const odbFile = mongoose.model('odbfile', dbProject)

export async function createDocument (req: Request, res: Response) {
    const odbfile = req.body.params.odbfile
    try {
        await odbFile.create({odbFile_data: odbfile, short_name: req.body.params.short_name}, (err: any) => {
            console.log("err is "+err)
        })
        res.send(200)
    } 
    catch (e) {
        console.log("error is   " + e)
    }
    
}

export async function get_database_project (short_name: string) {
    return odbFile.findOne({short_name: short_name})

}

interface ProjectInfo {
    project_name: string;
    file_path: string; // the full path to the saved location
    raw: boolean; // whether or not we have raw bytes vs an actual file
    isexe?: boolean; //temp addition
    // only set if raw is true
    arch?: string;
    mode?: string;
    disassembly_data?: object;
}
interface BinaryInfo {
    size: number;
    md5: string;
    sha1: string;
    desc: string[];
    name: string;
    malware: boolean; // always false
    benign: boolean; // always true
    text: string;
    options: BinaryOptions;
    base_address: number;
}

interface BinaryOptions {
    architecture?: string;
    endian?: string;
    selected_opts: string[];
}

interface BinaryFunction {
    retval: string;
    args: string;
    vma: number;
    name: string;
}

interface BinarySection {
    name: string;
    size: number;
    vma: number;
    flags: SectionFlag[];
}

interface BinarySymbol {
    name: string;
    vma: number;

    /*
    Lowercase = local, uppercase = global
    a: Value is absolute
    b: Bss section
    d: Initialized data section
    t: Text section - i.e. a function
    v: weak object
    r: Read only section
    */
    type: string;
}

interface SectionFlag {
    abbrev: string,
    desc: string,
    name: string
}