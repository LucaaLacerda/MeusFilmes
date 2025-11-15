const usuario = JSON.parse(localStorage.getItem("usuario"));
let todosFilmes = [];
let filmesFiltrados = [];

function alternarFormulario() {
  const form = document.getElementById("formFilme");
  const botao = document.getElementById("botaoMostrarForm");
  const estaOculto = form.classList.contains("hidden");

  if (estaOculto) {
    form.classList.remove("hidden");
    botao.innerText = "− Fechar";
    botao.classList.remove("btn-primary");
    botao.classList.add("btn-danger");
  } else {
    form.classList.add("hidden");
    botao.innerText = "+ Adicionar Filme";
    botao.classList.remove("btn-danger");
    botao.classList.add("btn-primary");
    limparCampos();
    const botaoSalvar = document.querySelector("button[onclick='salvarAlteracoes()']");
    if (botaoSalvar) {
      botaoSalvar.innerText = "Salvar";
      botaoSalvar.setAttribute("onclick", "adicionarFilme()");
    }
    localStorage.removeItem("filmeEmEdicao");
  }
}

function logout() {
  localStorage.removeItem("usuario");
  window.location.href = "index.html";
}

async function carregarFilmes() {
  const { data, error } = await supabase
    .from("filmes")
    .select("*")
    .eq("usuario_id", usuario.id)
    .order("titulo", { ascending: true });

  if (error) {
    console.error("Erro ao carregar filmes:", error);
    return;
  }

  todosFilmes = data;
  filmesFiltrados = [...todosFilmes];
  atualizarContador();
  renderizarFilmes();
}

function validarFilme(titulo, genero, ano, nota) {
  let valido = true;
  
  const inputs = document.querySelectorAll('.form-input');
  inputs.forEach(input => {
    input.classList.remove('campo-erro');
  });
  
  if (!titulo || titulo.trim() === '') {
    document.getElementById("titulo").classList.add('campo-erro');
    alert("Por favor, preencha o título do filme!");
    valido = false;
  }
  
  if (!genero || genero.trim() === '') {
    document.getElementById("genero").classList.add('campo-erro');
    alert("Por favor, preencha o gênero do filme!");
    valido = false;
  }
  
  if (!ano || ano.trim() === '') {
    document.getElementById("ano").classList.add('campo-erro');
    alert("Por favor, preencha o ano do filme!");
    valido = false;
  } else {
    const anoNumero = parseInt(ano);
    if (isNaN(anoNumero) || anoNumero < 1888 || anoNumero > new Date().getFullYear() + 5) {
      document.getElementById("ano").classList.add('campo-erro');
      alert("Por favor, insira um ano válido para o filme!");
      valido = false;
    }
  }
  
  if (nota !== '' && nota !== null && nota !== undefined) {
    const notaNumero = parseFloat(nota);
    if (isNaN(notaNumero) || notaNumero < 0 || notaNumero > 10) {
      document.getElementById("nota").classList.add('campo-erro');
      alert("A nota deve ser um número entre 0 e 10!");
      valido = false;
    }
  }
  
  return valido;
}

async function adicionarFilme() {
  const titulo = document.getElementById("titulo").value;
  const genero = document.getElementById("genero").value;
  const ano = document.getElementById("ano").value;
  const descricao = document.getElementById("descricao").value;
  const nota = document.getElementById("nota").value;

  if (!validarFilme(titulo, genero, ano, nota)) {
    return;
  }

  const dadosFilme = {
    titulo: titulo.trim(),
    genero: genero.trim(),
    ano: parseInt(ano),
    descricao: descricao.trim(),
    usuario_id: usuario.id
  };

if (nota && nota.trim() !== '') {
    const notaNum = Number(nota);
    dadosFilme.nota = isNaN(notaNum) ? null : notaNum;
} else {
    dadosFilme.nota = null;
}

  const { error } = await supabase.from("filmes").insert([dadosFilme]);

  if (error) {
    alert("Erro ao adicionar filme: " + error.message);
  } else {
    alert("Filme adicionado com sucesso!");
    limparCampos();
    await carregarFilmes();
    fecharFormulario();
  }
}

