const axios = require('axios')
const express = require('express')
const bodyParser = require('body-parser')
const { v4: uuidv4 } = require('uuid')

const observacoesPorLembreteId = {}

const funcoes = {
    observacaoClassificada
}

function observacaoClassificada(observacao) {
    const observacoes = observacoesPorLembreteId[observacao.lembreteId]
    const obsParaAtualizar = observacao.find((item) => item.id === observacao.id)
    obsParaAtualizar.status = observacao.status
    axios.post('http://localhost:10000/eventos', {
        tipo: 'ObservacaoAtualizada',
        dados: {
            id: observacao.id,
            texto: observacao.texto,
            lembreteId: observacao.lembreteId,
            status: observacao.status
        }
    })
}

const app = express()
app.use(bodyParser.json())

app.post('/lembretes/:id/observacoes', async (req, res) => {
    const idObs = uuidv4()
    const { texto } = req.body

    const observacoesDoLembrete = observacoesPorLembreteId[req.params.id] || []
    observacoesDoLembrete.push({ id: idObs, texto, status: 'aguardando' })
    observacoesPorLembreteId[req.params.id] = observacoesDoLembrete
    await axios.post('http://localhost:10000/eventos', {
        tipo: "ObservacaoCriada",
        dados: {
            id: idObs,
            texto,
            lembreteId: req.params.id,
            status: 'aguardando'
        }
    })
    res.status(201).send(observacoesDoLembrete)
})

app.get('/lembretes/:id/observacoes', (req, res) => {
    res.send(observacoesPorLembreteId[req.params.id] || [])
})

app.post('/eventos', (request, response) => {
    if(request.body.tipo in funcoes)
        funcoes[request.body.tipo](request.body.dados)
    response.status(200).send({ msg: 'ok' })
})

app.listen(5000, () => {
    console.log('Observacoes. Porta 5000.')
})