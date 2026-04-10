import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Concept } from './concept.entity';

@Entity('labels')
@Unique(['concept_id', 'lang_code'])
export class Label {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'integer' })
  concept_id!: number;

  @ManyToOne(() => Concept, (concept) => concept.labels, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'concept_id' })
  concept!: Concept;

  @Column({ type: 'varchar' })
  lang_code!: string;

  @Column({ type: 'varchar' })
  text!: string;

  @Column({ type: 'integer', default: 0 })
  usage_count!: number;
}
