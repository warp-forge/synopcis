import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('ai_tasks')
export class AiTaskRecordEntity {
  @PrimaryColumn()
  id!: string;

  @Column({ type: 'varchar' })
  type!: string;

  @Column({ type: 'varchar' })
  status!: string;

  @Column({ type: 'jsonb', nullable: true })
  result?: any;

  @Column({ type: 'text', nullable: true })
  error?: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at!: Date;
}
