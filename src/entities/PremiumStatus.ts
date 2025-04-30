import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from "typeorm";

@Entity()
export class PremiumStatus {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    userId: string;

    @Column({ nullable: true })
    guildId: string;

    @Column()
    type: string;

    @Column({ nullable: true })
    expiresAt: Date;

    @CreateDateColumn()
    createdAt: Date;
}
