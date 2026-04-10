import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class InitialSchema1678886400000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'articles',
        columns: [
          {
            name: 'id',
            type: 'serial',
            isPrimary: true,
          },
          {
            name: 'slug',
            type: 'varchar',
            isUnique: true,
          },
          {
            name: 'git_repo_name',
            type: 'varchar',
            isUnique: true,
          },
          {
            name: 'created_at',
            type: 'timestamptz',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamptz',
            default: 'now()',
          },
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'concepts',
        columns: [
          {
            name: 'id',
            type: 'serial',
            isPrimary: true,
          },
          {
            name: 'parent_id',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'key',
            type: 'varchar',
            isUnique: true,
          },
          {
            name: 'type',
            type: 'enum',
            enum: ['category', 'property', 'value'],
          },
          {
            name: 'vector',
            type: 'vector',
            isNullable: true,
          },
        ],
      }),
    );

    await queryRunner.createForeignKey(
      'concepts',
      new TableForeignKey({
        columnNames: ['parent_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'concepts',
        onDelete: 'SET NULL',
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'labels',
        columns: [
          {
            name: 'id',
            type: 'serial',
            isPrimary: true,
          },
          {
            name: 'concept_id',
            type: 'integer',
          },
          {
            name: 'lang_code',
            type: 'varchar',
          },
          {
            name: 'text',
            type: 'varchar',
          },
          {
            name: 'usage_count',
            type: 'integer',
            default: 0,
          },
        ],
        uniques: [{ columnNames: ['concept_id', 'lang_code'] }],
      }),
    );

    await queryRunner.createForeignKey(
      'labels',
      new TableForeignKey({
        columnNames: ['concept_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'concepts',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'article_concepts',
        columns: [
          {
            name: 'id',
            type: 'serial',
            isPrimary: true,
          },
          {
            name: 'article_id',
            type: 'integer',
          },
          {
            name: 'concept_id',
            type: 'integer',
          },
          {
            name: 'property_concept_id',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'source_url',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'author_id',
            type: 'integer',
          },
          {
            name: 'created_at',
            type: 'timestamptz',
            default: 'now()',
          },
        ],
      }),
    );

    await queryRunner.createForeignKey(
      'article_concepts',
      new TableForeignKey({
        columnNames: ['article_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'articles',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'article_concepts',
      new TableForeignKey({
        columnNames: ['concept_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'concepts',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'article_concepts',
      new TableForeignKey({
        columnNames: ['property_concept_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'concepts',
        onDelete: 'SET NULL',
      }),
    );

    await queryRunner.createTable(
        new Table({
            name: 'users',
            columns: [
                {
                    name: 'id',
                    type: 'serial',
                    isPrimary: true,
                },
                {
                    name: 'username',
                    type: 'varchar',
                    isUnique: true,
                },
                {
                    name: 'email',
                    type: 'varchar',
                    isUnique: true,
                },
                {
                    name: 'created_at',
                    type: 'timestamptz',
                    default: 'now()',
                },
                {
                    name: 'updated_at',
                    type: 'timestamptz',
                    default: 'now()',
                },
            ],
        }),
    );

    await queryRunner.createForeignKey(
        'article_concepts',
        new TableForeignKey({
            columnNames: ['author_id'],
            referencedColumnNames: ['id'],
            referencedTableName: 'users',
            onDelete: 'CASCADE',
        }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('article_concepts');
    await queryRunner.dropTable('labels');
    await queryRunner.dropTable('concepts');
    await queryRunner.dropTable('articles');
    await queryRunner.dropTable('users');
  }
}
