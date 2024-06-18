import os
import shutil

def encontrar_pasta_atualizada(diretorio_origem):
    # Lista todos os diretórios dentro do diretório de origem
    subdiretorios = [os.path.join(diretorio_origem, d) for d in os.listdir(diretorio_origem) if os.path.isdir(os.path.join(diretorio_origem, d))]
    
    # Filtra apenas os subdiretórios que são hashes (ou seja, têm o formato esperado)
    subdiretorios_hashes = [d for d in subdiretorios if len(os.path.basename(d)) == 36 and '-' in os.path.basename(d)]

    if not subdiretorios_hashes:
        print(f"Nenhuma pasta com nome de hash encontrada em {diretorio_origem}")
        return None
    
    # Ordena os subdiretórios hashes por data de modificação e pega o mais recente
    pasta_atualizada = max(subdiretorios_hashes, key=os.path.getmtime)
    
    print(f"Pasta mais atualizada encontrada: {pasta_atualizada}")
    return pasta_atualizada

def substituir_pasta(caminho_origem, caminho_destino):
    # Verifica se a pasta de origem existe
    if not os.path.isdir(caminho_origem):
        print(f"A pasta de origem {caminho_origem} não existe.")
        return

    # Itera por todos os arquivos e pastas na pasta de origem
    for nome_item in os.listdir(caminho_origem):
        caminho_origem_item = os.path.join(caminho_origem, nome_item)
        caminho_destino_item = os.path.join(caminho_destino, nome_item)
        
        # Se o item de destino já existe e é um arquivo, renomeia-o com '--old' antes da extensão
        if os.path.exists(caminho_destino_item):
            if os.path.isfile(caminho_destino_item):
                nome, extensao = os.path.splitext(caminho_destino_item)
                caminho_destino_item_old = f"{nome}--old{extensao}"
                
                # Remove o arquivo antigo se já existir
                if os.path.exists(caminho_destino_item_old):
                    os.remove(caminho_destino_item_old)
                
                os.rename(caminho_destino_item, caminho_destino_item_old)
                print(f"Arquivo de destino renomeado para: {caminho_destino_item_old}\n")
        
        
        # Copia o arquivo de origem para o destino ou chama recursivamente para pastas
        if os.path.isfile(caminho_origem_item):
            shutil.copy2(caminho_origem_item, caminho_destino_item)
            print(f"Arquivo de origem {caminho_origem_item} copiado para {caminho_destino_item}\n\n")
        elif os.path.isdir(caminho_origem_item):
            substituir_pasta(caminho_origem_item, caminho_destino_item)
        else:
            print(f"Item {caminho_origem_item} não é nem arquivo nem diretório, ignorando.\n")

def substituir_varias_pastas(lista_caminhos):
    for caminho_origem, caminho_destino in lista_caminhos:
        if isinstance(caminho_origem, tuple):
            # Se caminho_origem é uma tupla, é o caso especial com hash
            caminho_hash = encontrar_pasta_atualizada(caminho_origem[0])
            if caminho_hash:
                substituir_pasta(caminho_hash, caminho_origem[1])
        else:
            # Caso padrão: substituir a pasta diretamente
            substituir_pasta(caminho_origem, caminho_destino)

