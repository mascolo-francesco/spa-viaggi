from dataclasses import dataclass
from datetime import datetime


@dataclass(slots=True)
class User:
    id: str
    username: str
    display_name: str | None
    is_active: bool
    created_at: datetime
