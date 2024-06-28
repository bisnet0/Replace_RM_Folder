/**
 * @license TOTVS | Portal - TOTVS Educacional v12.1.25
 * (c) 2015-2019 TOTVS S/A https://www.totvs.com
 * License: Comercial
 * @description
 */

/**
* @module eduNegociacaoModule
* @name EduNegociacaoController
* @object controller
*
* @created 27/05/2019 v12.1.25
* @updated
*
* @requires Negociacao.module
*
* @dependencies eduNegociacaoFactory
*
* @description Controller do Negociacao
*/
define(['aluno/negociacao/negociacao.module',
        'aluno/negociacao/negociacao.factory.educacional',
        'aluno/negociacao/negociacao.factory.financeiro',
        'aluno/financeiro/financeiro.service',
        'aluno/financeiro/financeiro.factory',
        'aluno/financeiro/lancamentos/lancamentos-pagcartao.controller'], function () {

    'use strict';

        angular
            .module('eduNegociacaoModule')
            .controller('EduNegociacaoController', EduNegociacaoController);

    EduNegociacaoController.$inject = ['$scope',
                                        'i18nFilter',
                                        '$rootScope',
                                        '$state',
                                        'EduNegociacaoFactoryEducacional',
                                        'EduNegociacaoFactoryFinanceiro',
                                        'EduFinanceiroService',
                                        'TotvsDesktopContextoCursoFactory',
                                        'EduFinanceiroFactory',
                                        'eduEnumsConsts',
                                        'eduConstantesGlobaisConsts',
                                        'totvs.app-notification.Service',
                                        '$sce',
                                        'eduUtilsService',
                                        '$window',
                                        'eduUtilsFactory'];

    function EduNegociacaoController($scope,
        i18nFilter,
        $rootScope,
        $state,
        EduNegociacaoFactoryEducacional,
        EduNegociacaoFactoryFinanceiro,
        eduFinanceiroService,
        TotvsDesktopContextoCursoFactory,
        eduFinanceiroFactory,
        eduEnumsConsts,
        eduConstantesGlobaisConsts,
        totvsNotification,
        $sce,
        eduUtilsService,
        $window,
        eduUtilsFactory) {

        // *********************************************************************************
        // *** Variáveis
        // *********************************************************************************

        var self = this;
        self.retrocederEtapa = retrocederEtapa;
        self.retornarEtapaAtual = retornarEtapaAtual;
        self.avancarEtapa = avancarEtapa;
        self.redirecionar = redirecionar;
        self.selecionarTodos = selecionarTodos;
        self.atualizaSelecionarTodos = atualizaSelecionarTodos;
        self.formatarData = formatarData;

        self.listaDebitosFinanceiros = [];
        self.listaDebitosSelecionados = [];
        self.listaTemplatesRetornados = [];
        self.listaOpcoesParcelas = [];
        self.listaFormasPagamento = [];
        self.formaPagamentoSelecionado = [];
        self.conteudoTemplateDisponivel = [];
        self.quantidadeParcelasSelecionada = [];
        self.valoresSimulados = [];
        self.valoresFinanceiroAcordo = [];
        self.totalValoresSimulados = [];
        self.parametrosEducacional = [];

        self.selecionouTodos = false;
        self.templateSelecionado = null;
        self.contextoCurso = null;
        self.codSistemaEducacional = 'S';
        self.codSistemaFinanceiro = 'F';
        self.exigeAceiteNegociacao = false;
        self.relatorioAceite = null;
        self.conteudoTemplateSelecionado = null;
        self.liAceito = false;
        self.relatorioAceiteEmitido = false;
        self.negociacaoFinalizada = false;
        self.textoNegociacaoFinalizada = null;
        self.ApenasUmTemplatePagtoCartao = false;
        self.codUsuarioLogado = null;

        self.valorTotalDebitosSelecionados = 0;
        self.valorTotalLiquidoDebitosSelecionados = 0;

        self.aoIniciarEtapaIntroducao = aoIniciarEtapaIntroducao;
        self.aoIniciarEtapaListagemDebitosFinanceiros = aoIniciarEtapaListagemDebitosFinanceiros;
        self.aoIniciarEtapaSelecaoTemplate = aoIniciarEtapaSelecaoTemplate;
        self.aoIniciarEtapaConfirmacao = aoIniciarEtapaConfirmacao;
        self.buscaTemplateSelecionadoPeloUsuario = buscaTemplateSelecionadoPeloUsuario;
        self.buscaValoresSimulados = buscaValoresSimulados;
        self.confirmarNegociacao = confirmarNegociacao;
        self.habilitaImprimir = false;
        self.criaObjImprimir = criaObjImprimir;
        self.imprimir = imprimir;
        self.scroolToButtonConfirmation = scroolToButtonConfirmation;
        self.emitirBoleto = emitirBoleto;
        self.exibirDadosCodigoBarras = exibirDadosCodigoBarras;
        self.exibirCodigoBarras = exibirCodigoBarras;
        self.exibirOpcoesPagamento = exibirOpcoesPagamento;
        self.exibeBtnPix = exibeBtnPix;
        self.exibirDadosPix = exibirDadosPix;
        self.exibeBtnPagamentoCartao = exibeBtnPagamentoCartao;
        self.exibeBtnPagamentoBoleto = exibeBtnPagamentoBoleto;
        self.exibirDadosPagCartao = exibirDadosPagCartao;
        self.imprimirAcordo = imprimirAcordo;
        self.recuperaUsuarioLogado = recuperaUsuarioLogado;

        self.etapas = [];

        //Devem ser registrados todas as funções de inicialização, quando uma etapa do wizard é acionada
        self.eventosStateEtapas = {
            'negociacaoonline.introducao': 'aoIniciarEtapaIntroducao',
            'negociacaoonline.listagem-debitos-financeiros': 'aoIniciarEtapaListagemDebitosFinanceiros',
            'negociacaoonline.selecao-template': 'aoIniciarEtapaSelecaoTemplate',
            'negociacaoonline.confirmacao': 'aoIniciarEtapaConfirmacao'
        }

        const codOrigemEducacional = 2;

        // *********************************************************************************
        // *** Inicialização do controller
        // *********************************************************************************

        /* Só executa o método init após carregar o objeto com as permissões do usuário */
        var myWatch = $rootScope.$watch('objPermissions', function (data) {
            if (data !== null) {
                init();
                myWatch();
            }
        });

        /**
         * Metodo de inicialização do controller
         */
        function init() {
            window.scrollTo(0, 0);
            carregarEtapas();
            inicializarWizard();

            self.liAceito = false;
            self.relatorioAceiteEmitido = false;
            self.negociacaoFinalizada = false;
        }

        /* Valida se o usuário tem permissão no Menu */
        var permissionsWatch = $rootScope.$watch('objPermissions', function () {
            if ($rootScope.objPermissions) {
                if (!$rootScope.objPermissions.EDU_FINANCEIRO_NEGOCIACAO) {
                    totvsNotification.notify({
                        type: 'warning',
                        title: i18nFilter('l-Atencao'),
                        detail: i18nFilter('l-usuario-sem-permissao')
                    });
                    $state.go(eduConstantesGlobaisConsts.EduStateViewPadrao);
                }

                //destroy watch
                permissionsWatch();
            }
        });

        // *********************************************************************************
        // *** Propriedades públicas e métodos
        // *********************************************************************************

        function selecionarTodos() {
            self.listaDebitosFinanceiros.forEach(function (debito) {
                debito.checked = self.selecionouTodos;
            });
        }

        function atualizaSelecionarTodos() {
            self.selecionouTodos = self.listaDebitosFinanceiros.every(function (debito) {
                return debito.checked;
            });
        }

        // *********************************************************************************
        // *** Métodos relacionados ao wizard
        // *********************************************************************************

        function carregarEtapas() {
            self.etapas = [];

            self.etapas.push({
                ordem: self.etapas.length + 1,
                nome: 'negociacaoonline.introducao',
                descricao: i18nFilter('l-introducao', [], 'js/aluno/negociacao'),
                ativo: true,
                realizado: true,
                padrao: true
            });
            self.etapas.push({
                ordem: self.etapas.length + 1,
                nome: 'negociacaoonline.listagem-debitos-financeiros',
                descricao: i18nFilter('l-lista-debitos-financeiros', [], 'js/aluno/negociacao'),
                ativo: false,
                realizado: false
            });
            self.etapas.push({
                ordem: self.etapas.length + 1,
                nome: 'negociacaoonline.selecao-template',
                descricao: i18nFilter('l-selecao-template', [], 'js/aluno/negociacao'),
                ativo: false,
                realizado: false
            });
            self.etapas.push({
                ordem: self.etapas.length + 1,
                nome: 'negociacaoonline.confirmacao',
                descricao: i18nFilter('l-confirmacao', [], 'js/aluno/negociacao'),
                ativo: false,
                realizado: false
            });
        }

        function resetarValoresWizard(){
            self.etapas = [];
            self.selecionouTodos = false;
            self.negociacaoFinalizada = false;
        }

        function inicializarWizard() {
            if ($state.current.name !== eduConstantesGlobaisConsts.EduStateViewPadrao) {
                verificarStatusEtapaAtualAtivo();
                registrarEscutaEventoVerificacaoEtapa();
            }
        }

        function registrarEscutaEventoVerificacaoEtapa() {

            $scope.$on('$stateChangeStart',
                function (event, toState) {

                    event.defaultPrevented = false;
                    if (!verificarRedirecionamentoValido(toState.name)) {
                        event.preventDefault();
                    }
                }
            );

            $scope.$on('$stateChangeSuccess',
                function (event, toState) {

                    if (self.eventosStateEtapas.hasOwnProperty(toState.name)) {

                        var funcaoEventoNome = self.eventosStateEtapas[toState.name];

                        if (angular.isFunction($scope.controller[funcaoEventoNome])) {
                            $scope.controller[funcaoEventoNome]();
                        }
                    }
                }
            );
        }

        function retornarEtapaAtual() {
            return self.etapas.find(function (item) {
                if (item.nome === $state.current.name)
                    return item;
            });
        }

		function retornaEtapaPorOrdem(ordem) {
            return self.etapas.find(function (item) {

                if (item.ordem === ordem) {
                    return item;
                }
            });
        }

        function retornaEtapaPorNome(nome) {
            return self.etapas.find(function (item) {

                if (item.nome === nome) {
                    return item;
                }
            });
		}

		function retornaEtapaPadrao() {
            return self.etapas.find(function (item) {

                if (item.padrao) {
                    return item;
                }
            });
        }

        function executaAvancarEtapa() {
            var etapaAtual = retornarEtapaAtual();

            if (etapaAtual.ordem < self.etapas.length) {
                var proximaEtapa = retornaEtapaPorOrdem(etapaAtual.ordem + 1);

                if (proximaEtapa.ativo) {
                    etapaAtual.realizado = true;
                    $state.go(proximaEtapa.nome);
                } else {
                    totvsNotification.notify({
                        type: 'error',
                        title: i18nFilter('l-Atencao'),
                        detail: retornaTextoi18n('l-erro-avancar-etapa')
                    });
                }
            }
        }

        function retrocederEtapa() {
            var etapaAtual = retornarEtapaAtual();

            if (etapaAtual.ordem > 1) {
                var proximaEtapa = retornaEtapaPorOrdem(etapaAtual.ordem - 1);

                if (proximaEtapa.ativo) {
                    $state.go(proximaEtapa.nome);
                }
            }
		}

        function liberarProximaEtapa() {
            var etapaAtual = retornarEtapaAtual();
            if (etapaAtual) {
                if (self.etapas.length > etapaAtual.ordem) {
                    var proximaEtapa = self.etapas[etapaAtual.ordem];
                    if (!proximaEtapa.ativo) {
                        proximaEtapa.ativo = true;
                        etapaAtual.realizado = true;
                    }
                }
            }
        }

        function liberarEtapaAtual() {
            var etapaAtual = retornarEtapaAtual();
            if (etapaAtual) {
                etapaAtual.ativo = true;
                etapaAtual.realizado = true;
            }
        }

        function restringirProximasEtapas() {
            var etapaAtual = retornarEtapaAtual();
            angular.forEach(self.etapas, function (etapa) {
                if (etapa.ordem > etapaAtual.ordem) {
                    etapa.ativo = false;
                    etapa.realizado = false;
                }
            }, self);
        }

        function avancarEtapa() {
            if (retornarEtapaAtual().nome === 'negociacaoonline.listagem-debitos-financeiros') {
                preencheListaDebitosSelecionados(function(retorno) {
                    if (retorno) {
                        liberarProximaEtapa();
                        liberarEtapaAtual();
                        executaAvancarEtapa();
                    }
                    else {
                        totvsNotification.notify({
                            type: 'error',
                            title: i18nFilter('l-Atencao'),
                            detail: retornaTextoi18n('l-erro-selecionar-debitos')
                        });
                    }
                });
            }
            else
            {
                if(retornarEtapaAtual().nome === 'negociacaoonline.introducao'){
                    liberarProximaEtapa();
                    liberarEtapaAtual();
                    executaAvancarEtapa();
                }
                else{
                    if (self.templateSelecionado !== null) {
                        liberarProximaEtapa();
                        liberarEtapaAtual();
                        executaAvancarEtapa();
                    }
                    else {
                        totvsNotification.notify({
                            type: 'error',
                            title: i18nFilter('l-Atencao'),
                            detail: retornaTextoi18n('l-erro-selecionar-template')
                        });
                    }
                }
            }
        }

        function preencheListaDebitosSelecionados(callback) {
            var itensProcessados = 0;
            self.listaDebitosSelecionados = [];
            self.valorTotalDebitosSelecionados = 0;
            self.valorTotalLiquidoDebitosSelecionados = 0;

            self.listaDebitosFinanceiros.forEach(function (debito) {
                itensProcessados++;
                self.TotalDebitosSelecionados = 0;

                if (debito.checked) {
                    self.listaDebitosSelecionados.push(debito);
                }
                if (itensProcessados === self.listaDebitosFinanceiros.length) {
                    if (angular.isFunction(callback)) {
                        callback(self.listaDebitosSelecionados.length > 0);
                    }
                }
            });
        }

        function verificarRedirecionamentoValido(stateRedirecionamento) {
            if (stateRedirecionamento !== eduConstantesGlobaisConsts.EduStateViewPadrao)
            {
                var stateEtapaRedirecionamento = retornaEtapaPorNome(stateRedirecionamento);
                var etapaPadrao = retornaEtapaPadrao();

                var nomeStatePadraoPagina = etapaPadrao.nome.split('.')[0];

                if ((stateEtapaRedirecionamento && stateEtapaRedirecionamento.ativo) ||
                    (!stateEtapaRedirecionamento && stateRedirecionamento !== nomeStatePadraoPagina)) {
                    return true;
                } else {
                    return false;
                }
            }
            else {
                return true;
            }
		}

        function redirecionar(stateRedirecionamento) {

            if (self.negociacaoFinalizada)
            {
                var etapa = self.etapas.find(function (item) {
                if (item.nome === stateRedirecionamento)
                    return item;
                });

                if (etapa)
                    return false;
                else
                    return true;
                }

            if (verificarRedirecionamentoValido(stateRedirecionamento)) {
                $state.go(stateRedirecionamento);
            } else {

                totvsNotification.notify({
                    type: 'error',
                    title: retornaTextoi18n('l-atencao'),
                    detail: retornaTextoi18n('l-erro-avancar-etapa')
                });
            }
        }

		function verificarStatusEtapaAtualAtivo() {
            var etapaAtual = retornarEtapaAtual(self.etapas);
            var etapaPadrao = retornaEtapaPadrao(self.etapas);
            if (!etapaAtual || !etapaAtual.ativo) {
                $state.go(etapaPadrao.nome);
            }
        }

        // *********************************************************************************
        // *** Metodos de inicio das etapas do wizard
        // *********************************************************************************

        function aoIniciarEtapaIntroducao() {
            eduUtilsFactory.getParametrosTOTVSEducacionalAsync(function(paramEdu){
                self.parametrosEducacional = paramEdu;
                self.textoIntroducaoNegociacao = $sce.trustAsHtml(paramEdu.TextoIntroducaoNegociacao);
            });
        }

        function aoIniciarEtapaListagemDebitosFinanceiros() {
            resetarValoresWizard();
            carregarEtapas();
        
            EduNegociacaoFactoryEducacional.buscaDebitosFinanceirosPendentes(async function (retorno) {
        
                const currentDate = new Date(); //Captura a data atual
                const month = currentDate.getMonth() + 1; // Os meses são indexados de 0 a 11, então adicionamos 1.
                const year = currentDate.getFullYear().toString().slice(-2); // Obtém os últimos dois dígitos do ano, exemplo, se for o ano for 2024, o valor da variável será 24. 
                const yearPosGraduacao = currentDate.getFullYear();  //Obtém o ano inteiro, exemplo, se for o ano for 2024, o valor da variável será 2024
        
                // Cria uma variavel de mês, para receber o valor que vier do IF abaixo.
                let monthVariable;
        
                // IF para validar o valor do mês de acordo com o semestre e atribuir a variável acima
                if (month >= 1 && month <= 6) {
                    monthVariable = 1;
                } else if (month >= 7 && month <= 12) {
                    monthVariable = 2;
                }
        
                // Cria a variável do id do periodo letivo atual, baseado na concatenação das variáveis de mês e do ano
                const idPeriodoLetivoPresencial = `${year}${monthVariable}`;
                const idPeriodoLetivoEAD = `${year}${monthVariable}E`;
                const idPeriodoLetivoPosGraduaçãoPresencial = `${yearPosGraduacao}.${monthVariable}`;
                const idPeriodoLetivoPosGraduaçãoEAD = `${yearPosGraduacao}.${monthVariable}E`;
        
                // Para acrescentar o filtro da Pós Graduação, tanto presencial quanto EAD, basta adicionar o seguinte código, dentro do filter --> && item.TermCodeDescription !== `${idPeriodoLetivoPosGraduaçãoPresencial} ` && item.TermCodeDescription !== `${idPeriodoLetivoPosGraduaçãoEAD}`
                let newLista = retorno.filter(item => item.TermCodeDescription !== `${idPeriodoLetivoPresencial}` && item.TermCodeDescription !== `${idPeriodoLetivoEAD}`);
        
        
                self.listaDebitosFinanceiros = newLista;
                self.listaDebitosFinanceiros.forEach(function (debito) {
                    debito.vencido = new Date(debito.DueDate) < new Date();
                    debito.checked = false;
                });
            });
        }
        

        function aoIniciarEtapaSelecaoTemplate() {
            self.contextoCurso = TotvsDesktopContextoCursoFactory.getCursoSelecionado();
            self.codUsuarioLogado = self.recuperaUsuarioLogado(self.contextoCurso);
            limpaValoresSelecaoTemplate();
            buscaTemplatesBaseadosNosLancamentosSelecionados();
        }

        function aoIniciarEtapaConfirmacao() {
            self.liAceito = false;
            self.relatorioAceite = null;
            self.relatorioAceiteEmitido = false;
            if (angular.isDefined(self.conteudoTemplateSelecionado) &&
                self.conteudoTemplateSelecionado.hasOwnProperty("IdRelatAceite")) {

                if (self.conteudoTemplateSelecionado.IdRelatAceite != null) {
                    self.exigeAceiteNegociacao = self.conteudoTemplateSelecionado.IdRelatAceite;
                }
            };

            if (self.exigeAceiteNegociacao) {
                // imprime o relatório
                var objImprimirRelatorio = criaObjImprimir(self.conteudoTemplateSelecionado.CodColRelatAceite, self.conteudoTemplateSelecionado.IdRelatAceite);
                EduNegociacaoFactoryFinanceiro.gerarRelatorio(objImprimirRelatorio, function(retorno) {
                    self.relatorioAceite = retorno.Relatorio;
                    self.relatorioAceiteEmitido = true;
                });
            }
        }

        function criaObjImprimir(codColRelatorio, idRelatorio){
            var objImprimirRelatorio = {
                listLan: [],
                codColigada: self.contextoCurso.cursoSelecionado.CODCOLIGADA,
                idTemplateAcordo: self.templateSelecionado,
                codFilial: self.contextoCurso.cursoSelecionado.CODFILIAL,
                quantidadeParcelas: self.quantidadeParcelasSelecionada[self.templateSelecionado],
                idFormaPagto: self.formaPagamentoSelecionado[self.templateSelecionado],
                usuarioProc: self.codUsuarioLogado,
                codTipoCurso: self.contextoCurso.cursoSelecionado.CODTIPOCURSO,
                codSistema: self.codSistemaFinanceiro,
                codColRelatNegociacao: codColRelatorio,
                idRelatNegociacao: idRelatorio
            };

            self.listaDebitosSelecionados.forEach(function(debito) {
                objImprimirRelatorio.listLan.push({
                    codColigada: debito.CompanyCode,
                    idLan: debito.FinancialEntryCode,
                    idHabilitacaoFilial: debito.SpecializationBranchCode
                });
            });
            return objImprimirRelatorio;
        }

        function imprimir() {
            var objImprimir = criaObjImprimir(self.conteudoTemplateSelecionado.CodColRelatNegociacao, self.conteudoTemplateSelecionado.IdRelatNegociacao);
            EduNegociacaoFactoryFinanceiro.gerarRelatorio(objImprimir, function(retorno) {
                try {
                    var blob = eduUtilsService.b64toBlob(retorno.Relatorio, 'image/jpeg');

                    if (window.navigator && window.navigator.msSaveOrOpenBlob) {
                        window.navigator.msSaveOrOpenBlob(blob, 'relatorio.jpeg');
                    } else {
                        var blobUrl = URL.createObjectURL(blob),
                            popUpHabilitado =  $window.open(blobUrl);

                        if (!popUpHabilitado) {
                            throw 'Popup bloqueado!';
                        }
                    }
                } catch (e) {
                    eduUtilsService.abrirJanelaDownloadArquivo('relatorio.jpeg', retorno.Relatorio);
                }
            });
        }

        function limpaValoresSelecaoTemplate() {
            self.habilitaImprimir = false;
            self.conteudoTemplateDisponivel = [];
            self.templateSelecionado = null;
            self.valoresSimulados = [];
            self.totalValoresSimulados = [];
            self.listaFormasPagamento = [];
            self.formaPagamentoSelecionado = [];
            self.negociacaoFinalizada = false;
            self.textoNegociacaoFinalizada = null;
        }

        function buscaTemplatesBaseadosNosLancamentosSelecionados() {
            if (self.listaDebitosSelecionados == null || self.listaDebitosSelecionados.length == 0) return;

            let finValorFinanceiroAcordo = {
                CodUsuario: self.codUsuarioLogado,
                MoedaBx: '',
                ListIdLan: getObjetoListaLancamentoValorAcordo()
            };

            EduNegociacaoFactoryFinanceiro.buscaValoresFinanceiroAcordo(finValorFinanceiroAcordo, function(retorno) {
                self.valoresFinanceiroAcordo = retorno;

                let listaDeTemplates = {
                    CodColigada: self.contextoCurso.cursoSelecionado.CODCOLIGADA,
                    CodUsuario: self.codUsuarioLogado,
                    ValorLanOrigem: self.valoresFinanceiroAcordo.ValorLiquido,
                    CodSistema: self.codSistemaEducacional,
                    ListaHabilitacaoFilial: getListaHabilitacoesFiliaisLancamentos(),
                    ListaServicosAcordo: getListaIdServicosAcordo()
                };

                self.valorTotalDebitosSelecionados = self.valoresFinanceiroAcordo.ValorOriginal;
                self.valorTotalLiquidoDebitosSelecionados = self.valoresFinanceiroAcordo.ValorLiquido;

                EduNegociacaoFactoryFinanceiro.buscaTemplatesUsuario(listaDeTemplates, function(retorno) {
                    self.listaTemplatesRetornados = retorno.FTEMPLATEACORDO;

                    if (self.listaTemplatesRetornados.length === 1 && self.listaTemplatesRetornados[0].QUANTIDADEPARCELAS === 1) {
                        self.ApenasUmTemplatePagtoCartao = true;
                        self.templateSelecionado = self.listaTemplatesRetornados[0].IDTEMPLATEACORDO;
                        buscaTemplateSelecionadoPeloUsuario(self.templateSelecionado, function() {
                            buscaValoresSimulados(self.templateSelecionado)
                        });
                    }
                });
            });
        }

        function getListaHabilitacoesFiliaisLancamentos() {
            let listaHabilitacaoFilial = [];

            self.listaDebitosSelecionados.forEach(function(lancamentoAtual) {
                var habilitacaoJaExisteNaLista = listaHabilitacaoFilial.filter(function(x) {
                    return x === lancamentoAtual.SpecializationBranchCode
                }).length > 0;

                if (!habilitacaoJaExisteNaLista) {
                    listaHabilitacaoFilial.push(lancamentoAtual.SpecializationBranchCode);
                }
            });

            return listaHabilitacaoFilial;
        }

        function getListaIdServicosAcordo() {
            let listaServicesAcordo = [];

            self.listaDebitosSelecionados.forEach(function(lancamentoAtual) {
                if (lancamentoAtual.checked) {
                    listaServicesAcordo.push(lancamentoAtual.ServiceCode);
                }
            });

            return listaServicesAcordo;
        }

        function getObjetoListaLancamentoValorAcordo() {
            let listaDeLancamentosSelecionados = [];

            self.listaDebitosSelecionados.forEach(function(lancamentoAtual) {

                let lancamentoItem = {
                    CodColigada: lancamentoAtual.CompanyCode,
                    IdLan: lancamentoAtual.FinancialEntryCode,
                    IdHabilitacaoFilial: lancamentoAtual.SpecializationBranchCode
                };

                listaDeLancamentosSelecionados.push(lancamentoItem);
            });

            return listaDeLancamentosSelecionados;
        }

        function getListaIdLanOrigemAcordo() {
            let listaDeLancamentosOrigem = [];

            self.listaDebitosSelecionados.forEach(function(lancamentoAtual) {
                listaDeLancamentosOrigem.push(lancamentoAtual.FinancialEntryCode);
            });

            return listaDeLancamentosOrigem;
        }

        function getObjetoListaLancamentoValorSimulado() {
            let listaDeLancamentosSelecionados = [];

            self.listaDebitosSelecionados.forEach(function(lancamentoAtual) {

                let lancamentoItem = {
                    CodColigada: lancamentoAtual.CompanyCode,
                    CodUsuario: lancamentoAtual.StudentCode,
                    IdLan: lancamentoAtual.FinancialEntryCode,
                    IdHabilitacaoFilial: lancamentoAtual.SpecializationBranchCode
                };

                listaDeLancamentosSelecionados.push(lancamentoItem);
            });

            return listaDeLancamentosSelecionados;
        }

        function buscaTemplateSelecionadoPeloUsuario(idTemplate, callback) {
            EduNegociacaoFactoryFinanceiro.buscaValoresDefaultsAcordo(self.contextoCurso.cursoSelecionado.CODCOLIGADA, idTemplate, function(retorno) {
                self.conteudoTemplateDisponivel[idTemplate] = retorno;
                self.conteudoTemplateSelecionado = retorno;
                self.habilitaImprimir = (typeof self.conteudoTemplateSelecionado.IdRelatNegociacao != 'undefined') && (self.conteudoTemplateSelecionado.IdRelatNegociacao !== null)
                && (typeof self.valoresSimulados[self.templateSelecionado] != 'undefined');

                buscaListaQuantidadeParcelas(idTemplate, function() {
                    if (self.conteudoTemplateDisponivel[idTemplate].MeioPagtoObrigatorio != eduEnumsConsts.FinMeioPagtoAcordoEnum.NaoInformar) {
                        buscaListaFormaPagamento(idTemplate, function() {
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
                });
            });
        }

        function buscaListaQuantidadeParcelas(idTemplate, callback) {
            self.listaOpcoesParcelas[idTemplate] = [];

            for (let index = 1; index <= self.conteudoTemplateDisponivel[idTemplate].QuantidadeParcelas; index++) {
                self.listaOpcoesParcelas[idTemplate].push(index);
            }

            self.quantidadeParcelasSelecionada[idTemplate] = self.listaOpcoesParcelas[idTemplate][0];

            if (angular.isFunction(callback)) {
                callback();
            }
        }

        function buscaListaFormaPagamento(idTemplate, callback) {
            self.listaFormasPagamento[idTemplate] = [];

            if (self.conteudoTemplateDisponivel[idTemplate].MeioPagtoObrigatorio == eduEnumsConsts.FinMeioPagtoAcordoEnum.Informar) {
                self.listaFormasPagamento[idTemplate].push('');
            }

            self.conteudoTemplateDisponivel[idTemplate].MeiosPagamento.forEach(function(FormaPagamemtoAtual) {
                self.listaFormasPagamento[idTemplate].push(FormaPagamemtoAtual);
            });

            if (self.conteudoTemplateDisponivel[idTemplate].MeioPagtoObrigatorio == eduEnumsConsts.FinMeioPagtoAcordoEnum.InformarObrigatorio) {
                self.formaPagamentoSelecionado[idTemplate] = self.listaFormasPagamento[idTemplate][0].IdFormaPagto;
            }

            if (angular.isFunction(callback)) {
                callback();
            }
        }

        function buscaValoresSimulados(idTemplate) {
            let parametroFinanceiro = retornaObjetoParametroFinanceiro(idTemplate);
            EduNegociacaoFactoryFinanceiro.buscaValoresSimulados(parametroFinanceiro, function(retorno) {

                self.valoresSimulados[idTemplate] = retorno.PARCELAS;

                self.totalValoresSimulados[idTemplate] = 0;
                if (self.valoresSimulados.length > 0) {
                    self.valoresSimulados[idTemplate].forEach(function(itemAtual) {
                        self.totalValoresSimulados[idTemplate] += itemAtual.VALORPARCELA;
                    });
                }
            });
            if (self.conteudoTemplateSelecionado.IdRelatNegociacao) {
                self.habilitaImprimir = true;
            }
            else {
                self.habilitaImprimir = false;
            }
        }

        function retornaObjetoParametroFinanceiro(idTemplate) {
            let parametroFinanceiro = {};

            if (self.contextoCurso) {
                parametroFinanceiro = {
                    CodColigada: self.contextoCurso.cursoSelecionado.CODCOLIGADA,
                    CodFilial: self.contextoCurso.cursoSelecionado.CODFILIAL,
                    CodTipoCurso: self.contextoCurso.cursoSelecionado.CODTIPOCURSO,
                    CodSistema: self.codSistemaEducacional,
                    IdTemplateAcordo: idTemplate,
                    IdFormaPagto: self.formaPagamentoSelecionado[idTemplate],
                    QuantidadeParcelas: self.quantidadeParcelasSelecionada[idTemplate],
                    CodUsuario: self.codUsuarioLogado,
                    UsuarioProc: self.codUsuarioLogado,
                    ListLan: getObjetoListaLancamentoValorSimulado(),
                    Origem: codOrigemEducacional
                };
            }

            return parametroFinanceiro;
        }

        function confirmarNegociacao() {

            var parametroFinanceiro = retornaObjetoParametroFinanceiro(self.templateSelecionado);
            EduNegociacaoFactoryFinanceiro.confirmarNegociacao(parametroFinanceiro, function (retorno) {

                if (retorno.value == true) {

                    self.textoNegociacaoFinalizada = retornaTextoi18n('l-acordo-realizado');

                    EduNegociacaoFactoryEducacional.buscaLancamentosGeradosPorAcordo(getListaIdLanOrigemAcordo(), function (boleto) {

                        self.negociacaoFinalizada = true;
                        self.boleto = boleto.SBoletos[0];

                        if (redirecionarTelaPagamentoComCartao())
                            exibirDadosPagCartao();
                        else {
                            var etapaAtual = retornarEtapaAtual();
                            etapaAtual.realizado = true;
                            etapaAtual.ativo = false;
                            etapaAtual.nome = 'finalizado';
                            etapaAtual.ordem = etapaAtual.ordem.length + 1;
                        }
                    });

                } else {
                    self.textoNegociacaoFinalizada = retorno["RMException:Message"];
                }
            });
        }

        /**
         * Verifica se ao finalizar o acordo, o portal irá redicionada para a tela de pagamento com o cartão ou não
         *
         */
        function redirecionarTelaPagamentoComCartao()
        {
            return self.ApenasUmTemplatePagtoCartao && self.boleto != null && exibeBtnPagamentoCartao() && !exibeBtnPagamentoBoleto() && !exibeBtnPix()
        }

        /**
         * Exibir da modal do termo de aceite do acordo
         *
         */
        function imprimirAcordo(relatorioAceite) {
            var objImprimirRelatorio = criaObjImprimir(self.conteudoTemplateSelecionado.CodColRelatAceite, self.conteudoTemplateSelecionado.IdRelatAceite);
            EduNegociacaoFactoryEducacional.exibirModalAcordo(relatorioAceite, objImprimirRelatorio);
        }

        /**
         * Exibir opção de pagamento na confirmação da matrícula
         *
         * @returns {Boolean}
         */
        function exibirOpcoesPagamento() {
            return self.boleto !== null && (exibeBtnPagamentoBoleto() || exibeBtnPagamentoCartao() || exibeBtnPix());
        }

        /**
         *
         * Realizar o pagamento via cartão.
         */
         function exibirDadosPagCartao() {
            eduFinanceiroFactory.exibirDadosPagCartao(self.boleto.IDBOLETO);
        }

        /**
         * Exibe opção de pagamento via cartão
         *
         * @returns {Boolean}
         */
        function exibeBtnPagamentoCartao () {
            return self.boleto.PGCARTAODEBITO === eduEnumsConsts.EduSimOuNaoEnum.Sim
                    || self.boleto.PGCARTAOCREDITO === eduEnumsConsts.EduSimOuNaoEnum.Sim;
        }

        /**
         * Exibe opção de pagamento via impressão do boleto
         *
         * @returns
         */
        function exibeBtnPagamentoBoleto() {
            return eduFinanceiroService.permitePagamentoBoleto(self.boleto, self.parametrosEducacional);
        }


        /**
         * Exibe opção de pagamento via Pix
         *
         * @returns
         */
        function exibeBtnPix() {
            return eduFinanceiroService.permitePagamentoPix(self.boleto, self.parametrosEducacional);
        }

        /**
         * Gera modal com qrcode para pagamento com Pix
         */
        function exibirDadosPix()
        {
            if (self.boleto) {
                eduFinanceiroService.visualizarPix(self.contextoCurso.cursoSelecionado.CODCOLIGADA, self.boleto.IDBOLETO, function(obj) {});
            }
        }

        /**
         * Emite boleto
         */
         function emitirBoleto() {
            if (self.boleto) {
                eduFinanceiroService.visualizarBoleto(self.boleto.IDBOLETO, self.boleto.NOSSONUMERO, self.boleto.DATAVENCIMENTO, self.parametrosEducacional, function (objInfoBoleto) {
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

        function retornaTextoi18n(key) {
            return i18nFilter(key, [], 'js/aluno/negociacao');
        }

        function formatarData(data) {
            return new Date(data).toLocaleDateString();
        }

        function scroolToButtonConfirmation(){
            if (self.liAceito) {
                setTimeout(function() {
                    window.scrollTo(0,10000000000)
                    }, 210, function(){ isScrolling = false; }
                );
            }
        }

        function recuperaUsuarioLogado(contexto) {
            if (contexto.entrarComo === TotvsDesktopContextoCursoFactory.tipoUsuarioEnum.Responsavel)
            {
                if (contexto.CODUSUARIORESPFINANCEIRO) {
                    return contexto.CODUSUARIORESPFINANCEIRO;
                }
                if (contexto.CODUSUARIORACA) {
                    return contexto.CODUSUARIORACA;
                }
                if (contexto.CODUSUARIOPAI) {
                    return contexto.CODUSUARIOPAI;
                }
                if (contexto.CODUSUARIOMAE) {
                    return contexto.CODUSUARIOMAE;
                }
            }
            else {
                return contexto.cursoSelecionado.CODUSUARIOALUNO;
            }
        }
    }
});
