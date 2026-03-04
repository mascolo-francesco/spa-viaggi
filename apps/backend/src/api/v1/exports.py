from fastapi import APIRouter, Depends
from fastapi.responses import FileResponse

from src.api.dependencies import get_exports_service
from src.api.schemas.exports import ExportJobResponse
from src.application.use_cases.exports_service import ExportsService
from src.core.security import get_current_user_id

router = APIRouter()


@router.post("/trips/{trip_id}/exports/pdf", response_model=ExportJobResponse)
async def create_pdf_export(
    trip_id: str,
    service: ExportsService = Depends(get_exports_service),
    user_id: str = Depends(get_current_user_id),
) -> dict:
    return await service.create_pdf_export(trip_id, user_id)


@router.get("/exports/{job_id}", response_model=ExportJobResponse)
async def get_export_job(
    job_id: str,
    service: ExportsService = Depends(get_exports_service),
    _user_id: str = Depends(get_current_user_id),
) -> dict:
    return await service.get_job(job_id)


@router.get("/exports/{job_id}/download")
async def download_export(
    job_id: str,
    service: ExportsService = Depends(get_exports_service),
    _user_id: str = Depends(get_current_user_id),
) -> FileResponse:
    file_path = await service.get_download_path(job_id)
    return FileResponse(file_path, filename=file_path.name, media_type="application/pdf")
