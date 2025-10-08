document.addEventListener('DOMContentLoaded', function() {

    console.log("Sistema 'Trilha do Conector' iniciado!");

    // ==========================================================
    // --- ANIMAÇÃO DE ENTRADA DAS SEÇÕES ---
    // ==========================================================
    const sections = document.querySelectorAll('section');
    if (sections.length > 0) {
        setTimeout(() => {
            sections.forEach(section => {
                section.classList.add('visible');
            });
        }, 100);
    }

    // ==========================================================
    // --- LÓGICA GERAL DOS MÓDULOS ---
    // ==========================================================

    // MÓDULO 1: Fundamentos
    const botoesValor = document.querySelectorAll('.valor-btn');
    const caixaDescricaoValor = document.getElementById('valor-descricao');
    if (botoesValor.length > 0) {
        botoesValor.forEach(botao => {
            botao.addEventListener('click', function() {
                caixaDescricaoValor.innerHTML = `<p>${this.dataset.description}</p>`;
            });
        });
    }

    // MÓDULO 2: Simulador de EPI
    const epiArrastaveis = document.querySelectorAll('.epi-arrastavel');
    const hotspotsEPI = document.querySelectorAll('.hotspot-epi');
    const feedbackEPI = document.getElementById('feedback-epi');
    if (epiArrastaveis.length > 0) {
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
                if (hotspot.classList.contains('validado')) return;
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
    
    // MÓDULO 2: Cenário de Risco
    const hotspotsRisco = document.querySelectorAll('.hotspot');
    const riscoItems = document.querySelectorAll('.risco-item');
    if (hotspotsRisco.length > 0 && riscoItems.length > 0) {
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
    const ferramentaItems = document.querySelectorAll('.ferramenta-item');
    const modalFerramenta = document.getElementById('modal-ferramenta');
    if (ferramentaItems.length > 0 && modalFerramenta) {
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

    // MÓDULO 3: Carrossel de Limpeza (AUTOPLAY)
    const carouselContainer = document.querySelector('.fiber-cleaning-carousel');
    if (carouselContainer) {
        const carouselImages = carouselContainer.querySelectorAll('.carousel-img');
        let currentImageIndex = 0;
        if (carouselImages.length > 1) {
            const showImage = (index) => {
                carouselImages.forEach(img => img.classList.remove('active'));
                carouselImages[index].classList.add('active');
            };
            const nextImage = () => {
                currentImageIndex = (currentImageIndex + 1) % carouselImages.length;
                showImage(currentImageIndex);
            };
            setInterval(nextImage, 3000); 
            showImage(currentImageIndex); 
        }
    }

    // FUNÇÃO GENÉRICA PARA STEPPERS
    function initializeStepper(containerId, stepClass, prevBtnId, nextBtnId, counterId, progressBarId) {
        const stepperContainer = document.getElementById(containerId);
        if (!stepperContainer) return;

        const prevBtn = document.getElementById(prevBtnId);
        const nextBtn = document.getElementById(nextBtnId);
        const steps = stepperContainer.querySelectorAll(`.${stepClass}`);
        const stepCounter = document.getElementById(counterId);
        const progressBarFill = progressBarId ? document.getElementById(progressBarId) : null;
        let currentStep = 0;

        if (steps.length === 0 || !prevBtn || !nextBtn) return;

        function updateView() {
            steps.forEach((step, index) => step.classList.toggle('active', index === currentStep));
            const totalSteps = steps.length;
            if (stepCounter) stepCounter.textContent = `Passo ${currentStep + 1} de ${totalSteps}`;
            if (progressBarFill) progressBarFill.style.width = `${(currentStep / (totalSteps - 1)) * 100}%`;
            prevBtn.disabled = currentStep === 0;
            nextBtn.disabled = currentStep === totalSteps - 1;
        }

        nextBtn.addEventListener('click', () => { if (currentStep < steps.length - 1) currentStep++; updateView(); });
        prevBtn.addEventListener('click', () => { if (currentStep > 0) currentStep--; updateView(); });
        updateView();
    }
    
    initializeStepper('stepper-content', 'step', 'prev-btn', 'next-btn', 'step-counter', 'progress-bar-fill');
    initializeStepper('stepper-content-fusao', 'step-fusao', 'prev-btn-fusao', 'next-btn-fusao', 'step-counter-fusao', null);
    
    // --- LÓGICA CORRIGIDA PARA OS SIMULADOS ---
    function setupSimuladoMultiplaEscolha(selector) {
        const botoes = document.querySelectorAll(selector);
        botoes.forEach(function(botao) {
            botao.addEventListener('click', function() {
                const isCorrect = this.dataset.correta === 'true';
                const questionContainer = this.closest('.questao');
                const feedbackElement = questionContainer.querySelector('.feedback');
                const allButtonsInGroup = questionContainer.querySelectorAll(selector);

                allButtonsInGroup.forEach(btn => btn.disabled = true); // Trava todos os botões

                if (isCorrect) {
                    this.style.backgroundColor = '#d4edda'; // Verde
                    this.style.borderColor = '#155724';
                    feedbackElement.textContent = 'Resposta Correta!';
                    feedbackElement.className = 'feedback correto';
                } else {
                    this.style.backgroundColor = '#f8d7da'; // Vermelho
                    this.style.borderColor = '#721c24';
                    feedbackElement.textContent = 'Resposta Incorreta.';
                    feedbackElement.className = 'feedback incorreto';
                    
                    // Encontra e destaca a resposta correta
                    const correctButton = questionContainer.querySelector(`${selector}[data-correta="true"]`);
                    if (correctButton) {
                        correctButton.style.backgroundColor = '#d4edda';
                        correctButton.style.borderColor = '#155724';
                    }
                }
            });
        });
    }

    setupSimuladoMultiplaEscolha('.opcao-m2, .opcao-m3, .opcao-m4, .opcao-m5-6');
    
    // --- LÓGICA CORRIGIDA PARA SIMULAÇÃO DE ORDEM (MÓDULO 4) ---
    const ordemContainer = document.getElementById('ordem-container');
    if (ordemContainer) {
        const ordemItems = ordemContainer.querySelectorAll('.ordem-item');
        const ordemFeedback = document.getElementById('ordem-feedback');
        let proximaOrdemCorreta = 1;

        ordemItems.forEach(item => {
            item.addEventListener('click', () => {
                if (item.classList.contains('correto')) return;

                const ordemDoItem = parseInt(item.getAttribute('data-ordem'));

                if (ordemDoItem === proximaOrdemCorreta) {
                    item.classList.remove('incorreto');
                    item.classList.add('correto');
                    proximaOrdemCorreta++;
                    ordemFeedback.textContent = 'Correto!';
                    ordemFeedback.className = 'feedback correto';
                    
                    if (proximaOrdemCorreta > ordemItems.length) {
                        ordemFeedback.textContent = 'Sequência completa e correta! Excelente!';
                    }
                } else {
                    item.classList.add('incorreto');
                    ordemFeedback.className = 'feedback incorreto';
                    ordemFeedback.textContent = 'Ordem incorreta. Tente novamente.';
                    
                    setTimeout(() => {
                        item.classList.remove('incorreto');
                    }, 500);
                }
            });
        });
    }

    // MÓDULOS 5 e 6: Carreira
    const etapaBtns = document.querySelectorAll('.etapa-btn');
    const etapaDescricao = document.getElementById('etapa-descricao');
    if (etapaBtns.length > 0) {
        etapaBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                etapaDescricao.innerHTML = `<p>${btn.dataset.descricao}</p>`;
            });
        });
    }

    // ==========================================================
    // --- LÓGICA DA AVALIAÇÃO FINAL (COM MAIS QUESTÕES) ---
    // ==========================================================
    const avaliacaoInicio = document.getElementById('avaliacao-inicio');
    if (avaliacaoInicio) {
        const avaliacaoQuiz = document.getElementById('avaliacao-quiz');
        const avaliacaoResultado = document.getElementById('avaliacao-resultado');
        const btnIniciar = document.getElementById('btn-iniciar-avaliacao');
        const inputNome = document.getElementById('nome-colaborador');

        const bancoDeQuestoes = [
            // Módulo 1 (4 questões)
            { pergunta: "Qual valor da Ti.Net se refere a cuidar das ferramentas e projetos como se fossem seus?", opcoes: ["Honestidade", "Senso de Dono", "Dedicação", "Trabalho em Equipe"], respostaCorreta: 1 },
            { pergunta: "Na arquitetura FTTH, qual equipamento converte o sinal de luz para elétrico na casa do cliente?", opcoes: ["OLT", "CTO", "Drop Cable", "ONT"], respostaCorreta: 3 },
            { pergunta: "Qual o nome do 'cérebro' da rede, localizado na central da empresa?", opcoes: ["ONT", "OLT", "CTO", "Splitter"], respostaCorreta: 1 },
            { pergunta: "O que significa a sigla FTTH?", opcoes: ["Fibra para o Hotel", "Frequência de Transmissão por Hora", "Fibra até a Casa", "Falha Total de Transmissão de Hardware"], respostaCorreta: 2 },
            // Módulo 2 (4 questões)
            { pergunta: "Qual Norma Regulamentadora (NR) trata sobre Segurança em Instalações e Serviços em Eletricidade?", opcoes: ["NR-35 (Altura)", "NR-10 (Eletricidade)", "NR-06 (EPI)", "NR-12 (Máquinas)"], respostaCorreta: 1 },
            { pergunta: "Para trabalhos em postes, qual EPI é essencial contra quedas?", opcoes: ["Capacete com Jugular", "Luvas de Proteção", "Cinto de Segurança tipo Paraquedista", "Botas de Segurança"], respostaCorreta: 2 },
            { pergunta: "Fragmentos de fibra óptica são perigosos porque podem...", opcoes: ["Causar curtos-circuitos", "Atrair raios", "Perfurar a pele e atingir os olhos", "Conduzir eletricidade estática"], respostaCorreta: 2 },
            { pergunta: "Em caso de chuva forte ou raios, o procedimento correto é:", opcoes: ["Continuar o trabalho rapidamente", "Interromper o trabalho imediatamente e procurar abrigo", "Aguardar por 10 minutos antes de continuar", "Usar uma capa de chuva sobre os EPIs"], respostaCorreta: 1 },
            // Módulo 3 (4 questões)
            { pergunta: "Qual ferramenta faz o corte final, perfeitamente a 90 graus, na fibra antes da fusão?", opcoes: ["Tesoura de Kevlar", "Decapador", "Clivador de Precisão", "Alicate de Bico"], respostaCorreta: 2 },
            { pergunta: "A limpeza da fibra nua deve ser feita com qual produto?", opcoes: ["Água e sabão", "Álcool Isopropílico", "Querosene", "Óleo lubrificante"], respostaCorreta: 1 },
            { pergunta: "Kevlar, os fios amarelos de resistência dentro do cabo, deve ser cortado com:", opcoes: ["Estilete", "Alicate de corte comum", "Tesoura para Kevlar", "A própria mão"], respostaCorreta: 2 },
            { pergunta: "Qual o objetivo de usar um decapador de fibra (stripper)?", opcoes: ["Cortar o cabo ao meio", "Remover as camadas de proteção sem danificar o núcleo", "Fazer a fusão óptica", "Medir o sinal"], respostaCorreta: 1 },
            // Módulo 4 (4 questões)
            { pergunta: "Qual a primeira fase da rotina de trabalho, antes mesmo de ir ao cliente?", opcoes: ["Lançamento do Cabo", "Testes e Validação", "Preparação na Base", "Gestão da OS"], respostaCorreta: 2 },
            { pergunta: "Qual faixa de sinal óptico (em dBm) é considerada ideal em um Power Meter?", opcoes: ["-15 a -25", "0 a -10", "-30 a -40", "Acima de 0"], respostaCorreta: 0 },
            { pergunta: "Ao chegar na casa do cliente, qual deve ser a primeira ação do auxiliar?", opcoes: ["Subir no poste imediatamente", "Pedir um copo de água", "Apresentar-se formalmente ao cliente e analisar o local", "Começar a passar o cabo"], respostaCorreta: 2 },
            { pergunta: "A responsabilidade de segurar a escada com firmeza é de quem?", opcoes: ["Do cliente", "Do técnico que está no poste", "Do auxiliar que está no solo", "De ninguém, a escada é estável sozinha"], respostaCorreta: 2 },
            // Módulos 5 e 6 (4 questões)
            { pergunta: "O que é uma 'Reserva Técnica' de cabo?", opcoes: ["Um cabo mais resistente", "Um excesso de cabo enrolado para futuras manutenções", "Um estoque guardado na empresa", "Um tipo de conector"], respostaCorreta: 1 },
            { pergunta: "Qual o padrão de atendimento Ti.Net para a organização de cabos na casa do cliente?", opcoes: ["O mais rápido possível", "Bonita e discreta, sem 'barrigas'", "Deixar solto para o cliente escolher", "Usar abraçadeiras de metal"], respostaCorreta: 1 },
            { pergunta: "Qual dos 3 passos críticos ANTES da fusão óptica garante a remoção de impurezas?", opcoes: ["Decapagem", "Limpeza", "Clivagem", "Medição"], respostaCorreta: 1 },
            { pergunta: "Para evoluir de Auxiliar para Técnico, qual etapa envolve aprender sobre redes e configurações?", opcoes: ["Dominar a função atual", "Aprender a teoria", "Praticar com supervisão", "Comprar novas ferramentas"], respostaCorreta: 1 },
        ];

        let questoesSelecionadas = [];
        let pontuacao = 0;
        let questaoAtualIndex = 0;

        btnIniciar.addEventListener('click', () => {
            if (inputNome.value.trim() === '') {
                alert('Por favor, digite seu nome completo.');
                return;
            }
            // Lógica corrigida: embaralha o banco inteiro e pega os 10 primeiros
            questoesSelecionadas = [...bancoDeQuestoes].sort(() => 0.5 - Math.random()).slice(0, 10);
            
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
            if (indexSelecionado === indexCorreto) {
                pontuacao++;
                botoesOpcao[indexSelecionado].classList.add('correta');
            } else {
                botoesOpcao[indexSelecionado].classList.add('errada');
                botoesOpcao[indexCorreto].classList.add('correta');
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
                alert('Erro: jsPDF não foi carregado corretamente.');
                return;
            }

            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
            
            // --- CORREÇÃO APLICADA AQUI: "dados:" para "data:" ---
            const logoImg = document.getElementById('logo-cert');
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
            doc.text("Certificado", pageWidth / 2, 50, { align: 'center' });
            
            doc.setFont('times', 'normal');
            doc.setFontSize(16);
            doc.setTextColor(51, 51, 51);
            doc.text("Este certificado é concedido a", pageWidth / 2, 70, { align: 'center' });

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(32);
            doc.setTextColor(0, 153, 204);
            doc.text(nomeColaborador, pageWidth / 2, 90, { align: 'center' });

            const textLines = doc.splitTextToSize(
                `por ter concluído com sucesso o treinamento de integração "Trilha do Conector", demonstrando competência nos padrões de qualidade e segurança da Ti.Net Tecnologia.`,
                220
            );
            doc.setFont('times', 'normal');
            doc.setFontSize(14);
            doc.setTextColor(51, 51, 51);
            doc.text(textLines, pageWidth / 2, 110, { align: 'center' });

            doc.setFontSize(12);
            doc.text(`Concluído em: ${dataConclusao}.`, pageWidth / 2, 140, { align: 'center' });

            const signatureY = 170;
            doc.setLineWidth(0.3);
            doc.setDrawColor(100, 100, 100);

            const ceoX = pageWidth / 4 + 10;
            doc.line(ceoX - 35, signatureY, ceoX + 35, signatureY);
            doc.setFont('times', 'bold');
            doc.setFontSize(12);
            doc.text("Diego França", ceoX, signatureY + 8, { align: 'center' });
            doc.setFont('times', 'italic');
            doc.setFontSize(10);
            doc.text("CEO - Ti.Net Tecnologia", ceoX, signatureY + 13, { align: 'center' });
            
            const devX = pageWidth * 3 / 4 - 10;
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