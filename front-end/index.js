//let url = 'http://localhost:3002'
let url ='https://wypozyczalnia-hulajnog.herokuapp.com'

async function login_handler(event) {
    event.preventDefault();
    const Customer = {
        email: document.querySelector("#klient_email").value,
        haslo: document.querySelector("#klient_haslo").value
    };
    try {
        const response = await fetch(url + '/customer_log',
            {
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                method: 'post',
                body: JSON.stringify(Customer)
            });
        const client = await response.json();
        if(client.length === 1){
            console.log("dobre dane")
            console.log(client)
            sessionStorage.setItem('userID', client[0].klient_id);
            sessionStorage.setItem('isCustomer', true);
            sessionStorage.setItem('isWorker', false);
            window.location.href = "client.html";
        } else {
            alert("złe dane!")
        }
    } catch (error) {
        console.log(error)
    }
}


