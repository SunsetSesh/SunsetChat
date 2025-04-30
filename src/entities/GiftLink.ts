import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from "typeorm";

@Entity()
export class GiftLink {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    code: string;

    @Column()
    premiumType: string;

    @Column()
    durationDays: number;

    @Column()
    createdBy: string;

    @CreateDateColumn()
    createdAt: Date;

    @Column({ nullable: true })
    redeemedBy: string;

    @Column({ nullable: true })
    redeemedAt: Date;
}