async function editarFilme(id) {
  const { data: filme, error } = await supabase
    .from("filmes")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    alert("Erro ao carregar filme: " + error.message);
    return;
  }

  const form = document.getElementById("formFilme");
  const botaoForm = document.getElementById("botaoMostrarForm");

  if (form.classList.contains("hidden")) {
    form.classList.remove("hidden");
    botaoForm.innerText = "− Fechar";
    botaoForm.classList.remove("btn-primary");
    botaoForm.classList.add("btn-danger");
  }

  document.getElementById("titulo").value = filme.titulo;
  document.getElementById("genero").value = filme.genero;
  document.getElementById("ano").value = filme.ano;
  document.getElementById("descricao").value = filme.descricao;
  document.getElementById("nota").value = filme.nota;

  localStorage.setItem("filmeEmEdicao", id);

  const botaoSalvar = document.querySelector("button[onclick='adicionarFilme()']");
  botaoSalvar.innerText = "Salvar Alterações";
  botaoSalvar.setAttribute("onclick", "salvarAlteracoes()");
  
  form.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

async function salvarAlteracoes() {
  const id = localStorage.getItem("filmeEmEdicao");
  const titulo = document.getElementById("titulo").value;
  const genero = document.getElementById("genero").value;
  const ano = document.getElementById("ano").value;
  const descricao = document.getElementById("descricao").value;
  const nota = document.getElementById("nota").value;

  if (!validarFilme(titulo, genero, ano, nota)) {
    return;
  }

  const dadosAtualizacao = {
    titulo: titulo.trim(),
    genero: genero.trim(),
    ano: parseInt(ano),
    descricao: descricao.trim()
  };

  if (nota && nota.trim() !== '') {
      const notaNum = Number(nota);
      dadosAtualizacao.nota = isNaN(notaNum) ? null : notaNum;
  } else {
      dadosAtualizacao.nota = null;
  }

  const { error } = await supabase
    .from("filmes")
    .update(dadosAtualizacao)
    .eq("id", id);

  if (error) {
    alert("Erro ao salvar alterações: " + error.message);
  } else {
    alert("Filme atualizado com sucesso!");
    localStorage.removeItem("filmeEmEdicao");
    limparCampos();
    await carregarFilmes();
    fecharFormulario();

    const botaoSalvar = document.querySelector("button[onclick='salvarAlteracoes()']");
    if (botaoSalvar) {
      botaoSalvar.innerText = "Salvar";
      botaoSalvar.setAttribute("onclick", "adicionarFilme()");
    }
  }
}

async function excluirFilme(id) {
  if (!confirm("Tem certeza que deseja excluir este filme?")) return;

  const { error } = await supabase.from("filmes").delete().eq("id", id);

  if (error) {
    alert("Erro ao excluir: " + error.message);
  } else {
    alert("Filme excluído!");
    await carregarFilmes();
  }
}

function filtrarFilmes() {
  const termoPesquisa = document.getElementById('campoPesquisa').value.toLowerCase().trim();
  
  if (termoPesquisa === '') {
    filmesFiltrados = [...todosFilmes];
  } else {
    filmesFiltrados = todosFilmes.filter(filme => 
      filme.titulo.toLowerCase().includes(termoPesquisa)
    );
  }
  
  atualizarContador();
  renderizarFilmes();
}

function atualizarContador() {
  const total = todosFilmes.length;
  const filtrados = filmesFiltrados.length;
  
  let textoContador = `🎥 Total de filmes: ${total}`;
  
  if (filtrados < total && filtrados > 0) {
    textoContador += ` (mostrando ${filtrados})`;
  } else if (filtrados === 0 && total > 0) {
    textoContador += ` (nenhum resultado para a pesquisa)`;
  }
  
  document.getElementById("contadorFilmes").innerHTML = textoContador;
}

