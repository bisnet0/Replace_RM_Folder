<%@ page language="C#" autoeventwireup="true" inherits="RptFindReportByGuid, App_Web_rptfindreportbyguid.aspx.27f9dd9a" %>
<%@ Import Namespace="RM.Lib.Web" %>
<%@ Register Assembly="RM.Lib.WebForms" Namespace="RM.Lib.WebForms" TagPrefix="RMWF" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title></title>
    <script type="text/javascript" language="javascript" src="../Scripts/RptUtils.js"></script>
    <script type ="text/javascript" language="javascript">
        ReplaceAnchorLink = function () {

            var result = "";
            if (typeof RptPossuiPDFReader === "function")
                result = RptPossuiPDFReader();

            if (document.getElementById('aVisualizar')) {
                document.getElementById('aVisualizar').href += "&hasPdf=" + result.toString();
                document.getElementById('aVisualizar').target = "_blank";
            }
        }
    </script>
	
	<link rel="icon" type="image/x-icon" href="favicon.ico"/>
</head>
<body onload="ReplaceAnchorLink();" id="generatorBody">
    <form id="frmMain" runat="server">
    <div id="formDiv">
      <p>
		<img id="logoUNEF" src="FAN.png"/>
        <h3>CERTIFICADO DE EMISSÃO DE RELATÓRIOS</h3>
      </p>
      <div id="inputDiv">
          <asp:Label ID="lblGuid" runat="server" meta:resourcekey="LabelGuid">Informe a identificação do relatório:</asp:Label><br />
          <asp:TextBox ID="txtGuid" runat="server" CausesValidation="True" meta:resourcekey="TextGuid" Width="320px" />
          <RMWF:RMWRequiredFieldValidator ID="RMWRequiredFieldValidatorGuid" runat="server" ControlToValidate="txtGuid"
              meta:resourcekey="RequiredField" ClientValidationFunction="RMWRequiredFieldValidatorIsValid" ValidateEmptyText="True" />
          <asp:Button ID="btnBuscar" Text="Buscar" runat="server" />
      </div>

      <p />

      <asp:repeater id="rptRelatorios" runat="server" Visible="false">
        <HeaderTemplate>
          <table>
            <tr bgcolor="#D0D0D0">
              <th>Identificação</th>
              <th>Descrição</th>
              <th>Data de Criação</th>
              <th>&nbsp;</th>
            </tr>
        </HeaderTemplate>
        <ItemTemplate>
            <tr bgcolor="#FFFFFF">
              <td><%# DataBinder.Eval(Container.DataItem, "GUID") %></td>
              <td><%# DataBinder.Eval(Container.DataItem, "DESCRELAT") %></td>
              <td><%# DataBinder.Eval(Container.DataItem, "RECCREATEDON") %></td>
              <td>
                <a id="aVisualizar" href="<%=RMWUtils.GetUrlBase()%>Source/Rpt-GeradorRelatoriosNet/RM.Rpt.Reports/Anonymous/RptReportViewerAnonymous.aspx?GUID=<%# DataBinder.Eval(Container.DataItem,"GUID")%>&anonymous=true" target="_blank">
                  Visualizar
                </a>
              </td>
            </tr>
        </ItemTemplate>
        <AlternatingItemTemplate>
            <tr bgcolor="#F0F0F0">
              <td><%# DataBinder.Eval(Container.DataItem, "GUID") %></td>
              <td><%# DataBinder.Eval(Container.DataItem, "DESCRELAT") %></td>
              <td><%# DataBinder.Eval(Container.DataItem, "RECCREATEDON") %></td>
              <td>
                <a id="aVisualizar" href="<%=RMWUtils.GetUrlBase()%>Source/Rpt-GeradorRelatoriosNet/RM.Rpt.Reports/Anonymous/RptReportViewerAnonymous.aspx?GUID=<%# DataBinder.Eval(Container.DataItem,"GUID")%>&anonymous=true" target="_blank">
                  Visualizar
                </a>
              </td>
            </tr>        
        </AlternatingItemTemplate>
        <FooterTemplate>
          </table>
        </FooterTemplate>
      </asp:repeater>
      <asp:Panel ID="pnlMensagem" runat="server" Visible="false">
        Nenhum relatório encontrado para a identificação informada.
      </asp:Panel>
    </div>
    </form>
</body>
</html>