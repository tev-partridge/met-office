import {env} from 'node:process'
import express, {type Request, type Response} from 'express'
import {getForecastForPostcode} from './weather.js'

const app = express();
const PORT = Number(env.PORT) || 3000;
const API_KEY: string = env.API_KEY ?? "";

app.get('/api/forecast', async (req: Request, res: Response) => {
    const postcode = req.query.postcode;
    if (typeof postcode !== 'string' || postcode.trim() === '') {
        res.status(400).json({error: 'Missing postcode'});
        return;
    }

    try {
        const entries = await getForecastForPostcode(postcode, API_KEY);
        res.json({postcode, entries});
    } catch (e) {
        console.error(e);
        res.status(502).json({error: e instanceof Error ? e.message : ""});
    }
});

const server = app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});