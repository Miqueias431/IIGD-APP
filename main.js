const { ipcMain, nativeTheme, dialog } = require("electron");
const { app, BrowserWindow, Menu, shell } = require("electron/main");
const path = require("node:path");

//importar fs para trabalhar com os arquivos de imagens
const fs = require("fs");

// Importar o módulo de conexão
const { dbStatus, desconectar } = require("./database.js");
// status de conexão do banco de dados (No MongoDB é mais eficiente manter uma única conexão aberta durante todo o tempo de vida do aplicativo e usá-la conforme necessário. Fechar e reabrir a conexão frequentemente pode aumentar a sobrecarga e causar problemas de desempenho)
// a função dbStatus garante que a conexão com o banco de dados seja estabelecida apenas uma vez e reutilizada.
// a variável abaixo é usada para garantir que o sistema inicie com o banco de dados desconectado
let dbCon = null;

// Importação do Schema (model) das coleções("tabelas")
const membroModel = require("./src/models/Membros.js");
const { crash } = require("node:process");
// Janela Principal (definir o objeto win como variavel publica)
let win;
const createWindow = () => {
  win = new BrowserWindow({
    width: 1280,
    height: 720,
    icon: "./src/public/img/iigd.png",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));

  win.loadFile("./src/views/index.html");
};

// Janela Sobre
let about; //Resolver BUG de abertura de várias janelas

nativeTheme.themeSource = "light";
const aboutWindow = () => {
  const father = BrowserWindow.getFocusedWindow();
  // se a janela about não estiver aberta (BUG 1) abrir
  if (!about) {
    about = new BrowserWindow({
      width: 420, // Largura
      height: 300, // Altura
      icon: "./src/public/img/iigd.png",
      resizable: false, // Evitar o redimensionameto
      autoHideMenuBar: true, // Esconde a barra de menu
      parent: father,
      modal: true,
      webPreferences: {
        preload: path.join(__dirname, "preload.js"),
        nodeIntegration: true,
        contextIsolation: true
      },
    });
  }

  about.loadFile("./src/views/sobre.html");
  // Resolver BUG 2 (reabrir a janela se estiver fechada)
  about.on("closed", () => {
    about = null;
  });
};

// Janela Membros
let membros;

const membrosWindow = () => {
  const father = BrowserWindow.getFocusedWindow();

  // se a janela membros não estiver aberta (BUG 1) abrir
  if (!membros) {
    membros = new BrowserWindow({
      width: 1280, // Largura
      height: 720, // Altura
      icon: "./src/public/img/user-gear.png",
      resizable: true, // Evitar o redimensionameto
      autoHideMenuBar: true, // Esconde a barra de menu
      parent: father,
      modal: true,
      webPreferences: {
        preload: path.join(__dirname, "preload.js"),
        nodeIntegration: true,
        contextIsolation: true
      },
    });
  }

  membros.loadFile("./src/views/membros.html");
  // Resolver BUG 2 (reabrir a janela se estiver fechada)
  membros.on("closed", () => {
    membros = null;
  });
};

app.whenReady().then(() => {
  // status de conexão com o banco de dados
  ipcMain.on("send-message", async (event, message) => {
    dbCon = await dbStatus();
    event.reply("db-message", "conectado");
  });

  // Desconectar do banco ao encerrar a janela
  app.on("before-quit", async () => {
    await desconectar(dbCon);
  });

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

ipcMain.on("open-about", () => {
  aboutWindow();
});

ipcMain.on("open-membros-window", () => {
  membrosWindow();
});

// template do menu personalizado
const template = [
  {
    label: "Arquivo",
    submenu: [
      {
        label: "Membros",
        click: () => membrosWindow(),
      },
      {
        label: "Sair",
        click: () => app.quit(),
        accelerator: "Alt+F4",
      },
    ],
  },
  {
    label: "Exibir",
    submenu: [
      {
        label: "Recarregar",
        role: "reload",
      },
      {
        label: "Ferramentas do desenvolvedor",
        role: "toggleDevTools",
      },
      {
        type: "separator",
      },
      {
        label: "Aplicar zoom",
        role: "zoomIn",
      },
      {
        label: "Reduzir",
        role: "zoomOut",
      },
      {
        label: "Restalra o zoom padrão",
        role: "resetZoom",
      },
    ],
  },
  {
    label: "Ajuda",
    submenu: [
      {
        label: "Sobre",
        click: () => aboutWindow(),
      },
    ],
  },
];

// CRUD Create >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

ipcMain.on("new-membro", async (event, membro) => {
  console.log(membro); // Debug do Membro

  try {
    const uploadsDir = path.join(__dirname, 'uploads')
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir)
    }

    // const ext = path.extname(membro.fotoMem);
    const fileName = `${Date.now()}_${membro.fotoMem.path}`;
    const destination = path.join(uploadsDir, fileName);

    fs.copyFileSync(membro.fotoMem.path, destination);



    const novoMembro = new membroModel({
      nomeMembro: membro.nomeMem,
      foneMembro: membro.foneMem,
      cepMembro: membro.cepMem,
      logMembro: membro.logMem,
      numMembro: membro.numMem,
      compMembro: membro.compMem,
      bairroMembro: membro.bairroMem,
      cidMembro: membro.cidMem,
      ufMembro: membro.ufMem,
      nascimentoMembro: membro.nascimentoMem,
      fotoMembro: destination
    });

    await novoMembro.save(); // Salva no mongodb

    dialog.showMessageBox({
      type: "info",
      title: "Aviso",
      message: "Membro cadastrado com sucesso!",
      buttons: ["Ok"],
    });

    event.reply("reset-form");
  } catch (error) {
    console.error("Erro ao cadastrar membro:", error);
  }
});
// <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

