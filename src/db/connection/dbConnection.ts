import { MongoClient } from 'mongodb';
import fs from 'fs';
import {parse} from "url";
import {parseBaseJson} from "../utils/dbUtils";
import {global} from "../../config/global";
export default class DbConnection {
    uri = global.db.url;
    dbName = global.db.dbName;
    collectionName = global.db.collectionName;
    // @ts-ignore
    client = new MongoClient(this.uri);
    db = this.client.db(this.dbName);
    collection = this.db.collection(this.collectionName);
    connection = this.client.connect();

    async getFen(fen: any) {
        const fenData = await this.collection
            .find({fen})
            .sort({r: 1})
            .limit(1)
            .toArray()
        const fenRecord = fenData.pop();
        if (!fenRecord) return {}
        return {
            fen: fenRecord.fen,
            bestMove: fenRecord.m,
            score: fenRecord.e.v,
            depth: fenRecord.e.d,
            sp: fenRecord.e.v * 100
        }
    }

    async getFenBase() {
        const data = await this.collection.aggregate([
            {
                $sort: { r: 1 }
            },
            {
                $group: {
                    _id: '$fen',
                    bestMove: { $first: { bestMove: '$m', score: '$e.v', depth: '$e.d' } }
                }
            }])
            .toArray()

        return data.map(fen => ([fen._id, { ...fen.bestMove }]))
    }

    async getBase() {
        const data = await this.collection
            .find({})
            .sort({r: 1})
            .limit(0)
            .toArray()
        for (const fenRecord of data) {
            const parentRecord = data.find((fen: any) => fen.currentFen === fenRecord.fen);
            console.log(parentRecord)
            if (parentRecord) {
                if (!parentRecord.s) {
                    parentRecord.s = []
                }
                parentRecord.s.push(fenRecord)
            }
        }
        const root = data.find((fen: any) => !fen.m);
        return this.formatBase(root)
    }

    formatBase(node: any) {
        delete node._id;
        delete node.fen;
        delete node.currentFen;
        delete node.r;
        if (node.s) {
            for (const child of node.s) {
                this.formatBase(child);
            }
        }
        return node
    }

    async uploadReplaceBaseDocumentToCollection() {
        if((typeof (await this.collection.find({}).toArray())[0]) !== 'undefined') {
            await this.collection.replaceOne({"m":"","n":0},
                JSON.parse(fs.readFileSync('./src/db/utils/base.json', 'utf8')))
        } else {
            await this.collection.insertOne(JSON.parse(fs.readFileSync('./src/db/utils/base.json', 'utf8'))
            )
        }
    }
}
