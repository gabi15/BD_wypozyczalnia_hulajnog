const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const {pool} = require('./config')
const { response } = require('express')

const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(cors())


const addClient = (request, response) => {
    const {imie, nazwisko, email, haslo} = request.body;
    console.log(imie, nazwisko, email, haslo);
  pool.query(
    'INSERT INTO klienci (imie, nazwisko,email,haslo) SELECT $1, $2, CAST($3 AS VARCHAR), $4 WHERE NOT EXISTS(SELECT 1 FROM klienci WHERE email = $3);',
    [imie, nazwisko, email, haslo],
    (error, res) => {
      if (error) {
        console.log(error);
      }
      else if(res.rowCount===1){
        response.status(201).json({status: 'success', message: 'Klient added.'});

      }
      else{
        response.status(409).json({status: 'failure', message: 'Klient already exists.'});
      }
    })
};

const loginCustomer = (request, response)=>{
    const {email, haslo} = request.body;

    pool.query('SELECT email, haslo, klient_id FROM klienci WHERE email = $1 AND haslo=$2',[email, haslo], (error, results) =>
    {
        if (error) {
            throw error;
        }
        response.status(200).json(results.rows);
    });
};

const getInfoCustomer = (request, response) => {
    const k_id = request.body.k_id;
    console.log(k_id)
    pool.query('SELECT imie, nazwisko, email, dostepne_srodki FROM klienci WHERE klient_id=$1', [k_id], (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).json(results.rows);
    });
};


const paymentCustomer = (request, response) => {
  const {kwota, klient_id} = request.body;
  pool.query('INSERT INTO transakcje (kwota, status_transakcji, klient_id) VALUES ($1, 1, $2)', [kwota, klient_id], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(201).json({status: 'success', message: 'Payment added.'})
  });
};

const updateClientLocation = (request, response) => {
  const {dlugosc_geo, szerokosc_geo, klient_id} = request.body;

  pool.query(
    'UPDATE klienci SET dlugosc_geo = $1, szerokosc_geo = $2 WHERE klient_id = $3;',
    [dlugosc_geo, szerokosc_geo, klient_id],
    (error) => {
      if (error) {
        console.log(error);
      }
      response.status(201).json({status: 'success', message: 'Location updated'})
    },
  )
};

const loginWorker = (request, response)=>{
  const {email, haslo} = request.body;

  pool.query('SELECT email, haslo, pracownik_id FROM pracownicy WHERE email = $1 AND haslo=$2',[email, haslo], (error, results) =>
  {
      if (error) {
          throw error;
      }
      response.status(200).json(results.rows);
  });
};

