import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from "typeorm";

@Entity()
export class GlobalAnnouncement {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    content: string;

    @Column()
    createdBy: string;

    @CreateDateColumn()
    createdAt: Date;

    @Column({ nullable: true })
    expiresAt: Date;
}
