import express, { Application, Request, Response } from "express";
import DbConnection from '../db/connection/dbConnection'
const app: Application = express();
const port = 3000;
const database: DbConnection = new DbConnection();

// Body parsing Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(async (req, res, next) => {
    try {
        await database.connection;
        next();
    } catch (e) {
        res.status(500);
        res.json(e);
    }
});

app.get(
    "/api/base",
    async (req: Request, res: Response): Promise<Response> => {
        const base = await database.getBase();
        console.log(base)
        return res.status(200).send(
            res.json(base)
        );
    }
);


app.get(
    "/api/fenbase",
    async (req: Request, res: Response): Promise<Response> => {
        const base = await database.getFenBase();
        return res.status(200).send(
            res.json(base)
        );
    }
);


app.get(
    "/api/fendata",
    async (req: Request, res: Response): Promise<Response> => {
        const base = await database.getFen(req.query.fen);
        return res.status(200).send(
            res.json(base)
        );
    }
);

try {
    app.listen(port, (): void => {
        console.log(`Connected successfully on port ${port}`);
    });
} catch (error: any) {
    console.error(`Error occured: ${error.message}`);
}
