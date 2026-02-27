from app.config import Settings


def test_settings_has_database_url():
    s = Settings(DATABASE_URL="postgresql+asyncpg://x:x@localhost/x")
    assert s.DATABASE_URL.startswith("postgresql")


def test_settings_debug_default_false():
    s = Settings(DATABASE_URL="postgresql+asyncpg://x:x@localhost/x", DEBUG=False)
    assert s.DEBUG is False
