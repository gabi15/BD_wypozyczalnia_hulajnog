//url = 'http://localhost:3002';
let url ='https://wypozyczalnia-hulajnog.herokuapp.com'

async function handlePostoj() {
    try {
        console.log(sessionStorage.getItem('userID'))
        var currentdate = new Date(); 
        var datetime = currentdate.getFullYear() + "-"+ (currentdate.getMonth()+1) +"-" +currentdate.getDate() + " "
                + currentdate.getHours() + ":"  
                + currentdate.getMinutes() + ":" 
                + currentdate.getSeconds();
        const response = await fetch(url +'/new_postoj',
            {
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                method: 'post',
                body: JSON.stringify({klient_id:sessionStorage.getItem('userID'), poczatek_czasu:datetime})
            });

        document.getElementById("zakoncz_btn").disabled = true;
        document.getElementById("wznow_btn").disabled = false;

    } catch (error) {
        console.log(error);
    }
}

async function handleWznowienieJazdy() {
    try {
        console.log(sessionStorage.getItem('userID'))
        var currentdate = new Date(); 
        var datetime = currentdate.getFullYear() + "-"+ (currentdate.getMonth()+1) +"-" +currentdate.getDate() + " "
                + currentdate.getHours() + ":"  
                + currentdate.getMinutes() + ":" 
                + currentdate.getSeconds();
        const response = await fetch(url +'/new_wznowienie_jazdy',
            {
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                method: 'post',
                body: JSON.stringify({klient_id:sessionStorage.getItem('userID'), poczatek_czasu:datetime})
            });
        document.getElementById("zakoncz_btn").disabled = false;
        document.getElementById("wznow_btn").disabled = true;

    } catch (error) {
        console.log(error);
    }
}

async function handleZakonczJazde() {
    try {
        klient_id = sessionStorage.getItem('userID');
        var currentdate = new Date(); 
        var datetime = currentdate.getFullYear() + "-"+ (currentdate.getMonth()+1) +"-" +currentdate.getDate() + " "
                + currentdate.getHours() + ":"  
                + currentdate.getMinutes() + ":" 
                + currentdate.getSeconds();
        const response = await fetch(url +'/zakoncz_jazde',
            {
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                method: 'post',
                body: JSON.stringify({klient_id:klient_id, koniec_czasu:datetime})
            });
        const response2 = await fetch(url + '/koszt_jazdy/'+klient_id)
        const koszt = await response2.json();
        console.log(koszt);
        let koszt_div = document.querySelector("body");
        dane = '<h1>Jazda zakończona!<h1> <h3><b>Koszt jazdy:</b> ' + koszt[0]["sumujkoszty_rozladujhulajnoge"] +'</h3>'
        dane += '<a href="client.html">Wróć do swojego konta</a>' ;
        koszt_div.innerHTML = dane;

    } catch (error) {
        console.log(error);
    }
}