from src.core.errors import UnauthorizedError
from src.core.security import create_access_token, verify_password
from src.infrastructure.repositories.users_repository import UsersRepository


class AuthService:
    def __init__(self, users_repo: UsersRepository, settings) -> None:
        self.users_repo = users_repo
        self.settings = settings

    async def login(self, username: str, password: str) -> dict:
        user = await self.users_repo.find_by_username(username)
        if not user or not user.get("is_active", False):
            raise UnauthorizedError("Credenziali non valide")

        if not verify_password(password, user["password_hash"]):
            raise UnauthorizedError("Credenziali non valide")

        token = create_access_token(str(user["_id"]), self.settings)
        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id": str(user["_id"]),
                "username": user["username"],
                "display_name": user.get("display_name"),
            },
        }
