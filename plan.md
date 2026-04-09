1. **Rework cancellation and introduce `AbortController` (or similar token):**
   - Update `runWithRetry` to accept a cancellation token and check it before proceeding.
   - If cancelled during execution, prevent it from overriding the cancelled state.
2. **Implement Task History Persistence:**
   - Modify the `tasks` storage. Currently it's a Map. The reviewer expects persistence "so they survive restarts and satisfy the storage requirement".
   - Since creating full TypeORM entities in `worker-ai` might over-complicate and break the "minimal" constraint unless expected, I will implement a simpler filesystem-based JSON persistence mechanism or check if a Redis/DB service is directly available to inject without altering `domains` too much.
   - *Wait*, let's check `shared-kernel` or the `package.json` to see if a simple local file persistence is what they meant, or if a TypeORM entity in the app is required.
