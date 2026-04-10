import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { PhenomenonAlternativeEntity } from './phenomenon-alternative.entity';

@Entity({ name: 'phenomenon_votes' })
export class PhenomenonVoteEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => PhenomenonAlternativeEntity, (alternative) => alternative.votes)
  alternative: PhenomenonAlternativeEntity;

  @Column()
  userId: string;

  @Column({ type: 'int', default: 1 })
  weight: number;
}
