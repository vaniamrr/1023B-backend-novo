import express, { Request, Response, NextFunction } from 'express'
import 'dotenv/config'
import rotasNaoAutenticadas from './rotas/rotas-nao-autenticadas.js'
import rotasAutenticadas from './rotas/rotas-autenticadas.js'
import Auth from './middlewares/auth.js'
const app = express()

app.use(express.json())


// Usando as rotas definidas em rotas.ts
app.use(Auth,rotasAutenticadas)
app.use(rotasNaoAutenticadas)

// Criando o servidor na porta 8000 com o express
app.listen(8000, () => {
    console.log('Server is running on port 8000')
})