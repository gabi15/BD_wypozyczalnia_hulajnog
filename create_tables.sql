CREATE TABLE klienci
(
    klient_id             serial                  NOT NULL
        CONSTRAINT klienci_pk
            PRIMARY KEY,
    imie                  varchar(30)             NOT NULL,
    nazwisko              varchar(40)             NOT NULL,
    email                 varchar(40)             NOT NULL,
    dostepne_srodki       numeric(7, 2) DEFAULT 0 NOT NULL,
    dlugosc_geo           numeric,
    szerokosc_geo         numeric,
    haslo                 varchar(40)             NOT NULL,
    aktualne_wypozyczenie integer
);

CREATE UNIQUE INDEX klienci_email_uindex
    ON klienci (email);

CREATE TABLE transakcje
(
    transakcja_id     serial                  NOT NULL
        CONSTRAINT transakcje_pk
            PRIMARY KEY,
    kwota             numeric(7, 2) DEFAULT 0 NOT NULL,
    status_transakcji integer                 NOT NULL,
    klient_id         integer                 NOT NULL
        CONSTRAINT transakcje_klienci_klient_id_fk
            REFERENCES klienci
);

CREATE TABLE cennik
(
    usluga_id integer NOT NULL
        CONSTRAINT cennik_pk
            PRIMARY KEY,
    nazwa     varchar NOT NULL,
    cena      numeric(7, 2)
);

CREATE TABLE status_hulajnogi
(
    status_id     integer NOT NULL
        CONSTRAINT status_hulajnogi_pk
            PRIMARY KEY,
    nazwa_statusu varchar NOT NULL
);

CREATE TABLE hulajnogi
(
    hulajnoga_id   serial NOT NULL
        CONSTRAINT hulajnogi_pk
            PRIMARY KEY,
    id_statusu     integer
        CONSTRAINT hulajnogi_status_hulajnogi_status_id_fk
            REFERENCES status_hulajnogi,
    szerokosc_geo  numeric,
    dlugosc_geo    numeric,
    poziom_baterii integer
);

CREATE TABLE pracownicy
(
    pracownik_id serial      NOT NULL
        CONSTRAINT pracownicy_pk
            PRIMARY KEY,
    nazwisko     varchar(40) NOT NULL,
    imie         varchar(40) NOT NULL,
    email        varchar(40) NOT NULL,
    haslo        varchar     NOT NULL
);

CREATE TABLE serwis_hulajnogi
(
    serwis_id    serial       NOT NULL
        CONSTRAINT serwis_hulajnogi_pk
            PRIMARY KEY,
    koszt        numeric(2)   NOT NULL,
    data         date         NOT NULL,
    hulajnoga_id integer
        CONSTRAINT serwis_hulajnogi_hulajnogi_hulajnoga_id_fk
            REFERENCES hulajnogi,
    pracownik_id integer
        CONSTRAINT serwis_hulajnogi_pracownicy_pracownik_id_fk
            REFERENCES pracownicy,
    nazwa        varchar(100) NOT NULL
);

CREATE TABLE wypozyczenie
(
    wypozyczenie_id serial    NOT NULL
        CONSTRAINT wypozyczenie_pk
            PRIMARY KEY,
    klient_id       integer   NOT NULL
        CONSTRAINT wypozyczenie_klienci_klient_id_fk
            REFERENCES klienci,
    hulajnoga_id    integer   NOT NULL
        CONSTRAINT wypozyczenie_hulajnogi_hulajnoga_id_fk
            REFERENCES hulajnogi,
    poczatek_czasu  timestamp NOT NULL,
    koniec_czasu    timestamp
);

CREATE TABLE czas
(
    czas_id         serial    NOT NULL
        CONSTRAINT czas_pk
            PRIMARY KEY,
    wypozyczenie_id integer   NOT NULL
        CONSTRAINT czas_wypozyczenie_wypozyczenie_id_fk
            REFERENCES wypozyczenie,
    czas_start      timestamp NOT NULL,
    czas_stop       timestamp,
    usluga_id       integer   NOT NULL
        CONSTRAINT czas_cennik_usluga_id_fk
            REFERENCES cennik
);
