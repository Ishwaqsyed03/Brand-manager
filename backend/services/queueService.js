// Minimal queue abstraction; replace with BullMQ/Celery later
const eventBus = require('../utils/eventBus');

const JOB_TYPES = {
  SCHEDULE_PUBLISH: 'schedule_publish',
  AI_GENERATE_TEXT: 'ai_generate_text',
  AI_GENERATE_IMAGE: 'ai_generate_image'
};

class InMemoryQueue {
  constructor() {
    this.jobs = [];
  }

  async add(jobType, payload, opts = {}) {
    const job = {
      id: `${jobType}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type: jobType,
      payload,
      runAt: opts.delay ? Date.now() + opts.delay : Date.now()
    };
    this.jobs.push(job);
    setTimeout(() => {
      eventBus.emit('queue:job', job);
    }, Math.max(0, job.runAt - Date.now()));
    return job;
  }
}

const queue = new InMemoryQueue();

module.exports = { queue, JOB_TYPES };


