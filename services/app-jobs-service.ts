import { BaseJob } from '../utils/interval-job'

export class AppJobsService {
    activeJobs: BaseJob[] = []

    constructor(activeJobs: BaseJob[]) {
        this.activeJobs = activeJobs
    }

    setNewJob = (newJob: BaseJob) => {
        this.activeJobs.push(newJob)
    }
}
