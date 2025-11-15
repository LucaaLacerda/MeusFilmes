async function cadastrarUsuario() {
  const nome = document.getElementById("nome").value.trim();
  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value.trim();

  // Remove classes de erro
  document.getElementById("nome").classList.remove('campo-erro');
  document.getElementById("email").classList.remove('campo-erro');
  document.getElementById("senha").classList.remove('campo-erro');

  // Validações
  if (!nome) {
    document.getElementById("nome").classList.add('campo-erro');
    alert("Por favor, preencha o nome!");
    return;
  }

  if (!email) {
    document.getElementById("email").classList.add('campo-erro');
    alert("Por favor, preencha o email!");
    return;
  }

  // Validação de email simples
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    document.getElementById("email").classList.add('campo-erro');
    alert("Por favor, insira um email válido!");
    return;
  }

  if (!senha) {
    document.getElementById("senha").classList.add('campo-erro');
    alert("Por favor, preencha a senha!");
    return;
  }

  if (senha.length < 6) {
    document.getElementById("senha").classList.add('campo-erro');
    alert("A senha deve ter pelo menos 6 caracteres!");
    return;
  }

  // Verifica se o email já existe
  const { data: usuarioExistente, error: erroVerificacao } = await supabase
    .from("usuarios")
    .select("email")
    .eq("email", email)
    .single();

  if (usuarioExistente) {
    document.getElementById("email").classList.add('campo-erro');
    alert("Este email já está cadastrado!");
    return;
  }

  // Cadastra o usuário
  const { data, error } = await supabase
    .from("usuarios")
    .insert([{ nome, email, senha }]);

  if (error) {
    alert("Erro ao cadastrar: " + error.message);
  } else {
    alert("Usuário cadastrado com sucesso!");
    window.location.href = "index.html";
  }
}

async function loginUsuario() {
  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value.trim();

  // Remove classes de erro
  document.getElementById("email").classList.remove('campo-erro');
  document.getElementById("senha").classList.remove('campo-erro');

  // Validações básicas
  if (!email) {
    document.getElementById("email").classList.add('campo-erro');
    alert("Por favor, preencha o email!");
    return;
  }

  if (!senha) {
    document.getElementById("senha").classList.add('campo-erro');
    alert("Por favor, preencha a senha!");
    return;
  }

  // Primeiro verifica se o email existe
  const { data: usuarioExistente, error: erroEmail } = await supabase
    .from("usuarios")
    .select("email")
    .eq("email", email)
    .single();

  // Se email não existe
  if (erroEmail && erroEmail.code === 'PGRST116') { // Código para "nenhum resultado"
    const cadastrar = confirm(`Email não cadastrado!\n\nDeseja cadastrar "${email}"?`);
    
    if (cadastrar) {
      // Redireciona para cadastro pré-preenchido
      localStorage.setItem('emailParaCadastro', email);
      window.location.href = "cadastro.html";
    }
    return;
  }

  // Se tem outro erro na verificação do email
  if (erroEmail) {
    alert("Erro ao verificar email: " + erroEmail.message);
    return;
  }

  // Agora faz o login normal
  const { data, error } = await supabase
    .from("usuarios")
    .select("*")
    .eq("email", email)
    .eq("senha", senha)
    .single();

  if (error || !data) {
    document.getElementById("email").classList.add('campo-erro');
    document.getElementById("senha").classList.add('campo-erro');
    alert("Email ou senha inválidos!");
  } else {
    localStorage.setItem("usuario", JSON.stringify(data));
    window.location.href = "principal.html";
  }
}