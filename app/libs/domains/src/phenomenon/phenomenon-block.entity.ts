import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { PhenomenonEntity } from './phenomenon.entity';
import { PhenomenonAlternativeEntity } from './phenomenon-alternative.entity';

@Entity({ name: 'phenomenon_blocks' })
export class PhenomenonBlockEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => PhenomenonEntity, (phenomenon) => phenomenon.blocks)
  phenomenon: PhenomenonEntity;

  @OneToMany(
    () => PhenomenonAlternativeEntity,
    (alternative) => alternative.block,
  )
  alternatives: PhenomenonAlternativeEntity[];

  @Column()
  path: string;

  @Column()
  title: string;

  @Column()
  level: number;
}
