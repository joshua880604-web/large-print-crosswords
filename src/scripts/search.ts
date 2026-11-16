// Keep title searches consistent in the catalog and print-pack chooser.
export const normaliseSearch=(value:string)=>value.toLowerCase().normalize('NFKD')
 .replace(/[\u0300-\u036f]/g,'').replace(/['’]/g,'').replace(/[\s.-]+/g,' ').trim();
