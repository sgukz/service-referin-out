require("dotenv").config();

const config = {
    env: process.env.NODE_ENV ? process.env.NODE_ENV : 'development',
    port: process.env.REH_XRAY_SERVER_PORT ? Number(process.env.REH_XRAY_SERVER_PORT) : 8080,
    db_primary: {
        host: process.env.REH_XRAY_DB_HOST,
        user: process.env.REH_XRAY_DB_USER,
        password: process.env.REH_XRAY_DB_PASS,
        database: process.env.REH_XRAY_DB_NAME,
        idleTimeout: 60000,
        waitForConnections: true,
        connectionLimit: 10,
    },
    db_hos: {
        host: process.env.REH_XRAY_DB_HOST_HOS,
        user: process.env.REH_XRAY_DB_USER_HOS,
        password: process.env.REH_XRAY_DB_PASS_HOS,
        database: process.env.REH_XRAY_DB_NAME_HOS,
        idleTimeout: 60000,
        waitForConnections: true,
        connectionLimit: 10,
    },
    secretKey: process.env.REH_XRAY_SECRET_KEY,
}

exports.config = config;