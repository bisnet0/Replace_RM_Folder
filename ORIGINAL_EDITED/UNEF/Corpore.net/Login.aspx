<%@ page language="c#" inherits="Corpore.Net.Login, App_Web_login.aspx.cdcab7d2" culture="auto" uiculture="auto" meta:resourcekey="PageResource1" %>

<%@ Register Assembly="RM.Lib.WebForms" Namespace="RM.Lib.WebForms" TagPrefix="RMWF" %>
<%@ Register Src="~/SharedServices/Captcha/RMSCaptcha.ascx" TagPrefix="uc1" TagName="RMSCaptcha" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html>
<head id="HEAD1" runat="server">
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta content="Microsoft Visual Studio .NET 7.1" name="GENERATOR" />
    <meta content="C#" name="CODE_LANGUAGE" />
    <meta content="JavaScript" name="vs_defaultClientScript" />
    <meta content="http://schemas.microsoft.com/intellisense/ie5" name="vs_targetSchema" />
    <meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1" />
    <meta name="description" content="Bem-vindo à rede social corporativa que vai transformar a sua empresa." />
    <meta name="keywords" content="" />
    <meta name="rating" content="General" />
    <meta name="author" content="TOTVS SA" />
    <meta name="language" content="pt-br" />
    <meta name="robots" content="ALL" />
    <title>Login TOTVS</title>
    <link rel="icon" type="image/x-icon" href="Nova_Tela_Login/favicon.ico" />
    <link rel="shortcut icon" type="image/x-icon" href="Nova_Tela_Login/favicon.ico" />
    <link rel="stylesheet" href="Nova_Tela_Login/css/bootstrap.min.css" />
    <link rel="stylesheet" href="Nova_Tela_Login/css/site.all.min.css" />
    <link rel="stylesheet" href="Nova_Tela_Login/css/customizeLogin.css" />
	<link rel="stylesheet" href="Nova_Tela_Login/css/changes.css" />
</head>
<body>
    <div class="login-page">

        <div id="divMessage" runat="server" class="header" visible="false">
          <a href="http://suporte.totvs.com" target="_blank" title="Suporte TOTVS">
            <h1 class="logo">Suporte TOTVS</h1>
          </a>
        </div>

        <div class="login-header">
            <img alt="" class="login-logo" src="Nova_Tela_Login/img/logo.png" />
            <label class="login-label-produto">Linha RM</label>
            <label class="login-label-complemento">Boas-vindas</label>
        </div>

        <div class="login-body">

            <div class="login-body-main">
            </div>

            <form id="Form1" runat="server" role="form" defaultbutton="btnLogin">
               
                <div id="divLogin" runat="server" class="box-formulario-login">                     

                    <div class="login-body-main">

                        <div class="login-oauth">
                          <asp:Panel runat="server" id="pnlOauthPanel"></asp:Panel>
                        </div>

                        <div class="row div-item">
                            <input id="txtUser" runat="server" maxlength="60" class="form-control login-text login-user" placeholder="Insira seu Usuário ou E-mail" autofocus autocomplete="off" autocapitalize="off" autocorrect="off" type="text" data-val="true" data-val-required="Usuário ou E-mail não informado." />
                        </div>

                        <div class="row div-item">
                            <input id="txtPass" type="password" runat="server" maxlength="20" autocomplete="off" class="form-control login-text login-password" placeholder="Insira sua Senha" autocapitalize="off" autocorrect="off" data-val="true" data-val-required="Senha não informada." />
                        </div>

                        <div class="row div-item">

                            <asp:DropDownList class="form-control login-text login-alias" data-val="true" data-val-required="Informe o Alias." name="Alias"  ID="ddlAlias" runat="server" meta:resourcekey="ddlAliasResource1" AutoPostBack="True" >
                            </asp:DropDownList>
                            
                        </div>

                        <div class="row div-item">
                            <uc1:RMSCaptcha runat="server" ID="RMSCaptcha" Visible="false" />
                        </div><br/>

                        <div class="row div-item">

                            <asp:Button ID="btnLogin" runat="server" CssClass="btn btn-primary login-button" Text="Acessar" OnClick="btnLogin_Click"
                  meta:resourcekey="btnLoginResource1"></asp:Button>
                        </div>

                        <div class="row div-item div-manage-box">
                            <p><a href=""><RMWF:RMWRecoverPassControl runat="server" ID="lblForgotPass" Text="Esqueceu sua senha?"
                  NameServer="" UserNameControl="txtUser" Alias="ddlAlias" ServerName="RMSRecoverPass"
                  MethodName="GetRecoverPassServer" AliasControl="ddlAlias" InitializeMethodName="GetRecoverPassServer"
                  UserCaption="" ConfirmationCaption="" CssClass="esqueceu-a-senha link"
                  meta:resourcekey="lblForgotPassResource1"></RMWF:RMWRecoverPassControl></a>
                            </p>
                        </div>

                    </div>                   
                </div>
            </form>

            <br/>
            <hr/>
            <br/>

            <div class="main">
                <fieldset>
                </fieldset>
                <div class="box-left">
                    <asp:Label ID="lblMessage" runat="server" CssClass="LoginMessage" Visible="False"
                        BackColor="Transparent" BorderColor="Transparent" meta:resourcekey="lblMessageResource1"
                        Text="Seu acesso ao RM Portal expirou. É necessário fazer o Login na aplicação."></asp:Label>
                </div>
            </div>

            <div class="footer">
                <div class="style1">
                    <asp:Label ID="lbNewUserCaption" runat="server" CssClass="LoginAnnonServiceCaption"
                        Text="Currículo" onclick="RedirectToNewUser()" meta:resourcekey="lbNewUserCaptionResource1"></asp:Label>
                    <asp:Label ID="lbCotacaoCaption" runat="server" CssClass="LoginAnnonServiceCaption"
                        Text="Cotação On-line" onclick="RedirectToCotacao()" meta:resourcekey="lbCotacaoCaptionResource1"></asp:Label>
                    <asp:Label ID="lblExecutorCaption" runat="server" CssClass="LoginAnnonServiceCaption"
                        onclick="RedirectToExecutor()" Text="Executor Web" meta:resourcekey="lblExecutorCaptionResource1"></asp:Label>
                    <asp:Label ID="Label3" runat="server" CssClass="LoginAnnonServiceCaption" onclick="RedirectToPesquisaAcervoBiblios()"
                        Text="Pesquisar acervo" meta:resourcekey="lbPesquisaAcervo"></asp:Label>
                    <asp:Label ID="lbForum" runat="server" CssClass="LoginAnnonServiceCaption" Text="Forum"
                        onclick="RedirectForum()" meta:resourcekey="lbForumResource1"></asp:Label>
                    <asp:Label ID="lbReportsCertificateCaption" runat="server" CssClass="LoginAnnonServiceCaption"
                        Text="Certificador de Relatórios"
                        onclick="RedirectCertificadoRelatorios()"
                        meta:resourcekey="lbReportsCertificateCaptionResource1"></asp:Label>
                </div>
            </div>

        </div>

        <div class="login-footer">
            <img src="Nova_Tela_Login/img/logo_cinza.png" class="grey">
        </div>

    </div>

    <script type="text/javascript" src="SharedServices/ClientScripts/jquery-latest.min.js"></script>
    <script type="text/javascript" src="SharedServices/ClientScripts/bootstrap.min.3.4.1.js"></script>
    <script type="text/javascript" src="SharedServices/ClientScripts/jquery.validate.min.js"></script>
    <script type="text/javascript" src="SharedServices/ClientScripts/jquery.validate.unobtrusive.min.js"></script>

</body>
</html>