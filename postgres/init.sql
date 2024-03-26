CREATE TABLE IF NOT EXISTS
    users (
        user_id SERIAL NOT NULL PRIMARY KEY,
        "name" VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        "password" VARCHAR(255) NOT NULL,
        country VARCHAR(255),
        games_played INTEGER,
        won INTEGER,
        lost INTEGER
    );