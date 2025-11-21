document.addEventListener('DOMContentLoaded', function() {

    console.log("Sistema 'Portal do Colaborador Ti.Net' iniciado!");

    // ==========================================================
    // 1. LÓGICA DE NAVEGAÇÃO E PARÂMETROS URL
    // ==========================================================
    const urlParams = new URLSearchParams(window.location.search);
    const role = urlParams.get('role'); // 'auxiliar', 'tecnico', 'autonomo', 'suporte' ou 'manual'
    const isAvaliacaoPage = window.location.pathname.includes('avaliacao.html');

    if (role) {
        const suffix = (role === 'tecnico' || role === 'autonomo') ? `-${role}` : '';

        document.querySelectorAll('a').forEach(link => {
            const originalHref = link.getAttribute('href');
            
            if (!originalHref || originalHref.startsWith('#') || originalHref.startsWith('javascript') || !originalHref.endsWith('.html')) {
                return;
            }

            try {
                let finalHref = originalHref;
                
                // Aplica sufixo apenas se não for Suporte e não for a página de avaliação
                if (role !== 'suporte' && role !== 'manual' && !isAvaliacaoPage && finalHref.includes('modulo')) {
                    finalHref = finalHref.replace('.html', `${suffix}.html`);
                }
                
                const url = new URL(finalHref, window.location.href);
                url.searchParams.set('role', role);
                link.href = url.href;

            } catch (e) {
                console.error("Erro ao processar link:", originalHref);
            }
        });
    }

    // ==========================================================
    // 2. FUNCIONALIDADES DE INTERFACE (Acordeão, Animações)
    // ==========================================================
    
    // Animação de entrada
    document.querySelectorAll('section').forEach(section => {
        setTimeout(() => section.classList.add('visible'), 100);
    });

    // Menu Acordeão
    document.querySelectorAll('.accordion-header').forEach(button => {
        button.addEventListener('click', () => {
            const content = button.nextElementSibling;
            const isActive = button.classList.contains('active');
            
            if (!isActive) {
                button.classList.add('active');
                content.style.maxHeight = content.scrollHeight + "px";
            } else {
                button.classList.remove('active');
                content.style.maxHeight = null;
            }
        });
    });

    // Simuladores e Botões (Mantidos das versões anteriores)
    document.querySelectorAll('.valor-btn').forEach(botao => {
        botao.addEventListener('click', function() {
            const box = document.getElementById('valor-descricao');
            if(box) { box.innerHTML = `<p>${this.dataset.description}</p>`; box.style.display = 'block'; }
        });
    });

    // Lógica de Steppers (Passo a Passo)
    function initStepper(containerId, prevBtnId, nextBtnId, counterId, progressId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const steps = container.querySelectorAll('[class*="step"]');
        const prevBtn = document.getElementById(prevBtnId);
        const nextBtn = document.getElementById(nextBtnId);
        const counter = document.getElementById(counterId);
        const progress = document.getElementById(progressId);
        let current = 0;

        function update() {
            steps.forEach((s, i) => s.style.display = (i === current) ? 'block' : 'none');
            if(counter) counter.textContent = `Passo ${current + 1} de ${steps.length}`;
            if(progress) progress.style.width = `${(current / (steps.length - 1)) * 100}%`;
            if(prevBtn) prevBtn.disabled = current === 0;
            if(nextBtn) nextBtn.disabled = current === steps.length - 1;
        }

        if(nextBtn) nextBtn.addEventListener('click', () => { if(current < steps.length-1) current++; update(); });
        if(prevBtn) prevBtn.addEventListener('click', () => { if(current > 0) current--; update(); });
        update();
    }
    initStepper('stepper-content', 'prev-btn', 'next-btn', 'step-counter', 'progress-bar-fill');
    initStepper('stepper-content-fusao', 'prev-btn-fusao', 'next-btn-fusao', 'step-counter-fusao', null);

    // ==========================================================
    // 3. AVALIAÇÃO FINAL (BANCO DE 20 PERGUNTAS POR FUNÇÃO)
    // ==========================================================
    const avaliacaoInicio = document.getElementById('avaliacao-inicio');
    
    if (avaliacaoInicio) {
        const avaliacaoQuiz = document.getElementById('avaliacao-quiz');
        const avaliacaoResultado = document.getElementById('avaliacao-resultado');
        const btnIniciar = document.getElementById('btn-iniciar-avaliacao');
        const inputNome = document.getElementById('nome-colaborador');
        
        // --- BANCO DE DADOS DE QUESTÕES ---
        const bancoQuestoes = {
            // AUXILIAR CABISTA (20 Questões)
            auxiliar: [
                { p: "Qual o EPI obrigatório para proteger os olhos de fragmentos de fibra?", opts: ["Óculos de Proteção", "Luvas", "Botas", "Capacete"], r: 0 },
                { p: "Qual a principal função do Auxiliar Cabista?", opts: ["Fazer fusão", "Garantir segurança e organizar materiais", "Configurar a OLT", "Vender planos"], r: 1 },
                { p: "O que significa APR?", opts: ["Aprovação Prévia de Roteiro", "Análise Preliminar de Risco", "Ação Para Rede", "Ajuste Padrão de Rota"], r: 1 },
                { p: "Como deve ser feito o descarte de restos de fibra?", opts: ["No chão", "No lixo comum", "Em recipiente específico (garrafa/pote)", "No bolso"], r: 2 },
                { p: "Qual ferramenta é usada para cortar os fios de Kevlar (aramida)?", opts: ["Alicate Universal", "Estilete", "Tesoura de Kevlar", "Clivador"], r: 2 },
                { p: "Qual produto é usado para limpar a fibra nua?", opts: ["Água", "Saliva", "Álcool Isopropílico", "Veja"], r: 2 },
                { p: "O que é uma CTO?", opts: ["Caixa de Terminação Óptica", "Central Técnica", "Cabo Total", "Conector Tipo O"], r: 0 },
                { p: "O que deve ser feito antes de subir na escada?", opts: ["Amarra-la e verificar a base", "Subir correndo", "Segurar com uma mão", "Nada"], r: 0 },
                { p: "Qual a distância segura da rede elétrica de média tensão?", opts: ["Tocar nela", "10 cm", "Pelo menos 60 cm a 1 metro (zona controlada)", "Qualquer distância"], r: 2 },
                { p: "Para que servem os cones?", opts: ["Para sentar", "Para sinalizar a área de trabalho", "Para guardar cabos", "Decorativo"], r: 1 },
                { p: "O que é um cabo Drop?", opts: ["Cabo submarino", "Cabo que liga a CTO ao cliente", "Cabo de rede elétrica", "Cabo de cobre"], r: 1 },
                { p: "Ao lançar o cabo, qual cuidado principal?", opts: ["Puxar com força", "Não dobrar (quinar) o cabo", "Deixar arrastar no chão", "Dar nós"], r: 1 },
                { p: "O que é OLT?", opts: ["O equipamento na casa do cliente", "A central que envia o sinal (Optical Line Terminal)", "O roteador", "A escada"], r: 1 },
                { p: "Pode-se trabalhar em altura durante chuva com raios?", opts: ["Sim, se for rápido", "Sim, com capa de chuva", "Não, é proibido e perigoso", "Talvez"], r: 2 },
                { p: "Qual a função da jugular no capacete?", opts: ["Enfeite", "Prender o capacete para não cair", "Aquecer", "Proteger o pescoço"], r: 1 },
                { p: "Onde o cinto de segurança deve ser ancorado?", opts: ["No degrau da escada", "No pescoço", "Em ponto firme no poste ou corda de vida", "Não precisa"], r: 2 },
                { p: "O que fazer se a ferramenta cair lá de cima?", opts: ["Gritar", "Descer para pegar", "Ter isolado a área antes para ninguém se machucar", "Deixar lá"], r: 2 },
                { p: "Quem é o responsável por guiar o cabo no chão?", opts: ["O cliente", "O técnico que está no poste", "O Auxiliar", "Ninguém"], r: 2 },
                { p: "O que é ONT?", opts: ["O modem/equipamento no cliente", "O poste", "A ferramenta de corte", "O carro"], r: 0 },
                { p: "Qual a cor do conector padrão APC (o mais comum)?", opts: ["Azul", "Verde", "Preto", "Vermelho"], r: 1 }
            ],

            // TÉCNICO CABISTA (20 Questões)
            tecnico: [
                { p: "Qual a faixa de sinal ideal na casa do cliente?", opts: ["-15 a -25 dBm", "-30 a -40 dBm", "0 a -10 dBm", "Positivo"], r: 0 },
                { p: "O que significa LOS vermelho na ONT?", opts: ["Atualizando", "Sinal excelente", "Perda de Sinal (Loss of Signal)", "Wi-Fi desligado"], r: 2 },
                { p: "Qual a perda média aceitável em uma fusão?", opts: ["0.50 dB", "0.05 dB ou menos", "1.0 dB", "2.0 dB"], r: 1 },
                { p: "Para que serve o OTDR?", opts: ["Medir voltagem", "Medir distância de rompimentos e eventos na fibra", "Configurar Wi-Fi", "Cortar fibra"], r: 1 },
                { p: "Qual NR regulamenta trabalho em altura?", opts: ["NR-10", "NR-35", "NR-18", "NR-6"], r: 1 },
                { p: "O que fazer se o sinal na CTO estiver -32dBm?", opts: ["Instalar assim mesmo", "Trocar o drop", "Escalar para rede/verificar splitter (problema na rede)", "Trocar a ONT"], r: 2 },
                { p: "Qual a função da reserva técnica?", opts: ["Sobra de cabo para manutenções futuras", "Erro de medida", "Cabo extra para vender", "Enfeite no poste"], r: 0 },
                { p: "O que é atenuação?", opts: ["Aumento de sinal", "Perda de potência do sinal óptico", "Velocidade da luz", "Configuração de IP"], r: 1 },
                { p: "Qual conector gera menos reflexão (melhor polimento)?", opts: ["PC (Azul)", "APC (Verde)", "Flat", "RJ45"], r: 1 },
                { p: "Se a luz PON pisca, o que indica?", opts: ["Sinal sincronizado", "Tentando sincronizar (Sinal ruim ou não autorizado)", "Sem energia", "Rompimento total"], r: 1 },
                { p: "Qual a primeira coisa a fazer ao finalizar a instalação?", opts: ["Ir embora", "Medir o sinal final e testar a navegação", "Pedir água", "Dormir"], r: 1 },
                { p: "O que é macrocurvatura?", opts: ["Uma dobra acentuada que causa perda de sinal", "Um tipo de fibra", "Uma ferramenta", "Um poste curvo"], r: 0 },
                { p: "Qual a função do Power Meter?", opts: ["Medir distância", "Medir potência do sinal óptico", "Fundir fibra", "Medir eletricidade"], r: 1 },
                { p: "O que fazer se a fusão tiver bolhas?", opts: ["Deixar assim", "Refazer a fusão", "Passar fita isolante", "Pintar"], r: 1 },
                { p: "Qual NR fala de eletricidade?", opts: ["NR-35", "NR-10", "NR-12", "NR-5"], r: 1 },
                { p: "O que é clivagem?", opts: ["Limpeza", "Corte de precisão da fibra em 90 graus", "Decapagem", "Fusão"], r: 1 },
                { p: "Qual a diferença de dB e dBm?", opts: ["Nenhuma", "dBm é potência absoluta, dB é ganho/perda relativa", "dB é voltagem", "dBm é distância"], r: 1 },
                { p: "Por que limpar o conector antes de conectar?", opts: ["Estética", "Evitar sujeira que causa atenuação e danos", "Hábito", "Não precisa"], r: 1 },
                { p: "O técnico é responsável pela segurança de quem?", opts: ["Só a dele", "Da equipe toda (Auxiliar e ele)", "De ninguém", "Do cliente"], r: 1 },
                { p: "Onde registrar os materiais gastos?", opts: ["No caderno", "Na OS dentro do aplicativo", "De cabeça", "Não precisa"], r: 1 }
            ],

            // SUPORTE TÉCNICO (20 Questões)
            suporte: [
                { p: "Qual a faixa de sinal ideal (dBm)?", opts: ["-30 a -40", "-15 a -25", "0 a -10", "Qualquer um"], r: 1 },
                { p: "Sinal -32dBm é considerado:", opts: ["Excelente", "Crítico/Ruim", "Forte demais", "Normal"], r: 1 },
                { p: "VLAN para modo Bridge (Roteador separado):", opts: ["400", "401", "100", "200"], r: 0 },
                { p: "VLAN para modo Router (PPPoE na ONU):", opts: ["400", "401", "50", "10"], r: 1 },
                { p: "Perfil para modo Router:", opts: ["50", "49", "100", "Default"], r: 1 },
                { p: "Perfil para modo Bridge:", opts: ["50", "49", "10", "0"], r: 0 },
                { p: "Onde vejo se o cliente está online?", opts: ["Diagnóstico / RadAcct", "Financeiro", "Estoque", "Mapa"], r: 0 },
                { p: "O que verificar antes de autorizar ONU?", opts: ["Cor do cabo", "Login do cliente e Porta da CTO", "Nome do vizinho", "Saldo"], r: 1 },
                { p: "Como acessar o roteador do cliente remotamente?", opts: ["Indo lá", "Pelo atalho 'Acesso Web' no card de Conexão", "Não é possível", "Ligando"], r: 1 },
                { p: "O que fazer se a ONU queimou?", opts: ["Desautorizar a antiga e autorizar a nova", "Apenas trocar", "Resetar", "Nada"], r: 0 },
                { p: "Para enviar SMS de rompimento, qual filtro usar?", opts: ["Bairro", "Transmissor (POP/OLT)", "Plano", "Idade"], r: 1 },
                { p: "Qual tarefa para 'Sem Conexão'?", opts: ["58 - SEM CONEXÃO", "10 - COBRANÇA", "99 - OUTROS", "01 - INSTALAÇÃO"], r: 0 },
                { p: "O que é RadAcct?", opts: ["Rádio", "Histórico de conexões (Radius Accounting)", "Antena", "Financeiro"], r: 1 },
                { p: "O que fazer após finalizar a O.S.?", opts: ["Nada", "Agendar Pós-Suporte (7 dias)", "Ligar cobrando", "Ir embora"], r: 1 },
                { p: "Como 'derrubar' a conexão travada?", opts: ["Desconectar cliente (Botão vermelho)", "Desligar servidor", "Apagar cliente", "Não tem como"], r: 0 },
                { p: "Significado de LOS na ONU:", opts: ["Loss Of Signal (Perda de Sinal)", "Ligado", "Operando", "Seguro"], r: 0 },
                { p: "Onde fica o cadastro da ONU?", opts: ["Provedor > Clientes Fibra", "Financeiro", "RH", "Fiscal"], r: 0 },
                { p: "Status 'Conectado' mas não navega:", opts: ["Pode ser bloqueio financeiro ou roteador travado", "Cabo rompido", "Sem luz", "Normal"], r: 0 },
                { p: "Botão para ver sinal gráfico:", opts: ["Diagnóstico", "Imprimir", "Editar", "Novo"], r: 0 },
                { p: "Para cancelar um cliente, o que fazer com a ONU?", opts: ["Guardar", "Desautorizar e Deletar do sistema", "Deixar lá", "Bloquear"], r: 1 }
            ],

            // AUTÔNOMO (Usa as mesmas do Técnico + Foco em App)
            autonomo: [
                // ... (Copiar as mesmas 20 do técnico, pois a função é similar tecnicamente) ...
                // Para economizar espaço aqui, vou replicar as 5 primeiras e adicionar específicas de app
                { p: "Qual a primeira ação no App ao ir para o cliente?", opts: ["Chamar", "Iniciar Deslocamento", "Finalizar", "Nada"], r: 1 },
                { p: "Onde baixar materiais no App?", opts: ["Aba Materiais na O.S.", "No caderno", "Whatsapp", "Não precisa"], r: 0 },
                { p: "Sinal ideal:", opts: ["-15 a -25", "-30", "0", "Positivo"], r: 0 },
                { p: "Perda fusão:", opts: ["0.05dB", "1dB", "2dB", "3dB"], r: 0 },
                { p: "NR Altura:", opts: ["NR-35", "NR-10", "NR-5", "NR-1"], r: 0 },
                { p: "O que é CTO?", opts: ["Caixa Terminação", "Centro", "Cabo", "Conector"], r: 0 },
                { p: "Função do OTDR:", opts: ["Medir distância falha", "Medir voltagem", "Cortar", "Limpar"], r: 0 },
                { p: "Cor APC:", opts: ["Verde", "Azul", "Preto", "Cinza"], r: 0 },
                { p: "Cor UPC:", opts: ["Azul", "Verde", "Preto", "Cinza"], r: 0 },
                { p: "Limpeza:", opts: ["Álcool Isopropílico", "Água", "Saliva", "Nada"], r: 0 },
                { p: "Finalizar OS:", opts: ["Coletar assinatura e fechar no app", "Só ir embora", "Avisar no grito", "Mandar sinal de fumaça"], r: 0 },
                { p: "Reserva técnica:", opts: ["Sobra organizada", "Lixo", "Erro", "Presente"], r: 0 },
                { p: "LOS:", opts: ["Sem sinal", "Sinal bom", "Bateria fraca", "Wi-Fi ruim"], r: 0 },
                { p: "Power Meter mede:", opts: ["Potência Luz", "Distância", "Voltagem", "Resistência"], r: 0 },
                { p: "Clivador serve para:", opts: ["Cortar fibra 90 graus", "Desencapar", "Limpar", "Fundir"], r: 0 },
                { p: "Decapador serve para:", opts: ["Tirar capa e acrilato", "Cortar kevlar", "Medir", "Fundir"], r: 0 },
                { p: "Tesoura Kevlar:", opts: ["Cortar aramida", "Cortar fibra", "Cortar papel", "Cortar unha"], r: 0 },
                { p: "Segurança:", opts: ["APR obrigatória", "Opcional", "Só se o chefe ver", "Nunca"], r: 0 },
                { p: "EPI Ocular:", opts: ["Óculos proteção", "Lente contato", "Óculos sol", "Nada"], r: 0 },
                { p: "Transferência de material:", opts: ["Pelo App", "De boca", "Papel", "Não pode"], r: 0 }
            ]
        };

        let questoesSelecionadas = [];
        let pontuacao = 0;
        let questaoAtualIndex = 0;

        btnIniciar.addEventListener('click', () => {
            if (inputNome.value.trim() === '') {
                alert('Por favor, digite seu nome completo.');
                return;
            }
            
            const urlParams = new URLSearchParams(window.location.search);
            const roleURL = urlParams.get('role'); 
            
            // Define qual banco usar com base no parametro role
            // Se não tiver role ou role desconhecida, usa 'auxiliar' como fallback
            let bancoAlvo = bancoQuestoes[roleURL] ? bancoQuestoes[roleURL] : bancoQuestoes['auxiliar'];

            // Sorteia 10 questões
            questoesSelecionadas = bancoAlvo.sort(() => 0.5 - Math.random()).slice(0, 10);
            
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
            }, 1500);
        }

        function finalizar() {
            avaliacaoQuiz.style.display = 'none';
            avaliacaoResultado.style.display = 'block';
            
            const pct = (pontuacao / 10) * 100;
            const placar = document.getElementById('resultado-placar');
            const msg = document.getElementById('resultado-mensagem');
            const btnCert = document.getElementById('btn-gerar-certificado');
            
            placar.textContent = `Nota: ${pontuacao}/10 (${pct}%)`;
            
            if (pct >= 70) {
                placar.className = 'resultado-placar aprovado';
                msg.textContent = 'Aprovado! Gere seu certificado.';
                btnCert.style.display = 'block';
                btnCert.onclick = gerarPDF;
            } else {
                placar.className = 'resultado-placar reprovado';
                msg.textContent = 'Reprovado. Tente novamente.';
                btnCert.style.display = 'none';
            }
        }

        function gerarPDF() {
            if (!window.jspdf || !window.jspdf.jsPDF) { alert('Erro biblioteca PDF'); return; }
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
            
            const nome = inputNome.value;
            const data = new Date().toLocaleDateString('pt-BR');
            const w = doc.internal.pageSize.getWidth();
            const h = doc.internal.pageSize.getHeight();
            
            // Fundo
            doc.setFillColor(250, 250, 250);
            doc.rect(0, 0, w, h, 'F');
            doc.setDrawColor(6, 22, 51); // Azul Ti.Net
            doc.setLineWidth(2);
            doc.rect(10, 10, w-20, h-20);
            
            // Conteúdo
            doc.setFont('times', 'bold');
            doc.setFontSize(40);
            doc.setTextColor(6, 22, 51);
            doc.text("CERTIFICADO", w/2, 60, { align: 'center' });
            
            doc.setFontSize(16);
            doc.setFont('helvetica', 'normal');
            doc.text("Certificamos que", w/2, 80, { align: 'center' });
            
            doc.setFontSize(30);
            doc.setTextColor(0, 153, 204); // Azul claro
            doc.text(nome, w/2, 100, { align: 'center' });
            
            doc.setFontSize(14);
            doc.setTextColor(50, 50, 50);
            doc.text(`Concluiu a trilha de capacitação na Ti.Net Tecnologia com nota ${pontuacao}/10.`, w/2, 120, { align: 'center' });
            doc.text(`Data: ${data}`, w/2, 135, { align: 'center' });
            
            doc.save(`Certificado_${nome}.pdf`);
        }
    }
});