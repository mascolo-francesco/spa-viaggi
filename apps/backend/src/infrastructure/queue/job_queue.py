class JobQueue:
    """Placeholder queue abstraction.

    In questa versione il job viene persistito in MongoDB con stato `queued`.
    Il worker processa periodicamente i job in stato queued, quindi non serve
    un broker esterno obbligatorio.
    """

    async def enqueue_export_job(self, job_id: str) -> str:
        return job_id
