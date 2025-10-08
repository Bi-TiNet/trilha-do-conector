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
            if (stepCounter) {
                const text = stepCounter.id.includes('fusao') ? 'Passo' : 'Fase';
                stepCounter.textContent = `${text} ${currentStep + 1} de ${totalSteps}`;
            }
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
            // Módulo 1: Fundamentos (4 questões)
            { pergunta: "Qual é a missão da Ti.Net?", opcoes: ["Ser referência em serviço de telecomunicação.", "Vender produtos de automação residencial.", "Levar conectividade e conhecimento às pessoas.", "Atingir o maior número de cidades com fibra."], respostaCorreta: 2 },
            { pergunta: "Qual componente da rede FTTH é conhecido como o 'cérebro' da rede, localizado na central?", opcoes: ["ONT (Optical Network Terminal)", "CTO (Caixa de Terminação Óptica)", "OLT (Optical Line Terminal)", "Drop Cable"], respostaCorreta: 2 },
            { pergunta: "Qual dos valores da Ti.Net significa 'zelar pelo patrimônio da empresa e ter orgulho do resultado final'?", opcoes: ["Responsabilidade", "Senso de Dono", "Honestidade", "Trabalho em Equipe"], respostaCorreta: 1 },
            { pergunta: "Qual é a principal função do Auxiliar Cabista durante uma instalação?", opcoes: ["Realizar a fusão da fibra óptica.", "Configurar o roteador do cliente.", "Garantir a segurança, preparar ferramentas e auxiliar o técnico.", "Fazer o primeiro contato com o cliente para vendas."], respostaCorreta: 2 },

            // Módulo 2: Segurança (4 questões)
            { pergunta: "Qual Norma Regulamentadora (NR) é específica para Trabalho em Altura?", opcoes: ["NR-10", "NR-06", "NR-35", "NR-12"], respostaCorreta: 2 },
            { pergunta: "Por que é estritamente proibido olhar diretamente para a ponta de uma fibra óptica ativa?", opcoes: ["Porque a luz visível pode ofuscar a visão.", "Porque emite um som agudo prejudicial.", "Porque a luz do laser é invisível e pode causar danos permanentes aos olhos.", "Porque pode causar choque elétrico."], respostaCorreta: 2 },
            { pergunta: "Qual EPI é essencial para proteger contra quedas durante o trabalho em postes?", opcoes: ["Óculos de Proteção", "Cinto de Segurança tipo Paraquedista", "Luvas de Proteção", "Capacete com Jugular"], respostaCorreta: 1 },
            { pergunta: "Ao sinalizar uma área de trabalho na rua, qual equipamento é indispensável?", opcoes: ["Fita zebrada", "Escada", "Cones de sinalização", "Caixa de ferramentas"], respostaCorreta: 2 },

            // Módulo 3: Ferramentas (4 questões)
            { pergunta: "Qual ferramenta é usada para fazer um corte preciso de 90 graus na ponta da fibra óptica antes da conexão?", opcoes: ["Tesoura para Kevlar", "Decapador de Fibra (Stripper)", "Alicate de Bico", "Clivador de Precisão"], respostaCorreta: 3 },
            { pergunta: "Para que serve a 'Tesoura para Kevlar'?", opcoes: ["Para cortar a capa preta do cabo Drop.", "Para cortar os fios amarelos de resistência dentro do cabo.", "Para decapar a fibra nua.", "Para cortar o cabo de rede."], respostaCorreta: 1 },
            { pergunta: "Qual material é instalado dentro da casa do cliente para ser o ponto final do cabo Drop?", opcoes: ["ONT (Optical Network Terminal)", "CTO (Caixa de Terminação Óptica)", "OLT (Optical Line Terminal)", "Conector de Campo"], respostaCorreta: 1 },
            { pergunta: "A limpeza da fibra nua, após a decapagem, deve ser feita com:", opcoes: ["Água e sabão", "Um pano seco", "Álcool Isopropílico", "Qualquer tipo de álcool"], respostaCorreta: 2 },

            // Módulo 4: Passo a Passo (4 questões)
            { pergunta: "No aplicativo InMap Service, qual é a PRIMEIRA ação a ser tomada ao iniciar o trajeto para a casa do cliente?", opcoes: ["Chamar Cliente", "Mostrar Localização", "Iniciar Deslocamento", "Reagendar"], respostaCorreta: 2 },
            { pergunta: "Qual é a faixa de sinal óptico (em dBm) considerada IDEAL ao medir com um Power Meter na casa do cliente?", opcoes: ["Entre -5dBm e -14dBm", "Abaixo de -28dBm", "Acima de 0dBm", "Entre -15dBm e -25dBm"], respostaCorreta: 3 },
            { pergunta: "Se a luz 'PON/Link' da ONT está apagada ou piscando, qual é o problema mais provável?", opcoes: ["Problema de senha no roteador.", "Problema de sinal óptico (cabo desconectado ou rompido).", "A ONT está com defeito de fábrica.", "Falta de energia na casa do cliente."], respostaCorreta: 1 },
            { pergunta: "Durante a rotina de instalação, quem é responsável por informar ao Suporte (NOC) os dados da CTO e o serial da ONT?", opcoes: ["O cliente", "O Auxiliar Cabista", "O Técnico Cabista", "O sistema automaticamente"], respostaCorreta: 1 },

            // Módulo 5/6: Avançado (4 questões)
            { pergunta: "Qual é a principal causa de falhas na fusão óptica?", opcoes: ["Limpeza inadequada da fibra.", "Uma clivagem (corte) ruim, que não esteja a 90 graus.", "Usar o decapador incorreto.", "A temperatura do ambiente."], respostaCorreta: 1 },
            { pergunta: "O que é uma 'reserva técnica' de cabo, deixada no poste e perto da casa do cliente?", opcoes: ["Um tipo de cabo mais resistente.", "Um cabo para ser usado em outra instalação.", "Uma sobra de cabo organizada para facilitar manutenções futuras.", "Um cabo que ficou com defeito."], respostaCorreta: 2 },
            { pergunta: "Qual equipamento funciona como um 'radar' para a fibra, informando a distância exata de um rompimento?", opcoes: ["Power Meter", "OTDR (Optical Time Domain Reflectometer)", "Máquina de Fusão", "Multímetro"], respostaCorreta: 1 },
            { pergunta: "Para ser promovido de Auxiliar para Técnico, qual é um dos principais passos na sua jornada de desenvolvimento?", opcoes: ["Apenas dominar a função atual perfeitamente.", "Comprar suas próprias ferramentas.", "Aprender a teoria sobre redes e praticar tarefas complexas com supervisão.", "Fazer amizade com os supervisores."], respostaCorreta: 2 }
        ];

        let questoesSelecionadas = [];
        let pontuacao = 0;
        let questaoAtualIndex = 0;

        btnIniciar.addEventListener('click', () => {
            if (inputNome.value.trim() === '') {
                alert('Por favor, digite seu nome completo.');
                return;
            }
            // Lógica para embaralhar o banco de questões e selecionar as 10 primeiras
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
                document.getElementById('quiz-feedback').innerHTML = ''; // Limpa o feedback anterior
                
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
                alert('Ocorreu um erro ao carregar a biblioteca para gerar o PDF. Verifique o console para mais detalhes.');
                return;
            }

            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
            
            const logoImg = document.getElementById('logo-cert');
            if (!logoImg) {
                console.error("Elemento da logo para o certificado não encontrado (ID: logo-cert).");
                alert("Não foi possível gerar o certificado. A imagem da logo não foi encontrada.");
                return;
            }
            
            const nomeColaborador = inputNome.value;
            const dataConclusao = new Date().toLocaleString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' });
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();

            // Fundo e Bordas
            doc.setFillColor(248, 249, 250); // Um branco levemente acinzentado
            doc.rect(0, 0, pageWidth, pageHeight, 'F');
            doc.setDrawColor(0, 51, 102); // Azul escuro
            doc.setLineWidth(1.5);
            doc.rect(10, 10, pageWidth - 20, pageHeight - 20);
            doc.setDrawColor(0, 153, 204); // Azul claro
            doc.setLineWidth(0.5);
            doc.rect(12, 12, pageWidth - 24, pageHeight - 24);

            // Conteúdo
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

            const textLines = doc.splitTextToSize(
                `concluiu com êxito o treinamento de integração "Trilha do Conector", demonstrando competência nos padrões de qualidade e segurança da Ti.Net Tecnologia.`,
                220
            );
            doc.setFont('times', 'normal');
            doc.setFontSize(14);
            doc.setTextColor(51, 51, 51);
            doc.text(textLines, pageWidth / 2, 120, { align: 'center' });

            doc.setFontSize(12);
            doc.text(`Concluído em: ${dataConclusao}. Pontuação: ${pontuacao}/10.`, pageWidth / 2, 150, { align: 'center' });

            // Assinaturas
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