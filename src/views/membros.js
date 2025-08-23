/**
 * Processo de renderização
 * Membro
 */

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("inputSearch").focus(); // Aplica o foco no campo de busca
  btnCreate.disabled = true;
  btnUpdate.disabled = true;
  btnDelete.disabled = true;
});

const inputSearch = document.getElementById("inputSearch");
const autocompleteList = document.getElementById("autocompleteList");

inputSearch.addEventListener("input", async () => {
  const termo = inputSearch.value.trim();
  autocompleteList.innerHTML = "";

  if (termo.length === 0) return;

  const sugestoes = await api.autocompleteMembro(termo);

  sugestoes.forEach((nome) => {
    const li = document.createElement("li");
    li.classList.add("list-group-item", "list-group-item-action");
    li.textContent = nome;
    li.style.cursor = "pointer";
    li.addEventListener("click", () => {
      inputSearch.value = nome;
      autocompleteList.innerHTML = "";
    });
    autocompleteList.appendChild(li);
  });
});

// Fecha o autocomplete se clicar fora
document.addEventListener("click", (e) => {
  if (e.target !== inputSearch) {
    autocompleteList.innerHTML = "";
  }
});

// CRUD Create >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
let formMembro = document.getElementById("frmMembro");
let idMembro = document.getElementById("inputIdMem");
let nomeMembro = document.getElementById("inputNomeMem");
let foneMembro = document.getElementById("inputPhoneMem");
let nascimentoMembro = document.getElementById("inputNascimento");
let cepMembro = document.getElementById("inputCEP");
let logMembro = document.getElementById("inputLogradouro");
let numMembro = document.getElementById("inputNumero");
let compMembro = document.getElementById("inputComplemento");
let bairroMembro = document.getElementById("inputBairro");
let cidMembro = document.getElementById("inputLocalidade");
let ufMembro = document.getElementById("inputUF");
// Foto
// let uploadMembro = document.getElementById("inputFotoMembro");
// // Renderizar a imagem
// let fotoPreview = document.getElementById("fotoPreview");

let uploadMembro, fotoPreview;
uploadMembro = document.querySelector("#inputFotoMembro");
// Renderizar a imagem
fotoPreview = document.querySelector("#fotoPreview");

uploadMembro.addEventListener("change", () => {
  if (uploadMembro.files.length > 0) {
    const file = uploadMembro.files[0];
    fotoPreview.src = URL.createObjectURL(file);
    fotoPreview.style.display = "block";
  } else {
    fotoPreview.src = "";
    fotoPreview.style.display = "none";
  }
});
console.log(uploadMembro);

formMembro.addEventListener("submit", async (event) => {
  event.preventDefault();
  const Membro = {
    nomeMem: nomeMembro.value,
    foneMem: foneMembro.value,
    cepMem: cepMembro.value,
    logMem: logMembro.value,
    numMem: numMembro.value,
    compMem: compMembro.value,
    bairroMem: bairroMembro.value,
    cidMem: cidMembro.value,
    ufMem: ufMembro.value,
    nascimentoMem: nascimentoMembro.value,
    fotoMem:
      uploadMembro.files.length > 0
        ? window.api.getFilePath(uploadMembro.files[0])
        : null,
  };

  console.log("Arquivo selecionado:", uploadMembro.files[0]); // mostra todo o File
  console.log("Caminho do arquivo:", Membro.fotoMem);
  api.newMembro(Membro);
  formMembro.reset();
  // limpa foto
  uploadMembro.value = "";
  fotoPreview.src = "";
  fotoPreview.style.display = "none";
});
// <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
// CRUD Read >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
let arrayMembro = [];

