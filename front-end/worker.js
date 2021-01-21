//let url = 'http://localhost:3002'
let url ='https://wypozyczalnia-hulajnog.herokuapp.com'

document.addEventListener('DOMContentLoaded', worker_info_handler);

async function worker_info_handler(event) {
    event.preventDefault();
    const Customer = {
        k_id: sessionStorage.getItem('userID'),
    };
    console.log(Customer);
    try {
        const response = await fetch(url + '/info_worker',
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
            const content = document.querySelector("#dane_pracownika");
            content.innerHTML += '<h4><b>Twoje dane: </b>' + client[0].imie + " " + client[0].nazwisko + '</h4>';
            console.log(client[0]);
        }
    } catch (error) {
        console.log(error)
    }
}

async function get_hulajnogi(event) {
    tabela = document.querySelector("#hulajnogi_tabela")
    event.preventDefault();
    try {
        const response = await fetch(url + '/get_wszystkie_hulajnogi')
        const hulajnoga = await response.json();
        let kod = "";
        console.log(hulajnoga);
        kod+='<table class=" table table-striped"><thead><tr><th>id</th><th>status</th><th>dlugosc geo</th><th>szerokosc geo</th><th>bateria</th></tr></thead><tbody>'
        hulajnoga.forEach(obj => {
            kod+=`<tr id=tr${obj["hulajnoga_id"]}>`;
            Object.entries(obj).forEach(([key, value]) => {
                kod+=`<td>${value}</td>`
            });
            kod+="</tr>"
        });
        kod+="</tbody></table>"
        tabela.innerHTML = kod;
        

    } catch (error) {
        console.log(error);
    }
}

async function get_hulajnogi_ladowanie() {
    tabela = document.querySelector("#hulajnogi_ladowanie_tabela")
    try {
        const response = await fetch(url + '/get_hulajnogi_do_ladowania')
        const hulajnoga = await response.json();
        let kod = "";
        console.log(hulajnoga);
        kod+='<table class=" table table-striped"><tr><th>id</th><th>status</th><th>dlugosc geo</th><th>szerokosc geo</th><th>bateria</th><th>naładuj</th></tr><tbody>'
        hulajnoga.forEach(obj => {
            kod+=`<tr id=tr${obj["hulajnoga_id"]}>`;
            Object.entries(obj).forEach(([key, value]) => {
                kod+=`<td>${value}</td>`
            });
            kod+=`<td><button type="submit" class="btn btn-primary" id = ${obj["hulajnoga_id"]} onclick="handleLadowanie(this.id)" name=ladowanie${obj["hulajnoga_id"]}>naładuj</button></td>`
            kod+="</tr>"
        });
        kod+="</tbody></table>"
        tabela.innerHTML = kod;
        

    } catch (error) {
        console.log(error);
    }
}

async function handleLadowanie(hulajnoga_id) {
    try {
        var currentdate = new Date(); 
        var datetime = currentdate.getFullYear() + "-"+ (currentdate.getMonth()+1) +"-" +currentdate.getDate();
        let pracownik_id = sessionStorage.getItem('userID');
        const response = await fetch(url + '/ladowanie_hulajnogi',
            {
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                method: 'post',
                body: JSON.stringify({pracownik_id : pracownik_id, hulajnoga_id:hulajnoga_id, data:datetime})
            });
            get_hulajnogi_ladowanie();
    } catch (error) {
        console.log(error);
    }
}

async function registration_handler (event) {
    event.preventDefault();
    const imie = document.querySelector('#pracownik_imie');
    const nazwisko = document.querySelector('#pracownik_nazwisko');
    const email = document.querySelector('#pracownik_email');
    const haslo = document.querySelector('#pracownik_haslo');
    if(imie.checkValidity() && nazwisko.checkValidity() && email.checkValidity() && haslo.checkValidity())
    {
        try{
            const response = await fetch(url+'/worker_registration', {
                headers: {
                    'Content-type': 'application/json'
                },
                method: 'POST',
                body: JSON.stringify({ imie : imie.value, nazwisko:nazwisko.value, email:email.value, haslo:haslo.value})
            })
            const client = await response.json();
            console.log(response)
            console.log(response.status);
            if(response.status === 409) {
                alert("podany email już istnieje!")
            } 
            else {
                alert("Rejestracja pracownika przebiegła pomyślnie!");
            }
            document.getElementById("new_pracownik").reset();

        }
        catch(error)
        {
            console.log(error);
        }
    }
}

