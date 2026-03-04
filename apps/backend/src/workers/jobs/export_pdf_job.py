from pathlib import Path

from bson import ObjectId

from src.infrastructure.pdf.trip_pdf import generate_trip_pdf
from src.infrastructure.repositories.activities_repository import ActivitiesRepository
from src.infrastructure.repositories.expenses_repository import ExpensesRepository
from src.infrastructure.repositories.exports_repository import ExportsRepository
from src.infrastructure.repositories.trips_repository import TripsRepository


async def process_export_job(db, job: dict, exports_base_path: Path) -> None:
    exports_repo = ExportsRepository(db)
    trips_repo = TripsRepository(db)
    activities_repo = ActivitiesRepository(db)
    expenses_repo = ExpensesRepository(db)

    job_id = job["_id"]
    trip_id: ObjectId = job["trip_id"]

    trip = await trips_repo.get_by_id(trip_id)
    if not trip:
        await exports_repo.mark_failed(job_id, "Viaggio non trovato")
        return

    activities = await activities_repo.list_by_trip(trip_id)
    expenses = await expenses_repo.list_by_trip(trip_id)

    filename = f"trip_{trip_id}_export_{job_id}.pdf"
    output_path = exports_base_path / filename

    try:
        generate_trip_pdf(output_path, trip=trip, activities=activities, expenses=expenses)
    except Exception as exc:  # noqa: BLE001
        await exports_repo.mark_failed(job_id, f"Errore generazione PDF: {exc}")
        return

    await exports_repo.mark_succeeded(job_id, str(output_path))