def menu_interativo():
    while True:
        escolha = input(('''
 ██████╗ ██████╗ ██╗   ██╗██████╗  ██████╗     ███╗   ██╗ ██████╗ ██████╗ ██████╗ ███████╗
██╔════╝ ██╔══██╗██║   ██║██╔══██╗██╔═══██╗    ████╗  ██║██╔═══██╗██╔══██╗██╔══██╗██╔════╝
██║  ███╗██████╔╝██║   ██║██████╔╝██║   ██║    ██╔██╗ ██║██║   ██║██████╔╝██████╔╝█████╗  
██║   ██║██╔══██╗██║   ██║██╔═══╝ ██║   ██║    ██║╚██╗██║██║   ██║██╔══██╗██╔══██╗██╔══╝  
╚██████╔╝██║  ██║╚██████╔╝██║     ╚██████╔╝    ██║ ╚████║╚██████╔╝██████╔╝██║  ██║███████╗
 ╚═════╝ ╚═╝  ╚═╝ ╚═════╝ ╚═╝      ╚═════╝     ╚═╝  ╚═══╝ ╚═════╝ ╚═════╝ ╚═╝  ╚═╝╚══════╝
                                By: Henrique Bisneto\n\n'''
    "--------------[MENU]-------------\n                                 |\n"
    "1— Personalizar a UNIFAN         | \n"      
    "2— Personalizar a UNEF           | \n"
    "3— Personalizar o Colégio Nobre  | \n"
    "---------------------------------\n"))
    
        if escolha == '1':
            # Defina os caminhos para personalizar a UNIFAN
            lista_caminhos = [
                (r'C:\Users\Administrador\Downloads\Replace_RM_Folder-main\personalização-portais\UNIFAN\Corpore.net', r'C:\totvs\CorporeRM\Corpore.Net'),
                (r'C:\Users\Administrador\Downloads\Replace_RM_Folder-main\personalização-portais\UNIFAN\PortalDoProfessor', r'C:\totvs\CorporeRM\FrameHTML\Web\App\Edu\PortalDoProfessor'),
                (r'C:\Users\Administrador\Downloads\Replace_RM_Folder-main\personalização-portais\UNIFAN\PortalEducacional', r'C:\totvs\CorporeRM\FrameHTML\Web\App\Edu\PortalEducacional'),
                (r'C:\Users\Administrador\Downloads\Replace_RM_Folder-main\personalização-portais\UNIFAN\PortalGestaoEducacional', r'C:\totvs\CorporeRM\FrameHTML\Web\App\Edu\PortalGestaoEducacional')
            ]
            substituir_varias_pastas(lista_caminhos)
        elif escolha == '2':
            # Defina os caminhos para personalizar a UNEF
            lista_caminhos = [
                (r'C:\Users\administrador.UNEF\Downloads\Replace_RM_Folder-main\personalização-portais\UNIFAN\Corpore.net', r'C:\totvs\CorporeRM\Corpore.Net'),
                (r'C:\Users\administrador.UNEF\Downloads\Replace_RM_Folder-main\personalização-portais\UNIFAN\PortalDoProfessor', r'C:\totvs\CorporeRM\FrameHTML\Web\App\Edu\PortalDoProfessor'),
                (r'C:\Users\administrador.UNEF\Downloads\Replace_RM_Folder-main\personalização-portais\UNIFAN\PortalEducacional', r'C:\totvs\CorporeRM\FrameHTML\Web\App\Edu\PortalEducacional'),
                (r'C:\Users\administrador.UNEF\Downloads\Replace_RM_Folder-main\personalização-portais\UNIFAN\PortalGestaoEducacional', r'C:\totvs\CorporeRM\FrameHTML\Web\App\Edu\PortalGestaoEducacional')
            ]
            substituir_varias_pastas(lista_caminhos)
        elif escolha == '3':
            # Defina os caminhos para personalizar o Colégio Nobre
            lista_caminhos = [
                (r'C:\Users\Administrador\Downloads\Replace_RM_Folder-main\personalização-portais\ColegioNobre\Corpore.net', r'C:\totvs\CorporeRM\Corpore.Net'),
                (r'C:\Users\Administrador\Downloads\Replace_RM_Folder-main\personalização-portais\ColegioNobre\PortaldoProfessor', r'C:\totvs\CorporeRM\FrameHTML\Web\App\Edu\PortalDoProfessor'),
                (r'C:\Users\Administrador\Downloads\Replace_RM_Folder-main\personalização-portais\ColegioNobre\PortalEducacional', r'C:\totvs\CorporeRM\FrameHTML\Web\App\Edu\PortalEducacional'),
                (r'C:\Users\Administrador\Downloads\Replace_RM_Folder-main\personalização-portais\ColegioNobre\PortalGestãoEducacional', r'C:\totvs\CorporeRM\FrameHTML\Web\App\Edu\PortalGestaoEducacional')
            ]
            substituir_varias_pastas(lista_caminhos)
        elif escolha.lower() == 'sair':
            break
        else:
            print("Escolha inválida. Digite 1, 2 ou 3 para personalizar ou 'sair' para encerrar o programa.")

# Chamada do menu interativo
menu_interativo()
