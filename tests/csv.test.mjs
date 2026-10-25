import { test } from 'node:test';
import assert from 'node:assert/strict';
import { downloadCsv } from '../src/lib/csv.ts';
test('CSV download preserves UTF-8 BOM, multiline content and quoted values',async()=>{
 const original={document:globalThis.document,create:URL.createObjectURL,revoke:URL.revokeObjectURL,setTimeout:globalThis.setTimeout};
 let blob,clicked=false,removed=false,revoked;const link={click(){clicked=true;},remove(){removed=true;}};
 try{
 globalThis.document={createElement:()=>link,body:{appendChild(a){assert.equal(a,link);}}};
 URL.createObjectURL=value=>{blob=value;return 'blob:test';};URL.revokeObjectURL=value=>{revoked=value;};globalThis.setTimeout=fn=>{fn();return 0;};
 const csv='Name,Phone\r\n"Élodie, Guest","\'+12345"\r\n"Line\nbreak",""';downloadCsv(csv,'customers');
 assert.equal(clicked,true);assert.equal(removed,true);assert.equal(link.href,'blob:test');assert.match(link.download,/^zenith-customers-\d{4}-\d{2}-\d{2}\.csv$/);assert.equal(blob.type,'text/csv;charset=utf-8;');
 const bytes=new Uint8Array(await blob.arrayBuffer());assert.deepEqual([...bytes.slice(0,3)],[239,187,191]);assert.equal(new TextDecoder().decode(bytes),csv);assert.equal(revoked,'blob:test');
 }finally{globalThis.document=original.document;URL.createObjectURL=original.create;URL.revokeObjectURL=original.revoke;globalThis.setTimeout=original.setTimeout;}
});
