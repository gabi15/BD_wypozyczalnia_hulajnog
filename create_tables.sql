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

CREATE VIEW raport_hulajnogi(hulajnoga_id, count, sum) AS
SELECT serwis_hulajnogi.hulajnoga_id,
       COUNT(*)                    AS count,
       SUM(serwis_hulajnogi.koszt) AS sum
FROM serwis_hulajnogi
GROUP BY serwis_hulajnogi.hulajnoga_id
ORDER BY serwis_hulajnogi.hulajnoga_id;

CREATE VIEW wszystkie_hulajnogi (hulajnoga_id, nazwa_statusu, szerokosc_geo, dlugosc_geo, poziom_baterii) AS
SELECT h.hulajnoga_id,
       sh.nazwa_statusu,
       h.szerokosc_geo,
       h.dlugosc_geo,
       h.poziom_baterii
FROM hulajnogi h
         JOIN status_hulajnogi sh ON h.id_statusu = sh.status_id
ORDER BY h.hulajnoga_id;

CREATE FUNCTION nowa_transakcja() RETURNS trigger
    LANGUAGE plpgsql
AS
$$
DECLARE
    kwota  numeric;
    id     integer;
    srodki numeric;
    status int;
BEGIN
    kwota := new.kwota;
    id := new.klient_id;
    status := new.status_transakcji;
    SELECT dostepne_srodki INTO srodki FROM klienci WHERE klient_id = id;
    srodki = srodki + kwota * status;
    UPDATE klienci SET dostepne_srodki = srodki WHERE klient_id = id;
    RETURN new;
END;
$$;

CREATE TRIGGER update_srodkow
    AFTER INSERT
    ON transakcje
    FOR EACH ROW
EXECUTE PROCEDURE nowa_transakcja();

CREATE FUNCTION nowe_wypozyczenie() RETURNS trigger
    LANGUAGE plpgsql
AS
$$
DECLARE
    id_h integer;
    id_k integer;
BEGIN
    id_h := new.hulajnoga_id;
    id_k := new.klient_id;
    UPDATE hulajnogi SET id_statusu = 2 WHERE hulajnoga_id = id_h;
    UPDATE klienci SET aktualne_wypozyczenie = new.wypozyczenie_id WHERE klient_id = id_k;
    INSERT INTO czas (wypozyczenie_id, czas_start, usluga_id) VALUES (new.wypozyczenie_id, new.poczatek_czasu, 1);
    RETURN new;
END;
$$;

CREATE TRIGGER hulajnoga_zajeta
    AFTER INSERT
    ON wypozyczenie
    FOR EACH ROW
EXECUTE PROCEDURE nowe_wypozyczenie();

CREATE FUNCTION nowy_postoj() RETURNS trigger
    LANGUAGE plpgsql
AS
$$
DECLARE
    id_wypozyczenia integer;
    id_czasu        integer;
BEGIN
    id_wypozyczenia := new.wypozyczenie_id;
    id_czasu := new.czas_id;
    UPDATE czas SET czas_stop = new.czas_start WHERE wypozyczenie_id = id_wypozyczenia AND czas_id = id_czasu - 1;
    RETURN new;
END;
$$;

CREATE TRIGGER hulajnoga_postoj
    AFTER INSERT
    ON czas
    FOR EACH ROW
EXECUTE PROCEDURE nowy_postoj();

CREATE FUNCTION zakoncz_jazde() RETURNS trigger
    LANGUAGE plpgsql
AS
$$
DECLARE
    id_wypozyczenia integer;
    id_hulajnogi    integer;
BEGIN
    id_wypozyczenia := new.wypozyczenie_id;
    id_hulajnogi = new.hulajnoga_id;
    UPDATE czas SET czas_stop = new.koniec_czasu WHERE wypozyczenie_id = id_wypozyczenia AND czas_stop IS NULL;
    UPDATE hulajnogi SET id_statusu = 1 WHERE hulajnoga_id = id_hulajnogi;
    RETURN new;
END;
$$;

CREATE TRIGGER hulajnoga_koniec_jazdy
    AFTER UPDATE
    ON wypozyczenie
    FOR EACH ROW
EXECUTE PROCEDURE zakoncz_jazde();

CREATE FUNCTION sumujkoszty_rozładujhulajnoge(integer) RETURNS numeric
    LANGUAGE plpgsql
AS
$$
DECLARE
    suma         numeric;
    single_time  integer;
    price        numeric;
    czas_row     RECORD;
    id           integer;
    czas_jazdy   integer;
    bateria      integer;
    bateria_loss integer;
    h_id         integer;
