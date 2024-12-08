import { config } from 'dotenv';

config();

interface DataBaseInterface {
    url: string;
}

const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const dbName = process.env.DB_NAME;
const dbHost = process.env.DB_HOST;

if (!dbUser || !dbPassword || !dbName || !dbHost) {
    throw new Error('Uma ou mais variáveis de ambiente do banco de dados não estão definidas');
}

const databaseConfig: DataBaseInterface = {
    url: `mongodb+srv://${dbUser}:${dbPassword}@${dbHost}.srj7emp.mongodb.net/${dbName}?retryWrites=true&w=majority&appName=${dbHost}`,
};

export { databaseConfig };
