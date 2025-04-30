import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAdminTables1634567890123 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE premium_status (
                id SERIAL PRIMARY KEY,
                user_id VARCHAR(255) REFERENCES users(id),
                guild_id VARCHAR(255) REFERENCES guilds(id),
                type VARCHAR(50) NOT NULL,
                expires_at TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE gift_links (
                id SERIAL PRIMARY KEY,
                code VARCHAR(255) UNIQUE NOT NULL,
                premium_type VARCHAR(50) NOT NULL,
                duration_days INTEGER NOT NULL,
                created_by VARCHAR(255) REFERENCES users(id),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                redeemed_by VARCHAR(255) REFERENCES users(id),
                redeemed_at TIMESTAMP
            );
            CREATE TABLE global_announcements (
                id SERIAL PRIMARY KEY,
                content TEXT NOT NULL,
                created_by VARCHAR(255) REFERENCES users(id),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                expires_at TIMESTAMP
            );
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE global_announcements;
            DROP TABLE gift_links;
            DROP TABLE premium_status;
        `);
    }
}