const getInfoWorker = (request, response) => {
  const k_id = request.body.k_id;
  console.log(k_id)
  pool.query('SELECT imie, nazwisko FROM pracownicy WHERE pracownik_id=$1', [k_id], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

const getNearHulajnogi = (request, response) => {
  const k_id = parseInt(request.params.klient_id);
  console.log(k_id);
  pool.query('select * from near($1) order by odleglosc;',[k_id], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

const getHulajnogiLadowanie = (request, response) => {
  pool.query(`select * from wszystkie_hulajnogi where nazwa_statusu='naladuj';`, (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

const getWszystkieHulajnogi = (request, response) => {
  pool.query('select * from wszystkie_hulajnogi;', (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};


const newWypozyczenie = (request, response) => {
  const {klient_id, hulajnoga_id, poczatek_czasu} = request.body;
  console.log(klient_id, hulajnoga_id, poczatek_czasu);
  pool.query('INSERT INTO wypozyczenie (klient_id, hulajnoga_id, poczatek_czasu) SELECT $1, $2, $3 WHERE EXISTS(SELECT 1 FROM klienci WHERE klient_id=$1 AND dostepne_srodki>5)', [klient_id, hulajnoga_id, poczatek_czasu], (error, results) => {
    console.log(results);
    if (error) {
      throw error;
    }
    else if(results.rowCount===1){
      response.status(201).json({status: 'success', message: 'Wypożyczenie added.'});

    }
    else{
      response.status(409).json({status: 'failure', message: 'Doladuj konto!.'});
    }
  });
};

const newRezerwacja = (request, response) => {
  const {klient_id, hulajnoga_id} = request.body;
  pool.query('SELECT * FROM rezerwacja($1,$2)', [klient_id, hulajnoga_id], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(201).json({status: 'success', message: 'Rezerwacja added.'})
  });
};

const newOdRezerwacja = (request, response) => {
  const {klient_id, hulajnoga_id} = request.body;
  pool.query('SELECT * FROM odrezerwacja($1,$2)', [klient_id, hulajnoga_id], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(201).json({status: 'success', message: 'Rezerwacja added.'})
  });
};

const newPostoj = (request, response) => {
  const {klient_id, poczatek_czasu} = request.body;
  pool.query(`INSERT INTO czas (wypozyczenie_id, czas_start,usluga_id)VALUES ((SELECT aktualne_wypozyczenie FROM klienci where klient_id=$1), $2, 2);`, [klient_id, poczatek_czasu], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(201).json({status: 'success', message: 'postoj'})
  });
};

const newWznowienieJazdy = (request, response) => {
  const {klient_id, poczatek_czasu} = request.body;
  pool.query(`INSERT INTO czas (wypozyczenie_id, czas_start,usluga_id)VALUES (
    (SELECT aktualne_wypozyczenie FROM klienci where klient_id=$1), $2, 1);`, [klient_id, poczatek_czasu], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(201).json({status: 'success', message: 'postoj'})
  });
};

const zakonczJazde = (request, response) => {
  const {klient_id, koniec_czasu} = request.body;
  pool.query('UPDATE wypozyczenie SET koniec_czasu=$2 WHERE wypozyczenie_id=(SELECT aktualne_wypozyczenie from klienci where klient_id=$1)', [klient_id, koniec_czasu], (error, results) => {
    if (error) {
      throw error;
    }
    console.log(results);
    response.status(201).json({status: 'success', message: 'Jazda zakonczona.'})
  });
};


const kosztJazdy= (request, response) => {
  id_klienta = parseInt(request.params.klient_id);
  pool.query('SELECT * FROM sumujKoszty_rozladujHulajnoge($1)',[id_klienta], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

const getTransakcje = (request, response)=>{
  klient_id = parseInt(request.params.klient_id);

  pool.query('SELECT kwota, status_transakcji FROM transakcje WHERE klient_id = $1 ORDER BY transakcja_id DESC LIMIT 15', [klient_id], (error, results) =>
  {
      if (error) {
          throw error;
      }
      response.status(200).json(results.rows);
  });
};

const handleLadowanie = (request, response) => {
  const {pracownik_id, hulajnoga_id, data} = request.body;

pool.query(
  `INSERT INTO serwis_hulajnogi(koszt, data, hulajnoga_id, pracownik_id, nazwa) VALUES(0, $3,$2,$1,'ladowanie');`,
  [pracownik_id, hulajnoga_id, data],
  (error) => {
    if (error) {
      console.log(error);
    }
    response.status(201).json({status: 'success', message: 'Serwis inserted'})
  },
)
};

const addWorker = (request, response) => {
  const {imie, nazwisko, email, haslo} = request.body;
  pool.query(
    'INSERT INTO pracownicy (imie, nazwisko,email,haslo) SELECT $1, $2, CAST($3 AS VARCHAR), $4 WHERE NOT EXISTS(SELECT 1 FROM pracownicy WHERE email = $3);',
    [imie, nazwisko, email, haslo],
    (error, res) => {
      if (error) {
        console.log(error);
      }
      else if(res.rowCount===1){
        response.status(201).json({status: 'success', message: 'Worker added.'});

      }
      else{
        response.status(409).json({status: 'failure', message: 'Worker already exists.'});
      }
    })
};

const addHulajnoga = (request, response) => {
  const {dlugosc_geo, szerokosc_geo} = request.body;
  pool.query('INSERT INTO hulajnogi (id_statusu, szerokosc_geo, dlugosc_geo, poziom_baterii) VALUES (1, $1, $2,100)', [szerokosc_geo, dlugosc_geo], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(201).json({status: 'success', message: 'Hulajnoga added.'})
  });
};

const addSerwis = (request, response) => {
  const {nazwa, koszt, data, id_hulajnogi, id_pracownika} = request.body;
  pool.query(
    'INSERT INTO serwis_hulajnogi (koszt, data, hulajnoga_id, pracownik_id, nazwa) SELECT $1, $2, $3, $4, $5 WHERE EXISTS(SELECT 1 FROM hulajnogi WHERE hulajnoga_id = $3);',
    [koszt, data, id_hulajnogi, id_pracownika, nazwa],
    (error, res) => {
      if (error) {
        console.log(error);
      }
      else if(res.rowCount===1){
        response.status(201).json({status: 'success', message: 'Serwis added.'});

      }
      else{
        response.status(409).json({status: 'failure', message: 'Ta hulajnoga nie istnieje.'});
      }
    })
};

const deleteHulajnoga = (request, response) =>{
  const {hulajnoga_id} = request.body;
  pool.query('UPDATE hulajnogi SET id_statusu=5 WHERE hulajnoga_id=$1',[hulajnoga_id],(error, results)=>{
    if(error){
      console.log(error);
    }
    else if(results.rowCount===1){
      response.status(201).json({status: 'success', message: 'Hulajnoga usunieta.'});

    }
    else{
      response.status(409).json({status: 'failure', message: 'Hulajnoga nie istnieje.'});
    }

  })
}

const deleteKlient = (request, response) =>{
  const {klient_id} = request.body;
  //const klient_id = parseInt(request.params.klient_id);
  console.log(klient_id);
  pool.query('DELETE FROM klienci WHERE klient_id=$1;',[klient_id],(error, results)=>{
    if(error){
      console.log(error);
    }
    else if(results.rowCount===1){
      response.status(201).json({status: 'success', message: 'Klient usuniety.'});

    }
    else{
      response.status(409).json({status: 'failure', message: 'Klient nie istnieje.'});
    }

  })
}

const getKlienci = (request, response)=>{
  pool.query('SELECT klient_id, imie, nazwisko, email, dostepne_srodki from klienci ORDER BY nazwisko', (error, results) =>
  {
      if (error) {
          throw error;
      }
      response.status(200).json(results.rows);
  });
};

const raportHulajnogi = (request, response)=>{
  pool.query('SELECT * from raport_hulajnogi', (error, results) =>
  {
      if (error) {
          throw error;
      }
      response.status(200).json(results.rows);
  });
};

const updateHaslo = (request,response)=>{
  const {klient_id, stare_haslo, nowe_haslo} = request.body;
  pool.query('UPDATE klienci SET haslo = $1 WHERE klient_id=$2 AND haslo=$3', [nowe_haslo,klient_id, stare_haslo], (error, results)=>{
    if(error){
      throw error;
    }
    else if(results.rowCount===1){
      response.status(201).json({status: 'success', message: 'Haslo updated.'});

    }
    else{
      response.status(409).json({status: 'failure', message: 'Zle stare haslo.'});
    }
  })
}

const updateHasloWorker = (request,response)=>{
  const {worker_id, stare_haslo, nowe_haslo} = request.body;
  pool.query('UPDATE pracownicy SET haslo = $1 WHERE pracownik_id=$2 AND haslo=$3', [nowe_haslo,worker_id, stare_haslo], (error, results)=>{
    if(error){
      throw error;
    }
    else if(results.rowCount===1){
      response.status(201).json({status: 'success', message: 'Haslo updated.'});

    }
    else{
      response.status(409).json({status: 'failure', message: 'Zle stare haslo.'});
    }
  })
}


app.route('/registration').post(addClient)

app.route('/customer_log').post(loginCustomer)
app.route('/info_customer').post(getInfoCustomer)
app.route('/customer_payment').post(paymentCustomer)
app.route('/customer_location').post(updateClientLocation)

app.route('/get_hulajnogi/:klient_id').get(getNearHulajnogi)
app.route('/new_wypozyczenie').post(newWypozyczenie)
app.route('/new_rezerwacja').post(newRezerwacja)
app.route('/new_odrezerwacja').post(newOdRezerwacja)
app.route('/new_postoj').post(newPostoj)
app.route('/new_wznowienie_jazdy').post(newWznowienieJazdy)
app.route('/zakoncz_jazde').post(zakonczJazde)
app.route('/koszt_jazdy/:klient_id').get(kosztJazdy)
app.route('/get_transakcje/:klient_id').get(getTransakcje)
app.route('/update_haslo').post(updateHaslo)


app.route('/worker_log').post(loginWorker)
app.route('/info_worker').post(getInfoWorker)
app.route('/get_wszystkie_hulajnogi').get(getWszystkieHulajnogi)
app.route('/get_hulajnogi_do_ladowania').get(getHulajnogiLadowanie)
app.route('/ladowanie_hulajnogi').post(handleLadowanie)
app.route('/worker_registration').post(addWorker);
app.route('/add_hulajnoga').post(addHulajnoga)
app.route('/add_serwis').post(addSerwis);
app.route('/delete_hulajnoga').post(deleteHulajnoga)
app.route('/delete_klient').post(deleteKlient)
app.route('/get_klienci').get(getKlienci)
app.route('/update_haslo_worker').post(updateHasloWorker)
app.route('/get_raport_hulajnogi').get(raportHulajnogi)

// Start server
app.listen(process.env.PORT || 3002, () => {
  console.log(`Server listening`)
})