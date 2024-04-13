import { Sequelize } from 'sequelize';
import { params } from './config.js';
import { seed } from './seeder.js';

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
    username: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            is: /^[a-zA-Z\s]+$/,
        },
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        validate: {
            is: /^([a-zA-Z0-9]+)@([a-zA-Z0]+)\.([a-zA-Z]+)$/,
        },
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            is: /^[a-zA-Z0-9]{6,}$/,
        },
    },
    country: {
        type: Sequelize.STRING,
        allowNull: true,
        validate: {
            is: /^[a-zA-Z\s]+$/,
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
