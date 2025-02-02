async function virtualLibrary(event) {
    // Loading message
    event.target.innerHTML = '<span class="ico-book"></span>Aguarde...'

    // Get full information
    let information = document.querySelector("#desktopHeaderMenu > span.pull-left").textContent

    // Remove useless information
    information = information.replace('(RA: ', '').replace(')', '').split(' ')

    // Get data
    const firstName = information[0]
    const lastName = information[information.length - 2] || information[information.length - 3]
    const ra = information[information.length - 1]

    // Requisition
    let response = ''
    try {
        response = await fetch(`https://gruponobre.netlify.app/.netlify/functions/bibli_unef`, {
            method: 'post',
            body: JSON.stringify({
                firstName,
                lastName,
                ra
            })
        })
    } catch (error) {
        window.alert('Tente novamente');
        location.reload();
    }

    const data = await response.json()

    if (response.status == 200) {
        const userAgent = navigator.userAgent;

        if (userAgent.match('Chrome')) {
            window.open(data.resposta)
        } else {
            window.location.href = data.resposta
        }
    } else {
        window.alert('Não encontrado cadastro na biblioteca online, entre em contato com a instituição.')
    }

    event.target.innerHTML = '<span class="ico-book"></span>Biblioteca online'
}