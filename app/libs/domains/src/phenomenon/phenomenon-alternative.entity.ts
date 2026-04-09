import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { PhenomenonBlockEntity } from './phenomenon-block.entity';
import { PhenomenonVoteEntity } from './phenomenon-vote.entity';

@Entity({ name: 'phenomenon_alternatives' })
export class PhenomenonAlternativeEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => PhenomenonBlockEntity, (block) => block.alternatives)
  block: PhenomenonBlockEntity;

  @Column()
  title: string;

  @Column()
  level: number;

  @Column({ type: 'text' })
  content: string;

  @Column()
  authorId: string;

  @Column({ default: false })
  isActive: boolean;

  @OneToMany(() => PhenomenonVoteEntity, (vote) => vote.alternative)
  votes: PhenomenonVoteEntity[];
}
