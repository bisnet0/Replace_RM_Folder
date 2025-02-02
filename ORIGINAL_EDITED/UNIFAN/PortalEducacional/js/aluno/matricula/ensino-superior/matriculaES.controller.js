define(['aluno/matricula/matricula.module',
        'aluno/matricula/matricula.service',
        'aluno/financeiro/financeiro.service',
        'aluno/financeiro/financeiro.factory',
        'cst-customizacao/cst-customizacao.module',
        'cst-customizacao/cst-customizacao.service',
        'aluno/financeiro/lancamentos/lancamentos-pagcartao.controller',
        'utils/edu-enums.constants',
        'utils/edu-utils.factory',
        'aluno/dados-pessoais/documentos/documentos.factory',
        'aluno/dados-pessoais/dados-pessoais.service'
    ], function () {

    'use strict';

    angular
        .module('eduMatriculaModule')
        .controller('EduMatriculaESController', EduMatriculaESController)
        .filter('unique', function() {
            return function(collection, keyname) {
                var output = [],
                    keys = [];

                angular.forEach(collection, function(item) {
                    var key = item[keyname];
                    if(keys.indexOf(key) === -1) {
                        keys.push(key);
                        output.push(item);
                    }
                });
                return output;
             };
          });

    EduMatriculaESController.$inject = ['$scope',
        '$sce',
        '$filter',
        'i18nFilter',
        'eduMatriculaService',
        'totvs.app-notification.Service',
        'eduEnumsConsts',
        'EduFinanceiroService',
        'eduUtilsFactory',
        'EduFinanceiroFactory',
        '$rootScope',
        'eduCustomService',
        'TotvsDesktopContextoCursoFactory',
        'eduDocumentosFactory',
        'eduDadosPessoaisService',
        'eduUtilsService'
    ];

    function EduMatriculaESController($scope,
        $sce,
        $filter,
        i18nFilter,
        eduMatriculaService,
        totvsNotification,
        eduEnumsConsts,
        eduFinanceiroService,
        eduUtilsFactory,
        eduFinanceiroFactory,
        $rootScope,
        eduCustomService,
        TotvsDesktopContextoCursoFactory,
        eduDocumentosFactory,
        eduDadosPessoaisService,
        eduUtilsService
    ) {

        var self = this;
        self.parametrosEducacional = null;

        inicializarVariaveisDasEtapas();

        self.etapas = [];
        self.parametrosMatricula = {};
        self.habilitacoesPLDisponiveis = [];
        self.habilitacaoSelecionada = null;
        self.instrucoesMatriculaHTML = '';
        self.mensagemMatriculaNaoDisponivelHTML = '';
        self.tituloColunaHabilitacaoSerie = i18nFilter('l-habilitacao');
        self.paramsEdu = null;
        self.diasSemana = ['1', '2', '3', '4', '5', '6', '7'];
        self.contextoCurso = {};
        self.tituloContratoFinanceiro = '';
        self.tituloComprovanteMatricula = '';
        self.htmlParaImpressao = '';
        self.larguraColQuadroHorario = 20;
        self.renderizarSlideOut = false;
        self.larguraGridCreditosAcademicos = 4;
        self.startIndexDisciplinaExtra = 1;
        self.endIndexDisciplinaExtra = 20;
        self.botoesInclusaoDisciplina = {
            1: { dia: 'Domingo', disabled: false },
            2: { dia: 'Segunda', disabled: false },
            3: { dia: 'Terça', disabled: false },
            4: { dia: 'Quarta', disabled: false },
            5: { dia: 'Quinta', disabled: false },
            6: { dia: 'Sexta', disabled: false },
            7: { dia: 'Sabado', disabled: false }
        };
        self.assinaturaContrato = {
            arquivo: null,
            geraManifesto: false,
            textoContrato: ''
        };
        self.statusFiador = {
            isNovoFiador: false,
            hasFiador: false,
            hasFoundFiador: false
        };
        self.MascaraSistema = {
            mascaraCEP: '99999-999',
            mascaraTelefone: '(99) 99999?.9999',
            mascaraCPF: '999.999.999-99',
            mascaraCNPJ: '99.999.999/9999-99'
        };
        self.listPaises = [];
        self.listEstados = [];
        self.listMunicipios = [];

        self.retornarEtapaAtual = retornarEtapaAtual;
        self.avancarEtapa = avancarEtapa;
        self.retrocederEtapa = retrocederEtapa;
        self.redirecionar = redirecionar;
        self.realizarMatricula = realizarMatricula;
        self.removerDisciplina = removerDisciplina;
        self.matricularDisciplina = matricularDisciplina;
        self.imprimirRelatorioContrato = imprimirRelatorioContrato;
        self.exibirModalContratoMatricula = exibirModalContratoMatricula;
        self.exibirModalContratoMatriculaManifesto = exibirModalContratoMatriculaManifesto;
        self.exibirModalComprovante = exibirModalComprovante;
        self.formataMoeda = formataMoeda;
        self.aoIniciarEtapaApresentacao = aoIniciarEtapaApresentacao;
        self.aoIniciarEtapaPeriodoLetivo = aoIniciarEtapaPeriodoLetivo;
        self.aoIniciarEtapaFiador = aoIniciarEtapaFiador;
        self.aoIniciarEtapaDisciplinas = aoIniciarEtapaDisciplinas;
        self.aoIniciarEtapaPlanosPagamento = aoIniciarEtapaPlanosPagamento;
        self.aoIniciarEtapaFinalizacao = aoIniciarEtapaFinalizacao;
        self.disciplinaSelecionada = disciplinaSelecionada;
        self.ocultaPainelInformacoesEValidacoes = ocultaPainelInformacoesEValidacoes;
        self.exibePainelErros = exibePainelErros;
        self.adicionarDisciplinaDoHorario = adicionarDisciplinaDoHorario;
        self.minimizaPainelQuadroHorario = minimizaPainelQuadroHorario;
        self.minimizaPainelResumo = minimizaPainelResumo;
        self.minimizaPainelSimulacao = minimizaPainelSimulacao;
        self.possuiDiscNoHorario = possuiDiscNoHorario;
        self.possuiErroValicaoHorario = possuiErroValicaoHorario;
        self.retornaCorFundoQuadroHorario = retornaCorFundoQuadroHorario;
        self.retornaLarguraColunaDisciplinaAdicionada = retornaLarguraColunaDisciplinaAdicionada;
        self.disciplinasDoHorarioModal = disciplinasDoHorarioModal;
        self.exibeModalDisciplinasExtras = exibeModalDisciplinasExtras;
        self.pesquisaDisciplinasExtras = pesquisaDisciplinasExtras;
        self.carregaTodasDisciplinasExtras = carregaTodasDisciplinasExtras;
        self.turmasDisciplinasExtras = turmasDisciplinasExtras;
        self.emitirBoleto = emitirBoleto;
        self.exibirCodigoBarras = exibirCodigoBarras;
        self.exibirDadosCodigoBarras = exibirDadosCodigoBarras;
        self.exibirOpcoesPagamento = exibirOpcoesPagamento;
        self.exibeBtnPagamentoCartao = exibeBtnPagamentoCartao;
        self.exibeBtnPagamentoBoleto = exibeBtnPagamentoBoleto;
        self.exibeBtnPix = exibeBtnPix;
        self.exibirDadosPix = exibirDadosPix;
        self.exibirDadosPagCartao = exibirDadosPagCartao;
        self.calculaPlanoPagamento = calculaPlanoPagamento;
        self.executaTutorialMatricula = executaTutorialMatricula;
        self.verificaDisciplinaAdicionada = verificaDisciplinaAdicionada;
        self.habilitacaoPLSelecionado = habilitacaoPLSelecionado;
        self.convertToInt = convertToInt;
        self.verificaDisciplinaSeFoiMatriculada = verificaDisciplinaSeFoiMatriculada;
        self.filtraHorariosDaTurmaDisc = filtraHorariosDaTurmaDisc;
        self.exibeOcultaFinalSemana = exibeOcultaFinalSemana;
        self.contextoCurso = {};
        self.mensagemErroPainelValidacaoNumeroMinimoCreditos;
        self.mensagemErroPainelValidacaoExcedidoNumeroMaximoCreditos;
        self.redimensionaTamanhoSlideoutSilulacaoPagamento = redimensionaTamanhoSlideoutSilulacaoPagamento;
        self.realizaAssinaturaContratoComToken = realizaAssinaturaContratoComToken;
        self.reenviaEmailTokenAssinaturaContrato = reenviaEmailTokenAssinaturaContrato;
        self.validaTokenAssinaturaContrato = validaTokenAssinaturaContrato;
        self.validaSeDesabilitaBotaoFinalizarMatricula = validaSeDesabilitaBotaoFinalizarMatricula;
        self.ExcluiPagtoCartaoPorMatrizAplicada = false;
        self.pesquisaClienteFornecedor = pesquisaClienteFornecedor;
        self.buscarEnderecoCEP = buscarEnderecoCEP;
        self.onChangeEstado = onChangeEstado;
        self.onChangePais = onChangePais;
        self.setCodigoMunicipio = setCodigoMunicipio;
        self.getListaMunicipios = getListaMunicipios;
        self.formatarColunaStatusFiador = formatarColunaStatusFiador;
        self.criaBotaoControleFiador = criaBotaoControleFiador;
        self.exibirModalFiador = exibirModalFiador;
        self.deletarFiador = deletarFiador;
        self.atualizaCliForFiadorAluno = atualizaCliForFiadorAluno;
        self.insereNovoCliForComoFiador = insereNovoCliForComoFiador;
        self.tituloFiadorFiador = '';
        self.criaHyperLink = criaHyperLink;
        self.formatarColunaObrigatorio = formatarColunaObrigatorio;
        self.formatarColunaDtEntrega = formatarColunaDtEntrega;
        self.criaBotaoUploadArquivos = criaBotaoUploadArquivos;
        self.downloadArquivo = downloadArquivo;
        self.formatarColunaSituacaoDocumento = formatarColunaSituacaoDocumento;
        self.registrarAnexoDocumento = registrarAnexoDocumento;
        self.abrirModalUploadArquivos = abrirModalUploadArquivos;
        self.abrirArquivoAnexado = abrirArquivoAnexado;
        self.trataVisibilidadeEtapaFiadorPorPlanoPgto = trataVisibilidadeEtapaFiadorPorPlanoPgto;
        self.etapaFiadorExcluida = {};
        self.mensagemListaPlanosPagamentoVazia = '';
        self.ehGrupoPrincipal = ehGrupoPrincipal;
        self.getPeriodoMatriculado = getPeriodoMatriculado;

        //Devem ser registrados todas as funções de inicialização, quando uma etapa do wizard é acionada
        self.eventosStateEtapas = {
            'matriculaES.apresentacao': aoIniciarEtapaApresentacao.name,
            'matriculaES.periodo-letivo': 'aoIniciarEtapaPeriodoLetivo',
            'matriculaES.fiador': 'aoIniciarEtapaFiador',
            'matriculaES.disciplinas': 'aoIniciarEtapaDisciplinas',
            'matriculaES.planos-pagamento': 'aoIniciarEtapaPlanosPagamento',
            'matriculaES.finalizacao': 'aoIniciarEtapaFinalizacao'
        };

        init();
        eduCustomService.initPost(this, $rootScope);

        function init() {

            carregarParametrosEducacional();

            self.contextoCurso = TotvsDesktopContextoCursoFactory.getCursoSelecionado();

            self.tituloContratoFinanceiro = i18nFilter('l-titulo-contrato', '[]', 'js/aluno/matricula');

            if (self.contextoCurso && parseInt(self.contextoCurso.cursoSelecionado.APRESENTACAO) !== eduEnumsConsts.EduTipoApresentacaoEnum.EnsinoSuperior) {
                self.mensagemMatriculaNaoDisponivelHTML = i18nFilter('l-acesso-menu-matricula-apresentacao-diferenteES', '[]', 'js/aluno/matricula');
                return;
            }

            eduMatriculaService.inicializarWizardMatriculaEnsinoSuperiorAsync($scope, self.eventosStateEtapas, self.habilitacaoSelecionada, function (etapas, parametrosMatricula) {
                self.etapas = etapas;
                self.parametrosMatricula = parametrosMatricula;
                self.instrucoesMatriculaHTML = $sce.trustAsHtml(parametrosMatricula.InstrucoesMatricula);

                if (parametrosMatricula.MensagemMatriculaNaoDisponivel) {
                    self.mensagemMatriculaNaoDisponivelHTML = $sce.trustAsHtml(parametrosMatricula.MensagemMatriculaNaoDisponivel);
                }
                else {
                    self.mensagemMatriculaNaoDisponivelHTML = i18nFilter('l-msg-matricula-indisponivel', '[]', 'js/aluno/matricula');
                }

                if (parametrosMatricula.TituloContratoFinanceiro) {
                    self.tituloContratoFinanceiro = parametrosMatricula.TituloContratoFinanceiro;
                }

                if (parametrosMatricula.TituloComprovanteMatricula) {
                    self.tituloComprovanteMatricula = parametrosMatricula.TituloComprovanteMatricula;
                }

                self.MascarasSistema = TotvsDesktopContextoCursoFactory.getMascarasSistema();
            });

            exibeMensagemParaDispositivoMovel();
        }

        function inicializarVariaveisDasEtapas(){
            self.disciplinasMatriculadas = [];
            self.disciplinaSelecionadaMatricula = [];
            self.disciplinasSDD = [];
            self.requisitos = [];
            self.horariosTurmaDisc = [];
            self.horariosMatriculados = [];
            self.discDisponiveisHorario = [];
            self.planosPagamentoDisponiveis = [];
            self.planoPagamentoSelecionado = null;
            self.boleto = null;
            self.somaCreditos = 0;
            self.exibePainelValidacoes = false;
            self.exibePainelInformacoes = false;
            self.erroMaxCredito = false;
            self.erroMinCredito = false;
            self.possuiDisciplinaAdicionada = false;
            self.totalDiscObrigatoria = 0;
            self.totalDiscOptEletiva = 0;
            self.totalDiscExtra = 0;
            self.totalDiscEquivalente = 0;
            self.somaCreditosFinanceiros = 0;
            self.possuiHorarioSabado = false;
            self.possuiHorarioDomingo = false;
            self.modoEdicaoQuadroHorario = false;
            self.quadroHorarioMinimizado = false;
            self.resumoMinimizado = true;
            self.possuiErroValidacaoServerMatriculadasCoRequisito = false;
            self.possuiErroValidacaoServerExcluidasCoRequisito = false;
            self.validacaoPreRequisitoDoServidor = false;
            self.mensagemServidorValidacaoPreRequisito = '';
            self.mensagemServidorValidacaoCoRequisito = '';
            self.tooltipMinMaxCreditos = '';
            self.listaIdTurmaDisc = [];
            self.disciplinasExtras = [];
            self.turmasDisciplinasExtras = [];
            self.matricItensList = [];
            self.matricItensValidaRequisitos = [];
            self.matricItensListDel = [];
            self.listaDiscAdd = [];
            self.listaDiscAlteradas = [];
            self.listaDiscSubstituicao = [];
            self.listaHorariosExibidaNoQuadroHorario = [];
            self.erroValidacaoPreCoRequisito = '';
            self.textoContratoFinanceiro = '';
            self.maiorQuantidadeCaracterCodDisciplina = 0;
            self.maiorQuantidadeCaracterNomeDisciplina = 0;
            self.totalErrosClient = 0;
            self.totalErrosServer = 0;
            self.simulacaoMinimizada = true;
            self.bloqueiaInclusaoDisciplina = false;
            self.usuarioVisualizandoFinalSemanaQuadroHorario = false;
            self.exibeOpcaoFinalSemanaQuadroHorario = true;
            self.TokenAssinaturaContratoValido = false;
            self.ExcluiPagtoCartaoPorMatrizAplicada = false;
            self.disciplinasAdicionadasNaGrade = [];
            self.jpegRelatorioContrato = '';
            self.pdfRelatorioContrato = '';
                    self.statusFiador = {
                isNovoFiador: false,
                hasFiador: false,
                hasFoundFiador: false
            };
            self.documentoSelecionado = {};
            self.TokenAssinaturaContratoValido = false;
            self.objRelatorioContrato = {};
        }

        function verificaDisciplinaSeFoiMatriculada(disciplinaDoHorario) {
            return !self.bloqueiaInclusaoDisciplina ||
                   (disciplinaDoHorario.PERMITEINCLUIR && self.disciplinasAdicionadasNaGrade.filter(function (disciplina) {
                                                                                                                            return disciplina.CODDISC == disciplinaDoHorario.CODDISC
                                                                                                                          }).length > 0);
        }

        /**
         * preenche o objeto que refere aos dias da semana, para verificar se aquele dia vai ter o botão "adicionar disciplina"
         */
        function preencheParametroAdicaoDisciplina() {
            self.bloqueiaInclusaoDisciplina = self.paramsEdu && self.paramsEdu.BLOQUEIAINCLUSAODISCIPLINASMATRICULADAS;

            //Solução para IE
            if(!Object.entries) {
                Object.entries = function (obj) {
                    return Object.keys(obj).reduce(function (arr, key) {
                        arr.push([key, obj[key]]);
                        return arr;
                    }, []);
                };
            }

            Object.entries(self.botoesInclusaoDisciplina).forEach(function (botaoDia) {
                botaoDia[1].disabled = !self.bloqueiaInclusaoDisciplina;
            });
        }

        function convertToInt(valor) {
            return parseInt(valor);
        }

        function carregarParametrosEducacional () {
            eduUtilsFactory.getParametrosTOTVSEducacionalAsync(function (paramEdu) {
                self.parametrosEducacional = paramEdu;
            });
        }

        function retornarEtapaAtual() {
            return eduMatriculaService.retornarEtapaAtual(self.etapas);
        }

        function avancarEtapa() {

            trataEtapaApresentacao();

            trataEtapaSelecaoPeriodoLetivo();

            trataEtapaFiador();

            trataEtapaDadosPessoais();

            trataEtapaSelecaoFichaMedica();

            trataEtapaDisciplinas();

            trataEtapaPlanosPagamento();

            trataEtapaDocumentos();
        }

        function trataEtapaDocumentos() {
            if (eduMatriculaService.retornarEtapaAtual(self.etapas).nome === 'matriculaES.documentos') {
                eduDocumentosFactory.validaEntregaDocumentosNaMatricula(self.habilitacaoSelecionada.IDPERLET,
                                                                        self.habilitacaoSelecionada.IDHABILITACAOFILIAL,
                                                                        self.habilitacaoSelecionada.RA,
                                                                        function(retorno) {
                    if (!retorno.SDOCPENDENTES[0].DOCUMENTOSPENDENTES)
                        eduMatriculaService.liberarProximaEtapa(self.etapas);

                    eduMatriculaService.avancarEtapa(self.etapas);
                });
            }
        }

        function trataEtapaApresentacao() {
            if (eduMatriculaService.retornarEtapaAtual(self.etapas).nome == 'matriculaES.apresentacao') {
                liberarProximaEtapaEAvancar();
            }
        }

        function trataEtapaSelecaoPeriodoLetivo() {
            if (eduMatriculaService.retornarEtapaAtual(self.etapas).nome == 'matriculaES.periodo-letivo') {
                self.bloquearMatricula = false;
                if (self.validacoesPLSelecionado === undefined) {
                    return;
                }

                self.validacoesPLSelecionado.forEach(function (item) {
                    if (item.bloquearMatricula) {
                        self.bloquearMatricula = true;
                    }
                }, this);

                if (!self.bloquearMatricula && !self.habilitacaoSelecionada) {
                    self.bloquearMatricula = true;
                }

                if (!self.bloquearMatricula) {
                    eduMatriculaService.liberarProximaEtapa(self.etapas);
                }

                eduMatriculaService.avancarEtapa(self.etapas);
            }
        }

        /**
         *   Todos os documento do fiador vão ser considerados aptos para envio quando:
         *   1) Todos os documentos obrigatórios estiverem preenchidos (fi.IDDOCFIADOR tem que ser diferente de nulo)
         *   2) Todos os documentos preenchidos estiverem com status diferente de 'Recusado' e 'Não entregue' (fi.STATUS)
         */
        function isTodosDocumentosObrigatoriosFiadorForamInformados()
        {
            let listaDocumentosNaoInformados = [];
            let docNaoInformadoFiador = [];

            for (let i = 0; i < self.objListaFiadores.length; i++) {
                docNaoInformadoFiador = self.objListaFiadores[i].objListaDocumentosFiador.filter(
                    fi => fi.IDFIADOR === self.objListaFiadores[i].IDFIADOR &&
                    fi.OBRIGATORIO === eduEnumsConsts.EduSimOuNaoEnum.Sim &&
                    (
                        fi.IDDOCFIADOR === null ||
                        fi.STATUS === eduEnumsConsts.EduStatusDocumentoEntregueEnum.NaoEntregue ||
                        fi.STATUS === eduEnumsConsts.EduStatusDocumentoEntregueEnum.Recusado
                    )
                );
                if (docNaoInformadoFiador.length > 0)
                {
                    listaDocumentosNaoInformados.push(docNaoInformadoFiador);
                }
            }

            return listaDocumentosNaoInformados.length == 0;
        }

        function isPossuiFiadorValido()
        {
            let objFiadoresValidos = self.objListaFiadores.filter(fiador => (fiador.STATUS && ((fiador.STATUS !== eduEnumsConsts.EduStatusFiadorEnum.Reprovado))));

            return objFiadoresValidos.length > 0;
        }

        function liberarProximaEtapaEAvancar(){
            eduMatriculaService.liberarProximaEtapa(self.etapas);
            eduMatriculaService.avancarEtapa(self.etapas);
        }

        function valorLiquidoDoPlanoDePagamentoSelecionado() {
            if(self.habilitacaoSelecionada != null)
                return eduMatriculaService.valorLiquidoDoPlanoDePagamento(self.planosPagamentoDisponiveis,
                    self.planoPagamentoSelecionado);
            else
                return -1;
        }

        function finalizarEtapaFiador(){
            executarContratoMatricula();
        }

        function trataEtapaFiador() {
            if (eduMatriculaService.retornarEtapaAtual(self.etapas).nome == 'matriculaES.fiador') {
                let isFiadorInformado = isPossuiFiadorValido();
                let isDocumentosObrigatoriosPreenchidos = isTodosDocumentosObrigatoriosFiadorForamInformados();

                if (isFiadorInformado && isDocumentosObrigatoriosPreenchidos) {
                    finalizarEtapaFiador();
                }
                else
                {
                    totvsNotification.notify({
                        type: 'error',
                        title: i18nFilter('l-Atencao'),
                        detail: isFiadorInformado ?
                            i18nFilter('l-msg-documento-obrigatorio-nao-informado', [], 'js/aluno/matricula') :
                            i18nFilter('l-msg-fiador-nao-informado', [], 'js/aluno/matricula')
                    });
                }
            }
        }

        function IsMunicipioInformadoNaoCadastrado(clienteFornecedorModel) {
            if (clienteFornecedorModel.CodMunicipio == undefined){
                totvsNotification.notify({
                    type: 'error',
                    title: i18nFilter('l-Atencao'),
                    detail: i18nFilter('l-msg-municipio-nao-cadastrado', [], 'js/aluno/matricula')
                });
                return true;
            }

            return false;
        }

        function trataEtapaDadosPessoais() {
            if (eduMatriculaService.retornarEtapaAtual(self.etapas).nome == 'matriculaES.dados-pessoais') {
                eduMatriculaService.liberarProximaEtapa(self.etapas);
                eduMatriculaService.avancarEtapa(self.etapas);
            }
        }

        function trataEtapaSelecaoFichaMedica() {
            if (eduMatriculaService.retornarEtapaAtual(self.etapas).nome == 'matriculaES.ficha-medica') {
                eduMatriculaService.liberarProximaEtapa(self.etapas);
                eduMatriculaService.avancarEtapa(self.etapas);
            }
        }

        function trataEtapaDisciplinas() {
            if (eduMatriculaService.retornarEtapaAtual(self.etapas).nome == 'matriculaES.disciplinas') {
                self.bloquearMatricula = false;

                if (self.disciplinasSDD) {

                    if (verificaExistenciaErrosValidacao() == true) {
                        return;
                    }

                    criaListaDisciplinas(self.disciplinasSDD, function() {
                        validaPreCoRequisitos(function() {
                            validaFormulaVisual(function() {
                                if (self.bloquearMatricula) {
                                    return;
                                }
                                else {
                                    liberaEtapaPlanoPagamento();
                                }
                            });
                        });
                    });
                }
            }
        }

        function trataEtapaPlanosPagamento() {
            if (eduMatriculaService.retornarEtapaAtual(self.etapas).nome == 'matriculaES.planos-pagamento') {
                if ((self.planoPagamentoSelecionado && self.planoPagamentoSelecionado !== '0') || !self.permiteAlterarPlanoPagamento) {
                    verificarContratoOuProximaEtapaComExigenciaDoFiador();
                }
            }
        }

        function insereNovoCliForComoFiador(callback) {

            if (validaPreenchimentoFormularioFiador())
            {
                let clienteFornecedorModel = getClienteFornecedorModelFromForm();

                if (!IsMunicipioInformadoNaoCadastrado(clienteFornecedorModel)) {
                    eduMatriculaService.insereNovoCliForComoFiadorAlunoAsync(clienteFornecedorModel, function(fiador) {
                        if (fiador.CodCFO) {
                            totvsNotification.notify({
                                type: 'success',
                                title: i18nFilter('l-fiador-cadastrado-titulo', [], 'js/aluno/matricula'),
                                detail: i18nFilter('l-fiador-cadastrado-sucesso', [], 'js/aluno/matricula')
                            });

                            aoIniciarEtapaFiador();
                            $('#modalFiador').modal('hide');

                            if (angular.isFunction(callback)) {
                                callback();
                            }
                        }
                    });
                }
            }
        }

        function atualizaCliForFiadorAluno(callback) {

            if (validaPreenchimentoFormularioFiador())
            {
                let clienteFornecedorModel = getClienteFornecedorModelFromForm();

                if (!IsMunicipioInformadoNaoCadastrado(clienteFornecedorModel)) {
                    eduMatriculaService.atualizaCliForDoFiadorAlunoAsync(clienteFornecedorModel, function(fiador) {

                        if (fiador.CodCfo) {
                            totvsNotification.notify({
                                type: 'success',
                                title: i18nFilter('l-fiador-editado-titulo', [], 'js/aluno/matricula'),
                                detail: i18nFilter('l-dados-fiador-atualizado-sucesso', [], 'js/aluno/matricula')
                            });

                            if (angular.isFunction(callback)) {
                                callback();
                            }
                        }

                        aoIniciarEtapaFiador();

                        $('#modalFiador').modal('hide');
                    });
                }
            }
        }

        function getClienteFornecedorModelFromForm() {
            const valorPessoaFisica = 0;
            setCodigoMunicipio(true);

            var clienteFornecedorModel = {
                CodCfo: self.fiadorSelecionado.CODCFO,
                CGCCFO: self.fiadorSelecionado.CGCCFO,
                Nome: self.fiadorSelecionado.NOME,
                NomeFantasia: self.fiadorSelecionado.NOME,
                Email: self.fiadorSelecionado.EMAIL,
                Cep: self.fiadorSelecionado.CEP,
                Rua: self.fiadorSelecionado.RUA,
                Numero: self.fiadorSelecionado.NUMERO,
                Complemento: self.fiadorSelecionado.COMPLEMENTO,
                Bairro: self.fiadorSelecionado.BAIRRO,
                DTNascimento: new Date(self.fiadorSelecionado.DTNASCIMENTO),
                CIdentidade: self.fiadorSelecionado.CIDENTIDADE,
                Telefone: self.fiadorSelecionado.TELEFONE,
                Telefone2: self.fiadorSelecionado.TELEX,
                Telefone3: self.fiadorSelecionado.TELEFONECOMERCIAL,
                PessoaFisOuJurX: valorPessoaFisica,
                Pais: self.fiadorSelecionado.PAIS,
                IDPAIS: self.fiadorSelecionado.IDPAIS,
                Estado: self.fiadorSelecionado.ESTADO,
                CODETD: self.fiadorSelecionado.CODETD,
                Cidade: self.fiadorSelecionado.CIDADE,
                CodMunicipio: self.fiadorSelecionado.CodMunicipio
            }

            return clienteFornecedorModel;
        }

        function associaFiadorExistenteParaAluno(callback) {

            //O serviço de verificação retorna se é coligada global
            eduMatriculaService.associaFiadorExistenteParaAlunoAsync(self.fiadorSelecionado.CODCOLIGADA, self.fiadorSelecionado.CODCFO, function(fiador) {
                if (fiador.CodCFO) {
                    totvsNotification.notify({
                        type: 'success',
                        title: i18nFilter('l-Atencao'),
                        detail: i18nFilter('l-fiador-cadastrado-sucesso', [], 'js/aluno/matricula')
                    });

                    aoIniciarEtapaFiador();

                    if (angular.isFunction(callback)) {
                        callback();
                    }
                }
            });
        }

        /**
         * Seta o focus de um determinado campo do formulário
         * @param {string} nomeCampo Nome do campo para setar o focus
         */
         function setFocusCampo(nomeCampo) {
            let nomeCorrigido = nomeCampo.toString().replace("controller_fiadorselecionado.", "");

            var seletor = '[name=' + nomeCorrigido + '] input, [name=' + nomeCorrigido + '] select';

            $(seletor).focus();
        }

        function validaPreenchimentoFormularioFiador() {

            if ((!self.fiadorForm.$valid) && (self.fiadorForm.$error.required)){

                setFocusCampo(self.fiadorForm.$error.required[0].$name);

                totvsNotification.notify({
                    type: 'error',
                    title: i18nFilter('l-Atencao'),
                    detail: i18nFilter('l-msg-campos-preenchimento-obrigatorio')
                });

                return false;
            }

            return true;
        }

        function verificaExistenciaErrosValidacao() {
            if ($scope.permiteAvancarEtapaDisc == false) {
                exibePainelErros();

                totvsNotification.notify({
                    type: 'error',
                    title: i18nFilter('l-Atencao'),
                    detail: i18nFilter('l-msg-erro-avancar-etapa-disciplina', '[]', 'js/aluno/matricula')
                });

                return true;
            }

            return false;
        }

        function limpaErrosServer() {
            self.erroValidacaoPreCoRequisito = '';
            self.possuiErroValidacaoServerMatriculadasCoRequisito = false;
            self.possuiErroValidacaoServerExcluidasCoRequisito = false;
            self.mensagemServidorValidacaoPreCoRequisitoMatriculadas = [];
            self.mensagemServidorValidacaoPreCoRequisitoExcluidas = [];
            self.totalErrosServer = 0;
        }

        function validaPreCoRequisitos(callback) {
            if (self.paramsEdu.DESCONSIDERARREQDISC) {
                var validacoesPreCoRequisitoDisciplinasMatriculadas = [];
                var validacoesPreCoRequisitoDisciplinasExcluidas = [];

                eduMatriculaService.retornaValidacoesReqDisciplinas(self.matricItensValidaRequisitos, self.matricItensListDel,
                    function(result) {
                        validacoesPreCoRequisitoDisciplinasMatriculadas = result.matricItensList;
                        validacoesPreCoRequisitoDisciplinasExcluidas = result.matricItensListDel;
                        limpaErrosServer();

                        //Verifica se ocorreu algum erro na validação dos pré/corequisito na lista de disciplinas matriculadas
                        validacoesPreCoRequisitoDisciplinasMatriculadas.forEach(function (item) {
                            if (item.LogExcecoes.Texto) {
                                var ocorreuErroNaValidacao = validaCoRequisitoComListaEspera(item);

                                if(ocorreuErroNaValidacao){
                                    self.bloquearMatricula = true;
                                    montaErroValidacaoPreCoRequisito(item.CodDisc, item.NomeDisc, item.CodTurma, item.LogExcecoes.Texto);
                                    self.mensagemServidorValidacaoPreCoRequisitoMatriculadas.push(montaErroValidacaoServerPreCoRequisito(item.CodDisc, item.NomeDisc, item.CodTurma, item.LogExcecoes.Texto));
                                    self.possuiErroValidacaoServerMatriculadasCoRequisito = true;
                                    self.totalErrosServer += 1;
                                }
                            }
                        });

                        //Verifica se ocorreu algum erro na validação dos pré/corequisito na lista de disciplinas excluídas
                        validacoesPreCoRequisitoDisciplinasExcluidas.forEach(function (item) {
                            if (item.LogExcecoes.Texto) {
                                self.bloquearMatricula = true;
                                montaErroValidacaoPreCoRequisito(item.CodDisc, item.NomeDisc, item.CodTurma, item.LogExcecoes.Texto);
                                self.mensagemServidorValidacaoPreCoRequisitoExcluidas.push(montaErroValidacaoServerPreCoRequisito(item.CodDisc, item.NomeDisc, item.CodTurma, item.LogExcecoes.Texto));
                                self.possuiErroValidacaoServerExcluidasCoRequisito = true;
                                self.totalErrosServer += 1;
                            }
                        });

                        if (self.bloquearMatricula) {
                            totvsNotification.notify({
                                type: 'error',
                                title: i18nFilter('l-Atencao'),
                                detail: self.erroValidacaoPreCoRequisito
                                });
                        }

                        if (angular.isFunction(callback)) {
                            callback();
                        }
                });
            }
            else {
                if (angular.isFunction(callback)) {
                    callback();
                }
            }
        }

        function validaCoRequisitoComListaEspera(itemMatriculaDisc){
            var ocorreuErroDeCoRequisito = false;

            itemMatriculaDisc.LogExcecoes.Excecoes.forEach(function (excecao) {
                if(excecao.TipoExcecao == eduEnumsConsts.EduExcecoesMatriculaEnum.CoRequisito){
                    ocorreuErroDeCoRequisito = true;
                }
            });

            var inclusaoListaDeEspera = false;
            self.disciplinasSDD.forEach(function(disciplinaSDD) {
                if (disciplinaSDD.IDTURMADISC == itemMatriculaDisc.IdTurmaDisc) {
                    inclusaoListaDeEspera = disciplinaSDD.LISTAESPERA;
                }
            });

            if(ocorreuErroDeCoRequisito && inclusaoListaDeEspera == true && !self.paramsEdu.BLOQMATLESPCOR){
                ocorreuErroDeCoRequisito = false;
            }

            return ocorreuErroDeCoRequisito;
        }

        function validaFormulaVisual(callback) {
            if(self.paramsEdu.FVAPOSSELECTDISC > 0 && self.disciplinasSDD.length > 0) {
                eduMatriculaService.executaFVSelecaoDisc(self.matricItensList,
                    self.habilitacaoSelecionada.CODCOLIGADA,
                    self.habilitacaoSelecionada.CODTIPOCURSO,
                    self.disciplinasSDD[0].CODFILIAL, function(result) {

                    if (result.textovalidacao) {
                        self.bloquearMatricula = true;

                        totvsNotification.notify({
                            type: 'error',
                            title: i18nFilter('l-Atencao'),
                            detail: result.textovalidacao
                        });
                    }

                    if (angular.isFunction(callback)) {
                        callback();
                    }
                });
            }
            else {
                if (angular.isFunction(callback)) {
                    callback();
                }
            }
        }

        function verificarContratoOuProximaEtapaComExigenciaDoFiador(){
            if(desconsiderarEtapaFiador()){
                eduMatriculaService.retornarEtapaAtual(self.etapas).realizado = false;
                executarContratoMatricula();
              }
              else{
                liberarProximaEtapaEAvancar();
              }
        }

        function liberaEtapaPlanoPagamento() {
            if (self.parametrosMatricula.VisualizarPlanoPgto) {
                eduMatriculaService.liberarProximaEtapa(self.etapas);
                eduMatriculaService.avancarEtapa(self.etapas);
            } else {
                verificarContratoOuProximaEtapaComExigenciaDoFiador();
            }
        }

        function retrocederEtapa() {
            eduMatriculaService.retrocederEtapa(self.etapas);
        }

        function redirecionar(state) {
            eduMatriculaService.redirecionar(self.etapas, state);
        }

        //* Função chamada quando um período letivo é selecionado pelo usuário *//
        function habilitacaoPLSelecionado(plSelecionado) {
            if (plSelecionado == []) {
                return;
            }

            eduMatriculaService.retornaValidacoesPLMatriculaAlunoAsync(plSelecionado.IDHABILITACAOFILIAL, plSelecionado.IDPERLET,
                function (data) {
                    self.validacoesPLSelecionado = data;
                });

            $rootScope.plSelecionadoMatricula = plSelecionado;

            inicializarVariaveisDasEtapas();
            eduMatriculaService.inicializarWizardMatriculaEnsinoSuperiorAsync($scope, self.eventosStateEtapas, plSelecionado, function (etapas) {
                self.etapas = etapas;

                //Se exigir fiador, temos que carregar os planos de pagamento para
                //tratar a exibição da etapa de fiador
                if(plSelecionado.EXIGEFIADOR == "S" && self.planosPagamentoDisponiveis.length == 0){
                    carregaPlanoPagamentoDefault();
                    carregaPlanosPagamento();
                }
            });
        }

        function permiteExclusaoEtapaFiador(etapaFiadorExclusao){
            return self.habilitacaoSelecionada.EXIGEFIADOR == "S" &&
                etapaFiadorExclusao != undefined &&
                desconsiderarEtapaFiador();
        }

        function permiteInclusaoEtapaFiador(etapaFiadorInclusao){
            return self.habilitacaoSelecionada.EXIGEFIADOR == "S" &&
                etapaFiadorInclusao == undefined &&
                self.etapaFiadorExcluida != undefined &&
                !desconsiderarEtapaFiador();
        }

        function atualizaOrdemDasEtapas(etapaBaseDaAtualizacao, valorAtualizacao){
            self.etapas.forEach(etapa => {
                if(etapa.ordem >= etapaBaseDaAtualizacao.ordem)
                    etapa.ordem += valorAtualizacao;
            });
        }

        function excluiEtapa(etapaExclusao){
            if(self.etapas != undefined && self.etapas.length > 0 && etapaExclusao != undefined)
                self.etapas.splice(etapaExclusao.ordem - 1, 1);
        }

        function incluiEtapa(etapaInclusao, ordem){
            if(self.etapas != undefined && ordem > 1 && etapaInclusao != undefined)
                self.etapas.splice(ordem - 1, 0, etapaInclusao);
        }

        function trataVisibilidadeEtapaFiadorPorPlanoPgto(planoPgto) {
            if (planoPgto == []) {
                return;
            }

            if(self.habilitacaoSelecionada.EXIGEFIADOR == "S"){
                let etapaFiadorFromEtapas = eduMatriculaService.retornaEtapaPorNome(self.etapas, 'matriculaES.fiador');
                if(permiteExclusaoEtapaFiador(etapaFiadorFromEtapas)){
                    self.etapaFiadorExcluida = etapaFiadorFromEtapas;
                    excluiEtapa(self.etapaFiadorExcluida);
                    atualizaOrdemDasEtapas(self.etapaFiadorExcluida, -1);
                }
                else if(permiteInclusaoEtapaFiador(etapaFiadorFromEtapas)){
                    atualizaOrdemDasEtapas(self.etapaFiadorExcluida, 1);
                    incluiEtapa(self.etapaFiadorExcluida, self.etapaFiadorExcluida.ordem);
                }
            }
        }

        //Evento disparado quando é inicializada a etapa de apresentação
        function aoIniciarEtapaApresentacao() {
            if (self.processoFinalizado) {
                location.reload(); //redireciona para a etapa de apresentação
            }
        }

        //Evento disparado quando é inicializada a etapa de seleção de período letivo
        function aoIniciarEtapaPeriodoLetivo() {

            if (self.habilitacoesPLDisponiveis.length === 0) {

                eduMatriculaService.retornaHabilitacoesPLDisponveisMatriculaAlunoAsync(function (data) {
                    self.habilitacoesPLDisponiveis = data.HABILITACAOPLDISPONIVEIS;

                    //Se não tiver habilitação disponível mostra mensagem de matrícula indisponível
                    if (self.habilitacoesPLDisponiveis.length === 0) {
                        self.parametrosMatricula.MatriculaDiscponivel = false;
                    }

                    //Se tiver apenas um registro de habilitações exibidas para o usuário, já seleciona automaticamente e realiza as validações.
                    if (self.habilitacoesPLDisponiveis.length === 1) {
                        self.habilitacaoSelecionada = self.habilitacoesPLDisponiveis[0];
                        habilitacaoPLSelecionado(self.habilitacaoSelecionada);
                    }
                });
            }

            var myWatch = $scope.$watch('controller.habilitacaoSelecionada', function (newValue, oldValue) {
                // Se o usuário trocar o período letivo durante a navegação da tela (anterior/próximo), então será
                // necessário reiniciar as etapas posteriores, para evitar que o usuário avance, com as regras
                // do período letivo selecionado anteriormente.
                if (newValue && oldValue && newValue.IDHABILITACAOFILIAL !== oldValue.IDHABILITACAOFILIAL) {

                    eduMatriculaService.restringirProximasEtapas(self.etapas);

                    // Limpa a lista de planos de pagamento disponíveis, pois ela precisará ser
                    // carregada novamente, devido a alteração do período letivo selecionado.
                    // Carga realizada na function aoIniciarEtapaPlanosPagamento
                    self.planosPagamentoDisponiveis = [];

                    myWatch();
                }
            });
        }

        function desconsiderarEtapaFiador(){
            return ((self.habilitacaoSelecionada.EXIGEFIADOR == "N") ||
                    (self.habilitacaoSelecionada.EXIGEFIADOR == "S" &&
                     self.parametrosMatricula.NaoExigirFiadorBolsaDescontoCemPorCento &&
                     valorLiquidoDoPlanoDePagamentoSelecionado() == 0));
        }

        function aoIniciarEtapaFiador() {
            if(desconsiderarEtapaFiador()){

                inicializarVariaveisDasEtapas();
                eduMatriculaService.inicializarWizardMatriculaEnsinoSuperiorAsync($scope, self.eventosStateEtapas, plSelecionado, function (etapas) {
                    self.etapas = etapas;
                });

                finalizarEtapaFiador();
            }
            else{
                inicializaVariaveisEtapaFiador();
                carregaFiadorAluno();
            }
        }

        function inicializaVariaveisEtapaFiador() {
            self.statusFiador.hasFiador = false;
            self.statusFiador.isNovoFiador = false;
            self.statusFiador.hasFoundFiador = false;

            self.gridOptions = {
                columns: definirColunas(),
                scrollable: false,
                sortable: false,
                resizable: true,
                selectable: false
            };

            self.gridFiadorOptions = {
                scrollable: true,
                sortable: false,
                resizable: false,
                selectable: false
            };

            self.fiadorSelecionado = {};
            self.objListaFiadores = [];
        }

        /**
         * Define as colunas apresentadas no grid.
         *
         * @returns {object} Objeto com a definição das colunas.
         */
        function definirColunas() {

            var colunasDefinicao = [];

            if (!_browser.mobile)
            {
                colunasDefinicao.push({
                    field: 'STATUS',
                    title: i18nFilter('l-situacao', [], 'js/aluno/matricula'),
                    template:formatarColunaStatusFiador,
                    width: 30,
                    attributes: {
                        'class': 'gridRow textAlignCenter'
                    }
                });
            }

            colunasDefinicao.push({
                    field: 'NOME',
                    title: i18nFilter('l-nome', [], 'js/aluno/matricula'),
                    width: 200
                });

            if (!_browser.mobile)
            {
                colunasDefinicao.push({
                    field: 'CGCCFO',
                    title: i18nFilter('l-cpf', [], 'js/aluno/matricula'),
                    width: 60,
                    attributes: {
                        'class': 'gridRow textAlignCenter'
                    }
                });

                colunasDefinicao.push({
                    field: 'EMAIL',
                    title: i18nFilter('l-email', [], 'js/aluno/matricula'),
                    width: 80
                });
            }

            colunasDefinicao.push({
                template: criaBotaoControleFiador,
                width: 30,
                attributes: {
                    'class': 'gridRow textAlignCenter'
                }
            });

            return colunasDefinicao;
        }

        //Evento disparado quando é iniciallizado a etapa de seleção de disciplinas
        function aoIniciarEtapaDisciplinas() {

            if (self.disciplinasSDD.length === 0) {
                // Limpa a lista de planos de pagamento disponíveis, pois ela precisará ser
                // carregada novamente, devido a alteração das disciplinas.
                // Carga realizada na function aoIniciarEtapaPlanosPagamento
                self.planosPagamentoDisponiveis = [];
                self.renderizarSlideOut = false;
                self.matricItensList = [];
                self.matricItensListDel = [];
                $scope.permiteAvancarEtapaDisc = true;

                if (self.habilitacaoSelecionada) {

                    eduMatriculaService.retornaDiscplinasMatriculaESAsync(self.habilitacaoSelecionada.IDHABILITACAOFILIAL, self.habilitacaoSelecionada.IDPERLET,
                        function (data) {
                        self.disciplinasMatriculadas = resolveTipoDisciplina(data.TURMASMATRICULADAS);
                        self.disciplinasSDD = resolveTipoDisciplina(data.TURMADISC);
                        self.horariosTurmaDisc = resolveDiasSemana(data.HORARIOTURMADISC);

                        self.requisitos = data.REQUISITO;
                        self.paramsEdu = data.MATRICPARAMS[0];

                        preencheParametroAdicaoDisciplina();

                        preencheDadosDisciplinas(data, function() {
                            sincronizaMatriculadasComSDD();
                            carregaPlanoPagamentoDefault(executaValidacoes);

                            if (self.paramsEdu.VISUALIZARSIMULACAOPAGTO === true) {
                                carregaPlanosPagamento();
                            }

                            defineLarguraGridCreditosAcademicos();
                            validacoesIniciaisAposCarregarDisciplinasSDD();
                        });

                        aoConcluirCarregamentoSelecaoDisciplinas();
                    });
            } else {
                self.disciplinasMatriculadas = [];
            }
          }
        }

        //Evento disparado quando é inicializado a etapa de seleção de Plano de Pagamento
        function aoIniciarEtapaPlanosPagamento() {
            carregaPlanosPagamento();
        }

        function aoIniciarEtapaFinalizacao() {

            //Etapa de finalização será realizada automaticamente
            eduMatriculaService.liberarEtapaAtual(self.etapas);

            if (!self.textoComprovante) {
                eduMatriculaService.retornaComprovanteMatriculaAsync(self.habilitacaoSelecionada.IDHABILITACAOFILIAL, self.habilitacaoSelecionada.IDPERLET,
                    function (result) {
                        if (result && result.value) {
                            self.textoComprovante = $sce.trustAsHtml(result.value);
                        }
                    });
            }
        }

        function aoConcluirCarregamentoSelecaoDisciplinas() {
            angular.element(document).ready(function () {
                ocultaColunaTurmaListagemDisciplinas();
                funcoesJqueryInicializacao();
                fechaSlideOutAoClicarFora();
                minimizaPainelResumo();
                minimizaPainelSimulacao();

                var codUsuarioPulaTutorial = 'pulaTutorial-' + $rootScope.InformacoesLogin.login;
                var usuarioPulaTutorial = null;

                if (angular.isDefined(window.localStorage.getItem(codUsuarioPulaTutorial)) &&
                    window.localStorage.getItem(codUsuarioPulaTutorial) != null)
                {
                    usuarioPulaTutorial = window.localStorage.getItem(codUsuarioPulaTutorial);
                }

                if(!usuarioPulaTutorial && !_browser.mobile) {
                    executaTutorialMatricula();
                }
            });
        }

        function ocultaColunaTurmaListagemDisciplinas() {
            //Caso não esteja parametrizado no sistema, será ocultado o campo TURMA da listagem de disciplinas
            if (!self.parametrosMatricula.ExibirCampoTurmaNaListagemDisciplinasRematricula) {
                self.gridInstance.hideColumn(4);
            }
        }

        function funcoesJqueryInicializacao() {
            $('.totvs-group').removeAttr('title');
            $('.totvs-group a').eq(0).click();
            $('#painel-validacoes').slideToggle();
            $('#painel-informacoes-turma-disciplina').slideToggle();

            $('#filtroDisciplina').keyup(function(e){
                if(e.keyCode === 13) {
                    pesquisaDisciplinasExtras();
                }
            });
        }

        function fechaSlideOutAoClicarFora() {
            $(window).click(function(elementoClicado) {

                var $elementoClicado = $(elementoClicado.target);

                if (($elementoClicado.closest('.slideout_title').length === 0 &&
                     $elementoClicado.closest('.slideout_img').length === 0 &&
                     $elementoClicado.closest('.slideout_inner').length === 0 &&
                     $elementoClicado.closest('.controller_planopagamentoselecionado').length === 0) &&
                    $('.slideout').hasClass('slideoutOpen') === true) {
                    $('.slideout').toggleClass('slideoutOpen');
                }
            });
        }

        function carregaPlanoPagamentoDefault(callback) {
            eduMatriculaService.permitirAlterarPlanoPagamentoAsync(self.habilitacaoSelecionada.IDHABILITACAOFILIAL, self.habilitacaoSelecionada.IDPERLET,
                function(permite) {
                    self.permiteAlterarPlanoPagamento = permite.value;
                    eduMatriculaService.retornaPlanoPagamentoDefaultAsync(self.habilitacaoSelecionada.IDHABILITACAOFILIAL, self.habilitacaoSelecionada.IDPERLET,
                        function (planoDefault) {
                            if (planoDefault && planoDefault.CODPLANOPGTO != '0') {
                                self.planoPagamentoSelecionado = planoDefault.CODPLANOPGTO;
                            }

                            if (!permite.value && planoDefault.CODPLANOPGTO == '0') {
                                self.planoPagamentoSelecionado = '';
                            }
                        });
            });

            if (callback) {
                callback();
            }
        }

        function carregaFiadorAluno() {
            eduMatriculaService.retornaFiadorAlunoAsync(self.habilitacaoSelecionada.IDPERLET, function (fiador) {

                self.objListaFiadores = [];

                if (angular.isArray(fiador.SFIADOR)) {
                    self.objListaFiadores = fiador.SFIADOR;

                    for (let i = 0; i < self.objListaFiadores.length; i++){
                        self.objListaFiadores[i].objListaDocumentosFiador = fiador.SDOCFIADOR.filter(fi => fi.IDFIADOR === self.objListaFiadores[i].IDFIADOR);
                    }

                    atualizarDocumentoArquivo();
                }
            });
        }

        function formatarColunaStatusFiador(item) {
            switch (item.STATUS) {
                case eduEnumsConsts.EduStatusFiadorEnum.Avaliacao:
                    return `<span class="texto-amarelo">${i18nFilter('l-coluna-fiador-em-avaliacao', [], 'js/aluno/matricula')}</span>`;
                case eduEnumsConsts.EduStatusFiadorEnum.Aprovado:
                    return `<span class="texto-verde">${i18nFilter('l-coluna-fiador-aprovado', [], 'js/aluno/matricula')}</span>`;
                case eduEnumsConsts.EduStatusFiadorEnum.Reprovado:
                    return `<span class="texto-vermelho">${i18nFilter('l-coluna-fiador-reprovado', [], 'js/aluno/matricula')}</span>`;
            }
        }

        /*
        * Não vai permitir editar o fiador quando:
        * - Ele esta em avaliação e não foi adicionado pelo aluno
        * - Ele foi reprovado
        * Nos demais casos o sistema irá permitir editar o fiador
        */
        function naoPermiteEditarFiador(fiador) {
            return (
                    ((fiador.STATUS === eduEnumsConsts.EduStatusFiadorEnum.Avaliacao) && (fiador.RECCREATEDBY === null)) ||
                    (fiador.STATUS === eduEnumsConsts.EduStatusFiadorEnum.Reprovado)
                   );
        }

        function criaBotaoControleFiador(fiador) {
            let htmlBtnExclusao =
                `<button class="btn-delete" ng-click="controller.deletarFiador(${fiador.IDFIADOR})">
                    <span id="spanbuttonExcluir" class="glyphicon glyphicon-trash" aria-hidden="True"></span>
                </button>`;

            let htmlBtnEdicao =
                `<button class="btn-edit" ng-click="controller.exibirModalFiador(${fiador.CODCOLIGADA},${fiador.IDFIADOR})" formnovalidate>
                    <span id="spanbuttonEditar" class="glyphicon glyphicon-pencil" aria-hidden="True"></span>
                </button>`;

            return naoPermiteEditarFiador(fiador) ? htmlBtnExclusao : htmlBtnEdicao + htmlBtnExclusao;
        }

        /*
        * Abre o modal com o formulário de edição do Fiador
        */
        function exibirModalFiador(codColigada, idFiador) {

            self.statusFiador.hasFoundFiador = false;

            if (idFiador === -1)
            {
                if (validaNumMaxFiador())
                {
                    self.fiadorSelecionado = {
                        IDFIADOR: -1,
                        CGCCFO: '',
                        PESSOAFISOUJUR: 'F'
                    };

                    self.tituloFiadorFiador = i18nFilter('l-btn-cadastrar-fiador', [], 'js/aluno/matricula');
                }
                else
                    return;
            }
            else
            {
                self.fiadorSelecionado = self.objListaFiadores.find(fiador => ((parseInt(fiador.CODCOLIGADA) === codColigada) && (parseInt(fiador.IDFIADOR) === idFiador)));
                self.tituloFiadorFiador = self.fiadorSelecionado.NOME;
            }

            //Carrega as listas de localidades
            getListaPaises();

            $('#modalFiador').modal({backdrop: 'static', keyboard: false, show: true});
        }

        /**
         *  Valida o número máximo de fiadores
         */
        function validaNumMaxFiador()
        {
            let objFiadoresValidos = self.objListaFiadores.filter(fiador => (fiador.STATUS && ((fiador.STATUS !== eduEnumsConsts.EduStatusFiadorEnum.Reprovado))));

            let numFiadorMax = parseInt(self.parametrosMatricula.NumMaxFiador);

            if ((angular.isArray(objFiadoresValidos)) && (objFiadoresValidos.length >= numFiadorMax)) {
                totvsNotification.notify({
                    type: 'error',
                    title: i18nFilter('l-Atencao'),
                    detail: i18nFilter('l-msg-max-num-fiador', [], 'js/aluno/matricula')
                });

                return false;
            }

            return true;
        }

        /**
         *  Confirmação de exclusão de fiador
         */
        function deletarFiador(idFiador) {
            totvsNotification.question({
                title: i18nFilter('l-Confirmacao'),
                text: i18nFilter('l-msg-confirmacao-exclusao-fiador', [], 'js/aluno/matricula'),
                cancelLabel: 'l-no',
                size: 'md',
                confirmLabel: 'l-yes',
                callback: function (isPositiveResult) {
                    if (isPositiveResult) {
                        eduMatriculaService.removeFiadorAsync(idFiador, function () {
                            aoIniciarEtapaFiador();
                        });
                    }
                }
            });
        }

        function pesquisaClienteFornecedor() {

            if (self.fiadorSelecionado.CGCCFO == null || self.fiadorSelecionado.CGCCFO == undefined || self.fiadorSelecionado.CGCCFO == '') {
                return;
            }

            eduMatriculaService.pesquisaClienteFornecedorAsync(self.fiadorSelecionado.CGCCFO, function (fiador) {

                if (fiador.CODCFO && fiador.IDFIADOR == null) {
                    self.fiadorSelecionado = fiador;

                    self.statusFiador.hasFoundFiador = true;
                    self.statusFiador.isNovoFiador = false;
                    self.statusFiador.hasFiador = true;

                    $('#modalFiador').modal('hide');

                    solicitaAssociacaoFiadorAoUsuario();

                } else {
                    self.statusFiador.hasFoundFiador = false;
                    self.statusFiador.isNovoFiador = true;

                    if (fiador.IDFIADOR != null && fiador.IDFIADOR != undefined && fiador.IDFIADOR != '')
                    {
                        self.fiadorSelecionado.CGCCFO = '';
                        totvsNotification.notify({
                            type: 'warning',
                            title: i18nFilter('l-Atencao'),
                            detail: i18nFilter('l-msg-erro-associar-fiador', [], 'js/aluno/matricula')
                        });
                    }
                    else
                    {
                        totvsNotification.notify({
                            type: 'warning',
                            title: i18nFilter('l-Atencao'),
                            detail: i18nFilter('l-fiador-nao-encontrado', [], 'js/aluno/matricula')
                        });
                    }
                }
            });
        }

        function solicitaAssociacaoFiadorAoUsuario() {
            totvsNotification.question({
                title: i18nFilter('l-Confirmacao'),
                text: i18nFilter('l-msg-confirmacao-associar-fiador', [], 'js/aluno/matricula' ),
                cancelLabel: 'l-no',
                size: 'md',
                confirmLabel: 'l-yes',
                callback: function (isPositiveResult) {
                    if (isPositiveResult) {
                        associaFiadorExistenteParaAluno();
                    }
                }
            });
        }

        function carregaPlanosPagamento(desconsiderarAjusteDeEtapas) {
            preparaListaIdTurmaDisc(function () {
                eduMatriculaService.retornaPlanosPagamentoDisponiveisAsync(self.habilitacaoSelecionada.IDHABILITACAOFILIAL,
                    self.habilitacaoSelecionada.IDPERLET,
                    self.listaIdTurmaDisc, async function (listaPlanos) {
        
                        if (listaPlanos.length == 1 && listaPlanos[0].Message && listaPlanos[0].ClassName == 'RM.Lib.RMSValidateException') {
                            self.mensagemListaPlanosPagamentoVazia = `${i18nFilter('l-nenhum-plano-pagamento-disponivel', [], 'js/aluno/matricula')} ${listaPlanos[0].Message}`;
                            self.planosPagamentoDisponiveis = [];
                            return;
                        }
        
                        const periodoAtual = await listaPlanos[0].idPerlet
        
                        // Get full information
                        let information = document.querySelector("#desktopHeaderMenu > span.pull-left").textContent
        
                        // Remove useless information
                        information = information.replace('(RA: ', '').replace(')', '').split(' ')
        
                        // Get ra
                        const ra = information[information.length - 1]
        
                        const url = 'http://gnobre.ddns.com.br:9211/' // Adicionar endereço da API
                        const validaPlanosNobre = await fetch(url + 'validaPlano', {
                            method: 'post',
                            body: JSON.stringify({
                                ra,
                                instituicao: "UNIFAN",
                                habilitacao: self.habilitacaoSelecionada.IDHABILITACAOFILIAL,
                                idPerlet: periodoAtual,
                                planos: listaPlanos
                            })
                        })
        
                        const planosValidados = await validaPlanosNobre.json()
        
                        self.planosPagamentoDisponiveis = planosValidados.validados;
                        self.renderizarSlideOut = true;
        
                        if (listaPlanos.length == 0 || listaPlanos == null) {
                            self.renderizarSlideOut = false;
                        } else {
                            if (self.permiteAlterarPlanoPagamento && (!self.planoPagamentoSelecionado || self.planoPagamentoSelecionado == null)) {
                                self.planoPagamentoSelecionado = planosValidados[0].codPlanoPgto;
                            }
                        }
        
                        redimensionaTamanhoSlideoutSilulacaoPagamento();
        
                        //Se tiver que ser considerado o ajuste de etapas e o plano de pagamento tiver
                        //sido selecionado, caso o curso considerado exija fiador, será tratada
                        //a visilidade da etapa de fiador no processo
                        if (!Boolean(desconsiderarAjusteDeEtapas) && self.planoPagamentoSelecionado != undefined)
                            trataVisibilidadeEtapaFiadorPorPlanoPgto(self.planoPagamentoSelecionado);
                    });
            });
        }

        function preparaListaIdTurmaDisc(callback) {
            self.listaIdTurmaDisc = [];
            self.disciplinasSDD.forEach(function(disciplinaSDD) {
                if (disciplinaSDD.ADICIONADO) {
                    self.listaIdTurmaDisc.push(disciplinaSDD.IDTURMADISC);
                }
            });

            if (callback) {
                callback();
            }
        }

        function defineLarguraGridCreditosAcademicos() {
            if ((self.habilitacaoSelecionada.MINCREDPERIODO != null && self.habilitacaoSelecionada.MINCREDPERIODO > 0) &&
                (self.habilitacaoSelecionada.MAXCREDPERIODO != null && self.habilitacaoSelecionada.MAXCREDPERIODO > 0)) {
                self.larguraGridCreditosAcademicos = 3;
            }

            if ((self.habilitacaoSelecionada.MINCREDPERIODO == null || self.habilitacaoSelecionada.MINCREDPERIODO === 0) ||
                (self.habilitacaoSelecionada.MAXCREDPERIODO == null || self.habilitacaoSelecionada.MAXCREDPERIODO === 0)) {
                self.larguraGridCreditosAcademicos = 4;
            }

            if ((self.habilitacaoSelecionada.MINCREDPERIODO == null || self.habilitacaoSelecionada.MINCREDPERIODO === 0) &&
                (self.habilitacaoSelecionada.MAXCREDPERIODO == null || self.habilitacaoSelecionada.MAXCREDPERIODO === 0)) {
                self.larguraGridCreditosAcademicos = 6;
            }
        }

        /**
         * Ao iniciar a tela de matrícula, esta função sincroniza a lista de discplinas já matriculadas/pré-matriculadas do aluno
         * com a lista de todas as disciplinas exibidas no SDD.
         *
         * ATENÇÃO: Centralizamos em todos os pontos da tela de seleção de disciplinas da matrícula do ensino superior a lista "self.disciplinasSDD".
         */
        function sincronizaMatriculadasComSDD() {
            self.disciplinasSDD.forEach(function(disciplinaSDD) {
                var disciplinaAdicionada = false;

                self.disciplinasMatriculadas.forEach(function(matriculada) {
                    if (matriculada.CODCOLIGADA == disciplinaSDD.CODCOLIGADA &&
                        matriculada.IDTURMADISC == disciplinaSDD.IDTURMADISC) {

                            //indica que esta Turma/Disciplina já estava matriculada ao iniciar a matrícula.
                            disciplinaSDD.MATRICULADO = true;

                            //indica que a disciplina foi incluída no grupo de disciplinas adicionadas.
                            disciplinaAdicionada = true;

                            //Se possui mais de uma Turma/Disc e uma delas estiver matriculado,
                            //Define a propriedade para exibir o ícone de matriculado em qualquer uma delas
                            //Pois qualquer uma destas Turma/Disc pode ser listadas na sugestão de disciplinas.
                            self.disciplinasSDD.forEach(function(item) {
                                if (item.CODCOLIGADA == disciplinaSDD.CODCOLIGADA &&
                                    item.CODDISC == disciplinaSDD.CODDISC)
                                {
                                    item.EXIBEMATRICULADO = true;
                                    //indica que alguma turma/disciplina com esta disciplina já estava matriculada ao iniciar a matrícula (necessário para a troca de turma).
                                    item.DISCIPLINAMATRICULADA = true;
                                }
                            });
                    }
                });

                disciplinaSDD.ADICIONADO = disciplinaAdicionada;
            });

            let existGrupoSemPeriodo = self.disciplinasSDD.some(gsp => gsp.IDGRUPO > 0 && gsp.PERIODOGRUPO < 1);
            let existGrupoDisc = self.disciplinasSDD.some(gsp => gsp.IDGRUPO > 0 && gsp.PERIODOGRUPO > 0);
            let maiorPeriodo = 1;
            if (existGrupoSemPeriodo)
              maiorPeriodo = self.disciplinasSDD.reduce((prev, current) => (prev && prev.CODPERIODO > current.CODPERIODO) ? prev : current).CODPERIODO + 1;

            self.disciplinasSDD.forEach(function(disciplina) {
                /* Só permite incluir as disciplinas que forem adicionadas durante o processo de matrícula
                   As que já estiverem previamente matriculadas não poderão ser excluídas */
                if ((self.paramsEdu.BLOQUEIAINCLUSAODISCIPLINASMATRICULADAS == true &&
                     disciplina.DISCIPLINAMATRICULADA == true) ||
                     self.paramsEdu.BLOQUEIAINCLUSAODISCIPLINASMATRICULADAS == false) {
                    disciplina.PERMITEINCLUIR = true;

                    // parametro de incluir disciplina desmarcado, parametro excluir disciplina marcado e possui disciplinas matriculadas
                    // os dias de semana que possuirem disciplina matriculada será exibido o botão de adicionar disciplina
                    if (!self.paramsEdu.BLOQUEIAEXCLUSAODISCIPLINASMATRICULADAS && self.paramsEdu.BLOQUEIAINCLUSAODISCIPLINASMATRICULADAS) {
                        self.disciplinasMatriculadas.forEach(function (disc) {
                            disc.HORARIOS.forEach(function (horario) {
                                self.botoesInclusaoDisciplina[horario.CODDIA].disabled = true;
                            })
                        });
                    } else {
                        disciplina.HORARIOS.forEach(function (horario) {
                            self.botoesInclusaoDisciplina[horario.CODDIA].disabled = !(self.paramsEdu.BLOQUEIAEXCLUSAODISCIPLINASMATRICULADAS && self.paramsEdu.BLOQUEIAINCLUSAODISCIPLINASMATRICULADAS);
                        })
                    }

                } else {
                    disciplina.PERMITEINCLUIR = false;
                }

                /* Só permite excluir as disciplinas que forem adicionadas durante o processo de matrícula
                   As que já estiverem previamente matriculadas não poderão ser excluídas */
                if (self.paramsEdu.BLOQUEIAEXCLUSAODISCIPLINASMATRICULADAS === true &&
                    disciplina.DISCIPLINAMATRICULADA === true) {
                    disciplina.PERMITEEXCLUIR = false;
                } else {
                    disciplina.PERMITEEXCLUIR = true;
                }

                if (existGrupoSemPeriodo) {
                    if (disciplina.IDGRUPO > 0 && disciplina.PERIODOGRUPO < 1) {
                      disciplina.CODPERIODO = maiorPeriodo;
                      disciplina.PERIODO = i18nFilter('l-grupoEletivaOpt', '[]', 'js/aluno/matricula').replace('-', '');
                    }
                    if (disciplina.CODPERIODO == 0) {
                      disciplina.PERIODO = i18nFilter('l-periodoDiscExtraEquiv', '[]', 'js/aluno/matricula');
                    }
                  }
  
                  if (disciplina.IDGRUPO > 0 && disciplina.PERIODOGRUPO > 0) {
                    disciplina.NOMEGRUPO = i18nFilter('l-grupoEletivaOpt', '[]', 'js/aluno/matricula') + disciplina.NOMEGRUPO;
                    disciplina.PERIODO = disciplina.NOMEGRUPO;
                  }
  
                  if (disciplina.PERIODO == i18nFilter('l-periodoDiscExtra', '[]', 'js/aluno/matricula')) {
                      if (existGrupoDisc)
                          disciplina.PERIODO =i18nFilter('l-periodoDiscExtraEquiv', '[]', 'js/aluno/matricula');
                    disciplina.CODPERIODO = 0;
                  }
            });
        }

        /**
         * Funcionalidade do modal que aparece para o usuário quando seleciona no botão (+) "Adicionar discipilinas" do Quadro de horário
         * onde listam apenas disciplinas que estejam naquele determinado horário.
         * @param {*} turmaDisc - Turma/Disciplina
         */
        function adicionarDisciplinaDoHorario(turmaDisc) {
            matricularDisciplina(turmaDisc);
            fechaModalDisciplinasDoHorario();
        }

        function fechaModalDisciplinasDoHorario() {
            $('#modalDisciplinasDoHorario').modal('hide');
        }

        /**
         * Adiciona uma disciplina na lista de disciplinas matriculadas ou a serem matriculadas.
         * Também é a função para a TROCA de Turma/disciplinas
         * @param {*} turmaDisc - Turma/Disciplina
         * @param {*} disciplinaExtra - Turma/Disciplina extra
         */
        function matricularDisciplina(turmaDisc, disciplinaExtra) {
            if (eduMatriculaService.validaSelecaoSubTurma(self.paramsEdu, turmaDisc) === false) { return; }

            //Verifica se já está "adicionado" e o caso é a troca de turma.
            var discParaTrocaTurma = self.disciplinasSDD.filter(function (x) { return x.ADICIONADO === true &&
                x.CODCOLIGADA == turmaDisc.CODCOLIGADA &&
                x.CODDISC == turmaDisc.CODDISC; });

            if (discParaTrocaTurma.length > 0) {
                removerDisciplina(discParaTrocaTurma[0]);
            }

            atualizaListaDiscMatriculadas(turmaDisc, true, disciplinaExtra);
        }

        /**
         * Remove uma disciplina da lista de disciplinas matriculadas ou a serem matriculadas.
         * @param {*} turmaDisc - Turma/Disciplina
         */
        function removerDisciplina(turmaDisc) {
            atualizaListaDiscMatriculadas(turmaDisc, false);
        }

        /**
         * Responsável por atualizar a lista de disciplinas do SDD após qualquer tipo de ação.
         * INCLUSÃO de disciplinas. EXCLUSÃO ou TROCA de turma/disc.
         * @param {*} turmaDisc - Turma/Disciplina
         * @param {*} matriculado - True quando orinundo de uma inclusão ou troca de turma/disc. False quando removido da lista de disciplinas matriculadas.
         * @param {*} disciplinaExtra - Indica se a Turma/Disciplina é da pesquisa de disciplina extra.
         */
        function atualizaListaDiscMatriculadas(turmaDisc, matriculado, disciplinaExtra) {
            limpaErrosServer();

            if (disciplinaExtra === true) {
                turmaDisc.ADICIONADO = true;
                turmaDisc.PERMITEEXCLUIR = true;
                turmaDisc.EXIBEMATRICULADO = true;
                self.disciplinasSDD = appendObjTo(self.disciplinasSDD, turmaDisc);

                $('#modalDisciplinasExtras').modal('hide');
            } else {

                if (turmaDisc.TIPODISC == 'EXT' && matriculado == false) {
                    self.disciplinasSDD = self.disciplinasSDD.filter(function (x) { return x.IDTURMADISC != turmaDisc.IDTURMADISC; });
                }

                self.disciplinasSDD.forEach(function(item) {
                    if (item.CODCOLIGADA == turmaDisc.CODCOLIGADA &&
                        item.IDTURMADISC == turmaDisc.IDTURMADISC) {

                        /*recebe o valor passado para a função.
                            True quando orinundo de uma inclusão ou troca de turma/disc.
                            False quando removido da lista de disciplinas matriculadas. */
                        item.ADICIONADO = matriculado;
                        self.disciplinaSelecionadaMatricula = item;
                    }
                });

                //A propriedade EXIBEMATRICULADO ficou responsável por exibir o ícone de disciplina já incluída nas disciplinas do SDD.
                //Ficou necessário em casos de disciplina que possuem mais de uma turma/Disc.
                self.disciplinasSDD.forEach(function(item) {
                    if (item.CODCOLIGADA == turmaDisc.CODCOLIGADA &&
                        item.CODDISC == turmaDisc.CODDISC)
                    {
                        /* Só permite excluir as disciplinas que forem adicionadas durante o processo de matrícula
                           As que já estiverem previamente matriculadas não poderão ser excluídas */
                        if (self.paramsEdu.BLOQUEIAEXCLUSAODISCIPLINASMATRICULADAS == true &&
                            item.DISCIPLINAMATRICULADA == true) {
                            item.PERMITEEXCLUIR = false;
                        } else {
                            item.PERMITEEXCLUIR = true;
                        }

                        item.EXIBEMATRICULADO = matriculado;
                    }
                });
            }

            executaValidacoes();
            abreAccordionDisciplinas();
        }

        /**
         * Função que centraliza a chamada de todas as validações. Executada no momento da abertura da tela de seleção de disciplinas da matrícula,
         * ao adicionar, remover ou trocar de turma/disciplina.
         */
        function executaValidacoes() {
            limpaErrosTodasDisciplinas();
            validaHorariosMatriculados();
            validaCoRequisitoTodasDisciplinas();
            somaCreditosDisciplinasMatriculadas();
            validaSelecaoSubTurmas();
            criaMensagemInformacaoUsuario();
            geraQuadroHorario();
        }

        function minimizaPainelQuadroHorario() {
            $('#body-painel-quadro-horario').slideToggle();
            self.quadroHorarioMinimizado = !self.quadroHorarioMinimizado;
        }

        function minimizaPainelResumo() {
            $('#body-painel-resumo').slideToggle();
            self.resumoMinimizado = !self.resumoMinimizado;
        }

        function minimizaPainelSimulacao() {
            $('#bodyPainelSimulacao').slideToggle();
            self.simulacaoMinimizada = !self.simulacaoMinimizada;
        }

        /**
         * Função que recebe a disciplina selecionada pelo usuário na lista de SDD ou disciplinas matriculadas.
         * Exibe as informações de todas as turmas/disciplinas para o usuário.
         * @param {*} disciplina - Turma/Disciplina
         */
        function disciplinaSelecionada(disciplina) {

            var disciplinaSelecionada = self.disciplinasSDD.filter(function (x) { return x.CODCOLIGADA == disciplina.CODCOLIGADA &&
                x.CODDISC == disciplina.CODDISC &&
                x.ADICIONADO == true; });

            if (disciplinaSelecionada.length > 0) {
                self.disciplinaSelecionadaMatricula = disciplinaSelecionada[0];
            } else {
                self.disciplinaSelecionadaMatricula = disciplina;
            }

            $('.clickable-row').each(function() {
                $(this).removeClass('active');
            });

            $('.table').on('click', '.clickable-row', function() {
                $(this).addClass('active').siblings().removeClass('active');
            });

            exibePainelInformacoes();
        }

        /**
         * Responsável por exibir o painel de erros de validações de todas as disciplinas.
         */
        function exibePainelErros() {

            if (self.exibePainelValidacoes == false) {
                self.exibePainelValidacoes = true;

                if (self.exibePainelInformacoes == false) {
                    setTimeout(function wait(){
                        $('#painel-validacoes').hide();
                        $('#painel-validacoes').slideToggle();

                        defineScrollParaPaienel('painel-validacoes');
                    }, 200);
                } else {
                    defineScrollParaPaienel('painel-validacoes');
                }

            } else {
                defineScrollParaPaienel('painel-validacoes');
            }

            self.exibePainelInformacoes = false;
        }

        function exibePainelInformacoes() {
            if (self.exibePainelInformacoes == false) {
                self.exibePainelInformacoes = true;

                if (self.exibePainelValidacoes == false) {
                    setTimeout(function wait(){
                        $('#painel-informacoes-turma-disciplina').hide();
                        $('#painel-informacoes-turma-disciplina').slideToggle();

                        defineScrollParaPaienel('painel-informacoes-turma-disciplina');
                    }, 200);
                } else {
                    defineScrollParaPaienel('painel-informacoes-turma-disciplina');
                }
            } else {
                defineScrollParaPaienel('painel-informacoes-turma-disciplina');
            }

            self.exibePainelValidacoes = false;
        }

        /**
         * Responsável por ocultar o painel de informações de todas as turmas/disciplinas
         */
        function ocultaPainelInformacoesEValidacoes() {
            $('#painel-validacoes').slideToggle();
            $('#painel-informacoes-turma-disciplina').slideToggle();

            self.disciplinaSelecionadaMatricula = [];

            self.exibePainelValidacoes = false;
            self.exibePainelInformacoes = false;
        }

        function filtraHorariosDaTurmaDisc(horariosTurmaDisc, codSubTurma) {
            var listaHorarios = horariosTurmaDisc.filter(function(x) {
                return x.CODSUBTURMA == codSubTurma;
            });

            if (!self.paramsEdu.UTILIZARTURMASUBTURMAINDEPENDENTE && listaHorarios.length == 0) {
                listaHorarios = horariosTurmaDisc.filter(function(x) {
                    return (x.CODSUBTURMA == null || x.CODSUBTURMA == '');
                });
            }

            return listaHorarios;
        }

        function preencheDadosDisciplinas(dataSet, callback) {
            self.disciplinasSDD.forEach(function (turmaDisc) {
                turmaDisc.HORARIOS = dataSet.HORARIOTURMADISC.filter(function (x) { return x.CODCOLIGADA == turmaDisc.CODCOLIGADA && x.IDTURMADISC == turmaDisc.IDTURMADISC; });
                turmaDisc.REQUISITOS = dataSet.REQUISITO.filter(function (x) { return x.CODCOLIGADA == turmaDisc.CODCOLIGADA && x.CODDISC == turmaDisc.CODDISC; });
                turmaDisc.SUBTURMAS = dataSet.SUBTURMAS.filter(function (x) { return x.CODCOLIGADA == turmaDisc.CODCOLIGADA && x.IDTURMADISC == turmaDisc.IDTURMADISC; });
                turmaDisc.PROFESSORTURMADISC = dataSet.PROFESSORTURMADISC.filter(function (x) { return x.CODCOLIGADA == turmaDisc.CODCOLIGADA && x.IDTURMADISC == turmaDisc.IDTURMADISC; });
                turmaDisc.POSSUICHOQUEHORARIO = false;
                turmaDisc.DISCIPLINASCHOQUE = [];
                turmaDisc.POSSUIERROCOREQUISITO = false;
                turmaDisc.DISCERROCORREQUISITO = [];
                turmaDisc.POSSUIERROVALIDACAO = false;
                turmaDisc.CODTURMA = turmaDisc.TURMA;
                turmaDisc.IDHABILITACAOFILIAL = self.habilitacaoSelecionada.IDHABILITACAOFILIAL;
                turmaDisc.NUMCREDITOSCOB = turmaDisc.CREDITOSCOB;
            });

            self.disciplinasMatriculadas.forEach(function (turmaDisc) {
                turmaDisc.HORARIOS = dataSet.HORARIOTURMADISC.filter(function (x) { return x.CODCOLIGADA == turmaDisc.CODCOLIGADA && x.IDTURMADISC == turmaDisc.IDTURMADISC; });
                turmaDisc.REQUISITOS = dataSet.REQUISITO.filter(function (x) { return x.CODCOLIGADA == turmaDisc.CODCOLIGADA && x.CODDISC == turmaDisc.CODDISC; });
                turmaDisc.SUBTURMAS = dataSet.SUBTURMAS.filter(function (x) { return x.CODCOLIGADA == turmaDisc.CODCOLIGADA && x.IDTURMADISC == turmaDisc.IDTURMADISC; });
                turmaDisc.PROFESSORTURMADISC = dataSet.PROFESSORTURMADISC.filter(function (x) { return x.CODCOLIGADA == turmaDisc.CODCOLIGADA && x.IDTURMADISC == turmaDisc.IDTURMADISC; });
                turmaDisc.POSSUICHOQUEHORARIO = false;
                turmaDisc.DISCIPLINASCHOQUE = [];
                turmaDisc.POSSUIERROCOREQUISITO = false;
                turmaDisc.DISCERROCORREQUISITO = [];
                turmaDisc.POSSUIERROVALIDACAO = false;
                turmaDisc.CODTURMA = turmaDisc.TURMA;
                turmaDisc.IDHABILITACAOFILIAL = self.habilitacaoSelecionada.IDHABILITACAOFILIAL;
                turmaDisc.NUMCREDITOSCOB = turmaDisc.CREDITOSCOB;
            });

            callback();
        }

        /**
         * Função responsável por criar um Tooltip com todos os erros de validação de uma disciplina.
         * São mensagens diferentes das exibidas no painel de validações.
         */
        function criaMensagemInformacaoUsuario() {
            self.possuiDisciplinaAdicionada = false;
            var possuiAlgumErro = false;
            var totalErrosValidacao = 0;

            self.disciplinasSDD.forEach(function(item) {
                var mensagemInformacao = '';
                var numMensagensErro = 0;
                var numMensagensAlerta = 0;

                if (item.ADICIONADO) {
                    self.possuiDisciplinaAdicionada = true;
                }

                if (item.POSSUIERROCOREQUISITO) {
                    mensagemInformacao = i18nFilter('l-requerCorequisito', '[]', 'js/aluno/matricula');
                    numMensagensErro++;

                    item.POSSUIERROVALIDACAO = true;
                }

                if (item.POSSUICHOQUEHORARIO) {
                    if (numMensagensErro > 0) {
                        mensagemInformacao += '\n';
                    }

                    if (self.paramsEdu.PERMITECHOQUEHORARIO) {
                        item.ICONEDEINFORMACAO = true;
                        mensagemInformacao += i18nFilter('l-alertaPossuiChoqueHorario', '[]', 'js/aluno/matricula');

                        numMensagensAlerta++;
                    } else {
                        item.ICONEDEINFORMACAO = false;
                        numMensagensErro++;
                        mensagemInformacao += i18nFilter('l-possuiChoqueHorario', '[]', 'js/aluno/matricula');
                    }

                    item.POSSUIERROVALIDACAO = true;
                }

                if (item.SUBTURMAOBRIGATORIANAOSELECIONADA) {
                    if (numMensagensErro > 0) {
                        mensagemInformacao += '\n';
                    }

                    item.ICONEDEINFORMACAO = false;
                    numMensagensErro++;
                    mensagemInformacao += i18nFilter('l-msg-subturma', '[]', 'js/aluno/matricula');

                    item.POSSUIERROVALIDACAO = true;
                }

                if (item.erroMaxCredito) {
                    if (numMensagensErro > 0) {
                        mensagemInformacao += '\n';
                    }

                    mensagemInformacao += i18nFilter('l-maxCredito', '[]', 'js/aluno/matricula');
                    numMensagensErro++;
                    item.POSSUIERROVALIDACAO = true;
                }

                if (item.erroMinCredito) {
                    if (numMensagensErro > 0) {
                        mensagemInformacao += '\n';
                    }

                    mensagemInformacao += i18nFilter('l-minCredito', '[]', 'js/aluno/matricula');
                    numMensagensErro++;
                    item.POSSUIERROVALIDACAO = true;
                }

                if (numMensagensErro > 0) {
                    possuiAlgumErro = true;
                    totalErrosValidacao += numMensagensErro;
                }

                if (numMensagensAlerta > 0) {
                    totalErrosValidacao += numMensagensAlerta;
                }

                item.InfoValidacao = mensagemInformacao;
            });

            if (possuiAlgumErro == false && (self.erroMinCredito == false && self.erroMaxCredito == false)) {
                self.exibePainelValidacoes = false;
                $scope.permiteAvancarEtapaDisc = true;
                self.totalErrosClient = totalErrosValidacao;
            } else {
                self.totalErrosClient = totalErrosValidacao;
                $scope.permiteAvancarEtapaDisc = false;
            }
        }

        function limpaErrosTodasDisciplinas() {
            self.disciplinasSDD.forEach(function(turmaDisc) {
                turmaDisc.POSSUICHOQUEHORARIO = false;
                turmaDisc.DISCIPLINASCHOQUE = [];
                turmaDisc.POSSUIERROCOREQUISITO = false;
                turmaDisc.DISCERROCORREQUISITO = [];
                turmaDisc.SUBTURMAOBRIGATORIANAOSELECIONADA = false;
                turmaDisc.POSSUIERROVALIDACAO = false;
            });
        }

        function validacoesIniciaisAposCarregarDisciplinasSDD() {
            validaSelecaoSubTurmas();
            criaMensagemInformacaoUsuario();
        }

        function validaHorariosMatriculados() {
            if (self.disciplinasSDD.length > 0) {
                self.horariosMatriculados = [];
                self.listaHorariosExibidaNoQuadroHorario = [];
                self.disciplinasSDD.filter(function (x) { return x.ADICIONADO == true; }).forEach(function (turmaDisc) {
                    adicionaHorariosTurmaDisc(turmaDisc);
                });
            }
        }

        function adicionaHorariosTurmaDisc(turmaDisc) {
            var horariosTurmaDisc;
            if (!turmaDisc.CODSUBTURMA) {
                horariosTurmaDisc = turmaDisc.HORARIOS.filter(function (x) { return x.IDTURMADISC == turmaDisc.IDTURMADISC && x.CODSUBTURMA == null; });
            }
            else {
                if (self.paramsEdu.UTILIZARTURMASUBTURMAINDEPENDENTE) {
                    horariosTurmaDisc = turmaDisc.HORARIOS.filter(function (x) {
                        return (x.IDTURMADISC == turmaDisc.IDTURMADISC &&
                            (x.CODSUBTURMA == null || x.CODSUBTURMA == turmaDisc.CODSUBTURMA));
                    });
                }
                else{
                    horariosTurmaDisc = turmaDisc.HORARIOS.filter(function (x) {
                        return x.IDTURMADISC == turmaDisc.IDTURMADISC && x.CODSUBTURMA == turmaDisc.CODSUBTURMA;
                    });

                    if (horariosTurmaDisc.length == 0){
                        horariosTurmaDisc = turmaDisc.HORARIOS.filter(function (x) {
                            return x.IDTURMADISC == turmaDisc.IDTURMADISC && (x.CODSUBTURMA == null || x.CODSUBTURMA == '');
                        });
                    }
                }
            }

            if (horariosTurmaDisc.length > 0) {
                self.horariosMatriculados = self.horariosMatriculados.concat(horariosTurmaDisc);
                horariosTurmaDisc.forEach(function (horario) {
                    validaChoqueHorario(horario);
                });
            }
        }

        function validaChoqueHorario(horario) {
            var horariosMesmoDia = self.horariosMatriculados.filter(function (x) {
                return x.IDTURMADISC != horario.IDTURMADISC && x.DIASEMANA == horario.DIASEMANA;
            });

            horariosMesmoDia.forEach(function (horarioMesmoDia) {

                var contaAlunoMatriculado = self.disciplinasMatriculadas.filter(function (x) {
                    return x.IDTURMADISC == horarioMesmoDia.IDTURMADISC
                });

                //Verifica se aluno não conta como aluno matriculado na turma. Caso não altera a situação após matrícula, confere na situação da disciplina, caso contrário, confere na situação de matrícula parametrizada
                if (contaAlunoMatriculado.length == 0 ||
                    (contaAlunoMatriculado[0].DIBLQALTSITMATDISCPRT === 'S' ?
                    (contaAlunoMatriculado[0].DIINCALUNODISC === 'S' || contaAlunoMatriculado[0].DIEMCURSO === 'S') :
                    (self.paramsEdu.CONTAALUNONATURMANOSTATUSDADISCIPLINA === 'True' || self.paramsEdu.DIEMCURSO === 'True')))
                {
                    // Verifica choque de horarios
                    if (horario.HORAINICIAL == horarioMesmoDia.HORAINICIAL && horario.HORAFINAL == horarioMesmoDia.HORAFINAL) {
                        validaChoqueDatas(horario, horarioMesmoDia);
                    }
                    // Verifica se a hora inical da disciplina a ser inserida está no intervalo de alguma outra disciplina
                    else if (horario.HORAINICIAL >= horarioMesmoDia.HORAINICIAL && horario.HORAINICIAL < horarioMesmoDia.HORAFINAL) {
                        validaChoqueDatas(horario, horarioMesmoDia);
                    }
                    // Verifica se a hora final da disciplina a ser inserida está no intervalo de alguma outra disciplina
                    else if (horario.HORAFINAL > horarioMesmoDia.HORAINICIAL && horario.HORAFINAL <= horarioMesmoDia.HORAFINAL) {
                        validaChoqueDatas(horario, horarioMesmoDia);
                    }
                    //Verifica se o horário da disciplina corrente possui a hora incial e final maiores. (Ex. disciplina corrente de 7 as 11 verificando horario com
                    //uma disciplina de 8 as 10)
                    else if (horario.HORAINICIAL < horarioMesmoDia.HORAINICIAL && horario.HORAFINAL > horarioMesmoDia.HORAFINAL) {
                        validaChoqueDatas(horario, horarioMesmoDia);
                    }
                }
            });
        }

        function validaChoqueDatas(horario, horarioMesmoDia) {
            var choqueHorario = false;
            var dataInicialHorario = null;
            var dataFinalHorario = null;
            var dataInicialMesmoDia = null;
            var dataFinalMesmoDia = null;
            var maxDate = new Date(8640000000000000);
            var minDate = new Date(-8640000000000000);

            if (horario.DATAINICIAL !== null && horarioMesmoDia !== null) {

                if (horario.DATAINICIAL) {
                    dataInicialHorario = new Date(horario.DATAINICIAL);
                }
                else {
                    dataInicialHorario = minDate;
                }

                if (horario.DATAFINAL) {
                    dataFinalHorario = new Date(horario.DATAFINAL);
                }
                else {
                    dataFinalHorario = maxDate;
                }

                if (horarioMesmoDia.DATAINICIAL) {
                    dataInicialMesmoDia = new Date(horarioMesmoDia.DATAINICIAL);
                }
                else {
                    dataInicialMesmoDia = minDate;
                }

                if (horarioMesmoDia.DATAFINAL) {
                    dataFinalMesmoDia = new Date(horarioMesmoDia.DATAFINAL);
                }
                else {
                    dataFinalMesmoDia = maxDate;
                }

                if (((dataInicialHorario >= dataInicialMesmoDia) && (dataInicialHorario <= dataFinalMesmoDia)) ||
                    ((dataFinalHorario >= dataInicialMesmoDia) && (dataFinalHorario <= dataFinalMesmoDia)) ||
                    ((dataInicialMesmoDia >= dataInicialHorario) && (dataInicialMesmoDia <= dataFinalHorario)) ||
                    ((dataFinalMesmoDia >= dataInicialHorario) && (dataFinalMesmoDia <= dataFinalHorario))) {
                        choqueHorario = true;
                    }
            }
            else {
                choqueHorario = true;
            }

            if (choqueHorario) {
                var turmaDiscAdicionando = self.disciplinasSDD.find(function (x) { return x.IDTURMADISC == horario.IDTURMADISC; });
                var turmaDiscChoque = self.disciplinasSDD.find(function (x) { return x.IDTURMADISC == horarioMesmoDia.IDTURMADISC; });
                turmaDiscAdicionando.POSSUICHOQUEHORARIO = true;
                //alternativa ao includes, pois o IE não o aceita
                if (!turmaDiscAdicionando.DISCIPLINASCHOQUE.indexOf(turmaDiscChoque.CODDISC + ' - ' + turmaDiscChoque.DISCIPLINA) == 0) {
                    turmaDiscAdicionando.DISCIPLINASCHOQUE.push(turmaDiscChoque.CODDISC + ' - ' + turmaDiscChoque.DISCIPLINA);
                }

                turmaDiscChoque.POSSUICHOQUEHORARIO = true;
                if (!turmaDiscChoque.DISCIPLINASCHOQUE.indexOf(turmaDiscAdicionando.CODDISC + ' - ' + turmaDiscAdicionando.DISCIPLINA) == 0) {
                    turmaDiscChoque.DISCIPLINASCHOQUE.push(turmaDiscAdicionando.CODDISC + ' - ' + turmaDiscAdicionando.DISCIPLINA);
                }
            }
        }

        function validaCoRequisitoTodasDisciplinas() {
            self.disciplinasSDD.filter(function (x) { return x.ADICIONADO == true; }).forEach(function (turmaDisc) {
                var executarValidacao = true;
                if(turmaDisc.LISTAESPERA == true && !self.paramsEdu.BLOQMATLESPCOR){
                    executarValidacao = false;
                }

                if(executarValidacao){
                    validaCoRequisitoDisciplina(turmaDisc);
                }
            });
        }

        function validaCoRequisitoDisciplina(turmaDisc) {
            if (angular.isDefined(turmaDisc.REQUISITOS) && turmaDisc.REQUISITOS.length > 0) {
                turmaDisc.REQUISITOS.forEach(function (requisito) {
                    if (requisito.TIPO == 'C') {
                        var turmaDiscReq = self.disciplinasSDD.filter(function (x) { return x.ADICIONADO == true && (x.CODDISC == requisito.CODDISCREQ ||
                            x.CODDISC == requisito.CODDISC); });
                        if (turmaDiscReq.length < 2) {
                            var correquisito = self.disciplinasSDD.filter(function (x) { return x.CODDISC === requisito.CODDISCREQ });
                            if (correquisito.length > 0) {
                                let equivalencias = self.disciplinasSDD.filter(function (x) { return x.CODDISCEQUIVALENTE === correquisito[0].CODDISC })
                                if (requisito.CODDISCREQ !== turmaDisc.CODDISC)
                                {
                                    if(!equivalencias.filter(function(x) { return x.ADICIONADO == true }).length > 0)
                                    {
                                        turmaDisc.POSSUIERROCOREQUISITO = true;
                                        turmaDisc.DISCERROCORREQUISITO.push(requisito.CODDISCREQ + ' - ' + requisito.DISCIPLINA);
                                    }
                                }
                            }
                        }
                    }
                });
            }
        }

        function validaSelecaoSubTurmas() {
            self.disciplinasSDD.filter(function (x) { return x.ADICIONADO == true; }).forEach(function (turmaDisc) {
                if (!eduMatriculaService.subTurmaObrigatoriaEstaSelecionada(self.paramsEdu, turmaDisc)) {
                    turmaDisc.SUBTURMAOBRIGATORIANAOSELECIONADA = true;
                }
            });
        }

        function somaCreditosDisciplinasMatriculadas() {
            self.somaCreditos = 0;
            self.totalDiscExtra = 0;
            self.totalDiscObrigatoria = 0;
            self.totalDiscOptEletiva = 0;
            self.somaCreditosFinanceiros = 0;
            self.totalDiscEquivalente = 0;

            self.disciplinasSDD.forEach(function (item) {
                if (item.ADICIONADO && item.MATRICULADO) {
                    var disciplinaMatriculada = self.disciplinasMatriculadas.find(function (x) { return x.CODCOLIGADA == item.CODCOLIGADA &&
                                                                                                x.IDTURMADISC == item.IDTURMADISC; });

                    if (disciplinaMatriculada) {
                        if (disciplinaMatriculada.DIBLQALTSITMATDISCPRT == 'S') { // Não altera a situação de matricula na disciplina
                            if (disciplinaMatriculada.DICREDITOCURSADO == 'S') { // Conta como credito cursado ou em curso
                                somaCreditos(disciplinaMatriculada);
                            }
                        }
                        else if (self.paramsEdu.DICREDITOCURSADO == 'True') { // Conta como credito cursado ou em curso
                            somaCreditos(disciplinaMatriculada);
                        }
                    }
                }
                if (item.ADICIONADO && (item.MATRICULADO == false || item.MATRICULADO == undefined)) {
                    somaCreditos(item);
                }
            });

            self.somaCreditos = self.somaCreditos.toFixed(self.parametrosEducacional.NumCasasDecimaisCredAcad);
            verificaErrosDeCredito();
        }

        function somaCreditos(disciplina) {
            self.somaCreditos += disciplina.CREDITOS;
            self.somaCreditosFinanceiros += disciplina.CREDITOSCOB;

            if (disciplina.TIPODISC == 'B') {
                self.totalDiscObrigatoria += 1;
            } else if (disciplina.TIPODISC == 'O' || disciplina.TIPODISC == 'E') {
                self.totalDiscOptEletiva += 1;
            } else if ((disciplina.TIPODISC == null && !disciplina.ISEQUIVALENTE) || disciplina.TIPODISC == 'EXT') {
                self.totalDiscExtra += 1;
            } else if (disciplina.ISEQUIVALENTE){
                self.totalDiscEquivalente += 1;
            }
        }

        function verificaErrosDeCredito() {
            if (self.habilitacaoSelecionada.CREDITOSFALTANTES < self.habilitacaoSelecionada.MINCREDPERIODO) {
                if (parseInt(self.somaCreditos) >= self.habilitacaoSelecionada.CREDITOSFALTANTES) {
                    self.erroMinCredito = false;
                    return;
                }
            }
            if (self.habilitacaoSelecionada.MAXCREDPERIODO > 0) {
                self.erroMaxCredito = self.somaCreditos > self.habilitacaoSelecionada.MAXCREDPERIODO;

                if (self.erroMaxCredito) {
                    self.tooltipMinMaxCreditos = i18nFilter('l-excedeuCreditos', '[]', 'js/aluno/matricula');
                    self.tooltipMinMaxCreditos = self.tooltipMinMaxCreditos.replace('@', self.habilitacaoSelecionada.MAXCREDPERIODO);
                    self.mensagemErroPainelValidacaoExcedidoNumeroMaximoCreditos = i18nFilter('l-excedido-numero-maximo-creditos', [self.habilitacaoSelecionada.MAXCREDPERIODO], 'js/aluno/matricula');
                }
            }

            if (self.habilitacaoSelecionada.MINCREDPERIODO > 0) {
                self.erroMinCredito = self.somaCreditos < self.habilitacaoSelecionada.MINCREDPERIODO;

                if (self.erroMinCredito) {
                    self.tooltipMinMaxCreditos = i18nFilter('l-quantMinCreditos', '[]', 'js/aluno/matricula');
                    self.tooltipMinMaxCreditos = self.tooltipMinMaxCreditos.replace('@', self.habilitacaoSelecionada.MINCREDPERIODO);
                    self.mensagemErroPainelValidacaoNumeroMinimoCreditos = i18nFilter('l-numero-minimo-creditos', [self.habilitacaoSelecionada.MINCREDPERIODO], 'js/aluno/matricula');
                }
            }
        }

        function executarContratoMatricula() {

            if (!eduMatriculaService.retornarEtapaAtual(self.etapas).realizado) {
                if (self.parametrosMatricula.ContratoDisponivelImpressao) {
                    preparaListaIdTurmaDisc(function() {

                        self.assinaturaContrato.geraManifesto = self.parametrosMatricula.UtilizaAssinaturaContratoComToken;

                        if(self.parametrosMatricula.UtilizarRelatorioParaContrato){

                            if (self.habilitacaoSelecionada.IDRELATORIOCONTRATOREPORTS > 0) {
                                self.objRelatorioContrato = {
                                    codColigadaRelatorio: self.habilitacaoSelecionada.CODCOLRELATORIOCONTRATOREPORTS,
                                    idRelatorio: self.habilitacaoSelecionada.IDRELATORIOCONTRATOREPORTS,
                                    idHabilitacaoFilial: self.habilitacaoSelecionada.IDHABILITACAOFILIAL,
                                    idPerLet: self.habilitacaoSelecionada.IDPERLET,
                                    listaIdTurmaDiscSelecionadas: self.listaIdTurmaDisc,
                                    codPlanoDePagamentoSelecionado: self.planoPagamentoSelecionado,
                                    gerarManifesto: false
                                }

                                self.TokenAssinaturaContratoValido = false;

                                gerarRelatorioReports(exibirModalContratoMatricula(true));

                            } else{
                                totvsNotification.notify({
                                    type: 'error',
                                    title: i18nFilter('l-Atencao'),
                                    detail: i18nFilter('l-msg-relatorio-contrato-nao-econtrado', '[]', 'js/aluno/matricula')
                                });

                                return;
                            }

                        } else {
                            self.objRelatorioContrato = {
                                idHabilitacaoFilial: self.habilitacaoSelecionada.IDHABILITACAOFILIAL,
                                idPerLet: self.habilitacaoSelecionada.IDPERLET,
                                listaIdTurmaDiscSelecionadas: self.listaIdTurmaDisc,
                                codPlanoDePagamentoSelecionado: self.planoPagamentoSelecionado,
                                gerarManifesto: false
                            }

                            eduMatriculaService.retornaContratoMatriculaAsync(self.objRelatorioContrato, function (result) {
                                if (!!result && (!!result.Contrato || result.Contrato == '')) {
                                    self.assinaturaContrato.textoContrato = result.Contrato;
                                    self.textoContratoFinanceiro = $sce.trustAsHtml(result.Contrato);

                                    self.TokenAssinaturaContratoValido = false;
                                    exibirModalContratoMatricula(true);
                                }
                            });
                        }
                    });
                } else {
                    self.AceiteContrato = true;
                    realizarMatricula();
                }
            } else {
                eduMatriculaService.avancarEtapa(self.etapas);
            }
        }

        function imprimirRelatorioContrato(){
            eduMatriculaService.exibirOuSalvarPDF(self.pdfRelatorioContrato);
        }

        function exibirModalContratoMatricula(exibir) {
            if (exibir) {
                self.htmlParaImpressao = self.textoContratoFinanceiro;
                $('#modalContratoMatricula').modal('show');
            } else {
                $('#modalContratoMatricula').modal('hide');
            }
        }

        function exibirModalContratoMatriculaManifesto() {
            self.objRelatorioContrato.gerarManifesto = true;

            if (self.parametrosMatricula.UtilizarRelatorioParaContrato) {
                gerarRelatorioReports(exibirModalContratoMatricula(true));
            } else {
                eduMatriculaService.retornaContratoMatriculaAsync(self.objRelatorioContrato, function (result) {
                    if (!!result && (!!result.Contrato || result.Contrato == '')) {
                        self.assinaturaContrato.textoContrato = result.Contrato;
                        self.textoContratoFinanceiro = $sce.trustAsHtml(result.Contrato);

                        exibirModalContratoMatricula(true);
                    }
                });
            }
        }

        function exibirModalComprovante(exibir) {
            if (exibir) {
                self.htmlParaImpressao = self.textoComprovante;
                $('#modalComprovanteMatricula').modal('show');
            } else {
                $('#modalComprovanteMatricula').modal('hide');
            }
        }

        /**
         * Executa o processo de confirmação de matrícula do Ensino Superior.
         */
        function realizarMatricula() {
            if(self.parametrosMatricula.UtilizaAssinaturaContratoComToken){
                if (self.AceiteContrato !== true || self.TokenAssinaturaContratoValido !== true) {
                    totvsNotification.notify({
                        type: 'error',
                        title: i18nFilter('l-Atencao'),
                        detail: i18nFilter('l-msg-necessario-aceite-contrato-e-Validacao-Token', '[]', 'js/aluno/matricula')
                    });

                    return;
                }
            } else {
                if (self.AceiteContrato !== true) {
                    totvsNotification.notify({
                        type: 'error',
                        title: i18nFilter('l-Atencao'),
                        detail: i18nFilter('l-msg-necessario-aceite-contrato', '[]', 'js/aluno/matricula')
                    });

                    return;
                }
            }

            exibirModalContratoMatricula(false);

            eduMatriculaService.efetuarEnsinoSuperiorMatriculaAsync(
                self.listaDiscAlteradas,
                self.listaDiscAdd,
                self.matricItensListDel,
                self.listaDiscSubstituicao,
                self.planoPagamentoSelecionado,
                self.habilitacaoSelecionada.IDHABILITACAOFILIAL,
                self.habilitacaoSelecionada.IDPERLET,
                self.assinaturaContrato,
                self.objRelatorioContrato, function (result) {
                if (result.$messages[0].type == 'success') {

                    if (self.parametrosMatricula.MensagemConfirmacaoMatricula) {
                        self.mensagemConfirmacaoMatricula = self.parametrosMatricula.MensagemConfirmacaoMatricula;
                    }
                    else {
                        self.mensagemConfirmacaoMatricula = i18nFilter('l-msg-default-matricula-confirmada', '[]', 'js/aluno/matricula');
                    }

                    self.contratoDisponivelImpressao = self.parametrosMatricula.ContratoDisponivelImpressao;
                    self.comprovanteDisponivelImpressao = self.parametrosMatricula.ComprovanteDisponivelImpressao;

                    eduMatriculaService.liberarProximaEtapa(self.etapas);
                    eduMatriculaService.avancarEtapa(self.etapas);

                    self.processoFinalizado = true;

                    if (result['Lancamentos'].data && result['Lancamentos'].data.BOLETOS.SBoletos.length > 0) {
                        self.ExcluiPagtoCartaoPorMatrizAplicada = result['Lancamentos'].data.EXCLUIPAGCARTAOPORMATRIZAPLICADA;
                        self.boleto = result['Lancamentos'].data.BOLETOS.SBoletos[0];
                    }
                }
            });
        }

        function geraQuadroHorario() {
            self.horariosMatriculados = resolveDiasSemana(self.horariosMatriculados);

            ordenaHorariosDoQuadroHorario();
            defineOrdemApresentacaoDeHorariosDoQuadroHorario();
            verificaHorariosFinalSemana();
            adicionaHorariosNaListaDoQuadroHorario();
        }

        function verificaHorariosFinalSemana() {
            self.diasSemana = ['1', '2', '3', '4', '5', '6', '7'];
            self.possuiHorarioDomingo = self.horariosMatriculados.filter(function (x) { return x.CODDIA == 1; }).length > 0;
            self.possuiHorarioSabado = self.horariosMatriculados.filter(function (x) { return x.CODDIA == 7; }).length > 0;

            removeDomingoSemHorarioQuadroHorario();
            removeSabadoSemHorarioQuadroHorario();
            verificaSeSabadoDomingoTemHorarioQuadroHorario();
            ordenaDiasSemanaEDefineLarguraDoGridQuadroHorario();
        }

        function removeDomingoSemHorarioQuadroHorario() {
            if (self.possuiHorarioDomingo === false && self.usuarioVisualizandoFinalSemanaQuadroHorario === false) {
                self.diasSemana.shift();
            }
        }

        function removeSabadoSemHorarioQuadroHorario() {
            if (self.possuiHorarioSabado === false && self.usuarioVisualizandoFinalSemanaQuadroHorario === false) {
                self.diasSemana.pop();
            }
        }

        function verificaSeSabadoDomingoTemHorarioQuadroHorario(){
            if (self.possuiHorarioSabado === true && self.possuiHorarioDomingo === true) {
                self.exibeOpcaoFinalSemanaQuadroHorario = false;
            } else {
                self.exibeOpcaoFinalSemanaQuadroHorario = true;
            }
        }

        function ordenaDiasSemanaEDefineLarguraDoGridQuadroHorario() {
            self.diasSemana.sort();
            self.larguraColQuadroHorario =  90 / self.diasSemana.length;
        }

        function ordenaHorariosDoQuadroHorario() {
            self.horariosMatriculados.sort(function(a, b) {
                var database = '01/01/1984 ';

                //Ordena primeiro pela hora de início da aula
                if (new Date(database + a.HORAINICIAL) > new Date(database + b.HORAINICIAL)) {
                    return 1;
                }
                else if (new Date(database + a.HORAINICIAL) < new Date(database + b.HORAINICIAL)) {
                    return -1;
                }
                else {
                    //Se o horário de início for igual a algum outro horário, ordena também pelo horário final.
                    //Já que o horário final pode ser anterior ou posterior de outro horário que iniciou no mesmo momento.
                    if (new Date(database + a.HORAFINAL) > new Date(database + b.HORAFINAL)) {
                        return 1;
                    }
                    else if (new Date(database + a.HORAFINAL) < new Date(database + b.HORAFINAL)) {
                        return -1;
                    }

                    return 0;
                }
            });
        }

        function defineOrdemApresentacaoDeHorariosDoQuadroHorario() {
            var itemAnterior;
            self.horariosMatriculados.forEach(function(item, i) {
                if (i == 0) {
                    item.ROW = 1;
                    itemAnterior = item;
                } else if (i > 0) {
                    if (item.HORAINICIAL == itemAnterior.HORAINICIAL && item.HORAFINAL == itemAnterior.HORAFINAL) {
                        item.ROW = itemAnterior.ROW;
                    } else if (item.HORAINICIAL >= itemAnterior.HORAINICIAL || (item.HORAINICIAL == itemAnterior.HORAINICIAL && item.HORAFINAL > itemAnterior.HORAFINAL)) {
                        item.ROW = itemAnterior.ROW+1;
                        itemAnterior = item;
                    }
                }

                var disciplina = self.disciplinasSDD.filter(function (x) { return x.CODCOLIGADA == item.CODCOLIGADA && x.IDTURMADISC == item.IDTURMADISC; });

                if (disciplina.length > 0) {
                    item.TURMADISC = disciplina[0];
                }
            });
        }

        function adicionaHorariosNaListaDoQuadroHorario() {
            self.horariosMatriculados.forEach(function (horarioItem) {

                var possuiHorario = self.listaHorariosExibidaNoQuadroHorario.filter(function (horarioDoQuadroItem) {
                    return horarioDoQuadroItem.CODDIA == horarioItem.CODDIA &&
                        horarioDoQuadroItem.IDTURMADISC == horarioItem.IDTURMADISC &&
                        horarioDoQuadroItem.HORAINICIAL == horarioItem.HORAINICIAL &&
                        horarioDoQuadroItem.HORAFINAL == horarioItem.HORAFINAL;
                    });

                    if (possuiHorario.length === 0) {
                        self.listaHorariosExibidaNoQuadroHorario.push(horarioItem);
                    }
            });
        }

        function possuiDiscNoHorario(horario, codDia) {

            var disciplinasDoHorario = self.horariosMatriculados.filter(function (x) { return x.CODDIA == codDia &&
                x.HORAINICIAL == horario.HORAINICIAL &&
                x.HORAFINAL == horario.HORAFINAL; });

            if (disciplinasDoHorario.length > 0) {
                return true;
            } else {
                return false;
            }
        }

        function possuiErroValicaoHorario(horario, codDia) {

            var possuiErroValidacao = self.horariosMatriculados.filter(function (x) { return x.CODDIA == codDia &&
                x.HORAINICIAL == horario.HORAINICIAL &&
                x.HORAFINAL == horario.HORAFINAL &&
                x.TURMADISC.POSSUIERROVALIDACAO == true; });

            if (possuiErroValidacao.length > 0) {
                return true;
            } else {
                return false;
            }
        }

        function retornaCorFundoQuadroHorario(horario, codDia) {

            var possuiErroValidacao = self.horariosMatriculados.filter(function (x) { return x.CODDIA == codDia &&
                x.HORAINICIAL == horario.HORAINICIAL &&
                x.HORAFINAL == horario.HORAFINAL &&
                x.TURMADISC.POSSUIERROVALIDACAO == true; });

            if (possuiErroValidacao.length > 0) {

                if (possuiErroValidacao[0].TURMADISC.ICONEDEINFORMACAO == true) {
                    return '#f7f5bf';
                } else {
                    return '#ffe4e4';
                }

            } else {
                return '';
            }
        }

        function disciplinasDoHorarioModal(horario, codDia, filtraApenasPorDia) {
            $('#modalDisciplinasDoHorario').modal('show');

            codDia = parseInt(codDia);
            self.discDisponiveisHorario = [];
            self.disciplinasSDD.forEach(function (turmaDisc) {

                if (turmaDisc.ADICIONADO === true || turmaDisc.HORARIOS.length === 0) {
                    return;
                }

                turmaDisc.HORARIOS.forEach(function(horarioItem) {
                    var disciplinaJaEstaIncluidaNaLista = self.discDisponiveisHorario.filter(function (x) {
                        return x.IDTURMADISC === turmaDisc.IDTURMADISC;
                    }).length > 0;

                    if (disciplinaJaEstaIncluidaNaLista) return;

                    if (filtraApenasPorDia === true) {
                        if (horarioItem.CODDIA === codDia) {
                            self.discDisponiveisHorario.push(turmaDisc);
                        }
                    } else {
                        if (horarioItem.CODDIA === codDia &&
                            horarioItem.HORAINICIAL >= horario.HORAINICIAL &&
                            horarioItem.HORAFINAL <= horario.HORAFINAL) {

                            self.discDisponiveisHorario.push(turmaDisc);
                        }
                    }
                });
            });

            if (self.discDisponiveisHorario.length > 0)
                self.disciplinasAdicionadasNaGrade = self.discDisponiveisHorario.filter(function (disciplina) { return disciplina.ADICIONADO != undefined });
        }

        function exibeOcultaFinalSemana() {
            self.usuarioVisualizandoFinalSemanaQuadroHorario = !self.usuarioVisualizandoFinalSemanaQuadroHorario;

            geraQuadroHorario();

            if (self.quadroHorarioMinimizado === true) {
                minimizaPainelQuadroHorario();
            }
        }

        function exibeModalDisciplinasExtras() {
            self.disciplinasExtras = [];

            $('#modalDisciplinasExtras').modal('show');
            $('#modalDisciplinasExtras').on('shown.bs.modal', function () {
                $('#filtroDisciplina').val('');
                $('#filtroDisciplina').focus();
            });
        }

        function pesquisaDisciplinasExtras() {
            var codDiscSDD = '';

            self.disciplinasSDD.forEach(function(discSDD) {
                codDiscSDD += discSDD.CODDISC + '*@';
            });

            codDiscSDD = codDiscSDD.slice(0, -2);

            if ($('#filtroDisciplina').val().length >= 5){
                eduMatriculaService.retornaPesquisaDisciplinasExtrasAsync(self.habilitacaoSelecionada.IDHABILITACAOFILIAL, self.habilitacaoSelecionada.IDPERLET, $('#filtroDisciplina').val(), codDiscSDD,
                    self.startIndexDisciplinaExtra, self.endIndexDisciplinaExtra,
                    function (result) {
                        trataRetornoDisciplinaExtra(result);
                    }
                );
            } else {
                totvsNotification.notify({
                    type: 'error',
                    title: i18nFilter('l-Atencao'),
                    detail: i18nFilter('l-msg-erro-buscar-disciplina-extra-caracteres', '[]', 'js/aluno/matricula')
                });
            }
        }

        function carregaTodasDisciplinasExtras(acao){
            var codDiscSDD = '';
            var pesquisaUsuario = '';
            var hasNext = false;

            self.disciplinasSDD.forEach(function(discSDD) {
                codDiscSDD += discSDD.CODDISC + '*@';
            });

            codDiscSDD = codDiscSDD.slice(0, -2);

            if(acao === '_hasNext_') {
                self.startIndexDisciplinaExtra = self.startIndexDisciplinaExtra + 20;
                self.endIndexDisciplinaExtra = self.endIndexDisciplinaExtra + 20;
                hasNext = true;
            } else {
                self.startIndexDisciplinaExtra = 1;
                self.endIndexDisciplinaExtra = 20;
            }

            eduMatriculaService.retornaPesquisaDisciplinasExtrasAsync(self.habilitacaoSelecionada.IDHABILITACAOFILIAL, self.habilitacaoSelecionada.IDPERLET, pesquisaUsuario, codDiscSDD,
                    self.startIndexDisciplinaExtra, self.endIndexDisciplinaExtra,
                    function (result) {
                        trataRetornoDisciplinaExtra(result, hasNext);
                    }
                );
        }

        function trataRetornoDisciplinaExtra(disciplinasExtras, hasNext) {

            disciplinasExtras.SDISCIPLINA.forEach(function(disciplina) {

                disciplina.TURMADISC = [];

                var turmaDiscExtra = disciplinasExtras.TURMASDISCEXTRAS.filter(function (x) { return x.CODCOLIGADA == disciplina.CODCOLIGADA &&
                    x.CODDISC == disciplina.CODDISC; });

                if (turmaDiscExtra) {
                    disciplina.TURMADISC = appendObjTo(disciplina.TURMADISC, turmaDiscExtra);
                }

                if (disciplina.TURMADISC.length > 0) {

                    disciplina.TURMADISC.forEach(function(turmaDiscAtual) {
                        turmaDiscAtual.IDHABILITACAOFILIAL = self.habilitacaoSelecionada.IDHABILITACAOFILIAL;
                        turmaDiscAtual.CODPERIODO = 0;
                        turmaDiscAtual.PERIODO = i18nFilter('l-periodoDiscExtra', '[]', 'js/aluno/matricula');

                        if (!turmaDiscAtual.SUBTURMAS) {
                            turmaDiscAtual.SUBTURMAS = [];

                            if(disciplinasExtras.SUBTURMAS) {
                                var subturmas = disciplinasExtras.SUBTURMAS.filter(function (x) { return x.CODCOLIGADA == turmaDiscAtual.CODCOLIGADA &&
                                    x.IDTURMADISC == turmaDiscAtual.IDTURMADISC; });

                                if (subturmas) {
                                    turmaDiscAtual.SUBTURMAS = appendObjTo(turmaDiscAtual.SUBTURMAS, subturmas);
                                }
                            }
                        }

                        if (turmaDiscAtual.HORARIOS == undefined) {
                            turmaDiscAtual.HORARIOS = [];

                            var horarios = disciplinasExtras.HORARIOS.filter(function (x) { return x.CODCOLIGADA == turmaDiscAtual.CODCOLIGADA &&
                                x.IDTURMADISC == turmaDiscAtual.IDTURMADISC; });

                            if (horarios) {
                                turmaDiscAtual.HORARIOS = appendObjTo(turmaDiscAtual.HORARIOS, horarios);
                                turmaDiscAtual.HORARIOS = resolveDiasSemana(turmaDiscAtual.HORARIOS);
                            }
                        }

                        if (turmaDiscAtual.PROFESSORTURMADISC == undefined) {
                            turmaDiscAtual.PROFESSORTURMADISC = [];

                            var professores = disciplinasExtras.PROFESSORTURMADISC.filter(function (x) { return x.CODCOLIGADA == turmaDiscAtual.CODCOLIGADA &&
                                x.IDTURMADISC == turmaDiscAtual.IDTURMADISC; });

                            if (professores) {
                                turmaDiscAtual.PROFESSORTURMADISC = appendObjTo(turmaDiscAtual.PROFESSORTURMADISC, professores);
                            }
                        }
                    });

                    disciplina.TURMADISC = resolveTipoDisciplina(disciplina.TURMADISC);
                }
            });

            if(hasNext){
                self.disciplinasExtras.SDISCIPLINA = self.disciplinasExtras.SDISCIPLINA.concat(disciplinasExtras.SDISCIPLINA);
                self.disciplinasExtras.TURMASDISCEXTRAS = self.disciplinasExtras.TURMASDISCEXTRAS.concat(disciplinasExtras.TURMASDISCEXTRAS);
                self.disciplinasExtras.HORARIOS = self.disciplinasExtras.HORARIOS.concat(disciplinasExtras.HORARIOS);
                self.disciplinasExtras.PROFESSORTURMADISC = self.disciplinasExtras.PROFESSORTURMADISC.concat(disciplinasExtras.PROFESSORTURMADISC);

            }else{
                self.disciplinasExtras = disciplinasExtras;
            }
        }

        function appendObjTo(meuArray, novoObjeto) {
            if (meuArray == undefined) {
                return novoObjeto;
            }

            return meuArray.concat(novoObjeto);
        }

        function turmasDisciplinasExtras(disciplina) {
            if (disciplina != null) {
                eduMatriculaService.retornaTurmasDisciplinasExtrasAsync(self.habilitacaoSelecionada.IDPERLET, disciplina.CODDISC,
                    function (result) {
                        disciplina.turmasDisciplinasExtras = result;
                    });
            }
        }

        function resolveDiasSemana(horarios) {
            horarios.forEach(function(horario) {
                switch (parseInt(horario.DIASEMANA)) {
                    case 1:
                        horario.DIASEMANA = $filter('i18n')('l-domingo', [], 'js/aluno/matricula');
                        horario.CODDIA = 1;
                        break;
                    case 2:
                        horario.DIASEMANA = $filter('i18n')('l-segunda-feira', [], 'js/aluno/matricula');
                        horario.CODDIA = 2;
                        break;
                    case 3:
                        horario.DIASEMANA = $filter('i18n')('l-terca-feira', [], 'js/aluno/matricula');
                        horario.CODDIA = 3;
                        break;
                    case 4:
                        horario.DIASEMANA = $filter('i18n')('l-quarta-feira', [], 'js/aluno/matricula');
                        horario.CODDIA = 4;
                        break;
                    case 5:
                        horario.DIASEMANA = $filter('i18n')('l-quinta-feira', [], 'js/aluno/matricula');
                        horario.CODDIA = 5;
                        break;
                    case 6:
                        horario.DIASEMANA = $filter('i18n')('l-sexta-feira', [], 'js/aluno/matricula');
                        horario.CODDIA = 6;
                        break;
                    case 7:
                        horario.DIASEMANA = $filter('i18n')('l-sabado', [], 'js/aluno/matricula');
                        horario.CODDIA = 7;
                        break;
                    default:
                        break;
                }
            });

            return horarios;
        }

        function resolveTipoDisciplina(turmaDisc) {

            turmaDisc.forEach(function(item) {
                switch (item.TIPOTURMA) {
                    case 'P':
                        item.TIPOTURMA = $filter('i18n')('l-presencial', [], 'js/aluno/matricula');
                        break;
                    case 'D':
                        item.TIPOTURMA = $filter('i18n')('l-distancia', [], 'js/aluno/matricula');
                        break;
                    case 'S':
                        item.TIPOTURMA = $filter('i18n')('l-semipresencial', [], 'js/aluno/matricula');
                        break;
                    default:
                        break;
                }
            });

            return turmaDisc;
        }

        function criaListaDisciplinas(disciplinasSDD, callback) {
            self.matricItensList = [];
            self.matricItensValidaRequisitos = [];
            self.matricItensListDel = [];
            self.listaDiscAdd = [];
            self.listaDiscAlteradas = [];
            self.listaDiscSubstituicao = [];
            disciplinasSDD.forEach(function(item){

                // Copia a disciplina para poder deletar alguns dados desnecessários para validações e confirmação de matrícula
                var itemCopy = angular.copy(item);

                itemCopy['RA'] = self.habilitacaoSelecionada.RA;
                itemCopy['CODTIPOCURSO'] = self.habilitacaoSelecionada.CODTIPOCURSO;

                // Campos solicitados pela customização
                itemCopy['CODUSUARIO'] = $rootScope.InformacoesLogin.login;
                itemCopy['MATRICULAWEB'] = true;
                itemCopy['DATAMATRICULA'] = new Date().toJSON().slice(0, 10).replace(/-/g, '/');

                delete itemCopy.PROFESSORTURMADISC;
                delete itemCopy.HORARIOS;
                delete itemCopy.SUBTURMAS;

                //Popula lista de disciplinas matrículadas
                if(itemCopy.ADICIONADO){
                    self.matricItensList.push(itemCopy);

                    if (self.disciplinasMatriculadas.find(function (x) { return x.IDTURMADISC == itemCopy.IDTURMADISC; })) {
                        self.listaDiscAlteradas.push(itemCopy);
                    }
                    else {
                        if(itemCopy.LISTAESPERA){
                            itemCopy.CODSTATUS = self.paramsEdu.STATUSLISTAESPERA;
                        } else{
                            itemCopy.CODSTATUS = self.paramsEdu.STATUSDISCIPLINA;
                        }

                        self.listaDiscAdd.push(itemCopy);
                        self.matricItensValidaRequisitos.push(itemCopy);
                    }
                }

                //Popula lista de disciplinas excluídas
                if (itemCopy.ADICIONADO == false && self.disciplinasMatriculadas.find(function (x) { return x.IDTURMADISC == itemCopy.IDTURMADISC; })) {
                    self.matricItensListDel.push(itemCopy);
                }
            });

            if (angular.isFunction(callback)) {
                callback();
            }
        }

        function montaErroValidacaoPreCoRequisito(codDisciplina, nomeDisciplina, turma, logExcecao) {
            self.erroValidacaoPreCoRequisito += i18nFilter('l-msg-precorequisito-inicio', '[]', 'js/aluno/matricula') + codDisciplina + ' - ' + nomeDisciplina + '(' + turma + ')' + '<br/>';
            self.erroValidacaoPreCoRequisito += i18nFilter('l-msg-precorequisito-final', '[]', 'js/aluno/matricula');
            self.erroValidacaoPreCoRequisito += logExcecao + '<br/><br/>';

            exibePainelErros();
        }

        function montaErroValidacaoServerPreCoRequisito(codDisciplina, nomeDisciplina, turma, logExcecao) {

            var mensagemUsuario = {
                CODDISC: codDisciplina,
                DISCIPLINA: nomeDisciplina,
                TURMA: turma,
                MENSAGEM: logExcecao
            }

            return mensagemUsuario;
        }

        function calculaPlanoPagamento() {
            if ($('.slideout').hasClass('slideoutOpen') == false) {

                if (self.paramsEdu.VISUALIZARSIMULACAOPAGTO) {
                    carregaPlanosPagamento(true);
                } else {
                    self.renderizarSlideOut = false;
                }
            }

            $('.slideout').toggleClass('slideoutOpen');
        }

        // Função utilizada para formatar o campo 'Valor simulado' do grid de detalhamento das parcelas.
        function formataMoeda(item) {
            return $filter('currency')(item.valorLiquido, undefined, self.paramsEdu.FINNUMCASASDECIMAIS);
        }

        function exibirOpcoesPagamento() {
            return self.boleto !== null && (exibeBtnPagamentoBoleto() || exibeBtnPagamentoCartao() || exibeBtnPix());
        }

        function exibirDadosPagCartao() {
            eduFinanceiroFactory.exibirDadosPagCartao(self.boleto.IDBOLETO);
        }

        function exibeBtnPagamentoCartao () {
            self.parametrosEducacional["ExcluiPagtoCartaoPorMatrizAplicada"] = self.ExcluiPagtoCartaoPorMatrizAplicada;
            return eduFinanceiroService.permitePagamentoCartao(self.boleto, self.parametrosEducacional);
        }

        function exibeBtnPagamentoBoleto() {
            return eduFinanceiroService.permitePagamentoBoleto(self.boleto, self.parametrosEducacional);
        }

        function exibeBtnPix() {
            return eduFinanceiroService.permitePagamentoPix(self.boleto, self.parametrosEducacional);
        }

        function exibirDadosPix()
        {
            if (self.boleto) {
                eduFinanceiroService.visualizarPix(self.boleto.CODCOLIGADA, self.boleto.IDBOLETO, function(obj) {});
            }
        }

        function emitirBoleto() {
            if (self.boleto) {
                eduFinanceiroService.visualizarBoletoMatricula(self.boleto.IDBOLETO, self.boleto.NOSSONUMERO, self.boleto.DATAVENCIMENTO, self.parametrosEducacional, self.boleto.IDPERLET, function (objInfoBoleto) {
                    self.objInfoBoleto = objInfoBoleto;
                });
            }
        }

        /**
         * Exibir opção de copiar código de barras do boleto
         *
         * @returns {Boolean}
         */
        function exibirCodigoBarras() {
            return self.boleto !== null && self.parametrosEducacional.PermiteGerarCodigoBarras;
        }
        /**
         * Exibe código de barras do boleto
         */
        function exibirDadosCodigoBarras() {
            if (self.boleto) {
                eduFinanceiroFactory.obterCodigoBarrasBoleto(self.boleto.CODCOLIGADA, self.boleto.IDBOLETO, self.boleto.NOSSONUMERO, self.boleto.DATAVENCIMENTO, function (result) {
                    if (result && result.length > 0) {
                        if (result[0].IPTE) {
                            eduFinanceiroFactory.exibirDadosCodigoBarras(result[0].IPTE, boleto.VALORORIGINAL)
                        }
                    }
                });
            }
        }

        function retornaLarguraColunaDisciplinaAdicionada(colunaCodigoDisciplina) {
            var disciplinasEncontradas = self.disciplinasSDD.filter(function (x) { return x.ADICIONADO == true &&
                x.TURMA.length > 11 ||
                x.CODDISC.length > 7; });

            if (disciplinasEncontradas.length > 0) {
                if (colunaCodigoDisciplina) {
                    return "'col-xs-4 col-sm-3'";
                } else {
                    return "'col-xs-5 col-sm-7'";
                }
            } else {
                if (colunaCodigoDisciplina) {
                    return "'col-xs-3 col-sm-2'";
                } else {
                    return "'col-xs-6 col-sm-8'";
                }
            }
        }

        function defineScrollParaPaienel(painelASerExibido) {
            setTimeout(function() {
                $('html, body').animate({
                        scrollTop: $('#' + painelASerExibido).offset().top - 48
                    }, 500);
                }, 210, function(){ isScrolling = false; }
            );
        }

        function redirecionaScrollPara(idComponente) {
             defineScrollParaPaienel(idComponente);
        }

        function executaTutorialMatricula() {
            var passosTutorial = [
                {
                    selector:'[data-tutorial="quadro-horario"]',
                    event_type:'next',
                    description: i18nFilter('l-msg-tutorial-quadro-horarios', '[]', 'js/aluno/matricula'),
                    timeout: 500,
                    onBeforeStart: function() {
                        window.scrollTo(0, 0);
                        abreAccordionDisciplinas();
                    }
                },
                {
                    selector:'[data-tutorial="quantidade-erros"]',
                    event:'click',
                    description: i18nFilter('l-msg-tutorial-quantidade-erros', '[]', 'js/aluno/matricula'),
                    showSkip: false,
                    timeout: 500,
                    onBeforeStart: function () {
                        redirecionaScrollPara('quadro-quantidade-erros');
                    }
                },
                {
                    selector:'[data-tutorial="painel-validacoes"]',
                    event_type:'next',
                    description: i18nFilter('l-msg-tutorial-painel-validacoes', '[]', 'js/aluno/matricula'),
                    timeout: 600
                },
                {
                    selector:'.table-matricula .clickable-row',
                    event:'click',
                    description: i18nFilter('l-msg-tutorial-disciplinas-sdd', '[]', 'js/aluno/matricula'),
                    showSkip: false,
                    scrollAnimationSpeed: 500,
                    onBeforeStart: function () {
                        var rowDiscMatricula = $('.table-matricula .clickable-row');
                        redirecionaScrollPara(rowDiscMatricula[0].id);
                    }
                },
                {
                    selector:'[data-tutorial="informacoes-turma-disciplina"]',
                    event_type:'next',
                    description: i18nFilter('l-msg-tutorial-informacoes-turma-disciplina', '[]', 'js/aluno/matricula'),
                    scrollAnimationSpeed: 900
                }
              ];

            var tutorialDisciplinaExtra = {
                selector:'[data-tutorial="disciplinas-extras"]',
                description: i18nFilter('l-msg-tutorial-disciplinas-extras', '[]', 'js/aluno/matricula'),
                skipButton: {text: 'Finalizar'},
                showNext: false,
                onBeforeStart: function () {
                    redirecionaScrollPara('add-disc-extra');
                },
                scrollAnimationSpeed : 900
            };
            var tutorialSdd = {
                selector:'[data-tutorial="sugestao-disciplina"]',
                description: i18nFilter('l-msg-tutorial-sugestao-disciplina', '[]', 'js/aluno/matricula'),
                onBeforeStart: function () {
                    redirecionaScrollPara('panel-sugestao-disciplinas');
                },
                timeout: 700
            };

              if(self.paramsEdu.VISUALIZAROPCAOMATDISCEXTRA == true){

                tutorialSdd.event_type = 'next';
                passosTutorial.push(tutorialSdd);
                passosTutorial.push(tutorialDisciplinaExtra);
              }
              else
              {
                tutorialSdd.skipButton = {text: 'Finalizar'};
                tutorialSdd.showNext = false;
                passosTutorial.push(tutorialSdd);
              }

              var enjoyhint_instance = new EnjoyHint({});
              enjoyhint_instance.setScript(passosTutorial, $rootScope.InformacoesLogin.login);
              enjoyhint_instance.runScript();
        }

        function abreAccordionDisciplinas(){
            //Abre o primeiro item do Accordion de Disciplinas matriculadas, caso esteja fechada.
            setTimeout(function wait(){
                if (!$('.totvs-group span').eq(1).hasClass('open')) {
                    $('.totvs-group a').eq(0).click();
                }
            }, 100);
        }

        // verifica se a disciplina pode ser removida do quadro de horários
        function verificaDisciplinaAdicionada(disciplina) {

            // caso a disciplina seja pré-matriculada e não pode ser excluida, deve-se impedir a remoção
            if (angular.isDefined(disciplina.DISCIPLINAMATRICULADA) && disciplina.PERMITEEXCLUIR == false) {
                return false;
            }

            return true;
        }

        /**
         * @description verifica se o dispositivo é móvel e está na vertical
         */
        function exibeMensagemParaDispositivoMovel() {

            // verifica se o dispositivo é móvel e está na vertical
            angular.element(document).ready(function () {

                if (_browser.mobile && _browser.orientation == 'vertical') {

                    totvsNotification.notify({
                        type: 'warning',
                        title: i18nFilter('l-Atencao'),
                        detail: i18nFilter('l-msg-celular-horizontal', '[]', 'js/aluno/matricula')
                    });
                }

            });
        }

        /**
         * @description redimensiona o tamanho da div slideout Simulação de Pagamento
         */
        function redimensionaTamanhoSlideoutSilulacaoPagamento() {

            angular.element(document).ready(function () {
                $('#table-matricula-simulacao-pagamento').height($(window).height() - 250 + "px"); //250 = //distancia do tbody até o top da div que será retirada para exibir todos os registros
                $(window).resize(function () {
                    $('#table-matricula-simulacao-pagamento').height($(window).height() - 250 + "px"); //250 = //distancia do tbody até o top da div que será retirada para exibir todos os registros
                });
            });
        }

        function realizaAssinaturaContratoComToken(){
            eduMatriculaService.realizaAssinaturaContratoComToken(self.habilitacaoSelecionada.IDHABILITACAOFILIAL, self.habilitacaoSelecionada.IDPERLET, function(result){
                if(angular.isDefined(result.value) && !result.value.includes('Erro:') ){
                    self.emailEnvioTokenAssinatura = result.value;
                    exibirModalAssinaturaContratoToken(true);
                } else{
                    if(result.value.includes('Erro:')){
                        totvsNotification.notify({
                            type: 'error',
                            title: i18nFilter('l-Atencao'),
                            detail: result.value
                        });
                    } else {
                        totvsNotification.notify({
                            type: 'error',
                            title: i18nFilter('l-Atencao'),
                            detail: i18nFilter('l-email-nao-encontrado-envio-token', '[]', 'js/aluno/matricula')
                        });
                    }
                }
            });
        }

        function reenviaEmailTokenAssinaturaContrato(){
            eduMatriculaService.reenviaEmailTokenAssinaturaContrato(self.habilitacaoSelecionada.IDHABILITACAOFILIAL, self.habilitacaoSelecionada.IDPERLET, function(result){
                if(result.value){
                    totvsNotification.notify({
                        type: 'success',
                        title: i18nFilter('l-Sucesso'),
                        detail: i18nFilter('l-envio-email-token-sucesso', '[]', 'js/aluno/matricula')
                    });
                } else {
                    totvsNotification.notify({
                        type: 'error',
                        title: i18nFilter('l-Atencao'),
                        detail: i18nFilter('l-erro-reenviar-email-token-assinatura', '[]', 'js/aluno/matricula')
                    });
                }
            });
        }

        function validaTokenAssinaturaContrato(){
            if(angular.isDefined($('#tokenAssinatura').val()) && $('#tokenAssinatura').val().length > 0){
                eduMatriculaService.validaTokenAssinaturaContrato(self.habilitacaoSelecionada.IDHABILITACAOFILIAL, self.habilitacaoSelecionada.IDPERLET, $('#tokenAssinatura').val(), function(result){
                    if(result.value){
                        self.TokenAssinaturaContratoValido = true;
                        exibirModalAssinaturaContratoToken(false);

                        totvsNotification.notify({
                            type: 'success',
                            title: i18nFilter('l-Sucesso'),
                            detail: i18nFilter('l-token-validado-com-sucesso', '[]', 'js/aluno/matricula')
                        });
                    } else{
                        totvsNotification.notify({
                            type: 'error',
                            title: i18nFilter('l-Atencao'),
                            detail: i18nFilter('l-token-invalido', '[]', 'js/aluno/matricula')
                        });
                    }
                });
            } else{
                totvsNotification.notify({
                    type: 'error',
                    title: i18nFilter('l-Atencao'),
                    detail: i18nFilter('l-token-invalido', '[]', 'js/aluno/matricula')
                });
            }

        }

        function validaSeDesabilitaBotaoFinalizarMatricula(){
            if (self.parametrosMatricula.UtilizaAssinaturaContratoComToken)
                return !(self.AceiteContrato && self.TokenAssinaturaContratoValido)
            else
                return false;
        }

        function exibirModalAssinaturaContratoToken(exibir) {
            if (exibir) {
                $('#modalAssinaturaContratoToken').modal('show');
                $('#modalAssinaturaContratoToken').on('shown.bs.modal', function () {
                    $('#tokenAssinatura').val('');
                    $('#tokenAssinatura').focus();
                });
            } else {
                $('#modalAssinaturaContratoToken').modal('hide');
            }
        }

        /**
         * Busca informações do endereço com base no CEP
         *
         */
         function buscarEnderecoCEP() {
            if (self.fiadorSelecionado.CEP)
            {
                eduUtilsFactory.getEnderecoCEPAsync(self.fiadorSelecionado.CEP, function (endereco) {

                    if(endereco)
                    {
                        if (endereco[0]) {
                            self.fiadorSelecionado.BAIRRO = endereco[0].BAIRRO;
                            self.fiadorSelecionado.CIDADE = endereco[0].NOME;
                            self.fiadorSelecionado.RUA = endereco[0].NOMELOGRADOURO;
                            self.fiadorSelecionado.IDPAIS = 1;//BRASIL
                            getListaEstados();
                            self.fiadorSelecionado.CODETD = endereco[0].UF;
                            self.fiadorSelecionado.CodMunicipio = endereco[0].CODMUNICIPIO;
                            if (self.fiadorSelecionado.CodMunicipio == undefined){
                                setCodigoMunicipio(false);
                            }
                            $('#controller_fiadorSelecionado_numero').focus();
                        } else {
                            totvsNotification.notify({
                                type: 'info',
                                title: i18nFilter('l-Atencao'),
                                detail: i18nFilter('l-msg-cep-nao-encontrado', [], 'js/aluno/matricula')
                            });

                            $('#controller_fiadorSelecionado_rua').focus();
                        }
                    }
                });
            }
        }

        /**
         * Método ao alterar um país na lista
         */
         function onChangePais() {

            self.fiadorSelecionado.CODETD = null;
            self.fiadorSelecionado.CodMunicipio = null;
            self.fiadorSelecionado.CIDADE = null;

            self.listEstados = [];
            self.listMunicipios = [];

            //Carrega lista de estados
            getListaEstados();
        }

        /**
         * Método ao alterar um estado na lista
         */
         function onChangeEstado() {
            self.fiadorSelecionado.CodMunicipio = null;
            self.listMunicipios = [];
            self.fiadorSelecionado.CIDADE = null;

            //Verifica se o estado e país foi preenchido
            if (self.fiadorSelecionado.CODETD && self.fiadorSelecionado.IDPAIS) {
                getListaMunicipios();
            }
            else {
                self.fiadorSelecionado.CODETD = '';
            }
        }

        /**
         * Seta o codigo do municípios do estado
         */
         function setCodigoMunicipio(isCadastro) {

            if (self.listMunicipios === undefined) {
                return;
            }

            if (self.fiadorSelecionado.CIDADE) {
                for (var i = 0; self.listMunicipios.length; i++) {
                    if (isCadastro && self.listMunicipios[i] == undefined)
                    {
                        break;
                    }

                    if ((self.listMunicipios[i].NOMEMUNICIPIO) && (self.listMunicipios[i].NOMEMUNICIPIO.toUpperCase() === self.fiadorSelecionado.CIDADE.toUpperCase())) {
                        self.fiadorSelecionado.CodMunicipio = self.listMunicipios[i].CODMUNICIPIO;
                        break;
                    }
                }
            }
        }

        /**
         * Obtém a listagem de países
         * @param {function} callback Função de retorno
         */
        function getListaPaises(callback) {
            self.listPaises = [];

            eduUtilsFactory.getListaPaisesAsync(function (result) {

                if (result.GPais) {
                    self.listPaises = result.GPais;

                    var paisBrasil = self.listPaises.find(function (pais) {
                        if (pais.IDPAIS === 1 || pais.CODPAIS === 'BRA') {
                            return pais;
                        }
                    });

                    if ((paisBrasil) && (self.fiadorSelecionado.IDPAIS === null)) {
                        self.fiadorSelecionado.IDPAIS = paisBrasil.IDPAIS;
                    }

                    getListaEstados(callback);
                }
                else {
                    if (typeof callback === 'function') {
                        callback(result);
                    }
                }
            });
        }

        /**
         * Obtém a listagem dos estados
         * @param {int}      idPAIS   Identificador do país
         * @param {function} callback Função de retorno
         */
         function getListaEstados(callback) {
            self.listEstados = [];

            if (self.fiadorSelecionado.IDPAIS)
            {
                eduUtilsFactory.getListaEstadosAsync(self.fiadorSelecionado.IDPAIS, function (result) {
                    if (result === undefined) {
                        return;
                    }

                    if (result.GEtd) {
                        self.listEstados = result.GEtd;

                        getListaMunicipios(callback);
                    }

                    if (typeof callback === 'function') {
                        callback(result);
                    }
                });
            }
        }

        function getListaMunicipios(callback) {

            if ((self.fiadorSelecionado.IDPAIS) && (self.fiadorSelecionado.CODETD))
            {
                eduUtilsFactory.getListaMunicipiosAsync(self.fiadorSelecionado.IDPAIS, self.fiadorSelecionado.CODETD, function (result) {
                    if (result === undefined) {
                        return;
                    }

                    self.listMunicipios = [];

                    if (result.GMUNICIPIO) {
                        self.listMunicipios = result.GMUNICIPIO;
                    }

                    if (typeof callback === 'function') {
                        callback(result);
                    }
                });
            }
        }

        //************************ INICIO: Manipulação dos documentos do fiador ************************
        function criaHyperLink(item) {
            if (isPermiteDownloadDocumento(item)) {
                return '<a class="underLineLink" ng-click="controller.downloadArquivo(' + item.IDFIADOR + ',' + item.CODDOCUMENTO + ')">' + item.DESCRICAO + '</a>';
            } else {
                return item.DESCRICAO;
            }
        }

        function isPermiteDownloadDocumento(item) {
            return item.STATUS === eduEnumsConsts.EduStatusDocumentoEntregueEnum.Validado ||
                item.STATUS === eduEnumsConsts.EduStatusDocumentoEntregueEnum.EntregueEmValidacao;
        }

        function formatarColunaObrigatorio(item) {
            return (item.OBRIGATORIO == eduEnumsConsts.EduSimOuNaoEnum.Sim) ?
                i18nFilter('l-doc-obrigatorio-sim', [], 'js/aluno/dados-pessoais') :
                i18nFilter('l-doc-obrigatorio-nao', [], 'js/aluno/dados-pessoais');
        }

        function formatarColunaDtEntrega(dataItem) {
            return (dataItem.DTENTREGA !== '' && dataItem.DTENTREGA != null) ?
                '<span class="ng-binding">{{dataItem.DTENTREGA | date : "dd/MM/yyyy"}}</span>' : '';
        }

        function criaBotaoUploadArquivos(item) {
            return (isPermiteDownloadDocumento(item)) ? '' :
                '<button class="btn-upload" ng-click="controller.abrirModalUploadArquivos(' + item.IDFIADOR + ',' + item.CODDOCUMENTO + ')" formnovalidate> <span id="spanbuttonAnexo" class="glyphicon glyphicon-paperclip" aria-hidden="True"></span> </button>';
        }

        function formatarColunaSituacaoDocumento(item) {
            switch (item.STATUS) {
                case eduEnumsConsts.EduStatusDocumentoEntregueEnum.EntregueEmValidacao:
                    return '<span class="tag legend doc-entregue-em-validacao"></span>';
                case eduEnumsConsts.EduStatusDocumentoEntregueEnum.Recusado:
                    return '<span class="tag legend doc-recusado"></span>';
                case eduEnumsConsts.EduStatusDocumentoEntregueEnum.Validado:
                    return '<span class="tag legend doc-validado"></span>';
                default:
                    return '<span class="tag legend doc-nao-entregue"></span>';
            }
        }

        function abrirModalUploadArquivos(idFiador, codDocumento) {
            atualizarDocumentoArquivo();

            let fiadorSelecionado = self.objListaFiadores.filter(fi => fi.IDFIADOR === idFiador);

            if (fiadorSelecionado.length > 0) {
                self.documentoSelecionado = fiadorSelecionado[0].objListaDocumentosFiador.find(fi => fi.CODDOCUMENTO === codDocumento);

                $('#modalDocumentosFiador').modal({backdrop: 'static', keyboard: false, show: true});
                attachEventoCloseModalDocumentosFiador();
            }
        }

        function attachEventoCloseModalDocumentosFiador()
        {
            $("#modalDocumentosFiador [data-dismiss=modal]").unbind("click");
            $('#modalDocumentosFiador [data-dismiss=modal]').on('click', function (e) {
                self.documentoSelecionado.ARQUIVO = '';
                self.documentoSelecionado = {};
                var $t = $(this),
                    target = $t[0].href || $t.data("target") || $t.parents('.modal') || [];

                $(target)
                    .find("input,textarea,select")
                    .val('')
                    .end()
                    .find("input[type=checkbox], input[type=radio]")
                    .prop("checked", "")
                    .end();
            });
        }

        function downloadArquivo(idFiador, codDocumento) {
            atualizarDocumentoArquivo();

            let fiadorSelecionado = self.objListaFiadores.filter(fi => fi.IDFIADOR === idFiador);

            if (fiadorSelecionado.length > 0) {
                let documentoSelecionado = fiadorSelecionado[0].objListaDocumentosFiador.filter(fi => fi.CODDOCUMENTO === codDocumento);

                if (documentoSelecionado.length > 0 && documentoSelecionado[0]["ARQUIVO"] != undefined) {
                    eduDadosPessoaisService.downloadArquivo(documentoSelecionado[0]["ARQUIVO"][0].IDARQUIVO, function (arquivo) {
                        if (arquivo)
                            abrirArquivoAnexado(arquivo);
                    });
                }
            }
        }

        function abrirArquivoAnexado(file) {
            if (file) {
                let arquivoBytes = file[0].ARQUIVO;
                let nomeArquivo = file[0].NOMEARQUIVO;
                var blob = eduUtilsService.b64toBlob(arquivoBytes);
                var nomesArquivos = nomeArquivo.split(';');
                if (nomesArquivos.length > 0) {
                    nomeArquivo = nomesArquivos[nomesArquivos.length - 1];
                }
                saveAs(blob, nomeArquivo);
            }
        }

        function atualizarDocumentoArquivo() {
            for (let i = 0; i < self.objListaFiadores.length; i++) {
                self.objListaFiadores[i].objListaDocumentosFiador.forEach(documento => {
                    getArquivos(documento, self.objListaFiadores[i].CODCOLIGADA);
                });
            }
        }

        function getArquivos(documento, codColigada) {
            if (isPermiteDownloadDocumento(documento)) {
                let chaveRM = codColigada + ';' + documento.IDDOCFIADOR;

                eduDocumentosFactory.getArquivoDocumento(chaveRM, eduEnumsConsts.EduDataServerArquivoEnum.DocumentosFiador, function (arquivo) {
                    if (arquivo)
                        if (angular.isArray(arquivo))
                            documento["ARQUIVO"] = arquivo;
                });
            }
        }

        function registrarAnexoDocumento() {
            let reader = new FileReader(),
                file = self.documentoSelecionado.ARQUIVO;

            if (typeof file !== "undefined" && file != "") {
                reader.onload = function (e) {
                    let stringBinario = e.target.result.split(',')[1];
                    let nomeArquivo = `${self.documentoSelecionado.DESCRICAO}.${file.name.split('.').pop()}`;
                    let pathArquivo = nomeArquivo;

                    eduDadosPessoaisService.uploadArquivoFiador(
                        self.documentoSelecionado.CODDOCUMENTO,
                        self.documentoSelecionado.IDFIADOR,
                        self.documentoSelecionado.IDDOCFIADOR,
                        stringBinario,
                        nomeArquivo,
                        pathArquivo,
                        function (result) {
                            if (result) {
                                if (result.Arquivo != null) {
                                    //Força a chamada do evento para limpeza dos campos da modal
                                    $('[data-dismiss=modal]').trigger('click');
                                    carregaFiadorAluno();

                                    totvsNotification.notify({
                                        type: 'success',
                                        title: i18nFilter('l-arquivo-enviado', [], 'js/aluno/dados-pessoais'),
                                        detail: result.message
                                    });
                                }
                            } else {
                                totvsNotification.notify({
                                    type: 'error',
                                    title: i18nFilter('l-erro-envio', [], 'js/aluno/dados-pessoais'),
                                    detail: result.message
                                });
                            }
                    });
                };

                reader.readAsDataURL(file);
            } else {
                totvsNotification.notify({
                    type: 'error',
                    title: i18nFilter('l-erro-envio', [], 'js/aluno/dados-pessoais'),
                    detail: i18nFilter('l-selecione-arquivo', [], 'js/aluno/dados-pessoais')
                });
            }
        }
        //************************ FIM: Manipulação dos documentos do fiador ************************

        function gerarRelatorioReports(callback) {
            // Chamada do reports para retornar JPEG (exibido no modal)
            eduMatriculaService.retornaRelatorioContratoMatriculaJpegAsync(self.objRelatorioContrato, function (report) {
                if (report && report[0]['BytesJPEG']) {
                    console.log("BytesJPEG");
                    self.jpegRelatorioContrato = report[0].BytesJPEG;

                    if (angular.isFunction(callback)) {
                        callback();
                    }
                }
            });

            // Chamada do reports para gerar o binário do PDF (botão imprimir e finalização da matrícula)
            eduMatriculaService.retornaRelatorioContratoMatriculaPdfAsync(self.objRelatorioContrato, function (report) {
                if (report && report[0]['BytesPDF']) {
                    console.log("BytesPDF");
                    self.pdfRelatorioContrato = report[0].BytesPDF;
                    self.assinaturaContrato.arquivo = self.pdfRelatorioContrato;
                    console.log(self.assinaturaContrato.arquivo);
                }
            });
        }

        function ehGrupoPrincipal(disciplina){
            return disciplina.PERIODOGRUPO == null
                   || ((disciplina.PERIODOGRUPO != null
                        && (disciplina.PERIODOGRUPO == 0
                        && disciplina.PERIODOGRUPO==disciplina.CODPERIODO))
                        || disciplina.CODPERIODO >= 0 
                        && (disciplina.PERIODOGRUPO == null || disciplina.PERIODOGRUPO == 0));
        }

        function getPeriodoMatriculado(disciplina){
            if ((disciplina.CODPERIODO > 0)
                || (disciplina.PERIODOGRUPO != null
                     && (disciplina.PERIODOGRUPO == 0
                     && disciplina.PERIODOGRUPO==disciplina.CODPERIODO)))
              return disciplina.PERIODO;

            return i18nFilter('l-periodoDiscExtra', '[]', 'js/aluno/matricula');
        }
    }
});
