import fs from 'fs';
import path from 'path';

// load whole executables from fs
export const EXAMPLES: Example[] = [];
for (const file_name of fs.readdirSync(__dirname)) {
    if (file_name.endsWith('.ts') || file_name.endsWith('.js')) {
        continue;
    }

    EXAMPLES.push({
        name: file_name,
        bytes: fs.readFileSync(path.join(__dirname, file_name)),
        raw: false
    });
}

// add raw data examples
EXAMPLES.push({
    name: 'strcpy_x86',
    bytes: Buffer.from([0x55, 0x31, 0xD2, 0x89, 0xE5, 0x8B, 0x45, 0x08, 0x56, 0x8B, 0x75, 0x0C, 0x53, 0x8D, 0x58, 0xFF, 0x0F, 0xB6, 0x0C, 0x16, 0x88, 0x4C, 0x13, 0x01, 0x83, 0xC2, 0x01, 0x84, 0xC9, 0x75, 0xF1, 0x5B, 0x5E, 0x5D, 0xC3]),
    raw: true,
    arch: 'x86',
    mode: 'x64',
});

EXAMPLES.push({
    name: 'strcpy_arm',
    bytes: Buffer.from([0x01, 0x20, 0x40, 0xE2, 0x02, 0x20, 0x61, 0xE0, 0x01, 0x30, 0xD1, 0xE4, 0x00, 0x00, 0x53, 0xE3, 0x02, 0x30, 0xC1, 0xE7, 0xFB, 0xFF, 0xFF, 0x1A, 0x1E, 0xFF, 0x2F, 0xE1]),
    raw: true,
    arch: 'ARM',
    mode: 'LE',
});

export const EXAMPLE_NAMES = EXAMPLES.map(e => e.name);

interface Example {
    name: string;
    bytes: Buffer;

    raw: boolean;
    // only set if raw is true
    arch?: string;
    mode?: string;
}