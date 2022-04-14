// @ts-ignore
import { Chess } from 'chess.js/chess';
import fs from 'fs';

const database: any = JSON.parse(fs.readFileSync('./src/db/utils/base.json', 'utf8'));
const INITIAL_STATE: string = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
export function parseBaseJson(node: any, fenb: any, parentFen: any, rank: any) {
    const fenbase: any = fenb ?? [];
    const chess: any = new Chess(parentFen ?? INITIAL_STATE);
    if (node.m) {
        chess.move(node.m)
    }
    const fen: any = chess.fen();
    fenbase.push({
        m: node.m,
        n: node.n,
        e: node.e,
        c: node.c,
        fen: parentFen,
        currentFen: fen,
        r: (rank ?? 0) * 100
    });
    node.s.forEach((s: any, i: any) => {
        parseBaseJson(s, fenbase, fen, i + 1)
    })
    return fenbase;
}

// @ts-ignore
const fenbase: any = parseBaseJson(database);

fs.writeFileSync('list.json', JSON.stringify(fenbase))
