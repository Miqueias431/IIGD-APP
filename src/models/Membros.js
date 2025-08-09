/**
 * Modelo de dados (model) Membros
 */

const {model, Schema} = require ('mongoose')

const membroSchema = new Schema (
    {
        nomeMembro: {
            type: String
        },
        foneMembro: {
            type: String
        },
        cepMembro: {
            type: String
        },
        logMembro: {
            type: String
        },
        numMembro: {
            type: String
        },
        compMembro: {
            type: String
        },
        bairroMembro: {
            type: String
        },
        cidMembro: {
            type: String
        },
        ufMembro: {
            type: String
        }
    }
)

module.exports = model('Membro', membroSchema)