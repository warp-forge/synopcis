1. **Update `worker-ai.service.ts` to manage task state:**
   - Introduce `TaskState` to track status (`pending`, `processing`, `completed`, `failed`, `cancelled`), attempts, and errors.
   - Implement a wrapper method `processTaskWithRetry` that runs tasks, catches errors, retries up to 3 times, logs errors, and sets the task state.
   - Implement a mock notification system `notifyCriticalFailure` that logs a critical error when a task reaches its maximum retries.
   - Implement methods to cancel (`cancelTask`), restart (`restartTask`), and get analytics (`getAnalytics`) for tasks.
   - Update `analyzeSource` and `getAiSuggestions` to use this wrapper.

2. **Update `worker-ai.controller.ts` with new API endpoints:**
   - `POST /tasks/:id/restart`
   - `POST /tasks/:id/cancel`
   - `GET /tasks/analytics`
   - `GET /tasks`

3. **Add and update tests in `worker-ai.controller.spec.ts`:**
   - Verify task API endpoints (`cancel`, `restart`, `analytics`) behave as expected.
   - Ensure the controller successfully mocks the service.

4. **Add and update tests in `worker-ai.service.spec.ts` (if missing, create it):**
   - Test task retries.
   - Test that critical errors log notifications.
   - Test task cancellation and restarting logic.

5. **Complete pre-commit steps:**
   - Ensure proper testing, verification, review, and reflection are done.

6. **Submit:**
   - Push code and create PR.