function renderizarFilmes() {
  const lista = document.getElementById("lista-filmes");
  lista.innerHTML = "";

  if (filmesFiltrados.length === 0) {
    lista.innerHTML = `
      <div class="text-center" style="color: #546e7a; padding: 40px;">
        <p>Nenhum filme encontrado.</p>
        <p class="mt-3">Tente ajustar sua pesquisa ou adicione um novo filme!</p>
      </div>
    `;
    return;
  }

  filmesFiltrados.forEach(filme => {
    const descricaoCompleta = filme.descricao || 'Sem descrição';
    const descricaoLimitada = limitarTexto(descricaoCompleta, 100);
    const temTextoCompleto = descricaoCompleta.length > 100;
    
    const movieCard = document.createElement("div");
    movieCard.className = "movie-card";
    movieCard.innerHTML = `
      <h3 class="movie-title">${filme.titulo}</h3>
      <div class="movie-meta">
        <strong>${filme.ano}</strong> • ${filme.genero} • Nota: ${filme.nota ? filme.nota + '/10' : "N/A"}
      </div>
      <p class="movie-description" id="desc-${filme.id}">
        ${descricaoLimitada}
        ${temTextoCompleto ? `<span class="ver-mais-link" onclick="toggleDescricao('${filme.id}', '${descricaoCompleta.replace(/'/g, "\\'")}')">Ver mais</span>` : ''}
      </p>
      <div class="movie-actions">
        <button onclick="editarFilme('${filme.id}')" class="action-btn">Editar</button>
        <button onclick="excluirFilme('${filme.id}')" class="action-btn delete">Excluir</button>
      </div>
    `;
    lista.appendChild(movieCard);
  });
}

function limparCampos() {
  document.getElementById("titulo").value = "";
  document.getElementById("genero").value = "";
  document.getElementById("ano").value = "";
  document.getElementById("descricao").value = "";
  document.getElementById("nota").value = "";
  
  const inputs = document.querySelectorAll('.form-input');
  inputs.forEach(input => {
    input.classList.remove('campo-erro');
  });
}

function fecharFormulario() {
  const form = document.getElementById("formFilme");
  const botao = document.getElementById("botaoMostrarForm");
  
  form.classList.add("hidden");
  botao.innerText = "+ Adicionar Filme";
  botao.classList.remove("btn-danger");
  botao.classList.add("btn-primary");
  
  limparCampos();
  
  const botaoSalvar = document.querySelector("button[onclick='salvarAlteracoes()']");
  if (botaoSalvar) {
    botaoSalvar.innerText = "Salvar";
    botaoSalvar.setAttribute("onclick", "adicionarFilme()");
  }
  
  localStorage.removeItem("filmeEmEdicao");
}

function limitarTexto(texto, limite = 100) {
  if (!texto || texto.length <= limite) {
    return texto;
  }
  
  const textoLimitado = texto.substring(0, limite) + '...';
  return textoLimitado;
}

function toggleDescricao(filmeId, descricaoCompleta) {
  const elementoDescricao = document.getElementById(`desc-${filmeId}`);
  const textoAtual = elementoDescricao.innerHTML;
  
  if (textoAtual.includes('Ver menos')) {
    const descricaoLimitada = limitarTexto(descricaoCompleta, 100);
    elementoDescricao.innerHTML = `${descricaoLimitada} <span class="ver-mais-link" onclick="toggleDescricao('${filmeId}', '${descricaoCompleta.replace(/'/g, "\\'")}')">Ver mais</span>`;
  } else {
    elementoDescricao.innerHTML = `${descricaoCompleta} <span class="ver-mais-link" onclick="toggleDescricao('${filmeId}', '${descricaoCompleta.replace(/'/g, "\\'")}')">Ver menos</span>`;
  }
}

carregarFilmes();