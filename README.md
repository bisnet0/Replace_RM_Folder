# 🚀 Replace Folder Grupo Nobre

Este script automatiza a substituição de pastas específicas para personalização dos portais da UNIFAN, UNEF e Colégio Nobre.

## 📌 Funcionalidades
- Encontra a pasta mais recente dentro de um diretório com hashes.
- Substitui arquivos e pastas mantendo versões anteriores com a extensão `--old`.
- Permite escolher entre diferentes instituições para personalização.

## 🛠️ Como Usar
1. Execute o script.
2. Escolha a opção desejada no menu:
   - `1` para personalizar a **UNIFAN**.
   - `2` para personalizar a **UNEF**.
   - `3` para personalizar o **Colégio Nobre**.
3. O script irá copiar os arquivos para os diretórios corretos automaticamente.

## 📂 Estrutura do Código

### `encontrar_pasta_atualizada(diretorio_origem)`
- Busca a pasta mais recente dentro do diretório de origem.
- Filtra por pastas que seguem o formato de hash.

### `substituir_pasta(caminho_origem, caminho_destino)`
- Substitui os arquivos da pasta de origem na pasta de destino.
- Mantém versões antigas renomeando com `--old`.

### `substituir_varias_pastas(lista_caminhos)`
- Itera sobre uma lista de caminhos de origem e destino.
- Chama `substituir_pasta` para cada item.

### `menu_interativo()`
- Exibe o menu de opções para escolher a personalização desejada.

## 🖥️ Exemplo de Uso
```bash
python script.py
```

## 🔧 Requisitos
- Python 3.x
- Biblioteca `shutil` (padrão do Python)

## ✨ Autor
Henrique Bisneto
