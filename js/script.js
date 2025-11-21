document.addEventListener('DOMContentLoaded', function() {

    console.log("Sistema 'Portal do Colaborador Ti.Net' iniciado - Versão Final");

    // ==========================================================
    // 1. DETECÇÃO DO AMBIENTE (ROLE)
    // ==========================================================
    // Tenta pegar do atributo data-role no body (mais seguro para avaliações)
    let currentRole = document.body.getAttribute('data-role');
    
    // Se não tiver no body, tenta pegar da URL (para os módulos de aula)
    if (!currentRole) {
        const urlParams = new URLSearchParams(window.location.search);
        currentRole = urlParams.get('role');
    }

    // ==========================================================
    // 2. CORREÇÃO INTELIGENTE DE LINKS
    // ==========================================================
    if (currentRole) {
        // Define sufixos e arquivos alvo baseados na role
        let suffix = '';
        let avaliacaoFile = 'avaliacao-auxiliar.html'; // Padrão

        if (currentRole === 'tecnico') {
            suffix = '-tecnico';
            avaliacaoFile = 'avaliacao-tecnico.html';
        } else if (currentRole === 'autonomo') {
            suffix = '-autonomo';
            avaliacaoFile = 'avaliacao-autonomo.html';
        } else if (currentRole === 'suporte') {
            suffix = '-suporte';
            avaliacaoFile = 'avaliacao-suporte.html';
        }

        document.querySelectorAll('a').forEach(link => {
            const href = link.getAttribute('href');
            
            // Ignora links inválidos ou externos
            if (!href || href.startsWith('#') || href.startsWith('javascript') || !href.endsWith('.html')) return;

            try {
                let newHref = href;

                // Regra 1: Se o link aponta para "avaliacao.html" (genérico), redireciona para o arquivo específico
                if (href.includes('avaliacao.html')) {
                    newHref = avaliacaoFile;
                }
                // Regra 2: Se é um módulo e não tem sufixo, adiciona o sufixo correto (exceto auxiliar)
                else if (href.includes('modulo') && suffix !== '') {
                    if (!href.includes(suffix)) {
                        newHref = href.replace('.html', `${suffix}.html`);
                    }
                }

                // Atualiza o link
                // Adiciona o parâmetro ?role para manter a consistência se o usuário voltar
                const urlObj = new URL(newHref, window.location.href);
                urlObj.searchParams.set('role', currentRole);
                link.href = urlObj.href;

            } catch (e) {
                console.error("Erro ao processar link:", href);
            }
        });
    }

    // ==========================================================
    // 3. INTERFACE (ACORDEÕES E ANIMAÇÕES)
    // ==========================================================
    document.querySelectorAll('section').forEach(section => {
        setTimeout(() => section.classList.add('visible'), 100);
    });

    document.querySelectorAll('.accordion-header').forEach(button => {
        button.addEventListener('click', () => {
            const content = button.nextElementSibling;
            button.classList.toggle('active');
            if (button.classList.contains('active')) {
                content.style.maxHeight = content.scrollHeight + "px";
            } else {
                content.style.maxHeight = null;
            }
        });
    });

    // ==========================================================
    // 4. SIMULADOS RÁPIDOS (DENTRO DOS MÓDULOS)
    // ==========================================================
    const botoesSimulado = document.querySelectorAll('.simulado .opcao-quiz');
    if (botoesSimulado.length > 0) {
        botoesSimulado.forEach(btn => {
            btn.addEventListener('click', function() {
                const parent = this.parentElement;
                const feedback = parent.querySelector('.feedback');
                const isCorrect = this.getAttribute('data-correta') === 'true';
                
                parent.querySelectorAll('.opcao-quiz').forEach(b => b.disabled = true);

                if (isCorrect) {
                    this.style.backgroundColor = '#d4edda';
                    this.style.borderColor = '#28a745';
                    this.style.color = '#155724';
                    feedback.innerHTML = '<strong>Correto!</strong>';
                    feedback.className = 'feedback correto';
                } else {
                    this.style.backgroundColor = '#f8d7da';
                    this.style.borderColor = '#dc3545';
                    this.style.color = '#721c24';
                    feedback.innerHTML = '<strong>Incorreto.</strong>';
                    feedback.className = 'feedback incorreto';
                    
                    // Mostra a certa
                    parent.querySelectorAll('.opcao-quiz').forEach(b => {
                        if(b.getAttribute('data-correta') === 'true') {
                            b.style.backgroundColor = '#d4edda';
                            b.style.border = '1px solid #28a745';
                        }
                    });
                }
            });
        });
    }

    // ==========================================================
    // 5. LÓGICA DA AVALIAÇÃO FINAL
    // ==========================================================
    const avaliacaoInicio = document.getElementById('avaliacao-inicio');
    
    if (avaliacaoInicio) {
        const quizContainer = document.getElementById('avaliacao-quiz');
        const resultContainer = document.getElementById('avaliacao-resultado');
        const btnStart = document.getElementById('btn-iniciar-avaliacao');
        const inputName = document.getElementById('nome-colaborador');
        
        // --- BANCO DE QUESTÕES (GIGANTE) ---
        const dbQuestoes = {
            suporte: [
                { p: "Atalho para pesquisa de clientes no IXC?", opts: ["F5", "F3", "Ctrl+P", "F12"], r: 1 },
                { p: "Dado mais confiável para busca?", opts: ["Nome", "Endereço", "CPF", "Telefone"], r: 2 },
                { p: "Faixa de sinal (RX Power) IDEAL?", opts: ["-15 a -25dBm", "-26 a -30dBm", "> -10dBm", "-30 a -40dBm"], r: 0 },
                { p: "Sinal -31dBm. Ação?", opts: ["Reiniciar", "Vender plano", "O.S. Visita Técnica", "Normal"], r: 2 },
                { p: "Significado de 'User Request'?", opts: ["Rompimento", "Falha OLT", "Cliente desligou/reiniciou", "Sinal fraco"], r: 2 },
                { p: "VLAN para modo ROUTER (Padrão)?", opts: ["400", "100", "401", "50"], r: 2 },
                { p: "Perfil/VLAN para modo BRIDGE?", opts: ["49 / 401", "50 / 400", "50 / 401", "49 / 400"], r: 1 },
                { p: "Dados necessários para autorizar ONU?", opts: ["Carro do técnico", "Caixa FTTH e Porta", "Metragem cabo", "Cor fibra"], r: 1 },
                { p: "Remover ONU: ordem correta?", opts: ["Deletar direto", "Desautorizar > Aguardar > Deletar", "Desligar e Deletar", "Apagar login"], r: 1 },
                { p: "Onde acessar o roteador remotamente?", opts: ["Financeiro", "Card Conexão (Globo/Menu)", "Imprimir", "Impossível"], r: 1 },
                { p: "Assunto padrão de atendimento?", opts: ["58 - SEM CONEXÃO", "32 - ATENDIMENTO SUPORTE", "64 - TROCA", "99 - CANCELAMENTO"], r: 1 },
                { p: "O.S. automática pós-visita?", opts: ["Cobrança", "Pós-Suporte (7 dias)", "Auditoria", "Nenhuma"], r: 1 },
                { p: "Risco de SMS sem filtro 'Transmissor'?", opts: ["Bloqueio", "Enviar p/ cidade toda (Pânico)", "Chega rápido", "Duplicado"], r: 1 },
                { p: "Onde ver tempo de conexão?", opts: ["Financeiro", "Google", "RadAcct", "O.S."], r: 2 },
                { p: "Sinal -27dBm (Alerta) indica?", opts: ["Perfeito", "Rompido", "No limite, requer atenção", "Queimado"], r: 2 },
                { p: "Técnico 'padrão' para agendamento?", opts: ["Da região", "57 - Carlos ou Leandro", "Qualquer um", "Supervisor"], r: 1 },
                { p: "Quando usar Assunto 58?", opts: ["Atendimento inicial", "Finalizar Wizard (Gerar O.S.)", "Trocar senha", "Lentidão"], r: 1 },
                { p: "Aba para enviar SMS?", opts: ["Imprimir", "CRM", "Filtros", "Gráficos"], r: 1 },
                { p: "Diagnóstico não carrega. O que pode ser?", opts: ["Desistir", "ONU desligada/Sem comunicação", "Abrir O.S.", "Reiniciar PC"], r: 1 },
                { p: "Função do Modo Bridge?", opts: ["Melhorar Wi-Fi", "ONU vira conversor (Ponte)", "Bloquear sites", "Velocidade"], r: 1 }
            ],
            tecnico: [
                { p: "Perda média de splitter 1:8?", opts: ["3 dB", "9.5 a 10.5 dB", "15 dB", "0 dB"], r: 1 },
                { p: "Erro de Clivagem na fusão. Ação?", opts: ["Fundir", "Aumentar arco", "Refazer clivagem (90º)", "Limpar lente"], r: 2 },
                { p: "Atenuação de conector mecânico?", opts: ["0.1 dB", "0.3 a 0.5 dB (até mais se ruim)", "Zero", "2 dB"], r: 1 },
                { p: "Identificar macrocurvatura?", opts: ["Sinal cai em 1550nm, menos em 1310nm", "Cabo cortado", "Sujeira", "Solto"], r: 0 },
                { p: "Distância Média Tensão?", opts: ["Tocar", "Zona controlada (~60cm)", "10cm", "Qualquer"], r: 1 },
                { p: "Sinal -26dBm na ONU, -18dBm na CTO. Problema?", opts: ["OLT", "Drop (perda alta)", "Roteador", "CTO"], r: 1 },
                { p: "Cor conector APC?", opts: ["Azul", "Verde", "Preto", "Cinza"], r: 1 },
                { p: "PON piscando, LOS apagado?", opts: ["Sem sinal", "Tentando sincronizar (Não provis./Sinal ruim)", "Queimada", "Normal"], r: 1 },
                { p: "Usar porta com sinal ruim na CTO?", opts: ["Sim", "Não (Solicitar reparo)", "Sim, limpar", "Com splitter"], r: 1 },
                { p: "Função do OTDR?", opts: ["Voltagem", "Potência", "Identificar eventos/distância", "Luz"], r: 2 },
                { p: "Conector Azul (UPC) em Verde (APC)?", opts: ["Nada", "Alta perda retorno (dano sinal)", "Melhora", "Encaixa"], r: 1 },
                { p: "Função Álcool Isopropílico?", opts: ["Mãos", "Limpar fibra (sem resíduo)", "Carro", "Beber"], r: 1 },
                { p: "Passagem em prédio?", opts: ["Com elétrica", "Tubulação telecom", "Elevador", "Janela"], r: 1 },
                { p: "Wi-Fi não chega no fundo. Ação?", opts: ["Trocar ONU", "Senha", "Mesh ou Repetidor Cabeado", "Normal"], r: 2 },
                { p: "Bolha na fusão?", opts: ["Arco forte", "Sujeira/Clivagem ruim", "Bateria", "Vento"], r: 1 },
                { p: "Sequência Drop?", opts: ["Kevlar > Capa > Acrilato > Limpar > Clivar", "Clivar > Limpar", "Cortar > Fundir", "Limpar > Decapar"], r: 0 },
                { p: "Cliente Gamer (Roteador Top). Config?", opts: ["Router", "Bridge", "Desligar", "Discado"], r: 1 },
                { p: "Sobras de fibra?", opts: ["Chão", "Bolso", "Garrafa descarte (Segurança)", "Enterrar"], r: 2 },
                { p: "NR cinto acima de 2m?", opts: ["NR-10", "NR-35", "NR-6", "NR-18"], r: 1 },
                { p: "Velocidade no Wi-Fi baixa, cabo ok?", opts: ["Internet ruim", "Celular velho", "Limitação Wi-Fi (Explicar)", "Senha"], r: 2 }
            ],
            auxiliar: [
                { p: "Prioridade ao chegar?", opts: ["Maleta", "Sinalizar e APR", "Água", "Escada"], r: 1 },
                { p: "Técnico subindo sem amarrar escada?", opts: ["Segurar", "Avisar p/ amarrar", "Foto", "Ignorar"], r: 1 },
                { p: "Ferramenta p/ tração do drop?", opts: ["Tesoura Kevlar", "Dente", "Alicate Corte", "Clivador"], r: 2 },
                { p: "Olhar ponta da fibra?", opts: ["Ofusca", "Queima retina (Cegueira)", "Azar", "Nada"], r: 1 },
                { p: "Função Reserva Técnica?", opts: ["Estética", "Manutenção futura", "Gastar", "Padrão"], r: 1 },
                { p: "Descarte de fibra?", opts: ["Chão", "Bolso", "Garrafa descarte", "Caixa"], r: 2 },
                { p: "Para que servem cones?", opts: ["Vaga", "Sinalizar/Proteger", "Sentar", "Enfeite"], r: 1 },
                { p: "Cor conector APC?", opts: ["Azul", "Verde", "Preto", "Amarelo"], r: 1 },
                { p: "Chuva forte com raios?", opts: ["Continuar", "Capa", "Parar/Abrigo", "Segurar"], r: 2 },
                { p: "Luz vermelha p/ falhas?", opts: ["Power Meter", "VFL (Caneta)", "Fusão", "Lanterna"], r: 1 }
            ],
            autonomo: [
                { p: "Responsável conferência materiais?", opts: ["Almoxarife", "Supervisor", "Eu mesmo", "Auxiliar"], r: 2 },
                { p: "Material extra necessário. Ação?", opts: ["Fazer sem", "Comprar", "Informar gestão", "Cancelar"], r: 2 },
                { p: "PON piscando?", opts: ["Trocar ONU", "Verificar sinal/provisionamento", "Ligar cliente", "Fonte"], r: 1 },
                { p: "Sinal aceitável?", opts: ["Qualquer", "-15 a -25dBm", "-30dBm", "Positivo"], r: 1 },
                { p: "Passar cabo vizinho sem pedir?", opts: ["Rápido", "Não pode (Pedir/Rota alternativa)", "Se pagar", "Ignorar"], r: 1 },
                { p: "Validar link final?", opts: ["Multímetro", "Power Meter", "Alicate", "Notebook"], r: 1 },
                { p: "Quebrou telha?", opts: ["Esconder", "Informar cliente/Reportar", "Culpar vento", "Nada"], r: 1 },
                { p: "Distância Baixa Tensão?", opts: ["Tocar", "Mín 20cm (Segurança)", "5m", "Sem risco"], r: 1 },
                { p: "Fechar OS?", opts: ["Clicar fim", "Materiais, Relatório, Assinatura", "Zap", "Sair"], r: 1 },
                { p: "Conector Fast?", opts: ["Fábrica", "Campo (Manual)", "Energia", "USB"], r: 1 }
            ]
        };

        // Seleciona as questões baseadas no data-role do body
        // Se a role não existir no DB, usa 'auxiliar' como fallback
        let roleKey = currentRole && dbQuestoes[currentRole] ? currentRole : 'auxiliar';
        let questions = dbQuestoes[roleKey];

        // Embaralha e pega 10
        questions = [...questions].sort(() => 0.5 - Math.random()).slice(0, 10);

        let currentQ = 0;
        let score = 0;

        btnStart.addEventListener('click', () => {
            if (inputName.value.trim() === "") {
                alert("Digite seu nome!");
                return;
            }
            avaliacaoInicio.style.display = 'none';
            quizContainer.style.display = 'block';
            loadQuestion();
        });

        function loadQuestion() {
            if (currentQ >= questions.length) {
                finishQuiz();
                return;
            }
            const q = questions[currentQ];
            document.getElementById('quiz-progresso').innerText = `Questão ${currentQ + 1}/10`;
            document.getElementById('quiz-pergunta').innerText = q.p;
            
            const optsDiv = document.getElementById('quiz-opcoes');
            optsDiv.innerHTML = '';
            document.getElementById('quiz-feedback').innerHTML = '';

            q.opts.forEach((opt, idx) => {
                const btn = document.createElement('button');
                btn.className = 'opcao-quiz';
                btn.innerText = opt;
                btn.onclick = () => checkAnswer(idx, q.r, btn);
                optsDiv.appendChild(btn);
            });
        }

        function checkAnswer(selected, correct, btnElement) {
            const allBtns = document.querySelectorAll('#quiz-opcoes button');
            allBtns.forEach(b => b.disabled = true);

            const feedback = document.getElementById('quiz-feedback');

            if (selected === correct) {
                score++;
                btnElement.classList.add('correta');
                feedback.innerHTML = '<span style="color:green; font-weight:bold">Correto!</span>';
            } else {
                btnElement.classList.add('errada');
                allBtns[correct].classList.add('correta');
                feedback.innerHTML = '<span style="color:red; font-weight:bold">Incorreto!</span>';
            }

            setTimeout(() => {
                currentQ++;
                loadQuestion();
            }, 2000);
        }

        function finishQuiz() {
            quizContainer.style.display = 'none';
            resultContainer.style.display = 'block';
            
            const percentage = (score / 10) * 100;
            const placar = document.getElementById('resultado-placar');
            const msg = document.getElementById('resultado-mensagem');
            const btnCert = document.getElementById('btn-gerar-certificado');

            placar.innerText = `Nota: ${score}/10 (${percentage}%)`;
            
            if (percentage >= 70) {
                placar.className = 'resultado-placar aprovado';
                msg.innerHTML = "<strong>Aprovado!</strong> Parabéns pelo desempenho.";
                btnCert.style.display = 'block';
                btnCert.onclick = generateCertificate;
            } else {
                placar.className = 'resultado-placar reprovado';
                msg.innerHTML = "<strong>Reprovado.</strong> Revise o conteúdo e tente novamente.";
                
                const retryBtn = document.createElement('button');
                retryBtn.innerText = "Reiniciar Prova";
                retryBtn.className = "btn-prev";
                retryBtn.style.marginTop = "15px";
                retryBtn.onclick = () => window.location.reload();
                resultContainer.appendChild(retryBtn);
            }
        }

        function generateCertificate() {
            if (!window.jspdf) { alert("Erro PDF"); return; }
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({ orientation: 'landscape' });
            
            const name = inputName.value.toUpperCase();
            const w = doc.internal.pageSize.getWidth();
            
            // Moldura
            doc.setDrawColor(6, 22, 51);
            doc.setLineWidth(3);
            doc.rect(10, 10, w-20, 190);
            
            // Conteúdo
            doc.setFont("helvetica", "bold");
            doc.setFontSize(40);
            doc.setTextColor(6, 22, 51);
            doc.text("CERTIFICADO", w/2, 60, { align: "center" });
            
            doc.setFontSize(20);
            doc.setFont("helvetica", "normal");
            doc.text("Certificamos que", w/2, 80, { align: "center" });
            
            doc.setFontSize(30);
            doc.setTextColor(0, 153, 204);
            doc.text(name, w/2, 100, { align: "center" });
            
            doc.setFontSize(16);
            doc.setTextColor(50, 50, 50);
            
            let roleName = "Colaborador";
            if (currentRole === 'suporte') roleName = "Suporte Técnico";
            if (currentRole === 'tecnico') roleName = "Técnico de Campo";
            if (currentRole === 'autonomo') roleName = "Técnico Parceiro";
            if (currentRole === 'auxiliar') roleName = "Auxiliar Técnico";

            doc.text(`Concluiu com êxito a avaliação de capacitação para:`, w/2, 120, { align: "center" });
            doc.setFont("helvetica", "bold");
            doc.text(roleName, w/2, 130, { align: "center" });
            
            doc.setFont("helvetica", "normal");
            doc.setFontSize(12);
            doc.text(`Aproveitamento: ${score*10}%`, w/2, 145, { align: "center" });
            
            doc.text(`Ti.Net Tecnologia - ${new Date().toLocaleDateString()}`, w/2, 170, { align: "center" });
            
            doc.save(`Certificado_${name.replace(/\s/g, '_')}.pdf`);
        }
    }
});