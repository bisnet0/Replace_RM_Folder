// Loading page
document.body.style.display = 'none';
setTimeout(()=>{
    document.body.style.display = 'block';
}, 1900)

// Create library button
const libraryButton = document.createElement('button')
libraryButton.setAttribute('id', 'libraryButton')
libraryButton.setAttribute('onclick', 'onlineLibrary()')
libraryButton.innerHTML = '<img src="libraryIcon.png"/>Biblioteca online'

document.body.appendChild(libraryButton)

// EBSCO
const ebsco = document.createElement('a')
ebsco.setAttribute('id', 'ebsco')
ebsco.setAttribute('href','https://search.ebscohost.com/login.aspx?authtype=ip,uid&custid=ns110797&groupid=main&profile=ehost&user=ebscopreviewfnfs&password=UIPreview2022@')
ebsco.setAttribute('target','_blank')
ebsco.innerHTML = '<img src="libraryIcon.png"/>EBSCO'

document.body.appendChild(ebsco)

const url = document.URL

if(!url.match('login') && window.innerWidth > 767){
    libraryButton.style.display = 'flex'
	ebsco.style.display = 'flex'
}

let loginButton = ''

setTimeout(()=>{
    try {
        // Get login button
        loginButton = document.querySelector('.po-button-primary')

        // Library Button appears
        loginButton.addEventListener('click', ()=>{
            libraryButton.style.display = 'flex'
            sessionStorage.setItem('cpf', document.querySelector('.po-input-icon-left').value)
        })

        // Enter on input
        document.querySelector('.po-input-icon-right').addEventListener('keypress', event =>{
            if(event.keyCode == 13){
                libraryButton.style.display = 'flex'
                sessionStorage.setItem('cpf', document.querySelector('.po-input-icon-left').value)
            }
        })
    } catch (error) {
        // pass
    }
}, 2000)

async function onlineLibrary(){
    // Open teacher menu
    try {
        document.querySelector('.po-avatar').click()
        window.alert('Solicitação à biblioteca executada com sucesso, aguarde alguns segundos!')
    } catch (error) {
        window.alert('Realize o login na plataforma.')
        return;
    }

    // Get teacher name
    const teacherName = document.querySelector('.po-toolbar-profile-item-header-title').innerText.split(' ')
    const firstName = teacherName[0]
    const lastName = teacherName.pop()

    let response = ''

    if(!firstName){
		window.alert('Algo de errado aconteceu, faça o login na plataforma novamente ou entre em contato com a gestão do sistema.')
		return;
	}
    
    // Request
    try {
        response = await fetch('https://home.gruponobre.edu.br/.netlify/functions/bibli_unef', {
        method: 'post',
        body: JSON.stringify({
            firstName,
            lastName,
            ra: sessionStorage.getItem('cpf')
        })
    })
    } catch (error) {
        location.reload()
    }

    const data = await response.json()

    window.open(data.resposta)
}