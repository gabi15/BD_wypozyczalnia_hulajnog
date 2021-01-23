INSERT INTO cennik (usluga_id, nazwa, cena) VALUES (1, 'jazda', 1.50);
INSERT INTO cennik (usluga_id, nazwa, cena) VALUES (2, 'postoj', 0.80);

INSERT INTO status_hulajnogi (status_id, nazwa_statusu) VALUES (1, 'wolna');
INSERT INTO status_hulajnogi (status_id, nazwa_statusu) VALUES (2, 'zajeta');
INSERT INTO status_hulajnogi (status_id, nazwa_statusu) VALUES (3, 'zarezerwowana');
INSERT INTO status_hulajnogi (status_id, nazwa_statusu) VALUES (4, 'naladuj');
INSERT INTO status_hulajnogi (status_id, nazwa_statusu) VALUES (5, 'nieaktywna');

INSERT INTO hulajnogi (hulajnoga_id, id_statusu, szerokosc_geo, dlugosc_geo, poziom_baterii) VALUES (DEFAULT, 1, 10, 10, 90);
INSERT INTO hulajnogi (hulajnoga_id, id_statusu, szerokosc_geo, dlugosc_geo, poziom_baterii) VALUES (DEFAULT, 1, 10, 50, 100);