// CRUD Read >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// Aviso!!! (Busca: Prenchimento de campo obrigatório)
ipcMain.on("dialog-infoSearchDialog", (event) => {
  dialog.showMessageBox({
    type: "warning",
    title: "Atenção!",
    message: "Preencha um nome no campo de busca",
    buttons: ["Ok"],
  });

  event.reply("focus-search");
});

// Recebimento do pedido de busca do membro pelo nome
ipcMain.on("search-membro", async (event, nomeMembro) => {
  console.log(nomeMembro);
  // Busca no banco de dados
  try {
    const dadosMembro = await membroModel.find({
      nomeMembro: new RegExp(nomeMembro, "i"),
    });
    // console.log(dadosMembro)
    // UX -> Se o membro não estiver cadastrardo, avisar ao usuário e habilitar o botão cadastrar
    if (dadosMembro.length === 0) {
      dialog
        .showMessageBox({
          type: "warning",
          title: "Aviso!",
          message: "Membro não cadastrado. \nDeseja cadastrar este membro?",
          buttons: ["Sim", "Não"],
          defaultId: 0,
        })
        .then((result) => {
          if (result.response === 0) {
            event.reply("name-membro");
          } else {
            event.reply("clear-search");
          }
        });
    } else {
      event.reply("data-membro", JSON.stringify(dadosMembro));
    }
  } catch (error) {
    console.log(error);
  }
});

ipcMain.handle("autocomplete-membros", async (event, termo) => {
  try {
    const sugestoes = await membroModel
      .find(
        { nomeMembro: new RegExp(termo, "i") }, // case insensitive
        { nomeMembro: 1, _id: 0 } // só o nome
      )
      .limit(5); // limitar a 5 sugestões

    return sugestoes.map((s) => s.nomeMembro);
  } catch (error) {
    console.error("Erro ao buscar sugestões:", error);
    return [];
  }
});
// <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

// CRUD Update >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
ipcMain.on("update-membro", (event, membro) => {
  console.log(membro);
  // Campo nome obrigatorio
  if (
    membro.nomeMem === "",
    membro.foneMem === "",
    membro.cepMem === "",
    membro.nascimentoMem === "",
    membro.fotoMem === ""
  ) {
    dialog.showMessageBox({
      type: "warning",
      title: "Aviso!",
      message: "Preencha os campos obrigatórios",
      buttons: ["Ok"],
      defaultId: 0,
    });
    event.reply("focus-all");
    return;
  }
  dialog
    .showMessageBox({
      type: "warning",
      title: "Aviso",
      message: "Deseja alterar os dados do membro?",
      buttons: ["Sim", "Não"],
      defaultId: 0,
    })
    .then(async (result) => {
      if (result.response === 0) {
        try {
          // let fotoDestino = null;
          // Adicionar validação aqui
          if (!membro.fotoMem) {
            dialog.showMessageBox({
              type: "warning",
              title: "Aviso",
              message: "Por favor, selecione uma foto para o membro.",
              buttons: ["Ok"],
            });
            event.reply("reset-form"); // Ou outra ação apropriada
            return; // Interrompe a execução se a foto não for fornecida
          }

          const uploadsDir = path.join(__dirname, 'uploads')
          if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir)
          }

          // const ext = path.extname(membro.fotoMem);
          const fileName = `${Date.now()}_${membro.fotoMem}`;
          const destination = path.join(uploadsDir, fileName);

          fs.copyFileSync(membro.fotoMem, destination);



          await membroModel.findByIdAndUpdate(
            membro.idMem,
            {
              nomeMembro: membro.nomeMem,
              foneMembro: membro.foneMem,
              cepMembro: membro.cepMem,
              logMembro: membro.logMem,
              numMembro: membro.numMem,
              compMembro: membro.compMem,
              bairroMembro: membro.bairroMem,
              cidMembro: membro.cidMem,
              ufMembro: membro.ufMem,
              nascimentoMembro: membro.nascimentoMem,
              fotoMem: destination
            },
            {
              new: true,
            }
          );

          // event.reply('clear-all');
          dialog.showMessageBox({
            type: "info",
            title: "Aviso",
            message: "Dados do membro alterados com sucesso.",
            buttons: ["Ok"],
            defaultId: 0,
          });
        } catch (error) {
          console.error('Erro ao editar membro:', error);
        }
      } else {
        event.reply("focus-all");
      }
    });
});

// <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

// CRUD Delete >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
ipcMain.on("delete-membro", (event, idMem) => {
  console.log(idMem);
  dialog
    .showMessageBox({
      type: "error",
      title: "ATENCAO!",
      message: "Tem certeza que deseja apagar este membro?",
      defaultId: 0,
      buttons: ["Sim", "Não"],
    })
    .then(async (result) => {
      if (result.response === 0) {
        try {
          await membroModel.findByIdAndDelete(idMem);
          event.reply("clear-all");
          dialog.showMessageBox({
            type: "info",
            title: "Aviso",
            message: "Membro excluído com sucesso!",
            buttons: ["Ok"],
          });
        } catch (error) {
          console.log(error);
        }
      } else {
        event.reply("focus-all");
      }
    });
});
