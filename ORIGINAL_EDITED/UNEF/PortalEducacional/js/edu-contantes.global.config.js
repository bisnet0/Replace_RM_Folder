/**
* @license TOTVS | Portal - TOTVS Educacional v12.1.15
* (c) 2015-2016 TOTVS S/A https://www.totvs.com
* License: Comercial
*/

/* jshint ignore:start */

var EDU_CONST_GLOBAL_URL_BASE_APP = CONST_GLOBAL_URL_BASE_APP.replace(/\/$|$/, '/') + 'app/Edu/PortalEducacional/',
    EDU_CONST_GLOBAL_URL_BASE_SERVICOS = CONST_GLOBAL_URL_BASE_SERVICOS,
    EDU_CONST_GLOBAL_PATH_LOGO = 'assets/img/totvs.png',
    EDU_CONST_URL_LOGIN_APP = '/Source/EDU-EDUCACIONAL/Public/EduPortalAlunoLogin.aspx',
    EDU_CONST_GLOBAL_NAME_MENU_PORTAL_CORPORERM = 'Portal (antigo)',

    /* Indica o Identificador de Configuração de Aplicação Externa, configurado para utilizar Login com Facebook */
    EDU_CONST_GLOBAL_ID_CONFIG_SSO_FACEBOOK = 0,

    /* Indica se o alias deve ser exibido na tela de login*/
    EDU_CONST_GLOBAL_EXIBIR_ALIAS = true,

    /* Indica a customização no arquivo de CSS */
    EDU_CONST_GLOBAL_CUSTOM_CSS = false,

    /* Indica o idioma padrão do portal do aluno | 'pt', 'es' e 'en' */
    EDU_CONST_GLOBAL_CUSTOM_IDIOMA = 'pt',

    /* Indica o componente utilizado para integração no pagamento por cartão de crédito com a Adyen */
    EDUPS_CONST_GLOBAL_ADYEN_PAYMENT_SOURCE_NAME = 'Web Component',
    EDUPS_CONST_GLOBAL_ADYEN_PAYMENT_SOURCE_VERSION = '3.9.4',

    /* Indica quais os arquivos de visualização (views: html) serão customizados */
    EDU_CONST_GLOBAL_CUSTOM_VIEW = {
        academiaSocial: false,
        arquivos: false,
        arquivosMateriais: false,
        arquivosMateriaisInstituicao: false,
        atividadesExtras: false,
        atividadesExtrasInscricao: false,
        atividadesExtrasInscritas: false,
        aulas: false,
        aulasDetalhes: false,
        avaliacoes: false,
        avaliacoesInstitucional: false,
        calendario: false,
        cursos: false,
        dadosPessoais: false,
        dadosProfissionais: false,
        dadosPessoaisDocumentos: false,
        dadosPessoaisMovAcadEdit: false,
        dadosPessoaisMovAcadList: false,
        dadosPessoaisResponsaveisEdit: false,
        dadosPessoaisResponsaveisList: false,
        disciplina: false,
        disciplinaComplemento: false,
        disciplinasEb: false,
        entregas: false,
        faltas: false,
        faltasAula: false,
        faltasEtapas: false,
        fichaMedica: false,
        documentos: false,
        financeiro: false,
        financeiroNew: false,
        carteiraDigital:false,
        financeiroBeneficios: false,
        financeiroLancamentos: false,
        financeiroNegociacao: false,
        financeiroPagCartao: false,
        gradeCurricular: false,
        historicoEb: false,
        matriculaEnsinoSuperior: false,
        matriculaEnsinoBasico: false,
        matriculaEtapaApresentacaoEnsinoBasico: false,
        matriculaEtapaSelecaoPeriodoLetivoEnsinoBasico: false,
        matriculaEtapaDisciplinasEnsinoBasico: false,
        matriculaEtapaItinerarioFormativoEnsinoBasico: false,
        matriculaEtapaDocumentosEnsinoBasico: false,
        matriculaEtapaPlanosPagamentoEnsinoBasico: false,
        matriculaEtapaFinalizacaoEnsinoBasico: false,
        mural: false,
        negociacao: false,
        negociacaoListagemDebitosFinanceiros: false,
        negociacaoSelecaoTemplateAcordo: false,
        negociacaoConfirmacao: false,
        notas: false,
        notasAvaliacoes: false,
        notasEtapas: false,
        ocorrencias: false,
        periodoMatricula: false,
        quadroHorario: false,
        requerimentos: false,
        requerimentosEdit: false,
        requerimentosSolicitados: false,
        requerimentosDisponiveis: false,
        tccAcompanhamento: false,
        tccArquivoFinal: false,
        tccBanca: false,
        tccInformacoes: false,
        vagasEmprego: false,
        notaFalta: false,
        desempenho: false,
        planoAula: false,
        pagamentoCartao: false,
        estagio: false,
        estagioSolicitacao: false,
        estagioSolicitacaoTermo: false,
        estagioVagasDisponiveis: false,
        estagioVagasInscritas: false,
        pesquisaAcervo: false,
        bibMovimentacoes: false,
        bibMovimentacoesEmprestimos: false,
        bibMovimentacoesReservas: false,
        bibMovimentacoesSugestaoCompra: false,
        bibExtratoFinanceiro: false,
    },
    /* Indica quais os arquivos de controller serão customizados */
    EDU_CONST_GLOBAL_CUSTOM_CONTROLLER = {
        academiaSocial: false,
        arquivos: false,
        arquivosMateriais: false,
        arquivosMateriaisInstituicao: false,
        atividadesExtras: false,
        atividadesExtrasInscricao: false,
        atividadesExtrasInscritas: false,
        aulas: false,
        aulasDetalhes: false,
        avaliacoes: false,
        avaliacoesInstitucional: false,
        calendario: false,
        cursos: false,
        dadosPessoais: false,
        dadosProfissionais: false,
        dadosPessoaisDocumentos: false,
        dadosPessoaisMovAcadEdit: false,
        dadosPessoaisMovAcadList: false,
        dadosPessoaisResponsaveisEdit: false,
        dadosPessoaisResponsaveisList: false,
        disciplina: false,
        disciplinaComplemento: false,
        disciplinasEb: false,
        entregas: false,
        faltas: false,
        faltasAula: false,
        faltasEtapas: false,
        fichaMedica: false,
        documentos: false,
        financeiro: false,
        financeiroNew: false,
        carteiraDigital:false,
        financeiroBeneficios: false,
        financeiroLancamentos: false,
        financeiroNegociacao: false,
        financeiroPagCartao: false,
        gradeCurricular: false,
        historicoEb: false,
        matriculaEnsinoSuperior: false,
        matriculaEnsinoBasico: false,
        mural: false,
        negociacao: false,
        notas: false,
        notasAvaliacoes: false,
        notasEtapas: false,
        ocorrencias: false,
        periodoMatricula: false,
        quadroHorario: false,
        requerimentos: false,
        requerimentosEdit: false,
        requerimentosSolicitados: false,
        requerimentosDisponiveis: false,
        tccAcompanhamento: false,
        tccArquivoFinal: false,
        tccBanca: false,
        tccInformacoes: false,
        vagasEmprego: false,
        notaFalta: false,
        desempenho: false,
        planoAula: false,
        pagamentoCartao: false,
        estagio: false,
        estagioSolicitacao: false,
        estagioSolicitacaoTermo: false,
        estagioVagasDisponiveis: false,
        estagioVagasInscritas: false,
        pesquisaAcervo: false,
        bibMovimentacoes: false,
        bibMovimentacoesEmprestimos: false,
        bibMovimentacoesReservas: false,
        bibMovimentacoesSugestaoCompra: false,
        bibExtratoFinanceiro: false
    },
    /* Campos que serão visiveis durante a consulta pública*/
    EDU_CONST_CONSULTA_PUBLICA_DIPLOMA =
    {
        Nome: true,
        CPF: true,
        Registro: true,
        Expedicao: true
    },
    /* Indica a chave para utilização do reCAPTCHA do google na tela de consulta de diplomas do portal do aluno.
       Acesse o site do google https://www.google.com/recaptcha/ para registrar o reCAPTCHA
       e preencha as tags abaixo conforme orientação do site */
    KEY_RECAPTCHA = '',

    /*Indica que o canal de pagamento é Portal*/
    EDU_CONST_CANAL_PAGAMENTO_PORTAL = 1,

    /*Indica se o item de menu de Matrícula Online para o Ensino Superior irá ser exibido, mesmo com a permissão de acesso no perfil de usuário */
    EDU_CONST_PORTAL_MATRICULAES = true,

    /*URL do EducaMobile*/
    EDU_CONST_URL_EDUCAMOBILE = '',

    /*URL da loja da app store para baixar o EduConnect*/
    EDU_CONST_URL_EDUCONNECT_IOS = '',

    /*URL da play store para baixar o EduConnect*/
    EDU_CONST_URL_EDUCONNECT_ANDROID = '';

	/*Código do google analytics*/
	EDU_CONST_GOOGLE_ANALYTICS = 'G-NMRP9NLL67'

/* jshint ignore:end */

/*************************************************************************/
/**                                                                     **/
/**  I M P O R T A N T E                                                **/
/**  -------------------                                                **/
/**                                                                     **/
/**  Este arquivo deve conter todas as variáveis/constantes de          **/
/**  de configuração global do TOTVS Portal Educacional                 **/
/**                                                                     **/
/*************************************************************************/
