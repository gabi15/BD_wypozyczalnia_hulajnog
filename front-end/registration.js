//url = 'http://localhost:3002';
let url ='https://wypozyczalnia-hulajnog.herokuapp.com'


async function registration_handler (event) {
    event.preventDefault();
    const imie = document.querySelector('#klient_imie');
    const nazwisko = document.querySelector('#klient_nazwisko');
    const email = document.querySelector('#klient_email');
    const haslo = document.querySelector('#klient_haslo');
    if(imie.checkValidity() && nazwisko.checkValidity() && email.checkValidity() && haslo.checkValidity())
    {
        try{
            const response = await fetch(url+'/registration', {
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
                console.log("here")
                alert("Rejestracja przebiegła pomyślnie!");
                window.location.href = "index.html";
            }   
        }
        catch(error)
        {
            console.log(error);
        }
    }
}
