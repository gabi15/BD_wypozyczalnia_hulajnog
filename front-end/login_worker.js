//let url = 'http://localhost:3002'
let url ='https://wypozyczalnia-hulajnog.herokuapp.com'

async function login_handler(event) {
    event.preventDefault();
    const Worker = {
        email: document.querySelector("#worker_email").value,
        haslo: document.querySelector("#worker_haslo").value
    };
    try {
        const response = await fetch(url + '/worker_log',
            {
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                method: 'post',
                body: JSON.stringify(Worker)
            });
        const client = await response.json();
        if(client.length === 1){
            console.log("dobre dane")
            sessionStorage.setItem('userID', client[0].pracownik_id);
            sessionStorage.setItem('isCustomer', false);
            sessionStorage.setItem('isWorker', true);
            window.location.href = "worker.html";
        } else {
            alert("wprowadzono złe dane");
        }
    } catch (error) {
        console.log(error)
    }
}