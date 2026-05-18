import mysql, { RowDataPacket } from "mysql2/promise";

const socketPath = process.env.DB_SOCKET;
const databaseName = process.env.DB_NAME ?? 'language_courses';

const pool = mysql.createPool({
    user: process.env.DB_USER ?? 'root',
    password: process.env.DB_PASSWORD ?? '',
    database: databaseName,
    ...(socketPath
        ? { socketPath }
        : {
            host: process.env.DB_HOST ?? 'localhost',
            port: Number(process.env.DB_PORT ?? 3306),
        }),
    waitForConnections: true,
    connectionLimit: 10,
});

async function columnExists(tableName: string, columnName: string): Promise<boolean> {
    const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) AS total
         FROM information_schema.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE()
           AND TABLE_NAME = ?
           AND COLUMN_NAME = ?`,
        [tableName, columnName]
    );

    return Number(rows[0]?.total ?? 0) > 0;
}

async function constraintExists(tableName: string, constraintName: string): Promise<boolean> {
    const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) AS total
         FROM information_schema.TABLE_CONSTRAINTS
         WHERE CONSTRAINT_SCHEMA = DATABASE()
           AND TABLE_NAME = ?
           AND CONSTRAINT_NAME = ?`,
        [tableName, constraintName]
    );

    return Number(rows[0]?.total ?? 0) > 0;
}

export async function ensureDatabaseSchema(): Promise<void> {
    if (!(await columnExists('fees', 'member_id'))) {
        await pool.query('ALTER TABLE fees ADD COLUMN member_id INT NULL AFTER course_id');
    }

    if (!(await constraintExists('fees', 'fk_fees_member'))) {
        try {
            await pool.query(
                `ALTER TABLE fees
                 ADD CONSTRAINT fk_fees_member
                     FOREIGN KEY (member_id) REFERENCES members(id)
                     ON DELETE SET NULL`
            );
        } catch (error) {
            console.warn('Could not add fk_fees_member automatically. The column exists, so the admin panel can still work.', error);
        }
    }
}

export default pool;
