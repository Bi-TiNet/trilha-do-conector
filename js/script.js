document.addEventListener('DOMContentLoaded', function() {

    console.log("Sistema 'Trilha do Conector' iniciado!");

    // ==========================================================
    // --- LÓGICAS GLOBAIS E DE NAVEGAÇÃO ---
    // ==========================================================

    const urlParams = new URLSearchParams(window.location.search);
    const role = urlParams.get('role');
    const isAvaliacaoPage = window.location.pathname.includes('avaliacao.html');

    // --- 1. DINAMIZA O MENU NA PÁGINA DE AVALIAÇÃO ---
    if (isAvaliacaoPage && role === 'tecnico') {
        const navLinks = {
            'nav-mod1': { href: 'modulo1-tecnico.html', text: 'Módulo 1: Fundamentos Téc.' },
            'nav-mod2': { href: 'modulo2-tecnico.html', text: 'Módulo 2: Segurança Avançada' },
            'nav-mod3': { href: 'modulo3-tecnico.html', text: 'Módulo 3: Ferramentas de Precisão' },
            'nav-mod4': { href: 'modulo4-tecnico.html', text: 'Módulo 4: Protocolos' },
            'nav-mod5-6': { href: 'modulo5-6-tecnico.html', text: 'Módulo 5/6: Excelência e Carreira' }
        };

        for (const id in navLinks) {
            const link = document.getElementById(id);
            if (link) {
                link.href = navLinks[id].href;
                link.textContent = navLinks[id].text;
            }
        }
    }

    // --- 2. PROPAGA O PARÂMETRO 'ROLE' PARA TODOS OS LINKS ---
    if (role) {
        document.querySelectorAll('a').forEach(link => {
            try {
                // Processa apenas links relativos que apontam para .html
                if (link.href && new URL(link.href).pathname.endsWith('.html')) {
                    const url = new URL(link.href);
                    url.searchParams.set('role', role);
                    link.href = url.toString();
                }
            } catch (e) {
                // Ignora links inválidos ou que não sejam URLs completas
            }
        });
    }

    // --- 3. ANIMAÇÃO DE ENTRADA DAS SEÇÕES ---
    document.querySelectorAll('section').forEach(section => {
        setTimeout(() => section.classList.add('visible'), 100);
    });


    // ==========================================================
    // --- LÓGICAS INTERATIVAS DOS MÓDULOS ---
    // ==========================================================

    // MÓDULO 1: Fundamentos
    document.querySelectorAll('.valor-btn').forEach(botao => {
        botao.addEventListener('click', function() {
            const caixaDescricaoValor = document.getElementById('valor-descricao');
            if(caixaDescricaoValor) caixaDescricaoValor.innerHTML = `<p>${this.dataset.description}</p>`;
        });
    });

    // MÓDULO 2: Simulador de EPI (Drag and Drop)
    const epiArrastaveis = document.querySelectorAll('.epi-arrastavel');
    if (epiArrastaveis.length > 0) {
        const hotspotsEPI = document.querySelectorAll('.hotspot-epi');
        const feedbackEPI = document.getElementById('feedback-epi');
        let corretos = 0;
        
        epiArrastaveis.forEach(item => {
            item.addEventListener('dragstart', e => {
                if (item.classList.contains('validado')) return e.preventDefault();
                e.dataTransfer.setData('text/plain', item.id);
                setTimeout(() => item.classList.add('dragging'), 0);
            });
            item.addEventListener('dragend', () => item.classList.remove('dragging'));
        });

        hotspotsEPI.forEach(hotspot => {
            hotspot.addEventListener('dragover', e => {
                if (hotspot.classList.contains('validado')) return;
                e.preventDefault();
                hotspot.classList.add('drag-over');
            });
            hotspot.addEventListener('dragleave', () => hotspot.classList.remove('drag-over'));
            hotspot.addEventListener('drop', e => {
                if (hotspot.classList.contains('validado') || !feedbackEPI) return;
                e.preventDefault();
                hotspot.classList.remove('drag-over');
                const draggedId = e.dataTransfer.getData('text/plain');
                const draggedItem = document.getElementById(draggedId);
                
                if (hotspot.dataset.accepts === draggedId) {
                    hotspot.classList.add('validado');
                    hotspot.innerHTML = '✓';
                    draggedItem.classList.add('validado');
                    draggedItem.draggable = false;
                    feedbackEPI.className = 'feedback-box sucesso';
                    feedbackEPI.textContent = `Correto! ${draggedItem.textContent} conectado.`;
                    corretos++;
                    if (corretos === epiArrastaveis.length) {
                        feedbackEPI.textContent = 'Excelente! Todos os EPIs foram conectados!';
                    }
                } else {
                    feedbackEPI.className = 'feedback-box erro';
                    feedbackEPI.textContent = 'Ops! Ponto incorreto. Tente novamente.';
                }
                feedbackEPI.style.display = 'block';
                setTimeout(() => { if (corretos < epiArrastaveis.length) feedbackEPI.style.display = 'none'; }, 2500);
            });
        });
    }
    
    // MÓDULO 2: Cenário de Risco Interativo
    const hotspotsRisco = document.querySelectorAll('.hotspot');
    if (hotspotsRisco.length > 0) {
        const riscoItems = document.querySelectorAll('.risco-item');
        const activateElements = (targetId) => {
            riscoItems.forEach(item => item.classList.remove('active'));
            hotspotsRisco.forEach(spot => spot.classList.remove('active'));
            if (targetId) {
                const targetDescription = document.getElementById(targetId);
                const targetHotspot = document.querySelector(`.hotspot[data-target="${targetId}"]`);
                if (targetDescription) targetDescription.classList.add('active');
                if (targetHotspot) targetHotspot.classList.add('active');
            }
        };
        hotspotsRisco.forEach(hotspot => {
            hotspot.addEventListener('click', (e) => {
                e.stopPropagation();
                activateElements(hotspot.dataset.target);
            });
        });
        riscoItems.forEach(item => {
            item.addEventListener('click', () => activateElements(item.id));
        });
    }

    // MÓDULO 3: Modal de Ferramentas
    const modalFerramenta = document.getElementById('modal-ferramenta');
    if (modalFerramenta) {
        const ferramentaItems = document.querySelectorAll('.ferramenta-item');
        const modalCloseBtn = document.getElementById('modal-close');
        const modalImg = document.getElementById('modal-img');
        const modalNome = document.getElementById('modal-nome');
        const modalFuncao = document.getElementById('modal-funcao');
        
        ferramentaItems.forEach(item => {
            item.addEventListener('click', () => {
                modalNome.textContent = item.dataset.nome;
                modalFuncao.textContent = item.dataset.funcao;
                modalImg.src = item.dataset.imagem;
                modalFerramenta.classList.add('visible');
            });
        });
        
        const closeModal = () => modalFerramenta.classList.remove('visible');
        modalCloseBtn.addEventListener('click', closeModal);
        modalFerramenta.addEventListener('click', (e) => { if (e.target === modalFerramenta) closeModal(); });
    }

    // MÓDULO 3: Carrossel de Limpeza
    const carouselContainer = document.querySelector('.fiber-cleaning-carousel');
    if (carouselContainer) {
        const carouselImages = carouselContainer.querySelectorAll('.carousel-img');
        let currentImageIndex = 0;
        if (carouselImages.length > 1) {
            const showImage = (index) => {
                carouselImages.forEach(img => img.classList.remove('active'));
                carouselImages[index].classList.add('active');
            };
            setInterval(() => {
                currentImageIndex = (currentImageIndex + 1) % carouselImages.length;
                showImage(currentImageIndex);
            }, 3000);
        }
    }

    // LÓGICA GENÉRICA PARA STEPPERS (Módulos 4 e 5)
    function initializeStepper(containerId, stepClass, prevBtnId, nextBtnId, counterId, progressBarId) {
        const stepperContainer = document.getElementById(containerId);
        if (!stepperContainer) return;

        const prevBtn = document.getElementById(prevBtnId);
        const nextBtn = document.getElementById(nextBtnId);
        const steps = stepperContainer.querySelectorAll(`.${stepClass}`);
        if (steps.length === 0 || !prevBtn || !nextBtn) return;

        const stepCounter = document.getElementById(counterId);
        const progressBarFill = progressBarId ? document.getElementById(progressBarId) : null;
        let currentStep = 0;

        function updateView() {
            steps.forEach((step, index) => step.classList.toggle('active', index === currentStep));
            if (stepCounter) {
                const text = stepCounter.id.includes('fusao') ? 'Passo' : 'Fase';
                stepCounter.textContent = `${text} ${currentStep + 1} de ${steps.length}`;
            }
            if (progressBarFill) {
                progressBarFill.style.width = `${(currentStep / (steps.length - 1)) * 100}%`;
            }
            prevBtn.disabled = currentStep === 0;
            nextBtn.disabled = currentStep === steps.length - 1;
        }

        nextBtn.addEventListener('click', () => { if (currentStep < steps.length - 1) { currentStep++; updateView(); } });
        prevBtn.addEventListener('click', () => { if (currentStep > 0) { currentStep--; updateView(); } });
        updateView();
    }
    
    initializeStepper('stepper-content', 'step', 'prev-btn', 'next-btn', 'step-counter', 'progress-bar-fill');
    initializeStepper('stepper-content-fusao', 'step-fusao', 'prev-btn-fusao', 'next-btn-fusao', 'step-counter-fusao', null);
    
    // LÓGICA PARA SIMULADOS DE MÚLTIPLA ESCOLHA
    function setupSimuladoMultiplaEscolha(selector) {
        document.querySelectorAll(selector).forEach(botao => {
            botao.addEventListener('click', function() {
                const isCorrect = this.dataset.correta === 'true';
                const questionContainer = this.closest('.questao');
                const feedbackElement = questionContainer.querySelector('.feedback');
                const allButtonsInGroup = questionContainer.querySelectorAll(selector);

                allButtonsInGroup.forEach(btn => btn.disabled = true);

                this.style.borderColor = isCorrect ? '#155724' : '#721c24';
                this.style.backgroundColor = isCorrect ? '#d4edda' : '#f8d7da';
                
                if (isCorrect) {
                    feedbackElement.textContent = 'Resposta Correta!';
                    feedbackElement.className = 'feedback correto';
                } else {
                    feedbackElement.textContent = 'Resposta Incorreta.';
                    feedbackElement.className = 'feedback incorreto';
                    const correctButton = questionContainer.querySelector(`${selector}[data-correta="true"]`);
                    if (correctButton) {
                        correctButton.style.borderColor = '#155724';
                        correctButton.style.backgroundColor = '#d4edda';
                    }
                }
            });
        });
    }

    setupSimuladoMultiplaEscolha('.opcao-m2, .opcao-m3, .opcao-m4, .opcao-m5-6');
    
    // MÓDULO 4: SIMULAÇÃO DE ORDEM
    const ordemContainer = document.getElementById('ordem-container');
    if (ordemContainer) {
        let proximaOrdemCorreta = 1;
        ordemContainer.querySelectorAll('.ordem-item').forEach(item => {
            item.addEventListener('click', () => {
                if (item.classList.contains('correto')) return;
                const ordemFeedback = document.getElementById('ordem-feedback');
                const ordemDoItem = parseInt(item.getAttribute('data-ordem'));

                if (ordemDoItem === proximaOrdemCorreta) {
                    item.classList.remove('incorreto');
                    item.classList.add('correto');
                    proximaOrdemCorreta++;
                    ordemFeedback.textContent = 'Correto!';
                    ordemFeedback.className = 'feedback correto';
                    if (proximaOrdemCorreta > ordemContainer.children.length) {
                        ordemFeedback.textContent = 'Sequência completa e correta! Excelente!';
                    }
                } else {
                    item.classList.add('incorreto');
                    ordemFeedback.className = 'feedback incorreto';
                    ordemFeedback.textContent = 'Ordem incorreta. Tente novamente.';
                    setTimeout(() => item.classList.remove('incorreto'), 500);
                }
            });
        });
    }

    // MÓDULOS 5 e 6: Carreira
    document.querySelectorAll('.etapa-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const etapaDescricao = document.getElementById('etapa-descricao');
            if (etapaDescricao) etapaDescricao.innerHTML = `<p>${btn.dataset.descricao}</p>`;
        });
    });

    // ==========================================================
    // --- LÓGICA DA AVALIAÇÃO FINAL ---
    // ==========================================================
    const avaliacaoInicio = document.getElementById('avaliacao-inicio');
    if (avaliacaoInicio) {
        const avaliacaoQuiz = document.getElementById('avaliacao-quiz');
        const avaliacaoResultado = document.getElementById('avaliacao-resultado');
        const btnIniciar = document.getElementById('btn-iniciar-avaliacao');
        const inputNome = document.getElementById('nome-colaborador');
        const bancoDeQuestoes = {
            geral: [
                { pergunta: "Qual valor da Ti.Net representa agir com transparência e integridade?", opcoes: ["Senso de Dono", "Honestidade", "Dedicação", "Trabalho em Equipe"], respostaCorreta: 1 },
                { pergunta: "O que significa a sigla FTTH?", opcoes: ["Fiber To The House", "Fast To The Home", "Fiber To The Home", "Fibra Total Residencial"], respostaCorreta: 2 },
                { pergunta: "Qual a primeira ação a ser realizada ao chegar em um local de trabalho externo?", opcoes: ["Subir no poste", "Ligar para o cliente", "Realizar a Análise Preliminar de Risco (APR)", "Organizar as ferramentas"], respostaCorreta: 2 },
                { pergunta: "Qual produto é usado para a limpeza correta da fibra nua?", opcoes: ["Água", "Álcool 70%", "Álcool Isopropílico", "Pano seco"], respostaCorreta: 2 },
                { pergunta: "A ferramenta com furos calibrados para remover as capas protetoras da fibra é o:", opcoes: ["Clivador", "Alicate", "Decapador (Stripper)", "Tesoura de Kevlar"], respostaCorreta: 2 },
                { pergunta: "Por que é proibido olhar diretamente para uma fibra ativa?", opcoes: ["A luz é muito forte e ofusca.", "A luz do laser é invisível e pode causar danos permanentes.", "Pode causar choque elétrico.", "Pode queimar a pele."], respostaCorreta: 1 },
                { pergunta: "O que é a 'reserva técnica' de cabo?", opcoes: ["Um cabo extra para o cliente.", "Uma sobra de cabo organizada para manutenções futuras.", "Um cabo de outra operadora.", "Um cabo com defeito que foi trocado."], respostaCorreta: 1 }
            ],
            auxiliar: [
                { pergunta: "Qual é a principal função do Auxiliar Cabista durante uma instalação?", opcoes: ["Realizar a fusão da fibra.", "Configurar a ONT.", "Garantir a segurança, organizar ferramentas e auxiliar o técnico.", "Vender um plano melhor para o cliente."], respostaCorreta: 2 },
                { pergunta: "Quem o auxiliar deve informar sobre os dados da CTO e serial da ONT?", opcoes: ["O cliente", "O Técnico Cabista", "Diretamente para o NOC", "Ninguém, é automático"], respostaCorreta: 1 },
                { pergunta: "Na simulação de ordem de preparação do cabo, qual é o primeiro passo?", opcoes: ["Cortar o Kevlar", "Expor a fibra", "Remover a capa preta com o decapador", "Limpar a fibra"], respostaCorreta: 2 },
                { pergunta: "Ao observar um risco no ambiente (ex: galho de árvore instável), o que o auxiliar deve fazer?", opcoes: ["Ignorar e continuar o trabalho.", "Tentar resolver sozinho.", "Comunicar imediatamente o técnico responsável.", "Anotar para resolver depois."], respostaCorreta: 2 },
                { pergunta: "Qual a maneira correta de guiar o cabo Drop durante o lançamento?", opcoes: ["Deixá-lo arrastar no chão.", "Puxá-lo com força para ir mais rápido.", "Desenrolá-lo com cuidado para não 'quiná-lo' (dobrar).", "Passá-lo por cima de fios elétricos."], respostaCorreta: 2 }
            ],
            tecnico: [
                { pergunta: "Ao medir o sinal na CTO e encontrar -32dBm, qual a conclusão mais provável?", opcoes: ["O problema está no cabo Drop do cliente.", "A ONT do cliente está com defeito.", "O problema está na rede principal, antes da CTO.", "O Power Meter está descalibrado."], respostaCorreta: 2 },
                { pergunta: "De quem é a responsabilidade final de inspecionar os EPIs de toda a equipe antes de um trabalho em altura?", opcoes: ["Do Auxiliar", "Do Técnico de Segurança", "De cada um individualmente", "Do Técnico Cabista líder da equipe"], respostaCorreta: 3 },
                { pergunta: "Qual é o último passo obrigatório para encerrar uma OS no aplicativo InMap Service?", opcoes: ["Ligar para o NOC", "Adicionar os materiais utilizados", "Tirar uma foto da instalação", "Coletar a assinatura do cliente e finalizar a OS"], respostaCorreta: 3 },
                { pergunta: "Uma emenda por fusão é considerada de boa qualidade quando sua perda (atenuação) é, tipicamente:", opcoes: ["Menor que 0.5 dB", "Maior que 1.0 dB", "Menor que 0.05 dB", "Exatamente 0.0 dB"], respostaCorreta: 2 },
                { pergunta: "Qual equipamento cria um 'mapa' gráfico da fibra, indicando a distância exata de rompimentos ou atenuações?", opcoes: ["Power Meter", "Máquina de Fusão", "OTDR", "VFL (Caneta de Luz)"], respostaCorreta: 2 },
                { pergunta: "A luz 'PON' da ONT está piscando. O sinal na PTO é -21dBm. Qual o próximo passo?", opcoes: ["Trocar o cabo Drop, pois o sinal está ruim.", "Contatar o NOC para verificar o provisionamento da ONT.", "Trocar a ONT, pois ela está com defeito.", "Reiniciar o roteador do cliente."], respostaCorreta: 1 },
                { pergunta: "Qual é a faixa de sinal (em dBm) considerada IDEAL em uma instalação?", opcoes: ["Entre -15dBm e -25dBm", "Abaixo de -28dBm", "Acima de -10dBm", "Entre -26dBm e -28dBm"], respostaCorreta: 0 }
            ]
        };
        let questoesSelecionadas = [], pontuacao = 0, questaoAtualIndex = 0;

        btnIniciar.addEventListener('click', () => {
            if (inputNome.value.trim() === '') {
                alert('Por favor, digite seu nome completo.');
                return;
            }
            const urlParams = new URLSearchParams(window.location.search);
            const role = urlParams.get('role') || 'auxiliar';
            let questoesDisponiveis = [...bancoDeQuestoes.geral];
            if (role === 'tecnico' && bancoDeQuestoes.tecnico) {
                questoesDisponiveis.push(...bancoDeQuestoes.tecnico);
            } else if (bancoDeQuestoes.auxiliar) {
                questoesDisponiveis.push(...bancoDeQuestoes.auxiliar);
            }
            questoesSelecionadas = questoesDisponiveis.sort(() => 0.5 - Math.random()).slice(0, 10);
            pontuacao = 0;
            questaoAtualIndex = 0;
            avaliacaoInicio.style.display = 'none';
            avaliacaoResultado.style.display = 'none';
            avaliacaoQuiz.style.display = 'block';
            mostrarQuestao();
        });

        function mostrarQuestao() {
            if (questaoAtualIndex < questoesSelecionadas.length) {
                const questao = questoesSelecionadas[questaoAtualIndex];
                document.getElementById('quiz-progresso').textContent = `Questão ${questaoAtualIndex + 1} de 10`;
                document.getElementById('quiz-pergunta').textContent = questao.pergunta;
                const opcoesContainer = document.getElementById('quiz-opcoes');
                opcoesContainer.innerHTML = '';
                document.getElementById('quiz-feedback').innerHTML = '';
                questao.opcoes.forEach((opcao, index) => {
                    const botao = document.createElement('button');
                    botao.textContent = opcao;
                    botao.className = 'opcao-quiz';
                    botao.addEventListener('click', () => selecionarResposta(index, questao.respostaCorreta));
                    opcoesContainer.appendChild(botao);
                });
            } else {
                mostrarResultado();
            }
        }
        function selecionarResposta(indexSelecionado, indexCorreto) {
            const botoesOpcao = document.querySelectorAll('.opcao-quiz');
            botoesOpcao.forEach(btn => btn.disabled = true);
            const feedbackContainer = document.getElementById('quiz-feedback');
            if (indexSelecionado === indexCorreto) {
                pontuacao++;
                botoesOpcao[indexSelecionado].classList.add('correta');
                feedbackContainer.innerHTML = '<p class="feedback correto">Correto!</p>';
            } else {
                botoesOpcao[indexSelecionado].classList.add('errada');
                botoesOpcao[indexCorreto].classList.add('correta');
                feedbackContainer.innerHTML = '<p class="feedback incorreto">Incorreto!</p>';
            }
            setTimeout(() => {
                questaoAtualIndex++;
                mostrarQuestao();
            }, 2000);
        }
        function mostrarResultado() {
            avaliacaoQuiz.style.display = 'none';
            avaliacaoResultado.style.display = 'block';
            const percentual = (pontuacao / questoesSelecionadas.length) * 100;
            const placarEl = document.getElementById('resultado-placar');
            const mensagemEl = document.getElementById('resultado-mensagem');
            const btnCertificado = document.getElementById('btn-gerar-certificado');
            placarEl.textContent = `Sua pontuação: ${pontuacao} de 10 (${percentual.toFixed(0)}%)`;
            if (percentual >= 70) {
                placarEl.className = 'resultado-placar aprovado';
                mensagemEl.textContent = 'Parabéns, você foi aprovado! Clique abaixo para gerar seu certificado.';
                btnCertificado.style.display = 'block';
                btnCertificado.addEventListener('click', gerarCertificado);
            } else {
                placarEl.className = 'resultado-placar reprovado';
                mensagemEl.textContent = 'Infelizmente, você não atingiu a pontuação mínima. Revise os módulos e tente novamente.';
                btnCertificado.style.display = 'none';
            }
        }
        function gerarCertificado() {
            if (!window.jspdf || !window.jspdf.jsPDF) {
                console.error('Erro: jsPDF não foi carregado corretamente.');
                alert('Ocorreu um erro ao carregar a biblioteca para gerar o PDF.');
                return;
            }
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
            const logoImg = document.getElementById('logo-cert');
            if (!logoImg) {
                alert("Não foi possível gerar o certificado. A imagem da logo não foi encontrada.");
                return;
            }
            const nomeColaborador = inputNome.value;
            const dataConclusao = new Date().toLocaleString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' });
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            doc.setFillColor(248, 249, 250);
            doc.rect(0, 0, pageWidth, pageHeight, 'F');
            doc.setDrawColor(0, 51, 102);
            doc.setLineWidth(1.5);
            doc.rect(10, 10, pageWidth - 20, pageHeight - 20);
            doc.setDrawColor(0, 153, 204);
            doc.setLineWidth(0.5);
            doc.rect(12, 12, pageWidth - 24, pageHeight - 24);
            doc.addImage(logoImg, 'PNG', 20, 20, 50, 19);
            doc.setFont('times', 'bold');
            doc.setFontSize(38);
            doc.setTextColor(0, 51, 102);
            doc.text("Certificado de Conclusão", pageWidth / 2, 55, { align: 'center' });
            doc.setFont('times', 'normal');
            doc.setFontSize(16);
            doc.setTextColor(51, 51, 51);
            doc.text("Certificamos que", pageWidth / 2, 80, { align: 'center' });
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(32);
            doc.setTextColor(0, 153, 204);
            doc.text(nomeColaborador, pageWidth / 2, 100, { align: 'center' });
            const textLines = doc.splitTextToSize(`concluiu com êxito o treinamento de integração "Trilha do Conector", demonstrando competência nos padrões de qualidade e segurança da Ti.Net Tecnologia.`, 220);
            doc.setFont('times', 'normal');
            doc.setFontSize(14);
            doc.setTextColor(51, 51, 51);
            doc.text(textLines, pageWidth / 2, 120, { align: 'center' });
            doc.setFontSize(12);
            doc.text(`Concluído em: ${dataConclusao}. Pontuação: ${pontuacao}/10.`, pageWidth / 2, 150, { align: 'center' });
            const signatureY = 175;
            doc.setLineWidth(0.3);
            doc.setDrawColor(100, 100, 100);
            const ceoX = pageWidth / 4 + 20;
            doc.line(ceoX - 35, signatureY, ceoX + 35, signatureY);
            doc.setFont('times', 'bold');
            doc.setFontSize(12);
            doc.text("Diego França", ceoX, signatureY + 8, { align: 'center' });
            doc.setFont('times', 'italic');
            doc.setFontSize(10);
            doc.text("CEO - Ti.Net Tecnologia", ceoX, signatureY + 13, { align: 'center' });
            const devX = pageWidth * 3 / 4 - 20;
            doc.line(devX - 35, signatureY, devX + 35, signatureY);
            doc.setFont('times', 'bold');
            doc.setFontSize(12);
            doc.text("Daniele França", devX, signatureY + 8, { align: 'center' });
            doc.setFont('times', 'italic');
            doc.setFontSize(10);
            doc.text("Gerente - Ti.Net Tecnologia", devX, signatureY + 13, { align: 'center' });
            doc.save(`Certificado-${nomeColaborador.replace(/ /g, "_")}.pdf`);
        }
    }
});