import { Sequelize } from 'sequelize';
import { seed } from './seeder.js';

const params = {
    host: 'localhost',
    database: 'postgres',
    user: 'postgres',
    password: 'root',
    port: 5432,
};

const sequelize = new Sequelize(params.database, params.user, params.password, {
    host: params.host,
    port: params.port,
    dialect: 'postgres',
    logging: false,
});

export const User = sequelize.define('User', {
    user_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            is: /^[a-z\s]+$/i,
        },
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
        },
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    country: {
        type: Sequelize.STRING,
        allowNull: true,
        validate: {
            is: /^[a-z\s]+$/i,
        },
        defaultValue: 'Not specified',
    },
    games_played: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false,
    },
    won: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false,
    },
    lost: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false,
    },
    profile_picture: {
        type: Sequelize.STRING,
        allowNull: true,
    },
});

export async function syncAndSeedDatabase() {
    await sequelize.sync();

    const { count } = await User.findAndCountAll();
    if (count === 0) {
        seed();
    }
}