BEGIN
    suma := 0;
    czas_jazdy := 0;
    SELECT aktualne_wypozyczenie INTO id FROM klienci WHERE klient_id = $1;
    FOR czas_row IN SELECT czas_start, czas_stop, usluga_id FROM czas WHERE wypozyczenie_id = id
        LOOP
            single_time = ((DATE_PART('day', czas_row.czas_stop::timestamp - czas_row.czas_start::timestamp) * 24 +
                            DATE_PART('hour', czas_row.czas_stop::timestamp - czas_row.czas_start::timestamp)) * 60 +
                           DATE_PART('minute', czas_row.czas_stop::timestamp - czas_row.czas_start::timestamp)) * 60 +
                          DATE_PART('second', czas_row.czas_stop::timestamp - czas_row.czas_start::timestamp);
            SELECT cena INTO price FROM cennik WHERE usluga_id = czas_row.usluga_id;
            suma = suma + single_time * price;
            IF czas_row.usluga_id = 1 THEN
                czas_jazdy = czas_jazdy + single_time;
            END IF;
        END LOOP;
    suma = CAST(suma / 60 AS numeric(7, 2));
    INSERT INTO transakcje(kwota, status_transakcji, klient_id) VALUES (suma, -1, $1);
    UPDATE klienci SET aktualne_wypozyczenie = NULL WHERE klient_id = $1;
    SELECT h.hulajnoga_id
    INTO h_id
    FROM hulajnogi h
             JOIN wypozyczenie w ON h.hulajnoga_id = w.hulajnoga_id
    WHERE w.wypozyczenie_id = id;
    SELECT poziom_baterii INTO bateria FROM hulajnogi WHERE hulajnoga_id = h_id;
    bateria_loss = czas_jazdy * 0.1;
    IF bateria - bateria_loss > 5 THEN
        UPDATE hulajnogi SET poziom_baterii=bateria - bateria_loss WHERE hulajnoga_id = h_id;
    ELSE
        UPDATE hulajnogi SET poziom_baterii=0, id_statusu=4 WHERE hulajnoga_id = h_id;
    END IF;
    RETURN suma;
END;
$$;

CREATE FUNCTION naladuj() RETURNS trigger
    LANGUAGE plpgsql
AS
$$
DECLARE
    h_id integer;
BEGIN
    IF new.nazwa = 'ladowanie' THEN
        h_id := new.hulajnoga_id;
        UPDATE hulajnogi SET id_statusu=1, poziom_baterii=100 WHERE hulajnoga_id = h_id;
    END IF;
    RETURN new;
END;
$$;

CREATE TRIGGER serwis_hulajnogi
    AFTER INSERT
    ON serwis_hulajnogi
    FOR EACH ROW
EXECUTE PROCEDURE naladuj();

CREATE FUNCTION near(integer)
    RETURNS TABLE
            (
                thulajnoga_id  integer,
                tszerokosc_geo numeric,
                tdlugosc_geo   numeric,
                odleglosc      numeric
            )
    LANGUAGE plpgsql
AS
$$
DECLARE
    szerokosc     numeric;
    dlugosc       integer;
    hulajnoga_row RECORD;
BEGIN
    SELECT klienci.szerokosc_geo INTO szerokosc FROM klienci WHERE klient_id = $1;
    SELECT klienci.dlugosc_geo INTO dlugosc FROM klienci WHERE klient_id = $1;
    FOR hulajnoga_row IN SELECT hulajnoga_id, szerokosc_geo, dlugosc_geo FROM hulajnogi WHERE id_statusu = 1
        LOOP
            thulajnoga_id := hulajnoga_row.hulajnoga_id;
            tszerokosc_geo := hulajnoga_row.szerokosc_geo;
            tdlugosc_geo := hulajnoga_row.dlugosc_geo;
            odleglosc := CAST(
                    SQRT(pow((tszerokosc_geo - szerokosc), 2) + pow((tdlugosc_geo - szerokosc), 2)) AS numeric(7, 2));
            RETURN NEXT;
        END LOOP;
END;
$$;

CREATE FUNCTION rezerwacja(integer, integer) RETURNS void
    LANGUAGE plpgsql
AS
$$
BEGIN
    UPDATE klienci SET aktualne_wypozyczenie=$2 WHERE klient_id = $1;
    UPDATE hulajnogi SET id_statusu = 3 WHERE hulajnoga_id = $2;
END;
$$;

CREATE FUNCTION odrezerwacja(integer, integer) RETURNS void
    LANGUAGE plpgsql
AS
$$
BEGIN
    UPDATE klienci SET aktualne_wypozyczenie=NULL WHERE klient_id = $1;
    UPDATE hulajnogi SET id_statusu = 1 WHERE hulajnoga_id = $2;
END;
$$;