function buscarMembro() {
  let nomeMembro = document
    .getElementById("inputSearch")
    .value.trim()
    .replace(/\s+/g, " ");
  // console.log(nomeMembro);
  if (nomeMembro === "") {
    api.infoSearchDialog();
  } else {
    api.searchMembro(nomeMembro);
  }

  api.focusSearch((args) => {
    document.getElementById("inputSearch").focus();
  });

  api.nameMembro((args) => {
    let setarNomeMembro = document
      .getElementById("inputSearch")
      .value.trim()
      .replace(/\s+/g, " ");
    document.getElementById("inputNomeMem").value += setarNomeMembro;
    document.getElementById("inputSearch").value = "";
    document.getElementById("inputSearch").blur();
    document.getElementById("inputSearch").disabled = true;
    document.getElementById("inputNomeMem").focus();
    btnRead.disabled = true;
    btnCreate.disabled = false;
  });

  api.clearSearch((args) => {
    document.getElementById("inputSearch").value = "";
    document.getElementById("inputSearch").focus();
  });

  api.dataMembro((event, dadosMembro) => {
    const membro = JSON.parse(dadosMembro);
    arrayMembro = membro;
    // console.log(arrayMembro);

    arrayMembro.forEach((m) => {
      document.getElementById("inputIdMem").value = m._id;
      document.getElementById("inputNomeMem").value = m.nomeMembro;
      document.getElementById("inputPhoneMem").value = m.foneMembro;
      document.getElementById("inputCEP").value = m.cepMembro;
      document.getElementById("inputLogradouro").value = m.logMembro;
      document.getElementById("inputNumero").value = m.numMembro;
      document.getElementById("inputComplemento").value = m.compMembro;
      document.getElementById("inputBairro").value = m.bairroMembro;
      document.getElementById("inputLocalidade").value = m.cidMembro;
      document.getElementById("inputUF").value = m.ufMembro;
      // Preenche a data de nascimento
      document.getElementById("inputNascimento").value = m.nascimentoMembro
        ? new Date(m.nascimentoMembro).toISOString().split("T")[0]
        : "";
      uploadMembro.src = m.fotoMembro;
      if (m.fotoMembro) {
        fotoPreview.src = m.fotoMembro;
        fotoPreview.style.display = "block";
      } else {
        fotoPreview.src = "";
        fotoPreview.style.display = "none";
      }

      document.getElementById("inputSearch").value = "";

      document.getElementById("inputSearch").disabled = true;
      document.getElementById("inputSearch").blur();

      document.getElementById("btnCreate").disabled = true;
      document.getElementById("btnRead").disabled = true;

      document.getElementById("btnUpdate").disabled = false;
      document.getElementById("btnDelete").disabled = false;
    });
  });
}
// <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

// CRUD Update >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
function editarMembro() {
  const membro = {
    idMem: idMembro.value,
    nomeMem: nomeMembro.value,
    foneMem: foneMembro.value,
    cepMem: cepMembro.value,
    logMem: logMembro.value,
    numMem: numMembro.value,
    compMem: compMembro.value,
    bairroMem: bairroMembro.value,
    cidMem: cidMembro.value,
    ufMem: ufMembro.value,
    nascimentoMem: nascimentoMembro.value,
    fotoMem: uploadMembro.files.length > 0 ? uploadMembro.files[0].path : null,
  };
  // console.log(membro);

  api.updateMembro(membro);

  document.getElementById("btnRead").disabled = true;
  document.getElementById("inputSearch").disabled = true;
  document.getElementById("inputSearch").blur();
  document.getElementById("inputNomeMem").focus();

  // document.getElementById("btnRead").disabled = false
  // document.getElementById('inputSearch').disabled = false
  // document.getElementById('inputSearch').focus()
  // document.getElementById("btnDelete").disabled = true
  // document.getElementById("btnUpdate").disabled = true
}

// <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

// CRUD Delete >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

function excluirMembro() {
  let idMem = idMembro.value;
  // console.log(idMem);

  api.deleteMembro(idMem);
  // limpa foto
  uploadMembro.value = "";
  fotoPreview.src = "";
  fotoPreview.style.display = "none";

  document.getElementById("btnRead").disabled = false;
  document.getElementById("inputSearch").disabled = false;
  document.getElementById("inputSearch").focus();
  document.getElementById("btnDelete").disabled = true;
  document.getElementById("btnUpdate").disabled = true;
}

// Reset Form >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
api.clearGlobal((clearGlobal) => {
  // console.log("Campo limpo");
  formMembro.reset();
});

api.focusGlobal((focusGlobal) => {
  //remover o foco e desativar a caixa de busca
  document.getElementById("inputSearch").disabled = true;
  document.getElementById("inputSearch").blur();
  //desativar os botão adicionar e buscar
  document.getElementById("btnCreate").disabled = true;
  document.getElementById("btnRead").disabled = true;
  // ativar os botões update e delete
  document.getElementById("btnUpdate").disabled = false;
  document.getElementById("btnDelete").disabled = false;
});

api.resetForm((args) => {
  resetForm();
});

function resetForm() {
  document.getElementById("inputSearch").disabled = false;
  document.getElementById("inputSearch").focus();
  btnCreate.disabled = true;
  btnRead.disabled = false;
  btnUpdate.disabled = true;
  btnDelete.disabled = true;
  uploadMembro.value = "";
  fotoPreview.src = "";
  fotoPreview.style.display = "none";
}
// <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
