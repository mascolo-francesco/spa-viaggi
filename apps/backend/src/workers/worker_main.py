import asyncio
import logging

from src.core.config import get_settings
from src.core.logging import setup_logging
from src.infrastructure.db.client import close_client, get_database, ping_database
from src.infrastructure.repositories.exports_repository import ExportsRepository
from src.workers.jobs.export_pdf_job import process_export_job

logger = logging.getLogger(__name__)


async def run_worker() -> None:
    settings = get_settings()
    setup_logging()

    db = get_database(settings)
    await ping_database(settings)
    exports_repo = ExportsRepository(db)

    logger.info("Worker avviato")

    try:
        while True:
            job = await exports_repo.claim_next_queued()
            if not job:
                await asyncio.sleep(settings.worker_poll_seconds)
                continue

            logger.info("Processing export job", extra={"job_id": str(job["_id"])})
            await process_export_job(db, job, settings.exports_path)
    finally:
        close_client()


if __name__ == "__main__":
    asyncio.run(run_worker())
