import express, { Request, Response, NextFunction }from 'express'
import 'dotenv/config'
import rotasNaoAutenticadas from './rotas/rotas-nao-autenticadas.js'
import rotasAutenticadas from './rotas/rotas-autenticadas.js'
import Auth from './middlewares/auth.js'

const app = express()
//Esse middleware faz com que o 
// express faça o parse do body da requisição para json 



app.use(express.json())
//criar um middleware que bloqueia tudo



app.use(Auth, rotasAutenticadas)
app.use(rotasNaoAutenticadas)

// Criando o servidor na porta 8000 com o express
app.listen(8000, () => {
    console.log('Server is running on port 8000')
})