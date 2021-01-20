//let url = 'http://localhost:3002';
let url ='https://wypozyczalnia-hulajnog.herokuapp.com'

async function user_info_handler() {
    const Customer = {
        k_id: sessionStorage.getItem('userID'),
    };
    try {
        const response = await fetch(url + '/info_customer',
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
            const content = document.querySelector("#dane_klienta");
            dane = '<h4><b>Imię i nazwisko: </b>' + client[0].imie + " " + client[0].nazwisko + '</h4>';
            dane += '<h4><b>Email:</b> '+ client[0].email + '</h4>';
            dane+= '<h4><b>Dostępne środki: </b>' + client[0].dostepne_srodki + '</h4>';
            content.innerHTML =dane;
            console.log(client[0]);
        }
    } catch (error) {
        console.log(error)
    }
}

document.addEventListener('DOMContentLoaded', user_info_handler());

async function user_payment(event) {
    event.preventDefault();
    const payment = document.querySelector('#payment').value;
    try {
        const response = await fetch(url + '/customer_payment',
            {
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                method: 'post',
                body: JSON.stringify({ kwota : payment, klient_id: sessionStorage.getItem('userID')})
            });
        const client = await response.json();
        alert("doładowanie powiodło się")
        user_info_handler()

    } catch (error) {
        console.log(error)
    }
}

async function user_location(event) {
    event.preventDefault();
    const x = document.querySelector('#x')
    const y = document.querySelector('#y')
    if(x.checkValidity() && y.checkValidity())
    {
        try {
            const response = await fetch(url + '/customer_location',
                {
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                    },
                    method: 'post',
                    body: JSON.stringify({ dlugosc_geo : x.value, szerokosc_geo: y.value, klient_id: sessionStorage.getItem('userID')})
                });
            alert("lokalizacja została uaktualniona");

        } catch (error) {
            console.log(error);
        }
    }
    else{
        alert("wypelnij pola!")
    }

    
}

async function get_hulajnogi() {
    tabela = document.querySelector("#hulajnogi_tabela")
    //event.preventDefault();
    try {
        klient_id = sessionStorage.getItem('userID');
        const response = await fetch(url + '/get_hulajnogi/'+klient_id)
        const hulajnoga = await response.json();
        let kod = "";
        console.log(hulajnoga);
        kod+='<table class=" table table-striped"><tr><th>id</th><th>dlugosc geo</th><th>szerokosc geo</th><th>odleglosc</th><th>jedź</th><th>rezerwuj</th></tr><tbody>'
        hulajnoga.forEach(obj => {
            kod+=`<tr id=tr${obj["thulajnoga_id"]}>`;
            Object.entries(obj).forEach(([key, value]) => {
                kod+=`<td>${value}</td>`
            });
            kod+=`<td><button type="submit" class="cc" id = ${obj["thulajnoga_id"]} onclick="handleJazda(this.id)" name=j${obj["thulajnoga_id"]}>zacznij jazde</button></td>`
            kod+=`<td><button type="submit" class="cc" id= ${obj["thulajnoga_id"]} onclick="handleRezerwacja(this.id)" name=j${obj["thulajnoga_id"]}>zarezerwuj</button></td>`
            kod+="</tr>"
        });
        kod+="</tbody></table>"
        tabela.innerHTML = kod;
        

    } catch (error) {
        console.log(error);
    }
}


async function handleJazda(hulajnoga_id) {
    try {
        console.log(sessionStorage.getItem('userID'))
        var currentdate = new Date(); 
        var datetime = currentdate.getFullYear() + "-"+ (currentdate.getMonth()+1) +"-" +currentdate.getDate() + " "
                + currentdate.getHours() + ":"  
                + currentdate.getMinutes() + ":" 
                + currentdate.getSeconds();
        const response = await fetch(url +'/new_wypozyczenie',
            {
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                method: 'post',
                body: JSON.stringify({klient_id:sessionStorage.getItem('userID'), hulajnoga_id:hulajnoga_id, poczatek_czasu:datetime})
            });
        if(response.status === 409) {
            alert("Doładuj konto!")
        } 
        else {
            console.log("here")
            window.location.href = "wypozyczenie.html";
        }   

    } catch (error) {
        console.log(error);
    }
}

