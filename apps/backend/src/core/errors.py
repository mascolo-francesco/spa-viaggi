from fastapi import HTTPException, status


class AppError(Exception):
    def __init__(self, message: str, code: str = "APP_ERROR") -> None:
        self.message = message
        self.code = code
        super().__init__(message)


class NotFoundError(AppError):
    def __init__(self, message: str = "Risorsa non trovata") -> None:
        super().__init__(message=message, code="NOT_FOUND")


class ConflictError(AppError):
    def __init__(self, message: str = "Conflitto risorsa") -> None:
        super().__init__(message=message, code="CONFLICT")


class UnauthorizedError(AppError):
    def __init__(self, message: str = "Credenziali non valide") -> None:
        super().__init__(message=message, code="UNAUTHORIZED")


def app_error_to_http(exc: AppError) -> HTTPException:
    status_code = status.HTTP_400_BAD_REQUEST
    if exc.code == "NOT_FOUND":
        status_code = status.HTTP_404_NOT_FOUND
    elif exc.code == "CONFLICT":
        status_code = status.HTTP_409_CONFLICT
    elif exc.code == "UNAUTHORIZED":
        status_code = status.HTTP_401_UNAUTHORIZED

    return HTTPException(
        status_code=status_code,
        detail={"code": exc.code, "message": exc.message},
    )
