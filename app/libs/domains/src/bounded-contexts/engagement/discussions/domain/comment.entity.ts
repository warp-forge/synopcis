import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Discussion } from './discussion.entity';

@Entity('comments')
export class Comment {
  @PrimaryColumn('uuid')
  id!: string;

  @Column()
  discussionId!: string;

  @ManyToOne(() => Discussion, (discussion) => discussion.comments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'discussionId' })
  discussion!: Discussion;

  @Column()
  authorId!: string;

  @Column('text')
  body!: string;

  @Column({ nullable: true })
  parentId?: string;

  @ManyToOne(() => Comment, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'parentId' })
  parent?: Comment;

  @Column({ nullable: true })
  editedByModerator?: string;

  @Column({ default: false })
  isHidden!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
