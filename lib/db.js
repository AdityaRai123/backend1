import mysql from 'mysql2/promise'
let connection;
const connectToDatabase = async () => {
    if (!connection){
        connection = await mysql.createConnection({
            host: "localhost",
            user: "root",
            password: "1ADITYA*rai",
            database: "authentication"
        });
    }
    return connection;
}
export default connectToDatabase;