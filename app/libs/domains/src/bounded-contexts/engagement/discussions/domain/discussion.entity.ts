import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Comment } from './comment.entity';

@Entity('discussions')
export class Discussion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  blockId: string;

  @Column({ default: 0 })
  totalParticipants: number;

  @Column({ nullable: true })
  lastActivityAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Comment, (comment) => comment.discussion)
  comments: Comment[];
}
