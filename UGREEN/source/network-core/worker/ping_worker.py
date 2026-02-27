"""
Ping Worker — monitoruje dostepnosc urzadzen przez ICMP ping.

Uruchamia sie jako petla: co INTERVAL sekund pinguje wszystkie urzadzenia
i aktualizuje pole `status` w tabeli devices.

Zmienne srodowiskowe:
  DATABASE_URL  - postgresql+asyncpg://user:pass@host/db
  INTERVAL      - czas miedzy rundami w sekundach (domyslnie 60)
"""
import asyncio
import logging
import os
import sys

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy import text

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger("ping_worker")

DATABASE_URL = os.environ.get("DATABASE_URL", "")
INTERVAL = int(os.environ.get("INTERVAL", "60"))


def classify_result(alive: bool) -> str:
    return "alive" if alive else "unreachable"


async def ping_host(ip: str) -> bool:
    """Pinguje hosta — zwraca True jesli odpowiada."""
    try:
        proc = await asyncio.create_subprocess_exec(
            "ping", "-c", "1", "-W", "2", ip,
            stdout=asyncio.subprocess.DEVNULL,
            stderr=asyncio.subprocess.DEVNULL,
        )
        rc = await proc.wait()
        return rc == 0
    except Exception:
        return False


async def run_round(session: AsyncSession) -> None:
    """Jedna runda: pobierz urzadzenia, pinguj, zapisz status."""
    result = await session.execute(text("SELECT id, ip_address FROM devices"))
    devices = result.fetchall()
    if not devices:
        log.info("No devices found.")
        return

    tasks = [(row[0], row[1]) for row in devices]
    results = await asyncio.gather(*[ping_host(ip) for _, ip in tasks])

    for (device_id, ip), alive in zip(tasks, results):
        status = classify_result(alive)
        await session.execute(
            text("UPDATE devices SET status = :status WHERE id = :id"),
            {"status": status, "id": device_id},
        )
        log.info("%-16s  %s", ip, status)

    await session.commit()


async def main() -> None:
    if not DATABASE_URL:
        log.error("DATABASE_URL is not set. Exiting.")
        sys.exit(1)

    engine = create_async_engine(DATABASE_URL, echo=False)
    session_factory = async_sessionmaker(engine, expire_on_commit=False)

    log.info("Ping worker started. Interval: %ds", INTERVAL)
    while True:
        async with session_factory() as session:
            try:
                await run_round(session)
            except Exception as exc:
                log.error("Round failed: %s", exc)
        await asyncio.sleep(INTERVAL)


if __name__ == "__main__":
    asyncio.run(main())
