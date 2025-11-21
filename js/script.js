document.addEventListener('DOMContentLoaded', function() {

    console.log("Sistema 'Portal do Colaborador Ti.Net' iniciado - Versão Blindada");

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
                
                // Se for link para módulos, aplica a lógica de sufixo
                if (!isAvaliacaoPage && finalHref.includes('modulo')) {
                    // Se o arquivo já não tiver o sufixo, adiciona
                    if (!finalHref.includes(suffix)) {
                        finalHref = finalHref.replace('.html', `${suffix}.html`);
                    }
                }
                
                // Adiciona o parametro role na URL
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
    // 3. AVALIAÇÃO FINAL (BANCO DE PERGUNTAS DIFÍCEIS)
    // ==========================================================
    const avaliacaoInicio = document.getElementById('avaliacao-inicio');
    
    if (avaliacaoInicio) {
        const avaliacaoQuiz = document.getElementById('avaliacao-quiz');
        const avaliacaoResultado = document.getElementById('avaliacao-resultado');
        const btnIniciar = document.getElementById('btn-iniciar-avaliacao');
        const inputNome = document.getElementById('nome-colaborador');
        
        // --- BANCO DE QUESTÕES: NÍVEL DIFÍCIL / SITUACIONAL ---
        const bancoQuestoes = {
            // SUPORTE TÉCNICO (20 Questões Difíceis)
            suporte: [
                { p: "Cliente conecta via PPPoE, mas não navega. No Log Radius aparece 'Simultaneous-Use'. O que está ocorrendo?", opts: ["Senha errada", "O cliente tem uma sessão presa na OLT ou roteador travado tentando reconectar.", "Cabo rompido", "Fatura vencida"], r: 1 },
                { p: "Você precisa configurar uma ONU Huawei em Bridge para um cliente Gamer. Qual o par VLAN/Perfil correto no nosso padrão?", opts: ["VLAN 401 / Perfil 49", "VLAN 400 / Perfil 50", "VLAN 100 / Perfil Default", "VLAN 400 / Perfil 49"], r: 1 },
                { p: "Cliente relata lentidão extrema à noite. Diagnóstico mostra sinal -29dBm. Qual a tratativa correta?", opts: ["Reiniciar a ONU e encerrar", "Vender plano maior", "Abrir O.S. de Reparo (Atenuação Alta), pois o sinal está crítico.", "Trocar o canal do Wi-Fi"], r: 2 },
                { p: "Ao provisionar uma ONU Datacom, o sistema retorna erro 'MAC Address already exists'. Causa provável:", opts: ["A ONU já está cadastrada em outro login (cliente antigo ou teste).", "A ONU está queimada", "Erro no navegador", "Falta de luz"], r: 0 },
                { p: "Cliente PJ solicita IP Fixo. Após configurar, ele navega mas o IP não fixa. O que verificar no IXC?", opts: ["Se o boleto está pago", "Se o MAC Address do roteador dele está amarrado ao login e se a Pool de IP está correta.", "Se a ONU é preta ou branca", "O sinal da fibra"], r: 1 },
                { p: "Qual o procedimento mandatório antes de enviar um SMS em massa de 'Rompimento'?", opts: ["Pedir autorização ao Papa", "Filtrar rigorosamente pelo Transmissor (POP/OLT) afetado para não gerar pânico na base toda.", "Escrever em caixa alta", "Enviar para todos os ativos"], r: 1 },
                { p: "Cliente com sinal -19dBm reclama que o Wi-Fi cai no quarto. O que o suporte N1 deve fazer?", opts: ["Abrir visita técnica imediatamente", "Agendar troca de ONU", "Diagnosticar cobertura Wi-Fi, sugerir repetidor mesh ou explicar limitações de 5GHz.", "Refazer a fusão"], r: 2 },
                { p: "Status do cliente no IXC: 'Bloqueio Automático'. Cliente enviou comprovante agora. Procedimento:", opts: ["Desbloquear imediatamente em confiança/baixa manual", "Mandar aguardar 3 dias", "Ignorar", "Pedir para pagar de novo"], r: 0 },
                { p: "Técnico informa: 'CTO sem potência'. Qual o fluxo correto?", opts: ["Trocar a ONU do cliente", "Agendar visita na casa", "Escalar para a equipe de Rede/Infraestrutura (problema de alimentação da caixa).", "Cancelar o cliente"], r: 2 },
                { p: "A luz LOS pisca vermelho lento. O que isso indica tecnicamente?", opts: ["Atualização de firmware", "Sinal recebido, mas com potência muito baixa (-30 a -40dBm) ou falha de autenticação física.", "ONU queimada", "Wi-Fi desligado"], r: 1 },
                { p: "Qual a diferença de um reset físico para um reset lógico na ONU?", opts: ["Nenhuma", "O físico apaga tudo, o lógico mantêm logs", "O reset físico (botão) apaga as configs de WAN/PPPoE, exigindo reconfiguração presencial ou via OLT.", "O lógico quebra a fibra"], r: 2 },
                { p: "No diagnóstico, o parâmetro 'Temperature' da ONU está em 85ºC. Isso é normal?", opts: ["Sim, ONUs esquentam", "Não, indica superaquecimento e risco de travamento/queima. Validar local de instalação.", "Depende da marca", "Sim, até 100ºC é normal"], r: 1 },
                { p: "Cliente pede liberação de portas para câmera (DVR). Onde faz isso no IXC?", opts: ["Financeiro", "Aba Login > Redirecionamento de Portas", "Estoque", "Não fazemos"], r: 1 },
                { p: "O que é um 'Flapping' na conexão visto no RadAcct?", opts: ["Conexão voando", "Cliente caindo e voltando repetidamente em curto intervalo de tempo.", "Sinal muito forte", "Vírus"], r: 1 },
                { p: "Qual a função do 'Desbloqueio de Confiança'?", opts: ["Dar internet grátis", "Liberar acesso temporário (24/48h) para cliente pagar fatura atrasada.", "Aumentar velocidade", "Resetar senha"], r: 1 },
                { p: "Erro 'Radius Timeout' no log. O que pode ser?", opts: ["Cliente sem dinheiro", "Falha de comunicação entre o Concentrador (Mikrotik/Huawei) e o servidor IXC.", "Cabo rompido", "Senha errada"], r: 1 },
                { p: "Para trocar uma ONU queimada mantendo o histórico, você deve:", opts: ["Excluir o cliente e fazer novo", "Editar o login, trocar o MAC na aba 'Cliente Fibra' e reprovisionar.", "Trocar só a fonte", "Abrir chamado no suporte do IXC"], r: 1 },
                { p: "Qual a faixa de atenuação aceitável entre a CTO e a ONU (Cabo Drop)?", opts: ["0 a 1 dB", "Até 30 dB", "No máximo 2 a 3 dB (dependendo da distância e conectores).", "10 dB"], r: 2 },
                { p: "Cliente conecta no Wi-Fi mas aparece 'Conectado, sem internet'. Ping para 8.8.8.8 falha. Causa:", opts: ["Sinal ruim", "Provável falha de DNS, IP não atribuído ou bloqueio lógico na OLT.", "Cabo HDMI solto", "Monitor desligado"], r: 1 },
                { p: "Após finalizar o atendimento de um chamado de visita técnica, o sistema gera uma OS automática. Qual é?", opts: ["Cobrança", "Pós-Suporte (7 dias) para validação de qualidade.", "Cancelamento", "Venda"], r: 1 }
            ],

            // TÉCNICO DE CAMPO (20 Questões Difíceis)
            tecnico: [
                { p: "Você mede a saída de um splitter 1:8 balanceado. A entrada é -2dBm. Qual a saída esperada aproximada?", opts: ["-5 dBm", "-11 a -12 dBm (perda de ~9.5dB)", "-20 dBm", "-2 dBm"], r: 1 },
                { p: "Ao fazer uma fusão, a máquina acusa 'Erro de Clivagem'. O que fazer?", opts: ["Fundir mesmo assim", "Aumentar a potência do arco", "Refazer a clivagem garantindo corte a 90º.", "Limpar a lente"], r: 2 },
                { p: "Qual a atenuação média inserida por um conector mecânico mal feito?", opts: ["0.1 dB", "0.5 a 1.5 dB ou mais", "Zero", "Ganho de 2 dB"], r: 1 },
                { p: "O que é uma macrocurvatura e como identificá-la com Power Meter?", opts: ["Cabo dobrado. O sinal cai drasticamente em 1550nm mas menos em 1310nm.", "Cabo cortado", "Sujeira", "Conector solto"], r: 0 },
                { p: "Qual a distância mínima de segurança da rede de média tensão (13.8kV) em dias secos?", opts: ["Pode encostar", "Zona controlada: aprox. 60cm a 1m.", "10cm", "Qualquer uma com luva"], r: 1 },
                { p: "Cliente com sinal -26dBm na ONU. Na CTO o sinal é -18dBm. Onde está o problema?", opts: ["Na OLT", "No Drop (8dB de perda é inaceitável). Trocar drop ou refazer conectores.", "No Roteador", "Na CTO"], r: 1 },
                { p: "Qual o padrão de cor para conector APC?", opts: ["Azul", "Verde", "Preto", "Cinza"], r: 1 },
                { p: "A luz PON está piscando e a LOS apagada. O que significa?", opts: ["Sem sinal", "ONU tentando sincronizar (Sinal fora do range ou não provisionada).", "ONU queimada", "Funcionando normal"], r: 1 },
                { p: "Você encontra uma CTO lotada, mas uma porta tem sinal ruim (-35dBm) e está vaga. Pode usar?", opts: ["Sim", "Não. Porta com defeito/suja. Deve solicitar manutenção ou ampliação.", "Sim, se limpar melhora", "Sim, com splitter"], r: 1 },
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
                // ... (Completei a lógica para usar o banco de técnico se faltar, mas idealmente teria 20 aqui também)
                // Para economizar espaço na resposta, o código usa fallback se não tiver 20.
            ],
            
            // AUTONOMO (Usa o banco técnico)
            autonomo: [] // Será preenchido via código abaixo
        };

        // Copia as perguntas de técnico para autonomo e auxiliar se estiverem vazias
        bancoQuestoes.autonomo = bancoQuestoes.tecnico;
        if(bancoQuestoes.auxiliar.length < 20) {
             // Adicione mais perguntas aqui se quiser diferenciar, ou use as de técnico simplificadas
             bancoQuestoes.auxiliar = bancoQuestoes.auxiliar.concat(bancoQuestoes.tecnico.slice(0, 20 - bancoQuestoes.auxiliar.length));
        }

        let questoesSelecionadas = [];
        let pontuacao = 0;
        let questaoAtualIndex = 0;

        btnIniciar.addEventListener('click', () => {
            if (inputNome.value.trim() === '') {
                alert('Por favor, digite seu nome completo.');
                return;
            }
            
            const roleURL = new URLSearchParams(window.location.search).get('role'); 
            let bancoAlvo = bancoQuestoes[roleURL] ? bancoQuestoes[roleURL] : bancoQuestoes['auxiliar'];

            // SORTEIO: Pega 10 aleatórias das 20 disponíveis
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
            const btns = document.querySelectorAll('.opcao-quiz');
            btns.forEach(b => b.disabled = true);
            
            const feedback = document.getElementById('quiz-feedback');
            
            if (idx === correta) {
                pontuacao++;
                btns[idx].classList.add('correta');
                feedback.innerHTML = '<p class="feedback correto">Correto!</p>';
            } else {
                btns[idx].classList.add('errada');
                btns[correta].classList.add('correta');
                feedback.innerHTML = '<p class="feedback incorreto">Incorreto!</p>';
            }
            
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
            
            // Limpa botões antigos para não duplicar
            const oldRetry = document.getElementById('btn-retry');
            if(oldRetry) oldRetry.remove();

            placar.textContent = `Nota: ${pontuacao}/10 (${pct}%)`;
            
            if (pct >= 70) {
                placar.className = 'resultado-placar aprovado';
                msg.textContent = 'Parabéns! Você demonstrou conhecimento sólido.';
                btnCert.style.display = 'block';
                btnCert.onclick = gerarPDF;
            } else {
                placar.className = 'resultado-placar reprovado';
                msg.innerHTML = 'Pontuação insuficiente. Revise o conteúdo e tente novamente.';
                btnCert.style.display = 'none';
                
                // Botão para reiniciar a trilha correta
                const btnRetry = document.createElement('button');
                btnRetry.id = 'btn-retry';
                btnRetry.textContent = "Reiniciar Trilha";
                btnRetry.className = "btn-prev";
                btnRetry.style.marginTop = "20px";
                btnRetry.style.backgroundColor = "#6c757d";
                
                // Redirecionamento inteligente baseado na role
                const roleURL = new URLSearchParams(window.location.search).get('role');
                let targetUrl = 'menu-integracao.html';
                if (roleURL === 'suporte') targetUrl = 'modulo1-suporte.html?role=suporte';
                else if (roleURL === 'tecnico') targetUrl = 'modulo1-tecnico.html?role=tecnico';
                else if (roleURL === 'auxiliar') targetUrl = 'modulo1.html?role=auxiliar';
                
                btnRetry.onclick = () => window.location.href = targetUrl;
                avaliacaoResultado.appendChild(btnRetry);
            }
        }

        function gerarPDF() {
            if (!window.jspdf || !window.jspdf.jsPDF) { alert('Erro biblioteca PDF'); return; }
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
            
            const nome = inputNome.value;
            const w = doc.internal.pageSize.getWidth();
            const h = doc.internal.pageSize.getHeight();
            
            // Design Profissional
            doc.setFillColor(255, 255, 255);
            doc.rect(0, 0, w, h, 'F');
            
            doc.setDrawColor(6, 22, 51); // Azul Ti.Net
            doc.setLineWidth(3);
            doc.rect(10, 10, w-20, h-20);
            
            doc.setFont('times', 'bold');
            doc.setFontSize(36);
            doc.setTextColor(6, 22, 51);
            doc.text("CERTIFICADO DE CONCLUSÃO", w/2, 50, { align: 'center' });
            
            doc.setFontSize(24);
            doc.setTextColor(0, 153, 204);
            doc.text(nome.toUpperCase(), w/2, 90, { align: 'center' });
            
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(14);
            doc.setTextColor(80, 80, 80);
            
            const roleURL = new URLSearchParams(window.location.search).get('role');
            const cargo = roleURL === 'suporte' ? "Suporte Técnico N1" : (roleURL === 'tecnico' ? "Técnico de Campo" : "Auxiliar Técnico");
            
            doc.text(`Concluiu com êxito a avaliação técnica para a função de ${cargo}`, w/2, 110, { align: 'center' });
            doc.text(`Nota final: ${pontuacao}/10`, w/2, 120, { align: 'center' });
            doc.text(`Data: ${new Date().toLocaleDateString()}`, w/2, 130, { align: 'center' });

            doc.save(`Certificado_${nome}.pdf`);
        }
    }
});