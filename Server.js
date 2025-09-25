import express, { application } from 'express';
import { generate } from './chatbot.js';
import cors from 'cors';
import dotenv from 'dotenv'
dotenv.config();
const app = express();

const PORT = 3001 || process.env.PORT;
app.use(cors(
    {
        origin: 'https://mesubrat.github.io',
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type']
    }
))
app.use(express.json());

app.get('/', (req, res) => {
    res.send("Hello world");
})

app.post('/chat', async (req, res) => {
    const { message, threadId } = req.body;
    if (!threadId || !message) {
        res.status(400).send({ message: 'All fields are required!' })
        return;
    }
    const result = await generate(message, threadId);

    res.json({ message: result })
})

app.listen(PORT, () => {
    console.log(`Server is running on PORT : ${PORT}`);
})