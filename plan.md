1. **Data Model Updates**
   - We will implement new entities in TypeORM to handle blocks, alternative versions, and votes. While the current `PhenomenonBlockEntity` handles basic metadata, we will create entities for `BlockVersionEntity` (or alternative) and `VoteEntity`.
   - Update the existing TypeORM structure in `libs/domains/src/phenomenon/` or `libs/domains/src/bounded-contexts/knowledge/blocks/` to represent alternatives and their votes. Given the current `PhenomenonBlockEntity`, we can create a `BlockAlternativeEntity` which maps to a block, and a `VoteEntity` which maps to a `BlockAlternativeEntity` and a `UserEntity`.
2. **Preserve Structure**
   - Ensure the new `BlockAlternativeEntity` includes the file content, language, metadata, while maintaining a clear relation to `PhenomenonBlockEntity` which retains the structural role (path, title, level).
3. **Voting Mechanism**
   - Implement an API endpoint / service layer logic to receive and record votes. The domain service `VotingDomainService` in `libs/domains/src/bounded-contexts/engagement/voting/domain/voting.service.ts` seems like a good place, but currently, it only has interfaces. Wait, `PhenomenonBlockEntity` is actually mapped via TypeORM. The actual implementation in TypeORM is in `libs/domains/src/phenomenon/phenomenon-block.entity.ts`. We should add `BlockAlternativeEntity` and `BlockAlternativeVoteEntity` next to it. Let's place it in `libs/domains/src/phenomenon/`.
4. **Active Alternative Logic**
   - We need a method (or an update to `phenomenon.domain.service.ts`) that correctly aggregates votes for each alternative of a block and flags the one with the highest weighted score as the active (or primary) alternative.
5. **Testing**
   - Write unit tests for the voting logic and active alternative selection.
