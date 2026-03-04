from src.core.security import hash_password, verify_password


def test_hash_and_verify_password():
    plain = "example123"
    hashed = hash_password(plain)

    assert hashed != plain
    assert verify_password(plain, hashed)
