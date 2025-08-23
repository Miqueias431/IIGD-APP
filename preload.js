const { contextBridge, ipcRenderer } = require("electron");

// Status de conexão (verifica se os bancos de dados está conectado)
ipcRenderer.send("send-message", "Status do banco de dados:");
ipcRenderer.on("db-status", (event, status) => {
  // console.log(status)
});

// Gerenciamento de processos (desempenho e segurança)
contextBridge.exposeInMainWorld("api", {
  verElectron: () => process.versions.electron,
  hello: () => ipcRenderer.send("send-message", "Oi!"),
  getFilePath: (file) => file.path, // expõe o caminho real do arquivo
//   addMembro: (data) => ipcRenderer.send("new-membro", data),
//   updateMembro: (data) => ipcRenderer.send("update-membro", data),
  openAbout: () => ipcRenderer.send("open-about"),
  openmembrosWindow: () => ipcRenderer.send("open-membros-window"),
  dbMessage: (message) => ipcRenderer.on("db-message", message),
  // Cadastro dos Membros
  newMembro: (membro) => ipcRenderer.send("new-membro", membro),
  // Caixa para força a busca dos membros
  infoSearchDialog: () => ipcRenderer.send("dialog-infoSearchDialog"),
  // Foco na caixa de busca
  focusSearch: (args) => ipcRenderer.on("focus-search", args),
  // Busca
  searchMembro: (nomeMembro) => ipcRenderer.send("search-membro", nomeMembro),
  nameMembro: (args) => ipcRenderer.on("name-membro", args),
  dataMembro: (dadosMembro) => ipcRenderer.on("data-membro", dadosMembro),
  autocompleteMembro: (termo) =>
    ipcRenderer.invoke("autocomplete-membros", termo),
  // Limpar caixa de busca
  clearSearch: (args) => ipcRenderer.on("clear-search", args),
  // Resetar o fomulário
  resetForm: (args) => ipcRenderer.on("reset-form", args),
  // Atualizar membro
  updateMembro: (membro) => ipcRenderer.send("update-membro", membro),
  // Deletar Membros
  deleteMembro: (idMem) => ipcRenderer.send("delete-membro", idMem),
  // Limpar tudo
  clearGlobal: (clearGlobal) => ipcRenderer.on("clear-all", clearGlobal),
  focusGlobal: (focusGlobal) => ipcRenderer.on("focus-all", focusGlobal),
});

// Inserir data na pagina
function obterData() {
  const data = new Date();
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  return data.toLocaleDateString("pt-br", options);
}

// Interagir diretamente no DOM do documento html (index.html)
window.addEventListener("DOMContentLoaded", () => {
  const dataAtual = (document.getElementById("dataAtual").innerHTML =
    obterData());
});