async function handleRezerwacja(hulajnoga_id) {
    try {
        let klient_id = sessionStorage.getItem('userID');
        console.log(hulajnoga_id);
        const response = await fetch(url + '/new_rezerwacja',
            {
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                method: 'post',
                body: JSON.stringify({hulajnoga_id:hulajnoga_id, klient_id:klient_id})
            });
        let rezerewacja = document.getElementById("rezerwacja");
        dane = '<h4>Twoja zarezerwowana hulajnoga:</h4>'
        dane += `<td><button type="submit" class="btn btn-primary" id= ${hulajnoga_id} onclick="handleOdrezerwuj(this.id)">odrezerwuj</button></td>`
        dane += `<td><button type="submit" class="btn btn-primary" id= ${hulajnoga_id} onclick="handleJazda(this.id)">zacznij jazdę</button></td>`
        rezerewacja.innerHTML = dane;
        var elems = document.getElementsByClassName("cc");
        for(var i = 0; i < elems.length; i++) {
            elems[i].disabled = true;
        }
    } catch (error) {
        console.log(error);
    }
}

async function handleOdrezerwuj(hulajnoga_id) {
    try {
        let klient_id = sessionStorage.getItem('userID');
        const response = await fetch(url + '/new_odrezerwacja',
            {
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                method: 'post',
                body: JSON.stringify({hulajnoga_id:hulajnoga_id, klient_id:klient_id})
            });
    } catch (error) {
        console.log(error);
    }
    var elems = document.getElementsByClassName("cc");
    for(var i = 0; i < elems.length; i++) {
        console.log(elems)
        elems[i].disabled = false;
    }
    let rezerewacja = document.getElementById("rezerwacja");
    rezerewacja.innerHTML = ''

}

async function get_transakcje(event) {
    tabela = document.querySelector("#transakcje_tabela")
    event.preventDefault();
    try {
        klient_id = sessionStorage.getItem('userID');
        const response = await fetch(url + '/get_transakcje/'+klient_id);
        const transakcje = await response.json();
        let kod = "";
        kod+='<table class=" table"><tr><th>status</th><th>kwota</th></tr><tbody>'
        transakcje.forEach(obj => {
            if(obj["status_transakcji"]===1)
            {
                kod+=`<tr style="background-color:#a4dca4">`;
                kod+= `<td>wpłata</td>`;
            }
            else if(obj["status_transakcji"]===-1)
            {
                kod+=`<tr style="background-color:#f1a5a5">`;
                kod+= `<td >wydatek</td>`;
            }
            
            kod+= `<td>${obj["kwota"]}</td>`;
            kod+="</tr>"
        });
        kod+="</tbody></table>"
        tabela.innerHTML = kod;
        console.log(transakcje);
        

    } catch (error) {
        console.log(error);
    }
}

async function user_haslo(event){
    event.preventDefault();
    let stare_haslo = document.querySelector('#stare_haslo').value;
    let nowe_haslo = document.querySelector('#nowe_haslo').value;
    const response = await fetch(url + '/update_haslo',
            {
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                method: 'post',
                body: JSON.stringify({klient_id: sessionStorage.getItem('userID'), stare_haslo:stare_haslo, nowe_haslo:nowe_haslo})
            });
            if(response.status === 409) {
                alert("Złe stare hasło!");
            } 
            else {
                alert("Zmiana hasła powiodła się");
            }   
}

async function log_out_handler(event) {
    event.preventDefault();
    sessionStorage.clear();
    window.location.href = "index.html";
}

