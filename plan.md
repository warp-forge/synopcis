1. Refactor `worker-ai.service.ts` to not write state directly to the filesystem at `data/tasks.json` within the source directory.
2. If TypeORM/DB persistence is still deemed out of scope by the reviewer (they say "Move runtime state out of committed source files"), we can either use an environment variable for the path like `PROCESS_DATA_DIR` that defaults to `/tmp/worker-ai-state`, or we can simply use Postgres.
   Wait, the reviewer said "multi-instance/concurrent workers will race on the same local file." That strongly implies that local file persistence is entirely flawed for this system design. I should integrate a database persistence.
   Let's see if we have `SharedKernelService` or similar that exports a database connection or if `AiTaskRepository` exists. Let's look up how other domains do this.
3. If TypeORM is too much, I'll write a simple `app/apps/worker-ai/src/worker-ai-task.entity.ts` and use TypeORM `Repository<AiTaskEntity>`.
