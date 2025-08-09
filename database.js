/**
 * Módulo de conexão com o banco de dados
 * Uso do framework mongoose (npm i mongoose)
 */

// Importar a biblioteca
const mongoose = require('mongoose')

// Definir o banco de dados (copiar a string do compass)
// Atlas
let url = "mongodb+srv://miqueiasr560:203194oE@iigdserver.snta0hq.mongodb.net/dbiigd"

// Variável para armazenar o status da conexão
let isConnected = false

// status da conexão
const dbStatus = async () => {
    if (isConnected === false) {
        await conectar()
    }
}

// Conectar
const conectar = async () => {

    // se não estiver conectado
    if (isConnected === false) {
        try {
            await mongoose.connect(url)
            isConnected = true
            console.log("MongoDB conectado")
            return (isConnected)
        } catch (error) {
            console.log(`Problema detectado: ${error}`)
        }
    }
}


// Desconectar
const desconectar = async () => {
    if (isConnected === true) {
        try {
            await mongoose.disconnect(url)
            isConnected = false            
            console.log("MongoDB desconectado")
        } catch (error) {
            console.log(`Problema detectado: ${error}`)
        }
    }
}

// Exportar para o main os métodos conectar e desconectar
module.exports = { dbStatus, desconectar }