export const catalogPageSize = 12;
export const textIndexPageSize = 100;

export interface CatalogPuzzle {
 id: string;
 title: string;
 theme: string;
 subtheme: string;
 series: string;
 description: string;
 rows: number;
 cols: number;
 revision: number;
}