async function add_serwis(event) {
    event.preventDefault();
    var currentdate = new Date(); 
    const data = currentdate.getFullYear() + "-"+ (currentdate.getMonth()+1) +"-" +currentdate.getDate();
    const nazwa = document.querySelector('#nazwa').value;
    const koszt = document.querySelector('#koszt').value;
    const id_hulajnogi = document.querySelector('#hulajnoga_id').value;
    const id_pracownika = sessionStorage.getItem('userID');
    try {
        const response = await fetch(url + '/add_serwis',
            {
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                method: 'post',
                body: JSON.stringify({ nazwa:nazwa, koszt:koszt, data:data, id_hulajnogi:id_hulajnogi, id_pracownika:id_pracownika})
            });
        if(response.status === 409) {
            alert("podana hulajnoga nie istnieje!")
        } 
        else {
            alert("Serwis został dodany");
            document.getElementById("add_serwis").reset();
        }

    } catch (error) {
        console.log(error);
    }

}

async function add_hulajnoga(event) {
    event.preventDefault();
    const x = document.querySelector('#x').value;
    const y = document.querySelector('#y').value;
    try {
        const response = await fetch(url + '/add_hulajnoga',
            {
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                method: 'post',
                body: JSON.stringify({ dlugosc_geo : x, szerokosc_geo: y})
            });
            alert("hulajnoga została dodana");
            document.getElementById("lokalizacja").reset();
    } catch (error) {
        console.log(error);
    }

}

async function delete_hulajnoga(event){
    event.preventDefault();
    const id = document.querySelector('#delete_hulajnoga_id').value;
    console.log(id);
    try {
        const response = await fetch(url + '/delete_hulajnoga',
            {
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                method: 'post',
                body: JSON.stringify({ hulajnoga_id:id})
            });
            if(response.status === 409) {
                alert("taka hulajnoga nie istnieje")
            } 
            else {
                alert("hulajnoga zostala usunieta!");
            }
            document.getElementById("delete_hulajnoga").reset();
    } catch (error) {
        console.log(error);
    }
}

async function delete_klient(event){
    event.preventDefault();
    const id = document.querySelector('#delete_klient_id').value;
    console.log(id);
    try {
        const response = await fetch(url + '/delete_klient',
            {
                method: 'delete',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({klient_id:id})
            });
            if(response.status === 409) {
                alert("taki klient nie istnieje")
            } 
            else {
                alert("klient zostal usuniety!");
            }
            document.getElementById("delete_klient").reset();
    } catch (error) {
        console.log(error);
    }
}


async function get_klienci(){
    tabela = document.querySelector("#dane_klientow")
    try {
        const response = await fetch(url + '/get_klienci')
        const klienci = await response.json();
        let kod = "";
        console.log(klienci);
        kod+='<table class=" table table-striped"><thead><tr><th>id</th><th>imie</th><th>nazwisko</th><th>email</th><th>srodki</th></tr></thead><tbody>'
        klienci.forEach(obj => {
            kod+=`<tr>`;
            Object.entries(obj).forEach(([key, value]) => {
                kod+=`<td>${value}</td>`
            });
            kod+="</tr>"
        });
        kod+="</tbody></table>"
        tabela.innerHTML = kod;
    } catch (error) {
        console.log(error);
    }
}

async function raport_hulajnogi(event){
    event.preventDefault();
    tabela = document.querySelector("#raport_hulajnogi")
    try {
        const response = await fetch(url + '/get_raport_hulajnogi')
        const klienci = await response.json();
        let kod = "";
        console.log(klienci);
        kod+='<table class=" table table-striped"><thead><tr><th>id</th><th>ilość serwisów</th><th>łączny koszt</th></tr></thead><tbody>'
        klienci.forEach(obj => {
            kod+=`<tr>`;
            Object.entries(obj).forEach(([key, value]) => {
                kod+=`<td>${value}</td>`
            });
            kod+="</tr>"
        });
        kod+="</tbody></table>"
        tabela.innerHTML = kod;
    } catch (error) {
        console.log(error);
    }
}

async function worker_haslo(event){
    event.preventDefault();
    let stare_haslo = document.querySelector('#stare_haslo').value;
    let nowe_haslo = document.querySelector('#nowe_haslo').value;
    const response = await fetch(url + '/update_haslo_worker',
        {
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            method: 'post',
            body: JSON.stringify({worker_id: sessionStorage.getItem('userID'), stare_haslo:stare_haslo, nowe_haslo:nowe_haslo})
        });
        if(response.status === 409) {
            alert("Złe stare hasło!");
        } 
        else {
            alert("Zmiana hasła powiodła się");
        }
        document.getElementById("zmiana_hasla").reset();
}

async function log_out_handler(event) {
    event.preventDefault();
    sessionStorage.clear();
    window.location.href = "index.html";
}

