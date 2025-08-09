function buscarcep() {
    let valor
    valor = String(frmMembro.txtCEP.value)
    let urlAPI = `https://viacep.com.br/ws/${valor}/json/`

    fetch(urlAPI)
        .then((Response) => {
            return Response.json()
        })

        .then((dados) => {
            frmMembro.inputLogradouro.value = `${dados.logradouro}`
            frmMembro.inputBairro.value = `${dados.bairro}`
            frmMembro.inputLocalidade.value = `${dados.localidade}`
            frmMembro.inputUF.value = `${dados.uf}`
            
            // console.log(dados.logradouro)
            // console.log(dados.bairro)
            // console.log(dados.localidade)
            // console.log(dados.uf)
            
        })

        .catch((error) => {
        console.log(`Erro ao obter o endereço: ${error}`)
        })
}