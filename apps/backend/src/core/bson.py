from bson import ObjectId
from fastapi import HTTPException, status


def to_object_id(value: str, field_name: str = "id") -> ObjectId:
    if not ObjectId.is_valid(value):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={"code": "INVALID_OBJECT_ID", "message": f"{field_name} non valido"},
        )
    return ObjectId(value)


def id_to_str(value: ObjectId | str | None) -> str | None:
    if value is None:
        return None
    return str(value)
