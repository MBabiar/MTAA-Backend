import bcrypt from 'bcrypt';
import { User } from './models.js';

export function seed() {
    const users = [
        {
            name: 'Alice',
            email: 'alice@gmail.com',
            password: bcrypt.hashSync('alice123', 10),
            country: 'USA',
            games_played: 10,
            won: 5,
            lost: 5,
        },
        {
            name: 'Bob',
            email: 'bob@gmail.com',
            password: bcrypt.hashSync('bob123', 10),
            country: 'UK',
            games_played: 10,
            won: 3,
            lost: 7,
        },
        {
            name: 'Charlie',
            email: 'charlie@gmail.com',
            password: bcrypt.hashSync('charlie123', 10),
            country: 'Canada',
            games_played: 8,
            won: 4,
            lost: 4,
        },
        {
            name: 'Dave',
            email: 'dave@gmail.com',
            password: bcrypt.hashSync('dave123', 10),
            country: 'Australia',
            games_played: 12,
            won: 8,
            lost: 4,
        },
        {
            name: 'Eve',
            email: 'eve@gmail.com',
            password: bcrypt.hashSync('eve123', 10),
            country: 'Germany',
            games_played: 6,
            won: 2,
            lost: 4,
        },
        {
            name: 'Frank',
            email: 'frank@gmail.com',
            password: bcrypt.hashSync('frank123', 10),
            country: 'France',
            games_played: 9,
            won: 6,
            lost: 3,
        },
        {
            name: 'Grace',
            email: 'grace@gmail.com',
            password: bcrypt.hashSync('grace123', 10),
            country: 'Spain',
            games_played: 7,
            won: 3,
            lost: 4,
        },
        {
            name: 'Henry',
            email: 'henry@gmail.com',
            password: bcrypt.hashSync('henry123', 10),
            country: 'Italy',
            games_played: 11,
            won: 7,
            lost: 4,
        },
        {
            name: 'Ivy',
            email: 'ivy@gmail.com',
            password: bcrypt.hashSync('ivy123', 10),
            country: 'Netherlands',
            games_played: 5,
            won: 2,
            lost: 3,
        },
        {
            name: 'Jack',
            email: 'jack@gmail.com',
            password: bcrypt.hashSync('jack123', 10),
            country: 'New Zealand',
            games_played: 4,
            won: 2,
            lost: 2,
        },
        {
            name: 'Kate',
            email: 'kate@gmail.com',
            password: bcrypt.hashSync('kate123', 10),
            country: 'Australia',
            games_played: 9,
            won: 5,
            lost: 4,
        },
        {
            name: 'Liam',
            email: 'liam@gmail.com',
            password: bcrypt.hashSync('liam123', 10),
            country: 'USA',
            games_played: 7,
            won: 3,
            lost: 4,
        },
        {
            name: 'Mia',
            email: 'mia@gmail.com',
            password: bcrypt.hashSync('mia123', 10),
            country: 'Canada',
            games_played: 6,
            won: 2,
            lost: 4,
        },
        {
            name: 'Noah',
            email: 'noah@gmail.com',
            password: bcrypt.hashSync('noah123', 10),
            country: 'UK',
            games_played: 8,
            won: 4,
            lost: 4,
        },
        {
            name: 'Olivia',
            email: 'olivia@gmail.com',
            password: bcrypt.hashSync('olivia123', 10),
            country: 'Germany',
            games_played: 5,
            won: 3,
            lost: 2,
        },
    ];

    User.bulkCreate(users)
        .then(() => {
            console.log('Users seeded successfully');
        })
        .catch((error) => {
            console.error(error);
        });
}
