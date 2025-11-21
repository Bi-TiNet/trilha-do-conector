document.addEventListener('DOMContentLoaded', function() {

    console.log("Sistema 'Portal do Colaborador Ti.Net' iniciado - Versão Integrada");

    // ==========================================================
    // 1. LÓGICA DE NAVEGAÇÃO E CONTROLE DE FLUXO
    // ==========================================================
    const urlParams = new URLSearchParams(window.location.search);
    const role = urlParams.get('role'); // Captura: 'auxiliar', 'tecnico', 'autonomo' ou 'suporte'
    const isAvaliacaoPage = window.location.pathname.includes('avaliacao.html');

    // Função para propagar a 'role' nos links
    if (role) {
        // Sufixo para arquivos de trilha (ex: modulo1-tecnico.html)
        // Para suporte, usamos '-suporte'. Para os outros, o proprio nome.
        let suffix = '';
        if (role === 'tecnico' || role === 'autonomo') suffix = `-${role}`;
        if (role === 'suporte') suffix = `-suporte`;

        document.querySelectorAll('a').forEach(link => {
            const originalHref = link.getAttribute('href');
            
            // Ignora links que não devem ser alterados
            if (!originalHref || originalHref.startsWith('#') || originalHref.startsWith('javascript') || !originalHref.endsWith('.html')) {
                return;
            }

            try {
                let finalHref = originalHref;
                
                // Se for link para módulos, aplica a lógica de sufixo para direcionar ao arquivo correto
                if (!isAvaliacaoPage && finalHref.includes('modulo')) {
                    // Se o arquivo já não tiver o sufixo, adiciona
                    if (!finalHref.includes(suffix)) {
                        finalHref = finalHref.replace('.html', `${suffix}.html`);
                    }
                }
                
                // Adiciona o parametro role na URL para persistência
                const url = new URL(finalHref, window.location.href);
                url.searchParams.set('role', role);
                link.href = url.href;

            } catch (e) {
                console.error("Erro processando link:", originalHref);
            }
        });
    }

    // ==========================================================
    // 2. INTERFACE (ACORDEÕES E ANIMAÇÕES)
    // ==========================================================
    
    // Animação de entrada suave
    document.querySelectorAll('section').forEach(section => {
        setTimeout(() => section.classList.add('visible'), 100);
    });

    // Lógica do Menu Acordeão (+) - Funciona em qualquer página da trilha
    document.querySelectorAll('.accordion-header').forEach(button => {
        button.addEventListener('click', () => {
            const content = button.nextElementSibling;
            // Toggle da classe active no botão
            button.classList.toggle('active');
            
            // Se tiver a classe active, abre (define altura máxima)
            if (button.classList.contains('active')) {
                content.style.maxHeight = content.scrollHeight + "px";
            } else {
                // Se não, fecha (null)
                content.style.maxHeight = null;
            }
        });
    });

    // ==========================================================
    // 3. LÓGICA DOS SIMULADOS RÁPIDOS (NOS MÓDULOS)
    // ==========================================================
    // Esta lógica captura os cliques nos botões "opcao-quiz" dentro dos módulos de aula
    const botoesSimuladoRapido = document.querySelectorAll('.simulado .opcao-quiz');
    
    if (botoesSimuladoRapido.length > 0) {
        botoesSimuladoRapido.forEach(btn => {
            btn.addEventListener('click', function() {
                const parentDiv = this.parentElement; // A div .questao
                const feedbackP = parentDiv.querySelector('.feedback');
                const isCorrect = this.getAttribute('data-correta') === 'true';
                
                // Desabilita todos os botões dessa questão para evitar múltiplas respostas
                const siblings = parentDiv.querySelectorAll('.opcao-quiz');
                siblings.forEach(sb => sb.disabled = true);

                if (isCorrect) {
                    this.classList.add('correta'); // Estilo verde (definido no CSS)
                    this.style.backgroundColor = '#d4edda';
                    this.style.borderColor = '#28a745';
                    this.style.color = '#155724';
                    feedbackP.innerHTML = '<strong>Correto!</strong> Você absorveu bem o conteúdo.';
                    feedbackP.style.color = '#155724';
                } else {
                    this.classList.add('errada'); // Estilo vermelho
                    this.style.backgroundColor = '#f8d7da';
                    this.style.borderColor = '#dc3545';
                    this.style.color = '#721c24';
                    
                    // Destaca a correta para aprendizado
                    siblings.forEach(sb => {
                        if (sb.getAttribute('data-correta') === 'true') {
                            sb.style.backgroundColor = '#d4edda';
                            sb.style.border = '1px solid #28a745';
                        }
                    });

                    feedbackP.innerHTML = '<strong>Incorreto.</strong> Revise o tópico acima e tente novamente.';
                    feedbackP.style.color = '#721c24';
                }
            });
        });
    }

    // ==========================================================
    // 4. AVALIAÇÃO FINAL (BANCO DE PERGUNTAS)
    // ==========================================================
    const avaliacaoInicio = document.getElementById('avaliacao-inicio');
    
    if (avaliacaoInicio) {
        const avaliacaoQuiz = document.getElementById('avaliacao-quiz');
        const avaliacaoResultado = document.getElementById('avaliacao-resultado');
        const btnIniciar = document.getElementById('btn-iniciar-avaliacao');
        const inputNome = document.getElementById('nome-colaborador');
        
        // --- BANCO DE QUESTÕES ATUALIZADO ---
        const bancoQuestoes = {
            // SUPORTE TÉCNICO (Baseado nos Módulos 1 a 4 criados)
            suporte: [
                { p: "Qual a tecla de atalho utilizada no IXC para abrir a barra de pesquisa de clientes?", opts: ["F5", "F3", "Ctrl+P", "F12"], r: 1 },
                { p: "Qual dado é considerado o mais confiável para localizar um cliente e evitar homônimos?", opts: ["Nome Completo", "Endereço", "CPF", "Número do Telefone"], r: 2 },
                { p: "No diagnóstico de rede, qual faixa de sinal (RX Power) é considerada IDEAL?", opts: ["-15dBm a -25dBm", "-26dBm a -30dBm", "Acima de -10dBm", "-30dBm a -40dBm"], r: 0 },
                { p: "Um cliente apresenta sinal de -31dBm. Qual a ação correta a ser tomada?", opts: ["Reiniciar a ONU e encerrar", "Aumentar a velocidade do plano", "Abrir O.S. de Visita Técnica (Sinal Crítico)", "Informar que é oscilação da região"], r: 2 },
                { p: "O que significa o motivo de desconexão 'User Request' no histórico?", opts: ["Rompimento de fibra", "Falha na OLT", "O cliente desligou/reiniciou o equipamento manualmente", "Sinal fraco"], r: 2 },
                { p: "Qual a VLAN correta para configurar uma ONU em modo ROUTER (Padrão)?", opts: ["VLAN 400", "VLAN 100", "VLAN 401", "VLAN 50"], r: 2 },
                { p: "Qual o Perfil e VLAN para um cliente que usa Roteador Próprio (Modo Bridge)?", opts: ["Perfil 49 / VLAN 401", "Perfil 50 / VLAN 400", "Perfil 50 / VLAN 401", "Perfil 49 / VLAN 400"], r: 1 },
                { p: "Ao autorizar uma ONU, qual informação técnica é crucial obter com o técnico de campo?", opts: ["A marca do carro dele", "O número da Caixa FTTH e a Porta utilizada", "A metragem do cabo", "A cor da fibra"], r: 1 },
                { p: "Qual a ordem correta para remover uma ONU do sistema em caso de cancelamento?", opts: ["Deletar direto", "Desautorizar ONU > Aguardar Sucesso > Deletar", "Desligar a ONU e Deletar", "Apenas apagar o login"], r: 1 },
                { p: "Para acessar a interface web do roteador do cliente remotamente, onde você clica?", opts: ["No menu financeiro", "No ícone de 'Globo' ou menu do card de Conexão", "No botão de imprimir boleto", "Não é possível acessar remotamente"], r: 1 },
                { p: "Qual o assunto padrão para iniciar um atendimento de suporte no sistema?", opts: ["58 - SEM CONEXÃO", "32 - ATENDIMENTO SUPORTE TÉCNICO", "64 - TROCA DE EQUIPAMENTO", "99 - CANCELAMENTO"], r: 1 },
                { p: "Após o técnico finalizar a visita, qual O.S. o sistema gera automaticamente?", opts: ["O.S. de Cobrança", "O.S. de Pós-Suporte (7 dias)", "O.S. de Auditoria", "Nenhuma"], r: 1 },
                { p: "Qual o risco de enviar um SMS em massa sem filtrar o 'Transmissor'?", opts: ["Nenhum, o sistema bloqueia", "Enviar mensagem para a cidade inteira, gerando pânico desnecessário", "A mensagem chega mais rápido", "O cliente recebe duplicado"], r: 1 },
                { p: "Onde verificamos se o cliente está conectado e há quanto tempo (Sessão)?", opts: ["Na aba Financeiro", "No Google", "No RadAcct / Informações de Conexão", "Na O.S."], r: 2 },
                { p: "Se o sinal do cliente está em -27dBm (Alerta), o que isso indica?", opts: ["Conexão perfeita", "Fibra rompida", "Sinal no limite, pode funcionar mas requer atenção/monitoramento", "Roteador queimado"], r: 2 },
                { p: "Qual técnico 'padrão' utilizamos apenas para cumprir a obrigatoriedade do sistema ao agendar?", opts: ["O técnico da região", "57 - Carlos ou Leandro", "Qualquer um da lista", "O supervisor"], r: 1 },
                { p: "Em qual situação devemos usar o Assunto '58 - SEM CONEXÃO FIBRA'?", opts: ["Para criar o atendimento inicial", "Apenas na etapa de 'Finalizar Wizard' ao gerar a O.S. para o técnico", "Para trocar senha do Wi-Fi", "Para lentidão leve"], r: 1 },
                { p: "Para enviar um aviso de 'Rompimento de Fibra', qual aba do relatório de logins usamos?", opts: ["Aba Imprimir", "Aba CRM", "Aba Filtros", "Aba Gráficos"], r: 1 },
                { p: "O que fazer se o botão 'Diagnóstico' não carregar as informações?", opts: ["Desistir", "Verificar se a ONU está ligada e se há comunicação com a OLT", "Abrir O.S. imediatamente", "Reiniciar o computador do suporte"], r: 1 },
                { p: "Qual a principal função do 'Modo Bridge' na ONU?", opts: ["Melhorar o sinal do Wi-Fi", "Transformar a ONU em apenas um conversor de mídia (ponte), deixando a discagem para um roteador externo", "Bloquear sites", "Aumentar a velocidade"], r: 1 }
            ],

            // TÉCNICO DE CAMPO (Mantido do anterior, focado em fibra/instalação)
            tecnico: [
                { p: "Você mede a saída de um splitter 1:8 balanceado. A entrada é -2dBm. Qual a saída esperada aproximada?", opts: ["-5 dBm", "-11 a -12 dBm (perda de ~9.5dB)", "-20 dBm", "-2 dBm"], r: 1 },
                { p: "Ao fazer uma fusão, a máquina acusa 'Erro de Clivagem'. O que fazer?", opts: ["Fundir mesmo assim", "Aumentar a potência do arco", "Refazer a clivagem garantindo corte a 90º.", "Limpar a lente"], r: 2 },
                { p: "Qual a atenuação média inserida por um conector mecânico mal feito?", opts: ["0.1 dB", "0.5 a 1.5 dB ou mais", "Zero", "Ganho de 2 dB"], r: 1 },
                { p: "O que é uma macrocurvatura e como identificá-la com Power Meter?", opts: ["Cabo dobrado. O sinal cai drasticamente em 1550nm mas menos em 1310nm.", "Cabo cortado", "Sujeira", "Conector solto"], r: 0 },
                { p: "Qual a distância mínima de segurança da rede de média tensão (13.8kV) em dias secos?", opts: ["Pode encostar", "Zona controlada: aprox. 60cm a 1m.", "10cm", "Qualquer uma com luva"], r: 1 },
                { p: "Cliente com sinal -26dBm na ONU. Na CTO o sinal é -18dBm. Onde está o problema?", opts: ["Na OLT", "No Drop (8dB de perda é inaceitável). Trocar drop ou refazer conectores.", "No Roteador", "Na CTO"], r: 1 },
                { p: "Qual o padrão de cor para conector APC?", opts: ["Azul", "Verde", "Preto", "Cinza"], r: 1 },
                { p: "A luz PON está piscando e a LOS apagada. O que significa?", opts: ["Sem sinal", "ONU tentando sincronizar (Sinal fora do range ou não provisionada).", "ONU queimada", "Funcionando normal"], r: 1 },
                { p: "Você encontra uma CTO lotada, mas uma porta tem sinal ruim (-35dBm) e está vaga. Pode usar?", opts: ["Sim", "Não. Porta com defeito/suja. Deve solicitar manutenção ou ampliação.", "Sim, com splitter"], r: 1 },
                { p: "Para que serve o OTDR?", opts: ["Medir voltagem", "Medir potência absoluta", "Identificar eventos (emendas, dobras, fim de fibra) e suas distâncias.", "Ver luz visível"], r: 2 },
                { p: "O que acontece se usar um conector UPC (Azul) em um acoplador APC (Verde)?", opts: ["Nada", "Alta perda de retorno (reflectância) danificando o sinal de vídeo/dados.", "Melhora o sinal", "Encaixa perfeito"], r: 1 },
                { p: "Qual a função do álcool isopropílico?", opts: ["Limpar as mãos", "Limpar a fibra sem deixar resíduos de água/gordura.", "Limpar o carro", "Beber"], r: 1 },
                { p: "Em uma instalação predial, você deve passar o cabo:", opts: ["Junto com a rede elétrica", "Na tubulação de telecom/interfone, evitando interferência e risco elétrico.", "Pelo elevador", "Pela janela"], r: 1 },
                { p: "Cliente reclama que o Wi-Fi não chega no fundo da casa. O técnico deve:", opts: ["Trocar a ONU", "Mudar a senha", "Oferecer solução Mesh ou cabear um segundo ponto (Repetidor).", "Dizer que é assim mesmo"], r: 2 },
                { p: "A máquina de fusão mostra uma bolha na emenda. Causa provável:", opts: ["Arco muito forte", "Sujeira na fibra ou clivagem ruim.", "Bateria fraca", "Vento"], r: 1 },
                { p: "Qual a sequência correta de preparação do cabo drop?", opts: ["Cortar kevlar > Decapar capa > Decapar acrilato > Limpar > Clivar", "Clivar > Limpar > Decapar", "Cortar tudo > Fundir", "Limpar > Decapar > Clivar"], r: 0 },
                { p: "Se o cliente tem um roteador Gamer topo de linha, como configurar a ONU?", opts: ["Modo Router com Wi-Fi ligado", "Modo Bridge, entregando IP público (se disponível) para o roteador dele gerenciar.", "Desligar a ONU", "Modo discado"], r: 1 },
                { p: "O que fazer com as sobras de fibra cortada?", opts: ["Jogar no chão", "Guardar no bolso", "Colocar no descarte específico (garrafa) para evitar acidentes.", "Enterrar"], r: 2 },
                { p: "Qual NR exige o uso de cinto de segurança acima de 2 metros?", opts: ["NR-10", "NR-35", "NR-6", "NR-18"], r: 1 },
                { p: "Ao finalizar, o teste de velocidade bateu 500Mb no cabo, mas 200Mb no celular do cliente. O que explicar?", opts: ["A internet está ruim", "O celular dele é velho", "Limitação da tecnologia Wi-Fi e do aparelho receptor (MIMO). O cabo garante a banda contratada.", "Trocar a senha"], r: 2 }
            ],

            // AUXILIAR (Foco: Segurança e Procedimentos de Apoio)
            auxiliar: [
                { p: "Qual a prioridade máxima ao chegar no local?", opts: ["Abrir a maleta", "Sinalizar a área com cones e fazer a APR (Análise de Risco).", "Pedir água", "Subir na escada"], r: 1 },
                { p: "Você vê o técnico subindo sem amarrar a escada. O que faz?", opts: ["Segura com a mão", "Avisa imediatamente para descer e amarrar.", "Tira foto", "Ignora"], r: 1 },
                { p: "Qual ferramenta corta o elemento de tração (aço) do cabo drop?", opts: ["Tesoura de Kevlar", "Dente", "Alicate Universal (Corte Diagonal).", "Clivador"], r: 2 },
                { p: "Por que não se deve olhar para a ponta da fibra ativa?", opts: ["Ofusca a vista", "O laser é invisível e queima a retina, causando cegueira.", "Dá azar", "Não tem problema"], r: 1 },
                { p: "Qual a função da reserva técnica (Loop) no poste?", opts: ["Estética", "Sobrar cabo para futuras manutenções ou re-fusões.", "Gastar cabo", "Padrão da Enel"], r: 1 },
                { p: "Onde devem ser descartados os pedaços de fibra cortados?", opts: ["No chão", "No bolso", "Em garrafa pet ou recipiente de descarte seguro", "Na caixa de ferramentas"], r: 2 },
                { p: "Para que servem os cones de sinalização?", opts: ["Para reservar vaga", "Para alertar pedestres e veículos sobre a obra, protegendo a equipe.", "Para sentar", "Enfeite"], r: 1 },
                { p: "Qual a cor padrão do conector APC (usado na maioria das redes FTTH)?", opts: ["Azul", "Verde", "Preto", "Amarelo"], r: 1 },
                { p: "Se começar a chover forte com raios durante o serviço, o que fazer?", opts: ["Continuar rápido", "Colocar capa de chuva", "Interromper imediatamente o trabalho externo e buscar abrigo.", "Segurar a escada com força"], r: 2 },
                { p: "Qual o nome do equipamento que emite luz vermelha visível para achar falhas próximas?", opts: ["Power Meter", "VFL (Caneta Óptica)", "Máquina de Fusão", "Lanterna"], r: 1 }
            ],
            
            // AUTONOMO (Copia do técnico, pois a função é similar)
            autonomo: [] 
        };

        // Preenche as categorias que faltam ou complementa as menores
        bancoQuestoes.autonomo = bancoQuestoes.tecnico;
        
        // Se o auxiliar tiver poucas questões, completa com as mais fáceis do técnico
        if(bancoQuestoes.auxiliar.length < 20) {
             bancoQuestoes.auxiliar = bancoQuestoes.auxiliar.concat(bancoQuestoes.tecnico.slice(0, 20 - bancoQuestoes.auxiliar.length));
        }

        let questoesSelecionadas = [];
        let pontuacao = 0;
        let questaoAtualIndex = 0;

        btnIniciar.addEventListener('click', () => {
            if (inputNome.value.trim() === '') {
                alert('Por favor, digite seu nome completo para o certificado.');
                return;
            }
            
            const roleURL = new URLSearchParams(window.location.search).get('role'); 
            // Se não tiver role na URL, assume 'auxiliar' como padrão seguro
            let bancoAlvo = bancoQuestoes[roleURL] ? bancoQuestoes[roleURL] : bancoQuestoes['auxiliar'];

            // SORTEIO: Pega 10 aleatórias das 20 disponíveis para não repetir sempre a mesma prova
            questoesSelecionadas = [...bancoAlvo].sort(() => 0.5 - Math.random()).slice(0, 10);
            
            pontuacao = 0;
            questaoAtualIndex = 0;
            
            avaliacaoInicio.style.display = 'none';
            avaliacaoResultado.style.display = 'none';
            avaliacaoQuiz.style.display = 'block';
            
            mostrarQuestao();
        });

        function mostrarQuestao() {
            if (questaoAtualIndex < questoesSelecionadas.length) {
                const q = questoesSelecionadas[questaoAtualIndex];
                document.getElementById('quiz-progresso').textContent = `Questão ${questaoAtualIndex + 1} de 10`;
                document.getElementById('quiz-pergunta').textContent = q.p;
                
                const container = document.getElementById('quiz-opcoes');
                container.innerHTML = '';
                document.getElementById('quiz-feedback').innerHTML = '';

                q.opts.forEach((opt, idx) => {
                    const btn = document.createElement('button');
                    btn.textContent = opt;
                    btn.className = 'opcao-quiz';
                    btn.addEventListener('click', () => responder(idx, q.r));
                    container.appendChild(btn);
                });
            } else {
                finalizar();
            }
        }

        function responder(idx, correta) {
            const btns = document.querySelectorAll('#quiz-opcoes .opcao-quiz');
            btns.forEach(b => b.disabled = true);
            
            const feedback = document.getElementById('quiz-feedback');
            
            if (idx === correta) {
                pontuacao++;
                btns[idx].classList.add('correta');
                feedback.innerHTML = '<p class="feedback correto">Correto!</p>';
            } else {
                btns[idx].classList.add('errada');
                btns[correta].classList.add('correta'); // Mostra qual era a certa
                feedback.innerHTML = '<p class="feedback incorreto">Incorreto!</p>';
            }
            
            // Aguarda 2 segundos para o usuário ler o feedback antes de pular
            setTimeout(() => {
                questaoAtualIndex++;
                mostrarQuestao();
            }, 2000);
        }

        function finalizar() {
            avaliacaoQuiz.style.display = 'none';
            avaliacaoResultado.style.display = 'block';
            
            const pct = (pontuacao / 10) * 100;
            const placar = document.getElementById('resultado-placar');
            const msg = document.getElementById('resultado-mensagem');
            const btnCert = document.getElementById('btn-gerar-certificado');
            
            // Remove botões antigos de retry se existirem
            const oldRetry = document.getElementById('btn-retry');
            if(oldRetry) oldRetry.remove();

            placar.textContent = `Nota Final: ${pontuacao}/10 (${pct}%)`;
            
            if (pct >= 70) {
                placar.className = 'resultado-placar aprovado';
                msg.innerHTML = '<strong>Parabéns! Aprovado.</strong><br>Você demonstrou o conhecimento necessário.';
                btnCert.style.display = 'block';
                btnCert.onclick = gerarPDF;
            } else {
                placar.className = 'resultado-placar reprovado';
                msg.innerHTML = '<strong>Não atingiu a média (70%).</strong><br>Revise o conteúdo dos módulos e tente novamente.';
                btnCert.style.display = 'none';
                
                // Botão para reiniciar a trilha
                const btnRetry = document.createElement('button');
                btnRetry.id = 'btn-retry';
                btnRetry.textContent = "Reiniciar Trilha / Tentar Novamente";
                btnRetry.className = "btn-prev";
                btnRetry.style.marginTop = "20px";
                btnRetry.style.backgroundColor = "#6c757d";
                btnRetry.style.color = "#fff";
                btnRetry.style.border = "none";
                
                const roleURL = new URLSearchParams(window.location.search).get('role');
                
                // Redireciona para o início da trilha correspondente
                btnRetry.onclick = () => {
                    if (roleURL === 'suporte') window.location.href = 'modulo1-suporte.html?role=suporte';
                    else if (roleURL === 'tecnico') window.location.href = 'modulo1-tecnico.html?role=tecnico';
                    else if (roleURL === 'auxiliar') window.location.href = 'modulo1.html?role=auxiliar';
                    else window.location.href = 'menu-integracao.html';
                };
                
                avaliacaoResultado.appendChild(btnRetry);
            }
        }

        function gerarPDF() {
            if (!window.jspdf || !window.jspdf.jsPDF) { 
                alert('Erro: Biblioteca PDF não carregada. Verifique sua conexão.'); 
                return; 
            }
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
            
            const nome = inputNome.value;
            const w = doc.internal.pageSize.getWidth();
            const h = doc.internal.pageSize.getHeight();
            
            // Fundo Branco
            doc.setFillColor(255, 255, 255);
            doc.rect(0, 0, w, h, 'F');
            
            // Borda Azul Ti.Net
            doc.setDrawColor(6, 22, 51); 
            doc.setLineWidth(3);
            doc.rect(10, 10, w-20, h-20);
            
            // Cabeçalho
            doc.setFont('times', 'bold');
            doc.setFontSize(36);
            doc.setTextColor(6, 22, 51);
            doc.text("CERTIFICADO DE CONCLUSÃO", w/2, 60, { align: 'center' });
            
            // Nome do Colaborador
            doc.setFontSize(28);
            doc.setTextColor(0, 153, 204); // Azul Claro
            doc.text(nome.toUpperCase(), w/2, 95, { align: 'center' });
            
            // Texto do corpo
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(16);
            doc.setTextColor(80, 80, 80);
            
            const roleURL = new URLSearchParams(window.location.search).get('role');
            let cargoTexto = "Colaborador";
            if(roleURL === 'suporte') cargoTexto = "Suporte Técnico N1";
            if(roleURL === 'tecnico') cargoTexto = "Técnico de Campo";
            if(roleURL === 'auxiliar') cargoTexto = "Auxiliar Técnico";

            doc.text(`Concluiu com êxito a trilha de capacitação para a função de`, w/2, 120, { align: 'center' });
            doc.setFont('helvetica', 'bold');
            doc.text(cargoTexto, w/2, 130, { align: 'center' });
            
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(12);
            doc.text(`Nota Final: ${pontuacao}/10 - Aproveitamento Aprovado`, w/2, 145, { align: 'center' });
            
            // Data e Assinatura Digital
            const hoje = new Date().toLocaleDateString('pt-BR');
            doc.text(`Ti.Net Tecnologia - Emitido em: ${hoje}`, w/2, 170, { align: 'center' });

            doc.save(`Certificado_TiNet_${nome.replace(/\s+/g, '_')}.pdf`);
        }
    }
});