// Vinculado ao preload.js
console.log(`Electron: ${api.verElectron()}`)
api.hello()

function sobre() {
    api.openAbout()
}

function membros() {
    api.openmembrosWindow()
}

// alteração do ícone do status do banco de dados
api.dbMessage((event, message) => {
    console.log(message)
    if (message === "conectado") {
        document.getElementById('dbstatus').src = "../public/img/dbon.png"
    } else {
        document.getElementById('dbstatus').src = "../public/img/dboff.png"
    }
})
