import { ensureRuntime } from '../src/runtime';
const runtime = await ensureRuntime({}, console.log);
console.log(JSON.stringify(runtime, null, 2));
